import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Payable } from "../../../types/ContractDataType";
import type { ContractCalendarData } from "../../../types/DataType";
import { contractsCalendar, derivedTransactions, derivedPendingReceives, derivedCompletedReceive, derivedCompletedPay } from "../../../types/mockOri";
import { Modal } from "antd";

// import {WarningOutlined} from "@ant-design/icons";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import InTimePayable from "./InTimePayable";

type Transaction = {
    id_transaction: string;
    account: string;
    partner: string;
    amount: number;
    paytime: string;
    status: string;
};

type CompletePayable = {
    partner: string;
    contractTitle: string;
    amount: number;
    paytime: string;
    lastTime: string;
    late: number;
    latePee: number;
    status: "paided" | "not_enough" | "overflow" | "overdue";
    payments: Transaction[];
}

export default function PayableEdit() {
    const navigate = useNavigate();
    const now = new Date();

    const [modeModal, setModeModal] = useState<"bank" | "cash" | null>(null);
    const [supplementFiles, setSupplementFiles] = useState<File[]>([]);
    const [isDraggingSupplement, setIsDraggingSupplement] = useState(false);
    const supplementInputRef = useRef<HTMLInputElement | null>(null);

    const [searchTransactionTerm, setSearchTransactionTerm] = useState("");
    const [fromDate, setFromDate] = useState(now.toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(now.toISOString().split("T")[0]);
    const [receiveSearchTerm, setReceiveSearchTerm] = useState("");
    const [receiveFromDate, setReceiveFromDate] = useState("");
    const [receiveToDate, setReceiveToDate] = useState("");
    const [receiveStatusFilter, setReceiveStatusFilter] = useState<"all" | CompletePayable["status"]>("all");
    const [paySearchTerm, setPaySearchTerm] = useState("");
    const [payFromDate, setPayFromDate] = useState("");
    const [payToDate, setPayToDate] = useState("");
    const [payStatusFilter, setPayStatusFilter] = useState<"all" | CompletePayable["status"]>("all");
    const [receiveColumnsOpen, setReceiveColumnsOpen] = useState(false);
    const [payColumnsOpen, setPayColumnsOpen] = useState(false);
    const [visibleReceiveColumns, setVisibleReceiveColumns] = useState<Record<ReceiveTableColumnKey, boolean>>({
        contract: true,
        amount: true,
        paytime: true,
        lastTime: true,
        late: true,
        latePee: true,
        total: true,
        status: true,
        txId: true,
        txTime: true,
        txAmount: true,
    });
    const [visiblePayColumns, setVisiblePayColumns] = useState<Record<ReceiveTableColumnKey, boolean>>({
        contract: true,
        amount: true,
        paytime: true,
        lastTime: true,
        late: true,
        latePee: true,
        total: true,
        status: true,
        txId: true,
        txTime: true,
        txAmount: true,
    });

    // Mock data (can be moved to a mock file later)
    const [bankAccounts] = useState([
        { id: 1, name: "Vietcombank", balance: 120000000 },
        { id: 2, name: "BIDV", balance: 45000000 },
    ]);

    const [payables, setPayables] = useState<Payable[]>([]);

    

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [completedReceive, setCompletedReceive] = useState<CompletePayable[]>([]);

    const [completedPay, setCompletedPay] = useState<CompletePayable[]>([]);

    // Use derived lists from mockOri (precomputed)
    useEffect(() => {
        const loadData = () => {
            setTransactions(derivedTransactions as Transaction[]);
            setPayables(derivedPendingReceives as Payable[]);
            setCompletedReceive(derivedCompletedReceive as CompletePayable[]);
            setCompletedPay(derivedCompletedPay as CompletePayable[]);
        }
        loadData(); 
    }, []);

    const handleSupplementFiles = (files: FileList | File[]) => {
        const nextFiles = Array.from(files);
        if (!nextFiles.length) return;
        setSupplementFiles((current) => [...current, ...nextFiles]);
    };

    const openSupplementPicker = () => {
        supplementInputRef.current?.click();
    };

    const removeSupplementFile = (index: number) => {
        setSupplementFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    };

    // use calendar mock from mockOri
    const [cashflowContracts] = useState<ContractCalendarData[]>(contractsCalendar);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredDue = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return payables;
        return payables.filter(p =>
            p.partner.toLowerCase().includes(q) ||
            String(p.amount).includes(q) ||
            p.status.toLowerCase().includes(q)
        );
    }, [payables, searchTerm]);

    const filteredCompletedReceive = useMemo(() => {
        return completedReceive.filter((item) => {
            if (receiveStatusFilter !== "all" && item.status !== receiveStatusFilter) return false;
            if (receiveFromDate && item.paytime < receiveFromDate) return false;
            if (receiveToDate && item.paytime > receiveToDate) return false;

            const q = receiveSearchTerm.trim().toLowerCase();
            if (!q) return true;

            return (
                item.partner.toLowerCase().includes(q) ||
                item.contractTitle.toLowerCase().includes(q) ||
                String(item.amount).includes(q) ||
                item.status.toLowerCase().includes(q) ||
                item.payments.some((payment) =>
                    payment.id_transaction.toLowerCase().includes(q) ||
                    payment.account.toLowerCase().includes(q) ||
                    payment.partner.toLowerCase().includes(q) ||
                    String(payment.amount).includes(q)
                )
            );
        });
    }, [completedReceive, receiveSearchTerm, receiveFromDate, receiveToDate, receiveStatusFilter]);

    const filteredCompletedPay = useMemo(() => {
        return completedPay.filter((item) => {
            if (payStatusFilter !== "all" && item.status !== payStatusFilter) return false;
            if (payFromDate && item.paytime < payFromDate) return false;
            if (payToDate && item.paytime > payToDate) return false;

            const q = paySearchTerm.trim().toLowerCase();
            if (!q) return true;

            return (
                item.partner.toLowerCase().includes(q) ||
                item.contractTitle.toLowerCase().includes(q) ||
                String(item.amount).includes(q) ||
                item.status.toLowerCase().includes(q) ||
                item.payments.some((payment) =>
                    payment.id_transaction.toLowerCase().includes(q) ||
                    payment.account.toLowerCase().includes(q) ||
                    payment.partner.toLowerCase().includes(q) ||
                    String(payment.amount).includes(q)
                )
            );
        });
    }, [completedPay, paySearchTerm, payFromDate, payToDate, payStatusFilter]);

    const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " VND";
    const totalCurrency = useMemo(() => bankAccounts.reduce((sum, b) => sum + b.balance, 0), [bankAccounts]);

    useEffect(() => {
        // placeholder for fetching real data later
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 text-slate-800">
            <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Quản lý công nợ</h1>
                            <p className="text-sm text-slate-500">Xem nhanh tài khoản, công nợ trong ngày và công nợ quá hạn.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="rounded-full bg-slate-900 px-4 py-2 text-white" onClick={() => navigate(-1)}>Trở lại</button>
                        </div>
                    </div>

                    <InTimePayable />

                    <div className="mt-4 grid gap-5 md:grid-cols-2">
                        <table className="min-w-full table-auto">
                            <thead className="text-left text-bold text-slate-500">
                                <tr>
                                    <th className="px-4 py-2">Tài khoản ngân hàng</th>
                                    <th className="px-4 py-2">Số dư hiện tại</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankAccounts.map((b) => (
                                    <tr key={b.id} className="border-t">
                                        <td className="px-4 py-3 text-sm text-slate-700">{b.name}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(b.balance)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-900">Tổng tiền</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-900">{formatCurrency(bankAccounts.reduce((sum, b) => sum + b.balance, 0))}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div>
                            <BalancePredictionChart totalCurrency={totalCurrency} contracts={cashflowContracts} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">Danh sách công nợ</h2>
                                <p className="text-sm text-slate-500">Công nợ cần thu / cần trả trong ngày và quá hạn.</p>
                            </div>
                            <input
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                placeholder="Tìm theo tên, số tiền, trạng thái..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-2">
                            <Modal
                                open={modeModal !== null}
                                onCancel={() => setModeModal(null)}
                                footer={null}
                            >
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold">{modeModal === "bank" ? "Giao dịch ngân hàng" : "Giao dịch tiền mặt"}</h2>
                                    {modeModal === "bank" && (
                                        <>
                                            <p className="text-sm text-slate-500">Mã giao dịch</p>
                                            <input
                                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                                placeholder="Nhập mã giao dịch..."
                                            />
                                        </>
                                    )}
                                    <p className="text-sm text-slate-500">Tài liệu bổ sung</p>
                                    <input
                                        ref={supplementInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                handleSupplementFiles(e.target.files);
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                    <div
                                        className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${isDraggingSupplement ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
                                        onClick={openSupplementPicker}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            setIsDraggingSupplement(true);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDraggingSupplement(true);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            setIsDraggingSupplement(false);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingSupplement(false);
                                            if (e.dataTransfer.files?.length) {
                                                handleSupplementFiles(e.dataTransfer.files);
                                            }
                                        }}
                                    >
                                        <div className="text-sm font-semibold text-slate-800">Kéo thả tài liệu vào đây</div>
                                        <div className="mt-1 text-xs text-slate-500">Hoặc bấm để chọn file PDF, DOCX, PNG, JPG</div>
                                    </div>
                                    {supplementFiles.length > 0 && (
                                        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                                            <div className="text-sm font-semibold text-slate-700">Tệp đã chọn</div>
                                            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                                {supplementFiles.map((file, index) => (
                                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                                                        <div className="min-w-0">
                                                            <div className="truncate font-medium text-slate-800">{file.name}</div>
                                                            <div className="text-xs text-slate-500">{formatFileSize(file.size)}</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                                                            onClick={() => removeSupplementFile(index)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button className="w-full rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={() => setModeModal(null)}>
                                        Xác nhận
                                    </button>
                                </div>
                            </Modal>
                            {filteredDue.map((p, idx) => (
                                <div key={idx} className={`flex items-center justify-between gap-3 rounded-2xl p-3 ${p.status === 'overdue' ? 'bg-rose-50 ring-1 ring-rose-100' : 'bg-white ring-1 ring-slate-100'}`}>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{p.partner}</div>
                                        <div className="text-xs text-slate-500">{p.paytime} • {payableStatusLabel({ status: p.status })}</div>
                                        <div className="flex flex-row gap-2">
                                            {/* <button className="mt-1 text-xs bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-lg" onClick={() => navigate(`/dashboard/contract/payable/detail/${idx}`)}>
                                                Xem chi tiết hợp đồng
                                            </button> */}
                                            <button className="mt-1 text-xs bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded-lg" 
                                                onClick={() => setModeModal("bank")}
                                            >
                                                Ghép mã giao dịch
                                            </button>

                                            <button className="mt-1 text-xs bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded-lg" 
                                                onClick={() => setModeModal("cash")}
                                            >
                                                Giao dịch tiền mặt
                                            </button>

                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold">Giao dịch</h2>
                            <p className="text-sm text-slate-500">Bộ lọc</p>
                        </div>
                        <div className="w-full mt-2">
                            <input
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                placeholder="Tìm theo mã tài khoản, đối tác, số tiền, mã giao dịch..."
                                value={searchTransactionTerm}
                                onChange={(e) => setSearchTransactionTerm(e.target.value)}
                            />
                            <div className="flex items-center gap-2 mt-1">
                                <p>Từ</p>
                                <input
                                    type="date"
                                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                                <p>Đến</p>
                                <input
                                    type="date"
                                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-2">
                            {transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{t.account}</div>
                                        <div className="text-xs text-slate-500">{t.paytime} • {transactionStatusLabel({ status: t.status })}</div>
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">{formatCurrency(t.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-lg font-bold">Công nợ đã thu</h2>
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                placeholder="Tìm theo đối tác, hợp đồng, số tiền..."
                                value={receiveSearchTerm}
                                onChange={(e) => setReceiveSearchTerm(e.target.value)}
                            />
                            <p>Thanh toán từ</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveFromDate}
                                onChange={(e) => setReceiveFromDate(e.target.value)}
                            />
                            <p>đến</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveToDate}
                                onChange={(e) => setReceiveToDate(e.target.value)}
                            />
                            <select
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveStatusFilter}
                                onChange={(e) => setReceiveStatusFilter(e.target.value as "all" | CompletePayable["status"])}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="paided">Đã thanh toán</option>
                                <option value="not_enough">Chưa đủ tiền</option>
                                <option value="overflow">Thanh toán dư</option>
                                <option value="overdue">Quá hạn</option>
                            </select>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    onClick={() => setReceiveColumnsOpen((value) => !value)}
                                >
                                    Hiển thị cột
                                </button>

                                {receiveColumnsOpen && (
                                    <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                        <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng công nợ đã thu</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {renderColumnCheckbox("Hợp đồng", "contract", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Số tiền cần thu", "amount", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Ngày cần thanh toán", "paytime", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Ngày thanh toán", "lastTime", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Số ngày muộn", "late", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Phí phạt", "latePee", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Tổng tiền", "total", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Trạng thái", "status", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Mã giao dịch", "txId", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Thời điểm thanh toán", "txTime", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Số tiền giao dịch", "txAmount", visibleReceiveColumns, setVisibleReceiveColumns)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="text-left text-xs text-slate-500">
                                <tr>
                                    {visibleReceiveColumns.contract && <th className="px-4 py-2">Hợp đồng</th>}
                                    {visibleReceiveColumns.amount && <th className="px-4 py-2">Số tiền cần thu</th>}
                                    {visibleReceiveColumns.paytime && <th className="px-4 py-2">Ngày cần thanh toán</th>}
                                    {visibleReceiveColumns.lastTime && <th className="px-4 py-2">Ngày thanh toán</th>}
                                    {visibleReceiveColumns.late && <th className="px-4 py-2">Số ngày muộn</th>}
                                    {visibleReceiveColumns.latePee && <th className="px-4 py-2">Phí phạt</th>}
                                    {visibleReceiveColumns.total && <th className="px-4 py-2">Tổng tiền</th>}
                                    {visibleReceiveColumns.status && <th className="px-4 py-2">Trạng thái</th>}
                                    {visibleReceiveColumns.txId && <th className="px-4 py-2">Mã giao dịch</th>}
                                    {visibleReceiveColumns.txTime && <th className="px-4 py-2">Thời điểm thanh toán</th>}
                                    {visibleReceiveColumns.txAmount && <th className="px-4 py-2">Số tiền giao dịch</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompletedReceive.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-4 text-center text-sm text-slate-500" colSpan={countVisibleColumns(visibleReceiveColumns)}>
                                            Không có công nợ đã thu phù hợp.
                                        </td>
                                    </tr>
                                )}
                                {filteredCompletedReceive.map((c, i) => (
                                    <Fragment key={i}>
                                        {c.payments.map((p, paymentIndex) => (
                                            <tr key={`${i}-${paymentIndex}`} className="border-t">
                                                {paymentIndex === 0 && (
                                                    <>
                                                        {visibleReceiveColumns.contract && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                <div>
                                                                    <p>{c.contractTitle}</p>
                                                                    <span>{c.partner}</span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.amount && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(c.amount)}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.paytime && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.paytime}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.lastTime && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.lastTime}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.late && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.late > 0 ? c.late : "-"}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.latePee && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.latePee > 0 ? formatCurrency(c.latePee) : "-"}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.total && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(c.payments.reduce((sum, p) => sum + p.amount, 0))}
                                                            </td>
                                                        )}

                                                        {visibleReceiveColumns.status && (
                                                            <td rowSpan={c.payments.length} className={`px-4 py-3 text-sm ${c.status === 'paided' ? 'text-green-600' : c.status === 'not_enough' ? 'text-orange-600' : c.status === 'overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                                                {payableStatusLabel({ status: c.status })}
                                                            </td>
                                                        )}
                                                    </>
                                                )}

                                                {visibleReceiveColumns.txId && <td className="px-4 py-3 text-sm text-slate-700">{p.id_transaction}</td>}
                                                {visibleReceiveColumns.txTime && <td className="px-4 py-3 text-sm text-slate-700">{p.paytime}</td>}
                                                {visibleReceiveColumns.txAmount && <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</td>}
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-lg font-bold">Công nợ đã trả</h2>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                placeholder="Tìm theo đối tác, hợp đồng, số tiền..."
                                value={paySearchTerm}
                                onChange={(e) => setPaySearchTerm(e.target.value)}
                            />
                            <p>Thanh toán từ</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payFromDate}
                                onChange={(e) => setPayFromDate(e.target.value)}
                            />
                            <p>đến</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payToDate}
                                onChange={(e) => setPayToDate(e.target.value)}
                            />
                            <select
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payStatusFilter}
                                onChange={(e) => setPayStatusFilter(e.target.value as "all" | CompletePayable["status"])}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="paided">Đã thanh toán</option>
                                <option value="not_enough">Chưa đủ tiền</option>
                                <option value="overflow">Thanh toán dư</option>
                                <option value="overdue">Quá hạn</option>
                            </select>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    onClick={() => setPayColumnsOpen((value) => !value)}
                                >
                                    Hiển thị cột
                                </button>

                                {payColumnsOpen && (
                                    <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                        <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng công nợ đã trả</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {renderColumnCheckbox("Hợp đồng", "contract", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Số tiền cần trả", "amount", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Ngày cần thanh toán", "paytime", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Ngày thanh toán", "lastTime", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Số ngày muộn", "late", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Phí phạt", "latePee", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Tổng tiền", "total", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Trạng thái", "status", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Mã giao dịch", "txId", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Thời điểm thanh toán", "txTime", visiblePayColumns, setVisiblePayColumns)}
                                            {renderColumnCheckbox("Số tiền giao dịch", "txAmount", visiblePayColumns, setVisiblePayColumns)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="text-left text-xs text-slate-500">
                                <tr>
                                    {visiblePayColumns.contract && <th className="px-4 py-2">Hợp đồng</th>}
                                    {visiblePayColumns.amount && <th className="px-4 py-2">Số tiền cần trả</th>}
                                    {visiblePayColumns.paytime && <th className="px-4 py-2">Ngày cần thanh toán</th>}
                                    {visiblePayColumns.lastTime && <th className="px-4 py-2">Ngày thanh toán</th>}
                                    {visiblePayColumns.late && <th className="px-4 py-2">Số ngày muộn</th>}
                                    {visiblePayColumns.latePee && <th className="px-4 py-2">Phí phạt</th>}
                                    {visiblePayColumns.total && <th className="px-4 py-2">Tổng tiền</th>}
                                    {visiblePayColumns.status && <th className="px-4 py-2">Trạng thái</th>}
                                    {visiblePayColumns.txId && <th className="px-4 py-2">Mã giao dịch</th>}
                                    {visiblePayColumns.txTime && <th className="px-4 py-2">Thời điểm thanh toán</th>}
                                    {visiblePayColumns.txAmount && <th className="px-4 py-2">Số tiền giao dịch</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompletedPay.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-4 text-center text-sm text-slate-500" colSpan={countVisibleColumns(visiblePayColumns)}>
                                            Không có công nợ đã trả phù hợp.
                                        </td>
                                    </tr>
                                )}
                                {filteredCompletedPay.map((c, i) => (
                                    <Fragment key={i}>
                                        {c.payments.map((p, paymentIndex) => (
                                            <tr key={`${i}-${paymentIndex}`} className="border-t">
                                                {paymentIndex === 0 && (
                                                    <>
                                                        {visiblePayColumns.contract && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                <div>
                                                                    <p>{c.contractTitle}</p>
                                                                    <span>{c.partner}</span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.amount && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(c.amount)}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.paytime && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.paytime}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.lastTime && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.lastTime}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.late && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm text-slate-700">
                                                                {c.late > 0 ? c.late : "-"}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.latePee && (
                                                            <td rowSpan={c.payments.length} className={`px-4 py-3 text-sm ${c.latePee > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                                                                {c.latePee > 0 ? formatCurrency(c.latePee) : "-"}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.total && (
                                                            <td rowSpan={c.payments.length} className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                                {formatCurrency(c.payments.reduce((sum, p) => sum + p.amount, 0))}
                                                            </td>
                                                        )}

                                                        {visiblePayColumns.status && (
                                                            <td rowSpan={c.payments.length} className={`px-4 py-3 text-sm ${c.status === 'paided' ? 'text-green-600' : c.status === 'not_enough' ? 'text-orange-600' : c.status === 'overdue' ? 'text-red-600' : 'text-slate-600'}`}>
                                                                {payableStatusLabel({ status: c.status })}
                                                            </td>
                                                        )}
                                                    </>
                                                )}

                                                {visiblePayColumns.txId && <td className="px-4 py-3 text-sm text-slate-700">{p.id_transaction}</td>}
                                                {visiblePayColumns.txTime && <td className="px-4 py-3 text-sm text-slate-700">{p.paytime}</td>}
                                                {visiblePayColumns.txAmount && <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(p.amount)}</td>}
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    )
}

function BalancePredictionChart({ totalCurrency = 0, contracts = [] }: { totalCurrency?: number; contracts?: ContractCalendarData[]}) {
    type PredDay = { date: string; balance: number; delta: number; receiveItems: ContractCalendarData[]; payItems: ContractCalendarData[] };

    const [predictionDaysCount, setPredictionDaysCount] = useState(30);

    const prediction = useMemo(() => {
        const now = new Date();
        const daysCount = Math.max(1, predictionDaysCount);
        const days: PredDay[] = [];
        let balance = totalCurrency;

        const parseDate = (s: string) => {
            if (!s) return new Date("1970-01-01");
            // support ISO yyyy-mm-dd or dd/mm/yyyy
            if (s.includes("-")) {
                const d = new Date(s);
                if (!isNaN(d.getTime())) return d;
            }
            if (s.includes("/")) {
                const parts = s.split("/").map((p) => parseInt(p, 10));
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    return new Date(y, m - 1, d);
                }
            }
            const f = new Date(s);
            return isNaN(f.getTime()) ? new Date(s.replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, "$3-$2-$1")) : f;
        };

        for (let i = 0; i < daysCount; i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);

            const receiveItems: ContractCalendarData[] = [];
            const payItems: ContractCalendarData[] = [];

            let delta = 0;

            contracts.forEach((c) => {
                const cd = parseDate(c.date);

                if (
                    cd.getFullYear() === d.getFullYear() &&
                    cd.getMonth() === d.getMonth() &&
                    cd.getDate() === d.getDate()
                ) {
                    if (c.type === "receive") {
                        delta += c.money;
                        receiveItems.push(c);
                    } else if (c.type === "pay") {
                        delta -= c.money;
                        payItems.push(c);
                    }
                }
            });

            balance += delta;

            const dd = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

            days.push({
                date: dd,
                balance,
                delta,
                receiveItems,
                payItems
            });
        }

        return days;
    }, [contracts, totalCurrency, predictionDaysCount]);

    const balances = prediction.map(i => i.balance);

    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);

    const diff = maxBalance - minBalance;
    const padding = Math.max(diff * 0.2, 1000000);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">
                        Dự đoán số dư trong <input
                            type="number"
                            min={1}
                            max={365}
                            value={predictionDaysCount}
                            onChange={(e) => setPredictionDaysCount(parseInt(e.target.value))}
                            className="rounded border border-gray-300 px-2 py-1"
                        /> ngày tới
                    </div>

                    <div className="text-sm text-gray-500">
                        Biến động trong {predictionDaysCount} ngày tới
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-400">
                        Số dư cuối kỳ
                    </div>

                    <div className="font-bold text-blue-600">
                        {formatMoney(
                            prediction[prediction.length - 1]?.balance || 0
                        )} ₫
                    </div>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={prediction}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 10,
                            bottom: 0
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="balanceGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#2563eb"
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#2563eb"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                        />

                        <YAxis
                            domain={[
                                minBalance - padding,
                                maxBalance + padding
                            ]}
                            tickFormatter={(v) =>
                                `${(
                                    Number(v) / 1000000
                                ).toFixed(0)}Tr`
                            }
                            tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            offset={20}
                            cursor={{
                                stroke: "#94a3b8",
                                strokeWidth: 1,
                                strokeDasharray: "5 5"
                            }}
                        />

                        <Area
                            type="linear"
                            dataKey="balance"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fill="url(#balanceGradient)"
                            animationDuration={800}
                            dot={{
                                r: 3,
                                fill: "#2563eb"
                            }}
                            activeDot={{
                                r: 6
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: Record<string, unknown> }>; label?: string }) => {
    if (!active || !payload || !payload.length)
        return null;

    const data = (payload[0].payload as unknown) as { balance: number; delta: number; receiveItems: ContractCalendarData[]; payItems: ContractCalendarData[] };

    return (
        <div className="pointer-events-none rounded-2xl border bg-white p-4 shadow-xl">
            <div className="mb-3 font-bold text-gray-800">
                Ngày {label}
            </div>

            <div className="mb-4">
                <div className="text-xs text-gray-500">Số dư dự đoán</div>
                <div className="text-lg font-bold text-blue-600">{formatMoney(data.balance)} ₫</div>
            </div>

            {data.receiveItems?.length > 0 && (
                <div className="mb-4">
                    <div className="mb-2 font-semibold text-green-600">Tiền vào</div>
                    <div className="space-y-1">
                        {data.receiveItems.map((item: ContractCalendarData, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4">
                                <div className="truncate text-gray-700">{item.title}</div>
                                <div className="whitespace-nowrap font-medium text-green-600">+{formatMoney(item.money)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.payItems?.length > 0 && (
                <div className="mb-4">
                    <div className="mb-2 font-semibold text-red-600">Tiền ra</div>
                    <div className="space-y-1">
                        {data.payItems.map((item: ContractCalendarData, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4">
                                <div className="truncate text-gray-700">{item.title}</div>
                                <div className="whitespace-nowrap font-medium text-red-600">-{formatMoney(item.money)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between border-t pt-3 font-semibold">
                <div>Biến động</div>
                <div className={data.delta >= 0 ? "text-green-600" : "text-red-600"}>
                    {data.delta > 0 ? "+" : ""}
                    {formatMoney(data.delta)} ₫
                </div>
            </div>
        </div>
    );
};

function formatMoney(v: number) {
    return new Intl.NumberFormat("vi-VN").format(v);
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function payableStatusLabel({ status }: { status: string; }) {
    switch (status) {
        case "pending":
            return "Đang chờ";
        case "overdue":
            return "Quá hạn";
        case "not_enough":
            return "Chưa đủ tiền";
        case "paided":
            return "Đã thanh toán";
        default:
            return status;
    }
}

function transactionStatusLabel({ status }: { status: string; }) {
    switch (status) {
        case "pending":
            return "Chưa ghép mã";
        case "marked":
            return "Đã ghép mã";
        default:
            return status;
    }
}

type ReceiveTableColumnKey = "contract" | "amount" | "paytime" | "lastTime" | "late" | "latePee" | "total" | "status" | "txId" | "txTime" | "txAmount";

function renderColumnCheckbox(
    label: string,
    key: ReceiveTableColumnKey,
    state: Record<ReceiveTableColumnKey, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<ReceiveTableColumnKey, boolean>>>
) {
    return (
        <label className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
            <input
                type="checkbox"
                checked={state[key]}
                onChange={() => setState((current) => ({ ...current, [key]: !current[key] }))}
            />
            <span className="text-slate-700">{label}</span>
        </label>
    );
}

function countVisibleColumns(state: Record<ReceiveTableColumnKey, boolean>) {
    return Object.values(state).filter(Boolean).length;
}
