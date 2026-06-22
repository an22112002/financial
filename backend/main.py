from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.router.scan_router import scan_router
from api.router.contract_router import contract_router
from api.router.auth_router import auth_router
from api.router.bank_router import bank_router
from databases.index import Database

from worker_manager import WorkerManager

from exceptions.index import *
from exceptions.index import AppException

from redis.asyncio import Redis


# db = Database()
redis_client = Redis(host='localhost', port=6379, db=0, decode_responses=True)

worker_manager = WorkerManager()
# Khởi động và kết thúc server
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động server
    print("[Start] Starting...")
    try:
        # response = db.init_pool()
        # if response:
        #     print("[Start] Database connection successful")
        response = redis_client.ping()
        if response:
            print("[Start] Redis connection successful")
        await worker_manager.start()
    except Exception as e:
        print(f"[Error] Khởi động server thất bại: {e}")
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
app.include_router(contract_router)
app.include_router(bank_router)

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