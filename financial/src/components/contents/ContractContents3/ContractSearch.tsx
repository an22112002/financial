import { useState } from "react";

import type { Contract, ContractData } from "../../../types/ContractData3";

type ContractSearchProps = {
    onSelectContract: React.Dispatch<React.SetStateAction<Contract | null>>;
};

export default function ContractSearch({ onSelectContract }: ContractSearchProps) {
    const [data, setData] = useState<ContractData[]>([]);
    const [contractCode, setContractCode] = useState("");
    const [contractNumber, setContractNumber] = useState("");
    const [contractTitle, setContractTitle] = useState("");
    const [partner, setPartner] = useState("");
    const [signDate, setSignDate] = useState("");

    const handleSearch = async () => {
        // Gọi API tìm kiếm hợp đồng với các tham số contractCode, contractNumber, contractTitle, partner, signDate
        // Ví dụ:
        // api.get('/contracts/search', { params: { contractCode, contractNumber, contractTitle, partner, signDate } })
        const mockData: ContractData[] = [
            {
                contractCode: "HD001",
                department: 
                    {
                        departmentID: 1,
                        name: "Phòng Kinh Doanh"
                    }
                ,
                versions: [
                    {
                        contractID: "HD001-1",
                        contractCode: "HD001",
                        contractNumber: "001",
                        version: 1,
                        title: "Hợp đồng mua bán hàng hóa",
                        contractContent: "Nội dung hợp đồng phiên bản 1",
                        signDate: "2023-01-01",
                        startDate: "2023-01-10",
                        finishDate: {
                            type: "date",
                            date: "2023-12-31",
                            condition: null
                        },
                        status: "active",
                        userEdit: "user1",
                        partner: ["Công ty A"],
                        payables: [
                            {
                                id: 1,
                                amount: 1000000,
                                partner: "Công ty A",
                                type: "receive",
                                tax: 10,
                                lateFee: 0,
                                note: "Thanh toán lần 1",
                                moment: {
                                    type: "date",
                                    date: "2023-02-01",
                                    delay: 0,
                                    condition: null
                                }
                            },
                            {
                                id: 2,
                                amount: 2000000,
                                partner: "Công ty A",
                                type: "receive",
                                tax: 10,
                                lateFee: 0,
                                note: "Thanh toán lần 2",
                                moment: {
                                    type: "condition",
                                    isConditionMet: false,
                                    date: null,
                                    delay: 5,
                                    condition: "Sau khi giao hàng"
                                }
                            }
                            ],
                        documents: [
                            {
                                id: "doc1",
                                name: "Hợp đồng HD001-1.pdf",
                                fileType: "pdf",
                                url: "https://example.com/documents/hd001-1.pdf"
                            }
                        ]
                    }
                ]
            }
        ];
        setData(mockData);
    };

    return (
        <div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500">Mã hợp đồng</span>
                    <input type="text" value={contractCode} onChange={(e) => setContractCode(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500">Số hợp đồng</span>
                    <input type="text" value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500">Tên hợp đồng</span>
                    <input type="text" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500">Đối tác</span>
                    <input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-500">Ngày ký kết</span>
                    <input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                </label>
                <div className="flex flex-row justify-end items-center">
                    <button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Tìm kiếm
                    </button>
                </div>
            </div>
            
            <div>
                <h2 className="text-lg font-bold mt-4 mb-2">Kết quả tìm kiếm:</h2>
                {data.length === 0 ? (
                    <p>Không có hợp đồng nào được tìm thấy.</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {data.map((contractData) => (
                            <li key={contractData.contractCode}
                                className="border border-gray-300 rounded p-2 mb-2"
                                onClick={() => {
                                    onSelectContract(contractData.versions[0]);
                                }}
                            >
                                <strong>{contractData.contractCode}</strong> - {contractData.versions[0].title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}