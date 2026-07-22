from fastapi import APIRouter, Depends
from api.model.auth_model import *
from api.service.auth_service import login, logout, refreshingToken, changeUserPassword, changeUserStatus, getCurrentUser

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login")
async def userLogin(request: LoginRequest):
    return login(request)

@auth_router.post("/refresh-token")
async def refreshToken(payload: dict):
    # print(payload["refresh_token"])
    return refreshingToken(payload["refresh_token"])

@auth_router.post("/logout")
async def userLogout(payload: dict):
    # print(payload["refresh_token"])
    return logout(payload["refresh_token"])

@auth_router.post("/change-status")
async def changeStatus(user: dict = Depends(getCurrentUser(required_permits=["admin"]))):
    return changeUserStatus(user)

@auth_router.post("/change-password")
async def changePassword(request: ChangePasswordRequest, user: dict = Depends(getCurrentUser(required_permits=[]))):
    return changeUserPassword(user, request)
