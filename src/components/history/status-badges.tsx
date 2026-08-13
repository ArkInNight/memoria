import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/typography";
import { rarityStyle } from "@/lib/shared";
import { cn } from "@/lib/utils";

/** Colored rarity badge for a pull row. */
function RarityBadge({ rarity }: { rarity: number }) {
  const style = rarityStyle(rarity);
  if (!style.badge) {
    return (
      <Badge variant="outline" className="font-semibold">
        {rarity}★
      </Badge>
    );
  }
  return <Badge className={cn(style.badge)}>{rarity}★</Badge>;
}

/** Rate ON / Rate OFF / unknown indicator. */
function RateOnBadge({ rateOn }: { rateOn: boolean | null }) {
  if (rateOn === true) {
    return <Badge className="bg-success text-success-foreground text-xs">Rate ON</Badge>;
  }
  if (rateOn === false) {
    return (
      <Badge variant="destructive" className="text-xs">
        Rate OFF
      </Badge>
    );
  }
  return <Text variant="muted">-</Text>;
}

/** Guarantee state badge (only meaningful for 6★ pulls). */
function GuaranteeBadge({ guaranteed, rarity }: { guaranteed: boolean | null; rarity: number }) {
  if (rarity !== 6) return <Text variant="muted">-</Text>;
  if (guaranteed === true) {
    return <Badge className="bg-info text-info-foreground text-xs">Guaranteed</Badge>;
  }
  if (guaranteed === null) return <Text variant="muted">Unknown</Text>;
  return (
    <Badge variant="outline" className="text-xs">
      50/50
    </Badge>
  );
}

export { RarityBadge, RateOnBadge, GuaranteeBadge };
