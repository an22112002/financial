
export type PhuongThucThanhToan = "Chuyển khoản" | "Tiền mặt" ;

export type TrangThaiThanhToan = "Đã thanh toán" | "Chưa thanh toán" | "Hủy thanh toán";

export type PaymentData = {
    maHD: string;
    benhNhan: string;
    soDienThoai: string;
    soTien: number;
    phuongThuc: PhuongThucThanhToan;
    trangThai: TrangThaiThanhToan;
    ngayThanhToan: string;
}

// Dữ liệu phân tích hàng tháng
export type YearlyData = {
    year: string;
    months: RawMonthlyData[];
};

export type RawMonthlyData = {
    month: string;
    totalTransactions: number;
    successfulTransactions: number;
    cancelledTransactions: number;
    unpaidTransactions: number;
    onlineTransactions: number;
    offlineTransactions: number;
    totalRevenue: number;
    totalUnpaindRevenue: number;
};

// Dữ liệu phân tích dịch vụ
export type ServiceData = {
    month: string;
    serviceName: string;
    price: number;
    patientCount: number;
    totalTransactions: number;
    successfulTransactions: number;
    cancelledTransactions: number;
    unpaidTransactions: number;
    onlineTransactions: number;
    offlineTransactions: number;
    totalRevenue: number;
};