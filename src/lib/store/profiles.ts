import { useLiveQuery } from "dexie-react-hooks";
import type { Profile } from "@memoria/shared";
import { db } from "./db";
import { getActiveProfileId, setActiveProfileId, clearActiveProfileId } from "./activeProfile";

export function useProfiles(): Profile[] {
  return useLiveQuery(() => db.profiles.orderBy("createdAt").toArray(), []) ?? [];
}

export function useActiveProfile(): Profile | null {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").toArray();
      const activeId = await getActiveProfileId();
      return profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;
    }, []) ?? null
  );
}

export async function createProfile(name: string, note?: string): Promise<Profile> {
  const profile: Profile = {
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || "Untitled Profile",
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await db.profiles.add(profile);
  await setActiveProfileId(profile.id);
  return profile;
}

export async function renameProfile(id: string, name: string): Promise<void> {
  await db.profiles.update(id, { name: name.trim() || "Untitled Profile" });
}

export async function updateProfileNote(id: string, note?: string): Promise<void> {
  await db.profiles.update(id, { note: note?.trim() || undefined });
}

export async function setActive(id: string): Promise<void> {
  await setActiveProfileId(id);
}

export async function deleteProfile(id: string): Promise<void> {
  await db.transaction("rw", [db.profiles, db.sessions, db.summons, db.settings], async () => {
    await db.summons.where("profileId").equals(id).delete();
    await db.sessions.where("profileId").equals(id).delete();
    await db.profiles.delete(id);
    if ((await getActiveProfileId()) === id) await clearActiveProfileId();
  });
}
