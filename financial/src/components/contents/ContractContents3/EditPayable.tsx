import { useEffect } from "react";
import { Payable } from "../../../types/ContractData3";
import { openNotification } from "../../../utils/index";



export default function EditPayable() {
    useEffect(() => {
        const fetchPayableDetails = async () => {
            // Gọi API lấy chi tiết công nợ ở đây
            // Ví dụ giả lập dữ liệu chi tiết công nợ
            const data = {}
        }
        fetchPayableDetails();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa công nợ</h2>
            <p>Chức năng chỉnh sửa công nợ đang được phát triển. Vui lòng quay lại sau.</p>
        </div>
    );
}