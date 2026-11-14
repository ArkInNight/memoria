import { isRarity, type ImportSession, type Profile, type SummonRecord } from "@/shared";
import { db, type StoredImportSession, type StoredSummonRecord } from "./db";

interface BackupFile {
  app: "memoria";
  version: 1;
  exportedAt: string;
  profiles: Profile[];
  sessions: StoredImportSession[];
  summons: StoredSummonRecord[];
}

interface ImportSummary {
  createdProfiles: number;
  mergedProfiles: number;
  summons: number;
  duplicateSummons: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string" &&
    (value.note === undefined || typeof value.note === "string") &&
    (value.archivedAt === undefined || typeof value.archivedAt === "string")
  );
}

function isImportSession(value: unknown): value is ImportSession {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.createTime === "string" &&
    typeof value.importedCount === "number" &&
    typeof value.duplicateCount === "number" &&
    typeof value.failedCount === "number"
  );
}

function isSummonRecord(value: unknown): value is SummonRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.poolName === "string" &&
    typeof value.poolType === "number" &&
    (value.summonType === "1" || value.summonType === "10") &&
    typeof value.name === "string" &&
    isRarity(value.rarity) &&
    (value.type === "character" || value.type === "psychube") &&
    typeof value.createTime === "string" &&
    typeof value.pity === "number" &&
    (typeof value.rateOn === "boolean" || value.rateOn === null) &&
    (typeof value.guaranteed === "boolean" || value.guaranteed === null) &&
    typeof value.importSessionId === "string"
  );
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!isRecord(value)) return false;
  return (
    value.app === "memoria" &&
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    Array.isArray(value.profiles) &&
    value.profiles.every(isProfile) &&
    Array.isArray(value.sessions) &&
    value.sessions.every(
      (session) =>
        isImportSession(session) && isRecord(session) && typeof session.profileId === "string"
    ) &&
    Array.isArray(value.summons) &&
    value.summons.every(
      (summon) => isSummonRecord(summon) && isRecord(summon) && typeof summon.profileId === "string"
    )
  );
}

async function exportAll(): Promise<BackupFile> {
  const [profiles, sessions, summons] = await Promise.all([
    db.profiles.toArray(),
    db.sessions.toArray(),
    db.summons.toArray(),
  ]);
  return {
    app: "memoria",
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles,
    sessions,
    summons,
  };
}

async function exportProfile(profileId: string): Promise<BackupFile> {
  const [profiles, sessions, summons] = await Promise.all([
    db.profiles.toArray(),
    db.sessions.where("profileId").equals(profileId).toArray(),
    db.summons.where("profileId").equals(profileId).toArray(),
  ]);
  return {
    app: "memoria",
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles: profiles.filter((p) => p.id === profileId),
    sessions,
    summons,
  };
}

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importBackup(text: string): Promise<ImportSummary> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Backup file is not valid JSON.");
  }
  if (!isBackupFile(value)) {
    throw new Error("Not a valid Memoria backup file.");
  }
  const parsed = value;

  let createdProfiles = 0;
  let mergedProfiles = 0;
  let summonsCount = 0;
  let duplicateSummons = 0;

  await db.transaction("rw", [db.profiles, db.sessions, db.summons], async () => {
    for (const p of parsed.profiles) {
      const exists = await db.profiles.get(p.id);
      const incomingSummons = parsed.summons.filter((s) => s.profileId === p.id);
      const incomingSessions = parsed.sessions.filter((s) => s.profileId === p.id);

      const uniqueSummons = [
        ...new Map(incomingSummons.map((summon) => [summon.id, summon])).values(),
      ];
      const uniqueSessions = [
        ...new Map(incomingSessions.map((session) => [session.id, session])).values(),
      ];
      const summonKeys = uniqueSummons.map((summon) => [p.id, summon.id] as [string, string]);
      const sessionKeys = uniqueSessions.map((session) => [p.id, session.id] as [string, string]);
      const [storedSummons, storedSessions] = await Promise.all([
        db.summons.bulkGet(summonKeys),
        db.sessions.bulkGet(sessionKeys),
      ]);
      const newSummons = uniqueSummons.filter((_, index) => !storedSummons[index]);
      const newSessions = uniqueSessions.filter((_, index) => !storedSessions[index]);

      if (exists) {
        mergedProfiles++;
      } else {
        await db.profiles.add({
          id: p.id,
          name: p.name,
          note: p.note,
          createdAt: p.createdAt,
          archivedAt: p.archivedAt,
        });
        createdProfiles++;
      }

      if (newSummons.length > 0) {
        await db.summons.bulkAdd(newSummons.map((summon) => ({ ...summon, profileId: p.id })));
      }
      if (newSessions.length > 0) {
        await db.sessions.bulkAdd(newSessions.map((session) => ({ ...session, profileId: p.id })));
      }
      summonsCount += newSummons.length;
      duplicateSummons += uniqueSummons.length - newSummons.length;
    }
  });

  return { createdProfiles, mergedProfiles, summons: summonsCount, duplicateSummons };
}

export const backupStore = {
  exportAll,
  exportProfile,
  download: downloadJson,
  import: importBackup,
} as const;
