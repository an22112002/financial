import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fullContracts} from "../../../types/mockOri";

type Department = {
    id: number;
    name: string;
    numberOfContracts: number;
    numberOfCollected: number;
    numberOfDebt: number;
}

export default function DepartmentSelect() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        const getDepartment = async () => {
            const data = [{
                id: 1,
                name: "Kinh doanh tài sản",
                numberOfContracts: fullContracts.filter(c => c.department === "Kinh doanh tài sản").length,
                numberOfCollected: 1,
                numberOfDebt: 2
            }, {
                id: 2,
                name: "Dịch vụ và giải pháp",
                numberOfContracts: fullContracts.filter(c => c.department === "Dịch vụ và giải pháp").length,
                numberOfCollected: 1,
                numberOfDebt: 2
            }];
            setDepartments(data);
        }

        getDepartment();
    }, []);

    return (
        <div className="flex flex-col p-2">
            <h1 className="text-2xl font-bold mb-4">Hợp đồng theo bộ phận</h1>
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {departments.map((dept) => (
                    <div key={dept.id} className="min-h-[100px] cursor-pointer text-lg bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                        <div onClick={() => navigate(`/dashboard/contract/edit/${dept.id}`)}>
                            <strong>{dept.name}</strong>
                            <p className="text-sm text-black">Số hợp đồng: {dept.numberOfContracts}</p>
                        </div>
                    </div>
                ))}
            </div>
            <h1 className="text-2xl font-bold mb-4">Công nợ theo bộ phận</h1>
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {departments.map((dept) => (
                    <div key={dept.id} className="min-h-[100px] cursor-pointer text-lg bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
                        <div onClick={() => navigate(`/dashboard/contract/payable/${dept.id}`)}>
                            <strong>{dept.name}</strong>
                            <p className="text-sm text-black">Số công nợ cần thu: {dept.numberOfCollected}</p>
                            <p className="text-sm text-black">Số công nợ cần trả: {dept.numberOfDebt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}