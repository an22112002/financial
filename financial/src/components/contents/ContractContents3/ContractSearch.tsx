import { useState } from "react";
import {SearchOutlined} from "@ant-design/icons";
import { GetContracts } from "../../../api/contract";
import type { Contract } from "../../../types/ContractData3";

type ContractSearchProps = {
    onSelectContract: React.Dispatch<React.SetStateAction<Contract | null>>;
    closeSearch: () => void;
};

export default function ContractSearch({ onSelectContract, closeSearch }: ContractSearchProps) {
    const [data, setData] = useState<Contract[]>([]);
    const [contractCode, setContractCode] = useState("");
    const [contractNumber, setContractNumber] = useState("");
    const [contractTitle, setContractTitle] = useState("");
    const [partner, setPartner] = useState("");
    const [signDate, setSignDate] = useState("");

    const handleSearch = async () => {
        const request = {
            contractCode: contractCode || undefined,
            contractNumber: contractNumber || undefined,
            contractTitle: contractTitle || undefined,
            partner: partner || undefined,
            signDate: signDate || undefined,
        };
        const contracts = await GetContracts(request);
        
        setData(contracts);
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
                        <SearchOutlined className="mr-2" />
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
                                className="border border-gray-300 rounded p-2 mb-2 cursor-pointer hover:bg-gray-400"
                                onClick={() => {
                                    onSelectContract(contractData);
                                    closeSearch();
                                }}
                            >
                                <strong>{contractData.contractCode} - {contractData.title}</strong>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}