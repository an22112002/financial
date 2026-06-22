import {useState, useEffect} from "react";
import type { Contract, Department } from "../../../types/ContractData3";
import { useNavigate } from "react-router-dom";
import EditContract from "./EditContract";
import { Modal } from "antd";
import { SearchOutlined, FolderAddOutlined } from "@ant-design/icons";
import ContractSearch from "./ContractSearch";

export default function ContractView() {
    const navigate = useNavigate();

    const [department, setDepartment] = useState<Department | null>(null);
    const [focusContract, setFocusContract] = useState<Contract | null>(null);

    const [mode, setMode] = useState<"view" | "create" | "edit">("create");

    const [openSearch, setOpenSearch] = useState(false);
    // const [contractList, setContractList] = useState<ContractData[]>([]);

    // Lấy departmentID từ URL khi component được mount
    useEffect(() => {
        const getDepartment = () => {
            const id = localStorage.getItem("selectedDepartmentID");
            const name = localStorage.getItem("selectedDepartmentName");
            if (id && name) {
                setDepartment({
                    departmentID: parseInt(id),
                    name: name
                });
            } else {
                setDepartment(null);
                window.alert("Không tìm thấy thông tin bộ phận. Vui lòng chọn lại.");
                navigate("/dashboard/contractAndPayable");
            }
        }
        getDepartment();
    }, [navigate]);

    return (
        <div>
            <div className="w-full flex items-center justify-between md:flex-row flex-col gap-2">
                <div className="flex md:flex-row flex-col items-center gap-2">
                    <h1><strong className="text-lg">{department?.name}</strong></h1>
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-400 text-white rounded p-1">Hợp đồng</span>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[50%]"
                            onClick={() => setOpenSearch(true)}
                        >
                            <SearchOutlined />
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[50%]"
                            onClick={() => {
                                setFocusContract(null);
                                setMode("create");
                            }}
                        >
                            <FolderAddOutlined />
                        </button>
                    </div>
                </div>
                

                <div className="w-full md:w-auto text-center inline-block bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => {
                        navigate(-1);
                    }}>
                    Trở lại
                </div>
            </div>
            
            {/* Tạo và sửa hợp đồng */}
            <div className="my-4">
                <span className="text-white bg-gray-700 px-2 py-1 rounded">
                    {mode === "view" ? "Chế độ xem" : mode === "create" ? "Chế độ tạo" : "Chế độ sửa"}
                </span>
            </div>
            <div>
                <EditContract contract={focusContract} mode={mode} setMode={setMode} />
            </div>

            {/* Tìm kiếm hợp đồng */}
            <Modal
                title="Tìm kiếm hợp đồng"
                open={openSearch}
                width={1000}
                onCancel={() => setOpenSearch(false)}
                footer={null}
            >
                <ContractSearch onSelectContract={setFocusContract} closeSearch={() => setOpenSearch(false)} />
            </Modal>
        </div>
    )
}