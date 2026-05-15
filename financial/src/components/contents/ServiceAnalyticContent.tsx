import { useMemo } from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { ServiceData } from "../../types/DataType";
import { services } from "../../types/mock";

type Props = {
    month: string
}

export default function ServiceAnalyticContent({ month }: Props) {
    // Lấy danh sách dịch vụ theo tháng đang chọn từ dữ liệu giả lập.
    const serviceData = useMemo<ServiceData[]>(() => {
        return services[month] || [];
    }, [month]);

    // Sắp xếp dịch vụ theo doanh thu để hiển thị bảng xếp hạng doanh thu.
    const revenueRanking = useMemo(() => {
        return [...serviceData].sort((left, right) => right.totalRevenue - left.totalRevenue);
    }, [serviceData]);

    // Sắp xếp dịch vụ theo số bệnh nhân để hiển thị bảng xếp hạng lượt khám.
    const patientRanking = useMemo(() => {
        return [...serviceData].sort((left, right) => right.patientCount - left.patientCount);
    }, [serviceData]);

    // Chuẩn bị dữ liệu cho biểu đồ tròn tỷ trọng doanh thu theo dịch vụ.
    const pieChartData = useMemo(() => {
        return serviceData.map((item) => ({
            name: item.serviceName,
            value: item.totalRevenue,
        }));
    }, [serviceData]);

    // Tính tổng doanh thu để hiển thị KPI nhanh trên đầu màn hình.
    const totalRevenue = useMemo(() => {
        return serviceData.reduce((sum, item) => sum + item.totalRevenue, 0);
    }, [serviceData]);

    // Tính tổng số bệnh nhân để hiển thị KPI nhanh trên đầu màn hình.
    const totalPatients = useMemo(() => {
        return serviceData.reduce((sum, item) => sum + item.patientCount, 0);
    }, [serviceData]);

    // Tính tổng giao dịch để người dùng có thêm một chỉ số tham chiếu.
    const totalTransactions = useMemo(() => {
        return serviceData.reduce((sum, item) => sum + item.totalTransactions, 0);
    }, [serviceData]);

    // Tìm dịch vụ có doanh thu cao nhất để làm nổi bật ở phần tóm tắt.
    const topRevenueService = revenueRanking[0];

    // Màu cố định cho biểu đồ tròn để các lát cắt dễ phân biệt.
    const pieColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0f766e", "#ea580c", "#14b8a6"];

    // Hàm định dạng tiền tệ VND để dùng lại ở nhiều vị trí.
    const formatCurrency = (value: number) => {
        return `${value.toLocaleString()} VND`;
    };

    // Hàm định dạng tooltip phải chấp nhận nhiều kiểu giá trị từ Recharts.
    const formatTooltipCurrency = (value: unknown) => {
        if (typeof value !== "number") {
            return String(value ?? "");
        }

        return formatCurrency(value);
    };

    return (
        <div className="w-full h-[85vh] bg-[#F0F0F0] overflow-auto flex flex-col items-start justify-start p-4 gap-4">
            {/* Tiêu đề màn hình để người dùng biết đây là phần phân tích dịch vụ. */}
            <h1 className="text-2xl text-[#1E3A5F] font-bold">
                Phân tích dịch vụ tháng <strong>{month == "" ? "Chưa chọn tháng" : month}</strong>
            </h1>

            {/* Thẻ tổng quan giúp đọc nhanh trạng thái dữ liệu của tháng đang chọn. */}
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard
                    title="Tổng doanh thu"
                    value={formatCurrency(totalRevenue)}
                    note="Doanh thu cộng gộp tất cả dịch vụ"
                    accentClassName="bg-blue-600"
                />
                <SummaryCard
                    title="Tổng bệnh nhân"
                    value={totalPatients.toLocaleString()}
                    note="Tổng số lượt bệnh nhân trong tháng"
                    accentClassName="bg-emerald-600"
                />
                <SummaryCard
                    title="Tổng giao dịch"
                    value={totalTransactions.toLocaleString()}
                    note="Tổng lượt thanh toán theo dịch vụ"
                    accentClassName="bg-amber-500"
                />
                <SummaryCard
                    title="Dịch vụ đứng đầu"
                    value={topRevenueService?.serviceName || "Chưa có dữ liệu"}
                    note={topRevenueService ? formatCurrency(topRevenueService.totalRevenue) : "Không có dữ liệu để xếp hạng"}
                    accentClassName="bg-violet-600"
                />
            </div>

            {/* Khi chưa có dữ liệu cho tháng đã chọn thì hiển thị khung trống có giải thích rõ ràng. */}
            {serviceData.length === 0 ? (
                <div className="w-full bg-white rounded-2xl shadow p-6 text-center text-slate-600">
                    Không có dữ liệu dịch vụ cho tháng {month}.
                </div>
            ) : (
                <div className="w-full flex flex-col gap-4">
                    {/* Biểu đồ cột giúp so sánh doanh thu giữa các dịch vụ trong cùng một tháng. */}
                    <div className="bg-white rounded-2xl shadow p-4">
                        <div className="flex flex-col gap-1 mb-4">
                            <h2 className="text-xl font-semibold text-[#1E3A5F]">
                                Dịch vụ theo doanh thu
                            </h2>
                            <p className="text-sm text-slate-500">
                                Xếp hạng và so sánh doanh thu giữa các dịch vụ trong tháng {month}.
                            </p>
                        </div>

                        <div className="w-full h-[360px]">
                            <ResponsiveContainer>
                                <BarChart data={revenueRanking} margin={{ top: 10, right: 10, left: 20, bottom: 90 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="serviceName"
                                        interval={0}
                                        angle={-20}
                                        textAnchor="end"
                                        height={90}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `${value / 1000000} Triệu`
                                        }
                                    />
                                    <Tooltip formatter={formatTooltipCurrency} />
                                    <Legend />
                                    <Bar dataKey="totalRevenue" name="Doanh thu" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Hai bảng xếp hạng đặt cạnh nhau để người dùng đọc nhanh theo hai tiêu chí khác nhau. */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <RankingTable
                            title="Top dịch vụ theo doanh thu"
                            description="Sắp xếp giảm dần theo tổng doanh thu của từng dịch vụ."
                            rows={revenueRanking}
                            valueLabel="Doanh thu"
                            valueRenderer={(item) => formatCurrency(item.totalRevenue)}
                        />

                        <RankingTable
                            title="Top dịch vụ theo số bệnh nhân"
                            description="Sắp xếp giảm dần theo số lượng bệnh nhân của từng dịch vụ."
                            rows={patientRanking}
                            valueLabel="Bệnh nhân"
                            valueRenderer={(item) => item.patientCount.toLocaleString()}
                        />
                    </div>

                    {/* Biểu đồ tròn cho thấy tỷ trọng doanh thu của mỗi dịch vụ trong tổng tháng. */}
                    <div className="bg-white rounded-2xl shadow p-4">
                        <div className="flex flex-col gap-1 mb-4">
                            <h2 className="text-xl font-semibold text-[#1E3A5F]">
                                Tỷ trọng doanh thu dịch vụ
                            </h2>
                            <p className="text-sm text-slate-500">
                                Mỗi lát cắt đại diện cho một dịch vụ trong tổng doanh thu của tháng {month}.
                            </p>
                        </div>

                        <div className="w-full h-[450px]">
                            <ResponsiveContainer>
                                <PieChart margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                    <Tooltip formatter={formatTooltipCurrency} />
                                    <Legend />
                                    <Pie
                                        data={pieChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={140}
                                        label={(entry) => `${((entry.value / totalRevenue) * 100).toFixed(1)}%`}
                                    >
                                        {pieChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

type SummaryCardProps = {
    title: string;
    value: string;
    note: string;
    accentClassName: string;
};

// Thẻ KPI tái sử dụng để giữ UI đồng nhất giữa các số liệu tổng quan.
function SummaryCard({ title, value, note, accentClassName }: SummaryCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
            <div className={`h-2 w-16 rounded-full ${accentClassName}`} />
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500">{title}</span>
                <strong className="text-xl text-[#1E3A5F] break-words">{value}</strong>
                <span className="text-xs text-slate-400">{note}</span>
            </div>
        </div>
    );
}

type RankingTableProps = {
    title: string;
    description: string;
    rows: ServiceData[];
    valueLabel: string;
    valueRenderer: (item: ServiceData) => string;
};

// Bảng xếp hạng dùng chung cho hai tiêu chí: doanh thu và số bệnh nhân.
function RankingTable({ title, description, rows, valueLabel, valueRenderer }: RankingTableProps) {
    return (
        <div className="bg-white rounded-2xl shadow p-4 overflow-hidden">
            <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-lg font-semibold text-[#1E3A5F]">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>

            <div className="overflow-auto">
                <table className="w-full border-collapse min-w-[520px]">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="border border-slate-200 p-2 text-left">#</th>
                            <th className="border border-slate-200 p-2 text-left">Tên dịch vụ</th>
                            <th className="border border-slate-200 p-2 text-left">Giá dịch vụ</th>
                            <th className="border border-slate-200 p-2 text-left">{valueLabel}</th>
                            <th className="border border-slate-200 p-2 text-left">Tổng giao dịch</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={`${item.month}-${item.serviceName}`} className="hover:bg-slate-50">
                                <td className="border border-slate-200 p-2 text-center font-semibold text-[#1E3A5F]">{index + 1}</td>
                                <td className="border border-slate-200 p-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-800">{item.serviceName}</span>
                                        <span className="text-xs text-slate-400">Tháng {item.month}</span>
                                    </div>
                                </td>
                                <td className="border border-slate-200 p-2">{item.price.toLocaleString()} VND</td>
                                <td className="border border-slate-200 p-2 font-semibold text-slate-700">{valueRenderer(item)}</td>
                                <td className="border border-slate-200 p-2">{item.totalTransactions.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Nâng cấp màn hình này để có: dịch vụ theo doanh thu, dịch vụ theo số bệnh nhân, và biểu đồ pie doanh thu theo tháng.