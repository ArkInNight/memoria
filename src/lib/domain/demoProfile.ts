import { createProfile, discardIncompleteProfile } from "../store/profiles";
import { getActiveProfileId } from "../store/activeProfile";
import { extractPageData } from "./extractPageData";
import { importPulls } from "./importSummons";
import demoRaw from "../../../raw/ingame/summon.json";

/**
 * Seed a demo profile with bundled sample summon data so every page can be
 * explored without real game data.
 */
export async function createDemoProfile(): Promise<{ importedCount: number }> {
  const pageData = extractPageData(demoRaw);
  if (!pageData || pageData.length === 0) {
    throw new Error("Demo data is empty.");
  }
  const previousActiveId = await getActiveProfileId();
  const profile = await createProfile(
    "Demo Account",
    "Sample summon data for trying out features."
  );
  try {
    const result = await importPulls(profile.id, pageData);
    return { importedCount: result.importedCount };
  } catch (error) {
    await discardIncompleteProfile(profile.id, previousActiveId);
    throw error;
  }
}
