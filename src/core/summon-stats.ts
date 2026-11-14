import type { SummonRecord, BannerStats, Banner, Rarity } from "@/shared";

export interface TrackerStats {
  totalSummons: number;
  clearDrops: number;
  total6Star: number;
  total5Star: number;
  total4Star: number;
  avg5StarPity: number;
  avg4StarPity: number;
  winRate: number;
  rarityDist: { rarity: Rarity; count: number }[];
}

const avg = (values: number[]) =>
  values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;

/** Most recent 6★ summons, newest first. */
export function recentSixStar(summons: SummonRecord[], limit: number): SummonRecord[] {
  return [...summons]
    .filter((p) => p.rarity === 6)
    .sort((a, b) => b.createTime.localeCompare(a.createTime))
    .slice(0, limit);
}

/**
 * Compact tracker-style stats (like the HSR/Star Rail tracker layout).
 * AVG pity is tracked per rarity tier: the 5★ counter resets on any 5★+ summon,
 * the 4★ counter resets on any 4★+ summon. Win rate = % of 6★ summons that were
 * on-banner (rateOn), among 6★ summons that had a rate-up check.
 */
export function computeTrackerStats(summons: SummonRecord[]): TrackerStats {
  const totalSummons = summons.length;

  const sorted = [...summons].sort((a, b) => a.createTime.localeCompare(b.createTime));

  const fivePities: number[] = [];
  const fourPities: number[] = [];
  let fiveCounter = 0;
  let fourCounter = 0;
  for (const summon of sorted) {
    fiveCounter++;
    fourCounter++;
    if (summon.rarity >= 5) {
      fivePities.push(fiveCounter);
      fiveCounter = 0;
    }
    if (summon.rarity >= 4) {
      fourPities.push(fourCounter);
      fourCounter = 0;
    }
  }

  const checked6Star = summons.filter((p) => p.rarity === 6 && p.rateOn !== null);
  const won6Star = checked6Star.filter((p) => p.rateOn === true).length;
  const winRate = checked6Star.length > 0 ? Math.round((won6Star / checked6Star.length) * 100) : 0;

  const rarityDist = ([6, 5, 4, 3, 2] satisfies Rarity[])
    .map((rarity) => ({
      rarity,
      count: summons.filter((p) => p.rarity === rarity).length,
    }))
    .filter((r) => r.count > 0);

  return {
    totalSummons,
    clearDrops: totalSummons * 160,
    total6Star: summons.filter((p) => p.rarity === 6).length,
    total5Star: summons.filter((p) => p.rarity === 5).length,
    total4Star: summons.filter((p) => p.rarity === 4).length,
    avg5StarPity: avg(fivePities),
    avg4StarPity: avg(fourPities),
    winRate,
    rarityDist,
  };
}

export function computeBannerStats(banner: Banner, summons: SummonRecord[]): BannerStats {
  const summons6Star = summons.filter((p) => p.rarity === 6);
  const pityList = summons6Star.map((p) => p.pity);

  const avgPity6Star = avg(pityList);
  const highestPity6Star = pityList.length > 0 ? Math.max(...pityList) : 0;
  const lowestPity6Star = pityList.length > 0 ? Math.min(...pityList) : 0;

  return {
    name: banner.name,
    type: banner.type,
    totalSummons: summons.length,
    total4Star: summons.filter((p) => p.rarity === 4).length,
    avgPity6Star,
    highestPity6Star,
    lowestPity6Star,
    obtained6Star: summons6Star.map((p) => ({
      gainId: p.gainId,
      name: p.name,
      pity: p.pity,
      createTime: p.createTime,
    })),
    obtained5Star: summons
      .filter((p) => p.rarity === 5)
      .map((p) => ({
        gainId: p.gainId,
        name: p.name,
        pity: p.pity,
        createTime: p.createTime,
      })),
  };
}

export interface PityHeroStatus {
  currentPity: number;
  maxPity: number;
  softPity: number;
  distanceToSoft: number;
  guaranteed: boolean | null;
  pool: string;
}

/**
 * Pity and guarantee status for a pool. Reads write-time pity and guarantee
 * values from the most recent summon record in the pool.
 */
export function computePityHeroStatus(
  summons: SummonRecord[],
  pool: string,
  rateUpRule?: string
): PityHeroStatus {
  const maxPity = pool === "invitation" ? 40 : pool === "covenant" || pool === "beginner" ? 30 : 70;
  const softPity = maxPity <= 40 ? maxPity : 60;

  if (summons.length === 0) {
    const isNoRateUp = rateUpRule === "none" || pool === "standard" || pool === "beginner";
    return {
      currentPity: 0,
      maxPity,
      softPity,
      distanceToSoft: softPity,
      guaranteed: isNoRateUp
        ? null
        : rateUpRule === "100" || rateUpRule === "100-first"
          ? true
          : false,
      pool,
    };
  }

  const sorted = [...summons].sort((a, b) => a.createTime.localeCompare(b.createTime));
  const last = sorted[sorted.length - 1]!;

  const currentPity = last.rarity === 6 ? 0 : last.pity;
  const distanceToSoft = Math.max(0, softPity - currentPity);

  let guaranteed: boolean | null;
  if (rateUpRule === "none" || pool === "standard" || pool === "beginner") {
    guaranteed = null;
  } else if (rateUpRule === "100") {
    guaranteed = true;
  } else if (rateUpRule === "100-first") {
    const has6Star = sorted.some((s) => s.rarity === 6);
    guaranteed = !has6Star;
  } else {
    // 50/50 rule
    if (last.rarity === 6) {
      guaranteed = last.rateOn === false;
    } else {
      guaranteed = last.guaranteed ?? false;
    }
  }

  return {
    currentPity,
    maxPity,
    softPity,
    distanceToSoft,
    guaranteed,
    pool,
  };
}
