from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from api.model.auth_model import *
from api.crud.user_crud import login_user, logout_user, save_refresh_token, check_refresh_token, get_user, change_user_status, change_user_password
from config import pwd_context, TOKEN_SECRET_KEY, TOKEN_ALGORITHM, ACCESS_TOKEN_EXPIRE_SECONDS, REFRESH_TOKEN_EXPIRE_SECONDS, ADMIN_USER_ID
from jose import jwt

security = HTTPBearer()

def login(request: LoginRequest):
    try:
        user = login_user(request.username)
        if user is None:
            return {"success": False, "message": "Mật khẩu hoặc tên người dùng không đúng"}
        # Kiểm tra trạng thái của người dùng
        if user["status"] != "active":
            return {"success": False, "message": "Tài khoản người dùng đã bị vô hiệu hóa"}
        # Kiểm tra mật khẩu
        if not pwd_context.verify(request.password, user['hashpass']):
            return {"success": False, "message": "Mật khẩu hoặc tên người dùng không đúng"}
        # Tạo token và refresh token
        access_token = createToken({"user_id": user['user_id']}, is_access_token=True)
        refresh_token = createToken({"user_id": user['user_id']}, is_access_token=False)
        # Lưu refresh token vào cơ sở dữ liệu
        refresh_expired = ( datetime.now(timezone.utc) + timedelta(seconds=REFRESH_TOKEN_EXPIRE_SECONDS)).replace(tzinfo=None) # UTC nhưng bỏ tzinfo để lưu DATETIME
        save_refresh_token(user['user_id'], refresh_token, refresh_expired)
        return {"success": True, "message": "Đăng nhập thành công", "token": access_token, "refresh_token": refresh_token, "permit": list(user["permit"]) if user["permit"] else list()}
    except Exception as e:
        print(f"[Error] Lỗi khi đăng nhập: {e}")
        return {"success": False, "message": "Đăng nhập thất bại"}

def refreshingToken(refresh_token: str):
    try:
        # Giải mã refresh token
        payload = jwt.decode(refresh_token, TOKEN_SECRET_KEY, algorithms=[TOKEN_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            return {"success": False, "message": "Refresh token không hợp lệ"}
        # Kiểm tra refresh token trong cơ sở dữ liệu
        user = check_refresh_token(user_id, refresh_token)
        if not user:
            return {"success": False, "message": "Refresh token không hợp lệ hoặc đã hết hạn"}
        # Kiểm tra trạng thái của người dùng
        if user["status"] != "active":
            return {"success": False, "message": "Tài khoản người dùng đã bị vô hiệu hóa"}
        # Tạo access token mới
        access_token = createToken({"user_id": user['user_id']}, is_access_token=True)
        return {"success": True, "message": "Tạo access token mới thành công", "token": access_token}
    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Refresh token đã hết hạn"}
    except jwt.JWTError:
        return {"success": False, "message": "Refresh token không hợp lệ"}
    except Exception as e:
        print(f"[Error] Lỗi khi tạo access token mới: {e}")
        return {"success": False, "message": "Tạo access token mới thất bại"}

def logout(refresh_token: str):
    try:
        # Giải mã refresh token
        payload = jwt.decode(refresh_token, TOKEN_SECRET_KEY, algorithms=[TOKEN_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            return {"success": False, "message": "Refresh token không hợp lệ"}
        # Kiểm tra refresh token trong cơ sở dữ liệu
        user = check_refresh_token(user_id, refresh_token)
        if not user:
            return {"success": False, "message": "Refresh token không hợp lệ hoặc đã hết hạn"}
        # Xóa refresh token trong cơ sở dữ liệu
        logout_user(user_id)
        return {"success": True, "message": "Đăng xuất thành công"}
    except jwt.ExpiredSignatureError:
        return {"success": True, "message": "Refresh token đã hết hạn"}
    except jwt.JWTError:
        return {"success": False, "message": "Refresh token không hợp lệ"}
    except Exception as e:
        print(f"[Error] Lỗi khi đăng xuất: {e}")
        return {"success": False, "message": "Đăng xuất thất bại"}

# kiểm tra quyền truy cập của access token
def checkAccessToken(token: str, required_permits: list) -> dict | None:
    try:
        payload = jwt.decode(token, TOKEN_SECRET_KEY, algorithms=[TOKEN_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            return None
        # Kiểm tra user_id có tồn tại trong cơ sở dữ liệu hay không
        user = get_user(user_id)
        if not user:
            return None
        # Kiểm tra trạng thái của người dùng
        if user["status"] != "active":
            return None
        if user["refreshToken"] is None or user["refreshExpired"] is None:
            # Nếu refreshToken hoặc refreshExpired là None, có nghĩa là user đã đăng xuất, nên không cho phép truy cập
            return None
        # Kiểm tra quyền truy cập của user trong cơ sở dữ liệu
        if "admin" in user["permit"] and user_id == ADMIN_USER_ID:
            # Nếu user là admin, cho phép truy cập tất cả các chức năng
            return user
        if user["refreshExpired"] < datetime.now(timezone.utc).replace(tzinfo=None):
            # Nếu refreshExpired đã hết hạn
            return None
        # Kiểm tra quyền truy cập từ cơ sở dữ liệu
        if required_permits == []:
            # Nếu không yêu cầu quyền truy cập cụ thể hiểu là chỉ cần user tồn tại và đang hoạt động
            return user
        if not all(perm in user["permit"] for perm in required_permits):
            return None
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
    except Exception as e:
        print(f"[Error] Lỗi khi kiểm tra quyền truy cập: {e}")
        return None
    
# Lấy thông tin người dùng hiện tại từ access token
def getCurrentUser(required_permits: list[str]):
    def get_User(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        # Lấy token từ header Authorization Bearer
        token = credentials.credentials
        # Kiểm tra quyền truy cập của access token
        user = checkAccessToken(token, required_permits)
        if not user:
            raise HTTPException(
                status_code=201, # 201: Access_token_false code đặc biệt để client biết tự refresh token
                detail="Access_token_false"
            )
        return user
    return get_User

# Thay đổi trạng thái người dùng: active <-> inactive
def changeUserStatus(user: dict) -> bool:
    try:
        user_id = user["user_id"]
        if user_id == ADMIN_USER_ID:
            return {"success": False, "message": "Không thể thay đổi trạng thái của người dùng admin"}
        new_status = "inactive" if user["status"] == "active" else "active"
        success = change_user_status(user_id, new_status)
        if not success:
            return {"success": False, "message": "Thay đổi trạng thái người dùng thất bại"}
        return {"success": True, "message": "Thay đổi trạng thái người dùng thành công"}
    except Exception as e:
        print(f"[Error] Lỗi khi thay đổi trạng thái người dùng: {e}")
        return {"success": False, "message": "Thay đổi trạng thái người dùng thất bại"}

# Thay đổi mật khẩu người dùng
def changeUserPassword(user: dict, request: ChangePasswordRequest) -> bool:
    try:
        user_id = user["user_id"]
        if not pwd_context.verify(request.old_password, user['hashpass']):
            return {"success": False, "message": "Mật khẩu hiện tại không đúng"}
        hashed_password = pwd_context.hash(request.new_password)
        success = change_user_password(user_id, hashed_password)
        if not success:
            return {"success": False, "message": "Thay đổi mật khẩu người dùng thất bại"}
        return {"success": True, "message": "Thay đổi mật khẩu người dùng thành công"}
    except Exception as e:
        print(f"[Error] Lỗi khi thay đổi mật khẩu người dùng: {e}")
        return {"success": False, "message": "Thay đổi mật khẩu người dùng thất bại"}

# hàm tạo token
def createToken(data, is_access_token:bool=True):
    to_encode = data.copy()

    if is_access_token:
        expire = datetime.now(timezone.utc) + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
    else:
        expire = datetime.now(timezone.utc) + timedelta(seconds=REFRESH_TOKEN_EXPIRE_SECONDS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    })

    token = jwt.encode(to_encode, TOKEN_SECRET_KEY, algorithm=TOKEN_ALGORITHM)
    return token
