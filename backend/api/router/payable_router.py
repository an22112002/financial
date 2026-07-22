from fastapi import APIRouter

from api.model.payable_model import LinkPayableTransactionRequest
from api.service.payable_service import getContractPayables, linkPayableTransaction, unlinkPayableTransaction

payable_router = APIRouter(prefix="/payables", tags=["payables"])


@payable_router.get("/contract/{contractID}")
async def get_contract_payables(contractID: str):
    data = getContractPayables(contractID)
    return {"success": True, "message": "Contract payables loaded", "data": data}


@payable_router.post("/link-transaction")
async def link_transaction(request: LinkPayableTransactionRequest):
    success = linkPayableTransaction(
        request.payableID,
        request.bankTransactionId,
        request.fromAccount,
        request.toAccount,
        request.amount,
        request.dayExecute,
        request.documentIDs,
    )
    if success:
        return {"success": True, "message": "Transaction linked successfully"}
    return {"success": False, "message": "Failed to link transaction"}


@payable_router.delete("/{payableID}/unlink-transaction")
async def unlink_transaction(payableID: str):
    success = unlinkPayableTransaction(payableID)
    if success:
        return {"success": True, "message": "Transaction unlinked successfully"}
    return {"success": False, "message": "Failed to unlink transaction"}
