from api.model.auth_model import *

def login(request: LoginRequest):
    if request.username == "admin" and request.password == "password":
        return LoginResponse(success=True, message="Login successful", token="fake-jwt-token")
    return LoginResponse(success=False, message="Invalid credentials", token=None)