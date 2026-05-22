import type { ButtonData } from "../types/UIType";

import { Outlet } from "react-router-dom";

import { DashboardOutlined, ContainerOutlined, DollarCircleOutlined, BarChartOutlined, SettingOutlined } from "@ant-design/icons";

import DashboardHeader from "../components/ui/DashboardHeader";
import NavigateBar from "../components/ui/NavigateBar";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout() {
    const [openNav, setOpenNav] = useState(true);
    const navigate = useNavigate();
    // Navigate button bar
    const buttons: ButtonData[] = [
        {
            title: "Dashboard",
            icon: <DashboardOutlined />,
            activate: () => {
                navigate("/dashboard");
            }
        },
        {
            title: "Hợp đồng và công nợ",
            icon: <ContainerOutlined />,
            activate: () => {
                navigate("/dashboard/contract");
            }
        },
        {
            title: "Thanh toán",
            icon: <DollarCircleOutlined />,
            activate: () => {
                navigate("/dashboard/payment");
            }
        },
        {
            title: "Số liệu",
            icon: <BarChartOutlined />,
            activate: () => {
                navigate("/dashboard/analytic");
            }
        },
        {
            title: "Cài đặt",
            icon: <SettingOutlined />,
            activate: () => {
                navigate("/dashboard/setting");
            }
        }
    ];

    // Đổi ẩn hiện navigate bar
    const changeOpenNav = () => {
        setOpenNav(!openNav);
    }

    return (
        <>
            {/* Header */}
            <DashboardHeader changeOpenNav={changeOpenNav} />

            <div className="w-full h-full flex flex-row">
                {/* Navigation bar */}
                <div className={"h-full bg-[#22C55E]"}>
                    <NavigateBar state={openNav} buttons={buttons} />
                </div>

                {/* Content */}
                <div className="w-full h-full bg-[#F3F4F6]">
                    <Outlet />
                </div>
            </div>
        </>
    )
}