import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { YStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Text } from "@/components/typography";
import { Heading } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { profileStore } from "@/stores/profile-store";
import { backupStore } from "@/stores/backup-store";
import { ProfileCard } from "./profile-card";
import { ProfileActionsBar } from "./profile-actions-bar";
import { CreateProfileDialog } from "./create-profile-dialog";
import { EditProfileDialog, type ProfileEditState } from "./edit-profile-dialog";
import { ArchiveProfileDialog } from "./archive-profile-dialog";

export function ProfilesPage() {
  const profiles = profileStore.useProfiles();
  const archivedProfiles = profileStore.useArchivedProfiles();
  const activeProfile = profileStore.useActiveProfile();

  const [createOpen, setCreateOpen] = useState(false);
  const [createEpoch, setCreateEpoch] = useState(0);
  const [editing, setEditing] = useState<ProfileEditState | null>(null);
  const [archiving, setArchiving] = useState<{ id: string; name: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<"import" | "export" | null>(null);

  const handleCreate = async (name: string, note: string): Promise<boolean> => {
    if (!name.trim()) {
      toast.error("Profile name cannot be empty.");
      return false;
    }
    try {
      await profileStore.create(name, note);
      toast.success("Profile created");
      return true;
    } catch (error) {
      toast.error("Profile creation failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
      return false;
    }
  };

  const handleSaveEdit = async (state: ProfileEditState): Promise<boolean> => {
    if (!state.name.trim()) {
      toast.error("Profile name cannot be empty.");
      return false;
    }
    try {
      await profileStore.update(state.id, state.name, state.note);
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
      return false;
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await profileStore.archive(id);
      toast.success("Profile archived");
    } catch (error) {
      toast.error("Profile archive failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await profileStore.restore(id);
      toast.success("Profile restored");
    } catch (error) {
      toast.error("Profile restore failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleExportProfile = async (id: string, name: string) => {
    try {
      const backup = await backupStore.exportProfile(id);
      backupStore.download(
        backup,
        `memoria-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`
      );
    } catch (error) {
      toast.error("Profile export failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleExportAll = async () => {
    setPendingAction("export");
    try {
      const backup = await backupStore.exportAll();
      backupStore.download(backup, `memoria-backup-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("All profiles backed up");
    } catch (error) {
      toast.error("Backup export failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleImportFile = async (file: File) => {
    setPendingAction("import");
    try {
      const text = await file.text();
      const summary = await backupStore.import(text);
      toast.success("Backup import successful", {
        description: `${summary.createdProfiles} new profiles, ${summary.mergedProfiles} merged, ${summary.summons} new summons, ${summary.duplicateSummons} duplicates skipped.`,
      });
    } catch (err) {
      toast.error("Backup import failed", {
        description: err instanceof Error ? err.message : "Invalid file.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <YStack gap={24}>
      <PageHeader
        title="Profiles"
        description="A profile represents one game account. All data is stored only in your browser — no login."
        icon={<Users className="h-8 w-8 text-primary" />}
      />

      <ProfileActionsBar
        pendingAction={pendingAction}
        onCreateOpen={() => {
          setCreateEpoch((e) => e + 1);
          setCreateOpen(true);
        }}
        onImportFile={handleImportFile}
        onExportAll={() => void handleExportAll()}
      />

      <Grid gap={16} md={2} lg={3}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={activeProfile?.id === profile.id}
            onSetActive={() =>
              void profileStore.setActive(profile.id).catch((error) => toast.error(error.message))
            }
            onRename={() =>
              setEditing({ id: profile.id, name: profile.name, note: profile.note ?? "" })
            }
            onExport={() => void handleExportProfile(profile.id, profile.name)}
            onArchive={() => setArchiving({ id: profile.id, name: profile.name })}
            onRestore={() => undefined}
            isArchived={false}
          />
        ))}
        {profiles.length === 0 && (
          <Card className="p-12 col-span-full">
            <Empty className="border-0 p-0 text-center">
              <EmptyContent>
                <Text variant="muted">
                  No profiles yet. Create your first profile to start archiving summons.
                </Text>
              </EmptyContent>
            </Empty>
          </Card>
        )}
      </Grid>

      {archivedProfiles.length > 0 && (
        <Section gap={16}>
          <Heading level={2}>Archived Profiles</Heading>
          <Grid gap={16} md={2} lg={3}>
            {archivedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={false}
                isArchived
                onSetActive={() => undefined}
                onRename={() => undefined}
                onExport={() => void handleExportProfile(profile.id, profile.name)}
                onArchive={() => undefined}
                onRestore={() => void handleRestore(profile.id)}
              />
            ))}
          </Grid>
        </Section>
      )}

      <CreateProfileDialog
        key={createEpoch}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <EditProfileDialog
        key={editing?.id ?? "none"}
        editing={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleSaveEdit}
      />

      <ArchiveProfileDialog
        profileName={archiving?.name ?? null}
        onClose={() => setArchiving(null)}
        onConfirm={() => {
          if (archiving) void handleArchive(archiving.id);
          setArchiving(null);
        }}
      />
    </YStack>
  );
}
