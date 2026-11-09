# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Big architecture and catalog overhaul (working tree, not yet committed).

### Added

- Banner catalog extended through Version 3.9 (186 → 199 banners), including
  the missed 2023 reruns `Swinging Freely 1.1` / `Whisper of the Woods 1.1`
  and the new `From the Lake's Heart 3.7` edition.
- CN ↔ EN banner name map entries for every new banner
  (`src/data/cn-en-banner-name-map.ts`).
- Banner art from the EN wiki: the seven Version 3.8 editions plus art
  backfills for `The Myth at Her Fingertips 2.8`, `Ripples on the Water 3.5`,
  `Yearning of the Water 2.4`, `Swinging Freely 1.1`, and
  `Whisper of the Woods 1.1`.
- Characters `Hedone` (3156), `Narcissus` (3157) for Version 3.9, and the
  upcoming 4.0 CN cast `Drake` (3158), `Glyndŵr` (3159),
  `Huntsworn Lilya` (3155), with their icons (135 → 138 characters).
- `tools/update.py` — single-entrypoint data pipeline replacing the legacy
  multi-file tools: `scrape` (live EN wiki → staged diffs in
  `tools/output/`), `validate` (catalog invariants + "Not Found" art list),
  and `apply` (merge into `src/data/*.ts` + copy images, never edits or
  deletes existing records).

### Changed

- Layering refactor: `src/lib` is split into flat feature-adjacent layers —
  `src/core` (pure calculations), `src/data` (static catalogs), and
  `src/stores` (UI-facing Dexie/store logic).
- Banner/character catalogs are hand-maintained TypeScript in
  `src/data/*.ts` instead of `assets/*.json` built by Python scripts.
- Banner metadata conventions: uniform `05:00` start / `04:59` end
  timestamps, and banners starting before a version boundary date count
  toward the previous version.

### Removed

- The legacy `assets/*.json` catalogs and the retired Python tools
  (`build_assets.py`, `build_banners.py`, `build_splash_metadata.py`,
  `scrape_*.py`, `migrate_banners.py`, `apply.py`, `validate_banners.py`,
  `common.py`, and their alias JSON files).

## [0.2.0] - 2026-08-13

Permanent local-first summon tracker: the archive lives entirely in the
browser, no backend involved.

### Added

- Local-first profiles on Dexie (IndexedDB) with the ported domain logic,
  including manual summon record insertion.
- Import flow for official summon history with a hardened Vercel function
  proxy (`ad12dcd`, `3ba736c`, `e87b2ca`), Node TypeScript config, and
  routing for expired-link errors.
- Share dialog and share card rendering (`html-to-image`), plus splash
  assets.
- Automatic route code splitting (`491118b`).

### Changed

- Moved the web app to the repository root and dropped the Elysia server —
  every feature is browser-only and offline-first (`3d302be`).
- Component-only UI refactor: shadcn base components with the glass style
  folded in, shared dir folded in, feature folders kept self-contained
  (`c8467d0`).
- Profile archiving, import tabs refactor, and share/splash polish
  (`7587c8a`, `552eea7`).
- README rewritten for Memoria (`90f5372`); demo profile and the bundled
  raw-data dependency removed (`7c4959d`).

## [0.1.0] - 2026-08-08

### Added

- Baseline checkpoint: Vite SPA shell, Elysia server experiment, and the
  local-first plan (`b16ec59`).

[Unreleased]: https://github.com/ArkInNight/memoria/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ArkInNight/memoria/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ArkInNight/memoria/commits/b16ec59
