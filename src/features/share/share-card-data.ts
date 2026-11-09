import { catalogStore } from "@/stores/catalog-store";
import { recentSixStar } from "@/core/summon-stats";
import type { Rarity, SummonRecord } from "@/shared";

/** Fixed palette for the share card, independent of the app theme. */
export const SHARE_COLORS = {
  gold: "#e9b95c",
  purple: "#b78bff",
  sky: "#7db8ff",
  emerald: "#5fe0a8",
  red: "#ff6b6b",
  white: "#ffffff",
} as const;

export interface ShareHero {
  name: string;
  rarity: Rarity;
  pity: number | null;
  rateOn: boolean | null;
  bannerName: string;
  bannerType: string;
  createTime: string;
  portraitUrl?: string;
}

export interface ShareRecent {
  id: string;
  name: string;
  pity: number;
  portraitUrl?: string;
}

export interface ShareStatItem {
  label: string;
  value: string;
  color: string;
}

export interface ShareCardData {
  profileName: string;
  generatedAt: string;
  hero?: ShareHero;
  /** Shown instead of the hero block when there is no featured summon. */
  heading?: { title: string; subtitle: string };
  stats: ShareStatItem[];
  recent: ShareRecent[];
}

/** Obtained 6★ characters, most recent first, one entry per character. */
export function heroOptionsFromSummons(summons: SummonRecord[]): ShareHero[] {
  const seen = new Set<string>();
  const heroes: ShareHero[] = [];
  for (const p of [...summons].sort((a, b) => b.createTime.localeCompare(a.createTime))) {
    if (p.rarity !== 6 || seen.has(p.name)) continue;
    seen.add(p.name);
    const run = catalogStore.getInstanceForSummon(p);
    heroes.push({
      name: p.name,
      rarity: p.rarity,
      pity: p.pity,
      rateOn: p.rateOn,
      bannerName: p.poolName,
      bannerType: run?.type ?? "unknown",
      createTime: p.createTime,
      portraitUrl: catalogStore.characterImageUrl(p.name),
    });
  }
  return heroes;
}

/** Recent 6★ summons for the card strip, one entry per summon (duplicates included). */
export function recent6StarOf(summons: SummonRecord[], limit = 12): ShareRecent[] {
  return recentSixStar(summons, limit).map((p) => ({
    id: p.id,
    name: p.name,
    pity: p.pity,
    portraitUrl: catalogStore.characterImageUrl(p.name),
  }));
}
