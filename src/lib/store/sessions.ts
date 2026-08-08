import { useLiveQuery } from "dexie-react-hooks";
import type { ImportSession } from "@/lib/shared";
import { db, type StoredSession } from "./db";

export function useSessions(profileId: string | null | undefined): StoredSession[] {
  return useLiveQuery(
    async () => {
      if (!profileId) return [];
      return db.sessions.where("profileId").equals(profileId).toArray();
    },
    [profileId],
    []
  );
}

export async function getSessions(profileId: string): Promise<StoredSession[]> {
  return db.sessions.where("profileId").equals(profileId).toArray();
}

export function useLastImportTime(profileId: string | null | undefined): string | null {
  const sessions = useSessions(profileId);
  const sorted = [...sessions].sort((a, b) => b.createTime.localeCompare(a.createTime));
  return sorted[0]?.createTime ?? null;
}

export type { ImportSession };
