import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { YStack, XStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";
import type { PityInfo } from "./use-manual-summon-draft";

function PityInfoPanel({
  pityInfo,
  manualPity,
  onManualPityChange,
}: {
  pityInfo: PityInfo | null;
  manualPity: string;
  onManualPityChange: (value: string) => void;
}) {
  return (
    <YStack gap={8} className="rounded-md border border-border bg-muted/30 px-3 py-2">
      {pityInfo ? (
        <XStack gap={12} className="items-center justify-between">
          <Text size="sm" variant="muted">
            Current pity (pool {pityInfo.group})
          </Text>
          <Text size="sm" weight="bold">
            {pityInfo.pity} summon
          </Text>
        </XStack>
      ) : (
        <Text size="sm" variant="muted">
          Select a banner to see the current pity.
        </Text>
      )}
      <XStack gap={12} className="items-center justify-between">
        <Field orientation="horizontal" className="w-auto items-center">
          <FieldLabel htmlFor="manual-pity" className="text-muted-foreground">
            Override pity (optional)
          </FieldLabel>
          <Input
            id="manual-pity"
            type="number"
            min={1}
            step={1}
            placeholder="auto"
            value={manualPity}
            onChange={(event) => onManualPityChange(event.target.value)}
            className="w-24"
          />
        </Field>
      </XStack>
    </YStack>
  );
}

export { PityInfoPanel };
