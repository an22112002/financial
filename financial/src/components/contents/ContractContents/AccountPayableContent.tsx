import { Calendar, Badge, ConfigProvider } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import viVN from "antd/locale/vi_VN";
import { useState, useEffect, useMemo, useRef } from "react";
import type { Calendar_MonthInfo, Calendar_DayInfo } from "../../../types/DataType";
import type { ContractCalendarData, MoneyFlowData } from "../../../types/DataType";

import { contracts } from "../../../types/mock";
import { moneyFlows } from "../../../types/mock";
import { Modal } from "antd";


import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import ContractInteractContent from "./ContractInteractContent";
import { copyToClipboard } from "../../../utils";

export default function AccountPayableContent() {
    const now = new Date();

    const [focusMonth, setFocusMonth] = useState(
        `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
    );
    const [focusDay, setFocusDay] = useState<Calendar_DayInfo | null>(null);
    const [monthInfo, setMonthInfo] = useState<Calendar_MonthInfo | null>(null);

    const [totalCurrency, setTotalCurrency] = useState(0);
    const [focusContract, setFocusContract] = useState<string | null>(null);
    const [focusPayment, setFocusPayment] = useState<MoneyFlowData | null>(null);
    // money flow filters and pagination
    const [mfFrom, setMfFrom] = useState<string>("");
    const [mfTo, setMfTo] = useState<string>("");
    const [mfTransactionCode, setMfTransactionCode] = useState<string>("");
    const [mfAccount, setMfAccount] = useState<string>("");
    const [mfType, setMfType] = useState<"all" | "receive" | "pay">("all");
    const [mfLimit, setMfLimit] = useState<10 | 20 | 50>(10);
    const [mfPage, setMfPage] = useState(1);

    const [connectContractCode, setConnectContractCode] = useState<string | null>(null);
    const [openWarningPanel, setOpenWarningPanel] = useState(false);
    
    useEffect(() => {

        const fetchData = async () => {

            const monthInfo: Calendar_MonthInfo = {
                month: focusMonth,
                days: []
            };

            // focus month
            const [month, year] = focusMonth.split("/").map(Number);

            const currentMonth = new Date(year, month - 1, 1);

            const prevMonth = new Date(year, month - 2, 1);

            const nextMonth = new Date(year, month, 1);

            contracts.forEach((contract: ContractCalendarData) => {

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

                const existedDay = monthInfo.days.find(day =>
                    day.date.getDate() === contractDate.getDate() &&
                    day.date.getMonth() === contractDate.getMonth() &&
                    day.date.getFullYear() === contractDate.getFullYear()
                );

                if (existedDay) {

                    existedDay.contracts.push({
                        title: contract.title,
                        money: contract.money,
                        type: contract.type,
                        note: contract.note,
                        id_payment: contract.id_payment,
                        id_contract: contract.id_contract
                    });

                } else {

                    monthInfo.days.push({
                        date: contractDate,
                        contracts: [
                            {
                                title: contract.title,
                                money: contract.money,
                                type: contract.type,
                                note: contract.note,
                                id_payment: contract.id_payment,
                                id_contract: contract.id_contract
                            }
                        ]
                    });
                }
            });

            setMonthInfo(monthInfo);
        };

        fetchData();

    }, [focusMonth]);

    useEffect(() => {
        const fetchTotalCurrency = async () => {
            const total = 350000000;
            setTotalCurrency(total);
        };

        fetchTotalCurrency();
    }, []);

    const filteredMoneyFlows = useMemo(() => {
        return moneyFlows.filter((flow) => {
            const dateOnly = flow.date.split(" ")[0];
            if (mfFrom && dateOnly < mfFrom) return false;
            if (mfTo && dateOnly > mfTo) return false;
            if (mfAccount && !flow.account.toLowerCase().includes(mfAccount.toLowerCase())) return false;
            if (mfType !== "all" && flow.type !== mfType) return false;
            if (mfTransactionCode && flow.id_payment !== mfTransactionCode) return false;
            return true;
        });
    }, [mfFrom, mfTo, mfAccount, mfType, mfTransactionCode]);

    const warningData = useMemo(() => {
        const today = new Date();
        const todayKey = today.toISOString().split("T")[0];

        const overdueUnlinkedContracts = contracts.filter((contract) => {
            const dateKey = contract.date.split(" ")[0];
            return contract.id_payment === null && dateKey < todayKey;
        });

        return {
            overdueUnlinkedContracts,
            totalWarnings:
                overdueUnlinkedContracts.length
        };
    }, []);

    const targetRef = useRef<HTMLDivElement>(null);

    const scrollToTarget = () => {
        targetRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <div className="flex flex-col gap-4 p-2 relative">
            <div className="fixed right-5 top-10 z-50">
                <Badge count={warningData.totalWarnings} size="small" offset={[-2, 2]}>
                    <button
                        className="rounded-full shadow-xl px-4 py-3 bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all duration-200 border border-rose-400"
                        onClick={() => setOpenWarningPanel(true)}
                    >
                        Cảnh báo công nợ
                    </button>
                </Badge>
            </div>

            <Modal
                open={openWarningPanel}
                onCancel={() => setOpenWarningPanel(false)}
                footer={null}
                width={920}
                title={`Cảnh báo công nợ(${warningData.totalWarnings})`}
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <div className="font-semibold text-amber-800 mb-2">Quá hạn nhưng chưa ghép mã</div>
                        {warningData.overdueUnlinkedContracts.length > 0 ? (
                            <div className="space-y-2">
                                {warningData.overdueUnlinkedContracts.map((contract) => (
                                    <div key={`${contract.id_contract}-${contract.date}-${contract.note}`} className="flex items-start justify-between gap-4 rounded bg-white p-3 border border-amber-100">
                                        <div>
                                            <div className="font-medium text-gray-800">{contract.title}</div>
                                            <div className="text-sm text-gray-500">{contract.date} · {contract.note}</div>
                                        </div>
                                        <div className="text-sm font-semibold text-red-600">{contract.id_contract}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Không có công nợ quá hạn chưa ghép mã.</div>
                        )}
                    </div>
                </div>
            </Modal>

            <div className="flex md:flex-row flex-col p-2 gap-2">
                <div className="flex flex-col gap-4 md:w-[50%] w-full bg-blue-200 p-4 rounded">
                    <div className="flex flex-row justify-center"><strong className="text-[1.5rem]">Công nợ</strong></div>
                    {/* Modal hiển thị chi tiết công nợ ngày được chọn */}
                    <Modal
                        open={focusDay !== null}
                        onCancel={() => setFocusDay(null)}
                        footer={null}
                        width={1000}
                        title={`Chi tiết công nợ ngày ${focusDay?.date.getDate()}/${focusDay?.date.getMonth() || 0 + 1}/${focusDay?.date.getFullYear()}`}
                    >
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-1">Tiêu đề</th>
                                    <th className="border px-2 py-1">Số tiền</th>
                                    <th className="border px-2 py-1">Loại</th>
                                    <th className="border px-2 py-1">Ghi chú</th>
                                    <th className="border px-2 py-1">Hành động</th>
                                    {focusDay?.contracts.some(contract => contract.id_payment !== null) && (
                                        <th className="border px-2 py-1">Mã giao dịch</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {focusDay?.contracts.map((contract, index) => (
                                    <tr key={index}>
                                        <td className="border px-2 py-1">{contract.title}</td>
                                        {contract.type === "receive" ? (
                                            <td className="border px-2 py-1 text-green-600">
                                                +{contract.money.toLocaleString()} VND
                                            </td>
                                        ) : (
                                            <td className="border px-2 py-1 text-red-600">
                                                -{contract.money.toLocaleString()} VND
                                            </td>
                                        )}
                                        <td className="border px-2 py-1">{contract.type === "receive" ? "Thu" : "Chi"}</td>
                                        <td className="border px-2 py-1">{contract.note}</td>
                                        <td className="border px-2 py-1">
                                            <button
                                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                                onClick={() => {setFocusContract(contract.id_contract);setFocusDay(null);scrollToTarget();}}
                                            >
                                                Xem hợp đồng
                                            </button>
                                            {contract.id_payment === null && (
                                                <button
                                                    className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                                    onClick={() => {setConnectContractCode("");}}
                                                >
                                                    Ghép mã giao dịch
                                                </button>
                                            )}
                                        </td>
                                        {contract.id_payment !== null ? (
                                            <div className="border px-2 py-1 flex items-center gap-1">
                                                <td className="border px-2 py-1">{contract.id_payment}</td>
                                                <CopyOutlined onClick={() => copyToClipboard(contract.id_payment || "")} />
                                            </div>
                                        ) : null}
                                    </tr>
                                ))}
                                <tr>
                                    <td className="border px-2 py-1 font-bold">Tổng</td>
                                    <td className="border px-2 py-1 font-bold">
                                        {focusDay?.contracts.reduce((sum, contract) => {
                                            if (contract.type === "receive") {
                                                return sum + contract.money;
                                            } else if (contract.type === "pay") {
                                                return sum - contract.money;
                                            } else {
                                                return sum;
                                            }
                                        }, 0).toLocaleString() + " VND"}
                                    </td>
                                    <td className="border px-2 py-1"></td>
                                </tr>
                            </tbody>
                        </table>
                    </Modal>

                    <Modal
                        open={connectContractCode !== null}
                        onCancel={() => setConnectContractCode(null)}
                        title={`Ghép mã giao dịch`}
                        footer={null}
                    >
                        <input
                            type="text"
                            className="border p-2 w-full"
                            placeholder="Nhập mã giao dịch"
                            value={connectContractCode || ""}
                            onChange={(e) => setConnectContractCode(e.target.value)}
                        />
                        <button
                            className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                            onClick={() => {
                                // Handle contract code connection logic here
                            }}
                        >
                            Ghép mã giao dịch
                        </button>
                    </Modal>

                    <div className="text-lg font-bold">Lịch công nợ</div>
                    <ConfigProvider locale={viVN}>
                        <Calendar 
                            mode="month"
                            className="text-[1.2rem]"
                            fullscreen={false}
                            fullCellRender={(date) =>
                                fullCellRender(date.toDate(), monthInfo, setFocusDay)
                            }
                            onPanelChange={(date) => setFocusMonth(date.format("MM/YYYY"))}
                        />
                    </ConfigProvider>

                    <div className="flex flex-row gap-2"><span className="font-bold">Tổng số tiền hiện tại:</span> <strong className="text-green-500 text-font">{totalCurrency.toLocaleString()} VND</strong></div>
                    <BalancePredictionChart totalCurrency={totalCurrency} contracts={contracts || []} />
                </div>

                <div className="flex flex-col gap-4 md:w-[50%] w-full bg-blue-200 p-4 rounded">
                    <div className="flex flex-row justify-center"><strong className="text-[1.5rem]">Dòng tiền</strong></div>
                        <div className="text-lg font-bold">Tài khoản ngân hàng</div>
                        <div className="flex flex-col gap-4 bg-white p-4 rounded">
                            
                        <table className="w-full text-left bg-white rounded">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-1 bg-green-200">Ngân hàng</th>
                                    <th className="border px-2 py-1 bg-green-200">Tên tài khoản</th>
                                    <th className="border px-2 py-1 bg-green-200">Số tài khoản</th>
                                    <th className="border px-2 py-1 bg-green-200">Số dư</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border px-2 py-1">MB Bank</td>
                                    <td className="border px-2 py-1">Ngân hàng MB Bank</td>
                                    <td className="border px-2 py-1">0123456789</td>
                                    <td className="border px-2 py-1 text-green-600 font-bold">100,000,000 VND</td>
                                </tr>
                                <tr>
                                    <td className="border px-2 py-1">BIDV</td>
                                    <td className="border px-2 py-1">Công ty NIAD</td>
                                    <td className="border px-2 py-1">9876543210</td>
                                    <td className="border px-2 py-1 text-green-600 font-bold">250,000,000 VND</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="border px-2 py-1 bg-yellow-200 font-bold text-center" colSpan={3}>Tổng</td>
                                    <td className="border px-2 py-1 bg-yellow-200 font-bold text-green-600">{totalCurrency.toLocaleString()} VND</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                        
                    {/* Bảng tiền vào tiền ra */}
                    <div className="text-lg font-bold">Dòng tiền vào/ra</div>
                    <div className="flex items-center justify-between">
                        
                        <div className="grid grid-cols-3 gap-2 items-left">
                            <div className="flex flex-col items-left gap-2">
                                <span className="text-sm text-gray-500">Lọc theo:</span>
                                <select className="border p-1" value={mfType} onChange={(e) => { setMfType(e.target.value as "all" | "receive" | "pay"); setMfPage(1); }}>
                                    <option value="all">Tất cả</option>
                                    <option value="receive">Thu</option>
                                    <option value="pay">Chi</option>
                                </select>
                            </div>
                            <div className="flex flex-col items-left gap-2">
                                <span className="text-sm text-gray-500">Tài khoản</span>
                                <select className="border p-1" value={mfAccount} onChange={(e) => { setMfAccount(e.target.value); setMfPage(1); }}>
                                    <option value="">Tất cả</option>
                                    <option value="Ngân hàng MB Bank">Ngân hàng MB Bank</option>
                                    <option value="Công ty NIAD">Công ty NIAD</option>
                                </select>
                            </div>
                            <div className="flex flex-col items-left gap-2">
                                <span className="text-sm text-gray-500">Mã giao dịch</span>
                                <input type="text" className="border p-1" placeholder="Mã giao dịch" value={mfTransactionCode} onChange={(e) => { setMfTransactionCode(e.target.value); setMfPage(1); }} />
                            </div>
                            <div className="flex flex-col items-left gap-2">
                                <span className="text-sm text-gray-500">Từ</span>
                                <input type="date" className="border p-1" value={mfFrom} onChange={(e) => { setMfFrom(e.target.value); setMfPage(1); }} />
                            </div>
                            <div className="flex flex-col items-left gap-2">
                                <span className="text-sm text-gray-500">đến</span>
                                <input type="date" className="border p-1" value={mfTo} onChange={(e) => { setMfTo(e.target.value); setMfPage(1); }} />
                            </div>
                        </div>
                    </div>
                    <Modal
                        open={focusPayment !== null}
                        onCancel={() => {setFocusPayment(null)}}
                        footer={null}
                        width={800}
                        title={`Chi tiết giao dịch`}
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <div>Thời gian: <strong>{focusPayment?.date}</strong></div>
                            <div>Tài khoản chính: <strong>{focusPayment?.account}</strong></div>
                            <div>Đối ứng: <strong>{focusPayment?.exchange}</strong></div>
                            <div>Số tiền: <strong className={focusPayment?.type === "receive" ? "text-green-600" : "text-red-600"}>{focusPayment?.type === "receive" ? "+ " : "- "}{focusPayment?.amount.toLocaleString()} VND</strong></div>
                            <div className="col-span-2">Mã giao dịch: <strong>{focusPayment?.id_payment}</strong></div>
                            <div className="col-span-2">Nội dung chuyển khoản: <strong>{focusPayment?.description}</strong></div>
                            <div className="col-span-2 gap-2 flex flex-row justify-start">
                                <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded" onClick={() => {scrollToTarget();}}>
                                    Tìm hợp đồng liên quan
                                </button>
                                <button className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded" onClick={() => {copyToClipboard(focusPayment?.id_payment || '');}}>
                                    Copy mã giao dịch
                                </button>
                            </div>
                        </div>    
                    </Modal>
                    <table className="w-full text-left bg-white rounded">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1 bg-green-200">Thời gian</th>
                                <th className="border px-2 py-1 bg-green-200">Tài khoản</th>
                                <th className="border px-2 py-1 bg-green-200">Số tiền</th>
                                <th className="border px-2 py-1 bg-green-200">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(filteredMoneyFlows.length / mfLimit));
                                const currentPage = Math.min(mfPage, totalPages);
                                const pageRows = filteredMoneyFlows.slice((currentPage - 1) * mfLimit, currentPage * mfLimit);

                                return (
                                    <>
                                        {pageRows.map((flow, index) => (
                                            <tr key={index}>
                                                <td className="border px-2 py-1">{flow.date}</td>
                                                <td className="border px-2 py-1">{flow.account}</td>
                                                <td className={"border px-2 py-1 text-right font-bold " + (flow.type === "receive" ? "text-green-600" : "text-red-600")}>{flow.type === "receive" ? "+ " : "- "}{flow.amount.toLocaleString()} VND</td>
                                                <td className="border px-2 py-1">
                                                    <button
                                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                                        onClick={() => {setFocusPayment(flow)}}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {pageRows.length === 0 && (
                                            <tr>
                                                <td className="border p-4 text-center text-gray-500" colSpan={4}>Không có dữ liệu</td>
                                            </tr>
                                        )}

                                        <tr>
                                            <td colSpan={4} className="p-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button className="btn" onClick={() => setMfPage((p) => Math.max(1, p - 1))} disabled={mfPage <= 1}>Prev</button>
                                                        <span className="text-sm">{currentPage}/{totalPages}</span>
                                                        <button className="btn" onClick={() => setMfPage((p) => Math.min(totalPages, p + 1))} disabled={mfPage >= totalPages}>Next</button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">Hiển thị</span>
                                                        <select className="border p-1" value={mfLimit} onChange={(e) => { setMfLimit(Number(e.target.value) as 10 | 20 | 50); setMfPage(1); }}>
                                                            <option value={10}>10</option>
                                                            <option value={20}>20</option>
                                                            <option value={50}>50</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div ref={targetRef} className="flex flex-row justify-center"><strong className="text-[1.5rem]">Công nợ hợp đồng</strong></div>
                    <ContractInteractContent contract_id={focusContract} />
            </div>

            <div className="flex flex-col gap-4 w-full bg-blue-200 p-4 rounded">
                
            </div>
        </div>
    );
}

function fullCellRender(date: Date, info: Calendar_MonthInfo | null, setFocusDay: (day: Calendar_DayInfo) => void) {

    const day = info?.days.find(d =>
        d.date.getDate() === date.getDate() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getFullYear() === date.getFullYear()
    );

    const caculateSum = (dayInfo: Calendar_DayInfo | undefined) => {
        let sum = 0;
        let payable_done = 0;
        dayInfo?.contracts.forEach(contract => {
            if (contract.id_payment !== null) {
                payable_done += 1;
            }
            if (contract.type === "receive") {
                sum += contract.money;
            } else if (contract.type === "pay") {
                sum -= contract.money;
            }
        });
        return { sum, payable_done };
    };

    const { sum, payable_done } = caculateSum(day);

    if (!day) {
        return (
            <div className="h-full p-1">
                <div className="text-[1.3rem]">
                    {date.getDate()}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center h-full p-1 gap-1 cursor-pointer"
                onClick={() => setFocusDay(day)}
            >
                <Badge
                    count={`${payable_done}/${day.contracts.length}`}
                    offset={[0, -5]}
                    color={
                        payable_done === day.contracts.length
                            ? "#22c55e"
                            : new Date(day.date).getTime() < new Date().getTime() ? "#ef4444" : "#eab308"
                    }
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        {date.getDate()}
                    </div>
                </Badge>
                {sum > 0 && (
                    <div className="text-sm bg-green-200 text-green-800 px-1 rounded">
                        +{sum.toLocaleString()} VND
                    </div>
                )}
                {sum < 0 && (
                    <div className="text-sm bg-red-200 text-red-800 px-1 rounded">
                        {sum.toLocaleString()} VND
                    </div>
                )}
            </div>
        </>
    );
}

function BalancePredictionChart({ totalCurrency = 0, contracts = [] }: { totalCurrency?: number; contracts?: ContractCalendarData[]}) {
    
    type PredDay = { date: string; balance: number; delta: number; receiveItems: ContractCalendarData[]; payItems: ContractCalendarData[] };

    const [predictionDaysCount, setPredictionDaysCount] = useState(30);

    const prediction = useMemo(() => {
        const now = new Date();
        const daysCount = predictionDaysCount;
        const days: PredDay[] = [];
        let balance = totalCurrency;

        for (let i = 0; i < daysCount; i++) {
            const d = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + i
            );

            const receiveItems: ContractCalendarData[] = [];
            const payItems: ContractCalendarData[] = [];

            let delta = 0;

            contracts.forEach((c) => {
                const cd = new Date(c.date);

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

            days.push({
                date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-lg font-semibold">
                        Dự đoán số dư trong <input 
                            type="number" 
                            min={1}
                            max={365}
                            value={predictionDaysCount} 
                            onChange={(e) => setPredictionDaysCount(parseInt(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1"
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

            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={prediction}
                        onClick={(data) => console.log(data)}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 10,
                            bottom: 0
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="colorBalance"
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
        <div className="pointer-events-none bg-white border shadow-xl rounded-2xl p-4">
            <div className="font-bold text-gray-800 mb-3">
                Ngày {label}
            </div>

            {/* số dư */}
            <div className="mb-4">
                <div className="text-xs text-gray-500">
                    Số dư dự đoán
                </div>

                <div className="text-lg font-bold text-blue-600">
                    {formatMoney(data.balance)} ₫
                </div>
            </div>

            {/* tiền vào */}
            {data.receiveItems?.length > 0 && (
                <div className="mb-4">
                    <div className="font-semibold text-green-600 mb-2">
                        Tiền vào
                    </div>

                    <div className="space-y-1">
                        {data.receiveItems.map(
                            (
                                item: ContractCalendarData,
                                idx: number
                            ) => (
                                <div
                                    key={idx}
                                    className="flex justify-between gap-4"
                                >
                                    <div className="truncate text-gray-700">
                                        {item.title}
                                    </div>

                                    <div className="font-medium text-green-600 whitespace-nowrap">
                                        +
                                        {formatMoney(
                                            item.money
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* tiền ra */}
            {data.payItems?.length > 0 && (
                <div className="mb-4">
                    <div className="font-semibold text-red-600 mb-2">
                        Tiền ra
                    </div>

                    <div className="space-y-1">
                        {data.payItems.map(
                            (
                                item: ContractCalendarData,
                                idx: number
                            ) => (
                                <div
                                    key={idx}
                                    className="flex justify-between gap-4"
                                >
                                    <div className="truncate text-gray-700">
                                        {item.title}
                                    </div>

                                    <div className="font-medium text-red-600 whitespace-nowrap">
                                        -
                                        {formatMoney(
                                            item.money
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* tổng biến động */}
            <div className="border-t pt-3 flex justify-between font-semibold">
                <div>Biến động</div>

                <div
                    className={
                        data.delta >= 0
                            ? "text-green-600"
                            : "text-red-600"
                    }
                >
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
