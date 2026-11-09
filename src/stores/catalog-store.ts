import type {
  Character,
  Banner,
  BannerInstance,
  BannerRuleMap,
  SummonRecord,
  Rarity,
} from "@/shared";
import { slugify, nowString } from "@/shared";
import { banners } from "@/data/banners";
import { characters } from "@/data/characters";
import { bannerRules } from "@/data/banner-rules";

const CHARACTERS: Character[] = characters;
const BANNERS: Banner[] = banners;
const BANNER_RULES: BannerRuleMap = bannerRules;

/** Portrait URL for a character name, or undefined when unknown. */
export function characterImageUrl(name: string): string | undefined {
  return CHARACTERS.find((c) => c.name === name)?.imageUrl ?? undefined;
}

/** Rarity of a character by name, falling back to `fallback` when unknown. */
export function characterRarity(name: string, fallback: Rarity): Rarity {
  return CHARACTERS.find((c) => c.name === name)?.rarity ?? fallback;
}

let instancesCache: BannerInstance[] | null = null;

/** Unique, stable key for a banner instance: `${slug(name)}--{date|version}`. */
export function getInstanceIdFor(banner: Pick<Banner, "name" | "startDate" | "version">): string {
  const base = slugify(banner.name);
  if (banner.startDate) return `${base}--${banner.startDate.slice(0, 10)}`;
  if (banner.version) return `${base}--v${slugify(banner.version)}`;
  return `${base}--x`;
}

/** Every banner instance in the catalog (185 entries, one per patch). */
export function getBannerInstances(): BannerInstance[] {
  if (instancesCache) return instancesCache;
  const counts = new Map<string, number>();
  instancesCache = BANNERS.map((b) => {
    const base = getInstanceIdFor(b);
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return { ...b, instanceId: n === 0 ? base : `${base}-${n + 1}` };
  });
  return instancesCache;
}

export function getBannerByInstanceId(instanceId: string): BannerInstance | undefined {
  return getBannerInstances().find((b) => b.instanceId === instanceId);
}

/**
 * The banner instance a summon belongs to, matched by its createTime against
 * the instance's (non-overlapping) date range. Falls back to the latest
 * instance with the same name when the time is outside every range.
 */
export function findInstance(poolName: string, createTime: string): BannerInstance | undefined {
  const instances = getBannerInstances().filter((b) => b.name === poolName);
  if (instances.length === 0) return undefined;
  if (instances.length === 1) return instances[0];

  const t = createTime.slice(0, 19);
  return (
    instances.find((b) => {
      if (!b.startDate) return false;
      if (t < b.startDate) return false;
      if (b.endDate != null && t > b.endDate) return false;
      return true;
    }) ?? [...instances].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""))[0]
  );
}

/** Resolve a summon to its banner instance, preferring an explicitly stored poolInstanceId. */
export function getInstanceForSummon(
  summon: Pick<SummonRecord, "poolName" | "poolInstanceId" | "createTime">
): BannerInstance | undefined {
  if (summon.poolInstanceId) {
    const instance = getBannerByInstanceId(summon.poolInstanceId);
    if (instance) return instance;
  }
  return findInstance(summon.poolName, summon.createTime);
}

/** Display label for an instance: `Name (Version)` with date fallback. */
export function getInstanceLabel(instance: Pick<Banner, "name" | "version" | "startDate">): string {
  if (instance.version) return `${instance.name} (${instance.version})`;
  if (instance.startDate) return `${instance.name} (${instance.startDate.slice(0, 10)})`;
  return instance.name;
}

/**
 * Currently active banners, evaluated against raw banner instances so recurring
 * names (e.g. "Ripples on the Water") resolve to the instance that is live right now.
 * Permanent banners (`endDate === null`) are always included.
 */
export function getCurrentBanners(): BannerInstance[] {
  const now = nowString();

  const activeByName = new Map<string, Banner>();
  for (const b of BANNERS) {
    const isActive =
      b.endDate === null ||
      (b.startDate !== null && b.endDate !== null && b.startDate <= now && b.endDate >= now);
    if (!isActive) continue;

    const existing = activeByName.get(b.name);
    if (!existing || (b.startDate ?? "") > (existing.startDate ?? "")) {
      activeByName.set(b.name, b);
    }
  }

  // Permanent banners last, then newest first.
  return [...activeByName.values()]
    .sort(
      (a, b) =>
        (a.endDate === null ? 1 : 0) - (b.endDate === null ? 1 : 0) ||
        (b.startDate ?? "").localeCompare(a.startDate ?? "")
    )
    .map((b) => ({ ...b, instanceId: getInstanceIdFor(b) }));
}

export const catalogStore = {
  banners: BANNERS,
  characters: CHARACTERS,
  bannerRules: BANNER_RULES,
  characterImageUrl,
  characterRarity,
  getBannerInstances,
  getBannerByInstanceId,
  getCurrentBanners,
  findInstance,
  getInstanceForSummon,
  getInstanceLabel,
} as const;
