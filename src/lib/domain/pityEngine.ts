import type { PullRecord, Banner, BannerRule, BannerRuleMap } from "@/lib/shared";
import { BANNERS } from "./assets";

export const DEFAULT_BANNER_RULE: Required<Pick<BannerRule, "pityPool" | "carryOver" | "rateUp">> = {
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
    selector: b.selector ?? rule.selector,
    pullCap: b.pullCap ?? rule.pullCap,
    milestoneCopies: b.milestoneCopies ?? rule.milestoneCopies,
    hardPity: b.hardPity ?? rule.hardPity,
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

export function pityGroupForPool(poolName: string, rules: BannerRuleMap): string {
  const banner = BANNERS.find((b) => b.name === poolName);
  return banner ? pityGroupFor(banner, rules) : DEFAULT_BANNER_RULE.pityPool;
}

export function recalculatePityForGroup(
  existingPulls: PullRecord[],
  newPulls: Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[],
  banners: Banner[]
): PullRecord[] {
  // Combine both sets
  const allPulls: PullRecord[] = [
    ...existingPulls,
    ...newPulls.map((p) => ({ ...p, pity: 0, rateOn: null, guaranteed: null } as PullRecord)),
  ];

  // Sort chronologically ascending
  allPulls.sort((a, b) => a.createTime.localeCompare(b.createTime));

  const bannerMap = new Map<string, Banner>();
  for (const b of banners) {
    bannerMap.set(b.name, b);
  }

  let pityCount = 0;
  let guaranteed = false;

  const processedPulls = allPulls.map((pull) => {
    pityCount++;
    const banner = bannerMap.get(pull.poolName);

    if (pull.rarity === 6) {
      const currentPity = pityCount;
      pityCount = 0; // reset

      let rateOn: boolean | null = null;
      let nextGuaranteed = false;

      if (banner && banner.rateUp6Star && banner.rateUp6Star.length > 0) {
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

  return processedPulls;
}
