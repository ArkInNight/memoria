import { useLiveQuery } from "dexie-react-hooks";
import type { Profile } from "@/shared";
import { db } from "./db";

const ACTIVE_PROFILE_KEY = "activeProfileId";

async function getActiveProfileId(): Promise<string | null> {
  const row = await db.settings.get(ACTIVE_PROFILE_KEY);
  return row?.value ?? null;
}

async function setActiveProfileId(id: string): Promise<void> {
  await db.settings.put({ key: ACTIVE_PROFILE_KEY, value: id });
}

async function clearActiveProfileId(): Promise<void> {
  await db.settings.delete(ACTIVE_PROFILE_KEY);
}

function useProfiles(): Profile[] {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").toArray();
      return profiles.filter((profile) => !profile.archivedAt);
    }, []) ?? []
  );
}

function useArchivedProfiles(): Profile[] {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").reverse().toArray();
      return profiles.filter((profile) => Boolean(profile.archivedAt));
    }, []) ?? []
  );
}

function useActiveProfile(): Profile | null {
  return (
    useLiveQuery(async () => {
      const profiles = await db.profiles.orderBy("createdAt").toArray();
      const activeProfiles = profiles.filter((profile) => !profile.archivedAt);
      const activeId = await getActiveProfileId();
      return activeProfiles.find((profile) => profile.id === activeId) ?? activeProfiles[0] ?? null;
    }, []) ?? null
  );
}

async function createProfile(name: string, note?: string): Promise<Profile> {
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

async function updateProfile(id: string, name: string, note?: string): Promise<void> {
  await db.profiles.update(id, {
    name: name.trim() || "Untitled Profile",
    note: note?.trim() || undefined,
  });
}

async function setActive(id: string): Promise<void> {
  const profile = await db.profiles.get(id);
  if (!profile || profile.archivedAt) throw new Error("Archived profiles cannot be activated.");
  await setActiveProfileId(id);
}

async function archiveProfile(id: string): Promise<void> {
  await db.transaction("rw", [db.profiles, db.settings], async () => {
    await db.profiles.update(id, { archivedAt: new Date().toISOString() });
    if ((await getActiveProfileId()) !== id) return;

    const profiles = await db.profiles.orderBy("createdAt").toArray();
    const fallback = profiles.find((profile) => profile.id !== id && !profile.archivedAt);
    if (fallback) await setActiveProfileId(fallback.id);
    else await clearActiveProfileId();
  });
}

async function restoreProfile(id: string): Promise<void> {
  await db.profiles.update(id, { archivedAt: undefined });
}

export const profileStore = {
  useProfiles,
  useArchivedProfiles,
  useActiveProfile,
  create: createProfile,
  update: updateProfile,
  setActive,
  archive: archiveProfile,
  restore: restoreProfile,
} as const;
