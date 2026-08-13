import type { PullRecord, Banner, BannerRule, BannerRuleMap } from "@/lib/shared";
import { BANNERS, BANNER_RULES, runForPull } from "./assets";

export const DEFAULT_BANNER_RULE: Required<Pick<BannerRule, "pityPool" | "carryOver" | "rateUp">> =
  {
    pityPool: "standard",
    carryOver: false,
    rateUp: "5050",
  };

/** Merge per-type defaults (banner-rules.json) with a banner's own per-record overrides. */
export function resolveBannerRule(b: Banner, rules: BannerRuleMap): BannerRule {
  const rule = rules[b.type] ?? {};
  return {
    ...DEFAULT_BANNER_RULE,
    ...rule,
    pityPool: b.pityPool ?? rule.pityPool ?? DEFAULT_BANNER_RULE.pityPool,
    carryOver: b.carryOver ?? rule.carryOver ?? DEFAULT_BANNER_RULE.carryOver,
    rateUp: b.rateUp ?? rule.rateUp ?? DEFAULT_BANNER_RULE.rateUp,
  };
}

/**
 * Pity group a banner's pulls belong to. Carrying pools (character, ripples,
 * beginner, standard) share one group; everything else is scoped per edition
 * (banner name) so its pity resets on each run.
 */
export function pityGroupFor(b: Banner, rules: BannerRuleMap): string {
  const { pityPool, carryOver } = resolveBannerRule(b, rules);
  const pool = pityPool ?? DEFAULT_BANNER_RULE.pityPool;
  return carryOver ? pool : `${pool}:${b.name}`;
}

/** The raw pity pool a banner run belongs to (debut/rerun → `character`, etc.). */
export function pityPoolForRun(b: Banner, rules: BannerRuleMap): string {
  return resolveBannerRule(b, rules).pityPool ?? DEFAULT_BANNER_RULE.pityPool;
}

/** Pity pool of the run a pull belongs to (resolved per pull). */
export function pityPoolOfPull(
  pull: Pick<PullRecord, "poolName" | "poolRunId" | "createTime">,
  rules: BannerRuleMap
): string | undefined {
  const run = runForPull(pull);
  return run ? pityPoolForRun(run, rules) : undefined;
}

/** Pool name → pity group, resolved once over the banner catalog. */
export function pityGroupMap(rules: BannerRuleMap): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of BANNERS) map.set(b.name, pityGroupFor(b, rules));
  return map;
}

/** Pulls since the last 6★ in a pity group (0 when the newest pull is a 6★). */
export function currentPityForGroup(pulls: Pick<PullRecord, "rarity" | "createTime">[]): number {
  const sorted = [...pulls].sort((a, b) => a.createTime.localeCompare(b.createTime));
  let pity = 0;
  for (const p of sorted) {
    pity++;
    if (p.rarity === 6) pity = 0;
  }
  return pity;
}

export function recalculatePityForGroup(
  existingPulls: PullRecord[],
  newPulls: Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[],
  banners: Banner[],
  overrides: { pullId: string; pity: number }[] = []
): PullRecord[] {
  // Combine both sets
  const allPulls: PullRecord[] = [
    ...existingPulls,
    ...newPulls.map((p) => ({ ...p, pity: 0, rateOn: null, guaranteed: null }) as PullRecord),
  ];

  // Sort chronologically ascending
  allPulls.sort((a, b) => a.createTime.localeCompare(b.createTime));

  const bannerMap = new Map<string, Banner>();
  for (const b of banners) {
    bannerMap.set(b.name, b);
  }

  let pityCount = 0;
  let guaranteed = false;

  // `100-first` (ripples) state: each run's first 6★ is the player-chosen
  // character at 100%; a new run resets the counter.
  let firstRuleRun: string | undefined;
  let first6Seen = false;
  let chosenName: string | undefined;

  const processedPulls = allPulls.map((pull) => {
    pityCount++;
    // Resolve the pull to its specific run so rate-ups/guarantees use that
    // run's featured characters, not the latest run of the same name.
    const banner = runForPull(pull) ?? bannerMap.get(pull.poolName);
    const rateUp = banner ? resolveBannerRule(banner, BANNER_RULES).rateUp : undefined;

    if (rateUp === "100-first") {
      const runId = banner?.runId;
      if (runId && runId !== firstRuleRun) {
        firstRuleRun = runId;
        first6Seen = false;
        chosenName = undefined;
        guaranteed = false; // a new run always opens with a 100% chosen pull
      }
    }

    if (pull.rarity === 6) {
      const currentPity = pityCount;
      pityCount = 0; // reset

      let rateOn: boolean | null = null;
      let nextGuaranteed = false;

      if (rateUp === "100-first") {
        if (!first6Seen) {
          // First 6★ of the run: always the player-chosen character (100%).
          rateOn = true;
          nextGuaranteed = false;
          chosenName = pull.name;
          first6Seen = true;
        } else {
          // After the first 6★ the chosen character drops to 50/50.
          const isChosen = pull.name === chosenName;
          rateOn = isChosen;
          nextGuaranteed = !isChosen;
        }
      } else if (rateUp === "100") {
        // Boon of the Water: every 6★ is one of the 3 chosen characters, so a
        // rate-up check never loses; there is no off-banner / guarantee state.
        rateOn = true;
        nextGuaranteed = false;
      } else if (banner && banner.rateUp6Star && banner.rateUp6Star.length > 0) {
        const isRateUp = banner.rateUp6Star.includes(pull.name);
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
        ...pull,
        pity: currentPity,
        rateOn,
        guaranteed: prevGuaranteed,
      };
    } else {
      return {
        ...pull,
        pity: pityCount,
        rateOn: null,
        guaranteed,
      };
    }
  });

  if (overrides.length === 0) return processedPulls;

  // Manual pity overrides: a single record can carry a user-known pity count
  // (e.g. an unlogged run). Shift the counter for that record and everything
  // after it up to the next 6★, which resets the counter.
  const indexById = new Map(allPulls.map((p, i) => [p.id, i]));
  for (const ov of overrides) {
    const idx = indexById.get(ov.pullId);
    if (idx == null || idx >= processedPulls.length) continue;
    const delta = ov.pity - processedPulls[idx]!.pity;
    if (delta === 0) continue;
    for (let i = idx; i < processedPulls.length; i++) {
      processedPulls[i] = { ...processedPulls[i]!, pity: processedPulls[i]!.pity + delta };
      if (processedPulls[i]!.rarity === 6) break;
    }
  }

  return processedPulls;
}
