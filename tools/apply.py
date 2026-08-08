#!/usr/bin/env python3
"""
Memoria - Publish staged tool output into the app folders.

The builders (build_assets.py, build_banners.py) only write into
tools/output/. This script is the explicit, reviewable step that mirrors that
staging folder into the folders the app actually consumes:

    tools/output/characters.json  -> assets/characters.json
    tools/output/banners.json     -> assets/banners.json
    tools/output/images/characters/* -> web/public/images/characters/*
    tools/output/images/banners/*     -> web/public/images/banners/*

Images are synced (mirrored, stale files removed). JSON files are copied
as-is.

Use --dry-run to preview what would change without writing anything.

Run from the repo root:
    python3 tools/apply.py            # publish
    python3 tools/apply.py --dry-run  # preview only
"""

import argparse
import json
import os
import shutil
import sys

from common import OUT_DIR, REPO_ROOT, log, sync_images

ASSETS_DIR = REPO_ROOT / "assets"
WEB_IMAGE_DIR = REPO_ROOT / "web" / "public" / "images"

JSON_MAP = {
    "characters.json": "characters.json",
    "banners.json": "banners.json",
}

IMAGE_MAP = {
    "characters": "characters",
    "banners": "banners",
}


def plan_json_copy(dry_run: bool) -> list[str]:
    lines = []
    for staged_name, dest_name in JSON_MAP.items():
        src = OUT_DIR / staged_name
        dest = ASSETS_DIR / dest_name
        if not src.exists():
            log(f"Skipping {src}: not staged (run the builder first)")
            continue
        if dest.exists() and dest.read_bytes() == src.read_bytes():
            lines.append(f"unchanged   {dest}")
            continue
        lines.append(f"copy        {src} -> {dest}")
        if not dry_run:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
    return lines


def bytes_differ(src: Path, dest: Path) -> bool:
    """True when the destination is missing or its bytes differ from src."""
    return not dest.exists() or dest.read_bytes() != src.read_bytes()


def plan_image_sync(dry_run: bool) -> list[str]:
    lines = []
    for staged_name, dest_name in IMAGE_MAP.items():
        src = OUT_DIR / "images" / staged_name
        dest = WEB_IMAGE_DIR / dest_name
        if not src.is_dir():
            continue
        existing = set(os.listdir(dest)) if dest.is_dir() else set()
        staged = {p.name for p in src.iterdir() if p.is_file()}
        removed = sorted(existing - staged)
        added = sorted(
            p.name for p in src.iterdir() if p.is_file() and bytes_differ(p, dest / p.name)
        )
        for name in removed:
            lines.append(f"remove      {dest / name}")
        for name in added:
            lines.append(f"copy        {src / name} -> {dest / name}")
        if not dry_run:
            sync_images(src, dest)
    return lines


def summarize() -> None:
    chars = json.loads((ASSETS_DIR / "characters.json").read_text(encoding="utf-8"))
    banners = json.loads((ASSETS_DIR / "banners.json").read_text(encoding="utf-8"))
    char_images = (
        len(list((WEB_IMAGE_DIR / "characters").glob("*")))
        if (WEB_IMAGE_DIR / "characters").is_dir()
        else 0
    )
    banner_images = (
        len(list((WEB_IMAGE_DIR / "banners").glob("*")))
        if (WEB_IMAGE_DIR / "banners").is_dir()
        else 0
    )
    log("")
    log(f"assets/characters.json : {len(chars)} records")
    log(f"assets/banners.json    : {len(banners)} records")
    log(f"web/public/images/characters : {char_images} files")
    log(f"web/public/images/banners    : {banner_images} files")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Publish staged tools output into assets/ and web/public/"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="preview changes without writing"
    )
    args = parser.parse_args(argv)

    lines = plan_json_copy(args.dry_run)
    lines += plan_image_sync(args.dry_run)

    if not lines:
        log("Nothing to do: output already matches the app folders.")
    else:
        for line in lines:
            log(line)
        log(
            f"\n{len(lines)} change(s) {'would be applied' if args.dry_run else 'applied'}."
        )

    if not args.dry_run:
        summarize()
    return 0


if __name__ == "__main__":
    sys.exit(main())
