import { useState, useEffect, useMemo } from "react"
import { Badge, Calendar, ConfigProvider, Modal } from "antd";
import viVN from "antd/locale/vi_VN";
import { getCurrentDate, getCurrentMonth, getFirstDayOfMonth } from "../../utils";
import { contractsCalendar as contracts } from "../../types/mockOri";
import type { Calendar_DayInfo, Calendar_MonthInfo } from "../../types/DataType";

export default function DashboardContent() {
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalPaidTransactions, setTotalPaidTransactions] = useState(0);
    const [totalCancelledTransactions, setTotalCancelledTransactions] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const now = new Date();
    const [focusMonth, setFocusMonth] = useState(
        `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
    );
    const [focusDay, setFocusDay] = useState<Calendar_DayInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "linked" | "unlinked">("all");

    useEffect(() => {
        const setup = async () => {
            // Lấy dữ liệu giao dịch từ API
            setTotalTransactions(1250);
            setTotalPaidTransactions(1000);
            setTotalCancelledTransactions(200);
            setTotalRevenue(50000000);
        };

        setup();
    }, []);

    const monthInfo = useMemo<Calendar_MonthInfo>(() => {
        const monthData: Calendar_MonthInfo = {
            month: focusMonth,
            days: []
        };

        const [month, year] = focusMonth.split("/").map(Number);
        const currentMonth = new Date(year, month - 1, 1);
        const prevMonth = new Date(year, month - 2, 1);
        const nextMonth = new Date(year, month, 1);

        contracts.forEach((contract) => {
            const contractDate = new Date(contract.date);
            const contractMonthDate = new Date(
                contractDate.getFullYear(),
                contractDate.getMonth(),
                1
            );

            const isAllowed =
                contractMonthDate.getTime() === currentMonth.getTime() ||
                contractMonthDate.getTime() === prevMonth.getTime() ||
                contractMonthDate.getTime() === nextMonth.getTime();

            if (!isAllowed) return;

            const existingDay = monthData.days.find((day) =>
                day.date.getDate() === contractDate.getDate() &&
                day.date.getMonth() === contractDate.getMonth() &&
                day.date.getFullYear() === contractDate.getFullYear()
            );

            if (existingDay) {
                existingDay.contracts.push({
                    title: contract.title,
                    money: contract.money,
                    type: contract.type,
                    note: contract.note,
                    id_payment: contract.id_payment,
                    id_contract: contract.id_contract
                });
            } else {
                monthData.days.push({
                    date: contractDate,
                    contracts: [{
                        title: contract.title,
                        money: contract.money,
                        type: contract.type,
                        note: contract.note,
                        id_payment: contract.id_payment,
                        id_contract: contract.id_contract
                    }]
                });
            }
        });

        return monthData;
    }, [focusMonth]);

    const filteredFocusContracts = useMemo(() => {
        if (!focusDay) return [];

        const q = searchTerm.trim().toLowerCase();

        return focusDay.contracts.filter((contract) => {
            if (statusFilter === "linked" && contract.id_payment === null) return false;
            if (statusFilter === "unlinked" && contract.id_payment !== null) return false;

            if (!q) return true;

            return (
                contract.title.toLowerCase().includes(q) ||
                contract.note.toLowerCase().includes(q) ||
                contract.id_contract.toLowerCase().includes(q) ||
                String(contract.money).includes(q) ||
                (contract.id_payment ?? "").toLowerCase().includes(q)
            );
        });
    }, [focusDay, searchTerm, statusFilter]);

    return (
        <div className="w-full h-[85vh] bg-[#F0F0F0] overflow-auto flex flex-col items-start justify-start p-4 gap-4">
            <h1 className="text-2xl text-[#1E3A5F] font-bold">Dashboard</h1>
            <div className="flex flex-col">
                <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Giao dịch tháng {getCurrentMonth()}</h2>
                <p className="text-sm text-[#1E3A5F]">Tính từ {getFirstDayOfMonth()} đến {getCurrentDate()}</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-red-500 rounded-xl p-4">
                    <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Tổng số giao dịch</h2>
                    <p className="text-3xl font-bold text-[#FFFFFF]">{totalTransactions.toLocaleString()}</p>
                </div>
                <div className="bg-green-500 rounded-xl p-4">
                    <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Số giao dịch đã thanh toán</h2>
                    <p className="text-3xl font-bold text-[#0000FF]">{totalPaidTransactions.toLocaleString()}</p>
                </div>

                <div className="bg-orange-500 rounded-xl p-4">
                    <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Số giao dịch chưa thanh toán</h2>
                    <p className="text-3xl font-bold text-[#00FFFF]">{totalTransactions - totalPaidTransactions - totalCancelledTransactions}</p>
                </div>
                <div className="bg-yellow-500 rounded-xl p-4">
                    <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Số giao dịch đã hủy</h2>
                    <p className="text-3xl font-bold text-[#FF0000]">{totalCancelledTransactions.toLocaleString()}</p>
                </div>

                <div className="bg-blue-500 col-span-2 rounded-xl p-4">
                    <h2 className="text-lg text-[#1E3A5F] font-semibold mb-2">Tổng tiền trong tháng</h2>
                    <p className="text-3xl font-bold text-[#00FF00]">{totalRevenue.toLocaleString()} VND</p>
                </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h1 className="text-2xl text-[#1E3A5F] font-bold mb-2">Lịch công nợ</h1>
                <p className="text-sm text-slate-500 mb-3">Click vào ngày có badge để xem chi tiết công nợ cần thu/chi.</p>

                <ConfigProvider locale={viVN}>
                    <Calendar
                        mode="month"
                        fullscreen={false}
                        fullCellRender={(date) =>
                            fullCellRender(date.toDate(), monthInfo, setFocusDay)
                        }
                        onPanelChange={(date) => setFocusMonth(date.format("MM/YYYY"))}
                    />
                </ConfigProvider>
            </div>

            <Modal
                open={focusDay !== null}
                onCancel={() => {
                    setFocusDay(null);
                    setSearchTerm("");
                    setStatusFilter("all");
                }}
                footer={null}
                width={980}
                title={`Chi tiết công nợ ngày ${focusDay?.date.getDate()}/${(focusDay?.date.getMonth() || 0) + 1}/${focusDay?.date.getFullYear()}`}
            >
                <div className="mb-3 grid gap-2 md:grid-cols-3">
                    <input
                        type="text"
                        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                        placeholder="Tìm theo tên, mã, số tiền..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "linked" | "unlinked")}
                    >
                        <option value="all">Tất cả</option>
                        <option value="linked">Đã ghép mã</option>
                        <option value="unlinked">Chưa ghép mã</option>
                    </select>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Hợp đồng</th>
                            <th className="border px-2 py-1">Số tiền</th>
                            <th className="border px-2 py-1">Loại</th>
                            <th className="border px-2 py-1">Ghi chú</th>
                            <th className="border px-2 py-1">Mã giao dịch</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFocusContracts.length > 0 ? (
                            filteredFocusContracts.map((contract, index) => (
                                <tr key={index}>
                                    <td className="border px-2 py-1">{contract.title}</td>
                                    <td className="border px-2 py-1">{contract.money.toLocaleString()} VND</td>
                                    <td className="border px-2 py-1">{contract.type === "receive" ? "Thu" : "Chi"}</td>
                                    <td className="border px-2 py-1">{contract.note}</td>
                                    <td className="border px-2 py-1">{contract.id_payment ?? "Chưa ghép"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="border px-2 py-4 text-center text-slate-500" colSpan={5}>Không có dữ liệu phù hợp.</td>
                            </tr>
                        )}
                        {filteredFocusContracts.length > 0 && (
                            <tr>
                                <td className="border px-2 py-1 font-bold">Tổng</td>
                                <td className="border px-2 py-1 font-bold">
                                    {filteredFocusContracts.reduce((sum, contract) =>
                                        contract.type === "receive" ? sum + contract.money : sum - contract.money
                                    , 0).toLocaleString()} VND
                                </td>
                                <td className="border px-2 py-1" colSpan={3}></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Modal>
        </div>
    )
}

function fullCellRender(date: Date, info: Calendar_MonthInfo | null, setFocusDay: (day: Calendar_DayInfo) => void) {
    const day = info?.days.find(d =>
        d.date.getDate() === date.getDate() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getFullYear() === date.getFullYear()
    );

    const calculateSummary = (dayInfo: Calendar_DayInfo | undefined) => {
        let sum = 0;
        let linked = 0;

        dayInfo?.contracts.forEach(contract => {
            if (contract.id_payment !== null) linked += 1;
            if (contract.type === "receive") sum += contract.money;
            if (contract.type === "pay") sum -= contract.money;
        });

        return { sum, linked };
    };

    const { sum, linked } = calculateSummary(day);

    if (!day) {
        return (
            <div className="h-full p-1">
                <div className="text-[1.1rem]">{date.getDate()}</div>
            </div>
        );
    }

    return (
        <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 p-1" onClick={() => setFocusDay(day)}>
            <Badge
                count={`${linked}/${day.contracts.length}`}
                offset={[0, -5]}
                color={
                    linked === day.contracts.length
                        ? "#22c55e"
                        : new Date(day.date).getTime() < new Date().getTime()
                            ? "#ef4444"
                            : "#eab308"
                }
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                    {date.getDate()}
                </div>
            </Badge>

            {sum > 0 && (
                <div className="rounded bg-green-200 px-1 text-xs text-green-800">+{sum.toLocaleString()} VND</div>
            )}
            {sum < 0 && (
                <div className="rounded bg-red-200 px-1 text-xs text-red-800">{sum.toLocaleString()} VND</div>
            )}
        </div>
    );
}