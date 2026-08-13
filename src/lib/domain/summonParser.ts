import type { PullRecord, Character, Banner } from "@/lib/shared";
import { CHARACTERS, BANNERS, findRun } from "./assets";

export interface RawPull {
  summonType: string;
  createTime: string;
  poolName: string;
  poolType: number;
  gainIds: number[];
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
    if (b.nameCN) bannerByCnName.set(b.nameCN, b);
    bannerByName.set(b.name, b);
  }

  const resolveBannerName = (poolName: string): string =>
    bannerByCnName.get(poolName)?.name ?? poolName;

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
      const poolName = resolveBannerName(raw.poolName);

      result.push({
        id,
        poolName,
        poolRunId: findRun(poolName, raw.createTime)?.runId,
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
