#!/usr/bin/env python3
"""Shared helpers for the Memoria data tools.

Both data builders import from here so their I/O, download and mirror
behavior stays identical: fetch with retries, JSON load/write, image download
with a cache-check, and staging-to-web mirroring.
"""

import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
TOOLS_DIR = Path(__file__).resolve().parent
OUT_DIR = TOOLS_DIR / "output"

BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

IMAGE_MAGIC = {
    b"\xff\xd8\xff": ".jpg",
    b"\x89PNG\r\n\x1a\n": ".png",
    b"GIF87a": ".gif",
    b"GIF89a": ".gif",
    b"RIFF": ".webp",
}


def log(message: str) -> None:
    print(message, file=sys.stderr)


def warn(message: str) -> None:
    print(f"WARNING: {message}", file=sys.stderr)


def detect_ext(data: bytes) -> str | None:
    """Return the file extension that matches the bytes' magic number."""
    for magic, ext in IMAGE_MAGIC.items():
        if data.startswith(magic):
            return ext
    return None


def slugify(name: str) -> str:
    """Slugify a name for use as a local image filename."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def load_json(path: str | Path, default=None):
    path = Path(path)
    if not path.exists():
        return default
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str | Path, data) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def request_bytes(url: str) -> bytes:
    """GET `url` and return the raw bytes (retries on the flaky network)."""
    last: Exception | None = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read()
        except Exception as exc:
            last = exc
            log(f"  fetch attempt {attempt + 1} failed ({exc}); retrying...")
            time.sleep(3)
    raise last  # type: ignore[misc]


def fetch(url: str, label: str) -> str:
    """Fetch a page live from its URL and decode it as UTF-8 text."""
    data = request_bytes(url)
    text = data.decode("utf-8", errors="replace")
    log(f"Fetched {label} from {url} ({len(text)} bytes)")
    return text


def fetch_mediawiki_html(page: str, label: str) -> str:
    """Fetch a rendered page through the MediaWiki parse API.

    Use this for wiki pages whose raw HTML is behind a Cloudflare challenge
    (e.g. reverse1999.fandom.com) — the API returns the page markup as JSON.
    """
    url = (
        "https://reverse1999.fandom.com/api.php"
        f"?action=parse&page={urllib.parse.quote(page)}&prop=text&format=json"
    )
    payload = json.loads(request_bytes(url).decode("utf-8"))
    html = payload["parse"]["text"]["*"]
    log(f"Fetched {label} from {url} ({len(html)} bytes)")
    return html


def download_image(url: str | None, dest_dir: str | Path, name: str) -> str | None:
    """Download an image keyed by `name`; returns its filename or None.

    A cache-hit shortcut keeps reruns fast: a file already keyed by `name`
    (any extension) is reused without hitting the network.
    """
    dest_dir = Path(dest_dir)
    if not url or not name:
        return None
    if dest_dir.is_dir():
        for stale in os.listdir(dest_dir):
            if stale.startswith(f"{name}."):
                return f"{name}{os.path.splitext(stale)[1]}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
    except Exception as exc:
        warn(f"image download failed {url[:80]} ({exc})")
        return None
    ext = detect_ext(data) if data else None
    if ext is None:
        warn(f"not an image {url[:80]}")
        return None
    dest_dir.mkdir(parents=True, exist_ok=True)
    for stale in os.listdir(dest_dir):
        if stale.startswith(f"{name}."):
            os.remove(dest_dir / stale)
    fname = f"{name}{ext}"
    (dest_dir / fname).write_bytes(data)
    return fname


def sync_images(src_dir: str | Path, dest_dir: str | Path) -> int:
    """Mirror every staged image into a destination folder (removes stale)."""
    src_dir, dest_dir = Path(src_dir), Path(dest_dir)
    if not src_dir.is_dir():
        return 0
    dest_dir.mkdir(parents=True, exist_ok=True)
    staged = set(os.listdir(src_dir))
    for name in os.listdir(dest_dir):
        if name not in staged:
            os.remove(dest_dir / name)
    copied = 0
    for name in os.listdir(src_dir):
        src = src_dir / name
        if src.is_file():
            shutil.copyfile(src, dest_dir / name)
            copied += 1
    return copied
