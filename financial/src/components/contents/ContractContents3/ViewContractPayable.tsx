import { useState, useEffect } from "react";
import type { PayableEditData, Payment, Moment } from "../../../types/ContractData3";
import { EyeOutlined } from "@ant-design/icons";
import { Modal } from "antd";
// import { openNotification } from "../../../utils/index";

type Props = {
    contractID: string | undefined;
    mode: "view" | "edit" | "create";
}

export default function ViewContractPayable({ contractID, mode }: Props) {
    const [data, setData] = useState<PayableEditData[]>([]);

    const [focusPayments, setFocusPayments] = useState<Payment[] | null>(null);

    const [showPayableColumnsOpen, setShowPayableColumnsOpen] = useState(false);


    const [visibleColumns, setVisibleColumns] = useState<Record<TableColumnKey, boolean>>({
        type: true,
        partner: true,
        totalAmount: true,
        paymentDate: true,
        lateDate: true,
        note: true,
        lateFee: true,
        delay: true,
        status: true,
        payment: true,
        conditionDocument: false
    });

    const fetchPayableData = async () => {
        try {
            // Gọi API để lấy thông tin công nợ dựa trên contractID
            const mockData: PayableEditData[] = [
                {
                    id: 1,
                    totalAmount: 1000000,
                    contractID: "C001",
                    contractTitle: "Hợp đồng A",
                    partner: "Công ty ABC",
                    type: "receive",
                    originalPayDate: {
                        id: "MOM001",
                        condition: null,
                        type: "date",
                        date: "2024-07-15",
                        delay: 5,
                        needDocument: true
                    },
                    note: "Thanh toán lần 1",
                    lateFee: 5,
                    delay: 5,
                    status: "not_enough",
                    payment: [
                        {
                            id: "PAY001",
                            type: "bank",
                            amount: 500000,
                            time: "2024-07-15 10:00:00",
                            document: [
                                {
                                    id: "DOC001",
                                    name: "Biên nhận thanh toán",
                                    fileType: "pdf",
                                    url: "https://example.com/documents/receipt.pdf"
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    totalAmount: 2000000,
                    contractID: "C001",
                    contractTitle: "Hợp đồng A",
                    partner: "Công ty ABC",
                    type: "receive",
                    originalPayDate: {
                        id: "MOM002",
                        condition: null,
                        type: "date",
                        date: "2026-08-15",
                        delay: 10,
                        needDocument: true
                    },
                    note: "Thanh toán lần 2",
                    lateFee: 10,
                    delay: 10,
                    status: "waiting",
                    payment: [
                        {
                            id: "PAY002",
                            type: "bank",
                            amount: 1000000,
                            time: "2026-08-15 10:00:00",
                            document: [
                                {
                                    id: "DOC002",
                                    name: "Biên nhận thanh toán",
                                    fileType: "pdf",
                                    url: "https://example.com/documents/receipt.pdf"
                                }
                            ]
                        }
                    ]
                }
            ];
            setData(mockData);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin công nợ:", error);
        }
    };

    useEffect(() => {
        const getData = async () => {
            if (contractID && mode === "view") {
                fetchPayableData();
            }
        };
        getData();
    }, [contractID, mode]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Chi tiết công nợ đang thực hiện</h2>

            {/* Modal xem chi tiết khoản thanh toán và thêm khoản thanh toán mới */}
            <Modal
                title="Chi tiết thanh toán"
                open={focusPayments !== null}
                width={800}
                onCancel={() => setFocusPayments(null)}
                footer={null}
            >
                {focusPayments && focusPayments.length > 0 ? (
                    <>
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Mã thanh toán</th>
                                    <th className="py-2 px-4 border-b">Thời gian</th>
                                    <th className="py-2 px-4 border-b">Số tiền</th>
                                    <th className="py-2 px-4 border-b">Tài liệu đính kèm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {focusPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="py-2 px-4 border-b">{payment.id}</td>
                                        <td className="py-2 px-4 border-b">{payment.time}</td>
                                        <td className="py-2 px-4 border-b">{payment.amount.toLocaleString()}</td>
                                        <th className="py-2 px-4 border-b">
                                            {payment.document.length > 0 ? (
                                                payment.document.map((doc, index) => (
                                                    <div key={index} className="text-blue-500 cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            if (doc.fileType === "pdf") {
                                                                window.open(doc.url, "_blank");
                                                            } else {
                                                               // download file nếu không phải pdf
                                                                const link = document.createElement("a");
                                                                link.href = doc.url;
                                                                link.download = doc.name;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }
                                                        }}
                                                        
                                                    >{doc.name}.{doc.fileType}</div>
                                                ))
                                            ) : (
                                                "Không có tài liệu đính kèm"
                                            )}
                                        </th>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>Chưa có thanh toán nào.</p>
                )}
                
            </Modal>

            <div>
                <div className="relative">
                    <button
                        type="button"
                        className="rounded-xl mb-2 border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => setShowPayableColumnsOpen((value) => !value)}
                    >
                        Hiển thị cột
                    </button>

                    {showPayableColumnsOpen && (
                        <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                            <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {renderColumnCheckbox("Thu/Chi", "type", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Đối tác", "partner", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Số tiền", "totalAmount", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Ngày thanh toán gốc", "paymentDate", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Hạn thanh toán", "lateDate", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Tài liệu", "conditionDocument", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Phí trễ hạn", "lateFee", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Số ngày trễ", "delay", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Ghi chú", "note", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Thanh toán", "payment", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Trạng thái", "status", visibleColumns, setVisibleColumns)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="w-full overflow-x-auto">
                <table className="bg-white border border-gray-300">
                    <thead>
                        <tr>
                            {visibleColumns.type && <th className="py-2 px-4 border-b">Thu/Chi</th>}
                            {visibleColumns.partner && <th className="py-2 px-4 border-b">Đối tác</th>}
                            {visibleColumns.totalAmount && <th className="py-2 px-4 border-b">Số tiền</th>}
                            {visibleColumns.paymentDate && <th className="py-2 px-4 border-b">Ngày thanh toán gốc</th>}
                            {visibleColumns.lateDate && <th className="py-2 px-4 border-b">Hạn thanh toán</th>}
                            {visibleColumns.conditionDocument && <th className="py-2 px-4 border-b">Tài liệu</th>}
                            {visibleColumns.lateFee && <th className="py-2 px-4 border-b">Phí trễ hạn</th>}
                            {visibleColumns.delay && <th className="py-2 px-4 border-b">Số ngày trễ</th>}
                            {visibleColumns.note && <th className="py-2 px-4 border-b">Ghi chú</th>}
                            {visibleColumns.payment && <th className="py-2 px-4 border-b">Thanh toán</th>}
                            {visibleColumns.status && <th className="py-2 px-4 border-b">Trạng thái</th>}
                        </tr>
                    </thead>
                <tbody>
                    {/* Duyệt qua dữ liệu công nợ và hiển thị trong bảng */}
                    {data.map((payable) => (
                        <tr key={payable.id}>
                            {visibleColumns.type && <td className="py-2 px-4 border-b">{payable.type === "receive" ? "Thu" : "Chi"}</td>}
                            {visibleColumns.partner && <td className="py-2 px-4 border-b">{payable.partner}</td>}
                            {visibleColumns.totalAmount && <td className="py-2 px-4 border-b">{payable.totalAmount.toLocaleString()}</td>}
                            {visibleColumns.paymentDate && <td className="py-2 px-4 border-b">{getMomentDate(payable.originalPayDate) || "N/A"}</td>}
                            {visibleColumns.lateDate && <td className="py-2 px-4 border-b">{finalDate(getMomentDate(payable.originalPayDate) || "", payable.delay)}</td>}
                            {visibleColumns.lateFee && <td className="py-2 px-4 border-b">{payable.lateFee}%</td>}
                            {visibleColumns.delay && <td className="py-2 px-4 border-b">{payable.delay}</td>}
                            {visibleColumns.conditionDocument && 
                            (<td className="py-2 px-4 border-b">
                                {payable.originalPayDate?.documentCondition ? (
                                    <div>
                                        {payable.originalPayDate.documentCondition.length > 0 ? (
                                            payable.originalPayDate.documentCondition.map((doc, index) => (
                                                <div key={index} className="text-blue-500 cursor-pointer hover:underline"
                                                    onClick={() => {
                                                        if (doc.fileType === "pdf") {
                                                            window.open(doc.url, "_blank");
                                                        } else {
                                                              // download file nếu không phải pdf
                                                            const link = document.createElement("a");
                                                            link.href = doc.url;
                                                            link.download = doc.name;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }
                                                    }}
                                                >{doc.name}.{doc.fileType}</div>
                                            ))
                                        ) : (
                                            "Không có tài liệu"
                                        )}
                                    </div>
                                ) : (
                                    "Không có tài liệu"
                                )}
                            </td>)}
                            {visibleColumns.note && <td className="py-2 px-4 border-b">{payable.note}</td>}
                            {visibleColumns.payment && (<td className="py-2 px-4 border-b">
                                {payable.payment.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        <div className="border p-2 rounded mb-2 bg-green-100">
                                            <p><strong className="text-lg text-green-700">{sumAmount(payable.payment).toLocaleString()}</strong></p>
                                            <div className="text-green-700 cursor-pointer hover:underline inline-block mt-1"
                                                onClick={() => setFocusPayments(payable.payment)}
                                            >
                                                <EyeOutlined /> Chi tiết
                                            </div>
                                        </div>
                                    </ul>
                                ) : (
                                    "Chưa thanh toán"
                                )}
                            </td>)}
                            {visibleColumns.status && (
                                <td className="py-2 px-4 border-b">
                                    {payable.status === "overdue" && <span className="text-red-500 font-bold">Quá hạn</span>}
                                    {payable.status === "paid" && <span className="text-green-500 font-bold">Đã thanh toán</span>}
                                    {payable.status === "not_enough" && <span className="text-yellow-500 font-bold">Thanh toán chưa đủ</span>}
                                    {payable.status === "waiting" && <span className="text-purple-500 font-bold">Đã đến ngày thanh toán</span>}
                                    {payable.status === "pending" && <span className="text-blue-500 font-bold">Chưa đến ngày thanh toán</span>}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

type TableColumnKey = "type" | "partner" | "totalAmount" | "paymentDate" | "lateDate" | "note" | "lateFee" | "status" | "payment" | "delay" | "conditionDocument";


function renderColumnCheckbox(
    label: string,
    key: TableColumnKey,
    state: Record<TableColumnKey, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<TableColumnKey, boolean>>>
) {
    return (
        <label className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={state[key]}
                onChange={() => setState((prev) => ({ ...prev, [key]: !prev[key] }))}
            />
            <span className="text-slate-700">{label}</span>
        </label>
    );
}

function getMomentDate(moment: Moment): string | null {
    if (moment.type === "date") {
        return moment.date;
    } else if (moment.type === "condition") {
        if (moment.isConditionMet) {
            const date = moment.date ? new Date(moment.date) : new Date();
            return date.toISOString().split('T')[0];
        } else {
            return moment.condition;
        }
    }
    return null;
}

function sumAmount(payments: Payment[]): number {
    return payments.reduce((total, payment) => total + payment.amount, 0);
}

const finalDate = (date: string, delay: number) => {
    if (date === "N/A" || date === null || date === "") return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return "-";
    }
    if (delay === 0) return date;
    
    d.setDate(d.getDate() + delay);
    return d.toISOString().split('T')[0];
}