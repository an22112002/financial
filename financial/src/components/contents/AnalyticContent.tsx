import { Modal } from "antd";
import { useMemo, useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

import MonthPaymentContent from "./MonthPaymentContent";
import ServiceAnalyticContent from "./ServiceAnalyticContent";
import { getCurrentYear } from "../../utils";

import { dataAnalytic } from "../../types/mock";
import type { YearlyData, RawMonthlyData } from "../../types/DataType";

export default function AnalyticContent() {

    const [chooseYear, setChooseYear] = useState<string>(
        getCurrentYear()
    );

    const [listYear, setListYear] = useState<string[]>([]);

    const [yearData, setYearData] =
        useState<YearlyData | null>(null);

    useEffect(() => {

        const setup = async () => {

            const years = ["2026", "2025", "2024"];

            setListYear(years);
        };

        setup();

    }, []);

    useEffect(() => {

        const setup = async () => {

            // API
            const data: YearlyData = dataAnalytic;

            setYearData(data);
        };

        setup();

    }, [chooseYear]);

    return (

        <div className="w-full h-[85vh] bg-[#F0F0F0] overflow-auto flex flex-col items-start justify-start p-4 gap-4">

            <h1 className="text-2xl text-[#1E3A5F] font-bold">
                Phân tích số liệu
            </h1>

            <div className="flex flex-col w-full bg-white rounded-lg shadow p-4">

                <div className="flex flex-row justify-start items-center gap-2 mb-4">

                    <strong>
                        Thống kê năm
                    </strong>

                    <select
                        className="border p-2 ml-4 rounded"
                        value={chooseYear}
                        onChange={(e) =>
                            setChooseYear(e.target.value)
                        }
                    >

                        {
                            listYear.map((year) => (
                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>
                            ))
                        }

                    </select>

                </div>

                <YearlyAnalytic
                    monthlyData={yearData?.months || []}
                />

            </div>

        </div>
    );
}

type YearlyAnalyticProps = {
    monthlyData: RawMonthlyData[];
};

function YearlyAnalytic({
    monthlyData,
}: YearlyAnalyticProps) {

    const [openModalMonth, setOpenModalMonth] =
        useState(false);

    const [selectedMonth, setSelectedMonth] =
        useState<RawMonthlyData | null>(null);

    // chart 1
    const chart1Data = useMemo(() => {

        return monthlyData.map((item) => ({
            month: item.month,

            "Số giao dịch":
                item.totalTransactions,

            "Giao dịch thành công":
                item.successfulTransactions,

            "Giao dịch hủy":
                item.cancelledTransactions,
            
            "Giao dịch chưa hoàn thành":
                item.unpaidTransactions,
            
            "Giao dịch chuyển khoản":
                item.onlineTransactions,
            
            "Giao dịch tiền mặt":
                item.offlineTransactions,
        }));

    }, [monthlyData]);

    // chart 2
    const chart2Data = useMemo(() => {

        return monthlyData.map((item) => ({
            month: item.month,
            "Doanh thu": item.totalRevenue,
            "Chưa thu": item.totalUnpaindRevenue,
        }));

    }, [monthlyData]);

    const handleChartClick = (data: any) => {

        if (!data?.activeLabel) return;

        const month = data.activeLabel;

        const monthData = monthlyData.find(
            (item) => item.month === month
        );

        if (!monthData) return;

        setSelectedMonth(monthData);

        setOpenModalMonth(true);
    };

    const handleChartClick2 = (data: any) => {

        if (!data?.activeLabel) return;
    
        const month = data.activeLabel;
    
        const monthData = monthlyData.find(
            (item) => item.month === month
        );
        if (!monthData) return;
        setSelectedMonth(monthData);
    };

    return (

        <div className="w-full flex flex-col gap-6">

            {/* MODAL */}
            <Modal
                title={`Chi tiết tháng ${selectedMonth?.month || ""}`}
                open={openModalMonth}
                onCancel={() => setOpenModalMonth(false)}
                footer={null}
                width={900}
            >

                {
                    selectedMonth && (
                        <MonthPaymentContent
                            data={selectedMonth}
                        />
                    )
                }

            </Modal>

            {/* CHART 1 */}
            <div className="bg-white rounded-2xl shadow-md p-4">

                <h2 className="text-xl font-semibold mb-4">
                    Thống kê giao dịch
                </h2>
                <div>
                    <table className="w-full border-collapse mt-2">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-blue-100">Tổng số giao dịch</th>
                                <th className="border p-2 bg-green-100">Tổng giao dịch thành công</th>
                                <th className="border p-2 bg-red-100">Tổng giao dịch hủy</th>
                                <th className="border p-2 bg-yellow-100">Tổng giao dịch chưa hoàn thành</th>
                                <th className="border p-2 bg-purple-100">Tổng giao dịch chuyển khoản</th>
                                <th className="border p-2 bg-orange-100">Tổng giao dịch tiền mặt</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-2 text-blue-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)}
                                </td>
                                <td className="border p-2 text-green-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Giao dịch thành công"], 0)} | {((chart1Data.reduce((sum, item) => sum + item["Giao dịch thành công"], 0) / chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)) * 100).toFixed(2)}%
                                </td>
                                <td className="border p-2 text-red-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Giao dịch hủy"], 0)} | {((chart1Data.reduce((sum, item) => sum + item["Giao dịch hủy"], 0) / chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)) * 100).toFixed(2)}%
                                </td>
                                <td className="border p-2 text-yellow-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Giao dịch chưa hoàn thành"], 0)} | {((chart1Data.reduce((sum, item) => sum + item["Giao dịch chưa hoàn thành"], 0) / chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)) * 100).toFixed(2)}%
                                </td>
                                <td className="border p-2 text-purple-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Giao dịch chuyển khoản"], 0)} | {((chart1Data.reduce((sum, item) => sum + item["Giao dịch chuyển khoản"], 0) / chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)) * 100).toFixed(2)}%
                                </td>
                                <td className="border p-2 text-orange-500 font-bold text-center">
                                    {chart1Data.reduce((sum, item) => sum + item["Giao dịch tiền mặt"], 0)} | {((chart1Data.reduce((sum, item) => sum + item["Giao dịch tiền mặt"], 0) / chart1Data.reduce((sum, item) => sum + item["Số giao dịch"], 0)) * 100).toFixed(2)}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="w-full h-[350px]">

                    <ResponsiveContainer>

                        <LineChart
                            data={chart1Data}
                            onClick={handleChartClick}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="month" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="Số giao dịch"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{
                                    r: 6,
                                    cursor: "pointer",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="Giao dịch thành công"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{
                                    r: 6,
                                    cursor: "pointer",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="Giao dịch hủy"
                                stroke="#dc2626"
                                strokeWidth={3}
                                dot={{
                                    r: 6,
                                    cursor: "pointer",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="Giao dịch chưa hoàn thành"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{
                                    r: 6,
                                    cursor: "pointer",
                                }}
                            />


                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

            {/* CHART 2 */}
            <div className="bg-white rounded-2xl shadow-md p-4">

                <h2 className="text-xl font-semibold mb-4">
                    Doanh thu: {chart2Data.reduce(
                        (sum, item) => sum + item["Doanh thu"],
                        0
                    ).toLocaleString()} VND
                </h2>
                <h2 className="text-xl font-semibold mb-4">
                    Chưa thu: {chart2Data.reduce(
                        (sum, item) => sum + item["Chưa thu"],
                        0
                    ).toLocaleString()} VND
                </h2>

                <div className="w-full h-[350px]">

                    <ResponsiveContainer>

                        <LineChart 
                            data={chart2Data}
                            onClick={handleChartClick2}
                            margin={{
                                top: 20,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="month" />

                            <YAxis
                                tickFormatter={(value) =>
                                    `${value / 1000000} Triệu`
                                }
                            />

                            <Tooltip
                                formatter={(value: any) =>
                                    `${Number(
                                        value
                                    ).toLocaleString(
                                        "vi-VN"
                                    )} đ`
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="Doanh thu"
                                stroke="#7c3aed"
                                strokeWidth={4}
                                dot={{ r: 6 }}
                            />

                            <Line
                                type="monotone"
                                dataKey="Chưa thu"
                                stroke="#f59e0b"
                                strokeWidth={4}
                                dot={{ r: 6 }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

            <div>
                <ServiceAnalyticContent month={selectedMonth?.month || ""} />
            </div>

        </div>
    );
}