import json, os
import mimetypes

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from api.service.file_service import saveFileUploaded, deleteFile
from api.crud.files_crud import get_file

file_router = APIRouter(prefix="/files", tags=["files"])

@file_router.post("/upload")
async def upload_document(uploadFiles: list[UploadFile] = File(...)):
    documents = saveFileUploaded(uploadFiles)
    return {"success": True, "message": "Documents uploaded", "data": documents}

@file_router.delete("/delete/{fileID}")
async def delete_document(fileID: str):
    success = deleteFile(fileID)
    if success:
        return {"success": True, "message": "Document deleted"}
    else:
        return {"success": False, "message": "Failed to delete document"}
    
@file_router.get("/documents/{document_id}/view/{document_name}")
async def view_document(document_id: str):
    file = get_file(document_id)
    if not file:
        return {"success": False, "message": "Document not found"}
    position = file.get("position")
    if not position:
        return {"success": False, "message": "Document position not found"}
    position = json.loads(position)
    path = position.get("path")

    if not (os.path.exists(path) and os.path.isfile(path) and os.access(path, os.R_OK)):
        return {"success": False, "message": "File not accessible"}
    
    filename = file.get("filename", "")

    response = FileResponse(
        path,
        media_type=mimetypes.guess_type(path)[0]
    )

    response.headers["Content-Disposition"] = "inline"
    return response

@file_router.get("/documents/{document_id}/download/{document_name}")
async def download_document(document_id: str):
    file = get_file(document_id)
    if not file:
        return {"success": False, "message": "Document not found"}
    position = file.get("position")
    if not position:
        return {"success": False, "message": "Document position not found"}
    position = json.loads(position)
    path = position.get("path")

    if not (os.path.exists(path) and os.path.isfile(path) and os.access(path, os.R_OK)):
        return {"success": False, "message": "File not accessible"}

    return FileResponse(
        path,
        media_type="application/octet-stream",
        filename=file.get("filename", "")
    )