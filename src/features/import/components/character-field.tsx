import type { ManualPullGroup } from "../hooks/use-manual-pull-draft";
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
  groups,
  value,
  onValueChange,
}: {
  groups: ManualPullGroup[];
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="manual-character">Character</FieldLabel>
      <Combobox items={groups} value={value} onValueChange={onValueChange}>
        <ComboboxInput id="manual-character" placeholder="Search character..." />
        <ComboboxContent>
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
