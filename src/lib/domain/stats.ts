import type { PullRecord, BannerStats, Banner } from "@/lib/shared";

export interface TrackerStats {
  totalSummons: number;
  clearDrops: number;
  total6Star: number;
  total5Star: number;
  total4Star: number;
  avg5StarPity: number;
  avg4StarPity: number;
  winRate: number;
  rarityDist: { rarity: number; count: number }[];
}

const avg = (values: number[]) =>
  values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;

/** Most recent 6★ pulls, newest first. */
export function recentSixStar(pulls: PullRecord[], limit: number): PullRecord[] {
  return [...pulls]
    .filter((p) => p.rarity === 6)
    .sort((a, b) => b.createTime.localeCompare(a.createTime))
    .slice(0, limit);
}

/**
 * Compact tracker-style stats (like the HSR/Star Rail tracker layout).
 * AVG pity is tracked per rarity tier: the 5★ counter resets on any 5★+ pull,
 * the 4★ counter resets on any 4★+ pull. Win rate = % of 6★ pulls that were
 * on-banner (rateOn), among 6★ pulls that had a rate-up check.
 */
export function computeTrackerStats(pulls: PullRecord[]): TrackerStats {
  const totalSummons = pulls.length;

  const sorted = [...pulls].sort((a, b) => a.createTime.localeCompare(b.createTime));

  const fivePities: number[] = [];
  const fourPities: number[] = [];
  let fiveCounter = 0;
  let fourCounter = 0;
  for (const pull of sorted) {
    fiveCounter++;
    fourCounter++;
    if (pull.rarity >= 5) {
      fivePities.push(fiveCounter);
      fiveCounter = 0;
    }
    if (pull.rarity >= 4) {
      fourPities.push(fourCounter);
      fourCounter = 0;
    }
  }

  const checked6Star = pulls.filter((p) => p.rarity === 6 && p.rateOn !== null);
  const won6Star = checked6Star.filter((p) => p.rateOn === true).length;
  const winRate = checked6Star.length > 0 ? Math.round((won6Star / checked6Star.length) * 100) : 0;

  const rarityDist = [6, 5, 4, 3, 2]
    .map((rarity) => ({
      rarity,
      count: pulls.filter((p) => p.rarity === rarity).length,
    }))
    .filter((r) => r.count > 0);

  return {
    totalSummons,
    clearDrops: totalSummons * 160,
    total6Star: pulls.filter((p) => p.rarity === 6).length,
    total5Star: pulls.filter((p) => p.rarity === 5).length,
    total4Star: pulls.filter((p) => p.rarity === 4).length,
    avg5StarPity: avg(fivePities),
    avg4StarPity: avg(fourPities),
    winRate,
    rarityDist,
  };
}

export function computeBannerStats(banner: Banner, pulls: PullRecord[]): BannerStats {
  const pulls6Star = pulls.filter((p) => p.rarity === 6);
  const pityList = pulls6Star.map((p) => p.pity);

  const avgPity6Star = avg(pityList);
  const highestPity6Star = pityList.length > 0 ? Math.max(...pityList) : 0;
  const lowestPity6Star = pityList.length > 0 ? Math.min(...pityList) : 0;

  return {
    name: banner.name,
    type: banner.type,
    totalPulls: pulls.length,
    total4Star: pulls.filter((p) => p.rarity === 4).length,
    avgPity6Star,
    highestPity6Star,
    lowestPity6Star,
    obtained6Star: pulls6Star.map((p) => ({
      gainId: p.gainId,
      name: p.name,
      pity: p.pity,
      createTime: p.createTime,
    })),
    obtained5Star: pulls
      .filter((p) => p.rarity === 5)
      .map((p) => ({
        gainId: p.gainId,
        name: p.name,
        pity: p.pity,
        createTime: p.createTime,
      })),
  };
}
