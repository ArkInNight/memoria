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

export type { ImportSession };
