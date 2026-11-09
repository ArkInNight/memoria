import type { Rarity, EntityType } from "./common";

export interface SummonRecord {
  id: string; // generated: e.g. `${createTime}-${gainId}-${idx}`
  poolName: string; // banner English name (primary)
  poolInstanceId?: string; // resolved instance key (BannerInstance)
  poolType: number;
  summonType: "1" | "10";
  gainId?: number; // metadata
  name: string; // character English name (primary)
  rarity: Rarity;
  type: EntityType;
  createTime: string;
  pity: number;
  rateOn: boolean | null;
  guaranteed: boolean | null;
  importSessionId: string;
  /** User-supplied correction used as the recalculation anchor for this summon. */
  pityOverride?: number;
  updatedAt?: string;
  deletedAt?: string;
}

/** A summon before write-time derived fields (pity/rateOn/guaranteed) exist. */
export type DraftSummon = Omit<SummonRecord, "pity" | "rateOn" | "guaranteed">;

export interface SummonInput {
  poolName: string;
  poolInstanceId?: string;
  name: string;
  rarity: Rarity;
  summonType: "1" | "10";
  createTime: string;
  /** Optional user-known pity value that overrides the computed count. */
  pityOverride?: number;
}

export interface ImportSession {
  id: string;
  createTime: string;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export interface ImportResult {
  sessionId: string;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export type ImportFeedback = Pick<ImportResult, "importedCount" | "duplicateCount">;
