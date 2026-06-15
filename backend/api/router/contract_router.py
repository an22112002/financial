import os

from fastapi import APIRouter, UploadFile, File, Form
from api.model.contract_model import Document

contract_router = APIRouter(prefix="/contracts", tags=["contracts"])

@contract_router.get("/")
async def get_contracts():
    return {"message": "List of contracts"}

@contract_router.post("/")
async def create_contract():
    return {"message": "Contract created"}

@contract_router.post("/documents/upload")
async def upload_document(uploadFiles: list[UploadFile] = File(...), contractCode: str = Form(...)):
    # Tạm thời chỉ phản hồi chưa xử lý file
    print("Contract Code:", contractCode)
    documents = []
    for file in uploadFiles:
        ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
        if ext not in ["pdf", "docx", "xlsx", "txt", "jpg", "png"]:
            continue
        document = Document(
            id=file.filename,
            name=file.filename,
            fileType=ext,
            url=f"/documents/{file.filename}"
        )
        documents.append(document)
    return {"message": "Documents uploaded", "documents": documents}