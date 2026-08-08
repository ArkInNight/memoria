# 重返未来1999 灰机Wiki — Design System

Reference: 角色列表 (Character List) page, huijiwiki.com

---

## 1. Color palette

| Token            | Hex                                              | Usage                                                                                                                                 |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-base`        | `#0d0f14`                                        | Outermost page background (near-black, slight blue tint)                                                                              |
| `bg-panel`       | `rgba(20, 22, 28, 0.75)`                         | Main content container — black, **semi-transparent with backdrop blur** so the page background photo/texture shows faintly through it |
| `bg-nav`         | `#0a0b0d`                                        | Top navigation bar, solid black, no transparency                                                                                      |
| `border-panel`   | `rgba(144, 75, 16, 0.5)`                         | Thin accent border wrapping the main content panel                                                                                    |
| `primary`        | `#904b10`                                        | Headings, active tab underline, character name labels, primary accent border                                                          |
| `primary-hover`  | `#b05e15`                                        | Lighter burnt-orange for hover/active states (approx.)                                                                                |
| `text-primary`   | `#f2f0ea`                                        | Main headings, high-emphasis text                                                                                                     |
| `text-secondary` | `#9a9a9a`                                        | Body copy, nav links, filter labels                                                                                                   |
| `text-muted`     | `#6b6b6b`                                        | Timestamps, disabled/inactive filter pills                                                                                            |
| `card-bg`        | `#1a1c22`                                        | Character card base fill (behind portrait)                                                                                            |
| `card-overlay`   | `linear-gradient(transparent, rgba(0,0,0,0.85))` | Gradient scrim at bottom of card so name text stays legible                                                                           |

### Insight / element tag colors (categorical, not rarity-based)

| Element           | Color                 |
| ----------------- | --------------------- |
| 岩 (Mineral)      | `#8a6a3f` amber-brown |
| 星 (Star)         | `#3d6fa8` blue        |
| 木 (Plant)        | `#4a8f5c` green       |
| 兽 (Beast)        | `#b0473f` red         |
| 灵 (Spirit)       | `#8f5aa8` purple      |
| 智 (Intelligence) | `#7a8a94` slate       |

---

## 2. Background treatment (key signature)

The defining surface effect on this page:

```css
.panel {
  background-color: rgba(15, 15, 18, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(144, 75, 16, 0.35);
}
```

- Panel sits over a full-bleed dark photographic/illustrated background (the game's key art).
- Black fill is **not fully opaque** — roughly 70–75% opacity — so the backdrop art bleeds through faintly, especially near panel edges.
- `backdrop-filter: blur()` softens whatever is behind the glass, giving a frosted, smoked-glass feel rather than a flat black box.
- This same treatment repeats on: the main content panel, the filter bar, and card containers — creating a layered "glass over art" depth effect rather than flat dark-mode UI.

---

## 3. Typography

| Role            | Family                        | Weight  |
| --------------- | ----------------------------- | ------- |
| Display / H1    | Noto Sans SC (or system sans) | 600–700 |
| Nav / UI labels | Noto Sans SC                  | 400–500 |
| Character name  | Noto Sans SC                  | 500     |
| Body / meta     | Noto Sans SC                  | 400     |

All CJK-first; no serif anywhere. Clean, functional wiki-UI sans, not decorative.

---

## 4. Layout

- **Container**: centered content column, generous side padding, dark full-bleed background visible outside the panel.
- **Top nav**: solid black bar, logo left, nav links center-left, search bar center-right, auth buttons far right.
- **Secondary nav**: full-width strip below top nav for site sections (剧情/图鉴/游戏/etc.), left-aligned dropdowns.
- **Filter bar**: table-like rows (星级 / 灵感 / 版本 / 显示), each row = label + horizontal row of pill buttons. Active pill filled `primary`, inactive pills outlined/muted.
- **Card grid**: responsive grid, fixed-aspect vertical cards (portrait ratio, ~2:3), tight gutters (~10–12px).
- **Card anatomy**: full-bleed character art → bottom gradient scrim → name label (primary orange, centered) → small element-tag icon badge pinned top-left corner of the card.

---

## 5. Shape & elevation

- Corner radius: minimal, mostly sharp (0–4px) — cards and pills have barely-rounded corners, not soft/rounded UI.
- No drop shadows; depth comes from the blur + transparency of panels, not shadow layers.
- Borders are hairline (1px), low-opacity orange — used to _frame_ rather than _divide_.

---

## 6. Signature element

The **frosted dark glass panel** — semi-transparent black with backdrop blur over the game's key art — is the one element that makes this feel distinct from a generic dark-mode wiki. Reuse this treatment (not flat `#000`/`#111` fills) on any container that should read as "this UI floats over the game's world" rather than "this is just a dark theme."
