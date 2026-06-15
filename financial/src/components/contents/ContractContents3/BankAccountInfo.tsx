import { useEffect, useState } from "react";
import {CopyOutlined} from "@ant-design/icons";
import { openNotification } from "../../../utils/index";

type BankAccountInfoType = {
    bankName: string;
    accountNumber: string;
    amount: number;
}

type BankTransaction = {
    id: string;
    type: 'in' | 'out';
    accountReceiver: string;
    accountSender: string;
    amount: number;
    time: string;
}

export default function BankAccountInfo() {
    const [bankAccountInfo, setBankAccountInfo] = useState<BankAccountInfoType[]>([]);
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
    const [selfAccountNumber, setSelfAccountNumber] = useState<string[]>([]); // Số tài khoản của công ty mình, dùng để xác định giao dịch gửi/nhận


    useEffect(() => {
        // Gọi API lấy thông tin tài khoản ngân hàng ở đây
        const fetchBankAccountInfo = async () => {
            // Ví dụ giả lập dữ liệu tài khoản ngân hàng
            const data = [{
                bankName: "MB Bank",
                accountNumber: "123456789",
                amount: 1000000
            },
            {
                bankName: "Vietcombank",
                accountNumber: "987654321",
                amount: 5000000
            }];
            setBankAccountInfo(data);
            setSelfAccountNumber(data.map(account => account.accountNumber));
        }
        fetchBankAccountInfo();
    }, []);

    // Lấy dữ liệu dòng tiền các tài khoản ngân hàng
    useEffect(() => {
        const fetchBankAccountTransactions = async () => {
            // Gọi API lấy dữ liệu dòng tiền của các tài khoản ngân hàng ở đây
            // Ví dụ giả lập dữ liệu dòng tiền
            const transactions: BankTransaction[] = [{
                id: "tr-001",
                accountReceiver: "123456789",
                accountSender: "234567890",
                type: "out",
                amount: 200000,
                time: "2026-04-01 10:00:00"
            }, {
                id: "tr-002",
                accountReceiver: "3456789012",
                accountSender: "987654321",
                type: "in",
                time: "2026-04-01 11:00:00",
                amount: 300000,
            }, {
                id: "tr-003",
                accountReceiver: "123456789",
                accountSender: "234567890",
                type: "out",
                time: "2026-04-01 12:00:00",
                amount: 100000,
            }, {
                id: "tr-004",
                accountReceiver: "6789012345",
                accountSender: "987654321",
                type: "in",
                time: "2026-04-01 13:00:00",
                amount: 400000,
            }];
            setBankTransactions(transactions);
        };
        fetchBankAccountTransactions();
    }, []);

    return (
        <div>
            <span><strong>Thông tin tài khoản ngân hàng</strong></span>
            <div className="w-full flex flex-row gap-4">
                <div className="w-full md:w-[50%]">
                    <span className="text-sm text-gray-500">Danh sách tài khoản ngân hàng sở hữu</span>
                
                    <table className="w-full mt-2 border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Tên ngân hàng</th>
                                <th className="border border-gray-300 px-4 py-2">Số tài khoản</th>
                                <th className="border border-gray-300 px-4 py-2">Số dư</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccountInfo.map((account, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{account.bankName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{account.accountNumber}</td>
                                    <td className="border border-gray-300 px-4 py-2">{account.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="border border-gray-300 px-4 py-2 font-bold"></td>
                                <td className="border border-gray-300 px-4 py-2 font-bold">Tổng</td>
                                <td className="border border-gray-300 px-4 py-2 font-bold">{bankAccountInfo.reduce((total, account) => total + account.amount, 0).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="w-full md:w-[50%]">
                    <span className="text-sm text-gray-500">Dòng tiền của các tài khoản ngân hàng</span>
                
                    <table className="w-full mt-2 border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Mã giao dịch</th>
                                <th className="border border-gray-300 px-4 py-2">Tài khoản gửi</th>
                                <th className="border border-gray-300 px-4 py-2">Tài khoản nhận</th>
                                <th className="border border-gray-300 px-4 py-2">Số tiền</th>
                                <th className="border border-gray-300 px-4 py-2">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {transaction.id}
                                        <CopyOutlined className="ml-2 text-gray-500 cursor-pointer" onClick={() => {navigator.clipboard.writeText(transaction.id); openNotification('info', 'Thông báo', 'Đã sao chép mã giao dịch bộ nhớ tạm, Ctrl+V để dán.'); }} />
                                    </td>
                                    <td className={`border border-gray-300 px-4 py-2 ${inList(transaction.accountSender, selfAccountNumber) ? 'font-bold' : ''}`}>{transaction.accountSender}</td>
                                    <td className={`border border-gray-300 px-4 py-2 ${inList(transaction.accountReceiver, selfAccountNumber) ? 'font-bold' : ''}`}>{transaction.accountReceiver}</td>
                                    <td className={`border border-gray-300 px-4 py-2 ${transaction.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>{transaction.amount.toLocaleString()}</td>
                                    <td className="border border-gray-300 px-4 py-2">{transaction.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    )
}

function inList(account: string, accountList: string[]): boolean {
    return accountList.includes(account);
}