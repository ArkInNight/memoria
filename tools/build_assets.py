#!/usr/bin/env python3
"""
Memoria - Character asset builder.

Two sources, one merged character list:

    raw/github/characters.json -> id (gainId), CN name, EN name
    wiki Crew Members page     -> rarity, afflatus, damage, tags,
                                  birthday, age + the character icon

The wiki page is fetched through the MediaWiki API
(https://reverse1999.fandom.com/api.php?action=parse&page=Crew_Members)
because the raw page is behind a Cloudflare challenge. Images come from the
wiki ONLY (never the github asset repo): the {Name}_Icon files are staged in
tools/output/images/characters/ only.

Results are staged in tools/output/ (nothing touches the app folders). To
publish into assets/ and web/public/, run `python3 tools/apply.py` afterwards.

    tools/output/wiki-en-characters.json   -> parsed wiki catalog
    tools/output/characters.json           -> merged character list (same
                                              record format as the banner
                                              builder: { id, name, nameCN,
                                              type, ..., imageUrl })

Run from the repo root:
    python3 tools/build_assets.py
"""

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup
from common import (
    OUT_DIR,
    download_image,
    fetch_mediawiki_html,
    load_json,
    log,
    slugify,
    write_json,
)

RAW_GITHUB = Path(__file__).resolve().parents[1] / "raw" / "github"
ALIASES_FILE = Path(__file__).resolve().parent / "aliases.json"

OUT_WIKI_CHARACTERS = OUT_DIR / "wiki-en-characters.json"
OUT_CHARACTERS = OUT_DIR / "characters.json"
OUT_IMAGE_DIR = OUT_DIR / "images" / "characters"

# Characters present on the CN asset repo but NOT actual playable characters.
SKIP_IDS = {9998}  # Machine D III

# Simple Cyrillic -> Latin transliteration so Russian names in the CN asset
# repo can be matched against the wiki (e.g. Зима -> zima, Енисей -> enisay).
CYRILLIC_MAP = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "e",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "y",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "kh",
    "ц": "ts",
    "ч": "ch",
    "ш": "sh",
    "щ": "sch",
    "ъ": "",
    "ы": "y",
    "ь": "",
    "э": "e",
    "ю": "yu",
    "я": "ya",
}


def clean(text: str) -> str:
    """Collapse a cell's text to a single run of spaces."""
    return re.sub(r"\s+", " ", text).strip()


def norm_name(name: str | None) -> str:
    """Normalize a name for fuzzy matching (transliterated, lowercase, alnum only)."""
    translit = "".join(CYRILLIC_MAP.get(ch, ch) for ch in (name or "").lower())
    return re.sub(r"[^a-z0-9]", "", translit)


def full_res_image(data_src: str) -> str:
    """Turn a scale-to-width-down thumbnail into the full-resolution URL."""
    return re.sub(
        r"/revision/latest/scale-to-width-down/\d+", "/revision/latest", data_src
    )


def image_slug(name: str) -> str:
    """Filename slug for a character icon, following the wiki display name.

    Latin names slugify normally (e.g. 'A Knight' -> 'a-knight'). For
    non-latin names (e.g. 'Зима') slugify produces an empty string, so use
    the wiki name verbatim ('Зима') instead of transliterating it.
    """
    slug = slugify(name)
    return slug or name.strip()


def parse_wiki_table(html: str) -> dict[str, dict]:
    """Parse the Crew_Members crew table into {normalized_name: record}."""
    soup = BeautifulSoup(html, "html.parser")
    wiki: dict[str, dict] = {}
    for row in soup.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) < 9:
            continue
        txt = [clean(cell.get_text(" ", strip=True)) for cell in cells]
        # columns: checkbox Image Name Rarity Afflatus Damage Tags Birthday Age
        name, rarity, afflatus = txt[2], txt[3], txt[4]
        damage, tags, birthday, age = txt[5], txt[6], txt[7], txt[8]
        img = cells[1].find("img")
        src = (img.get("data-src") or img.get("src")) if img else None
        image = full_res_image(src) if src else None
        key = norm_name(name)
        if not key:
            continue  # e.g. non-latin names that normalize to empty
        wiki[key] = {
            "name": name,
            "rarity": rarity,
            "afflatus": afflatus,
            "damage": damage,
            "tags": tags,
            "birthday": birthday,
            "age": age,
            "image": image,
        }
    return wiki


def load_github_characters() -> list[dict]:
    with (RAW_GITHUB / "characters.json").open(encoding="utf-8") as f:
        return json.load(f)


def load_aliases() -> dict[str, str]:
    with ALIASES_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    html = fetch_mediawiki_html("Crew_Members", "wiki Crew Members table")
    wiki = parse_wiki_table(html)
    github = load_github_characters()
    aliases = {norm_name(k): norm_name(v) for k, v in load_aliases().items()}

    log(f"Parsed {len(wiki)} characters from wiki table")
    log(f"Loaded {len(github)} characters from github JSON")

    write_json(OUT_WIKI_CHARACTERS, list(wiki.values()))
    log(f"Wrote {OUT_WIKI_CHARACTERS}")

    records: list[dict] = []
    skipped: list[tuple[int, str, str]] = []
    downloaded = 0

    for char in sorted(github, key=lambda c: c["id"]):
        if char["id"] in SKIP_IDS:
            skipped.append(
                (
                    char["id"],
                    char.get("nameEng") or char["name"],
                    "not a playable character",
                )
            )
            continue

        key = norm_name(char.get("nameEng")) or norm_name(char.get("name"))
        wiki_key = aliases.get(key) or key
        entry = wiki.get(wiki_key)

        if not entry:
            skipped.append(
                (char["id"], char.get("nameEng") or char["name"], "missing from wiki")
            )
            continue

        rarity = int(entry["rarity"]) if entry["rarity"].isdigit() else None

        slug = image_slug(entry["name"])
        fname = download_image(entry["image"], OUT_IMAGE_DIR, slug) if slug else None
        if fname:
            downloaded += 1

        records.append(
            {
                "id": char["id"],
                "name": entry["name"],
                "nameCN": char.get("name", ""),
                "type": "character",
                "rarity": rarity,
                "attribute": entry["afflatus"] or None,
                "damage": entry["damage"] or None,
                "birthday": entry["birthday"] or char.get("roleBirthday") or None,
                "tags": entry["tags"] or None,
                "imageUrl": f"/images/characters/{fname}" if fname else None,
            }
        )

    # Newest first (in-game ids increase with release order).
    records.sort(key=lambda r: r["id"], reverse=True)
    write_json(OUT_CHARACTERS, records)

    log(f"Downloaded {downloaded} wiki icons -> {OUT_IMAGE_DIR}")
    log(f"Wrote {len(records)} characters -> {OUT_CHARACTERS}")

    if skipped:
        log("\nSkipped:")
        for cid, name, reason in skipped:
            log(f"  {cid:5} {name!r} ({reason})")


if __name__ == "__main__":
    sys.exit(main())
