from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

CACHE_DIR = BASE_DIR / "cache"
CACHE2_DIR = BASE_DIR / "cache2"

CACHE_DIR.mkdir(exist_ok=True)
CACHE2_DIR.mkdir(exist_ok=True)