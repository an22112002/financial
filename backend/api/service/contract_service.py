import json
import traceback
import uuid
from datetime import datetime
from typing import Any, Literal

from fastapi import HTTPException

from api.crud.contract_crud import *
from api.crud.payable_crud import (
    create_payable,
    exist_payable_id,
    delete_payables,
    delete_payable,
    get_payables_with_contract_id,
)
from api.crud.partner_crud import (
    create_partner,
    exist_partner_id,
    delete_partner,
    delete_partner_by_id,
    get_partners_with_contract_id,
)
from api.crud.files_crud import (
    exist_file_id,
    update_file_paper,
    clear_file_paper,
    get_documents_with_contract_id,
)
from api.model.contract_model import Moment, SearchRequest, Contract, FinishMoment

# Nếu CRUD chưa có các hàm này thì cần bổ sung trong module CRUD tương ứng.
try:
    from api.crud.contract_crud import update_contract
except Exception:
    update_contract = None

try:
    from api.crud.partner_crud import update_partner
except Exception:
    update_partner = None

try:
    from api.crud.payable_crud import update_payable
except Exception:
    update_payable = None


def _to_dict(item: Any) -> dict[str, Any]:
    if hasattr(item, "model_dump"):
        return item.model_dump()
    if isinstance(item, dict):
        return item
    return {}


def _get_partner_name(item: Any) -> str | None:
    if isinstance(item, str):
        return item.strip()
    data = _to_dict(item)
    return (data.get("name") or data.get("partnerName") or data.get("partner") or "").strip() or None


def _get_partner_id(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("partnerID") or data.get("partner_id") or data.get("id")


def _get_partner_bank_id(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("bankID") or data.get("bankId") or data.get("bank_id")


def _get_partner_bank_account(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("bankAccount") or data.get("bank_account")


def _serialize_partner(partner: dict) -> dict[str, Any]:
    return {
        "partnerID": partner.get("partner_id") or partner.get("partnerID"),
        "name": partner.get("partnerName") or partner.get("name") or "",
        "address": partner.get("address"),
        "phone": partner.get("phone"),
        "taxCode": partner.get("taxCode"),
        "bankAccount": partner.get("bankAccount"),
        "bankID": str(partner.get("bankID")) if partner.get("bankID") is not None else None,
    }


def _get_payable_id(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("id") or data.get("payableID") or data.get("payable_id")


def _get_payable_partner_ref(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("partner")


def _get_document_id(item: Any) -> str | None:
    data = _to_dict(item)
    return data.get("documentID") or data.get("file_id") or data.get("id")


def _get_contract_partners(data: Contract) -> list[Any]:
    partners = getattr(data, "partners", None)
    if partners is None:
        partners = getattr(data, "partner", [])
    return list(partners or [])


def _build_partner_lookup(current_partners: list[dict], created_partners: list[dict]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for p in current_partners + created_partners:
        pid = p.get("partner_id") or p.get("partnerID")
        pname = p.get("partnerName") or p.get("name")
        if pid:
            lookup[pid] = pid
        if pname and pid:
            lookup[pname] = pid
    return lookup


def createContract(data: Contract) -> bool:
    try:
        is_valid, message = validate_contract_data(data, mode="create")
        if not is_valid:
            raise HTTPException(status_code=200, detail=message)

        data.status = "waiting"
        newId = str(uuid.uuid4())
        while exist_id(newId):
            newId = str(uuid.uuid4())
        data.contractID = newId

        success = create_contract(data)
        if not success:
            raise HTTPException(status_code=200, detail="Tạo hợp đồng thất bại")

        partners: list[dict] = []
        for partner_item in _get_contract_partners(data):
            partner_name = _get_partner_name(partner_item)
            if not partner_name:
                raise HTTPException(status_code=200, detail="Thiếu tên đối tác")

            partnerID = _get_partner_id(partner_item)
            bankID = _get_partner_bank_id(partner_item)
            bankAccount = _get_partner_bank_account(partner_item)
            address = _to_dict(partner_item).get("address")
            phone = _to_dict(partner_item).get("phone")
            taxCode = _to_dict(partner_item).get("taxCode")
            if not partnerID:
                partnerID = str(uuid.uuid4())
                while exist_partner_id(partnerID):
                    partnerID = str(uuid.uuid4())
                success = create_partner(partnerID, data.contractID, partner_name, address, phone, taxCode, bankID, bankAccount)
                if not success:
                    delete_contract(data.contractID)
                    raise HTTPException(status_code=200, detail="Tạo đối tác thất bại")
            else:
                # Nếu client đã gửi partnerID thì chỉ dùng lại khi CRUD hỗ trợ cập nhật
                if not exist_partner_id(partnerID):
                    success = create_partner(partnerID, data.contractID, partner_name, address, phone, taxCode, bankID, bankAccount)
                    if not success:
                        delete_contract(data.contractID)
                        raise HTTPException(status_code=200, detail="Tạo đối tác thất bại")

                if update_partner:
                    update_partner(partnerID, data.contractID, partner_name, address, phone, taxCode, bankID, bankAccount)

            partners.append({
                "partnerID": partnerID,
                "name": partner_name,
                "address": address,
                "phone": phone,
                "taxCode": taxCode,
                "bankAccount": bankAccount,
                "bankID": bankID,
            })

        partner_lookup = _build_partner_lookup([], partners)

        for payable in data.payables:
            payable_id = getattr(payable, "id", None) or _get_payable_id(payable)
            if not payable_id:
                payable_id = str(uuid.uuid4())
                while exist_payable_id(payable_id):
                    payable_id = str(uuid.uuid4())
                payable.id = payable_id
            else:
                payable.id = payable_id

            partner_ref = _get_payable_partner_ref(payable)
            partner_ID = partner_lookup.get(partner_ref)
            if not partner_ID:
                raise HTTPException(status_code=200, detail=f"Đối tác {partner_ref} không tồn tại")

            success = create_payable(payable, data.contractID, partner_ID)
            if not success:
                delete_payables(data.contractID)
                delete_partner(data.contractID)
                delete_contract(data.contractID)
                raise HTTPException(status_code=200, detail="Tạo công nợ thất bại")

        for document in data.documents:
            document_id = _get_document_id(document)
            if not document_id:
                raise HTTPException(status_code=200, detail="Tài liệu thiếu documentID")
            if not exist_file_id(document_id):
                delete_payables(data.contractID)
                delete_partner(data.contractID)
                delete_contract(data.contractID)
                raise HTTPException(status_code=200, detail=f"Tài liệu không tồn tại")

            success = update_file_paper(document_id, data.contractID)
            if not success:
                delete_payables(data.contractID)
                delete_partner(data.contractID)
                delete_contract(data.contractID)
                raise HTTPException(status_code=200, detail="Lưu tài liệu thất bại")

        return True

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Error] Lỗi khi tạo hợp đồng: {e}")
        return False


def updateContract(data: Contract) -> bool:
    try:
        is_valid, message = validate_contract_data(data, mode="update")
        if not is_valid:
            raise HTTPException(status_code=200, detail=message)

        contract = get_contract(data.contractID)
        if not contract:
            raise HTTPException(status_code=200, detail="Hợp đồng không tồn tại")

        if update_contract is None:
            raise HTTPException(status_code=500, detail="Thiếu CRUD update_contract")

        success = update_contract(data)
        if not success:
            raise HTTPException(status_code=200, detail="Cập nhật hợp đồng thất bại")

        current_partners = get_partners_with_contract_id(data.contractID)
        current_payables = get_payables_with_contract_id(data.contractID)
        current_documents = get_documents_with_contract_id(data.contractID)

        partner_lookup: dict[str, str] = {}
        current_partner_ids = set()
        for p in current_partners:
            pid = p.get("partner_id") or p.get("partnerID")
            pname = p.get("partnerName") or p.get("name")
            if pid:
                current_partner_ids.add(pid)
                partner_lookup[pid] = pid
            if pid and pname:
                partner_lookup[pname] = pid

        incoming_partners = _get_contract_partners(data)
        incoming_partner_ids: set[str] = set()

        for partner_item in incoming_partners:
            partner_name = _get_partner_name(partner_item)
            if not partner_name:
                raise HTTPException(status_code=200, detail="Thiếu tên đối tác")

            partnerID = _get_partner_id(partner_item)
            bankID = _get_partner_bank_id(partner_item)
            bankAccount = _get_partner_bank_account(partner_item)
            address = _to_dict(partner_item).get("address")
            phone = _to_dict(partner_item).get("phone")
            taxCode = _to_dict(partner_item).get("taxCode")
            if partnerID:
                existed = any(
                    (p.get("partner_id") == partnerID or p.get("partnerID") == partnerID)
                    for p in current_partners
                )
                if not existed:
                    raise HTTPException(status_code=200, detail=f"Đối tác {partnerID} không tồn tại trong hợp đồng")

                if update_partner is None:
                    raise HTTPException(status_code=500, detail="Thiếu CRUD update_partner")

                ok = update_partner(partnerID, data.contractID, partner_name, address, phone, taxCode, bankID, bankAccount)
                if not ok:
                    raise HTTPException(status_code=200, detail=f"Cập nhật đối tác {partner_name} thất bại")
            else:
                partnerID = str(uuid.uuid4())
                while exist_partner_id(partnerID):
                    partnerID = str(uuid.uuid4())

                ok = create_partner(partnerID, data.contractID, partner_name, address, phone, taxCode, bankID, bankAccount)
                if not ok:
                    raise HTTPException(status_code=200, detail=f"Tạo mới đối tác {partner_name} thất bại")

            incoming_partner_ids.add(partnerID)
            partner_lookup[partnerID] = partnerID
            partner_lookup[partner_name] = partnerID

        current_payable_ids = {
            p.get("payable_id") or p.get("id") for p in current_payables if (p.get("payable_id") or p.get("id"))
        }
        incoming_payable_ids: set[str] = set()

        for payable in data.payables:
            payable_id = _get_payable_id(payable)
            partner_ref = _get_payable_partner_ref(payable)
            partner_ID = partner_lookup.get(partner_ref)

            if not partner_ID:
                raise HTTPException(status_code=200, detail=f"Đối tác {partner_ref} không tồn tại")

            if payable_id and payable_id in current_payable_ids:
                if update_payable is None:
                    raise HTTPException(status_code=500, detail="Thiếu CRUD update_payable")
                ok = update_payable(payable, data.contractID, partner_ID)
                if not ok:
                    raise HTTPException(status_code=200, detail=f"Cập nhật công nợ {payable_id} thất bại")
                incoming_payable_ids.add(payable_id)
            else:
                new_payable_id = payable_id or str(uuid.uuid4())
                while exist_payable_id(new_payable_id):
                    new_payable_id = str(uuid.uuid4())
                payable.id = new_payable_id

                ok = create_payable(payable, data.contractID, partner_ID)
                if not ok:
                    raise HTTPException(status_code=200, detail="Tạo công nợ thất bại")
                incoming_payable_ids.add(new_payable_id)

        removed_payable_ids = [payable_id for payable_id in current_payable_ids if payable_id not in incoming_payable_ids]
        for payable_id in removed_payable_ids:
            delete_payable(payable_id)

        removed_partner_ids = [partner_id for partner_id in current_partner_ids if partner_id not in incoming_partner_ids]
        for partner_id in removed_partner_ids:
            delete_partner_by_id(partner_id)

        current_document_ids = {
            d.get("file_id") or d.get("documentID") or d.get("id") for d in current_documents
            if (d.get("file_id") or d.get("documentID") or d.get("id"))
        }

        incoming_document_ids: set[str] = set()

        for document in data.documents:
            document_id = _get_document_id(document)
            if not document_id:
                raise HTTPException(status_code=200, detail="Tài liệu thiếu documentID")

            if not exist_file_id(document_id):
                raise HTTPException(status_code=200, detail=f"Tài liệu {document_id} không tồn tại")

            ok = update_file_paper(document_id, data.contractID)
            if not ok:
                raise HTTPException(status_code=200, detail=f"Cập nhật tài liệu {document_id} thất bại")
            incoming_document_ids.add(document_id)

        removed_document_ids = [document_id for document_id in current_document_ids if document_id not in incoming_document_ids]
        for document_id in removed_document_ids:
            clear_file_paper(document_id)

        return True

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Error] Lỗi khi cập nhật hợp đồng: {e}")
        traceback.print_exc()
        return False


def getCotractsBySearch(search: SearchRequest) -> list[Contract]:
    try:
        contracts = get_contracts_by_search(search)
        data = list()
        for contract in contracts:
            partners = get_partners_with_contract_id(contract["contract_id"])
            partner_list = list()
            partner_name_by_id: dict[str, str] = {}
            for partner in partners:
                partner_name = partner.get("partnerName") or ""
                partner_id = partner.get("partner_id") or partner.get("partnerID")
                if partner_id:
                    partner_name_by_id[partner_id] = partner_name
                partner_list.append(_serialize_partner(partner))

            payables = get_payables_with_contract_id(contract["contract_id"])
            payable_list = list()
            for payable in payables:
                partner_id = payable["partner_id"]
                payable_list.append({
                    "id": payable["payable_id"],
                    "amount": payable["amount"],
                    "partner": partner_name_by_id.get(partner_id, partner_id),
                    "type": payable["type"],
                    "tax": payable["tax"],
                    "lateFee": payable["lateFee"],
                    "note": payable["note"],
                    "moment": Moment(**json.loads(payable["moment"])),
                    "id_payment": None
                })

            documents = get_documents_with_contract_id(contract["contract_id"])
            document_list = list()
            for document in documents:
                document_list.append({
                    "documentID": document["file_id"],
                    "name": document["filename"],
                    "fileType": document["filename"].split(".")[-1]
                })

            data.append({
                "contractID": contract["contract_id"],
                "contractCode": contract["contractCode"],
                "contractNumber": contract["contractNumber"],
                "departmentID": contract["department_id"],
                "title": contract["title"],
                "contractContent": contract["content"],
                "signDate": contract["signDate"],
                "startDate": contract["dateStart"],
                "finishDate": FinishMoment(**json.loads(contract["dateEnd"])),
                "status": contract["status"],
                "userEdit": contract["userEdit"],
                "partner": [partner.get("name") for partner in partner_list if partner.get("name")],
                "partners": partner_list,
                "payables": payable_list,
                "documents": document_list
            })
        return data
    except Exception as e:
        print(f"[Error] Lỗi khi tìm kiếm hợp đồng: {e}")
        traceback.print_exc()
        return []


#####################################################################################################
# Kiểm tra các trường bắt buộc
def validate_contract_data(data: Contract, mode: Literal["create", "update"]) -> tuple[bool, str]:
    if mode == "update" and not data.contractID:
        return False, "Thiếu contractID"

    if not data.contractCode or not data.contractNumber or not data.title or not data.contractContent or not data.signDate or not data.startDate or not data.finishDate:
        return False, "Thiếu thông tin hợp đồng"

    if datetime.strptime(data.signDate, "%Y-%m-%d") > datetime.strptime(data.startDate, "%Y-%m-%d"):
        return False, "Ngày ký hợp đồng không được sau ngày bắt đầu"

    partners = _get_contract_partners(data)
    if not isinstance(partners, list) or any(not isinstance(p, (str, dict)) and not hasattr(p, "model_dump") for p in partners):
        return False, "Danh sách đối tác không hợp lệ"

    # if not isinstance(data.payables, list) or any(not isinstance(p, dict) for p in data.payables):
    #     return False, "Danh sách công nợ không hợp lệ"

    # if not isinstance(data.documents, list) or any(not isinstance(d, dict) for d in data.documents):
    #     return False, "Danh sách tài liệu không hợp lệ"

    return True, "Thông tin hợp đồng hợp lệ"