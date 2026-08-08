import type { PullRecord, Character, Banner } from "@memoria/shared";
import { CHARACTERS, BANNERS } from "./assets";

export interface RawPull {
  summonType: string;
  createTime: string;
  poolName: string;
  poolType: number;
  gainIds: number[];
}

/** Normalize a CN pool name so rerun suffixes don't break matching (e.g. '湖的涟漪 16' -> '湖的涟漪'). */
function normCnName(name: string): string {
  return name.replace(/\s*\d+$/, "").trim();
}

export function parseRawPulls(
  rawPulls: RawPull[]
): Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[] {
  // Mapping layer: numeric gainId -> character, resolved to the English name.
  const charById = new Map<number, Character>();
  for (const c of CHARACTERS) {
    charById.set(c.id, c);
  }

  // Mapping layer: CN pool name (nameCN) -> banner, resolved to the English
  // name. Pools carry no in-game id; the CN name is the join key.
  const bannerByCnName = new Map<string, Banner>();
  const bannerByName = new Map<string, Banner>();
  for (const b of BANNERS) {
    if (b.nameCN) bannerByCnName.set(normCnName(b.nameCN), b);
    bannerByName.set(b.name, b);
  }

  const resolveBannerName = (poolName: string): string =>
    bannerByCnName.get(normCnName(poolName))?.name ??
    bannerByName.get(poolName)?.name ??
    poolName;

  const result: Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[] = [];

  // Sort raw records chronologically ascending first to ensure correct expansion
  const sortedRaw = [...rawPulls].sort((a, b) => a.createTime.localeCompare(b.createTime));

  for (const raw of sortedRaw) {
    const isMulti = raw.summonType === "10";
    raw.gainIds.forEach((gainId, idx) => {
      // Add fractional offset to createTime for unique sorting of multi-pulls
      const fractionalOffset = idx.toString().padStart(3, "0");
      const createTimeWithFraction = `${raw.createTime}.${fractionalOffset}`;

      const char = charById.get(gainId);
      const name = char ? char.name : `Unknown (${gainId})`;
      const rarity = char ? char.rarity : 3; // default rarity fallback
      const type = "character" as const; // currently only characters

      const id = `${raw.createTime}-${gainId}-${idx}`;

      result.push({
        id,
        poolName: resolveBannerName(raw.poolName),
        poolType: raw.poolType,
        summonType: isMulti ? "10" : "1",
        gainId,
        name,
        rarity,
        type,
        createTime: createTimeWithFraction,
        importSessionId: "", // populated by caller
      });
    });
  }

  return result;
}
