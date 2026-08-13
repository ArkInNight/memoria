import { useLiveQuery } from "dexie-react-hooks";
import type { Profile } from "@/lib/shared";
import { db } from "./db";
import { getActiveProfileId, setActiveProfileId, clearActiveProfileId } from "./activeProfile";

export function useProfiles(): Profile[] {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").toArray();
      return profiles.filter((profile) => !profile.archivedAt);
    }, []) ?? []
  );
}

export function useArchivedProfiles(): Profile[] {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").reverse().toArray();
      return profiles.filter((profile) => Boolean(profile.archivedAt));
    }, []) ?? []
  );
}

export function useActiveProfile(): Profile | null {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").toArray();
      const activeProfiles = profiles.filter((profile) => !profile.archivedAt);
      const activeId = await getActiveProfileId();
      return activeProfiles.find((profile) => profile.id === activeId) ?? activeProfiles[0] ?? null;
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

export async function updateProfile(id: string, name: string, note?: string): Promise<void> {
  await db.profiles.update(id, {
    name: name.trim() || "Untitled Profile",
    note: note?.trim() || undefined,
  });
}

export async function setActive(id: string): Promise<void> {
  const profile = await db.profiles.get(id);
  if (!profile || profile.archivedAt) throw new Error("Archived profiles cannot be activated.");
  await setActiveProfileId(id);
}

export async function archiveProfile(id: string): Promise<void> {
  await db.transaction("rw", [db.profiles, db.settings], async () => {
    await db.profiles.update(id, { archivedAt: new Date().toISOString() });
    if ((await getActiveProfileId()) !== id) return;

    const profiles = await db.profiles.orderBy("createdAt").toArray();
    const fallback = profiles.find((profile) => profile.id !== id && !profile.archivedAt);
    if (fallback) await setActiveProfileId(fallback.id);
    else await clearActiveProfileId();
  });
}

export async function restoreProfile(id: string): Promise<void> {
  await db.profiles.update(id, { archivedAt: undefined });
}
