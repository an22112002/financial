from pydantic import BaseModel, Field

from api.model.contract_model import Document, Moment


class TransactionDocument(BaseModel):
    documentID: str
    name: str
    fileType: str
    url: str | None = None


class TransactionModel(BaseModel):
    transactionID: str
    payableID: str
    bankTransactionId: str
    fromAccount: str
    toAccount: str
    amount: float
    dayExecute: str
    documents: list[TransactionDocument] = Field(default_factory=list)


class PayableDetailModel(BaseModel):
    id: int
    totalAmount: float
    contractID: str
    contractTitle: str
    partner: str
    type: str
    originalPayDate: Moment
    note: str
    lateFee: float
    delay: int
    status: str
    payment: list[TransactionModel] = Field(default_factory=list)


class LinkPayableTransactionRequest(BaseModel):
    payableID: str
    bankTransactionId: str
    fromAccount: str
    toAccount: str
    amount: float
    dayExecute: str
    documentIDs: list[str] = Field(default_factory=list)
