import json
import traceback
from datetime import datetime, timedelta
from typing import Any

from api.crud.contract_crud import get_contract
from api.crud.files_crud import get_documents_with_paper_id, update_file_paper
from api.crud.partner_crud import get_partners_with_contract_id
from api.crud.payable_crud import get_payables_with_contract_id
from api.crud.transaction_crud import (
    create_transaction,
    delete_transaction_by_payable_id,
    get_transactions_with_payable_id,
    get_transaction_by_payable_id,
    set_transaction_payable,
    update_transaction,
)
from api.model.contract_model import Moment


def _file_url(document: dict[str, Any]) -> str | None:
    document_id = document.get("file_id")
    filename = document.get("filename")
    if not document_id or not filename:
        return None
    return f"/files/documents/{document_id}/download/{filename}"


def _serialize_document(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "documentID": document.get("file_id"),
        "name": document.get("filename"),
        "fileType": (document.get("filename") or "").split(".")[-1],
        "url": _file_url(document),
    }


def _serialize_transaction(transaction: dict[str, Any]) -> dict[str, Any]:
    transaction_documents = get_documents_with_paper_id(transaction["transaction_id"])
    return {
        "transactionID": transaction["transaction_id"],
        "payableID": transaction["payable_id"],
        "bankTransactionId": str(transaction["bankTransactionId"]),
        "fromAccount": transaction["fromAccount"],
        "toAccount": transaction["toAccount"],
        "amount": float(transaction["amount"]),
        "dayExecute": transaction["dayExecute"].strftime("%Y-%m-%d %H:%M:%S") if hasattr(transaction["dayExecute"], "strftime") else str(transaction["dayExecute"]),
        "documents": [_serialize_document(document) for document in transaction_documents],
    }


def _compute_status(moment: Moment, total_amount: float, paid_amount: float) -> str:
    if paid_amount >= total_amount and total_amount > 0:
        return "paid"

    today = datetime.now().date()

    if moment.type == "date":
        if not moment.date:
            return "pending"
        begin_date = datetime.strptime(moment.date, "%Y-%m-%d").date()
        late_date = begin_date + timedelta(days=moment.delay)
        if today < begin_date:
            return "pending"
        if paid_amount > 0:
            return "not_enough" if paid_amount < total_amount else "paid"
        return "waiting" if today <= late_date else "overdue"

    if moment.type == "condition":
        if not moment.isConditionMet:
            return "waiting"
        if not moment.date:
            return "pending"
        begin_date = datetime.strptime(moment.date, "%Y-%m-%d").date()
        late_date = begin_date + timedelta(days=moment.delay)
        if today < begin_date:
            return "pending"
        if paid_amount > 0:
            return "not_enough" if paid_amount < total_amount else "paid"
        return "waiting" if today <= late_date else "overdue"

    return "pending"


def getContractPayables(contractID: str) -> list[dict[str, Any]]:
    try:
        contract = get_contract(contractID)
        if not contract:
            return []

        partners = get_partners_with_contract_id(contractID)
        partner_lookup = {
            p.get("partner_id") or p.get("partnerID"): p.get("partnerName") or p.get("name") or ""
            for p in partners
        }

        payables = get_payables_with_contract_id(contractID)
        result: list[dict[str, Any]] = []

        for index, payable in enumerate(payables, start=1):
            moment = Moment(**json.loads(payable["moment"]))
            payable_documents = get_documents_with_paper_id(payable["payable_id"])
            transactions = get_transactions_with_payable_id(payable["payable_id"])
            payment_list = [_serialize_transaction(transaction) for transaction in transactions]
            paid_amount = sum(payment["amount"] for payment in payment_list)
            total_amount = float(payable["amount"]) * (1 + float(payable["tax"]) / 100)

            if payable_documents and moment.type == "condition":
                moment.documentCondition = [_serialize_document(document) for document in payable_documents]

            result.append({
                "id": index,
                "payableID": payable["payable_id"],
                "totalAmount": total_amount,
                "contractID": contractID,
                "contractTitle": contract["title"],
                "partner": partner_lookup.get(payable["partner_id"], payable["partner_id"]),
                "type": payable["type"],
                "originalPayDate": moment,
                "note": payable["note"],
                "lateFee": float(payable["lateFee"]),
                "delay": moment.delay,
                "status": _compute_status(moment, total_amount, paid_amount),
                "payment": payment_list,
            })

        return result
    except Exception as e:
        print(f"[Error] Lỗi khi lấy danh sách công nợ hợp đồng: {e}")
        traceback.print_exc()
        return []

# 1 payable có thể có nhiều transaction, 1 transaction có thể liên kết với nhiều tài liệu, 1 transaction chỉ liên kết với 1 payable.
def linkPayableTransaction(
    payableID: str,
    bankTransactionId: str,
    fromAccount: str,
    toAccount: str,
    amount: float,
    dayExecute: str,
    documentIDs: list[str],
) -> bool:
    try:
        existing = get_transactions_with_payable_id(payableID)
        if existing:
            if bankTransactionId not in [t["bankTransactionId"] for t in existing]:
                # Nếu có transaction khác với bankTransactionId khác, thì thêm transaction mới
                transactionID = create_transaction(payableID, bankTransactionId, fromAccount, toAccount, amount, dayExecute)
                success = True
            else:
                # Nếu có transaction với bankTransactionId giống nhau, thì update transaction đó
                transaction = next((t for t in existing if t["bankTransactionId"] == bankTransactionId), None)
                if not transaction:
                    print(f"[Error] Không tìm thấy transaction với bankTransactionId {bankTransactionId}")
                    return False
                transactionID = transaction["transaction_id"]
                success = update_transaction(transactionID, payableID, bankTransactionId, fromAccount, toAccount, amount, dayExecute)
        else:
            # Nếu chưa có transaction nào, thì tạo transaction mới
            transactionID = create_transaction(payableID, bankTransactionId, fromAccount, toAccount, amount, dayExecute)
            success = True

        if not success:
            return False
        for fileID in documentIDs:
            update_file_paper(fileID, transactionID)

        return True
    except Exception as e:
        print(f"[Error] Lỗi khi ghép giao dịch vào công nợ: {e}")
        traceback.print_exc()
        return False


def unlinkPayableTransaction(payableID: str) -> bool:
    try:
        transaction = get_transaction_by_payable_id(payableID)
        if not transaction:
            return True

        documents = get_documents_with_paper_id(transaction["transaction_id"])
        for document in documents:
            update_file_paper(document["file_id"], None)

        return delete_transaction_by_payable_id(payableID)
    except Exception as e:
        print(f"[Error] Lỗi khi tách giao dịch khỏi công nợ: {e}")
        traceback.print_exc()
        return False
