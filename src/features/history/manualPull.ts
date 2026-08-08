import type { ImportResult, PullRecord, Rarity } from "@/lib/shared";
import { db, type StoredSession, type StoredSummon } from "@/lib/store/db";
import { getSummons } from "@/lib/store/summons";
import { BANNERS, BANNER_RULES, CHARACTERS } from "@/lib/domain/assets";
import { pityGroupForPool, recalculatePityForGroup } from "@/lib/domain/pityEngine";

export interface ManualPullInput {
  poolName: string;
  name: string;
  rarity: Rarity;
  summonType: "1" | "10";
  createTime: string; // 'YYYY-MM-DD HH:MM:SS'
}

function nowString(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Insert a single manually-entered summon into a profile's archive.
 * Pity for the affected pity group is fully recomputed so counters and
 * guarantee state stay consistent, even if the record is backdated.
 */
export async function addManualPull(
  profileId: string,
  input: ManualPullInput
): Promise<ImportResult> {
  const sessionId = `manual-${Date.now()}`;
  const char = CHARACTERS.find((c) => c.name === input.name);

  const newPull: Omit<PullRecord, "pity" | "rateOn" | "guaranteed"> = {
    id: `manual-${input.createTime.replace(/[^0-9]/g, "")}-${Math.random().toString(36).slice(2, 8)}`,
    poolName: input.poolName,
    poolType: 0,
    summonType: input.summonType,
    gainId: char?.id,
    name: char ? char.name : input.name,
    rarity: char ? char.rarity : input.rarity,
    type: "character",
    createTime: input.createTime,
    importSessionId: "",
  };

  const pg = pityGroupForPool(input.poolName, BANNER_RULES);
  const groupExisting = (await getSummons(profileId)).filter(
    (p) => pityGroupForPool(p.poolName, BANNER_RULES) === pg
  );

  const recalculated = recalculatePityForGroup(groupExisting, [newPull], BANNERS);

  const toWrite: StoredSummon[] = recalculated.map((p) => ({
    ...p,
    profileId,
    importSessionId: p.id === newPull.id ? sessionId : p.importSessionId,
  }));

  const session: StoredSession = {
    id: sessionId,
    profileId,
    createTime: nowString(),
    importedCount: 1,
    duplicateCount: 0,
    failedCount: 0,
  };

  await db.transaction("rw", [db.sessions, db.summons], async () => {
    await db.sessions.add(session);
    await db.summons.bulkPut(toWrite);
  });

  return { sessionId, importedCount: 1, duplicateCount: 0, failedCount: 0 };
}
