import { useRef } from "react";
import { UserPlus, Download, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { XStack, Spacer } from "@/components/layout/stack";

function ProfileActionsBar({
  pendingAction,
  onCreateOpen,
  onImportFile,
  onExportAll,
}: {
  pendingAction: "import" | "export" | null;
  onCreateOpen: () => void;
  onImportFile: (file: File) => Promise<void>;
  onExportAll: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="p-4 shadow-sm">
      <XStack gap={12} className="flex-wrap">
        <Button onClick={onCreateOpen}>
          <UserPlus data-icon="inline-start" />
          Create Profile
        </Button>

        <Spacer />

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={pendingAction !== null}
        >
          {pendingAction === "import" ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Upload data-icon="inline-start" />
          )}
          Import Backup
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (file) void onImportFile(file).finally(() => (input.value = ""));
          }}
        />
        <Button variant="outline" onClick={onExportAll} disabled={pendingAction !== null}>
          {pendingAction === "export" ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          Export All
        </Button>
      </XStack>
    </Card>
  );
}

export { ProfileActionsBar };
