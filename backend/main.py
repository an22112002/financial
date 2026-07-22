from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.router.file_router import file_router
from api.router.department_router import department_router
from api.router.scan_router import scan_router
from api.router.contract_router import contract_router
from api.router.payable_router import payable_router
from api.router.auth_router import auth_router
from api.router.bank_router import bank_router
from api.router.util_router import util_router
from databases.index import db

from worker_manager import WorkerManager

from api.crud.user_crud import create_user, get_user_number

from exceptions.index import *
from exceptions.index import AppException

from config import ADMIN_USER_ID, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, pwd_context

from redis.asyncio import Redis

redis_client = Redis(host=REDIS_HOST, password=REDIS_PASSWORD, port=REDIS_PORT, db=0, decode_responses=True)

worker_manager = WorkerManager()
# Khởi động và kết thúc server
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động server
    print("[Start] Starting...")
    try:
        response = db.init_pool()
        if response:
            print("[Start] Database connection successful")
        else:
            print("[Error] Database connection failed")
            raise Exception("Database connection failed")
        response = redis_client.ping()
        if response:
            print("[Start] Redis connection successful")
        else:
            print("[Error] Redis connection failed")
            raise Exception("Redis connection failed")
        await worker_manager.start()
        if get_user_number() == 0:
            print("[Start] No users found, creating default admin user...")
            create_user(
                id=ADMIN_USER_ID,
                permit="admin",
                username="admin",
                hashpass=pwd_context.hash("admin123") # password: admin123
            )
    except Exception as e:
        print(f"[Error] Khởi động server thất bại: {e}")
        # Dừng khởi động server nếu có lỗi
        raise
    yield
    await worker_manager.stop()
    # Kết thúc server
    print("[End] Shutdown")

app = FastAPI(lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/banks", StaticFiles(directory="banks"), name="banks")

# Test endpoint
@app.get("/ping")
async def ping():
    return JSONResponse(content={"message": "pong"})

# Đăng ký router
app.include_router(auth_router)
app.include_router(scan_router)
app.include_router(file_router)
app.include_router(department_router)
app.include_router(contract_router)
app.include_router(payable_router)
app.include_router(bank_router)
app.include_router(util_router)

# Xử lý lỗi toàn cục do AppException
@app.exception_handler(AppException)
async def global_app_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.code,
        content={"message": exc.message}
    )

# Xử lý lỗi toàn cục không xác định
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred"}
    )

'''uvicorn main:app --host 0.0.0.0 --port 8000 --reload'''