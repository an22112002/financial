import {Outlet} from "react-router-dom";
import { useEffect, useState } from "react";
import {ContainerOutlined, CalendarOutlined, WarningOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {Modal} from "antd";
import type { ContractShortInfo } from "../../../api/department";
import { GetDepartmentContracts } from "../../../api/department";

export default function DepartmentAction() {
    const navigate = useNavigate();

    const [departmentID, setDepartmentID] = useState<string>("");
    const [departmentName, setDepartmentName] = useState<string>("");

    const [focusContract, setFocusContract] = useState<ContractShortInfo | null>(null);
    const [contracts, setContracts] = useState<ContractShortInfo[]>([]);
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
    useEffect(() => {
        const loadContracts = async () => {
            if (!departmentID) {
                return;
            }
            const contractsData = await GetDepartmentContracts(departmentID);
            if (contractsData) {
                setContracts(contractsData);
            }
            // let mockContracts: ContractShortInfo[];
            // if (departmentID === "1") {
            //     mockContracts = [
            //         {
            //             contractID: "C001",
            //             contractType: "receive",
            //             title: "Hợp đồng quản lý tòa nhà BIDV",
            //             payableNow: [
            //                 {
            //                     payableID: "P001",
            //                     type: "intime",
            //                     note: "Thanh toán dịch vụ tháng 1",
            //                     amount: 1000000
            //                 },
            //                 {
            //                     payableID: "P002",
            //                     type: "delay",
            //                     note: "Thanh toán dịch vụ tháng 2",
            //                     amount: 1500000
            //                 }
            //             ]
            //         },
            //         {
            //             contractID: "C002",
            //             contractType: "pay",
            //             title: "Hợp đồng thuê công ty bảo vệ",
            //             payableNow: [
            //                 {
            //                     payableID: "P003",
            //                     type: "intime",
            //                     note: "Trả lương tháng 1 cho công ty bảo vệ",
            //                     amount: 2000000
            //                 }
            //             ]
            //         }
            //     ];
            //     setContracts(mockContracts);
            // } else if (departmentID === "2") {
            //     mockContracts = [
            //         {
            //             contractID: "C004",
            //             contractType: "pay",
            //             title: "Hợp đồng bảo trì xe",
            //             payableNow: [
            //                 {
            //                     payableID: "P004",
            //                     type: "intime",
            //                     note: "Thanh toán bảo trì xe tháng 1",
            //                     amount: 500000
            //                 }
            //             ]
            //         },
            //         {
            //             contractID: "C005",
            //             contractType: "receive",
            //             title: "Hợp đồng cho thuê xe của chi nhánh BIDV Tây Hồ",
            //             payableNow: [
            //                 {
            //                     payableID: "P006",
            //                     type: "delay",
            //                     note: "Thanh toán cho thuê xe tháng 1",
            //                     amount: 800000
            //                 }
            //             ]
            //         },
            //         {
            //             contractID: "C009",
            //             contractType: "receive",
            //             title: "Hợp đồng cho thuê xe của chi nhánh BIDV Cầu Giấy",
            //             payableNow: [
            //                 {
            //                     payableID: "P0070",
            //                     type: "delay",
            //                     note: "Thanh toán cho thuê xe tháng 2",
            //                     amount: 800000
            //                 },
            //                 {
            //                     payableID: "P0071",
            //                     type: "intime",
            //                     note: "Thanh toán cho thuê xe tháng 3",
            //                     amount: 900000
            //                 }
            //             ]
            //         },
            //         {
            //             contractID: "C011",
            //             contractType: "pay",
            //             title: "Hợp đồng chi trả bảo dưỡng xe định kỳ",
            //             payableNow: [
            //                 {
            //                     payableID: "P0072",
            //                     type: "intime",
            //                     note: "Thanh toán phí bảo dưỡng tháng 3",
            //                     amount: 9000000
            //                 }
            //             ]
            //         },
            //         {
            //             contractID: "C012",
            //             contractType: "pay",
            //             title: "Hợp đồng chi trả bảo hiểm xe cơ giới hàng năm",
            //             payableNow: []
            //         }
            //     ];
            //     setContracts(mockContracts);
            // }
            
        };
        loadContracts();
    }, [departmentID]);
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
                <h2><strong className="text-lg">{departmentName.toUpperCase()}</strong></h2>
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

            <div className="mt-4 text-lg font-semibold">
                Hợp đồng thu
            </div>
            {contracts.filter(contract => contract.contractType === "receive").length === 0 ? (
                <p className="text-gray-500">Không có hợp đồng thu nào.</p>
            ) : (
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                    {contracts.filter(contract => contract.contractType === "receive").map((contract, index) => (
                        <div
                            key={index}
                            className="relative h-[100px] flex flex-row justify-center items-center bg-green-400 hover:bg-green-500 px-4 py-2 rounded cursor-pointer"
                            onClick={() =>
                                setFocusContract(contract)
                            }
                        >
                            <span>{contract.title}</span>

                            <div className="absolute flex flex-row top-1 right-1 gap-1">
                                {contract.payableNow.filter(payable => payable.type === "waiting").length > 0 && (
                                    <span className="bg-purple-900 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "waiting").length}
                                    </span>
                                )}
                                {contract.payableNow.filter(payable => payable.type === "intime").length > 0 && (
                                    <span className="bg-blue-900 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "intime").length}
                                    </span>
                                )}
                                {contract.payableNow.filter(payable => payable.type === "delay").length > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "delay").length}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            

            <div className="mt-4 text-lg font-semibold">
                Hợp đồng chi
            </div>
            {contracts.filter(contract => contract.contractType === "pay").length === 0 ? (
                <p className="text-gray-500">Không có hợp đồng chi nào.</p>
            ) : (
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                    {contracts.filter(contract => contract.contractType === "pay").map((contract, index) => (
                        <div
                            key={index}
                            className="relative h-[100px] flex flex-row justify-center items-center bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded cursor-pointer"
                            onClick={() =>
                                setFocusContract(contract)
                            }
                        >
                            <span>{contract.title}</span>

                            <div className="absolute flex flex-row top-1 right-1 gap-1">
                                {contract.payableNow.filter(payable => payable.type === "waiting").length > 0 && (
                                    <span className="bg-purple-900 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "waiting").length}
                                    </span>
                                )}
                                {contract.payableNow.filter(payable => payable.type === "intime").length > 0 && (
                                    <span className="bg-blue-900 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "intime").length}
                                    </span>
                                )}
                                {contract.payableNow.filter(payable => payable.type === "delay").length > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold min-w-6 h-6 px-2 flex items-center justify-center rounded-full">
                                        {contract.payableNow.filter(payable => payable.type === "delay").length}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                title={focusContract ? focusContract.title : ""}
                open={!!focusContract}
                onCancel={() => setFocusContract(null)}
                width={1000}
                footer={null}
            >
                {focusContract && focusContract.payableNow.length > 0 ? (
                    <ul>
                        <li className="grid grid-cols-4 gap-4 p-2 border-b border-gray-300 font-semibold">
                            <span>Ghi chú</span>
                            <span>Trạng thái</span>
                            <span>Ngày thanh toán/Điều kiện</span>
                            <span>Số tiền</span>
                        </li>
                        {focusContract.payableNow.map((payable, index) => (
                            <li key={index} className="grid grid-cols-4 gap-4 p-2 border-b border-gray-300 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{payable.note}</span>
                                </div>  
                                {focusContract && (
                                    <span className={`px-2 py-1 rounded text-white text-center ${payable.type === "intime" ? "bg-blue-500" : payable.type === "delay" ? "bg-red-500" : "bg-purple-500"}`}>
                                        {payable.type === "intime" ? "Đến hạn thanh toán" : payable.type === "delay" ? <div><WarningOutlined className="text-white" /> Trễ hạn</div> : "Chờ thanh toán"}
                                    </span>
                                )}
                                <span>{payable.condition}</span>
                                <span className="font-semibold">{payable.amount.toLocaleString()} VND</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Không có công nợ nào cần thanh toán.</p>
                )}
            </Modal>
            <Outlet />
        </div>
    );
}