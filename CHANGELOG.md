# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Pity Status Hero card at the top of the Dashboard displaying active 6★ pity counter, distance to soft pity (60), guarantee status badge (Guaranteed / 50/50), and Clear Drops cost.
- Comprehensive step-by-step import tutorial with Marconi Link Grabber one-liner commands (PowerShell & Bash), OS switcher, 1-click command copy, troubleshooting alerts, and screenshot placeholders.
- Screenshot tutorial placeholder slots under `public/images/tutorial/` with graceful fallback UI.

### Changed

- Replaced rigid active banners grid on the Dashboard with a responsive horizontal snap-scroll deck, banner type badges, and image fallback handling.
- Clarified domain labels across recent 6★ strips and share cards: changed "P{pity}" to "Pity {pity}" to eliminate confusion with character Portray counts.
- Reorganized Import page layout into a prominent top guide section followed by side-by-side import form and session logs.

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
