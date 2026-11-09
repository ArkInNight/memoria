export type BannerType =
  | "debut"
  | "rerun"
  | "limited"
  | "collaboration"
  | "ripples"
  | "promise"
  | "revelation"
  | "boon"
  | "invitation"
  | "covenant"
  | "snow"
  | "yearning"
  | "beginner"
  | "standard";

export type PityPool = "character" | Exclude<BannerType, "debut" | "rerun">;

/**
 * Rate-up kinds the pity engine implements. Other in-game rate-up mechanics
 * (7030, selector boxes, summon caps, milestone copies) are documented in
 * docs/summon-mechanic.md but not yet implemented; they run through the
 * generic rate-up path and must not be configured here.
 */
export type RateUpRule = "5050" | "100-first" | "100" | "none";

export interface BannerRuleOverride {
  pityPool?: PityPool;
  carryOver?: boolean;
  rateUp?: RateUpRule;
}

/** Complete mechanics for one banner type from the banner-rules data module. */
export interface BannerRule {
  pityPool: PityPool;
  carryOver: boolean;
  rateUp: RateUpRule;
}

/** Defaults per banner type, overridable per banner record. */
export type BannerRuleMap = Partial<Record<BannerType, BannerRule>>;

export interface Banner extends BannerRuleOverride {
  name: string; // primary identifier (English name, from the EN wiki)
  nameCN?: string | null;
  type: BannerType;
  version?: string | null;
  startDate: string | null;
  endDate: string | null;
  rateUp6Star: string[]; // English character names
  rateUp5Star: string[];
  imageUrl?: string | null;
}

/**
 * One entry of the banner catalog. Recurring banner names (Ripples on the
 * Water, ...) repeat with different rate-ups, images, and dates each patch,
 * so each instance is its own entity. `instanceId` is the stable key, built
 * by the catalog from `name` + `startDate`/`version`.
 */
export interface BannerInstance extends Banner {
  instanceId: string;
}

export interface BannerStats {
  name: string;
  type: BannerType;
  totalSummons: number;
  total4Star: number;
  avgPity6Star: number;
  highestPity6Star: number;
  lowestPity6Star: number;
  obtained6Star: { gainId?: number; name: string; pity: number; createTime: string }[];
  obtained5Star: { gainId?: number; name: string; pity: number; createTime: string }[];
}
