import type { Profile, PullRecord, ImportSession } from "@/lib/shared";
import { db, type StoredSession, type StoredSummon } from "./db";

export interface BackupFile {
  app: "memoria";
  version: 1;
  exportedAt: string;
  profiles: Profile[];
  sessions: StoredSession[];
  summons: StoredSummon[];
}

export interface ImportSummary {
  createdProfiles: number;
  mergedProfiles: number;
  summons: number;
  duplicateSummons: number;
}

export async function exportAll(): Promise<BackupFile> {
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

export async function exportProfile(profileId: string): Promise<BackupFile> {
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

export function downloadJson(data: unknown, filename: string): void {
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

export async function importBackup(text: string): Promise<ImportSummary> {
  const parsed = JSON.parse(text) as BackupFile;
  if (!parsed || parsed.app !== "memoria" || parsed.version !== 1) {
    throw new Error("Bukan file backup Memoria yang valid.");
  }
  if (
    !Array.isArray(parsed.profiles) ||
    !Array.isArray(parsed.sessions) ||
    !Array.isArray(parsed.summons)
  ) {
    throw new Error("Struktur file backup tidak lengkap.");
  }

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

export type { PullRecord, ImportSession };
