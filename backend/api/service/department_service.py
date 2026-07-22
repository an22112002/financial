from datetime import datetime, timedelta
import json

from api.crud.department_crud import *
from api.crud.contract_crud import get_contracts_with_department_id
from api.crud.payable_crud import get_payables_with_contract_id, number_receive_payable_in_contract, number_pay_payable_in_contract
import uuid
from fastapi import HTTPException

from api.model.contract_model import Moment
from api.model.department_model import Department, DepartmentContractsData
    
def getDepartments() -> list[Department]:
    try:
        departments = get_departments()
        data = list()
        for department in departments:
            data.append(
                Department(
                    departmentID=department["department_id"], 
                    name=department["name"]
                )
            )
        return data
    except Exception as e:
        print(f"[Error] Lỗi khi lấy danh sách phòng ban: {e}")
        return []
    
def createDepartment(name: str) -> list[Department] | None:
    try:
        name = name.strip().upper() # chuẩn hóa tên phòng ban
        # Kiểm tra xem tên phòng ban đã tồn tại chưa
        if is_department_name_exists(name):
            raise HTTPException(status_code=200, detail=f"Tên phòng ban '{name}' đã tồn tại.")
        # Tạo ID ngẫu nhiên cho phòng ban
        newId = str(uuid.uuid4())
        while is_department_id_exist(newId):
            newId = str(uuid.uuid4())
        # Tạo phòng ban mới với ID và tên đã cho
        success = create_department(newId, name)
        if success:
            return getDepartments()
        else:
            return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Error] Lỗi khi tạo phòng ban: {e}")
        return None
    
def deleteDepartment(departmentID: str) -> list[Department] | None:
    try:
        # Kiểm tra xem phòng ban có tồn tại không
        if not is_department_id_exist(departmentID):
            raise HTTPException(status_code=200, detail=f"Phòng ban không tồn tại.")
        # Kiểm tra xem phòng ban có đang được sử dụng trong các hợp đồng không
        if number_contract_in_department(departmentID) > 0:
            raise HTTPException(status_code=200, detail=f"Phòng ban đang có hợp đồng không thể xóa.")
        # Xóa phòng ban
        success = delete_department(departmentID)
        if success:
            return getDepartments()
        else:
            return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Error] Lỗi khi xóa phòng ban: {e}")
        return None
    
def getDepartmentsWithContractData(departmentID: str) -> list[DepartmentContractsData]:
    try:
        departments = get_departments()
        data = list()
        for department in departments:
            if department["department_id"] != departmentID:
                continue
            contracts = get_contracts_with_department_id(department["department_id"])
            for contract in contracts:
                payable_data = []
                payables = get_payables_with_contract_id(contract["contract_id"])
                for payable in payables:
                    status, condition = getTypePayable(Moment(**json.loads(payable["moment"])))
                    if status != "orther":
                        payable_data.append({
                            "payableID": payable["payable_id"],
                            "type": status,
                            "amount": payable["amount"],
                            "condition": condition,
                            "note": payable["note"]
                        })
                data.append(
                    DepartmentContractsData(
                        contractID=contract["contract_id"],
                        title=contract["title"],
                        contractType=getTypeContract(contract["contract_id"]),
                        payableNow=payable_data
                    )
                )
        return data
    except Exception as e:
        print(f"[Error] Lỗi khi lấy danh sách phòng ban với số lượng hợp đồng: {e}")
        return []
    
# hàm trợ giúp

# trạng thái công nợ "orther", "intime", "delay", "waiting"
# input: class Moment(BaseModel):
#     type: Literal["date", "condition"]
#     isConditionMet: bool | None = None; # chỉ có khi type là "condition"
#     needDocument: bool # chỉ có khi type là "condition"
#     documentCondition: list[Document] | None = None; # chỉ có khi type là "condition" và needDocument là true
#     date: str | None = None
#     delay: int; # số ngày trễ sau khi điều kiện được đáp ứng hoặc sau ngày được chỉ định
#     condition: str | None = None
def getTypePayable(moment: Moment) -> tuple[str, str]:
    today = datetime.now().date()
    if moment.type == "date":
        if moment.date is None:
            return "orther", ""
        begin_date = datetime.strptime(moment.date, "%Y-%m-%d").date()
        late_date = datetime.strptime(moment.date, "%Y-%m-%d").date() + timedelta(days=moment.delay)
        if today < begin_date:
            return "orther", ""
        elif begin_date <= today <= late_date:
            return "intime", begin_date.strftime("%Y-%m-%d") + " -> " + late_date.strftime("%Y-%m-%d")
        else:
            return "delay", begin_date.strftime("%Y-%m-%d") + " -> " + late_date.strftime("%Y-%m-%d")
    elif moment.type == "condition":
        if moment.isConditionMet is None:
            return "orther", ""
        if not moment.isConditionMet:
            return "waiting", "Chưa hoàn thành: " + moment.condition
        else:
            if moment.date is None:
                return "orther", ""
            begin_date = datetime.strptime(moment.date, "%Y-%m-%d").date()
            late_date = datetime.strptime(moment.date, "%Y-%m-%d").date() + timedelta(days=moment.delay)
            if today < begin_date:
                return "orther", ""
            elif begin_date <= today <= late_date:
                return "intime", begin_date.strftime("%Y-%m-%d") + " -> " + late_date.strftime("%Y-%m-%d")
            else:
                return "delay", begin_date.strftime("%Y-%m-%d") + " -> " + late_date.strftime("%Y-%m-%d")
    else:
        return "orther", ""

def getTypeContract(contractID: str) -> str:
    receive_count = number_receive_payable_in_contract(contractID)
    pay_count = number_pay_payable_in_contract(contractID)
    if receive_count >  pay_count:
        return "receive"
    elif receive_count < pay_count:
        return "pay"
    return "pay"
    