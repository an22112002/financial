import { useNavigate } from "react-router-dom"
import { Login } from "../../api/authority"
import { useState, useEffect } from "react"
import { openNotification } from "../../utils"
import { refreshToken } from "../../api/authority"

export default function LoginForm() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const autoLogin = async () => {
            const refresh_token = localStorage.getItem("refresh_token");
            if (!refresh_token) {
                // User is not logged in, do nothing
                return;
            }

            try {
                const res = await refreshToken(refresh_token);
                if (res) {
                    localStorage.setItem("token", res.token);
                    navigate("/dashboard", { replace: true });
                }
            } catch {
                // Refresh token is invalid or expired, clear local storage and redirect to login
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
            }
        }
        autoLogin();
    }, [navigate]);

    const handleLogin = async () => {
        if (!username || !password) {
            openNotification('warning', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }
        const res = await Login(username, password);
        if (res) {
            localStorage.setItem("token", res.token);
            localStorage.setItem("refresh_token", res.refresh_token);
            localStorage.setItem("permit", JSON.stringify(res.permit));
            // openNotification('success', 'Đăng nhập thành công', 'Chào mừng bạn đến với hệ thống quản lý hợp đồng');
            navigate("/dashboard");
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center h-full gap-5">
            <strong>QUẢN LÝ HỢP ĐỒNG</strong>
            <input 
                type="text" 
                placeholder="Username" 
                className="text-input p-3" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // ấn enter đổi sang ô password
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const passwordInput = document.getElementById('password-input') as HTMLInputElement | null;
                        if (passwordInput) {
                            passwordInput.focus();
                        }
                    }
                }}
            />
            <input 
                id="password-input"
                type="password" 
                placeholder="Password" 
                className="text-input p-3" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // ấn enter để đăng nhập
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleLogin();
                    }
                }}
            />
            <button className="btn p-3" onClick={async () => {
                handleLogin();
            }}>
                Đăng nhập
            </button>
        </div>
    )
}