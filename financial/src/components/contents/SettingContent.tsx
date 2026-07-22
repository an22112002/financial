import {useState} from "react"
import {Modal} from "antd"
import {EyeInvisibleOutlined, EyeOutlined, LogoutOutlined} from "@ant-design/icons"
import {changePassword, Logout} from "../../api/authority"
import { openNotification } from "../../utils"
import { useNavigate } from "react-router-dom"

export default function SettingContent() {
    const navigate = useNavigate()

    const [oldPassword, setOldPassword] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [openPasswordModal, setOpenPasswordModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChangePassword = async () => {
        if (!oldPassword || !password || !confirmPassword) {
            openNotification('warning', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (oldPassword === password) {
            openNotification('warning', 'Mật khẩu mới trùng mật khẩu cũ', 'Vui lòng nhập mật khẩu mới khác mật khẩu cũ');
            return;
        }
        if (!isValidPassword(password)) {
            return;
        }
        if (password !== confirmPassword) {
            openNotification('warning', 'Xác nhận mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận');
            return;
        }
        const result = await changePassword(oldPassword, password);
        if (result) {
            setOpenPasswordModal(false)
            setPassword("")
            setConfirmPassword("")
            setShowPassword(false)
            setShowConfirmPassword(false)
        }
        window.alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.")
        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token) {
            await Logout(refresh_token);
        }
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("permit");
            navigate("/");
        }, 1000);
    };

    return (
        <div className="w-full h-[85vh] bg-[#F0F0F0] overflow-auto flex flex-col gap-4 p-4">

            <span className="font-semibold">Mật khẩu</span>
            <p className="bg-[#22C55E] w-full md:w-[30%] text-white text-center py-2 px-4 rounded hover:bg-[#1da57a] hover:cursor-pointer"
                onClick={() => setOpenPasswordModal(true)}
            >Đổi mật khẩu</p>
            <Modal
                title="Đổi mật khẩu"
                open={openPasswordModal}
                onCancel={() => {setOpenPasswordModal(false)
                    setOldPassword("")
                    setPassword("")
                    setConfirmPassword("")
                    setShowPassword(false)
                    setShowConfirmPassword(false)
                }}
                footer={null}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2 items-center justify-center">
                        
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu cũ"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-center">

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu mới"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {showPassword ? (
                            <EyeOutlined className="bg-blue-500 text-white rounded p-1"
                                onClick={() => setShowPassword(false)}
                            />
                        ) : (
                            <EyeInvisibleOutlined className="bg-blue-500 text-white rounded p-1"
                                onClick={() => setShowPassword(true)}
                            />
                        )} 
                    </div>
                    
                    <div className="flex flex-row gap-2 items-center justify-center">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {showConfirmPassword ? (
                            <EyeOutlined className="bg-blue-500 text-white rounded p-1"
                                onClick={() => setShowConfirmPassword(false)}
                            />
                        ) : (
                            <EyeInvisibleOutlined className="bg-blue-500 text-white rounded p-1"
                                onClick={() => setShowConfirmPassword(true)}
                            />
                        )} 
                    </div>
                </div>

                <div className="flex justify-center mt-4">
                    <button
                        className="bg-[#22C55E] text-white py-2 px-4 rounded hover:bg-[#1da57a]"
                        onClick={async () => {
                            await handleChangePassword()
                        }}
                    >
                        Đổi mật khẩu mới
                    </button>
                </div>
                
            </Modal>
            <hr className="border-t border-gray-300" />

            <span className="font-semibold">Đăng xuất</span>
            <p className="bg-[#ff0000] w-full md:w-[30%] text-white text-center py-2 px-4 rounded hover:bg-[#d32f2f] hover:cursor-pointer"
                onClick={async () => {
                    const refresh_token = localStorage.getItem("refresh_token");
                    if (refresh_token) {
                        await Logout(refresh_token);
                    }
                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("permit");
                    navigate("/");
                }}
            ><LogoutOutlined rotate={-90} /> Đăng xuất</p>
        </div>
    )
}

function isValidPassword(password: string): boolean {
    // Kiểm tra độ dài mật khẩu
    if (password.length < 8) {
        openNotification('warning', 'Mật khẩu yếu', 'Mật khẩu phải có ít nhất 8 ký tự');
        return false;
    }
    // Kiểm tra có ít nhất một chữ cái viết hoa
    if (!/[A-Z]/.test(password)) {
        openNotification('warning', 'Mật khẩu yếu', 'Mật khẩu phải có ít nhất một chữ cái viết hoa');
        return false;
    }
    // Kiểm tra có ít nhất một chữ cái viết thường
    if (!/[a-z]/.test(password)) {
        openNotification('warning', 'Mật khẩu yếu', 'Mật khẩu phải có ít nhất một chữ cái viết thường');
        return false;
    }
    // Kiểm tra có ít nhất một chữ số
    if (!/[0-9]/.test(password)) {
        openNotification('warning', 'Mật khẩu yếu', 'Mật khẩu phải có ít nhất một chữ số');
        return false;
    }
    // Kiểm tra có ít nhất một ký tự đặc biệt
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        openNotification('warning', 'Mật khẩu yếu', 'Mật khẩu phải có ít nhất một ký tự đặc biệt');
        return false;
    }
    return true;
}
