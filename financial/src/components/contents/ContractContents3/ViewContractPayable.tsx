import { useEffect, useMemo, useState } from "react";
import type { Document, Moment, PayableEditData, Payment } from "../../../types/ContractData3";
import { EyeOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { BACKEND_SERVER } from "../../../api/configAPI";
import {
    GetContractPayables,
    LinkPayableTransaction,
    UnlinkPayableTransaction,
} from "../../../api/payable";


type Props = {
    contractID: string | undefined;
    contractDocuments: Document[];
    mode: "view" | "edit" | "create";
};

export default function ViewContractPayable({ contractID, contractDocuments, mode }: Props) {
    const [data, setData] = useState<PayableEditData[]>([]);
    const [focusPayments, setFocusPayments] = useState<Payment[] | null>(null);
    const [focusPayable, setFocusPayable] = useState<PayableEditData | null>(null);
    const [showPayableColumnsOpen, setShowPayableColumnsOpen] = useState(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
        conditionDocument: false,
    });

    const [bankTransactionId, setBankTransactionId] = useState("");
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [transactionDate, setTransactionDate] = useState("");
    const [selectedDocumentIDs, setSelectedDocumentIDs] = useState<string[]>([]);

    const selectedContractDocuments = useMemo(() => contractDocuments || [], [contractDocuments]);

    const fetchPayableData = async () => {
        if (!contractID) {
            setData([]);
            return;
        }

        setLoading(true);
        try {
            const response = await GetContractPayables(contractID);
            setData(response);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin công nợ:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getData = async () => {
            if (contractID && mode !== "create") {
                await fetchPayableData();
            } else {
                setData([]);
            }
        };
        getData();
    }, [contractID, mode]);

    const openLinkModal = (payable: PayableEditData) => {
        setFocusPayable(payable);
        setBankTransactionId("");
        setFromAccount("");
        setToAccount("");
        setTransactionAmount(payable.totalAmount);
        setTransactionDate(payable.originalPayDate.date || new Date().toISOString().split("T")[0]);
        setSelectedDocumentIDs([]);
        setLinkModalOpen(true);
    };

    const handleLinkTransaction = async () => {
        if (!focusPayable?.payableID) {
            window.alert("Không xác định được công nợ để ghép giao dịch.");
            return;
        }
        if (!bankTransactionId.trim()) {
            window.alert("Vui lòng nhập mã chuyển khoản.");
            return;
        }
        if (!fromAccount.trim() || !toAccount.trim()) {
            window.alert("Vui lòng nhập tài khoản chuyển và tài khoản nhận.");
            return;
        }
        if (!transactionDate) {
            window.alert("Vui lòng chọn ngày giao dịch.");
            return;
        }

        const success = await LinkPayableTransaction({
            payableID: focusPayable.payableID,
            bankTransactionId: bankTransactionId.trim(),
            fromAccount: fromAccount.trim(),
            toAccount: toAccount.trim(),
            amount: transactionAmount,
            dayExecute: `${transactionDate} 00:00:00`,
            documentIDs: selectedDocumentIDs,
        });

        if (success) {
            setLinkModalOpen(false);
            setFocusPayable(null);
            await fetchPayableData();
        }
    };

    const handleUnlinkTransaction = async (payable: PayableEditData) => {
        if (!payable.payableID) return;
        const confirmed = window.confirm("Bạn muốn tách ghép giao dịch khỏi công nợ này?");
        if (!confirmed) return;

        const success = await UnlinkPayableTransaction(payable.payableID);
        if (success) {
            await fetchPayableData();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Chi tiết công nợ đang thực hiện</h2>

            <Modal
                title="Chi tiết thanh toán"
                open={focusPayments !== null}
                width={800}
                onCancel={() => setFocusPayments(null)}
                footer={null}
            >
                {focusPayments && focusPayments.length > 0 ? (
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
                            {focusPayments.map((payment, index) => (
                                <tr key={payment.transactionID || index}>
                                    <td className="py-2 px-4 border-b">{payment.bankTransactionId}</td>
                                    <td className="py-2 px-4 border-b">{payment.dayExecute}</td>
                                    <td className="py-2 px-4 border-b">{payment.amount.toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">
                                        {payment?.documents?.length > 0 ? (
                                            payment?.documents.map((doc, index) => (
                                                <div
                                                    key={index}
                                                    className="text-blue-500 cursor-pointer hover:underline"
                                                    onClick={() => openDocument(doc)}
                                                >
                                                    {doc.name}
                                                </div>
                                            ))
                                        ) : (
                                            "Không có tài liệu đính kèm"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa có thanh toán nào.</p>
                )}
            </Modal>

            <Modal
                title={focusPayable ? `Ghép mã giao dịch - ${focusPayable.partner}` : "Ghép mã giao dịch"}
                open={linkModalOpen}
                width={900}
                onCancel={() => setLinkModalOpen(false)}
                footer={null}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Mã chuyển khoản</span>
                        <input className="border rounded px-2 py-1" value={bankTransactionId} onChange={(e) => setBankTransactionId(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày giao dịch</span>
                        <input type="date" className="border rounded px-2 py-1" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Tài khoản chuyển</span>
                        <input className="border rounded px-2 py-1" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Tài khoản nhận</span>
                        <input className="border rounded px-2 py-1" value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">Số tiền</span>
                        <input type="number" className="border rounded px-2 py-1" value={transactionAmount} onChange={(e) => setTransactionAmount(parseFloat(e.target.value) || 0)} />
                    </label>
                    <div className="md:col-span-2">
                        <div className="mb-2 text-sm font-semibold text-slate-700">Tài liệu đính kèm mã chuyển khoản</div>
                        {selectedContractDocuments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded border p-3">
                                {selectedContractDocuments.map((doc) => (
                                    <label key={doc.documentID} className="flex items-center gap-2 rounded border px-2 py-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocumentIDs.includes(doc.documentID)}
                                            onChange={() => {
                                                setSelectedDocumentIDs((prev) =>
                                                    prev.includes(doc.documentID)
                                                        ? prev.filter((id) => id !== doc.documentID)
                                                        : [...prev, doc.documentID]
                                                );
                                            }}
                                        />
                                        <span className="text-sm">{doc.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">Hợp đồng này chưa có tài liệu nào để ghép.</div>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={() => setLinkModalOpen(false)}>
                        Hủy
                    </button>
                    <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleLinkTransaction}>
                        Ghép mã giao dịch
                    </button>
                </div>
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

            {loading ? <div className="text-sm text-slate-500 mb-2">Đang tải công nợ...</div> : null}

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
                            <th className="py-2 px-4 border-b">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((payable) => (
                            <tr key={payable.payableID || payable.id}>
                                {visibleColumns.type && <td className="py-2 px-4 border-b">{payable.type === "receive" ? "Thu" : "Chi"}</td>}
                                {visibleColumns.partner && <td className="py-2 px-4 border-b">{payable.partner}</td>}
                                {visibleColumns.totalAmount && <td className="py-2 px-4 border-b">{payable.totalAmount.toLocaleString()}</td>}
                                {visibleColumns.paymentDate && <td className="py-2 px-4 border-b">{getMomentDate(payable.originalPayDate) || "N/A"}</td>}
                                {visibleColumns.lateDate && <td className="py-2 px-4 border-b">{finalDate(getMomentDate(payable.originalPayDate) || "", payable.delay)}</td>}
                                {visibleColumns.conditionDocument && (
                                    <td className="py-2 px-4 border-b">
                                        {payable.originalPayDate?.documentCondition ? (
                                            payable.originalPayDate.documentCondition.length > 0 ? (
                                                payable.originalPayDate.documentCondition.map((doc, index) => (
                                                    <div key={index} className="text-blue-500 cursor-pointer hover:underline" onClick={() => openDocument(doc)}>
                                                        {doc.name}.{doc.fileType}
                                                    </div>
                                                ))
                                            ) : (
                                                "Không có tài liệu"
                                            )
                                        ) : (
                                            "Không có tài liệu"
                                        )}
                                    </td>
                                )}
                                {visibleColumns.lateFee && <td className="py-2 px-4 border-b">{payable.lateFee}%</td>}
                                {visibleColumns.delay && <td className="py-2 px-4 border-b">{payable.delay}</td>}
                                {visibleColumns.note && <td className="py-2 px-4 border-b">{payable.note}</td>}
                                {visibleColumns.payment && (
                                    <td className="py-2 px-4 border-b">
                                        {payable.payment.length > 0 ? (
                                            <div className="border p-2 rounded mb-2 bg-green-100">
                                                <p><strong className="text-lg text-green-700">{sumAmount(payable.payment).toLocaleString()}</strong></p>
                                                <div className="text-green-700 cursor-pointer hover:underline inline-block mt-1" onClick={() => setFocusPayments(payable.payment)}>
                                                    <EyeOutlined /> Chi tiết
                                                </div>
                                            </div>
                                        ) : (
                                            "Chưa thanh toán"
                                        )}
                                    </td>
                                )}
                                {visibleColumns.status && (
                                    <td className="py-2 px-4 border-b">
                                        {payable.status === "overdue" && <span className="text-red-500 font-bold">Quá hạn</span>}
                                        {payable.status === "paid" && <span className="text-green-500 font-bold">Đã thanh toán</span>}
                                        {payable.status === "not_enough" && <span className="text-yellow-500 font-bold">Thanh toán chưa đủ</span>}
                                        {payable.status === "waiting" && <span className="text-purple-500 font-bold">Đã đến ngày thanh toán</span>}
                                        {payable.status === "pending" && <span className="text-blue-500 font-bold">Chưa đến ngày thanh toán</span>}
                                    </td>
                                )}
                                <td className="py-2 px-4 border-b whitespace-nowrap">
                                    <button className="px-2 py-1 rounded bg-blue-600 text-white mr-2" onClick={() => openLinkModal(payable)}>
                                        Ghép mã giao dịch
                                    </button>
                                    {payable.payableID ? (
                                        <button className="px-2 py-1 rounded bg-rose-600 text-white" onClick={() => handleUnlinkTransaction(payable)}>
                                            Tách ghép
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 ? (
                            <tr>
                                <td className="py-4 px-4 text-center text-slate-500" colSpan={12}>
                                    Chưa có công nợ nào.
                                </td>
                            </tr>
                        ) : null}
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
    }
    if (moment.type === "condition") {
        if (moment.isConditionMet) {
            const date = moment.date ? new Date(moment.date) : new Date();
            return date.toISOString().split("T")[0];
        }
        return moment.condition;
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
    return d.toISOString().split("T")[0];
};

function openDocument(doc: Document) {
    const url = doc.url ? `${BACKEND_SERVER}${doc.url}` : "";
    if (!url) return;
    if (doc.fileType === "pdf") {
        window.open(url, "_blank");
        return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
