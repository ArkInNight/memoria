export type Rarity = 2 | 3 | 4 | 5 | 6;

export type EntityType = "character" | "psychube";

export interface Character {
  id: number;
  name: string;
  rarity: Rarity;
  attribute: string;
  type: "character";
  imageUrl?: string;
  nameCN?: string;
  damage?: string;
  birthday?: string;
}

export interface Psychube {
  id: number;
  name: string;
  rarity: Rarity;
  type: "psychube";
  imageUrl?: string;
}

export type BannerType =
  | "debut"
  | "rerun"
  | "exclusive"
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

export type PityPool =
  | "character"
  | "exclusive"
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

/**
 * Rate-up kinds the pity engine implements. Other in-game rate-up mechanics
 * (7030, selector boxes, pull caps, milestone copies) are documented in
 * docs/summon-mechanic.md but not yet implemented; they run through the
 * generic rate-up path and must not be configured here.
 */
export type RateUpRule = "5050" | "100-first" | "100" | "none";

/** Mechanics for one banner type; the catalog (assets/banner-rules.json) is the default source. */
export interface BannerRule {
  pityPool?: PityPool;
  carryOver?: boolean;
  rateUp?: RateUpRule;
}

/** Defaults per banner type, overridable per record via Banner's optional fields. */
export type BannerRuleMap = Partial<Record<BannerType, BannerRule>>;

export interface Banner {
  runId?: string; // unique run key: `${slug(name)}--${startDate}`
  name: string; // primary identifier (English name, from the EN wiki)
  nameCN?: string | null;
  type: BannerType;
  version?: string | null;
  pityPool?: PityPool; // optional override (otherwise default from banner-rules.json)
  carryOver?: boolean; // optional override
  rateUp?: RateUpRule; // optional override
  startDate: string | null;
  endDate: string | null;
  rateUp6Star: string[]; // English character names
  rateUp5Star: string[];
  imageUrl?: string | null;
}

export interface PullRecord {
  id: string; // generated: e.g. `${createTime}-${gainId}-${idx}`
  poolName: string; // banner English name (primary)
  poolRunId?: string; // resolved run key (see bannerRuns.ts)
  poolType: number;
  summonType: "1" | "10";
  gainId?: number; // metadata
  name: string; // character English name (primary)
  rarity: number;
  type: EntityType;
  createTime: string;
  pity: number;
  rateOn: boolean | null;
  guaranteed: boolean | null;
  importSessionId: string;
}

export interface ImportSession {
  id: string;
  createTime: string;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

/** A game account owned by the current browser user. Data is isolated per profile. */
export interface Profile {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  archivedAt?: string;
}

export interface ImportResult {
  sessionId: string;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export interface BannerStats {
  name: string;
  type: BannerType;
  totalPulls: number;
  total4Star: number;
  avgPity6Star: number;
  highestPity6Star: number;
  lowestPity6Star: number;
  obtained6Star: { gainId?: number; name: string; pity: number; createTime: string }[];
  obtained5Star: { gainId?: number; name: string; pity: number; createTime: string }[];
}
