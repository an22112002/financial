import {Outlet} from "react-router-dom";
import { useEffect, useState } from "react";
import {ContainerOutlined, CalendarOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function DepartmentAction() {
    const navigate = useNavigate();
    const [departmentID, setDepartmentID] = useState<string>("");
    const [departmentName, setDepartmentName] = useState<string>("");
    // Lấy thông tin department dựa trên departmentID khi nó thay đổi
    useEffect(() => {
        const loadDepartmentInfo = () => {
            const id = localStorage.getItem("selectedDepartmentID");
            const name = localStorage.getItem("selectedDepartmentName");
            if (id && name) {
                setDepartmentID(id);
                setDepartmentName(name);
            } else {
                window.alert("Không tìm thấy thông tin bộ phận. Vui lòng chọn lại.");
                navigate("/dashboard/contractAndPayable");
            }
        }        
        loadDepartmentInfo();
    }, [navigate]);
    // button
    const buttons = [
        {
            title: "Hợp đồng",
            icon: <ContainerOutlined />,
            activate: () => {
                if (departmentID) {
                    navigate(`/dashboard/contractAndPayable/contract`);
                } else {
                    window.alert("Department ID không hợp lệ");
                }
            }
        },
        {
            title: "Công nợ",
            icon: <CalendarOutlined />,
            activate: () => {
                if (departmentID) {
                    navigate(`/dashboard/contractAndPayable/payable`);
                } else {
                    window.alert("Department ID không hợp lệ");
                }
            }
        }
    ];
    return (
        <div className="flex flex-col p-2 gap-3">
            <div className="w-full flex items-center justify-between md:flex-row flex-col gap-2">
                <h2><strong className="text-lg">{departmentName}</strong></h2>
                <div className="w-full md:w-auto text-center inline-block bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer" onClick={() => navigate("/dashboard/contractAndPayable")}>
                    Trở lại
                </div>
            </div>
            
            <div className="flex flex-row gap-4 mb-4">
                {buttons.map((btn, index) => (
                    <div key={index} className="flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded md:px-4 md:py-2" onClick={btn.activate}>
                        {btn.icon}
                        <span>{btn.title}</span>
                    </div>
                ))}
            </div>
            <Outlet />
        </div>
    );
}