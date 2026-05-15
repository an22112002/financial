import { useState, useEffect } from "react"
import { getCurrentDate, getCurrentMonth, getFirstDayOfMonth } from "../../utils";

export default function DashboardContent() {
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalPaidTransactions, setTotalPaidTransactions] = useState(0);
    const [totalCancelledTransactions, setTotalCancelledTransactions] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

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
        </div>
    )
}