import { useEffect, useState } from "react";
import type { PayableEditData, Moment, Payment, Document } from "../../../types/ContractData3";
// import { openNotification } from "../../../utils/index";
import { EyeOutlined, WarningOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import DocumentEdit from "./DocumentEdit";
import { openNotification } from "../../../utils/index";

export default function EditPayable() {
    const [payableEditData, setPayableEditData] = useState<PayableEditData[]>([]);

    const [focusPayable, setFocusPayable] = useState<PayableEditData | null>(null);
    const [focusPayments, setFocusPayments] = useState<Payment[] | null>(null);

    // Form thêm khoản thanh toán mới
    const [newPaymentType, setNewPaymentType] = useState<"cash" | "bank">("cash");
    const [newPaymentID, setNewPaymentID] = useState<string>("");
    const [newPaymentCashAmount, setNewPaymentCashAmount] = useState<number>(0);
    const [newPaymentCashTimeTransaction, setNewPaymentCashTimeTransaction] = useState<string>("");
    const [newPaymentDocuments, setNewPaymentDocuments] = useState<Document[]>([]);

    // Form sửa hạn thanh toán và phí trễ hạn
    const [deadlineEditDelay, setDeadlineEditDelay] = useState<number>(0);
    const [deadlineEditLateFee, setDeadlineEditLateFee] = useState<number>(0);
    const [deadlineEditLateDate, setDeadlineEditLateDate] = useState<string>("");

    // Form xác nhận điều kiện đã thỏa mãn
    const [focusMoment, setFocusMoment] = useState<Moment | null>(null);
    const [momentDocumentCondition, setMomentDocumentCondition] = useState<Document[]>([]);

    const [openDeletePaymentModal, setOpenDeletePaymentModal] = useState(false);
    const [paymentIDToDelete, setPaymentIDToDelete] = useState<string>("");

    const [openEditDeadlineModal, setOpenEditDeadlineModal] = useState(false);

    const [showPayableColumnsOpen, setShowPayableColumnsOpen] = useState(false);
    
    const [visibleColumns, setVisibleColumns] = useState<Record<TableColumnKey, boolean>>({
        contractCode: false,
        title: true,
        type: true,
        partner: true,
        totalAmount: true,
        paymentDate: true,
        lateDate: true,
        note: true,
        lateFee: false,
        delay: false,
        status: true,
        payment: true,
        conditionDocument: false
    });
    
    // Giả lập dữ liệu chi tiết công nợ khi component được mount
    useEffect(() => {
        const fetchPayableEditData = async () => {
            // Gọi API lấy chi tiết công nợ ở đây
            // Ví dụ giả lập dữ liệu chi tiết công nợ
            const data: PayableEditData[] = [{
                id: 1,
                totalAmount: 2000000,
                contractID: "C-001",
                contractTitle: "Hợp đồng thuê xe",
                partner: "Công ty ABC",
                type: "receive",
                note: "Tiền thuê xe",
                originalPayDate: {
                    type: "date",
                    date: "2024-05-01",
                    needDocument: false,
                    delay: 3,
                    condition: null,
                    documentCondition: [
                        {
                            id: "D-003",
                            name: "Biên bản bàn giao xe",
                            fileType: "pdf",
                            url: "https://example.com/vehiclehandover.pdf"
                        }
                    ]
                },
                lateFee: 4,
                delay: 4,
                status: "paid",
                payment: [
                    {
                        id: "P-001",
                        time: "2024-05-03 00:00:00",
                        amount: 1000000,
                        type: "bank",
                        document: [
                            {
                                id: "D-001",
                                name: "Hóa đơn thanh toán 1",
                                fileType: "pdf",
                                url: "https://example.com/invoice1.pdf"
                            },
                            {
                                id: "D-002",
                                name: "Hóa đơn thanh toán 2",
                                fileType: "pdf",
                                url: "https://example.com/invoice2.pdf"
                            }
                        ]
                    },
                    {
                        id: "P-002",
                        time: "2024-05-04 00:00:00",
                        type: "cash",
                        amount: 1000000,
                        document: []
                    }
                ]
            },
            {
                id: 2,
                totalAmount: 1500000,
                contractID: "C-002",
                contractTitle: "Hợp đồng cung cấp dịch vụ",
                partner: "Công ty XYZ",
                type: "pay",
                note: "Tiền mua văn phòng phẩm",
                originalPayDate: {
                    id: "M-001",
                    type: "condition",
                    isConditionMet: false,
                    needDocument: false,
                    date: null,
                    delay: 5,
                    condition: "Sau khi nghiệm thu dịch vụ"
                },
                lateFee: 2,
                delay: 0,
                status: "pending",
                payment: []
            },
            {
                id: 3,
                totalAmount: 3000000,
                contractID: "C-003",
                contractTitle: "Hợp đồng bán hàng",
                partner: "Công ty DEF",
                note: "Tiền bán hàng",
                type: "receive",
                originalPayDate: {
                    type: "date",
                    date: "2024-05-10",
                    needDocument: false,
                    delay: 2,
                    condition: null
                },
                lateFee: 5,
                delay: 2,
                status: "not_enough",
                payment: [
                    {
                        id: "P-003",
                        time: "2024-05-12 00:00:00",
                        amount: 1500000,
                        type: "bank",
                        document: []
                    }
                ]
            }
        ];
        setPayableEditData(data);
    }
    fetchPayableEditData();
    }, []);

    useEffect(() => {
        const updateDeadlineEditForm = () => {
            if (focusPayable) {
                if (focusPayable.originalPayDate.type === "date") {
                    const date = new Date(focusPayable.originalPayDate.date || "");
                    date.setDate(date.getDate() + deadlineEditDelay);
                    setDeadlineEditLateDate(date.toISOString().split('T')[0]);
                } else if (focusPayable.originalPayDate.type === "condition") {
                    setDeadlineEditLateDate(
                        `${deadlineEditDelay} ngày sau khi điều kiện được đáp ứng`
                    );
                }
            }
        }
        updateDeadlineEditForm();
    }, [focusPayable, deadlineEditDelay]);

    useEffect(() => {
        const loadAndUnloadFocusPayable = () => {
            if (focusPayable) {
                setDeadlineEditDelay(focusPayable.delay);
                setDeadlineEditLateFee(focusPayable.lateFee);
            } else {
                setDeadlineEditDelay(0);
                setDeadlineEditLateFee(0);
                setDeadlineEditLateDate("");
            }
        }
        loadAndUnloadFocusPayable();
    }, [focusPayable]);

    const isValisPayableForm = (): boolean => {
        if (newPaymentType === "bank") {
            return newPaymentID.trim() !== "";
        } else if (newPaymentType === "cash") {
            if (newPaymentCashAmount === 0) return false;
            if (newPaymentCashTimeTransaction.trim() === "") return false;
            if (isNaN(new Date(newPaymentCashTimeTransaction).getTime())) return false;
            if (newPaymentCashTimeTransaction.trim() === "") return false;
            if (newPaymentDocuments.length === 0) {
                openNotification("warning", "Vui lòng đính kèm ít nhất một tài liệu cho khoản thanh toán tiền mặt");
                return false;
            }
            return true;
        }
        return false;
    }

    const resetNewPaymentForm = () => {
        setNewPaymentID("");
        setNewPaymentCashAmount(0);
        setNewPaymentCashTimeTransaction("");
        setNewPaymentDocuments([]);
    }

    const fetchNewPayment = async () => {
        // Gọi API tạo khoản thanh toán mới ở đây
        // Ví dụ giả lập dữ liệu khoản thanh toán mới
        if (newPaymentType === "bank") {
            const dataSend = {
                id: newPaymentID,
                userEdit: "Nguyễn Văn A",
                documents: newPaymentDocuments
            };
            console.log("Dữ liệu khoản thanh toán mới:", dataSend);
            const dataResponse: Payment = {
                id: newPaymentID,
                type: newPaymentType,
                time: "2026-05-15 00:00:00",
                amount: 2000000,
                document: newPaymentDocuments
            };
            return dataResponse;
        } else {
            const dataSend = {
                amount: newPaymentCashAmount,
                time: formatDatetime(newPaymentCashTimeTransaction),
                userEdit: "Nguyễn Văn A",
                documents: newPaymentDocuments
            };
            console.log("Dữ liệu khoản thanh toán mới:", dataSend);
            const dataResponse: Payment = {
                id: newPaymentID,
                type: newPaymentType,
                time: newPaymentCashTimeTransaction,
                amount: newPaymentCashAmount,
                document: newPaymentDocuments
            };
            return dataResponse;
        }
    }

    const fetchDeletePayment = async () => {
        // Gọi API xóa khoản thanh toán ở đây
        console.log("ID khoản thanh toán cần xóa:", paymentIDToDelete);
        return true;
    }

    const fetchUpdateCondition = async () => {
        // Gọi API cập nhật điều kiện
        const dataSend = {
            momentID: focusMoment?.id,
            documents: momentDocumentCondition
        };
        console.log("Dữ liệu cập nhật điều kiện:", dataSend);
        return true;
    }

    const conditionConfirm = async () => {
        if (focusMoment) {
            if (focusMoment.needDocument && momentDocumentCondition.length === 0) {
                openNotification("warning", "Vui lòng đính kèm tài liệu chứng minh điều kiện đã được đáp ứng trước khi xác nhận");
                return;
            }
            if (await fetchUpdateCondition()) {
                openNotification("success", "Đã xác nhận điều kiện đã được đáp ứng");
                setPayableEditData(prevData => prevData.map(payable => {
                    if (payable.originalPayDate.type === "condition" && payable.originalPayDate.id === focusMoment.id) {
                        return {
                            ...payable,
                            originalPayDate: {
                                ...payable.originalPayDate,
                                isConditionMet: true,
                                date: new Date().toISOString().split('T')[0]
                            }
                        };
                    }
                    return payable;
                }));
                setFocusMoment(null);
                setMomentDocumentCondition([]);
            } else {
                openNotification("error", "Xác nhận điều kiện thất bại");
            }
        }
    }

    const addNewPayment = async () => {
        if (focusPayments) {
            if (!isValisPayableForm()) {
                openNotification("warning", "Vui lòng điền đầy đủ thông tin để thêm khoản thanh toán mới");
                return;
            }
            const newPayment = await fetchNewPayment();
            setFocusPayments([...focusPayments, newPayment]);
            resetNewPaymentForm();
            openNotification("success", "Thêm khoản thanh toán mới thành công");
        }
    }

    const deletePayment = async () => {
        // Gọi API xóa khoản thanh toán ở đây
        if (focusPayments) {
            if (paymentIDToDelete.trim() === "") {
                openNotification("error", "ID thanh toán cần được cung cấp để xóa");
                return;
            }
            const success = await fetchDeletePayment();
            if (!success) {
                openNotification("error", "Xóa khoản thanh toán thất bại");
                return;
            }
            const updatedPayments = focusPayments.filter(payment => payment.id !== paymentIDToDelete);
            setFocusPayments(updatedPayments);
            setPaymentIDToDelete("");
            resetNewPaymentForm();
        }
    }

    return (
        <div className="p-4">
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
                                    <th className="py-2 px-4 border-b">Hành động</th>
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
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                                                onClick={() => {
                                                    setPaymentIDToDelete(payment.id);
                                                    setOpenDeletePaymentModal(true);
                                                }}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>Chưa có thanh toán nào.</p>
                )}
                <div className="text-lg font-semibold mb-2">Khoản thanh toán mới</div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-bold">Loại thanh toán:</label>
                        <select
                            value={newPaymentType}
                            onChange={(e) => setNewPaymentType(e.target.value as "cash" | "bank")}  
                            className="border p-2 rounded w-full mb-4"
                        >
                            <option value="cash">Tiền mặt</option>
                            <option value="bank">Chuyển khoản</option>
                        </select>
                    </div>
                    
                    {newPaymentType === "bank" && (
                        <div>
                            <label className="font-bold">Mã thanh toán:</label>
                            <input
                                type="text"
                                placeholder="Nhập mã thanh toán"
                                value={newPaymentID}
                                onChange={(e) => setNewPaymentID(e.target.value)}
                                className="border p-2 rounded w-full mb-4"
                            />
                        </div>
                    )}
                    
                    {newPaymentType === "cash" && (
                        <>
                            <div>
                                <label className="font-bold">Số tiền mặt:</label>
                                <input
                                    type="number"
                                    placeholder="Số tiền mặt"
                                    min={0}
                                    value={newPaymentCashAmount}
                                    onChange={(e) => setNewPaymentCashAmount(Number(e.target.value))}
                                    className="border p-2 rounded w-full mb-4"
                                />
                            </div>

                            <div>
                                <label className="font-bold">Thời điểm giao dịch:</label>
                                {/* thời gian giao dịch, kiểu 10/10/2023 14:30 */}
                                <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center mb-2"
                                    onClick={() => {
                                        const input = document.getElementById(
                                            "newPaymentCashTimeTransaction"
                                        ) as HTMLInputElement | null;

                                        if (input) {
                                            input.showPicker?.();
                                            input.focus();
                                        }
                                    }}>
                                    Chọn thời điểm giao dịch
                                </div>
                                <input className="hidden"
                                    id="newPaymentCashTimeTransaction"
                                    type="datetime-local"
                                    placeholder="Thời gian giao dịch"
                                    value={newPaymentCashTimeTransaction}
                                    onChange={(e) => setNewPaymentCashTimeTransaction(e.target.value)}
                                />
                                <span className="text-sm text-gray-500">Thời điểm: {formatDatetime(newPaymentCashTimeTransaction)}</span>
                            </div>
                        </>
                    )}
                    
                </div>
                
                <DocumentEdit parentCode={newPaymentID} forParent="payable" documents={newPaymentDocuments} setDocuments={setNewPaymentDocuments} mode="create" />
                
                <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center mt-4"
                    onClick={async () => {
                        await addNewPayment();
                    }}
                >Thêm khoản thanh toán mới</div>
            </Modal>

            {/* Modal xác nhận xóa khoản thanh toán */}
            <Modal
                title="Xác nhận xóa"
                open={openDeletePaymentModal}
                onCancel={() => setOpenDeletePaymentModal(false)}
                footer={null}
            >
                <p>Bạn có chắc chắn muốn xóa khoản thanh toán này không?</p>
                <div className="mt-4 text-right">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() => {setPaymentIDToDelete(""); setOpenDeletePaymentModal(false)}}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            await deletePayment();
                            setOpenDeletePaymentModal(false);
                            openNotification("success", "Xóa khoản thanh toán thành công");
                        }}
                    >
                        Xóa
                    </button>
                </div>
            </Modal>
            {/* Sửa hạn thanh toán và phí trễ hạn */}
            <Modal
                title="Sửa hạn thanh toán và phí trễ hạn"
                open={openEditDeadlineModal}
                onCancel={() => setOpenEditDeadlineModal(false)}
                footer={null}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-bold">Ngày/điều kiện thanh toán gốc:</label>
                        <div  className="border p-2 rounded">
                            {getMomentDate(focusPayable?.originalPayDate || {type: "date", date: null, needDocument: false, delay: 0, condition: null}) || "N/A"}
                        </div>
                    </div>

                    <div>
                        <label className="font-bold">Hạn thanh toán hiện tại:</label>
                        <div className="border p-2 rounded">{deadlineEditLateDate || "N/A"}</div>
                    </div>

                    <div>
                        <label className="font-bold">Số ngày trễ hạn:</label>
                        <input
                            type="number"
                            min={0}
                            value={deadlineEditDelay}
                            onChange={(e) => setDeadlineEditDelay(Number(e.target.value))}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="font-bold">Phí trễ hạn (%/năm):</label>
                        <input
                            type="number"
                            min={0}
                            step={0.001}
                            value={deadlineEditLateFee}
                            onChange={(e) => setDeadlineEditLateFee(Number(e.target.value))}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                </div>
                <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center mt-4"
                    onClick={() => {
                        if (focusPayable) {
                            const updatedPayable: PayableEditData = {
                                ...focusPayable,
                                delay: deadlineEditDelay,
                                lateFee: deadlineEditLateFee
                            };
                            const updatedPayables = payableEditData.map(payable => payable.id === focusPayable.id ? updatedPayable : payable);
                            setPayableEditData(updatedPayables);
                            setFocusPayable(updatedPayable);
                            setOpenEditDeadlineModal(false);
                            openNotification("success", "Cập nhật hạn thanh toán và phí trễ hạn thành công");
                        }
                    }}
                >
                    Lưu
                </div>
            </Modal>
            {/* Xác nhận điều kiện đã thỏa mãn */}
            <Modal
                title="Xác nhận điều kiện đã thỏa mãn"
                open={focusMoment !== null}
                onCancel={() => {setFocusMoment(null)
                    setMomentDocumentCondition([])}}
                footer={null}
            >
                {focusMoment && focusMoment.needDocument && (
                    <div>
                        <DocumentEdit parentCode={focusMoment.id || ""} forParent="moment" documents={momentDocumentCondition} setDocuments={setMomentDocumentCondition} mode="create" />
                        <p className="text-sm text-red-600">
                            <WarningOutlined /> Vui lòng đính kèm tài liệu chứng minh điều kiện đã được đáp ứng
                        </p>
                    </div>
                )}
                <p className="text-xl text-gray-600">
                    Bạn có chắc chắn muốn xác nhận điều kiện đã được đáp ứng không?
                </p>
                <div className="mt-4 text-right">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() => {
                            setFocusMoment(null)
                            setMomentDocumentCondition([])
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            conditionConfirm();
                        }}
                    >
                        Xác nhận
                    </button>
                </div>
            </Modal>

            <h2 className="text-2xl font-bold mb-4">Công nợ hiện tại</h2>

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
                                {renderColumnCheckbox("Mã hợp đồng", "contractCode", visibleColumns, setVisibleColumns)}
                                {renderColumnCheckbox("Tên hợp đồng", "title", visibleColumns, setVisibleColumns)}
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
            
            <div className="overflow-x-auto">
                <table className="bg-white border border-gray-300">
                    <thead>
                        <tr>
                            {visibleColumns.contractCode && <th className="py-2 px-4 border-b">Mã hợp đồng</th>}
                            {visibleColumns.title && <th className="py-2 px-4 border-b">Tên hợp đồng</th>}
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
                            <th className="py-2 px-4 border-b">Hành động</th>
                        </tr>
                    </thead>
                <tbody>
                    {/* Duyệt qua dữ liệu công nợ và hiển thị trong bảng */}
                    {payableEditData.map((payable) => (
                        <tr key={payable.id}>
                            {visibleColumns.contractCode && <td className="py-2 px-4 border-b">{payable.contractID}</td>}
                            {visibleColumns.title && <td className="py-2 px-4 border-b">{payable.contractTitle}</td>}
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
                            <td className="flex flex-wrap py-2 px-4 border-b gap-2">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                    onClick={() => {
                                        setFocusPayable(payable);
                                        setOpenEditDeadlineModal(true);
                                    }}
                                >
                                    Sửa hạn thanh toán
                                </button>

                                {payable.originalPayDate.type === "condition" && !payable.originalPayDate.isConditionMet && (
                                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                                        onClick={() => {
                                            setMomentDocumentCondition([]);
                                            setFocusMoment(payable.originalPayDate);
                                        }}
                                    >
                                        Điều kiện đã được đáp ứng
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
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

const formatDatetime = (value: string) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) {
        return "NaN";
    }
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

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

type TableColumnKey = "contractCode" | "title" | "type" | "partner" | "totalAmount" | "paymentDate" | "lateDate" | "note" | "lateFee" | "status" | "payment" | "delay" | "conditionDocument";


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