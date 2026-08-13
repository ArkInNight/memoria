import type { ImportResult, PullRecord, Rarity } from "@/lib/shared";
import { getSummons } from "@/lib/store/summons";
import { CHARACTERS, characterRarity } from "@/lib/domain/assets";
import { commitPullsToArchive } from "@/lib/domain/commitPulls";

export interface ManualPullInput {
  poolName: string;
  poolRunId?: string;
  name: string;
  rarity: Rarity;
  summonType: "1" | "10";
  createTime: string; // 'YYYY-MM-DD HH:MM:SS'
  /** Optional pity the user knows for this record; overrides the computed count. */
  manualPity?: number;
}

function toNewPull(
  input: ManualPullInput,
  idx: number
): Omit<PullRecord, "pity" | "rateOn" | "guaranteed"> {
  const rarity = characterRarity(input.name, input.rarity);
  return {
    id: `manual-${input.createTime.replace(/[^0-9]/g, "")}-${idx}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    poolName: input.poolName,
    poolRunId: input.poolRunId,
    poolType: 0,
    summonType: input.summonType,
    gainId: CHARACTERS.find((c) => c.name === input.name)?.id,
    name: input.name,
    rarity,
    type: "character",
    createTime: input.createTime,
    importSessionId: "",
  };
}

/**
 * Commit a batch of manually-entered summons into a profile's archive,
 * mirroring the import pipeline: one session per batch, pity fully recomputed
 * per affected pity group (honoring per-record manual pity overrides).
 */
export async function importManualPulls(
  profileId: string,
  inputs: ManualPullInput[]
): Promise<ImportResult> {
  const sessionId = `manual-${Date.now()}`;
  const newPulls = inputs.map(toNewPull);
  const existingPulls = await getSummons(profileId);

  const overrides = inputs.flatMap((input, i) =>
    input.manualPity != null ? [{ pullId: newPulls[i]!.id, pity: input.manualPity }] : []
  );

  return commitPullsToArchive({ profileId, sessionId, newPulls, existingPulls, overrides });
}
