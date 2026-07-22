from dotenv import load_dotenv
import os
load_dotenv(".env")

from pathlib import Path
from passlib.context import CryptContext


BASE_DIR = Path(__file__).resolve().parent

CACHE_DIR = BASE_DIR / "cache"
CACHE2_DIR = BASE_DIR / "cache2"

CACHE_DIR.mkdir(exist_ok=True)
CACHE2_DIR.mkdir(exist_ok=True)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    default="bcrypt",
    deprecated="auto"
)

ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001"

# redis
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_PASSWORD = "P@$$vv0rd"

TOKEN_SECRET_KEY = "to_infinity_and_beyond"
TOKEN_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 3600  # 1 hour
REFRESH_TOKEN_EXPIRE_SECONDS = 604800  # 7 days

# files
FILES_SAVE_FOLDER = os.getenv("FILES_SAVE_FOLDER")
os.path.exists(FILES_SAVE_FOLDER) or os.makedirs(FILES_SAVE_FOLDER)