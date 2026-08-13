import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";

function BannerField({
  options,
  itemToLabel,
  value,
  onValueChange,
}: {
  options: string[];
  itemToLabel: (value: string) => string;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="manual-banner">Banner</FieldLabel>
      <Combobox
        items={options}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={itemToLabel}
      >
        <ComboboxInput id="manual-banner" placeholder="Search banner..." />
        <ComboboxContent>
          <ComboboxEmpty>No matching banner.</ComboboxEmpty>
          <ComboboxList>
            {(name: string) => (
              <ComboboxItem key={name} value={name}>
                {itemToLabel(name)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

export { BannerField };
