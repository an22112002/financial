import type { ButtonData } from "../../types/UIType"
import { Outlet, useNavigate } from "react-router-dom";
import {CalendarOutlined, ContainerOutlined} from "@ant-design/icons";

export default function ContractContent() {
    const navigate = useNavigate();

    const buttons: ButtonData[] = [
        {
            title: "Công nợ và dòng tiền",
            icon: <CalendarOutlined />,
            activate: () => {
                navigate("/dashboard/contract");
            }
        },
        {
            title: "Tạo hợp đồng",
            icon: <ContainerOutlined />,
            activate: () => {
                navigate("/dashboard/contract/create");
            }
        }
    ];
    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-row gap-2">
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        className="flex flex-row items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                        onClick={button.activate}
                    >
                        {button.icon}
                        {button.title}
                    </button>
                ))}
            </div>

            <Outlet />
        </div>
    )
}