# Memoria data tools

Python tools that turn the messy raw sources in `raw/` into the tidy JSON files
the app consumes. They write their data in the same format and stage everything
into `tools/output/` first.

> **Banner data is hand-maintained now.** The one-time migration
> `tools/migrate_banners.py` produced the per-edition catalog
> (`assets/banners.json`); from here on it is edited by hand and checked with
> `tools/validate_banners.py`. The old builders (`build_assets.py`,
> `build_banners.py`) are retired.

## Setup

```bash
python3 -m venv tools/.venv
tools/.venv/bin/pip install -r tools/requirements.txt
```

## Layout

```
tools/
  common.py            # shared helpers: fetch, JSON I/O, image download, mirror
  migrate_banners.py   # ONE-TIME migration: raw/prydwen/GB.json + old catalog -> per-edition banners (stages to output/ only)
  validate_banners.py  # invariant checks for assets/banners.json + in-game pool join coverage
  build_assets.py      # RETIRED character data builder (kept for reference)
  build_banners.py     # RETIRED banner data builder (kept for reference)
  apply.py             # explicit publish step: output/ -> assets/ + web/public/
  aliases.json         # character name-normalization map wiki <-> github
  banner-aliases.json  # manual overrides + EN-name bridges for banners
  requirements.txt     # beautifulsoup4
  output/              # staging dir for every tool result (see Outputs)
  README.md
```

## Sources (see raw/*/README.md)

| Source | Provides |
| --- | --- |
| `raw/github/characters.json` | character id + CN/EN names only |
| wiki Crew Members page | rarity, afflatus, damage, tags, birthday, age, **icon image** |
| global banner wiki (Summons) | canonical EN names, dates, official art, featured characters |
| CN banner wiki (征集系统) | **cn -> en name pairs only** (pool-name mapping) |

The wiki pages are fetched **live** on every run so they stay up to date (the
raw Crew Members page is Cloudflare-blocked; use the MediaWiki API
`https://reverse1999.fandom.com/api.php?action=parse&page=Crew_Members&prop=text&format=json`).
Banner data comes from the EN wiki **only**; the CN wiki contributes nothing
but the name map used to attach the user's pools to English banners.

## Usage

Run from the repo root:

```bash
tools/.venv/bin/python3 tools/migrate_banners.py   # one-time banner migration -> tools/output/banners.json
python3 tools/validate_banners.py                  # validate assets/banners.json + in-game pool coverage
tools/.venv/bin/python3 tools/apply.py --dry-run   # preview what gets published
tools/.venv/bin/python3 tools/apply.py             # publish into assets/ + web/public/
```

**The tools never touch the app folders directly.** They only stage into
`tools/output/`; review the results there, then publish explicitly with
`apply.py` (which also removes stale mirrored images). If the builders have
been run before, `apply.py` reports `unchanged` and does nothing.

## Outputs

Everything lands in `tools/output/` **first** (staging, for observation):

- `tools/output/wiki-en-characters.json` — parsed wiki character catalog
- `tools/output/characters.json` — merged character list (the file `apply.py`
  copies to `assets/characters.json`)
- `tools/output/wiki-en-banners.json` — parsed EN banner catalog
- `tools/output/wiki-cn-en-name-map.json` — cn name -> en name mapping
- `tools/output/banners.json` — staged output of `migrate_banners.py` (review,
  then copy to `assets/banners.json`)
- `tools/output/images/characters/{name}.webp` — wiki character icons (keyed
  by the character name)
- `tools/output/images/banners/{id}.webp` — EN banner art (keyed by banner id)

`apply.py` publishes them to:

- `assets/characters.json` — tidy character list matching the app's
  `Character` type: `id`, `name`, `nameCN`, `type`, `rarity`, `attribute`,
  `damage`, `birthday`, `tags`, `imageUrl`.
- `assets/banners.json` — **hand-maintained** catalog, one record per banner
  edition/run (see "Banner data model" below).
- `web/public/images/characters/` — mirrored icons (synced, stale removed)
- `web/public/images/banners/` — mirrored art (synced, stale removed)

Characters and banners share the same record layout: identity `id`, `name`,
`nameCN`, `type`, then dataset-specific fields, always ending with `imageUrl`;
both files are sorted by `name`.

## Banner data model

One record per **banner edition** (a single run of a banner, keyed by
`name` + `version`, e.g. `Ripples on the Water` runs once per version).
`assets/banners.json` is generated **once** by `tools/migrate_banners.py` from:

- `raw/prydwen/GB.json` — authoritative per-run source (Prydwen banner history,
  Global server): name, version, dates, rate-ups, Prydwen banner type.
- the previous aggregated `assets/banners.json` — `nameCN` and `imageUrl`.
- `tools/output/wiki-cn-en-name-map.json` — CN-name fallback.
- `assets/characters.json` — canonical English character names (rate-up names
  are normalized against it; e.g. `Ezio` -> `Ezio Auditore`).

Record fields (see `Banner` in `shared/src/types.ts`):

- `name`, `nameCN`, `type`, `version`, `startDate`/`endDate`
  (uniform `05:00:00` / `04:59:00`, or `null` for permanent banners),
  `rateUp6Star`/`rateUp5Star` (canonical English names), `imageUrl`.
- Mechanic fields (`pityPool`, `carryOver`, `rateUp`, `selector`, `pullCap`,
  `milestoneCopies`, `hardPity`) are **optional per-record overrides**. The
  defaults live in `assets/banner-rules.json`, keyed by `type` — so `type` is
  the display label while the pity mechanics are data-driven.

`type` maps from Prydwen's banner types:

| Prydwen (GB) | our `type` |
| --- | --- |
| Debut | `debut` |
| Rerun | `rerun` |
| Limited | `exclusive` |
| Collab | `collaboration` |
| Ripples | `ripples` |
| Yearning | `yearning` |
| Beginner | `beginner` |
| Standard | `standard` |
| Event | keyword-derived: Promise/Abundance/From the Lake's Heart -> `lake-promise`, Revelation -> `lake-revelation`, Boon -> `lake-gift`, Invitation -> `lake-invitation`, Covenant -> `lake-vow`, Snow -> `snow` |

Known GB data errors are fixed in the migration via `VERSION_FIX` /
`DATE_OVERRIDES` (Nov 2024 runs mislabeled `1.1`, the 1.2 Invitation start
year, the 2.0 Swinging Freely end year).

## Banner notes

- Rate-ups come from GB per-run data, canonicalized against `characters.json`
  and `aliases.json`. Selector/`Choose N:` pools are kept in `rateUp6Star`.
- `nameCN` for Global-only names differs from the CN wiki (e.g. the standard
  banner is `Amid the Lake` here, `于湖中央`); verified CN names are in
  `MANUAL_NAME_CN` in the migration script. One known gap remains:
  `The Mirror's Lonely Watcher` (fill in when the CN name is confirmed).
- The server joins a user's pool to a banner by CN name (`nameCN`); manual
  overrides under `pools` in `banner-aliases.json` bridge CN names the wikis
  haven't caught up with to an EN banner. `validate_banners.py` asserts every
  in-game pool in `raw/ingame/summon*.json` resolves.
- Pity grouping (phase 2): a pull's pity group is `pityPool` when
  `carryOver` is true (character & ripples carry globally), otherwise
  `pityPool + ':' + slug(name)-version` (each edition resets).

## Notes

- Character name matching is done on normalized English names (with Cyrillic
  transliteration) plus a small alias map in `aliases.json` — e.g.
  `Thirty-seven` -> `37`, `Changeling` -> `Jessica`. Display names always
  follow the wiki verbatim.
- Only `Machine D III` (id 9998) is excluded as a non-playable character.
- Re-run after refreshing raw sources; then re-seed with
  `bun run seed:server` and restart the app.
