import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Department } from "../../../types/ContractData3";
import {Modal} from "antd";

export default function DepartmentSelect() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newDepartmentName, setNewDepartmentName] = useState("");

    const handleAddDepartment = async () => {
        if (newDepartmentName.trim() === "") {
            return;
        }
        // gọi API tạo bộ phận mới ở đây, sau đó cập nhật lại danh sách bộ phận
    }

    useEffect(() => {
        const getDepartment = async () => {
            const data = [{
                departmentID: 1,
                name: "Kinh doanh tài sản"
            }, {
                departmentID: 2,
                name: "Dịch vụ và giải pháp"
            }];
            setDepartments(data);
        }

        getDepartment();
    }, []);

    return (
        <div className="flex flex-col p-2">
            <Modal title="Thêm bộ phận mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <div className="flex flex-col gap-4">
                    <input type="text" placeholder="Tên bộ phận" className="border border-gray-300 rounded px-2 py-1" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={ async () => {
                        await handleAddDepartment();
                        setIsModalOpen(false)
                    }}>
                        Thêm
                    </button>
                </div>
            </Modal>
            <div className="w-full flex items-center justify-between">
                <h1 className="text-2xl font-bold mb-4">Các bộ phận</h1>
                <div className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    Thêm bộ phận mới
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {departments.map((dept) => (
                    <div key={dept.departmentID} className="min-h-[100px] cursor-pointer flex items-center justify-center text-lg bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                        <div onClick={() => {
                            localStorage.setItem("selectedDepartmentID", dept.departmentID.toString());
                            localStorage.setItem("selectedDepartmentName", dept.name.toString());
                            navigate(`/dashboard/contractAndPayable/department`)
                        }}>
                            <strong>{dept.name}</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}