from fastapi import APIRouter
from api.service.util_service import contractConfig


util_router = APIRouter(prefix="/utils", tags=["utils"])

@util_router.get("/contract")
def getContractConfig():
    response = contractConfig()
    return {"success": True, "message": "Trả về cấu hình hợp đồng", "data": response}