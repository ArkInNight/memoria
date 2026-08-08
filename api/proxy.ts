import { lookup } from "node:dns/promises";

const MAX_BODY = 1024 * 10;

const BLOCKED_IP_PREFIXES = [
  "10.",
  "127.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
  "192.168.",
  "169.254.",
  "0.",
];

function isBlockedIp(ip: string): boolean {
  return BLOCKED_IP_PREFIXES.includes(ip) || ip === "::1" || ip === "::" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe8");
}

export async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const target = body?.url;
  if (typeof target !== "string" || !/^https?:\/\//i.test(target)) {
    return Response.json({ error: "url must be an http(s) URL" }, { status: 400 });
  }

  let hostname: string;
  try {
    hostname = new URL(target).hostname;
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return Response.json({ error: "Private hosts are not allowed" }, { status: 403 });
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    for (const { address } of addresses) {
      if (isBlockedIp(address)) {
        return Response.json({ error: "Private IP targets are not allowed" }, { status: 403 });
      }
    }
  } catch {
    return Response.json({ error: "Could not resolve host" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "memoria-proxy/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

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

export default handler;
