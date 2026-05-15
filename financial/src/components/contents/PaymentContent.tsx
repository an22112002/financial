import { FilterOutlined, ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import type { PhuongThucThanhToan, TrangThaiThanhToan, PaymentData } from "../../types/DataType";

import { useState, useEffect } from "react";

export default function PaymentContent() {
    const [limit, setLimit] = useState<10 | 20 | 50>(10);

    const [phuongThuc, setPhuongThuc] = useState<PhuongThucThanhToan | "Tất cả">("Tất cả");
    const [trangThai, setTrangThai] = useState<TrangThaiThanhToan | "Tất cả">("Tất cả");
    const [tuNgay, setTuNgay] = useState<string>("");
    const [denNgay, setDenNgay] = useState<string>("");
    const [soHoaDon, setSoHoaDon] = useState<string>("");
    const [tenBenhNhan, setTenBenhNhan] = useState<string>("");
    const [soDienThoai, setSoDienThoai] = useState<string>("");

    const [paymentData, setPaymentData] = useState<PaymentData[]>([]);

    const mockPaymentData: PaymentData[] = [
        {
            maHD: "HD001",
            benhNhan: "Nguyễn Văn A",
            soDienThoai: "0123456789",
            soTien: 1000000,
            phuongThuc: "Chuyển khoản",
            trangThai: "Đã thanh toán",
            ngayThanhToan: "10:00 2023-10-01"
        },
        {
            maHD: "HD002",
            benhNhan: "Trần Thị B",
            soDienThoai: "0987654321",
            soTien: 500000,
            phuongThuc: "Tiền mặt",
            trangThai: "Chưa thanh toán",
            ngayThanhToan: "14:30 2023-10-05"
        },
        {
            maHD: "HD003",
            benhNhan: "Lê Văn C",
            soDienThoai: "0912345678",
            soTien: 750000,
            phuongThuc: "Chuyển khoản",
            trangThai: "Hủy thanh toán",
            ngayThanhToan: "20:00 2023-10-10"
        }
    ];

    const handleFilter = async () => { 
        // Gọi API để lấy dữ liệu đã lọc
        
        // setPaymentData(kết quả trả về từ API);

        // Sử dụng dữ liệu giả để hiển thị tạm thời
        const filteredData = mockPaymentData.filter((payment) => {
            const matchPhuongThuc = phuongThuc === "Tất cả" || payment.phuongThuc === phuongThuc;
            const matchTrangThai = trangThai === "Tất cả" || payment.trangThai === trangThai;
            const matchTuNgay = !tuNgay || new Date(payment.ngayThanhToan) >= new Date(tuNgay);
            const matchDenNgay = !denNgay || new Date(payment.ngayThanhToan) <= new Date(denNgay);
            const matchSoHoaDon = !soHoaDon || payment.maHD.includes(soHoaDon);
            const matchTenBenhNhan = !tenBenhNhan || payment.benhNhan.toLowerCase().includes(tenBenhNhan.toLowerCase());
            const matchSoDienThoai = !soDienThoai || payment.soDienThoai?.includes(soDienThoai);
            return matchPhuongThuc && matchTrangThai && matchTuNgay && matchDenNgay && matchSoHoaDon && matchTenBenhNhan && matchSoDienThoai;
        });
        setPaymentData(filteredData);
    }

    const handleReset = () => {
        setPhuongThuc("Tất cả");
        setTrangThai("Tất cả");
        setTuNgay("");
        setDenNgay("");
        setSoHoaDon("");
        setTenBenhNhan("");
        setSoDienThoai("");
    }

    useEffect(() => {
        const fetchPaymentData = async () => {
            setPaymentData(mockPaymentData);
        }
        fetchPaymentData();
    }, []);

    useEffect(() => {
        const fetchFilterData = async () => {
            await handleFilter();
        }
        fetchFilterData();
    }, [phuongThuc, trangThai, tuNgay, denNgay, soHoaDon, tenBenhNhan, soDienThoai]);

    return (
        <div className="w-full h-[85vh] bg-[#F0F0F0] overflow-auto flex flex-col items-start justify-start p-4 gap-4">
            <h1 className="text-2xl text-[#1E3A5F] font-bold">Thanh toán</h1>
            {/* Bộ lọc */}
            <div className="flex text-[1.5rem] items-center gap-2">
                <FilterOutlined />
                <span className="font-medium">Bộ lọc</span>
            </div>
            <div className="w-full grid grid-cols-4 gap-4 mb-8 shadow-md p-4 rounded-md bg-[#FFFFFF]">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Từ ngày</label>
                    <input type="date" className="border p-2" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Đến ngày</label>
                    <input type="date" className="border p-2" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Phương thức</label>
                    <select className="border p-2" value={phuongThuc} onChange={(e) => setPhuongThuc(e.target.value as PhuongThucThanhToan | "Tất cả")}>
                        <option>Tất cả</option>
                        <option>Chuyển khoản</option>
                        <option>Tiền mặt</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <select className="border p-2" value={trangThai} onChange={(e) => setTrangThai(e.target.value as TrangThaiThanhToan | "Tất cả")}>
                        <option>Tất cả</option>
                        <option>Đã thanh toán</option>
                        <option>Chưa thanh toán</option>
                        <option>Hủy thanh toán</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tên bệnh nhân</label>
                    <input type="text" className="border p-2" placeholder="Nhập tên bệnh nhân" value={tenBenhNhan} onChange={(e) => setTenBenhNhan(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input type="text" className="border p-2" placeholder="Nhập số điện thoại" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Số hóa đơn</label>
                    <input type="text" className="border p-2" placeholder="Nhập số hóa đơn" value={soHoaDon} onChange={(e) => setSoHoaDon(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <button className="btn mt-6 p-2" onClick={handleReset}>
                        Đặt lại
                    </button>
                </div>
            </div>
            
            <ChangePage />

            {/* Bảng thanh toán */}
            <table className="w-full border-collapse mt-4">
                <thead>
                    <tr>
                        <th className="border p-2">Mã HD</th>
                        <th className="border p-2">Bệnh nhân</th>
                        <th className="border p-2">Số tiền</th>
                        <th className="border p-2">Phương thức</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Ngày thanh toán</th>
                    </tr>
                </thead>
                <tbody>
                    {paymentData.map((payment) => (
                        <tr key={payment.maHD}>
                            <td className="border p-2">{payment.maHD}</td>
                            <td className="border p-2"><div className="flex flex-col"><p>{payment.benhNhan}</p><strong>{payment.soDienThoai}</strong></div></td>
                            <td className="border p-2">{payment.soTien.toLocaleString()} VND</td>
                            <td className="border p-2">{payment.phuongThuc}</td>
                            <td className="border p-2">{payment.trangThai}</td>
                            <td className="border p-2">{payment.ngayThanhToan}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ChangePage />

            {/* Số lượng hiển thị */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm">Số lượng bản ghi hiển thị: </p>
                <select className="border p-2" value={limit} onChange={(e) => setLimit(Number(e.target.value) as 10 | 20 | 50)}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    )
}

function ChangePage() {
    return (
        <div className="w-full grid grid-cols-3 justify-center items-center gap-2">
            <div className="btn text-center cursor-pointer" >
                <ArrowLeftOutlined className="text-lg" />
            </div>
            <div className="flex justify-center">
                <p className="text-sm">1/1</p>
            </div>
            <div className="btn text-center cursor-pointer" >
                <ArrowRightOutlined className="text-lg" />
            </div>
        </div>
    )
}