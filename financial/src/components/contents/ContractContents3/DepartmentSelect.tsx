import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Department } from "../../../types/ContractData3";
import { GetDepartments } from "../../../api/department";

export default function DepartmentSelect() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);


    useEffect(() => {
        const getDepartment = async () => {
            const data = await GetDepartments();
            // const data: Department[] = [
            //     { departmentID: "1", name: "Quản lý tòa nhà" },
            //     { departmentID: "2", name: "Quản lý xe ô tô" }
            // ];
            if (data) {
                setDepartments(data);
            }
        }

        getDepartment();
    }, []);

    return (
        <div className="flex flex-col p-2">
            <h1 className="text-2xl font-bold mb-4">Chọn bộ phận</h1>
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {departments.map((dept, index) => (
                    <div key={index} className="min-h-[100px] cursor-pointer flex items-center justify-center text-lg bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        onClick={() => {
                            localStorage.setItem("selectedDepartmentID", dept.departmentID.toString());
                            localStorage.setItem("selectedDepartmentName", dept.name.toString());
                            navigate(`/dashboard/contractAndPayable/department`)
                        }}>
                        <strong>{dept.name.toUpperCase()}</strong>
                    </div>
                ))}
            </div>
        </div>
    )
}