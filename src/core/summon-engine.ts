import type {
  SummonRecord,
  DraftSummon,
  Banner,
  BannerInstance,
  BannerRule,
  BannerRuleMap,
} from "@/shared";

export const DEFAULT_BANNER_RULE: BannerRule = {
  pityPool: "standard",
  carryOver: false,
  rateUp: "5050",
};

/** Merge per-type defaults with a banner's own per-record overrides. */
export function resolveBannerRule(b: Banner, rules: BannerRuleMap): BannerRule {
  const rule = rules[b.type] ?? DEFAULT_BANNER_RULE;
  return {
    ...DEFAULT_BANNER_RULE,
    ...rule,
    pityPool: b.pityPool ?? rule.pityPool ?? DEFAULT_BANNER_RULE.pityPool,
    carryOver: b.carryOver ?? rule.carryOver ?? DEFAULT_BANNER_RULE.carryOver,
    rateUp: b.rateUp ?? rule.rateUp ?? DEFAULT_BANNER_RULE.rateUp,
  };
}

/**
 * Pity track a banner's summons belong to. Carrying pools (character, ripples,
 * beginner, standard) share one track; everything else is scoped per instance
 * (banner name) so its pity resets on each edition.
 */
export function getPityTrack(b: Banner, rules: BannerRuleMap): string {
  const { pityPool, carryOver } = resolveBannerRule(b, rules);
  return carryOver ? pityPool : `${pityPool}:${b.name}`;
}

/** The raw pity pool a banner instance belongs to (debut/rerun → `character`, etc.). */
export function getPityPoolForRun(b: Banner, rules: BannerRuleMap): string {
  return resolveBannerRule(b, rules).pityPool;
}

/** Resolves a summon to the banner instance it belongs to (injected by the caller). */
export type InstanceResolver = (
  summon: Pick<SummonRecord, "poolName" | "poolInstanceId" | "createTime">
) => BannerInstance | undefined;

/** Pity pool of the instance a summon belongs to (resolved per summon). */
export function getPityPoolOfSummon(
  summon: Pick<SummonRecord, "poolName" | "poolInstanceId" | "createTime">,
  resolveInstance: InstanceResolver,
  rules: BannerRuleMap
): string | undefined {
  const instance = resolveInstance(summon);
  return instance ? getPityPoolForRun(instance, rules) : undefined;
}

/** Pool name → pity track, resolved once over a banner catalog. */
export function getPityTrackMap(rules: BannerRuleMap, banners: Banner[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of banners) map.set(b.name, getPityTrack(b, rules));
  return map;
}

/** Summons since the last 6★ in a pity track (0 when the newest summon is a 6★). */
export function currentPityForTrack(
  summons: Pick<SummonRecord, "rarity" | "createTime">[]
): number {
  const sorted = [...summons].sort((a, b) => a.createTime.localeCompare(b.createTime));
  let pity = 0;
  for (const p of sorted) {
    pity++;
    if (p.rarity === 6) pity = 0;
  }
  return pity;
}

interface RecalculateOptions {
  existingSummons: SummonRecord[];
  newSummons: DraftSummon[];
  banners: Banner[];
  rules: BannerRuleMap;
  overrides?: { summonId: string; pity: number }[];
  resolveInstance: InstanceResolver;
}

export function recalculatePityForTrack({
  existingSummons,
  newSummons,
  banners,
  rules,
  overrides = [],
  resolveInstance,
}: RecalculateOptions): SummonRecord[] {
  // Combine both sets
  const allSummons: SummonRecord[] = [
    ...existingSummons,
    ...newSummons.map((p) => ({ ...p, pity: 0, rateOn: null, guaranteed: null }) as SummonRecord),
  ];

  // Sort chronologically ascending
  allSummons.sort((a, b) => a.createTime.localeCompare(b.createTime));

  const bannerMap = new Map<string, Banner>();
  for (const b of banners) {
    bannerMap.set(b.name, b);
  }

  let pityCount = 0;
  let guaranteed = false;

  // `100-first` (ripples) state: each instance's first 6★ is the player-chosen
  // character at 100%; a new instance resets the counter.
  let firstRuleInstance: string | undefined;
  let first6Seen = false;
  let chosenName: string | undefined;

  const processedSummons = allSummons.map((summon) => {
    pityCount++;
    // Resolve the summon to its specific instance so rate-ups/guarantees use
    // that instance's featured characters, not the latest instance of the name.
    const instance = resolveInstance(summon);
    const banner = instance ?? bannerMap.get(summon.poolName);
    const rateUp = banner ? resolveBannerRule(banner, rules).rateUp : undefined;

    if (rateUp === "100-first") {
      const instanceId = instance?.instanceId;
      if (instanceId && instanceId !== firstRuleInstance) {
        firstRuleInstance = instanceId;
        first6Seen = false;
        chosenName = undefined;
        guaranteed = false; // a new instance always opens with a 100% chosen summon
      }
    }

    if (summon.rarity === 6) {
      const currentPity = pityCount;
      pityCount = 0; // reset

      let rateOn: boolean | null = null;
      let nextGuaranteed = false;

      if (rateUp === "100-first") {
        if (!first6Seen) {
          // First 6★ of the instance: always the player-chosen character (100%).
          rateOn = true;
          nextGuaranteed = false;
          chosenName = summon.name;
          first6Seen = true;
        } else {
          // After the first 6★ the chosen character drops to 50/50.
          const isChosen = summon.name === chosenName;
          rateOn = isChosen;
          nextGuaranteed = !isChosen;
        }
      } else if (rateUp === "100") {
        // Boon of the Water: every 6★ is one of the 3 chosen characters, so a
        // rate-up check never loses; there is no off-banner / guarantee state.
        rateOn = true;
        nextGuaranteed = false;
      } else if (banner && banner.rateUp6Star && banner.rateUp6Star.length > 0) {
        const isRateUp = banner.rateUp6Star.includes(summon.name);
        if (isRateUp) {
          rateOn = true;
          nextGuaranteed = false;
        } else {
          rateOn = false;
          nextGuaranteed = !guaranteed;
        }
      }

      const prevGuaranteed = guaranteed;
      guaranteed = nextGuaranteed;

      return {
        ...summon,
        pity: currentPity,
        rateOn,
        guaranteed: prevGuaranteed,
      };
    } else {
      return {
        ...summon,
        pity: pityCount,
        rateOn: null,
        guaranteed,
      };
    }
  });

  if (overrides.length === 0) return processedSummons;

  // Manual pity overrides: a single record can carry a user-known pity count
  // (e.g. an unlogged instance). Shift the counter for that record and
  // everything after it up to the next 6★, which resets the counter.
  const indexById = new Map(allSummons.map((p, i) => [p.id, i]));
  for (const ov of overrides) {
    const idx = indexById.get(ov.summonId);
    if (idx == null || idx >= processedSummons.length) continue;
    const delta = ov.pity - processedSummons[idx]!.pity;
    if (delta === 0) continue;
    for (let i = idx; i < processedSummons.length; i++) {
      processedSummons[i] = { ...processedSummons[i]!, pity: processedSummons[i]!.pity + delta };
      if (processedSummons[i]!.rarity === 6) break;
    }
  }

  return processedSummons;
}
