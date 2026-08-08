#!/usr/bin/env python3
"""One-time migration: rebuild assets/banners.json as a per-edition catalog.

Sources:
  - raw/prydwen/GB.json             authoritative per-run source (all editions)
  - assets/banners.json             old aggregated catalog (type, nameCN, imageUrl, dates)
  - tools/output/wiki-cn-en-name-map.json   CN fallback for nameCN
  - assets/characters.json          canonical English character names
  - tools/banner-aliases.json       name/alias overrides

Output is staged to tools/output/banners.json. The user copies it to
assets/banners.json after reviewing the printed report.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# load sources
# ---------------------------------------------------------------------------
def load(rel: str):
    with open(ROOT / rel, encoding="utf-8") as f:
        return json.load(f)


gb_runs = load("raw/prydwen/GB.json")
old_banners = load("assets/banners.json")

# Guard: this is a ONE-TIME migration. Its "old aggregated catalog" input
# (assets/banners.json) has since been replaced by the per-edition output, so
# re-running it against the current file would silently drop the hand-authored
# nameCN/imageUrl/date data. Refuse to run on the new format.
if any("version" in b for b in old_banners):
    sys.exit(
        "assets/banners.json is already the per-edition catalog; "
        "migrate_banners.py is a one-time script and will not re-run."
    )

characters = load("assets/characters.json")
wiki_map = load("tools/output/wiki-cn-en-name-map.json")  # CN -> EN

CHAR_FIX = {"ezio": "Ezio Auditore", "ezratheodore": "Ezra"}

# GB run name (normalized) -> old-assets name (normalized) for renamed banners.
OLD_NAME_ALIASES = {
    "amidthelake": "amongstthelake",
    "intothemirrors": "observationintothemirrors",
    "myatherfingertips": "themyatherfingertips",
}

# GB labels that are not the official in-game English name. "Amid the Lake" is
# Prydwen's label for the permanent standard banner; the official name (and the
# art asset slug) is "Amongst the Lake".
GB_NAME_OVERRIDES = {
    "Amid the Lake": "Amongst the Lake",
}

# CN names verified from the CN wiki / official announcements, for banners the
# wiki-cn-en-name-map.json does not cover (Global-only names differ from CN).
# "The Mirror's Lonely Watcher" is a placeholder: Semmelweis is free in CN, so
# that rerun has no official CN banner name.
MANUAL_NAME_CN = {
    "Yearning of the Water": "湖的企盼",
    "Myth at Her Fingertips": "神话咫尺之处",
    "Her Heart-Cut Spring": "她的心动春日",
    "Clang of Sword & Armor": "剑与盔的嘶鸣",
    "The Arrow Breaks Through the Air": "弩箭破空而至",
    "Amid the Lake": "于湖中央",
    "The Mirror's Lonely Watcher": "孤镜守望者",
}

# Tokens that are banner copy, not characters (dropped silently).
PROSE_TOKENS = (
    re.compile(r"^choose", re.IGNORECASE),
    re.compile(r"standard banner", re.IGNORECASE),
    re.compile(r"free 10", re.IGNORECASE),
    re.compile(r"every day", re.IGNORECASE),
)

# (normalized banner name, start date) -> corrected version number.
# Prydwen's GB.json has a few provably mislabeled versions (Nov 2024 runs
# tagged 1.1 while surrounded by 2.0 runs).
VERSION_FIX = {
    ("whisperofthewoods", "2024-11-09"): "2.0",
    ("swingingfreely", "2024-11-21"): "2.0",
}

# (normalized banner name, version) -> (start, end) timestamps override.
DATE_OVERRIDES = {
    # GB wrote the 1.2 run's start year as 2024 instead of 2023.
    ("invitationfromthewater", "1.2"): ("2023-12-30 05:00:00", "2024-01-13 04:59:00"),
    # GB wrote the 2.0 rerun's end year as 2023 instead of 2024.
    ("swingingfreely", "2.0"): ("2024-11-21 05:00:00", "2024-12-05 04:59:00"),
}

GB_TYPE_MAP = {
    "Debut": "debut",
    "Rerun": "rerun",
    "Limited": "exclusive",
    "Collab": "collaboration",
    "Ripples": "ripples",
    "Event": None,  # resolved via old assets or name keyword
    "Yearning": "yearning",
    "Beginner": "beginner",
    "Standard": "standard",
}

EVENT_TYPE_KEYWORDS = [
    ("snow", "snow"),
    ("abundance", "lake-promise"),
    ("promise", "lake-promise"),
    ("revelation", "lake-revelation"),
    ("boon", "lake-gift"),
    ("invitation", "lake-invitation"),
    ("covenant", "lake-vow"),
    ("lake", "lake-promise"),  # e.g. "From the Lake's Heart"
]


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def norm(s: str) -> str:
    s = (s or "").lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]", "", s)


char_names = [c["name"] for c in characters]
char_norm = {norm(n): n for n in char_names}

old_by_name = {}  # normalized old-assets name -> record
for b in old_banners:
    old_by_name.setdefault(norm(b.get("name", "")), b)

wiki_rev = {}  # normalized EN -> CN
for cn, en in wiki_map.items():
    wiki_rev.setdefault(norm(en), cn)


def old_match(gb_name: str):
    key = norm(gb_name)
    if key in OLD_NAME_ALIASES:
        key = OLD_NAME_ALIASES[key]
    return old_by_name.get(key)


def split_items(s: str | None) -> list[str]:
    """Split a GB rate-up cell into candidate name tokens."""
    if not s:
        return []
    s = s.strip()
    if s in ("-", "None", ""):
        return []
    s = re.sub(r"^Choose \d+[^:]*:\s*", "", s)
    out = [x.strip() for x in re.split(r"[,\n&]+", s) if x.strip()]
    return [x for x in out if not any(ch in x for ch in "*:./()") and len(x) < 40]


def canonicalize(items: list[str], report: dict) -> list[str]:
    """Map GB tokens to canonical English character names."""
    result = []
    for it in items:
        n = norm(it)
        if not n:
            continue
        if any(p.search(it) for p in PROSE_TOKENS):
            report["dropped"].append(it)
            continue
        if n in CHAR_FIX:
            result.append(CHAR_FIX[n])
            continue
        canonical = char_norm.get(n)
        if canonical:
            result.append(canonical)
        else:
            report["unmatched"].append(it)
    # dedupe, preserving order
    seen = set()
    out = []
    for x in result:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def gb_dates(run: dict, old: dict | None, version: str | None) -> tuple[str | None, str | None]:
    key = (norm(run["banner_name"]), version)
    if key in DATE_OVERRIDES:
        return DATE_OVERRIDES[key]

    start = run.get("start")
    end = run.get("end")
    start_ts = end_ts = None
    if start and start != "-":
        start_ts = f"{start} 05:00:00"
    if end and end != "-":
        end_ts = f"{end} 04:59:00"

    # Prefer the old-assets date (uniform 05:00/04:59 times) when name and
    # start day agree; GB is authoritative when days differ.
    if old and old.get("startDate"):
        old_day = old["startDate"][:10]
        if start == old_day:
            start_ts = f"{old_day} 05:00:00"
            end_ts = None
            if old.get("endDate"):
                end_ts = f"{old['endDate'][:10]} 04:59:00"
    return start_ts, end_ts


def resolve_type(run: dict, old: dict | None, report: dict) -> str:
    """Type is driven by the GB (Prydwen) banner_type; Prydwen's generic
    'Event' is disambiguated by name keywords."""
    gb_type = run.get("banner_type")
    if gb_type != "Event":
        mapped = GB_TYPE_MAP.get(gb_type)
        if mapped:
            return mapped
    name = run.get("banner_name", "")
    n = norm(name)
    for kw, t in EVENT_TYPE_KEYWORDS:
        if kw in n:
            return t
    report["type_unresolved"].append(name)
    return "lake-promise"


def resolve_name_cn(run: dict, old: dict | None) -> str | None:
    if old and old.get("nameCN"):
        return old["nameCN"]
    name = run.get("banner_name", "")
    if name in MANUAL_NAME_CN:
        return MANUAL_NAME_CN[name]
    cn = wiki_rev.get(norm(name))
    if cn:
        return cn
    return None


# ---------------------------------------------------------------------------
# build records
# ---------------------------------------------------------------------------
report = {
    "dropped": [],
    "unmatched": [],
    "type_unresolved": [],
    "namecn_null": [],
    "skipped_null_name": 0,
}
records = []
for run in gb_runs:
    name = run.get("banner_name")
    if not name:
        report["skipped_null_name"] += 1
        continue
    old = old_match(name)
    name = GB_NAME_OVERRIDES.get(name, name)
    version = run.get("version")
    version = VERSION_FIX.get((norm(name), run.get("start")), version)
    rec = {
        "name": name,
        "nameCN": resolve_name_cn(run, old),
        "type": resolve_type(run, old, report),
        "version": version,
        "startDate": None,
        "endDate": None,
        "rateUp6Star": canonicalize(
            split_items(run.get("rate_up_6_star")), report
        ),
        "rateUp5Star": canonicalize(
            split_items(run.get("rate_up_5_star")), report
        ),
        "imageUrl": (old or {}).get("imageUrl"),
    }
    rec["startDate"], rec["endDate"] = gb_dates(run, old, version)
    if rec["nameCN"] is None:
        report["namecn_null"].append(name)
    records.append(rec)

# Newest first (matching the convention of assets/banners.json); undated
# records (permanent beginner banner) fall to the bottom.
records.sort(key=lambda r: r.get("startDate") or "", reverse=True)

out_path = ROOT / "tools" / "output" / "banners.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(
    json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

# ---------------------------------------------------------------------------
# report
# ---------------------------------------------------------------------------
from collections import Counter

print(f"records written: {len(records)}  ->  {out_path.relative_to(ROOT)}")
print("by type:", dict(Counter(r["type"] for r in records)))
print(
    "by version:",
    dict(Counter(r["version"] for r in records if r["version"])),
)
print("\nnameCN null (%d):" % len(report["namecn_null"]))
for n in report["namecn_null"]:
    print("  -", n)
print("\ndropped rate-up tokens (%d):" % len(report["dropped"]))
for n in report["dropped"]:
    print("  -", n)
print("\nunmatched rate-up tokens (%d):" % len(report["unmatched"]))
for n in report["unmatched"]:
    print("  -", n)
print("\ntype unresolved (%d):" % len(report["type_unresolved"]))
for n in report["type_unresolved"]:
    print("  -", n)
print("\nskipped runs with null banner_name:", report["skipped_null_name"])
