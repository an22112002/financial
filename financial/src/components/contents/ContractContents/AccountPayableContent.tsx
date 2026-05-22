import { Calendar, Badge, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { useState, useEffect } from "react";
import type { Calendar_MonthInfo, Calendar_DayInfo } from "../../../types/DataType";
import type { ContractData } from "../../../types/DataType";

import { contracts } from "../../../types/mock";
import { Modal } from "antd";

export default function AccountPayableContent() {
    const now = new Date();

    const [focusMonth, setFocusMonth] = useState(
        `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
    );
    const [focusDay, setFocusDay] = useState<Calendar_DayInfo | null>(null);
    const [monthInfo, setMonthInfo] = useState<Calendar_MonthInfo | null>(null);
    
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

            contracts.forEach((contract: ContractData) => {

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
                        note: contract.note
                    });

                } else {

                    monthInfo.days.push({
                        date: contractDate,
                        contracts: [
                            {
                                title: contract.title,
                                money: contract.money,
                                type: contract.type,
                                note: contract.note
                            }
                        ]
                    });
                }
            });

            setMonthInfo(monthInfo);
        };

        fetchData();

    }, [focusMonth]);

    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-row justify-center"><strong className="text-[1.5rem]">Lịch công nợ</strong></div>
            {/* Modal hiển thị chi tiết công nợ ngày được chọn */}
            <Modal
                open={focusDay !== null}
                onCancel={() => setFocusDay(null)}
                footer={null}
                title={`Chi tiết công nợ ngày ${focusDay?.date.getDate()}/${focusDay?.date.getMonth() || 0 + 1}/${focusDay?.date.getFullYear()}`}
            >
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Tiêu đề</th>
                            <th className="border px-2 py-1">Số tiền</th>
                            <th className="border px-2 py-1">Loại</th>
                            <th className="border px-2 py-1">Ghi chú</th>
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
        dayInfo?.contracts.forEach(contract => {
            
            if (contract.type === "receive") {
                sum += contract.money;
            } else if (contract.type === "pay") {
                sum -= contract.money;
            }
        });
        return sum;
    };

    const sum = caculateSum(day);

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
                    count={day.contracts.length}
                    offset={[0, 10]}
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
