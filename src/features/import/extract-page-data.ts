import type { RawSummon } from "./raw-summon";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isRawSummon(value: unknown): value is RawSummon {
  if (!isRecord(value)) return false;
  const raw = value;
  return (
    Array.isArray(raw.gainIds) &&
    raw.gainIds.every((id) => Number.isInteger(id)) &&
    typeof raw.createTime === "string" &&
    typeof raw.poolName === "string" &&
    typeof raw.poolType === "number" &&
    typeof raw.summonType === "string"
  );
}

/** Support both the full game API response and just the pageData array. */
export function extractPageData(parsed: unknown): RawSummon[] | null {
  const data = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : undefined;
  const pageData = Array.isArray(parsed) ? parsed : data?.pageData;
  if (!Array.isArray(pageData)) return null;
  return pageData.every(isRawSummon) ? pageData : null;
}
