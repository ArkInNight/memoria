import type { Character, Banner, BannerRuleMap, PullRecord, Rarity } from "@/lib/shared";
import { slugify, nowString } from "@/lib/shared";
import bannersJson from "../../../assets/banners.json";
import charactersJson from "../../../assets/characters.json";
import bannerRulesJson from "../../../assets/banner-rules.json";

export const CHARACTERS: Character[] = charactersJson as Character[];
export const BANNERS: Banner[] = bannersJson as Banner[];
export const BANNER_RULES: BannerRuleMap = bannerRulesJson as BannerRuleMap;

/** Portrait URL for a character name, or undefined when unknown. */
export function characterImageUrl(name: string): string | undefined {
  return CHARACTERS.find((c) => c.name === name)?.imageUrl;
}

/** Name lookup table, indexed by English name (for portrait images). */
export function characterImageMap(): Map<string, string | undefined> {
  return new Map(CHARACTERS.map((c) => [c.name, c.imageUrl]));
}

/** Rarity of a character by name, falling back to `fallback` when unknown. */
export function characterRarity(name: string, fallback: Rarity): Rarity {
  return CHARACTERS.find((c) => c.name === name)?.rarity ?? fallback;
}

/**
 * A banner run — one entry in banners.json. Recurring banner names
 * (Ripples on the Water, Yearning of the Water, ...) repeat with different
 * rate-ups, images, and dates each patch, so each run is its own entity.
 */
export type BannerRun = Banner & { runId: string };

const runCache = new Map<string, BannerRun>();
let runsCache: BannerRun[] | null = null;

/** Unique, stable key for a banner run: `${slug(name)}--{date|version}`. */
export function runIdFor(banner: Pick<Banner, "name" | "startDate" | "version">): string {
  const base = slugify(banner.name);
  if (banner.startDate) return `${base}--${banner.startDate.slice(0, 10)}`;
  if (banner.version) return `${base}--v${slugify(banner.version)}`;
  return `${base}--x`;
}

function cacheRun(runId: string, banner: Banner): BannerRun {
  const cached = runCache.get(runId);
  if (cached) return cached;
  const run: BannerRun = { ...banner, runId };
  runCache.set(runId, run);
  return run;
}

/** Every banner run in the catalog (185 entries, one per patch). */
export function getBannerRuns(): BannerRun[] {
  if (runsCache) return runsCache;
  const counts = new Map<string, number>();
  runsCache = BANNERS.map((b) => {
    const base = runIdFor(b);
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return cacheRun(n === 0 ? base : `${base}-${n + 1}`, b);
  });
  return runsCache;
}

export function getBannerByRunId(runId: string): BannerRun | undefined {
  return getBannerRuns().find((b) => b.runId === runId);
}

/**
 * The run of a banner that a pull belongs to, matched by its createTime
 * against the run's (non-overlapping) date range. Falls back to the latest
 * run with the same name when the time is outside every range.
 */
export function findRun(poolName: string, createTime: string): BannerRun | undefined {
  const runs = getBannerRuns().filter((b) => b.name === poolName);
  if (runs.length === 0) return undefined;
  if (runs.length === 1) return runs[0];

  const t = createTime.slice(0, 19);
  return (
    runs.find((b) => {
      if (!b.startDate) return false;
      if (t < b.startDate) return false;
      if (b.endDate != null && t > b.endDate) return false;
      return true;
    }) ?? [...runs].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""))[0]
  );
}

/** Resolve a pull to its run, preferring an explicitly stored poolRunId. */
export function runForPull(
  pull: Pick<PullRecord, "poolName" | "poolRunId" | "createTime">
): BannerRun | undefined {
  if (pull.poolRunId) {
    const run = getBannerByRunId(pull.poolRunId);
    if (run) return run;
  }
  return findRun(pull.poolName, pull.createTime);
}

/** Display label for a run: `Name (Version)` with date fallback. */
export function runLabel(run: Pick<Banner, "name" | "version" | "startDate">): string {
  if (run.version) return `${run.name} (${run.version})`;
  if (run.startDate) return `${run.name} (${run.startDate.slice(0, 10)})`;
  return run.name;
}

/**
 * Currently active banners, evaluated against raw banner runs so recurring
 * names (e.g. "Ripples on the Water") resolve to the run that is live right now.
 * Permanent banners (`endDate === null`) are always included.
 */
export function getCurrentBanners(): BannerRun[] {
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
    .map((b) => cacheRun(runIdFor(b), b));
}
