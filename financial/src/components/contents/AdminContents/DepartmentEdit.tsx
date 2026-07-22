import {useState, useEffect} from "react"
import {Modal} from "antd";
import { CreateDepartment, GetDepartments, DeleteDepartment } from "../../../api/department";
import type { Department } from "../../../types/ContractData3";

export default function DepartmentEdit() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newDepartmentName, setNewDepartmentName] = useState("");

    useEffect(() => {
        const getDepartment = async () => {
            const data = await GetDepartments();
            
            if (data) {
                setDepartments(data);
            }
        }

        getDepartment();
    }, []);

    const handleAddDepartment = async () => {
        if (newDepartmentName.trim() === "") {
            return;
        }
        const newDepartments = await CreateDepartment(newDepartmentName);
        if (newDepartments) {
            setDepartments(newDepartments);
            setNewDepartmentName("");
            setIsModalOpen(false);
        }
    }

    return (
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
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
            <div>
                {departments.length === 0 ? (
                    <p>Chưa có bộ phận nào. Hãy thêm bộ phận mới.</p>
                ) : (
                    <ul className="list-disc pl-5">
                        {departments.map((dept, index) => (
                            <li key={index} className="mb-2">
                                {dept.name}
                                <button
                                    className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                    onClick={async () => {
                                        const deletedDepartments = await DeleteDepartment(dept.departmentID);
                                        if (deletedDepartments) {
                                            setDepartments(deletedDepartments);
                                        }
                                    }}
                                >
                                    Xóa
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}