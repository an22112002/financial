from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.router.contract_router import contract_router
from api.router.auth_router import auth_router
from databases.index import Database

from exceptions.index import *
from exceptions.index import AppException

db = Database()

# Khởi động và kết thúc server
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động server
    print("[Start] Starting...")
    try:
        db.init_pool()
    except Exception as e:
        print(f"[Error] Khởi động server thất bại: {e}")
        raise
    yield
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

# Test endpoint
@app.get("/ping")
async def ping():
    return JSONResponse(content={"message": "pong"})

# Đăng ký router
app.include_router(auth_router)
app.include_router(contract_router)

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