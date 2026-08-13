import type { RawPull } from "./summonParser";

function isRawPull(value: unknown): value is RawPull {
  if (!value || typeof value !== "object") return false;
  const raw = value as Record<string, unknown>;
  return (
    Array.isArray(raw.gainIds) &&
    typeof raw.createTime === "string" &&
    typeof raw.poolName === "string"
  );
}

/** Support both the full game API response and just the pageData array. */
export function extractPageData(parsed: unknown): RawPull[] | null {
  const pageData = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object"
      ? (parsed as { data?: { pageData?: unknown } }).data?.pageData
      : undefined;
  if (!Array.isArray(pageData)) return null;
  return pageData.every(isRawPull) ? (pageData as RawPull[]) : null;
}
