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
  id = "manual-banner",
  options,
  itemToLabel,
  value,
  onValueChange,
}: {
  id?: string;
  options: string[];
  itemToLabel: (value: string) => string;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Banner</FieldLabel>
      <Combobox
        items={options}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={itemToLabel}
      >
        <ComboboxInput id={id} placeholder="Search banner..." />
        <ComboboxContent onWheel={(e) => e.stopPropagation()} className="pointer-events-auto">
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
