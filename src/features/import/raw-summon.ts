/**
 * One raw record group exactly as returned by the game's summon-history API
 * (`pageData`). Import-only domain: never leaves the import feature.
 */
export interface RawSummon {
  summonType: string;
  createTime: string;
  poolName: string;
  poolType: number;
  gainIds: number[];
}
