from fastapi import APIRouter
from api.model.auth_model import *
from api.service.auth_service import login

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login")
async def userLogin(request: LoginRequest):
    return login(request)
