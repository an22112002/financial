from pydantic import BaseModel
from typing import Literal

class Department(BaseModel):
    departmentID: str
    name: str

class PayableShortInfo(BaseModel):
    payableID: str
    type: Literal["intime", "delay", "waiting"]
    condition: str
    note: str
    amount: float

class DepartmentContractsData(BaseModel):
    contractID: str
    title: str
    contractType: Literal["receive", "pay"]
    payableNow: list[PayableShortInfo]