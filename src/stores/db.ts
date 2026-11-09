import Dexie, { type Table } from "dexie";
import type { SummonRecord, ImportSession, Profile } from "@/shared";

/** A summon scoped to a profile (composite PK [profileId+id]). */
export interface StoredSummonRecord extends SummonRecord {
  profileId: string;
}

/** An import session scoped to a profile. */
export interface StoredImportSession extends ImportSession {
  profileId: string;
}

class MemoriaDB extends Dexie {
  profiles!: Table<Profile, string>;
  sessions!: Table<StoredImportSession, [string, string]>;
  summons!: Table<StoredSummonRecord, [string, string]>;
  settings!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("memoria");
    this.version(1).stores({
      profiles: "id",
      sessions: "[profileId+id], profileId, createTime",
      summons: "[profileId+id], profileId, poolName, rarity, createTime",
    });
    this.version(2).stores({
      profiles: "id, createdAt",
      sessions: "[profileId+id], profileId, createTime",
      summons: "[profileId+id], profileId, poolName, rarity, createTime",
    });
    this.version(3).stores({
      profiles: "id, createdAt",
      sessions: "[profileId+id], profileId, createTime",
      summons: "[profileId+id], profileId, poolName, rarity, createTime",
      settings: "key",
    });
  }
}

export const db = new MemoriaDB();
