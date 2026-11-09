import { PlusCircle, Upload } from "lucide-react";

import type { Profile } from "@/shared";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/form";
import { YStack } from "@/components/layout/stack";
import { useManualSummonDraft } from "./use-manual-summon-draft";
import { BannerField } from "./banner-field";
import { CharacterField } from "./character-field";
import { PityInfoPanel } from "./pity-info-panel";
import { DraftTable } from "./draft-table";
import { ImportResultAlerts } from "./import-result-alerts";

export function ManualInputTab({ profile }: { profile: Profile }) {
  const {
    bannerOptions,
    bannerToLabel,
    charGroups,
    banner,
    setBanner,
    character,
    setCharacter,
    manualPity,
    setManualPity,
    createTime,
    setCreateTime,
    isPending,
    draft,
    pityInfo,
    result,
    error,
    addToList,
    removeFromList,
    clearList,
    handleImport,
  } = useManualSummonDraft(profile);

  return (
    <YStack gap={16}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          addToList();
        }}
      >
        <FieldGroup>
          <BannerField
            options={bannerOptions}
            itemToLabel={bannerToLabel}
            value={banner}
            onValueChange={setBanner}
          />

          <PityInfoPanel
            pityInfo={pityInfo}
            manualPity={manualPity}
            onManualPityChange={setManualPity}
          />

          <CharacterField groups={charGroups} value={character} onValueChange={setCharacter} />

          <Field>
            <FieldLabel htmlFor="manual-create-time">Time</FieldLabel>
            <Input
              id="manual-create-time"
              type="datetime-local"
              value={createTime}
              onChange={(event) => setCreateTime(event.target.value)}
            />
          </Field>
        </FieldGroup>

        <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
          <PlusCircle data-icon="inline-start" />
          Add to List
        </Button>
      </Form>

      <DraftTable draft={draft} onRemove={removeFromList} onClear={clearList} />

      <ImportResultAlerts result={result} error={error} />

      <Button
        type="button"
        className="w-full"
        onClick={handleImport}
        disabled={isPending || draft.length === 0}
      >
        {isPending ? <Spinner data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
        Import into Profile{draft.length > 0 ? ` (${draft.length})` : ""}
      </Button>
    </YStack>
  );
}
