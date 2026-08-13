import { Text } from "@/components/typography";

/** Pity value styled by rarity (6★ highlighted gold, 5★ purple, rest muted). */
function PityCell({ pity, rarity }: { pity: number; rarity: number }) {
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
