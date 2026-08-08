import { useLiveQuery } from "dexie-react-hooks";
import type { PullRecord } from "@/lib/shared";
import { db, type StoredSummon } from "./db";

export function useSummons(profileId: string | null | undefined): StoredSummon[] {
  return useLiveQuery(
    async () => {
      if (!profileId) return [];
      return db.summons.where("profileId").equals(profileId).toArray();
    },
    [profileId],
    []
  );
}

/** Summons of a profile as plain PullRecord values (booleans already stored as booleans). */
export function usePullRecords(profileId: string | null | undefined): PullRecord[] {
  return useSummons(profileId) as PullRecord[];
}

export async function getSummons(profileId: string): Promise<StoredSummon[]> {
  return db.summons.where("profileId").equals(profileId).toArray();
}
