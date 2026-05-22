from fastapi import APIRouter

contract_router = APIRouter(prefix="/contracts", tags=["contracts"])

@contract_router.get("/")
async def get_contracts():
    return {"message": "List of contracts"}

@contract_router.post("/")
async def create_contract():
    return {"message": "Contract created"}