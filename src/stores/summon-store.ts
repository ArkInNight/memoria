import { useLiveQuery } from "dexie-react-hooks";
import type { DraftSummon, ImportResult, SummonInput, SummonRecord } from "@/shared";
import { nowString } from "@/shared";
import {
  DEFAULT_BANNER_RULE,
  getPityTrackMap,
  recalculatePityForTrack,
} from "@/core/summon-engine";
import { catalogStore } from "./catalog-store";
import { db, type StoredSummonRecord } from "./db";

const isActive = (summon: StoredSummonRecord) => !summon.deletedAt;
/** Manual entries have no game-side pool type. */
const MANUAL_POOL_TYPE = 0;

async function getSummons(profileId: string): Promise<StoredSummonRecord[]> {
  return db.summons.where("profileId").equals(profileId).toArray();
}

function liveFilter(
  profileId: string | null | undefined,
  keep: (s: StoredSummonRecord) => boolean
) {
  return async (): Promise<StoredSummonRecord[]> => {
    if (!profileId) return [];
    const summons = await getSummons(profileId);
    return summons.filter(keep);
  };
}

function useSummonRecords(profileId: string | null | undefined): StoredSummonRecord[] {
  return useLiveQuery(liveFilter(profileId, isActive), [profileId], []);
}

function useDeletedSummons(profileId: string | null | undefined): StoredSummonRecord[] {
  return useLiveQuery(
    liveFilter(profileId, (s) => !isActive(s)),
    [profileId],
    []
  );
}

function getActiveSummons(profileId: string): Promise<StoredSummonRecord[]> {
  return getSummons(profileId).then((summons) => summons.filter(isActive));
}

function useSessions(profileId: string | null | undefined) {
  return useLiveQuery(
    async () => {
      if (!profileId) return [];
      return db.sessions.where("profileId").equals(profileId).toArray();
    },
    [profileId],
    []
  );
}

interface CommitOptions {
  profileId: string;
  sessionId: string;
  newSummons: DraftSummon[];
  existingSummons: SummonRecord[];
  duplicateCount?: number;
  overrides?: { summonId: string; pity: number }[];
}

const trackOf = getPityTrackMap(catalogStore.bannerRules, catalogStore.banners);
const trackFor = (poolName: string) => trackOf.get(poolName) ?? DEFAULT_BANNER_RULE.pityPool;

function recalculate(options: {
  existingSummons: SummonRecord[];
  newSummons: DraftSummon[];
  overrides?: { summonId: string; pity: number }[];
}): SummonRecord[] {
  return recalculatePityForTrack({
    ...options,
    banners: catalogStore.banners,
    rules: catalogStore.bannerRules,
    resolveInstance: catalogStore.getInstanceForSummon,
  });
}

async function commitSummonsToArchive(options: CommitOptions): Promise<ImportResult> {
  const {
    profileId,
    sessionId,
    newSummons,
    existingSummons,
    duplicateCount = 0,
    overrides = newSummons.flatMap((summon) =>
      summon.pityOverride != null ? [{ summonId: summon.id, pity: summon.pityOverride }] : []
    ),
  } = options;

  const byTrack = new Map<string, DraftSummon[]>();
  for (const summon of newSummons) {
    const track = trackFor(summon.poolName);
    byTrack.set(track, [...(byTrack.get(track) ?? []), summon]);
  }

  const newIds = new Set(newSummons.map((summon) => summon.id));
  const recalculated: SummonRecord[] = [];
  for (const [track, trackNew] of byTrack) {
    const trackExisting = existingSummons.filter((summon) => trackFor(summon.poolName) === track);
    recalculated.push(
      ...recalculate({ existingSummons: trackExisting, newSummons: trackNew, overrides })
    );
  }

  const importedCount = recalculated.filter((summon) => newIds.has(summon.id)).length;
  if (importedCount === 0) {
    return { sessionId, importedCount: 0, duplicateCount, failedCount: 0 };
  }

  const existingById = new Map(existingSummons.map((summon) => [summon.id, summon]));
  const summonsToWrite = recalculated.map((summon) => ({
    ...summon,
    profileId,
    importSessionId: newIds.has(summon.id)
      ? sessionId
      : (existingById.get(summon.id)?.importSessionId ?? summon.importSessionId),
  }));

  await db.transaction("rw", [db.sessions, db.summons], async () => {
    await db.sessions.add({
      id: sessionId,
      profileId,
      createTime: nowString(),
      importedCount,
      duplicateCount,
      failedCount: 0,
    });
    await db.summons.bulkPut(summonsToWrite);
  });

  return { sessionId, importedCount, duplicateCount, failedCount: 0 };
}

async function importSummons(profileId: string, drafts: DraftSummon[]): Promise<ImportResult> {
  const sessionId = `import-${Date.now()}`;
  if (drafts.length === 0) {
    return { sessionId, importedCount: 0, duplicateCount: 0, failedCount: 0 };
  }

  // Deleted records still count as duplicates so history is never resurrected.
  const allStored = await getSummons(profileId);
  const existingIds = new Set(allStored.map((summon) => summon.id));
  const newSummons = drafts.filter((draft) => !existingIds.has(draft.id));

  return commitSummonsToArchive({
    profileId,
    sessionId,
    newSummons,
    existingSummons: allStored.filter(isActive),
    duplicateCount: drafts.length - newSummons.length,
  });
}

function toNewSummon(input: SummonInput, index: number): DraftSummon {
  return {
    id: `manual-${input.createTime.replace(/[^0-9]/g, "")}-${index}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    poolName: input.poolName,
    poolInstanceId: input.poolInstanceId,
    poolType: MANUAL_POOL_TYPE,
    summonType: input.summonType,
    gainId: catalogStore.characters.find((character) => character.name === input.name)?.id,
    name: input.name,
    rarity: catalogStore.characterRarity(input.name, input.rarity),
    type: "character",
    createTime: input.createTime,
    importSessionId: "",
    pityOverride: input.pityOverride,
  };
}

async function importManualSummons(
  profileId: string,
  inputs: SummonInput[]
): Promise<ImportResult> {
  const newSummons = inputs.map(toNewSummon);
  return commitSummonsToArchive({
    profileId,
    sessionId: `manual-${Date.now()}`,
    newSummons,
    existingSummons: await getActiveSummons(profileId),
  });
}

/** Strip write-time derived fields before feeding a stored record back into the engine. */
function withoutDerived(summon: StoredSummonRecord): DraftSummon {
  const { pity, rateOn, guaranteed, ...draft } = summon;
  void pity;
  void rateOn;
  void guaranteed;
  return draft;
}

function recalculateTracks(
  summons: StoredSummonRecord[],
  tracks: Set<string>
): StoredSummonRecord[] {
  const recalculated: StoredSummonRecord[] = [];
  for (const track of tracks) {
    const inTrack = summons.filter(
      (summon) => !summon.deletedAt && trackFor(summon.poolName) === track
    );
    const overrides = inTrack.flatMap((summon) =>
      summon.pityOverride != null ? [{ summonId: summon.id, pity: summon.pityOverride }] : []
    );
    const resolved = recalculate({
      existingSummons: [],
      newSummons: inTrack.map(withoutDerived),
      overrides,
    });
    const storedById = new Map(inTrack.map((summon) => [summon.id, summon]));
    recalculated.push(...resolved.map((summon) => ({ ...storedById.get(summon.id)!, ...summon })));
  }
  return recalculated;
}

async function createSummon(profileId: string, input: SummonInput): Promise<void> {
  await importManualSummons(profileId, [input]);
}

async function updateSummon(profileId: string, id: string, input: SummonInput): Promise<void> {
  const summons = await getSummons(profileId);
  const current = summons.find((summon) => summon.id === id);
  if (!current || current.deletedAt) throw new Error("Summon record not found.");

  const updated: StoredSummonRecord = {
    ...current,
    poolName: input.poolName,
    poolInstanceId: input.poolInstanceId,
    name: input.name,
    rarity: catalogStore.characterRarity(input.name, input.rarity),
    summonType: input.summonType,
    gainId: catalogStore.characters.find((character) => character.name === input.name)?.id,
    createTime: input.createTime,
    pityOverride: input.pityOverride,
    updatedAt: nowString(),
  };
  const next = summons.map((summon) => (summon.id === id ? updated : summon));
  const recalculated = recalculateTracks(
    next,
    new Set([trackFor(current.poolName), trackFor(updated.poolName)])
  );

  await db.transaction("rw", db.summons, async () => {
    await db.summons.put(updated);
    await db.summons.bulkPut(recalculated);
  });
}

async function softDeleteSummon(profileId: string, id: string): Promise<void> {
  const summons = await getSummons(profileId);
  const current = summons.find((summon) => summon.id === id);
  if (!current || current.deletedAt) throw new Error("Summon record not found.");

  const deleted = { ...current, deletedAt: nowString(), updatedAt: nowString() };
  const next = summons.map((summon) => (summon.id === id ? deleted : summon));
  const recalculated = recalculateTracks(next, new Set([trackFor(current.poolName)]));
  await db.transaction("rw", db.summons, async () => {
    await db.summons.put(deleted);
    await db.summons.bulkPut(recalculated);
  });
}

async function restoreSummon(profileId: string, id: string): Promise<void> {
  const summons = await getSummons(profileId);
  const current = summons.find((summon) => summon.id === id);
  if (!current?.deletedAt) throw new Error("Deleted summon record not found.");

  const restored = { ...current, deletedAt: undefined, updatedAt: nowString() };
  const next = summons.map((summon) => (summon.id === id ? restored : summon));
  const recalculated = recalculateTracks(next, new Set([trackFor(restored.poolName)]));
  await db.transaction("rw", db.summons, async () => {
    await db.summons.put(restored);
    await db.summons.bulkPut(recalculated);
  });
}

export const summonStore = {
  useSummons: useSummonRecords,
  useDeletedSummons,
  useSessions,
  import: importSummons,
  importManual: importManualSummons,
  create: createSummon,
  update: updateSummon,
  remove: softDeleteSummon,
  restore: restoreSummon,
} as const;
