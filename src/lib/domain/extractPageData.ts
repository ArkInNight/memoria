import type { RawPull } from "./summonParser";

/** Support both the full game API response and just the pageData array. */
export function extractPageData(parsed: unknown): RawPull[] | null {
  if (Array.isArray(parsed)) return parsed as RawPull[];
  if (parsed && typeof parsed === "object") {
    const data = (parsed as { data?: { pageData?: unknown } }).data;
    if (data && Array.isArray(data.pageData)) return data.pageData as RawPull[];
  }
  return null;
}
