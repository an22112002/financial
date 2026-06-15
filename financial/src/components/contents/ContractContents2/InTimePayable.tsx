import { useMemo, useState } from "react";
import { contractsCalendar } from "../../../types/mockOri";
import { parseNumber } from "../../../utils";
import {WarningOutlined, InfoCircleOutlined, CalendarOutlined, BellOutlined} from "@ant-design/icons";

type NearPayable = {
    id: string;
    amount: number;
    paytime: string;
    lastTime: string;
    lateFee: number;
}

type NearDuePayable = {
    id: string;
    contractTitle: string;
    partner: string;
    payable: NearPayable[];
};

export default function InTimePayable() {
    const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

    // khởi tạo từ mock contractsCalendar -> lấy các mục type === 'receive'
    const [nearDueReceives, setNearDueReceives] = useState<NearDuePayable[]>(
        contractsCalendar
            .filter(c => c.type === "receive" && c.id_payment === null)
            .map((c, i) => ({
                id: c.id_contract ?? `NDR-${i + 1}`,
                contractTitle: c.title,
                partner: "Đối tác",
                payable: [{ id: c.id_payment ?? `pay-${i + 1}`, amount: c.money, paytime: c.date, lastTime: c.date, lateFee: 0 }]
            }))
    );

    // khởi tạo từ mock contractsCalendar -> lấy các mục type === 'pay'
    const [nearDuePayables, setNearDuePayables] = useState<NearDuePayable[]>(
        contractsCalendar
            .filter(c => c.type === "pay" && c.id_payment === null)
            .map((c, i) => ({
                id: c.id_contract ?? `NDP-${i + 1}`,
                contractTitle: c.title,
                partner: "Nhà cung cấp",
                payable: [{ id: c.id_payment ?? `pay-${i + 1}`, amount: c.money, paytime: c.date, lastTime: c.date, lateFee: 0 }]
            }))
    );

    const [receiveColumnsOpen, setReceiveColumnsOpen] = useState(false);
    const [payableColumnsOpen, setPayableColumnsOpen] = useState(false);

    const [receiveEditId, setReceiveEditId] = useState<string | null>(null);
    const [payableEditId, setPayableEditId] = useState<string | null>(null);

    const [visiblePayableColumns, setVisiblePayableColumns] = useState<Record<TableColumnKey, boolean>>({
        contract: true,
        partner: false,
        amount: false,
        paytime: true,
        lastTime: true,
        status: true,
        lateFee: true,
        total: true,
    });

    const [visibleReceiveColumns, setVisibleReceiveColumns] = useState<Record<TableColumnKey, boolean>>({
        contract: true,
        partner: false,
        amount: false,
        paytime: true,
        lastTime: true,
        status: true,
        lateFee: true,
        total: true,
    });

    const [receiveUpcomingSearch, setReceiveUpcomingSearch] = useState("");
    const [receiveUpcomingFrom, setReceiveUpcomingFrom] = useState("");
    const [receiveUpcomingTo, setReceiveUpcomingTo] = useState(new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split("T")[0]);
    const [receiveUpcomingStatus, setReceiveUpcomingStatus] = useState<"all" | "overdue" | "upcoming">("all");

    const filteredNearReceives = useMemo(() => {
        const q = receiveUpcomingSearch.trim().toLowerCase();

        return nearDueReceives.filter((n) => {
            // status filter
            const anyOverdue = n.payable.some(p => p.lastTime < new Date().toISOString().split("T")[0]);
            if (receiveUpcomingStatus === "overdue" && !anyOverdue) return false;
            if (receiveUpcomingStatus === "upcoming" && anyOverdue) return false;

            // date range filter - check if any payable in range
            if (receiveUpcomingFrom || receiveUpcomingTo) {
                const from = receiveUpcomingFrom || "0000-01-01";
                const to = receiveUpcomingTo || "9999-12-31";
                const inRange = n.payable.some(p => p.paytime >= from && p.paytime <= to);
                if (!inRange) return false;
            }

            if (!q) return true;

            return (
                n.partner.toLowerCase().includes(q) ||
                n.contractTitle.toLowerCase().includes(q) ||
                n.payable.some(p => String(p.amount).includes(q) || p.id.toLowerCase().includes(q))
            );
        });
    }, [nearDueReceives, receiveUpcomingSearch, receiveUpcomingFrom, receiveUpcomingTo, receiveUpcomingStatus]);

    const [payableUpcomingSearch, setPayableUpcomingSearch] = useState("");
    const [payableUpcomingFrom, setPayableUpcomingFrom] = useState("");
    const [payableUpcomingTo, setPayableUpcomingTo] = useState(new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split("T")[0]);
    const [payableUpcomingStatus, setPayableUpcomingStatus] = useState<"all" | "overdue" | "upcoming">("all");

    const filteredNearPayables = useMemo(() => {
        const q = payableUpcomingSearch.trim().toLowerCase();

        return nearDuePayables.filter((n) => {
            // status filter
            const anyOverdue = n.payable.some(p => p.lastTime < new Date().toISOString().split("T")[0]);
            if (payableUpcomingStatus === "overdue" && !anyOverdue) return false;
            if (payableUpcomingStatus === "upcoming" && anyOverdue) return false;

            // date range filter - check if any payable in range
            if (payableUpcomingFrom || payableUpcomingTo) {
                const from = payableUpcomingFrom || "0000-01-01";
                const to = payableUpcomingTo || "9999-12-31";
                const inRange = n.payable.some(p => p.paytime >= from && p.paytime <= to);
                if (!inRange) return false;
            }

            if (!q) return true;

            return (
                n.partner.toLowerCase().includes(q) ||
                n.contractTitle.toLowerCase().includes(q) ||
                n.payable.some(p => String(p.amount).includes(q) || p.id.toLowerCase().includes(q))
            );
        });
    }, [nearDuePayables, payableUpcomingSearch, payableUpcomingFrom, payableUpcomingTo, payableUpcomingStatus]);

    return (
        <>
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-bold">Công nợ thu sắp tới và quá hạn</h2>
                        <input
                            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                            placeholder="Tìm theo tên hợp đồng, đối tác, số tiền..."
                            value={receiveUpcomingSearch}
                            onChange={(e) => setReceiveUpcomingSearch(e.target.value)}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <p>Từ</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveUpcomingFrom}
                                onChange={(e) => setReceiveUpcomingFrom(e.target.value)}
                            />
                            <p>đến</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveUpcomingTo}
                                onChange={(e) => setReceiveUpcomingTo(e.target.value)}
                            />

                            <select
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={receiveUpcomingStatus}
                                onChange={(e) => setReceiveUpcomingStatus(e.target.value as any)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="upcoming">Sắp đến hạn</option>
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
                                        <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {renderColumnCheckbox("Hợp đồng", "contract", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Đối tác", "partner", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Số tiền", "amount", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Ngày bắt đầu thu", "paytime", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Ngày đến hạn", "lastTime", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Trạng thái", "status", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Phí phạt", "lateFee", visibleReceiveColumns, setVisibleReceiveColumns)}
                                            {renderColumnCheckbox("Tổng cộng", "total", visibleReceiveColumns, setVisibleReceiveColumns)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    
                </div>
                <table className="min-w-full table-auto">
                    <thead className="text-left text-bold text-slate-500">
                        <tr>
                            <th className="px-4 py-2">STT</th>
                            {visibleReceiveColumns.contract && <th className="px-4 py-2">Hợp đồng</th>}
                            {visibleReceiveColumns.partner && <th className="px-4 py-2">Đối tác</th>}
                            {visibleReceiveColumns.amount && <th className="px-4 py-2">Số tiền</th>}
                            {visibleReceiveColumns.paytime && <th className="px-4 py-2">Ngày bắt đầu thu</th>}
                            {visibleReceiveColumns.lastTime && <th className="px-4 py-2">Ngày đến hạn</th>}
                            {visibleReceiveColumns.lateFee && <th className="px-4 py-2">Phí phạt</th>}
                            {visibleReceiveColumns.total && <th className="px-4 py-2">Tổng cộng</th>}
                            {visibleReceiveColumns.status && <th className="px-4 py-2">Trạng thái <div><span className="text-red-500"><BellOutlined /> {amountOverdue(filteredNearReceives)}</span></div></th>}
                            <th className="px-4 py-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNearReceives.map((p, idx) => {

                            return p.payable.map((pay, pi) => (
                                <tr key={`${p.id}-${pi}`} className={`border-t ${getDue(pay.paytime, pay.lastTime) === 'overdue' ? 'bg-rose-200' : ''}`}>
                                    {pi === 0 && (
                                        <>
                                            <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{idx + 1}</td>
                                            {visibleReceiveColumns.contract && (
                                                <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{p.contractTitle}</td>
                                            )}
                                            {visibleReceiveColumns.partner && (
                                                <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{p.partner}</td>
                                            )}

                                        </>
                                    )}

                                    {visibleReceiveColumns.amount && (
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(pay.amount)}</td>
                                    )}
                                    {visibleReceiveColumns.paytime && (
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <input
                                                type="date"
                                                className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                value={pay.paytime}
                                                disabled={receiveEditId !== pay.id}
                                                onChange={(e) => {
                                                    setNearDueReceives((prev) => prev.map(n => {
                                                        if (n.id !== p.id) return n;
                                                        return {
                                                            ...n,
                                                            payable: n.payable.map(pb => {
                                                                if (pb.id !== pay.id) return pb;
                                                                return { ...pb, paytime: validBeginPayDate(e.target.value, pb.lastTime) };
                                                            })
                                                        }
                                                    }));
                                                }}
                                            />
                                        </td>
                                    )}
                                    {visibleReceiveColumns.lastTime && (
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <input
                                                type="date"
                                                className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                value={pay.lastTime}
                                                disabled={receiveEditId !== pay.id}
                                                onChange={(e) => {
                                                    setNearDueReceives((prev) => prev.map(n => {
                                                        if (n.id !== p.id) return n;
                                                        return {
                                                            ...n,
                                                            payable: n.payable.map(pb => {
                                                                if (pb.id !== pay.id) return pb;
                                                                return { ...pb, lastTime: validLatePayDate(e.target.value, pb.paytime) };
                                                            })
                                                        }
                                                    }));
                                                }}
                                            />
                                        </td>
                                    )}
                                    {visibleReceiveColumns.lateFee && (
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            <input
                                                type="text"
                                                className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                value={pay.lateFee}
                                                disabled={receiveEditId !== pay.id}
                                                onChange={(e) => {
                                                    setNearDueReceives((prev) => prev.map(n => {
                                                        if (n.id !== p.id) return n;
                                                        return {
                                                            ...n,
                                                            payable: n.payable.map(pb => {
                                                                if (pb.id !== pay.id) return pb;
                                                                return { ...pb, lateFee: parseNumber(e.target.value) };
                                                            })
                                                        }
                                                    }));
                                                }}
                                            />
                                        </td>
                                    )}
                                    {visibleReceiveColumns.total && (
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                            { new Date() < new Date(pay.paytime) ? formatCurrency(pay.amount) : formatCurrency(pay.amount + (pay.lateFee * pay.amount) / 100) }
                                        </td>
                                    )}
                                    {visibleReceiveColumns.status && (
                                        <td className="px-4 py-3 text-sm text-slate-700">{
                                            getDue(pay.paytime, pay.lastTime) === 'overdue' ? 
                                            <span className="text-red-500 font-bold"><WarningOutlined /> Quá hạn</span> : getDue(pay.paytime, pay.lastTime) === 'future' ?
                                            <span className="text-green-500 font-bold"><InfoCircleOutlined /> Sắp đến hạn</span> :
                                            <span className="text-blue-500 font-bold"><CalendarOutlined /> Đang đến hạn</span>
                                        }
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-slate-700 flex items-center gap-2">
                                        {receiveEditId === null && (
                                            <div className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 hover:cursor-pointer" onClick={() => setReceiveEditId(pay.id)}>
                                                Sửa
                                            </div>
                                        )}
                                        {receiveEditId === pay.id && (
                                            <div className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 hover:cursor-pointer"
                                            onClick={() => {
                                                // Lưu logic ở đây
                                                setReceiveEditId(null);
                                            }}
                                            >
                                                Lưu
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-bold">Công nợ trả sắp tới và quá hạn</h2>
                        <input
                            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                            placeholder="Tìm theo tên hợp đồng, đối tác, số tiền..."
                            value={payableUpcomingSearch}
                            onChange={(e) => setPayableUpcomingSearch(e.target.value)}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <p>Từ</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payableUpcomingFrom}
                                onChange={(e) => setPayableUpcomingFrom(e.target.value)}
                            />
                            <p>đến</p>
                            <input
                                type="date"
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payableUpcomingTo}
                                onChange={(e) => setPayableUpcomingTo(e.target.value)}
                            />

                            <select
                                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                                value={payableUpcomingStatus}
                                onChange={(e) => setPayableUpcomingStatus(e.target.value as any)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="upcoming">Sắp đến hạn</option>
                                <option value="overdue">Quá hạn</option>
                            </select>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    onClick={() => setPayableColumnsOpen((value) => !value)}
                                >
                                    Hiển thị cột
                                </button>

                                {payableColumnsOpen && (
                                    <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                        <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng</div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {renderColumnCheckbox("Hợp đồng", "contract", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Đối tác", "partner", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Số tiền", "amount", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Ngày bắt đầu thu", "paytime", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Ngày đến hạn", "lastTime", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Trạng thái", "status", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Phí phạt", "lateFee", visiblePayableColumns, setVisiblePayableColumns)}
                                            {renderColumnCheckbox("Tổng cộng", "total", visiblePayableColumns, setVisiblePayableColumns)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="text-left text-bold text-slate-500">
                            <tr>
                                <th className="px-4 py-2">STT</th>
                                {visiblePayableColumns.contract && <th className="px-4 py-2">Hợp đồng</th>}
                                {visiblePayableColumns.partner && <th className="px-4 py-2">Đối tác</th>}
                                {visiblePayableColumns.amount && <th className="px-4 py-2">Số tiền</th>}
                                {visiblePayableColumns.paytime && <th className="px-4 py-2">Ngày bắt đầu thu</th>}
                                {visiblePayableColumns.lastTime && <th className="px-4 py-2">Ngày đến hạn</th>}
                                {visiblePayableColumns.lateFee && <th className="px-4 py-2">Phí phạt</th>}
                                {visiblePayableColumns.total && <th className="px-4 py-2">Tổng cộng</th>}
                                {visiblePayableColumns.status && <th className="px-4 py-2">Trạng thái <div><span className="text-red-500"><BellOutlined /> {amountOverdue(filteredNearPayables)}</span></div></th>}
                                <th className="px-4 py-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNearPayables.map((p, idx) => {

                                return p.payable.map((pay, pi) => (
                                    <tr key={`${p.id}-${pi}`} className={`border-t ${getDue(pay.paytime, pay.lastTime) === 'overdue' ? 'bg-rose-200' : ''}`}>
                                        {pi === 0 && (
                                            <>
                                                <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{idx + 1}</td>
                                                {visiblePayableColumns.contract && (
                                                    <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{p.contractTitle}</td>
                                                )}
                                                {visiblePayableColumns.partner && (
                                                    <td rowSpan={p.payable.length} className="px-4 py-3 text-sm text-slate-700">{p.partner}</td>
                                                )}
                                            </>
                                        )}

                                        {visiblePayableColumns.amount && (
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(pay.amount)}</td>
                                        )}
                                        {visiblePayableColumns.paytime && (
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                <input
                                                    type="date"
                                                    className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                    value={pay.paytime}
                                                    disabled={payableEditId !== pay.id}
                                                    onChange={(e) => {
                                                        setNearDuePayables((prev) => prev.map(n => {
                                                            if (n.id !== p.id) return n;
                                                            return {
                                                                ...n,
                                                                payable: n.payable.map(pb => {
                                                                    if (pb.id !== pay.id) return pb;
                                                                    return { ...pb, paytime: validBeginPayDate(e.target.value, pb.lastTime) };
                                                                })
                                                            }
                                                        }));
                                                    }}
                                                />
                                            </td>
                                        )}
                                        {visiblePayableColumns.lastTime && (
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                <input
                                                    type="date"
                                                    className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                    value={pay.lastTime}
                                                    disabled={payableEditId !== pay.id}
                                                    onChange={(e) => {
                                                        setNearDuePayables((prev) => prev.map(n => {
                                                            if (n.id !== p.id) return n;
                                                            return {
                                                                ...n,
                                                                payable: n.payable.map(pb => {
                                                                    if (pb.id !== pay.id) return pb;
                                                                    return { ...pb, lastTime: validLatePayDate(e.target.value, pb.paytime) };
                                                                })
                                                            }
                                                        }));
                                                    }}
                                                />
                                            </td>
                                        )}

                                        {visiblePayableColumns.lateFee && (
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                <input
                                                    type="text"
                                                    className="px-4 py-3 text-sm text-slate-700 border border-slate-300 rounded-md"
                                                    value={pay.lateFee}
                                                    disabled={payableEditId !== pay.id}
                                                    onChange={(e) => {
                                                        setNearDuePayables((prev) => prev.map(n => {
                                                            if (n.id !== p.id) return n;
                                                            return {
                                                                ...n,
                                                                payable: n.payable.map(pb => {
                                                                    if (pb.id !== pay.id) return pb;
                                                                    return { ...pb, lateFee: parseNumber(e.target.value) };
                                                                })
                                                            }
                                                        }));
                                                    }}
                                                />
                                            </td>
                                        )}
                                        {visiblePayableColumns.total && (
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                            { new Date() < new Date(pay.paytime) ? formatCurrency(pay.amount) : formatCurrency(pay.amount + (pay.lateFee * pay.amount) / 100) }
                                        </td>
                                        )}
                                        {visiblePayableColumns.status && (
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {getDue(pay.paytime, pay.lastTime) === 'overdue' ? 
                                                <span className="text-red-500 font-bold"><WarningOutlined /> Quá hạn</span> : getDue(pay.paytime, pay.lastTime) === 'future' ?
                                                <span className="text-green-500 font-bold"><InfoCircleOutlined /> Sắp đến hạn</span> :
                                                <span className="text-blue-500 font-bold"><CalendarOutlined /> Đang đến hạn</span>
                                                }
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-sm text-slate-700 flex flex-col items-center justify-center gap-2">
                                            {payableEditId === null && (
                                                <div className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 hover:cursor-pointer" onClick={() => setPayableEditId(pay.id)}>
                                                    Sửa
                                                </div>
                                            )}

                                            {payableEditId === pay.id && (
                                                <div className="bg-blue-500 text-white px-3 py-1 rounded-md mt-2 hover:bg-blue-600 hover:cursor-pointer"
                                                onClick={() => {
                                                    // Lưu logic ở đây
                                                    setPayableEditId(null)
                                                }}
                                                >
                                                    Lưu
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}

type TableColumnKey = "contract" | "partner" | "amount" | "paytime" | "lastTime" | "status" | "lateFee" | "total";

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

function validLatePayDate(paytime: string, lastTime: string) {
    const payDate = new Date(paytime);
    const lastDate = new Date(lastTime);
    if (lastDate < payDate) {
        return paytime;
    }
    return lastTime;
}

function validBeginPayDate(paytime: string, lastTime: string) {
    const payDate = new Date(paytime);
    const lastDate = new Date(lastTime);
    if (payDate > lastDate) {
        return lastTime;
    }
    return paytime;
}

function getDue(paytime: string, lastTime: string) {
    const today = new Date().toISOString().split("T")[0];
    if (lastTime < today) return "overdue";
    if (paytime <= today) return "upcoming";
    return "future";
}

function amountOverdue(payable: NearDuePayable[]) {
    let total = 0;
    payable.forEach(p => {
        p.payable.forEach(pb => {
            if (getDue(pb.paytime, pb.lastTime) === 'overdue') {
                total += 1
            }
        });
    });
    return total;
}