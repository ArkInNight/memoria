import type { ManualSummonGroup } from "./use-manual-summon-draft";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";

function CharacterField({
  id = "manual-character",
  groups,
  value,
  onValueChange,
}: {
  id?: string;
  groups: ManualSummonGroup[];
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Character</FieldLabel>
      <Combobox items={groups} value={value} onValueChange={onValueChange}>
        <ComboboxInput id={id} placeholder="Search character..." />
        <ComboboxContent onWheel={(e) => e.stopPropagation()} className="pointer-events-auto">
          <ComboboxEmpty>No matching character.</ComboboxEmpty>
          <ComboboxList>
            {(group, i) => (
              <div key={group.value}>
                {i > 0 && <ComboboxSeparator />}
                <ComboboxGroup items={group.items}>
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(name: string) => (
                      <ComboboxItem key={name} value={name}>
                        {name}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              </div>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

export { CharacterField };
