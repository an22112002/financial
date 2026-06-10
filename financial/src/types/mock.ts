import type { YearlyData, ServiceData } from "./DataType";
import type { ContractsData, FullContractData } from "./DataType";
import type { MoneyFlowData } from "./DataType";


export const dataAnalytic: YearlyData = {
    year: "2025",

    months: [
        {
            month: "01/2025",
            totalTransactions: 145,
            successfulTransactions: 118,
            cancelledTransactions: 17,
            unpaidTransactions: 10,
            onlineTransactions: 92,
            offlineTransactions: 53,
            totalRevenue: 52000000,
            totalUnpaindRevenue: 4200000,
        },

        {
            month: "02/2025",
            totalTransactions: 162,
            successfulTransactions: 136,
            cancelledTransactions: 14,
            unpaidTransactions: 12,
            onlineTransactions: 105,
            offlineTransactions: 57,
            totalRevenue: 61000000,
            totalUnpaindRevenue: 5100000,
        },

        {
            month: "03/2025",
            totalTransactions: 178,
            successfulTransactions: 149,
            cancelledTransactions: 18,
            unpaidTransactions: 11,
            onlineTransactions: 120,
            offlineTransactions: 58,
            totalRevenue: 72000000,
            totalUnpaindRevenue: 4800000,
        },

        {
            month: "04/2025",
            totalTransactions: 154,
            successfulTransactions: 128,
            cancelledTransactions: 16,
            unpaidTransactions: 10,
            onlineTransactions: 101,
            offlineTransactions: 53,
            totalRevenue: 64000000,
            totalUnpaindRevenue: 4600000,
        },

        {
            month: "05/2025",
            totalTransactions: 190,
            successfulTransactions: 161,
            cancelledTransactions: 19,
            unpaidTransactions: 10,
            onlineTransactions: 135,
            offlineTransactions: 55,
            totalRevenue: 81000000,
            totalUnpaindRevenue: 6200000,
        },

        {
            month: "06/2025",
            totalTransactions: 210,
            successfulTransactions: 180,
            cancelledTransactions: 20,
            unpaidTransactions: 10,
            onlineTransactions: 152,
            offlineTransactions: 58,
            totalRevenue: 93000000,
            totalUnpaindRevenue: 7500000,
        },

        {
            month: "07/2025",
            totalTransactions: 198,
            successfulTransactions: 168,
            cancelledTransactions: 18,
            unpaidTransactions: 12,
            onlineTransactions: 146,
            offlineTransactions: 52,
            totalRevenue: 89000000,
            totalUnpaindRevenue: 7100000,
        },

        {
            month: "08/2025",
            totalTransactions: 225,
            successfulTransactions: 194,
            cancelledTransactions: 19,
            unpaidTransactions: 12,
            onlineTransactions: 171,
            offlineTransactions: 54,
            totalRevenue: 105000000,
            totalUnpaindRevenue: 8400000,
        },

        {
            month: "09/2025",
            totalTransactions: 214,
            successfulTransactions: 183,
            cancelledTransactions: 20,
            unpaidTransactions: 11,
            onlineTransactions: 158,
            offlineTransactions: 56,
            totalRevenue: 98000000,
            totalUnpaindRevenue: 7900000,
        },

        {
            month: "10/2025",
            totalTransactions: 238,
            successfulTransactions: 205,
            cancelledTransactions: 21,
            unpaidTransactions: 12,
            onlineTransactions: 182,
            offlineTransactions: 56,
            totalRevenue: 118000000,
            totalUnpaindRevenue: 9300000,
        },

        {
            month: "11/2025",
            totalTransactions: 252,
            successfulTransactions: 220,
            cancelledTransactions: 20,
            unpaidTransactions: 12,
            onlineTransactions: 194,
            offlineTransactions: 58,
            totalRevenue: 126000000,
            totalUnpaindRevenue: 10100000,
        },

        {
            month: "12/2025",
            totalTransactions: 310,
            successfulTransactions: 276,
            cancelledTransactions: 22,
            unpaidTransactions: 12,
            onlineTransactions: 250,
            offlineTransactions: 60,
            totalRevenue: 168000000,
            totalUnpaindRevenue: 12800000,
        },
    ],
};

export const services: Record<string, ServiceData[]> = {

    "01/2025": [

        {
            month: "01/2025",
            serviceName: "Khám bệnh Bác sĩ",
            price: 100000,
            patientCount: 52,
            totalTransactions: 58,
            successfulTransactions: 45,
            cancelledTransactions: 6,
            unpaidTransactions: 7,
            onlineTransactions: 40,
            offlineTransactions: 18,
            totalRevenue: 5800000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Bác sĩ chuyên khoa",
            price: 150000,
            patientCount: 41,
            totalTransactions: 45,
            successfulTransactions: 36,
            cancelledTransactions: 4,
            unpaidTransactions: 5,
            onlineTransactions: 33,
            offlineTransactions: 12,
            totalRevenue: 6750000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Thạc sĩ",
            price: 150000,
            patientCount: 38,
            totalTransactions: 42,
            successfulTransactions: 34,
            cancelledTransactions: 3,
            unpaidTransactions: 5,
            onlineTransactions: 30,
            offlineTransactions: 12,
            totalRevenue: 6300000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Tiến sĩ",
            price: 200000,
            patientCount: 28,
            totalTransactions: 32,
            successfulTransactions: 25,
            cancelledTransactions: 3,
            unpaidTransactions: 4,
            onlineTransactions: 24,
            offlineTransactions: 8,
            totalRevenue: 6400000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Bác sĩ (ngoài giờ)",
            price: 100000,
            patientCount: 33,
            totalTransactions: 36,
            successfulTransactions: 28,
            cancelledTransactions: 3,
            unpaidTransactions: 5,
            onlineTransactions: 24,
            offlineTransactions: 12,
            totalRevenue: 3600000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Bác sĩ chuyên khoa (ngoài giờ)",
            price: 200000,
            patientCount: 24,
            totalTransactions: 27,
            successfulTransactions: 21,
            cancelledTransactions: 2,
            unpaidTransactions: 4,
            onlineTransactions: 20,
            offlineTransactions: 7,
            totalRevenue: 5400000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bệnh Thạc sĩ (ngoài giờ)",
            price: 200000,
            patientCount: 22,
            totalTransactions: 25,
            successfulTransactions: 19,
            cancelledTransactions: 2,
            unpaidTransactions: 4,
            onlineTransactions: 18,
            offlineTransactions: 7,
            totalRevenue: 5000000,
        },

        {
            month: "01/2025",
            serviceName: "Khám tư vấn dinh dưỡng",
            price: 150000,
            patientCount: 18,
            totalTransactions: 20,
            successfulTransactions: 16,
            cancelledTransactions: 2,
            unpaidTransactions: 2,
            onlineTransactions: 14,
            offlineTransactions: 6,
            totalRevenue: 3000000,
        },

        {
            month: "01/2025",
            serviceName: "Khám tư vấn dinh dưỡng (ngoài giờ)",
            price: 200000,
            patientCount: 12,
            totalTransactions: 14,
            successfulTransactions: 11,
            cancelledTransactions: 1,
            unpaidTransactions: 2,
            onlineTransactions: 11,
            offlineTransactions: 3,
            totalRevenue: 2800000,
        },

        {
            month: "01/2025",
            serviceName: "Khám bác sỹ chuyên khoa II",
            price: 200000,
            patientCount: 16,
            totalTransactions: 18,
            successfulTransactions: 14,
            cancelledTransactions: 2,
            unpaidTransactions: 2,
            onlineTransactions: 13,
            offlineTransactions: 5,
            totalRevenue: 3600000,
        },
    ],

    "02/2025": [

        {
            month: "02/2025",
            serviceName: "Khám bệnh Bác sĩ",
            price: 100000,
            patientCount: 60,
            totalTransactions: 66,
            successfulTransactions: 53,
            cancelledTransactions: 5,
            unpaidTransactions: 8,
            onlineTransactions: 47,
            offlineTransactions: 19,
            totalRevenue: 6600000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Bác sĩ chuyên khoa",
            price: 150000,
            patientCount: 48,
            totalTransactions: 53,
            successfulTransactions: 42,
            cancelledTransactions: 4,
            unpaidTransactions: 7,
            onlineTransactions: 38,
            offlineTransactions: 15,
            totalRevenue: 7950000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Thạc sĩ",
            price: 150000,
            patientCount: 44,
            totalTransactions: 49,
            successfulTransactions: 39,
            cancelledTransactions: 4,
            unpaidTransactions: 6,
            onlineTransactions: 35,
            offlineTransactions: 14,
            totalRevenue: 7350000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Tiến sĩ",
            price: 200000,
            patientCount: 34,
            totalTransactions: 38,
            successfulTransactions: 30,
            cancelledTransactions: 3,
            unpaidTransactions: 5,
            onlineTransactions: 29,
            offlineTransactions: 9,
            totalRevenue: 7600000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Bác sĩ (ngoài giờ)",
            price: 100000,
            patientCount: 40,
            totalTransactions: 44,
            successfulTransactions: 35,
            cancelledTransactions: 3,
            unpaidTransactions: 6,
            onlineTransactions: 31,
            offlineTransactions: 13,
            totalRevenue: 4400000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Bác sĩ chuyên khoa (ngoài giờ)",
            price: 200000,
            patientCount: 28,
            totalTransactions: 31,
            successfulTransactions: 24,
            cancelledTransactions: 3,
            unpaidTransactions: 4,
            onlineTransactions: 23,
            offlineTransactions: 8,
            totalRevenue: 6200000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bệnh Thạc sĩ (ngoài giờ)",
            price: 200000,
            patientCount: 25,
            totalTransactions: 28,
            successfulTransactions: 22,
            cancelledTransactions: 2,
            unpaidTransactions: 4,
            onlineTransactions: 21,
            offlineTransactions: 7,
            totalRevenue: 5600000,
        },

        {
            month: "02/2025",
            serviceName: "Khám tư vấn dinh dưỡng",
            price: 150000,
            patientCount: 22,
            totalTransactions: 24,
            successfulTransactions: 19,
            cancelledTransactions: 2,
            unpaidTransactions: 3,
            onlineTransactions: 17,
            offlineTransactions: 7,
            totalRevenue: 3600000,
        },

        {
            month: "02/2025",
            serviceName: "Khám tư vấn dinh dưỡng (ngoài giờ)",
            price: 200000,
            patientCount: 16,
            totalTransactions: 18,
            successfulTransactions: 14,
            cancelledTransactions: 1,
            unpaidTransactions: 3,
            onlineTransactions: 14,
            offlineTransactions: 4,
            totalRevenue: 3600000,
        },

        {
            month: "02/2025",
            serviceName: "Khám bác sỹ chuyên khoa II",
            price: 200000,
            patientCount: 20,
            totalTransactions: 22,
            successfulTransactions: 17,
            cancelledTransactions: 2,
            unpaidTransactions: 3,
            onlineTransactions: 16,
            offlineTransactions: 6,
            totalRevenue: 4400000,
        },
    ],
};

export const fullContracts: FullContractData[] = [
    {
        code: "010526/HD-NIAD",
        title: "Cung cấp vật tư y tế tháng 5",
        signDate: "2026-05-01",
        timeExecute: { begin: "2026-05-05", end: "2026-06-05" },
        joiners: [
            {
                title: "Bên A",
                name: "Công ty TNHH NIAD",
                bank: "BIDV",
                accountNumber: "0123456789",
                represent: "Nguyễn Văn A"
            },
            {
                title: "Bên B",
                name: "Công ty Thiết bị Minh Quang",
                bank: "MB Bank",
                accountNumber: "9876543210",
                represent: "Trần Thị B"
            }
        ],
        processes: [
            { id: 1, amount: 85000000, side: "Bên A", receiveSide: "Bên B", moment: "2026-05-08", note: "Thanh toán lần 1", id_payment: "PAY-2026-001" },
            { id: 2, amount: 65000000, side: "Bên A", receiveSide: "Bên B", moment: "2026-05-20", note: "Thanh toán lần 2", id_payment: "PAY-2026-004" },
            { id: 3, amount: 15000000, side: "Bên B", receiveSide: "Bên A", moment: "2026-06-02", note: "Thanh toán lần 3", id_payment: null }
        ],
        tax: 10,
        insurance: null
    },
    {
        code: "100526/HD-NIAD",
        title: "Dịch vụ bảo trì hệ thống",
        signDate: "2026-05-10",
        timeExecute: { numberOfDay: 90, delay: 5 },
        joiners: [
            {
                title: "Bên A",
                name: "Công ty TNHH NIAD",
                bank: "BIDV",
                accountNumber: "0123456789",
                represent: "Nguyễn Văn A"
            },
            {
                title: "Bên B",
                name: "Công ty Sao Việt Tech",
                bank: "Techcombank",
                accountNumber: "1234567890",
                represent: "Lê Văn C"
            }
        ],
        processes: [
            { id: 1, amount: 42000000, side: "Bên A", receiveSide: "Bên B", moment: "2026-05-15", note: "Thanh toán lần 1", id_payment: null },
            { id: 2, amount: 12000000, side: "Bên B", receiveSide: "Bên A", moment: "2026-06-18", note: "Thanh toán lần 2", id_payment: null }
        ],
        tax: 8,
        insurance: {
            paySide: "Bên A",
            receiveSide: "Bên B",
            insuranceMoney: 3000000,
            insuranceCondition: "finalPayment",
            insurancePaymentType: "oneTime",
            insuranceDateBegin: "2026-06-30",
            insurancePayments: [
                { time: "2026-06-30", amount: 3000000, tax: 8, id_payment: null }
            ]
        }
    },
    {
        code: "180526/HD-NIAD",
        title: "Triển khai phần mềm kế toán",
        signDate: "2026-05-18",
        timeExecute: { begin: "2026-05-20", end: "2026-07-20" },
        joiners: [
            {
                title: "Bên A",
                name: "Công ty TNHH NIAD",
                bank: "BIDV",
                accountNumber: "0123456789",
                represent: "Nguyễn Văn A"
            },
            {
                title: "Bên B",
                name: "Công ty Giải pháp Số HCM",
                bank: "Vietcombank",
                accountNumber: "5566778899",
                represent: "Phạm Thị D"
            }
        ],
        processes: [
            { id: 1, amount: 60000000, side: "Bên A", receiveSide: "Bên B", moment: "Khi hoàn thành thủ tục C2", note: "Tạm ứng triển khai", id_payment: null },
            { id: 2, amount: 25000000, side: "Bên A", receiveSide: "Bên B", moment: "2026-06-22", note: "Thanh toán sau nghiệm thu", id_payment: null },
            { id: 3, amount: 8000000, side: "Bên B", receiveSide: "Bên A", moment: "2026-07-10", note: "Bảo hành phần mềm", id_payment: null }
        ],
        tax: 10,
        insurance: null
    },
    {
        code: "010526/HD-NIAD",
        title: "Triển khai",
        signDate: "2026-05-18",
        timeExecute: { begin: "2026-05-20", end: "2026-07-20" },
        joiners: [
            {
                title: "Bên A",
                name: "Công ty TNHH NIAD",
                bank: "BIDV",
                accountNumber: "0123456789",
                represent: "Nguyễn Văn A"
            },
            {
                title: "Bên B",
                name: "Công ty Giải pháp Số HCM",
                bank: "Vietcombank",
                accountNumber: "5566778899",
                represent: "Phạm Thị D"
            }
        ],
        processes: [
            { id: 1, amount: 60000000, side: "Bên A", receiveSide: "Bên B", moment: "Khi hoàn thành thủ tục C2", note: "Tạm ứng triển khai", id_payment: null },
            { id: 2, amount: 25000000, side: "Bên A", receiveSide: "Bên B", moment: "2026-06-22", note: "Thanh toán sau nghiệm thu", id_payment: null },
            { id: 3, amount: 8000000, side: "Bên B", receiveSide: "Bên A", moment: "2026-07-10", note: "Bảo hành phần mềm", id_payment: null }
        ],
        tax: 10,
        insurance: null
    }
];

export const contracts: ContractsData = fullContracts.flatMap((contract) =>
    contract.processes.map((process) => ({
        title: contract.title,
        money: process.amount,
        type: process.side === contract.joiners[0]?.title ? "pay" : "receive",
        date: process.moment instanceof Date ? process.moment.toISOString().split("T")[0] : process.moment,
        note: process.note,
        id_payment: process.id_payment,
        id_contract: contract.code
    }))
);

// Generate money flow mock data from 2026-05-01 to 2026-05-24.
export const moneyFlows: MoneyFlowData[] = [
    { date: "2026-05-01 10:10:00", amount: 100000, account: "Ngân hàng MB Bank", exchange: "Công ty NIAD", type: "receive", description: "Số dư đầu kỳ", id_payment: "CAD-2026-001" },
    { date: "2026-05-08 14:30:00", amount: 85000000, account: "Công ty NIAD", exchange: "Công ty Thiết bị Minh Quang", type: "pay", description: "Tạm ứng đợt 1 - HD-2026-001", id_payment: "PAY-2026-001" },
    { date: "2026-05-20 09:15:00", amount: 65000000, account: "Công ty NIAD", exchange: "Công ty Thiết bị Minh Quang", type: "pay", description: "Thanh toán đợt 2 - HD-2026-001", id_payment: "PAY-2026-004" },
    { date: "2026-05-22 16:45:00", amount: 60000000, account: "Công ty NIAD", exchange: "Công ty Giải pháp Số HCM", type: "pay", description: "Tạm ứng triển khai - HD-2026-003", id_payment: "PAY-2026-003" },
]

export type NearDuePayableLine = {
    id: string;
    amount: number;
    paytime: string;
    lastTime: string;
    latePee: number;
};

export type NearDuePayableGroup = {
    id: string;
    contractTitle: string;
    partner: string;
    payable: NearDuePayableLine[];
};

export const nearDueReceiveMock: NearDuePayableGroup[] = [
    {
        id: "NDR-001",
        contractTitle: "Hợp đồng bán hàng A",
        partner: "Công ty H",
        payable: [
            { id: "RCV-0605-001", amount: 800000, paytime: "2026-06-05", lastTime: "2026-06-05", latePee: 0 },
            { id: "RCV-0608-001", amount: 900000, paytime: "2026-06-08", lastTime: "2026-06-09", latePee: 0 },
        ],
    },
    {
        id: "NDR-002",
        contractTitle: "Hợp đồng dịch vụ B",
        partner: "Công ty I",
        payable: [
            { id: "RCV-0610-001", amount: 1200000, paytime: "2026-06-10", lastTime: "2026-06-10", latePee: 0 },
        ],
    },
    {
        id: "NDR-003",
        contractTitle: "Hợp đồng dịch vụ C",
        partner: "Công ty J",
        payable: [
            { id: "RCV-0612-001", amount: 1500000, paytime: "2026-06-12", lastTime: "2026-06-13", latePee: 1 },
        ],
    },
    {
        id: "NDR-004",
        contractTitle: "Hợp đồng bán hàng D",
        partner: "Công ty K",
        payable: [
            { id: "RCV-0620-001", amount: 700000, paytime: "2026-06-20", lastTime: "2026-06-20", latePee: 0 },
        ],
    },
];

export const nearDuePayableMock: NearDuePayableGroup[] = [
    {
        id: "NDP-001",
        contractTitle: "Hợp đồng mua hàng A",
        partner: "Công ty L",
        payable: [
            { id: "PYB-0605-001", amount: 500000, paytime: "2026-06-05", lastTime: "2026-06-05", latePee: 0 },
        ],
    },
    {
        id: "NDP-002",
        contractTitle: "Hợp đồng dịch vụ B",
        partner: "Công ty M",
        payable: [
            { id: "PYB-0606-001", amount: 900000, paytime: "2026-06-06", lastTime: "2026-06-06", latePee: 0 },
            { id: "PYB-0706-002", amount: 1100000, paytime: "2026-07-06", lastTime: "2026-07-06", latePee: 0 },
        ],
    },
    {
        id: "NDP-003",
        contractTitle: "Hợp đồng dịch vụ C",
        partner: "Công ty N",
        payable: [
            { id: "PYB-0610-001", amount: 1300000, paytime: "2026-06-10", lastTime: "2026-06-11", latePee: 1 },
        ],
    },
    {
        id: "NDP-004",
        contractTitle: "Hợp đồng mua hàng D",
        partner: "Công ty O",
        payable: [
            { id: "PYB-0620-001", amount: 600000, paytime: "2026-06-20", lastTime: "2026-06-20", latePee: 0 },
        ],
    },
];
