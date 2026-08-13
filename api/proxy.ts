import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BODY = 1024 * 10;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_ALLOWED_HOSTS = [
  "reverse1999-game-api.com",
  "game-re-en-service.sl916.com",
];

const ALLOWED_HOSTS = new Set(
  (process.env.PROXY_ALLOWED_HOSTS?.split(",") ?? DEFAULT_ALLOWED_HOSTS)
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
);

function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(normalized)) return true;
    if (normalized.startsWith("ff") || normalized.startsWith("2001:db8")) return true;

    const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return mappedIpv4 ? isBlockedIp(mappedIpv4) : false;
  }

  return true;
}

async function validateTarget(value: string, base?: URL): Promise<URL> {
  const target = new URL(value, base);

  if (target.protocol !== "https:") throw new Error("Only HTTPS URLs are allowed");
  if (target.username || target.password) throw new Error("URL credentials are not allowed");
  if (target.port && target.port !== "443") throw new Error("Custom ports are not allowed");
  if (!ALLOWED_HOSTS.has(target.hostname.toLowerCase())) {
    throw new Error("This URL host is not allowed");
  }

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await lookup(target.hostname, { all: true });
  } catch {
    throw new Error("Could not resolve URL host");
  }
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedIp(address))) {
    throw new Error("Private or reserved IP targets are not allowed");
  }

  return target;
}

async function fetchUpstream(initialTarget: URL, signal: AbortSignal): Promise<Response> {
  let target = initialTarget;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "memoria-proxy/1.0",
        Accept: "application/json",
      },
      redirect: "manual",
      signal,
    });

    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) throw new Error("Upstream returned an invalid redirect");
    if (redirects === MAX_REDIRECTS) throw new Error("Too many upstream redirects");
    target = await validateTarget(location, target);
  }

  throw new Error("Too many upstream redirects");
}

export async function POST(req: Request): Promise<Response> {
  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const target = body?.url;
  if (typeof target !== "string") {
    return Response.json({ error: "url must be an HTTPS URL" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = await validateTarget(target);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL";
    return Response.json({ error: message }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetchUpstream(targetUrl, controller.signal);

    if (!upstream.ok) {
      return Response.json(
        { error: `Upstream returned HTTP ${upstream.status}` },
        { status: 502 }
      );
    }

    const raw = await upstream.arrayBuffer();
    if (raw.byteLength > MAX_BODY) {
      return Response.json(
        { error: "Response too large; use the Raw JSON tab instead" },
        { status: 413 }
      );
    }

    const text = new TextDecoder().decode(raw);
    try {
      const payload = JSON.parse(text) as { code?: number; msg?: string };
      if (payload.code === -6) {
        return Response.json(
          {
            error:
              "This summon link has expired or no longer has permission. Generate a new link from the game.",
          },
          { status: 403 }
        );
      }
    } catch {
      // Let the importer report the invalid upstream response.
    }

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return Response.json(
        { error: "Upstream timed out; use the Raw JSON tab instead" },
        { status: 504 }
      );
    }
    return Response.json(
      { error: "Failed to reach upstream; use the Raw JSON tab instead" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}
