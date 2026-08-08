#!/usr/bin/env python3
"""Validate the per-edition banner catalog (assets/banners.json).

Checks:
  - schema / types against shared/src/types.ts
  - invariants (unique name+version, start <= end, uniform timestamps)
  - banner-rules.json coverage for every BannerType
  - optional mechanic overrides conform to allowed values
  - every in-game CN pool name resolves to at least one catalog banner
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TYPES = {
    "debut", "rerun", "exclusive", "collaboration", "ripples",
    "lake-promise", "lake-revelation", "lake-gift", "lake-invitation",
    "lake-vow", "snow", "yearning", "beginner", "standard",
}
# PityPool from shared/src/types.ts: debut/rerun share the 'character' pool.
PITY_POOLS = (TYPES - {"debut", "rerun"}) | {"character"}
RATE_UP_RULES = {"5050", "7030", "100-first", "100", "none", "box"}
TS = re.compile(r"^\d{4}-\d{2}-\d{2} 05:00:00$|^\d{4}-\d{2}-\d{2} 04:59:00$")
VERSION = re.compile(r"^\d+\.\d+$|^[A-Z]{1,3} Collab$")


def load(rel: str):
    with open(ROOT / rel, encoding="utf-8") as f:
        return json.load(f)


def main() -> int:
    banners = load("assets/banners.json")
    rules = load("assets/banner-rules.json")
    characters = load("assets/characters.json")
    aliases = load("tools/banner-aliases.json")

    char_names = {c["name"] for c in characters}
    errors: list[str] = []
    warnings: list[str] = []

    # --- rules table -------------------------------------------------------
    for t in rules:
        if t not in TYPES:
            errors.append(f"banner-rules.json: unknown type {t!r}")
        r = rules[t]
        if r.get("pityPool") not in PITY_POOLS:
            errors.append(f"banner-rules.json:{t}: bad pityPool {r.get('pityPool')!r}")
        if r.get("rateUp") not in RATE_UP_RULES:
            errors.append(f"banner-rules.json:{t}: bad rateUp {r.get('rateUp')!r}")
        for f in ("carryOver",):
            if f in r and not isinstance(r[f], bool):
                errors.append(f"banner-rules.json:{t}: {f} not bool")
        for f in ("pullCap", "selector"):
            if f in r and (not isinstance(r[f], int) or r[f] <= 0):
                errors.append(f"banner-rules.json:{t}: {f} not positive int")
        if "milestoneCopies" in r and (
            not isinstance(r["milestoneCopies"], list)
            or not all(isinstance(x, int) and x > 0 for x in r["milestoneCopies"])
        ):
            errors.append(f"banner-rules.json:{t}: milestoneCopies malformed")
    for t in TYPES:
        if t not in rules:
            errors.append(f"banner-rules.json: missing rule for type {t!r}")

    # --- per-record checks -------------------------------------------------
    seen = set()
    for i, b in enumerate(banners):
        tag = f"banners[{i}]"
        if not isinstance(b.get("name"), str) or not b["name"]:
            errors.append(f"{tag}: missing/empty name")
            continue
        name = b["name"]
        btype = b.get("type")
        if btype not in TYPES:
            errors.append(f"{tag} ({name}): bad type {btype!r}")
        if not isinstance(b.get("rateUp6Star"), list) or not isinstance(
            b.get("rateUp5Star"), list
        ):
            errors.append(f"{tag} ({name}): rateUp*Star must be lists")
        else:
            for star, f in ((6, "rateUp6Star"), (5, "rateUp5Star")):
                for n in b[f]:
                    if not isinstance(n, str):
                        errors.append(f"{tag} ({name}): non-str in {f}")
                    elif n not in char_names:
                        warnings.append(f"{tag} ({name}): {f} {n!r} not in characters.json")
        for f in ("startDate", "endDate"):
            v = b.get(f)
            if v is not None and (not isinstance(v, str) or not TS.match(v)):
                errors.append(f"{tag} ({name}): bad {f} {v!r} (want 05:00/04:59 or null)")
        s, e = b.get("startDate"), b.get("endDate")
        if s and e and s > e:
            errors.append(f"{tag} ({name}): startDate > endDate")
        v = b.get("version")
        if v is not None and (not isinstance(v, str) or not VERSION.match(v)):
            errors.append(f"{tag} ({name}): bad version {v!r}")
        key = (name, v)
        if key in seen:
            errors.append(f"{tag} ({name}): duplicate name+version {v!r}")
        seen.add(key)

        # optional mechanic overrides
        for f, allowed in (("pityPool", PITY_POOLS), ("rateUp", RATE_UP_RULES)):
            if f in b and b[f] not in allowed:
                errors.append(f"{tag} ({name}): bad {f} override {b[f]!r}")
        if "carryOver" in b and not isinstance(b["carryOver"], bool):
            errors.append(f"{tag} ({name}): carryOver not bool")
        for f in ("pullCap", "selector", "hardPity"):
            if f in b and (not isinstance(b[f], int) or b[f] <= 0):
                errors.append(f"{tag} ({name}): {f} not positive int")
        if "milestoneCopies" in b and (
            not isinstance(b["milestoneCopies"], list)
            or not all(isinstance(x, int) and x > 0 for x in b["milestoneCopies"])
        ):
            errors.append(f"{tag} ({name}): milestoneCopies malformed")

    # --- in-game pool join coverage ----------------------------------------
    namecn_to_banners = {}
    for b in banners:
        if b.get("nameCN"):
            namecn_to_banners.setdefault(b["nameCN"], []).append(b["name"])
    pool_alias = aliases.get("pools", {})  # CN pool name -> resolved banner record

    pools = {}
    for rel in ("raw/ingame/summon.json", "raw/ingame/summon-1.json"):
        try:
            data = load(rel)
        except FileNotFoundError:
            continue
        for row in data.get("data", {}).get("pageData", []):
            pools.setdefault(row.get("poolName"), 0)
            pools[row.get("poolName")] += 1

    unresolved = []
    for pool, count in pools.items():
        resolved = pool in pool_alias or pool in namecn_to_banners
        if not resolved:
            unresolved.append(pool)
    print(f"in-game pools: {len(pools)} distinct (sum of pulls: {sum(pools.values())})")
    for pool, count in sorted(pools.items()):
        mark = "OK " if (pool in pool_alias or pool in namecn_to_banners) else "FAIL"
        print(f"  [{mark}] {pool!r} x{count}")

    # --- summary -----------------------------------------------------------
    print(f"\nbanners: {len(banners)} records, {len(set(b['name'] for b in banners))} unique names")
    print(f"warnings ({len(warnings)}):")
    for w in warnings:
        print("  -", w)
    print(f"errors ({len(errors)}):")
    for e in errors:
        print("  -", e)
    if unresolved:
        print(f"UNRESOLVED POOLS ({len(unresolved)}):")
        for u in unresolved:
            print("  -", u)
    if errors or unresolved:
        print("\nVALIDATION FAILED")
        return 1
    print("\nVALIDATION PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
