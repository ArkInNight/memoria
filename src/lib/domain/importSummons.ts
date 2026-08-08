import type { ImportResult, PullRecord } from "@/lib/shared";
import { db, type StoredSession, type StoredSummon } from "../store/db";
import { getSummons } from "../store/summons";
import { BANNERS, BANNER_RULES } from "./assets";
import { parseRawPulls, type RawPull } from "./summonParser";
import { pityGroupForPool, recalculatePityForGroup } from "./pityEngine";

function nowString(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Merge raw summon records into a profile's permanent archive.
 * - Ignores duplicate records (by summon id).
 * - Never deletes existing history.
 * - Recalculates pity per affected pity group.
 */
export async function importPulls(
  profileId: string,
  rawPageData: RawPull[]
): Promise<ImportResult> {
  const sessionId = `import-${Date.now()}`;

  if (!rawPageData || rawPageData.length === 0) {
    return { sessionId: `empty-${Date.now()}`, importedCount: 0, duplicateCount: 0, failedCount: 0 };
  }

  const parsedPulls = parseRawPulls(rawPageData);
  const existingPulls = await getSummons(profileId);
  const existingIds = new Set(existingPulls.map((p) => p.id));

  // Group pulls by pity group.
  const groupPullsMap = new Map<string, Omit<PullRecord, "pity" | "rateOn" | "guaranteed">[]>();
  for (const p of parsedPulls) {
    const pg = pityGroupForPool(p.poolName, BANNER_RULES);
    if (!groupPullsMap.has(pg)) groupPullsMap.set(pg, []);
    groupPullsMap.get(pg)!.push(p);
  }

  const pullsToInsert: PullRecord[] = [];
  let duplicateCount = 0;

  for (const [pg, groupNewPulls] of groupPullsMap.entries()) {
    const groupExisting = existingPulls.filter(
      (p) => pityGroupForPool(p.poolName, BANNER_RULES) === pg
    );

    const uniqueGroupNewPulls = groupNewPulls.filter((p) => !existingIds.has(p.id));
    duplicateCount += groupNewPulls.length - uniqueGroupNewPulls.length;

    if (uniqueGroupNewPulls.length === 0) continue;

    const recalculated = recalculatePityForGroup(groupExisting, uniqueGroupNewPulls, BANNERS);

    const newProcessed = recalculated
      .filter((p) => !existingIds.has(p.id))
      .map((p) => ({ ...p, importSessionId: sessionId }));

    pullsToInsert.push(...newProcessed);
  }

  const importedCount = pullsToInsert.length;

  if (importedCount > 0) {
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
    }));

    await db.transaction("rw", [db.sessions, db.summons], async () => {
      await db.sessions.add(session);
      await db.summons.bulkPut(summonsToInsert);
    });
  }

  return { sessionId, importedCount, duplicateCount, failedCount: 0 };
}
