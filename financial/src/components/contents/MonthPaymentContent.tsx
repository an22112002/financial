import type { RawMonthlyData } from "../../types/DataType";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LabelList
} from "recharts";


type Props = {
    data: RawMonthlyData;
};

export default function MonthPaymentContent({
    data,
}: Props) {

    const chartData = [
        {
            group: "Trạng thái giao dịch",

            "Thành công":
                data.successfulTransactions,

            "Hủy":
                data.cancelledTransactions,

            "Chưa hoàn thành":
                data.unpaidTransactions,
        },

        {
            group: "Hình thức thanh toán",

            "Chuyển khoản":
                data.onlineTransactions,

            "Tiền mặt":
                data.offlineTransactions,
        },
    ];

    return (

        <div className="w-full h-[350px]">

            <ResponsiveContainer>

                <BarChart 
                    data={chartData}
                    margin={{
                        top: 40,
                        right: 20,
                        left: 0,
                        bottom: 0,
                    }}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="group" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                        dataKey="Thành công"
                        fill="#16a34a"
                        radius={[8, 8, 0, 0]}
                    >
                        <LabelList
                            dataKey="Thành công"
                            position="top"
                            formatter={(value: any) =>
                                `${(
                                    (value / data.totalTransactions) * 100
                                ).toFixed(1)}%`
                            }
                        />
                    </Bar>

                    <Bar
                        dataKey="Hủy"
                        fill="#dc2626"
                        radius={[8, 8, 0, 0]}
                    >
                        <LabelList
                            dataKey="Hủy"
                            position="top"
                            formatter={(value: any) =>
                                `${(
                                    (value / data.totalTransactions) * 100
                                ).toFixed(1)}%`
                            }
                        />
                    </Bar>

                    <Bar
                        dataKey="Chưa hoàn thành"
                        fill="#f59e0b"
                        radius={[8, 8, 0, 0]}
                    >
                        <LabelList
                            dataKey="Chưa hoàn thành"
                            position="top"
                            formatter={(value: any) =>
                                `${(
                                    (value / data.totalTransactions) * 100
                                ).toFixed(1)}%`
                            }
                        />
                    </Bar>

                    <Bar
                        dataKey="Chuyển khoản"
                        fill="#a700d1"
                        radius={[8, 8, 0, 0]}
                    >
                        <LabelList
                            dataKey="Chuyển khoản"
                            position="top"
                            formatter={(value: any) =>
                                `${(
                                    (value / data.totalTransactions) * 100
                                ).toFixed(1)}%`
                            }
                        />
                    </Bar>

                    <Bar
                        dataKey="Tiền mặt"
                        fill="#dc961f"
                        radius={[8, 8, 0, 0]}
                    >
                        <LabelList
                            dataKey="Tiền mặt"
                            position="top"
                            formatter={(value: any) =>
                                `${(
                                    (value / data.totalTransactions) * 100
                                ).toFixed(1)}%`
                            }
                        />
                    </Bar>

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
}