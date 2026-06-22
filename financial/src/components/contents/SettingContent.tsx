import {useState} from "react"
import {Modal} from "antd"
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons"

export default function SettingContent() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [openPasswordModal, setOpenPasswordModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
                        onClick={() => {
                            // Xử lý logic đổi mật khẩu ở đây
                            console.log("Mật khẩu mới:", password);
                            console.log("Xác nhận mật khẩu mới:", confirmPassword);
                            setOpenPasswordModal(false);
                        }}
                    >
                        Đổi mật khẩu mới
                    </button>
                </div>
                
            </Modal>
            <hr className="border-t border-gray-300" />
        </div>
    )
}