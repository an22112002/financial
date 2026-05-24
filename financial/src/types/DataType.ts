
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

export type FullContractData = {
    code: string;
    title: string;
    signDate: string;
    timeExecute: periodOfTime | timeline;
    joiners: ContractJoinerData[];
    processes: PayableProcessData[];
    tax: number;
    insurance: InsuranceData | null;
};

type periodOfTime = {
    begin: string;
    end: string;
}

type timeline = {
    numberOfDay: number;
    delay: number;
}

export type PayableProcessData = {
    id: number;
    amount: number;
    side: string;
    receiveSide: string;
    moment: Date | string;
    note: string;
    id_payment: string | null;
}

export type InsurancePaymentData = {
    time: Date | string;
    amount: number;
    tax: number;
    id_payment: string | null;
}

export type InsuranceData = {
    paySide: string;
    receiveSide: string;
    insuranceMoney: number;
    insuranceCondition: "finalPayment" | "dateSpecific";
    insurancePaymentType: "oneTime" | "periodic";
    insuranceDateBegin: string | null;
    insurancePayments: InsurancePaymentData[] | null;
}

export type ContractCalendarData = {
    title: string;
    money: number;
    type: "receive" | "pay";
    date: string;
    note: string;
    id_payment: string | null;
    id_contract: string;
};

export type ContractJoinerData = {
    title: string;
    name: string;
    bank: string;
    accountNumber: string;
    represent: string;
}

export type ContractsData = ContractCalendarData[];

export type Calendar_ContractInfo = {
    title: string;
    money: number;
    type: "receive" | "pay";
    note: string;
    id_payment: string | null;
    id_contract: string;
};

export type Calendar_DayInfo = {
    date: Date;
    contracts: Calendar_ContractInfo[];
};

export type Calendar_MonthInfo = {
    month: string;
    days: Calendar_DayInfo[];
};

export type MoneyFlowData = {
    id_payment: string; // mã giao dịch thanh toán
    date: string;       // ngày giao dịch
    account: string;    // tài khoản chính
    exchange: string;   //  tài khoản đối ứng
    amount: number;     // số tiền
    type: "receive" | "pay";    // loại giao dịch
    description: string;// nội dung chuyển tiền
}