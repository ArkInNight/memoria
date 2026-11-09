import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { BannerField } from "@/features/import/banner-field";
import { CharacterField } from "@/features/import/character-field";
import type { ManualSummonGroup } from "@/features/import/use-manual-summon-draft";
import { catalogStore } from "@/stores/catalog-store";
import { summonStore } from "@/stores/summon-store";
import type { Profile, SummonInput, SummonRecord } from "@/shared";
import { RARITY_LABEL, RARITY_ORDER } from "@/shared";

function toDateTimeLocal(value?: string): string {
  if (value) return value.replace(" ", "T").slice(0, 16);
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toSummonTime(value: string): string {
  return value.replace("T", " ").padEnd(19, ":00");
}

function SummonRecordDialog({
  profile,
  summon,
  open,
  onOpenChange,
}: {
  profile: Profile;
  summon: SummonRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const runs = useMemo(() => catalogStore.getBannerInstances(), []);
  const instanceById = useMemo(() => new Map(runs.map((run) => [run.instanceId, run])), [runs]);
  const characterGroups = useMemo<ManualSummonGroup[]>(
    () =>
      RARITY_ORDER.map((rarity) => ({
        value: RARITY_LABEL[rarity],
        items: catalogStore.characters
          .filter((character) => character.rarity === rarity)
          .map((character) => character.name)
          .sort(),
      })),
    []
  );

  const [bannerRunId, setBannerRunId] = useState<string | null>(
    summon ? (catalogStore.getInstanceForSummon(summon)?.instanceId ?? null) : null
  );
  const [characterName, setCharacterName] = useState<string | null>(summon?.name ?? null);
  const [createTime, setCreateTime] = useState(() => toDateTimeLocal(summon?.createTime));
  const [summonType, setSummonType] = useState<"1" | "10">(summon?.summonType ?? "1");
  const [pityOverride, setPityOverride] = useState(
    summon?.pityOverride != null ? String(summon.pityOverride) : ""
  );
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const run = bannerRunId ? instanceById.get(bannerRunId) : undefined;
    const character = catalogStore.characters.find((item) => item.name === characterName);
    if (!run || !characterName || !character || !createTime) {
      toast.error("Banner, character, and summon time are required.");
      return;
    }

    let parsedOverride: number | undefined;
    if (pityOverride.trim()) {
      parsedOverride = Number(pityOverride);
      if (!Number.isInteger(parsedOverride) || parsedOverride < 1) {
        toast.error("Pity override must be a whole number of 1 or greater.");
        return;
      }
    }

    const input: SummonInput = {
      poolName: run.name,
      poolInstanceId: run.instanceId,
      name: characterName,
      rarity: character.rarity,
      summonType,
      createTime: toSummonTime(createTime),
      pityOverride: parsedOverride,
    };

    setIsPending(true);
    try {
      if (summon) await summonStore.update(profile.id, summon.id, input);
      else await summonStore.create(profile.id, input);
      toast.success(summon ? "Summon updated" : "Summon added");
      onOpenChange(false);
    } catch (error) {
      toast.error(summon ? "Summon update failed" : "Summon creation failed", {
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{summon ? "Edit Summon" : "Add Summon"}</DialogTitle>
          <DialogDescription>
            Pity, rate-up, and guarantee states are recalculated when this record is saved.
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <BannerField
              id="summon-record-banner"
              options={runs.map((run) => run.instanceId)}
              itemToLabel={(value) => {
                const run = instanceById.get(value);
                return run ? catalogStore.getInstanceLabel(run) : value;
              }}
              value={bannerRunId}
              onValueChange={setBannerRunId}
            />
            <CharacterField
              id="summon-record-character"
              groups={characterGroups}
              value={characterName}
              onValueChange={setCharacterName}
            />
            <Field>
              <FieldLabel htmlFor="summon-record-time">Time</FieldLabel>
              <Input
                id="summon-record-time"
                type="datetime-local"
                value={createTime}
                onChange={(event) => setCreateTime(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="summon-record-type">Summon Type</FieldLabel>
              <Select
                value={summonType}
                onValueChange={(value) => setSummonType(value as "1" | "10")}
              >
                <SelectTrigger id="summon-record-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">Single</SelectItem>
                    <SelectItem value="10">10-summon</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="summon-record-pity">Pity Override</FieldLabel>
              <Input
                id="summon-record-pity"
                type="number"
                min={1}
                step={1}
                placeholder="Auto"
                value={pityOverride}
                onChange={(event) => setPityOverride(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {summon ? "Save Changes" : "Add Summon"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { SummonRecordDialog };
