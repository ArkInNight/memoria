# Memoria

Memoria is a local-first summon tracker for **Reverse: 1999**. It keeps a permanent archive of your summon history beyond the game's limited history period.

## Features

- Import summon history from URL or JSON
- Record summons manually
- Track pity, guarantees, rate-up wins, and banner history
- Manage multiple profiles
- Archive and restore local data
- Generate shareable summon cards

All data is stored locally in your browser using IndexedDB. Memoria has no backend and does not upload your summon history.

## Development

Requires [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Other commands:

```bash
bun run build
bun run lint
bun run format
```

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, TanStack Router, Dexie, and shadcn/ui.

## Sources and Inspiration

Game and banner data references:

- [Prydwen — Reverse: 1999 CN Banner History](https://www.prydwen.gg/re1999/guides/banner-history-cn)
- [Reverse: 1999 Wiki (English)](https://reverse1999.fandom.com/wiki/Reverse:_1999_Wiki)
- [Reverse: 1999 Wiki (Chinese)](https://res1999.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5)

Project inspiration:

- [Timekeeper](https://timekeeper.top/)
- [Kornblume](https://windbow27.github.io/kornblume/)

The source code for Memoria is available on [GitHub](https://github.com/ArkInNight/memoria).
