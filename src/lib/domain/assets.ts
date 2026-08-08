import type { Character, Banner, BannerRuleMap } from "@memoria/shared";
import { slugify } from "@memoria/shared";
import bannersJson from "../../../assets/banners.json";
import charactersJson from "../../../assets/characters.json";
import bannerRulesJson from "../../../assets/banner-rules.json";

export const CHARACTERS: Character[] = charactersJson as Character[];
export const BANNERS: Banner[] = bannersJson as Banner[];
export const BANNER_RULES: BannerRuleMap = bannerRulesJson as BannerRuleMap;

export function getBannerByPoolName(poolName: string): Banner | undefined {
  return BANNERS.find((b) => b.name === poolName);
}

/** Group per-pool banner records by English name (the primary identifier). */
export function getAggregatedBanners(): Banner[] {
  const byName = new Map<string, Banner[]>();
  for (const b of BANNERS) {
    if (!byName.has(b.name)) byName.set(b.name, []);
    byName.get(b.name)!.push(b);
  }

  const out: Banner[] = [];
  for (const [name, runs] of byName) {
    const sorted = [...runs].sort(
      (a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? "")
    );
    // Dates come from the latest run only, like type/version/rate-ups.
    const latestRun = sorted[sorted.length - 1]!;
    const rateUp6 = latestRun.rateUp6Star ?? [];
    const rateUp5 = latestRun.rateUp5Star ?? [];

    out.push({
      id: slugify(name),
      name,
      nameCN: latestRun.nameCN,
      type: latestRun.type,
      version: latestRun.version,
      startDate: latestRun.startDate,
      endDate: latestRun.endDate,
      rateUp6Star: rateUp6,
      rateUp5Star: rateUp5,
      imageUrl: latestRun.imageUrl,
    });
  }

  // Newest first, then by name.
  return out.sort(
    (a, b) =>
      (b.startDate ?? "").localeCompare(a.startDate ?? "") || a.name.localeCompare(b.name)
  );
}

/** Currently active banners; falls back to the most recent when none are active. */
export function getCurrentBanners(): Banner[] {
  const banners = getAggregatedBanners();
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  const active = banners.filter(
    (b) => b.startDate && b.endDate && b.startDate <= now && b.endDate >= now
  );

  if (active.length === 0) {
    return banners.slice(0, 3);
  }

  return active;
}
