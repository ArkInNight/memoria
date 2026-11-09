import { AlertTriangle, CheckCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Strong } from "@/components/typography";
import type { ImportFeedback } from "@/shared";

function ImportResultAlerts({
  result,
  error,
}: {
  result: ImportFeedback | null;
  error?: string | null;
}) {
  return (
    <>
      {result && (
        <Alert className="border-success/25 bg-success/10 text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Import Complete</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            Successfully merged <Strong>{result.importedCount}</Strong> new summons. Skipped{" "}
            {result.duplicateCount} duplicates.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle className="font-semibold">Import Error</AlertTitle>
          <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

export { ImportResultAlerts };
