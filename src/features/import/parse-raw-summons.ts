import type { DraftSummon, Character, Banner } from "@/shared";
import { catalogStore } from "@/stores/catalog-store";
import type { RawSummon } from "./raw-summon";

/**
 * Maps raw API records onto the archive domain: numeric gainId → character
 * (resolved to the English name), CN pool name → banner English name (pools
 * carry no in-game id; the CN name is the join key).
 */
export function parseRawSummons(rawSummons: RawSummon[]): DraftSummon[] {
  const charById = new Map<number, Character>();
  for (const c of catalogStore.characters) {
    charById.set(c.id, c);
  }

  const bannerByCnName = new Map<string, Banner>();
  for (const b of catalogStore.banners) {
    if (b.nameCN) bannerByCnName.set(b.nameCN, b);
  }

  const resolveBannerName = (poolName: string): string =>
    bannerByCnName.get(poolName)?.name ?? poolName;

  const result: DraftSummon[] = [];

  // Sort raw records chronologically ascending first to ensure correct expansion
  const sortedRaw = [...rawSummons].sort((a, b) => a.createTime.localeCompare(b.createTime));

  for (const raw of sortedRaw) {
    const isMulti = raw.summonType === "10";
    raw.gainIds.forEach((gainId, idx) => {
      // Add fractional offset to createTime for unique sorting of multi-summons
      const fractionalOffset = idx.toString().padStart(3, "0");
      const createTimeWithFraction = `${raw.createTime}.${fractionalOffset}`;

      const char = charById.get(gainId);
      const name = char ? char.name : `Unknown (${gainId})`;
      const rarity = char ? char.rarity : 3; // default rarity fallback

      const id = `${raw.createTime}-${gainId}-${idx}`;
      const poolName = resolveBannerName(raw.poolName);

      result.push({
        id,
        poolName,
        poolInstanceId: catalogStore.findInstance(poolName, raw.createTime)?.instanceId,
        poolType: raw.poolType,
        summonType: isMulti ? "10" : "1",
        gainId,
        name,
        rarity,
        type: "character",
        createTime: createTimeWithFraction,
        importSessionId: "", // populated by the store on commit
      });
    });
  }

  return result;
}
