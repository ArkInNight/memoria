import { characterImageUrl, runForPull } from "@/lib/domain/assets";
import { recentSixStar } from "@/lib/domain/stats";
import type { PullRecord } from "@/lib/shared";

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
  rarity: number;
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
  /** Shown instead of the hero block when there is no featured pull. */
  heading?: { title: string; subtitle: string };
  stats: ShareStatItem[];
  recent: ShareRecent[];
}

/** Obtained 6★ characters, most recent first, one entry per character. */
export function heroOptionsFromPulls(pulls: PullRecord[]): ShareHero[] {
  const seen = new Set<string>();
  const heroes: ShareHero[] = [];
  for (const p of [...pulls].sort((a, b) => b.createTime.localeCompare(a.createTime))) {
    if (p.rarity !== 6 || seen.has(p.name)) continue;
    seen.add(p.name);
    const run = runForPull(p);
    heroes.push({
      name: p.name,
      rarity: p.rarity,
      pity: p.pity,
      rateOn: p.rateOn,
      bannerName: p.poolName,
      bannerType: run?.type ?? "unknown",
      createTime: p.createTime,
      portraitUrl: characterImageUrl(p.name),
    });
  }
  return heroes;
}

/** Recent 6★ pulls for the card strip, one entry per pull (duplicates included). */
export function recent6StarOf(pulls: PullRecord[], limit = 12): ShareRecent[] {
  return recentSixStar(pulls, limit).map((p) => ({
    id: p.id,
    name: p.name,
    pity: p.pity,
    portraitUrl: characterImageUrl(p.name),
  }));
}
