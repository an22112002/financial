import os
import json
from time import time

from fastapi import APIRouter
from api.model.contract_model import Contract, SearchRequest
from api.service.contract_service import createContract, getCotractsBySearch, updateContract
from api.crud.files_crud import get_files_no_paper, delete_file

import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(router: APIRouter):
    tasks = [
        asyncio.create_task(clear_unuse_files())
    ]
    
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()

contract_router = APIRouter(prefix="/contracts", lifespan=lifespan, tags=["contracts"])

@contract_router.post("/create")
async def create_contract(data: Contract):
    success = createContract(data)
    if success:
        return {"success": True, "message": "Contract created successfully"}
    else:
        return {"success": False, "message": "Failed to create contract"}
    
@contract_router.post("/search")
async def get_contracts(search: SearchRequest):
    contracts = getCotractsBySearch(search)
    return {"success": True, "contracts": contracts}

@contract_router.put("/update")
async def update_contract(data: Contract):
    update_contract = updateContract(data)
    if update_contract:
        return {"success": True, "message": "Contract updated successfully"}
    else:
        return {"success": False, "message": "Failed to update contract"}

async def clear_unuse_files():
    while True:
        # Xóa các file được upload nhưng sau 1 giờ không được lưu -> setPaperID
        unuse_files = get_files_no_paper()
        for file in unuse_files:
            position = json.loads(file["position"])
            if position.get("place") == "local":
                uploaded_at = int(position.get("uploaded_at", 0))
                if time() - uploaded_at > 3600:  # upload hơn 1 giờ nhưng vẫn chưa setPaperID
                    file_path = position.get("path")
                    if file_path and os.path.exists(file_path):
                        os.remove(file_path)
                    delete_file(file["file_id"])
        
        # Chờ 1 giờ trước khi xóa lại
        await asyncio.sleep(3600)