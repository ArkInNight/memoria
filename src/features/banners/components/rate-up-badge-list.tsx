import { RARITY_STYLE } from "@/lib/shared";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EntityImage } from "@/components/ui/entity-image";
import { XStack, YStack } from "@/components/layout/stack";
import { Text } from "@/components/typography";

const RATE_UP_LABEL: Record<number, string> = {
  6: "Rate Up 6★",
  5: "Rate Up 5★",
};

const PILL_BASE =
  "inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5 font-semibold text-sm border-0";

/** Pill-shaped rate-up badges for a banner's featured characters. */
function RateUpBadgeList({
  names,
  rarity,
  imageUrlOf,
  showLabel = true,
  limit,
}: {
  names: string[];
  rarity: 5 | 6;
  imageUrlOf: (name: string) => string | undefined;
  showLabel?: boolean;
  limit?: number;
}) {
  if (names.length === 0) return null;

  const style = RARITY_STYLE[rarity];
  const visible = limit && names.length > limit ? names.slice(0, limit) : names;
  const hiddenCount = names.length - visible.length;

  return (
    <YStack gap={8}>
      {showLabel && (
        <Text
          size="xs"
          weight="semibold"
          variant={rarity === 6 ? "yellow" : "purple"}
          className="uppercase tracking-wider block mb-2"
        >
          {RATE_UP_LABEL[rarity]}
        </Text>
      )}
      <XStack gap={8} className="flex-wrap">
        {visible.map((name) => (
          <Badge key={name} className={cn(PILL_BASE, style.pill)}>
            <EntityImage
              name={name}
              imageUrl={imageUrlOf(name)}
              rarity={rarity}
              className="h-9 w-9 rounded-full"
            />
            {name}
          </Badge>
        ))}
        {hiddenCount > 0 && (
          <Badge className={cn(PILL_BASE, "text-muted-foreground")}>+{hiddenCount}</Badge>
        )}
      </XStack>
    </YStack>
  );
}

export { RateUpBadgeList };
