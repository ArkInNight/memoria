import { Text } from "@/components/typography";
import type { Rarity } from "@/shared";

/** Pity value styled by rarity (6★ highlighted gold, 5★ purple, rest muted). */
function PityCell({ pity, rarity }: { pity: number; rarity: Rarity }) {
  return (
    <Text
      weight={rarity === 6 ? "extrabold" : rarity === 5 ? "bold" : "normal"}
      variant={rarity === 6 ? "yellow" : rarity === 5 ? "purple" : "muted"}
      className="font-mono"
    >
      {pity}
    </Text>
  );
}

export { PityCell };
