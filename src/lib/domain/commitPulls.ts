import type { ImportResult, PullRecord } from "@/lib/shared";
import { nowString } from "@/lib/shared";
import { db, type StoredSession, type StoredSummon } from "../store/db";
import { BANNERS, BANNER_RULES } from "./assets";
import { pityGroupMap, recalculatePityForGroup, DEFAULT_BANNER_RULE } from "./pityEngine";

interface CommitOptions {
  profileId: string;
  sessionId: string;
  /** Already-deduped pulls to persist (import source performs its own dedupe). */
  newPulls: Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[];
  existingPulls: PullRecord[];
  duplicateCount?: number;
  overrides?: { pullId: string; pity: number }[];
}

/**
 * Persist a batch of pulls into a profile's permanent archive, shared by the
 * import and manual-input pipelines:
 * - groups pulls by pity group
 * - recomputes pity/rateOn/guaranteed per affected group (honoring manual overrides)
 * - writes one import session plus the resolved records in a single transaction
 * - never deletes existing history
 */
export async function commitPullsToArchive(options: CommitOptions): Promise<ImportResult> {
  const {
    profileId,
    sessionId,
    newPulls,
    existingPulls,
    duplicateCount = 0,
    overrides = [],
  } = options;

  const groupOf = pityGroupMap(BANNER_RULES);
  const groupFor = (poolName: string) => groupOf.get(poolName) ?? DEFAULT_BANNER_RULE.pityPool;

  const groupMap = new Map<string, typeof newPulls>();
  for (const p of newPulls) {
    const pg = groupFor(p.poolName);
    if (!groupMap.has(pg)) groupMap.set(pg, []);
    groupMap.get(pg)!.push(p);
  }

  const newIds = new Set(newPulls.map((p) => p.id));
  const pullsToInsert: PullRecord[] = [];

  for (const [pg, groupNew] of groupMap.entries()) {
    const groupExisting = existingPulls.filter((p) => groupFor(p.poolName) === pg);
    const recalculated = recalculatePityForGroup(groupExisting, groupNew, BANNERS, overrides);
    pullsToInsert.push(...recalculated.filter((p) => newIds.has(p.id)));
  }

  const importedCount = pullsToInsert.length;
  if (importedCount === 0) {
    return { sessionId, importedCount: 0, duplicateCount, failedCount: 0 };
  }

  const session: StoredSession = {
    id: sessionId,
    profileId,
    createTime: nowString(),
    importedCount,
    duplicateCount,
    failedCount: 0,
  };
  const summonsToInsert: StoredSummon[] = pullsToInsert.map((p) => ({
    ...p,
    profileId,
    importSessionId: sessionId,
  }));

  await db.transaction("rw", [db.sessions, db.summons], async () => {
    await db.sessions.add(session);
    await db.summons.bulkPut(summonsToInsert);
  });

  return { sessionId, importedCount, duplicateCount, failedCount: 0 };
}
