from pydantic import BaseModel, ConfigDict, Field, AliasChoices
from typing import Literal

class SearchRequest(BaseModel):
    contractCode :str | None = None
    contractNumber: str | None = None
    contractTitle: str | None = None
    partner: str | None = None
    signDate: str | None = None

class Document(BaseModel):
    documentID: str
    name: str
    fileType: Literal[
        "pdf",
        "docx",
        "xlsx",
        "txt",
        "jpg",
        "png"
    ]

class Partner(BaseModel):
    partnerID: str | None = None
    name: str
    address: str | None = None
    phone: str | None = None
    taxCode: str | None = None
    bankAccount: str | None = None
    bankID: str | None = None

class Moment(BaseModel):
    type: Literal["date", "condition"]
    isConditionMet: bool | None = None; # chỉ có khi type là "condition"
    needDocument: bool # chỉ có khi type là "condition"
    documentCondition: list[Document] | None = None; # chỉ có khi type là "condition" và needDocument là true
    date: str | None = None
    delay: int; # số ngày trễ sau khi điều kiện được đáp ứng hoặc sau ngày được chỉ định
    condition: str | None = None

class Payable(BaseModel):
    id: str | None = None
    amount: int
    partner: str
    type: Literal["receive", "pay"]
    tax: float
    lateFee: float
    note: str
    moment: Moment
    id_payment: str | None = None

class FinishMoment(BaseModel):
    type: Literal["date", "forever"]
    date: str | None = None
    condition: str | None = None

class Contract(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    contractID: str
    contractCode: str
    contractNumber: str
    departmentID: str | None = None
    title: str
    contractContent: str
    signDate: str
    startDate: str
    finishDate: FinishMoment
    status: Literal["waiting", "active", "completed", "terminated"]
    userEdit: str
    partners: list[Partner] = Field(
        default_factory=list,
        validation_alias=AliasChoices("partners", "partner"),
        serialization_alias="partners",
    )
    payables: list[Payable] = Field(default_factory=list)
    documents: list[Document] = Field(default_factory=list)