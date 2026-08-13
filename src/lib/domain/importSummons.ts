import type { ImportResult } from "@/lib/shared";
import { getSummons } from "../store/summons";
import { commitPullsToArchive } from "./commitPulls";
import { parseRawPulls, type RawPull } from "./summonParser";

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
    return {
      sessionId: `empty-${Date.now()}`,
      importedCount: 0,
      duplicateCount: 0,
      failedCount: 0,
    };
  }

  const parsedPulls = parseRawPulls(rawPageData);
  const existingPulls = await getSummons(profileId);
  const existingIds = new Set(existingPulls.map((p) => p.id));

  const newPulls = parsedPulls.filter((p) => !existingIds.has(p.id));
  const duplicateCount = parsedPulls.length - newPulls.length;

  return commitPullsToArchive({ profileId, sessionId, newPulls, existingPulls, duplicateCount });
}
