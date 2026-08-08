import { db } from "./db";

const KEY = "activeProfileId";

export async function getActiveProfileId(): Promise<string | null> {
  const row = await db.settings.get(KEY);
  return row?.value ?? null;
}

export async function setActiveProfileId(id: string): Promise<void> {
  await db.settings.put({ key: KEY, value: id });
}

export async function clearActiveProfileId(): Promise<void> {
  await db.settings.delete(KEY);
}
