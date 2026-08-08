#!/usr/bin/env python3
"""
Memoria - Banner asset builder.

The EN (fandom) wiki is the ONLY data source for banners: names, dates,
official art and featured characters (rate-ups). The CN wiki is fetched only
to build the cn -> en name map. A pool is matched to its banner by its CN
name (nameCN) — no in-game pool id is used.

    EN wiki   -> tools/output/wiki-en-banners.json      (name, dates, art,
                                                         featured)
    CN wiki   -> tools/output/wiki-cn-en-name-map.json  (cn name -> en name)

Results are staged in tools/output/ only (nothing touches the app folders).
To publish into assets/ and web/public/, run `python3 tools/apply.py`
afterwards.

    tools/output/banners.json -> merged banner list (same record format as
                                 the character builder: { id, name, nameCN,
                                 type, ..., imageUrl })

Run from the repo root:
    python3 tools/build_banners.py
"""

import html
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

from common import (
    OUT_DIR,
    download_image,
    fetch,
    load_json,
    log,
    slugify,
    write_json,
)

REPO_ROOT = Path(__file__).resolve().parents[1]

OUT_GLOBAL = OUT_DIR / "wiki-en-banners.json"
OUT_CN_NAME_MAP = OUT_DIR / "wiki-cn-en-name-map.json"
OUT_BANNERS = OUT_DIR / "banners.json"
OUT_IMAGE_DIR = OUT_DIR / "images" / "banners"

CN_WIKI_URL = "https://res1999.huijiwiki.com/wiki/%E5%BE%81%E9%9B%86%E7%B3%BB%E7%BB%9F"
GLOBAL_WIKI_URL = "https://reverse1999.fandom.com/wiki/Summons"

ALIASES_FILE = Path(__file__).resolve().parent / "banner-aliases.json"
CHAR_ALIASES_FILE = Path(__file__).resolve().parent / "aliases.json"

CHARACTERS_FILE = REPO_ROOT / "assets" / "characters.json"

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_name(text: str) -> tuple[str, str] | None:
    """Split a CN-wiki name cell into (cn_name, en_name)."""
    m = re.search(r"[A-Za-z]", text)
    if not m:
        return None
    i = m.start()
    cn, en = text[:i].strip(), html.unescape(text[i:]).strip()
    if not cn or not en:
        return None
    return cn, en


def parse_global_part(s: str) -> list[int] | None:
    m = re.search(r"([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(?:(\d{4}),?\s*)?(\d{1,2}):(\d{2})", s)
    if not m:
        return None
    mon = m.group(1)[:3].lower()
    if mon not in MONTHS:
        return None
    return [MONTHS[mon], int(m.group(2)), int(m.group(3)) if m.group(3) else None,
            int(m.group(4)), int(m.group(5))]


def parse_global_dates(text: str) -> tuple[str | None, str | None]:
    """Parse a global-wiki duration ('December 11th, 2025, 05:00 - January 1st, 2026, 04:59 (UTC-5)')."""
    if not text:
        return None, None
    parts = re.split(r"\s+-\s+", re.sub(r"\(UTC[-+]\d+\)", "", text))
    if len(parts) < 2:
        return None, None
    a, b = parse_global_part(parts[0]), parse_global_part(parts[1])
    if not a and not b:
        return None, None
    if a and a[2] is None and b and b[2] is not None:
        a[2] = b[2] - 1 if a[0] > b[1] else b[2]
    if b and b[2] is None and a and a[2] is not None:
        b[2] = a[2] + 1 if b[0] < a[1] else a[2]
    if a and a[2] is None:
        a[2] = b[2] if b else 2025
    if b and b[2] is None:
        b[2] = a[2] if a else 2025

    def fmt(p):
        return f"{p[2]:04d}-{p[0]:02d}-{p[1]:02d} {p[3]:02d}:{p[4]:02d}:00"

    return fmt(a) if a else None, fmt(b) if b else None


def image_href(row) -> str | None:
    """Prefer the official _Banner.png link, else any /images/*.png link.

    Only absolute (http/https) URLs are considered; relative /wiki/... links
    are ignored.
    """
    links = [a["href"] for a in row.find_all("a", href=True)]
    links = [h for h in links if h.startswith(("http://", "https://"))]
    for href in links:
        if "_Banner.png" in href:
            return href
    for href in links:
        if "/images/" in href and ".png" in href:
            return href
    return None


def parse_global(html_text: str) -> list[dict]:
    """Parse the global (EN) banner wiki into a list of banner records."""
    soup = BeautifulSoup(html_text, "html.parser")
    rows: list[dict] = []
    for row in soup.find_all("tr"):
        b = row.find("b")
        if not b:
            continue
        name = html.unescape(b.get_text(strip=True))
        row_text = row.get_text("\n")
        dur = re.search(r"Duration:\s*(.+)", row_text)
        featured: list[str] = []
        for tag in row.find_all(True):
            title = tag.get("title")
            if not title:
                continue
            title = html.unescape(title).strip()
            if title and title not in featured:
                featured.append(title)
        start, end = parse_global_dates(dur.group(1) if dur else "")
        rows.append({
            "en": name,
            "start": start,
            "end": end,
            "image": image_href(row),
            "featured": featured,
        })
    return rows


def parse_cn_names(html_text: str) -> list[tuple[str, str]]:
    """Extract the (cn, en) banner-name pairs from the CN wiki (mapping only)."""
    soup = BeautifulSoup(html_text, "html.parser")
    pairs: list[tuple[str, str]] = []
    for table in soup.find_all("table"):
        header = None
        for row in table.find_all("tr"):
            cells = row.find_all(["td", "th"])
            if not cells:
                continue
            texts = [clean(c.get_text(" ", strip=True)) for c in cells]
            if header is None:
                header = {t: i for i, t in enumerate(texts)
                          if t in ("图片", "名称", "标题", "类型", "时间", "UP", "轮换时间")}
                if header.get("名称") is not None:
                    continue  # header row
                header = None
            name_cell = None
            for i, t in enumerate(texts):  # label/value layout
                if t == "名称" and i + 1 < len(cells):
                    name_cell = cells[i + 1]
                    break
            if name_cell is None and header and header["名称"] < len(cells):  # positional layout
                name_cell = cells[header["名称"]]
            if name_cell is None:
                continue
            pair = split_name(clean(name_cell.get_text(" ", strip=True)))
            if pair:
                pairs.append(pair)
    return pairs


def norm_en(name: str) -> str:
    """Normalized EN name for matching (lowercase, alnum, rerun number stripped)."""
    s = re.sub(r"[^a-z0-9]", "", name.lower())
    return re.sub(r"\d+$", "", s)


def en_key(name: str, en_name_map: dict[str, str]) -> str:
    """Canonical matching key for an EN name (enNameMap bridges CN/EN drift)."""
    return en_name_map.get(norm_en(name), norm_en(name))


def build_featured_lookup(characters: list[dict], char_aliases: dict[str, str]) -> dict[str, dict]:
    """Map every name a wiki 'featured' cell can carry to its character:
    exact display name, normalized name, or a known alias (e.g. Ezra Theodore)."""
    lookup: dict[str, dict] = {}
    for c in characters:
        lookup[c["name"]] = c
        lookup[norm_en(c["name"])] = c
    for alias_norm, canon_norm in char_aliases.items():
        target = next((c for c in characters if norm_en(c["name"]) == canon_norm), None)
        if target is not None:
            lookup[alias_norm] = target
    return lookup


def featured_char(f: str, lookup: dict[str, dict]) -> dict | None:
    """Resolve a featured entry to a character, or None for event names etc."""
    return lookup.get(f) or lookup.get(norm_en(f))


def rateups_from_global(featured: list[str], featured_lookup: dict[str, dict],
                        chars_by_id: dict[int, dict]) -> tuple[list[str], list[str]]:
    """Split the EN wiki's featured characters into rate-up 6*/5* names."""
    rate6: list[str] = []
    rate5: list[str] = []
    for f in featured:
        ch = featured_char(f, featured_lookup)
        if not ch:
            continue
        if ch["rarity"] == 6 and ch["name"] not in rate6:
            rate6.append(ch["name"])
        elif ch["rarity"] == 5 and ch["name"] not in rate5:
            rate5.append(ch["name"])
    return rate6, rate5


def banner_type(cn_name: str | None) -> str:
    """Minimal banner kind derived from the CN name (drives pity grouping)."""
    if not cn_name:
        return "event"
    if cn_name.startswith("湖的"):
        return "lake-ripple"
    if cn_name == "第一滴雨":
        return "beginner"
    if cn_name == "于湖中央":
        return "standard"
    return "event"


def main() -> None:
    en_name_map = (load_json(ALIASES_FILE, {}) or {}).get("enNameMap", {})

    cn_html = fetch(CN_WIKI_URL, "CN banner wiki")
    global_html = fetch(GLOBAL_WIKI_URL, "global banner wiki")

    global_rows = parse_global(global_html)
    pairs = parse_cn_names(cn_html)
    log(f"Parsed {len(global_rows)} EN banners, {len(pairs)} CN banner names")

    characters = load_json(CHARACTERS_FILE, [])
    chars_by_id = {c["id"]: c for c in characters}
    featured_lookup = build_featured_lookup(characters, load_json(CHAR_ALIASES_FILE, {}) or {})

    # Keep only real characters in the EN featured list so event names, file
    # titles and dead links don't leak into the staged catalog or rate-ups.
    for g in global_rows:
        g["featured"] = [f for f in g["featured"] if featured_char(f, featured_lookup)]

    # Group EN wiki rows by canonical key (newest with image wins for art/dates).
    en_cands: dict[str, list[dict]] = {}
    for g in global_rows:
        en_cands.setdefault(en_key(g["en"], en_name_map), []).append(g)
    en_by_key: dict[str, dict] = {}
    for key, cands in en_cands.items():
        with_img = [c for c in cands if c.get("image")]
        en_by_key[key] = max(with_img or cands, key=lambda c: c.get("start") or "0000")

    # cn <-> en mapping: cn pool name -> canonical EN name, and the reverse.
    cn_to_en: dict[str, str] = {}
    en_to_cn: dict[str, str] = {}
    for cn, en in pairs:
        cn = re.sub(r"\s*\d+$", "", cn)  # drop rerun index (e.g. 湖的涟漪 16)
        key = en_key(en, en_name_map)
        en_to_cn.setdefault(key, cn)
        cn_to_en.setdefault(cn, en_by_key.get(key, {}).get("en", en))

    write_json(OUT_GLOBAL, global_rows)
    write_json(OUT_CN_NAME_MAP, cn_to_en)
    log(f"Wrote {OUT_GLOBAL}, {OUT_CN_NAME_MAP}")

    aliases = load_json(ALIASES_FILE, {})
    overrides = aliases.get("pools", {})

    # One record per canonical EN name; every field comes from the EN wiki.
    records: dict[str, dict] = {}
    for key, g in en_by_key.items():
        cn = en_to_cn.get(key)
        rate6, rate5 = rateups_from_global(g["featured"], featured_lookup, chars_by_id)
        records[key] = {
            "id": slugify(g["en"]),
            "name": g["en"],
            "nameCN": cn,
            "type": banner_type(cn),
            "startDate": g["start"],
            "endDate": g["end"],
            "rateUp6Star": rate6,
            "rateUp5Star": rate5,
        }

    # Explicit overrides (pools the wikis haven't caught up with).
    for cn_name, ov in overrides.items():
        key = en_key(ov["name"], en_name_map)
        rec = records.setdefault(key, {
            "id": slugify(ov["name"]), "name": ov["name"], "nameCN": cn_name,
            "type": ov.get("type", banner_type(cn_name)), "startDate": None, "endDate": None,
            "rateUp6Star": [], "rateUp5Star": [],
        })
        rec["nameCN"] = cn_name
        if ov.get("type"):
            rec["type"] = ov["type"]
        if ov.get("rateUp6Star"):
            rec["rateUp6Star"] = ov["rateUp6Star"]
        if ov.get("rateUp5Star"):
            rec["rateUp5Star"] = ov["rateUp5Star"]

    # Download EN art into the staging folder.
    for key, record in records.items():
        g = en_by_key.get(key)
        remote = g.get("image") if g else None
        fname = download_image(remote, OUT_IMAGE_DIR, record["id"]) if remote else None
        record["imageUrl"] = f"/images/banners/{fname}" if fname else None

    log(f"Staged {len(list(OUT_IMAGE_DIR.glob('*')))} banner images -> {OUT_IMAGE_DIR}")

    results = sorted(records.values(), key=lambda r: r["name"].lower())
    write_json(OUT_BANNERS, results)

    log(f"Wrote {len(results)} banners -> {OUT_BANNERS}")
    for r in results[:6]:
        log(f"  {r['name']!r} cn={r.get('nameCN')!r} "
            f"up6={r.get('rateUp6Star')} img={r.get('imageUrl')}")


if __name__ == "__main__":
    sys.exit(main())
