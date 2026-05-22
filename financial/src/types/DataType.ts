
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

// Dữ liệu hợp đồng hiển thị trên calendar

export type ContractData = {
    title: string;
    money: number;
    type: "receive" | "pay";
    date: string;
    note: string;
};

export type ContractJoinerData = {
    title: string;
    name: string;
    bank: string;
    accountNumber: string;
    represent: string;
}

export type ContractsData = ContractData[];

export type Calendar_ContractInfo = {
    title: string;
    money: number;
    type: "receive" | "pay";
    note: string;
};

export type Calendar_DayInfo = {
    date: Date;
    contracts: Calendar_ContractInfo[];
};

export type Calendar_MonthInfo = {
    month: string;
    days: Calendar_DayInfo[];
};