import json
import time
import uuid, os
from fastapi import HTTPException
from fastapi import UploadFile
from api.model.contract_model import Document
from config import FILES_SAVE_FOLDER

from api.crud.files_crud import delete_file, exist_file_id, create_file, get_file

def saveFileUploaded(files: list[UploadFile]) -> list[Document]:
    try:
        for file in files:
            ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
            if ext not in ["pdf", "docx", "xlsx", "txt", "jpg", "png"]:
                raise HTTPException(status_code=200, detail=f"File {file.filename} có định dạng không hợp lệ. Chỉ chấp nhận các định dạng: pdf, docx, xlsx, txt, jpg, png")
        cache = []
        for file in files:
            # Tạo ID ngẫu nhiên cho file
            fileID = str(uuid.uuid4())
            while exist_file_id(fileID):
                fileID = str(uuid.uuid4())
            # Lưu file vào thư mục
            original_filename = file.filename
            ext = os.path.splitext(original_filename)[1].lower()
            new_filename = fileID + ext  # đổi tên file thành ID + phần mở rộng
            file_path = os.path.join(FILES_SAVE_FOLDER, new_filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())
            # Lưu file vào cơ sở dữ liệu
            position = {
                "place": "local",
                "path": file_path,
                "uploaded_at": str(int(time.time()))
            }
            success = create_file(fileID, original_filename, position)
            if not success:
                for info in cache:
                    delete_file(info["id"])  # Xóa các file đã lưu database trước đó nếu có lỗi
                    os.remove(info["path"]) # Xóa các file đã lưu folder trước đó nếu có lỗi
                raise HTTPException(status_code=200, detail="Lưu file thất bại")
            cache.append({"id": fileID, "path": file_path, "name": original_filename, "ext": ext})
        result = []
        for info in cache:
            document = Document(
                documentID=info["id"],
                name=info["name"],
                fileType=info["ext"].replace(".", ""),
                url=os.path.basename(info["path"])
            )
            result.append(document)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[Error] Lỗi khi lưu file: {e}")
        return []
    
def deleteUnsavedDBFiles(fileIDs: list[str]) -> bool:
    pass
    
def deleteFile(fileID: str) -> bool:
    try:
        if not exist_file_id(fileID):
            raise HTTPException(status_code=200, detail="File không tồn tại")
        file_info = get_file(fileID)
        if not file_info:
            raise HTTPException(status_code=200, detail="File không tồn tại")
        # Vị trí file thật
        position = json.loads(file_info["position"])
        # File lưu trên máy, nếu file lưu khác thì logic xóa file sẽ khác, ví dụ file lưu trên S3 thì sẽ xóa trên S3
        if position.get("place") == "local":
            # Xóa file khỏi thư mục
            file_path = position.get("path")
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        # Xóa file khỏi cơ sở dữ liệu
        success = delete_file(fileID)
        if not success:
            raise HTTPException(status_code=200, detail="Xóa file thất bại")
        return True
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[Error] Lỗi khi xóa file: {e}")
        return False
    
# thêm tiến trình tự động xóa các file đã upload nhưng không được lưu vào cơ sở dữ liệu sau 1 giờ