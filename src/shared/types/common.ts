export type Rarity = 2 | 3 | 4 | 5 | 6;

export type EntityType = "character" | "psychube";

export interface Character {
  id: number;
  name: string;
  rarity: Rarity;
  attribute: string | null;
  type: "character";
  imageUrl?: string | null;
  nameCN?: string | null;
  damage?: string | null;
  birthday?: string | null;
  tags?: string | null;
}

export interface Psychube {
  id: number;
  name: string;
  rarity: Rarity;
  type: "psychube";
  imageUrl?: string;
}
