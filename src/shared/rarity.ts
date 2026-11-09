import type { Rarity } from "./types";

export interface RarityStyle {
  badge: string;
  pill: string;
  text: string;
  gradient: string;
  /** Hex color for charts and share cards. */
  hex: string;
}

/**
 * Single source of truth for rarity styling. Consumed by EntityImage
 * (gradients), badges, pity cells, and rate-up pills so colors stay consistent.
 */
export const RARITY_STYLE: Record<Rarity, RarityStyle> = {
  6: {
    badge: "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold",
    pill: "bg-yellow-500/90 hover:bg-yellow-600 text-black",
    text: "text-[color:var(--rarity-6-text)]",
    gradient: "from-amber-400 via-amber-600 to-yellow-800",
    hex: "#eab308",
  },
  5: {
    badge: "bg-purple-600 hover:bg-purple-700 text-white font-semibold",
    pill: "bg-purple-600 hover:bg-purple-700 text-white",
    text: "text-[color:var(--rarity-5-text)]",
    gradient: "from-purple-400 via-purple-600 to-violet-900",
    hex: "#a855f7",
  },
  4: {
    badge: "bg-blue-500 hover:bg-blue-600 text-white font-semibold",
    pill: "bg-blue-500 hover:bg-blue-600 text-white",
    text: "text-[color:var(--rarity-4-text)]",
    gradient: "from-blue-400 via-blue-600 to-indigo-900",
    hex: "#3b82f6",
  },
  3: {
    badge: "",
    pill: "",
    text: "text-slate-500",
    gradient: "from-slate-400 via-slate-600 to-slate-800",
    hex: "#64748b",
  },
  2: {
    badge: "",
    pill: "",
    text: "text-zinc-500",
    gradient: "from-zinc-500 via-zinc-700 to-zinc-900",
    hex: "#71717a",
  },
};

export const RARITY_ORDER: Rarity[] = [6, 5, 4, 3, 2];

/** Display labels for rarity pickers/selects. */
export const RARITY_LABEL: Record<Rarity, string> = {
  6: "6 Star",
  5: "5 Star",
  4: "4 Star",
  3: "3 Star",
  2: "2 Star",
};

export function isRarity(value: unknown): value is Rarity {
  return value === 2 || value === 3 || value === 4 || value === 5 || value === 6;
}

/** Fallback style for unknown/zero rarity. */
export function rarityStyle(rarity: number | undefined | null): RarityStyle {
  return RARITY_STYLE[(rarity as Rarity) ?? 3] ?? RARITY_STYLE[3];
}
