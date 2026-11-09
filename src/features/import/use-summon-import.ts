import { useRef, useState } from "react";
import { toast } from "sonner";

import type { DraftSummon, ImportFeedback, Profile } from "@/shared";
import { summonStore } from "@/stores/summon-store";

export function useSummonImport(profile: Profile) {
  const inFlightRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<ImportFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runImport = async (parseSource: () => Promise<DraftSummon[]>): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    setIsPending(true);
    setResult(null);
    setError(null);

    try {
      const pageData = await parseSource();
      const imported = await summonStore.import(profile.id, pageData);
      const summary = {
        importedCount: imported.importedCount,
        duplicateCount: imported.duplicateCount,
      };

      setResult(summary);
      toast.success("Import successful", {
        description: `Imported ${summary.importedCount} new summons. Skipped ${summary.duplicateCount} duplicates.`,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed.";
      setError(message);
      toast.error("Import failed", { description: message });
      return false;
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
    }
  };

  return { isPending, result, error, runImport };
}
