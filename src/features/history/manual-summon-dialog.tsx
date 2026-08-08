import { useMemo, useState } from "react";
import type { Profile, Rarity } from "@memoria/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectLabel, SelectGroup, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CHARACTERS, getAggregatedBanners } from "@/lib/domain/assets";
import { addManualPull } from "./manualPull";

const CUSTOM = "__custom__";

function localNowValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const RARITY_LABEL: Record<Rarity, string> = {
  6: "6★",
  5: "5★",
  4: "4★",
  3: "3★",
  2: "2★",
};

type RarityOption = "" | "2" | "3" | "4" | "5" | "6";

export function ManualSummonDialog(props: {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const banners = useMemo(() => getAggregatedBanners(), []);
  const charsByRarity = useMemo(() => {
    const order: Rarity[] = [6, 5, 4, 3, 2];
    const map = new Map<Rarity, string[]>();
    for (const r of order) map.set(r, []);
    for (const c of CHARACTERS) map.get(c.rarity)?.push(c.name);
    for (const list of map.values()) list.sort();
    return map;
  }, []);

  const [banner, setBanner] = useState("");
  const [customBanner, setCustomBanner] = useState("");
  const [character, setCharacter] = useState("");
  const [customCharacter, setCustomCharacter] = useState("");
  const [customRarity, setCustomRarity] = useState<RarityOption>("");
  const [summonType, setSummonType] = useState<"1" | "10">("1");
  const [createTime, setCreateTime] = useState(localNowValue);
  const [isPending, setIsPending] = useState(false);

  const reset = () => {
    setBanner("");
    setCustomBanner("");
    setCharacter("");
    setCustomCharacter("");
    setCustomRarity("");
    setSummonType("1");
    setCreateTime(localNowValue());
  };

  const handleSubmit = async () => {
    const poolName = banner === CUSTOM ? customBanner.trim() : banner;
    const name = character === CUSTOM ? customCharacter.trim() : character;

    if (!poolName) {
      toast.error("Pilih banner atau isi nama banner custom.");
      return;
    }
    if (!name) {
      toast.error("Pilih karakter atau isi nama karakter custom.");
      return;
    }
    if (character === CUSTOM && !customRarity) {
      toast.error("Pilih rarity untuk karakter custom.");
      return;
    }
    if (!createTime) {
      toast.error("Isi waktu summon.");
      return;
    }
    if (!props.profile) {
      toast.error("Buat profile dulu sebelum menambah summon.");
      return;
    }

    const rarity = character === CUSTOM ? (Number(customRarity) as Rarity) : undefined;
    const time = createTime.replace("T", " ").padEnd(19, ":00");

    setIsPending(true);
    try {
      const res = await addManualPull(props.profile.id, {
        poolName,
        name,
        rarity: rarity ?? 3,
        summonType,
        createTime: time,
      });
      toast.success("Record berhasil ditambahkan", {
        description: `${res.importedCount} summon masuk ke profile "${props.profile.name}".`,
      });
      reset();
      props.onOpenChange(false);
    } catch (err) {
      toast.error("Gagal menambah record", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Summon Manual</DialogTitle>
          <DialogDescription>
            Masukkan satu record summon ke profile aktif. Pity dihitung ulang otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Banner</Label>
            <Select value={banner} onValueChange={setBanner}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih banner" />
              </SelectTrigger>
              <SelectContent>
                {banners.map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name} {b.version ? `(${b.version})` : ""}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value={CUSTOM}>Banner lain (custom)...</SelectItem>
              </SelectContent>
            </Select>
            {banner === CUSTOM && (
              <Input
                placeholder="Nama banner custom"
                value={customBanner}
                onChange={(e) => setCustomBanner(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Karakter</Label>
            <Select value={character} onValueChange={setCharacter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih karakter" />
              </SelectTrigger>
              <SelectContent>
                {([6, 5, 4, 3, 2] as Rarity[]).map((r) => (
                  <SelectGroup key={r}>
                    <SelectLabel className="text-muted-foreground">{RARITY_LABEL[r]}</SelectLabel>
                    {charsByRarity.get(r)?.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                <SelectSeparator />
                <SelectItem value={CUSTOM}>Karakter lain (custom)...</SelectItem>
              </SelectContent>
            </Select>
            {character === CUSTOM && (
              <div className="grid gap-2">
                <Input
                  placeholder="Nama karakter custom"
                  value={customCharacter}
                  onChange={(e) => setCustomCharacter(e.target.value)}
                />
                <Select value={customRarity} onValueChange={(v) => setCustomRarity(v as RarityOption)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6★</SelectItem>
                    <SelectItem value="5">5★</SelectItem>
                    <SelectItem value="4">4★</SelectItem>
                    <SelectItem value="3">3★</SelectItem>
                    <SelectItem value="2">2★</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Tarikan</Label>
              <Select value={summonType} onValueChange={(v) => setSummonType(v as "1" | "10")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single</SelectItem>
                  <SelectItem value="10">10-pull</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Waktu</Label>
              <Input type="datetime-local" value={createTime} onChange={(e) => setCreateTime(e.target.value)} />
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Tambah Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
