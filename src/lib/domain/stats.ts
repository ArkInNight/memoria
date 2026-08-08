import type { PullRecord, ImportSession, DashboardStats, BannerStats, Banner } from "@/lib/shared";
import { BANNERS, BANNER_RULES } from "./assets";
import { pityGroupFor } from "./pityEngine";

export function computeDashboardStats(
  pulls: PullRecord[],
  sessions: ImportSession[]
): DashboardStats {
  const totalSummons = pulls.length;
  const total6Star = pulls.filter((p) => p.rarity === 6).length;
  const total5Star = pulls.filter((p) => p.rarity === 5).length;
  const total4Star = pulls.filter((p) => p.rarity === 4).length;

  const sortedSessions = [...sessions].sort((a, b) =>
    b.createTime.localeCompare(a.createTime)
  );
  const lastImportTime = sortedSessions[0]?.createTime ?? null;

  // Current pity/guarantee is tracked on the character-banner pity group only.
  const bannerMap = new Map(BANNERS.map((b) => [b.name, b]));
  const charGroupPulls = pulls
    .filter((p) => {
      const banner = bannerMap.get(p.poolName);
      return banner ? pityGroupFor(banner, BANNER_RULES) === "character" : false;
    })
    .sort((a, b) => a.createTime.localeCompare(b.createTime));

  let currentPity = 0;
  let currentGuarantee = false;

  for (const pull of charGroupPulls) {
    currentPity++;
    if (pull.rarity === 6) {
      currentPity = 0;

      const banner = bannerMap.get(pull.poolName);
      if (banner && banner.rateUp6Star && banner.rateUp6Star.length > 0) {
        const isRateUp = banner.rateUp6Star.includes(pull.name);
        if (isRateUp) {
          currentGuarantee = false;
        } else {
          currentGuarantee = !currentGuarantee;
        }
      }
    }
  }

  return {
    totalSummons,
    currentPity,
    currentGuarantee,
    total6Star,
    total5Star,
    total4Star,
    lastImportTime,
  };
}

export function computeBannerStats(banner: Banner, pulls: PullRecord[]): BannerStats {
  const pulls6Star = pulls.filter((p) => p.rarity === 6);
  const pityList = pulls6Star.map((p) => p.pity);

  const avgPity6Star =
    pityList.length > 0
      ? Math.round((pityList.reduce((a, b) => a + b, 0) / pityList.length) * 10) / 10
      : 0;
  const highestPity6Star = pityList.length > 0 ? Math.max(...pityList) : 0;
  const lowestPity6Star = pityList.length > 0 ? Math.min(...pityList) : 0;

  return {
    name: banner.name,
    type: banner.type,
    totalPulls: pulls.length,
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
