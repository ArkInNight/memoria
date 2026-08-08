import Dexie, { type Table } from "dexie";
import type { PullRecord, ImportSession, Profile } from "@/lib/shared";

/** A summon scoped to a profile (composite PK [profileId+id]). */
export interface StoredSummon extends PullRecord {
  profileId: string;
}

/** An import session scoped to a profile. */
export interface StoredSession extends ImportSession {
  profileId: string;
}

class MemoriaDB extends Dexie {
  profiles!: Table<Profile, string>;
  sessions!: Table<StoredSession, [string, string]>;
  summons!: Table<StoredSummon, [string, string]>;
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
