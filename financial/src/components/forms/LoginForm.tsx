import { useNavigate } from "react-router-dom"
// import { Login } from "../../api/authorization"
import { useState } from "react"
// import type { LoginRequest } from "../../api/authorization/model"

export default function LoginForm() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="w-full flex flex-col items-center justify-center h-full gap-5">
            <strong>QUẢN LÝ HỢP ĐỒNG</strong>
            <input 
                type="text" 
                placeholder="Username" 
                className="text-input p-3" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                className="text-input p-3" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn p-3" onClick={async () => {
                navigate("/dashboard");
                // // const loginRequest : LoginRequest = {
                //     username: username,
                //     password: password
                // };

                // const loginResponse = await Login(loginRequest);

                // if (loginResponse?.message === "Login successful") {
                //     navigate("/dashboard");
                // } else {
                //     alert("Login failed: " + (loginResponse?.error || "Unknown error"));
                // }
            }}>
                Đăng nhập
            </button>
        </div>
    )
}