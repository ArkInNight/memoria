import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  UserPlus, Download, Upload, Pencil, Trash2, Check, RefreshCw, Users, Database,
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
import { usePullRecords } from "@/lib/store/summons";
import { useSessions } from "@/lib/store/sessions";
import { exportAll, exportProfile, downloadJson, importBackup } from "@/lib/store/exportImport";
import { importPulls } from "@/lib/domain/importSummons";
import { extractPageData } from "@/lib/domain/extractPageData";
import demoRaw from "../../raw/ingame/summon.json";

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
});

function ProfilesPage() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Profiles
        </h2>
        <p className="text-muted-foreground mt-1">
          Profile mewakili satu akun game. Semua data disimpan hanya di browser kamu — tanpa login.
        </p>
      </div>

      {/* Actions */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama profile (mis. akun utama)</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Akun Utama"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catatan (opsional)</Label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    placeholder="Contoh: akun sejak versi 1.0"
                  />
                </div>
                <Button className="w-full" onClick={handleCreate}>
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleCreateDemo} disabled={isBusy}>
            {isBusy ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Buat Profile Demo
          </Button>

          <div className="flex-1" />

          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
            <Upload className="mr-2 h-4 w-4" />
            Import Backup
          </Button>
          <input
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
        </div>
      </Card>

      {/* Profile list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Card className="p-12 text-center col-span-full text-muted-foreground">
            Belum ada profile. Buat profile pertama untuk mulai mengarsipkan summon.
          </Card>
        )}
      </div>

      {/* Rename dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Profile</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama profile</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Catatan (opsional)</Label>
                <Textarea
                  rows={2}
                  value={editing.note}
                  onChange={(e) => setEditing({ ...editing, note: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSaveEdit}>
                Simpan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileCard(props: {
  profile: { id: string; name: string; note?: string; createdAt: string };
  isActive: boolean;
  onSetActive: () => void;
  onRename: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const pulls = usePullRecords(props.profile.id);
  const sessions = useSessions(props.profile.id);
  const sortedSessions = [...sessions].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate">{props.profile.name}</h3>
            {props.isActive && <Badge className="bg-emerald-600 text-white text-[10px] shrink-0">Aktif</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dibuat {new Date(props.profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {props.profile.note && (
        <p className="text-xs text-muted-foreground line-clamp-2">{props.profile.note}</p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          <strong className="text-foreground">{pulls.length}</strong> summon
        </span>
        <span className="text-muted-foreground">
          Import terakhir:{" "}
          <strong className="text-foreground">
            {sortedSessions[0] ? sortedSessions[0].createTime.split(" ")[0] : "—"}
          </strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border">
        {!props.isActive && (
          <Button size="sm" variant="outline" onClick={props.onSetActive}>
            <Check className="mr-1.5 h-4 w-4" />
            Aktifkan
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={props.onRename}>
          <Pencil className="mr-1.5 h-4 w-4" />
          Ubah
        </Button>
        <Button size="sm" variant="ghost" onClick={props.onExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={props.onDelete}>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Hapus
        </Button>
      </div>

      {props.isActive && (
        <Link to="/" className="text-xs text-primary hover:underline">
          Lihat dashboard profile ini →
        </Link>
      )}
    </Card>
  );
}
