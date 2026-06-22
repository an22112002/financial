import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import type { Department, Payable } from "../../../types/ContractData3";
import { WarningOutlined } from "@ant-design/icons";
import BankAccountInfo from "./BankAccountInfo";
import { Modal } from "antd";
import EditPayable from "./EditPayable";
// import type { ContractData } from "../../../types/ContractData3"; 

export default function PayableView() {
    const navigate = useNavigate();
    const [department, setDepartment] = useState<Department | null>(null);

    const [openOverdueModal, setOpenOverdueModal] = useState(false);
    const [overduePayables, setOverduePayables] = useState<Payable[]>([]);

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

    // Lấy danh sách công nợ quá hạn khi component được mount
    useEffect(() => {
        // Gọi API lấy thông tin công nợ đã quá hạn
        const fetchOverduePayables = async () => {
            // Ví dụ giả lập dữ liệu công nợ quá hạn
            const data: Payable[] = [{
                id: 1,
                amount: 2000000,
                partner: "Công ty ABC",
                type: "receive",
                tax: 10,
                lateFee: 4,
                note: "Tiền thuê xe",
                moment: {
                    type: "date",
                    date: "2024-05-01",
                    needDocument: false,
                    delay: 3,
                    condition: null
                },
            }, {
                id: 2,
                amount: 1500000,
                partner: "Công ty XYZ",
                type: "pay",
                tax: 5,
                lateFee: 2,
                note: "Tiền mua văn phòng phẩm",
                moment: {
                    type: "condition",
                    isConditionMet: false,
                    needDocument: false,
                    date: null,
                    delay: 5,
                    condition: "Khi nhận được hóa đơn"
                }
            }]
            setOverduePayables(data);
            if (data.length > 0) {
                setOpenOverdueModal(true);
            }
        };
        fetchOverduePayables();
    }, []);

    return (
        <div>
            {/* Nút cảnh báo các công nợ quá hạn, nút có vị trí cố định trên màn hình, có số nhỏ hiện số công nợ quá hạn */}
            <div
                className="fixed top-[170px] right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-[50%] z-50"
                onClick={() => {
                    setOpenOverdueModal(true);
                }}
            >
                <WarningOutlined />
                {overduePayables.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-yellow-500 rounded-full px-1 text-xs">
                        {overduePayables.length}
                    </span>
                )}
            </div>
            <Modal
                title="Danh sách công nợ quá hạn"
                open={openOverdueModal}
                onCancel={() => setOpenOverdueModal(false)}
                footer={null}
            >
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {overduePayables.map((payable) => (
                        <div key={payable.id} className="border p-4 rounded bg-red-600 ">
                            <p><strong className="text-lg text-white">{payable.partner}</strong></p>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="font-bold">Công nợ:</label>
                                <span>{payable.type === "receive" ? "Phải thu" : "Phải trả"}</span>

                                <label className="font-bold">Số tiền:</label>
                                <span>{payable.amount.toLocaleString()} VND</span>
                            
                                <label className="font-bold">Ghi chú:</label>
                                <span>{payable.note}</span>

                                <label className="font-bold">Ngày thanh toán/điều kiện:</label>
                                <span>{payable.moment.date || payable.moment.condition}</span>

                                {payable.moment.type === "date" && (
                                    <>
                                        <label className="font-bold">Số ngày quá hạn:</label>
                                        <span>{Math.max(0, Math.floor((new Date().getTime() - new Date(payable.moment.date!).getTime()) / (1000 * 60 * 60 * 24)) - payable.moment.delay)} ngày</span>

                                        <label className="font-bold">Tổng tiền phạt:</label>
                                        <span>{Math.round((payable.amount * ( 1 + (payable.tax / 100)) 
                                        * Math.max(0, Math.floor((new Date().getTime() - new Date(payable.moment.date!).getTime()) / (1000 * 60 * 60 * 24)) - payable.moment.delay) 
                                        * ((payable.lateFee / 100) / 365))).toLocaleString()} VND</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-right">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setOpenOverdueModal(false)}
                    >
                        Đóng
                    </button>
                </div>
            </Modal>
            <div className="w-full flex items-center justify-between md:flex-row flex-col gap-2">
                <div className="flex md:flex-row flex-col items-center gap-2">
                    <h1><strong className="text-lg">{department?.name}</strong></h1>
                    <span className="bg-gray-400 text-white rounded p-1">Công nợ</span>
                </div>
                
                <div className="w-full md:w-auto text-center inline-block bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => {
                        navigate(-1);
                    }}>
                    Trở lại
                </div>
            </div>
            
            {/* Tài khoản ngân hàng của công ty sẽ hiển thị ở đây, cùng với các khoản phải thu, phải trả tương ứng với từng hợp đồng. */}
            <div>
                <BankAccountInfo />
            </div>

            <div>
                <EditPayable />
            </div>
        </div>
    )
}