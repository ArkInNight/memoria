import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  Users,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProfiles,
  useActiveProfile,
  createProfile,
  renameProfile,
  updateProfileNote,
  setActive,
  deleteProfile,
} from "@/lib/store/profiles";
import { exportAll, exportProfile, downloadJson, importBackup } from "@/lib/store/exportImport";
import { importPulls } from "@/lib/domain/importSummons";
import { extractPageData } from "@/lib/domain/extractPageData";
import demoRaw from "../../../../raw/ingame/summon.json";
import { YStack, XStack, Spacer } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { ProfileCard } from "../components/profile-card";

export function ProfilesPage() {
  const profiles = useProfiles();
  const activeProfile = useActiveProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string; note: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Nama profile tidak boleh kosong.");
      return;
    }
    await createProfile(newName, newNote);
    setNewName("");
    setNewNote("");
    setCreateOpen(false);
    toast.success("Profile dibuat");
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Nama profile tidak boleh kosong.");
      return;
    }
    await renameProfile(editing.id, editing.name);
    await updateProfileNote(editing.id, editing.note);
    setEditing(null);
    toast.success("Profile diperbarui");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus profile "${name}" beserta semua summon-nya?`)) return;
    await deleteProfile(id);
    toast.success("Profile dihapus");
  };

  const handleExportProfile = async (id: string, name: string) => {
    const backup = await exportProfile(id);
    downloadJson(backup, `memoria-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
  };

  const handleExportAll = async () => {
    const backup = await exportAll();
    downloadJson(backup, `memoria-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success("Backup semua profile diunduh");
  };

  const handleImportFile = async (file: File) => {
    setIsBusy(true);
    try {
      const text = await file.text();
      const summary = await importBackup(text);
      toast.success("Import backup berhasil", {
        description: `${summary.createdProfiles} profile baru, ${summary.mergedProfiles} digabung, ${summary.summons} summon.`,
      });
    } catch (err) {
      toast.error("Import backup gagal", {
        description: err instanceof Error ? err.message : "File tidak valid.",
      });
    } finally {
      setIsBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateDemo = async () => {
    setIsBusy(true);
    try {
      const pageData = extractPageData(demoRaw);
      if (!pageData || pageData.length === 0) {
        throw new Error("Data demo kosong.");
      }
      const profile = await createProfile("Akun Demo", "Contoh data summon untuk mencoba fitur.");
      const res = await importPulls(profile.id, pageData);
      toast.success("Profile demo dibuat", {
        description: `${res.importedCount} pull contoh diimport.`,
      });
    } catch (err) {
      toast.error("Gagal membuat profile demo", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <YStack gap={24}>
      <PageHeader
        title="Profiles"
        description="Profile mewakili satu akun game. Semua data disimpan hanya di browser kamu — tanpa login."
        icon={<Users className="h-8 w-8 text-primary" />}
      />

      {/* Actions */}
      <Card className="p-4 shadow-sm">
        <XStack gap={12} className="flex-wrap">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Profile Baru</DialogTitle>
              </DialogHeader>
              <YStack gap={16}>
                <YStack gap={8}>
                  <Label>Nama profile (mis. akun utama)</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Akun Utama"
                    autoFocus
                  />
                </YStack>
                <YStack gap={8}>
                  <Label>Catatan (opsional)</Label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    placeholder="Contoh: akun sejak versi 1.0"
                  />
                </YStack>
                <Button className="w-full" onClick={handleCreate}>
                  Simpan
                </Button>
              </YStack>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleCreateDemo} disabled={isBusy}>
            {isBusy ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            Buat Profile Demo
          </Button>

          <Spacer />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Backup
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
            }}
          />
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Export Semua
          </Button>
        </XStack>
      </Card>

      {/* Profile list */}
      <Grid gap={16} md={2} lg={3}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={activeProfile?.id === profile.id}
            onSetActive={() => void setActive(profile.id)}
            onRename={() =>
              setEditing({ id: profile.id, name: profile.name, note: profile.note ?? "" })
            }
            onExport={() => void handleExportProfile(profile.id, profile.name)}
            onDelete={() => void handleDelete(profile.id, profile.name)}
          />
        ))}
        {profiles.length === 0 && (
          <Card className="p-12 col-span-full">
            <Empty className="border-0 p-0 text-center">
              <EmptyContent>
                <Text variant="muted">
                  Belum ada profile. Buat profile pertama untuk mulai mengarsipkan summon.
                </Text>
              </EmptyContent>
            </Empty>
          </Card>
        )}
      </Grid>

      {/* Rename dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Profile</DialogTitle>
          </DialogHeader>
          {editing && (
            <YStack gap={16}>
              <YStack gap={8}>
                <Label>Nama profile</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </YStack>
              <YStack gap={8}>
                <Label>Catatan (opsional)</Label>
                <Textarea
                  rows={2}
                  value={editing.note}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                />
              </YStack>
              <Button className="w-full" onClick={handleSaveEdit}>
                Simpan
              </Button>
            </YStack>
          )}
        </DialogContent>
      </Dialog>
    </YStack>
  );
}
