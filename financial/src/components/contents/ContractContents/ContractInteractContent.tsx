import { ArrowLeftOutlined, ArrowRightOutlined, FilterOutlined, WarningOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

import type { FullContractData, PayableProcessData } from "../../../types/DataType";
import { fullContracts } from "../../../types/mock";

import { Modal } from "antd";

type FlowRole = "Tất cả" | "Khoản phải chi" | "Khoản được nhận";

type ContractFlowRow = {
    contractCode: string;
    contractTitle: string;
    signDate: string;
    role: Exclude<FlowRole, "Tất cả">;
    amount: number;
    note: string;
    moment: string;
    side: string;
    receiveSide: string;
    joinerSummary: string;
    id_payment: string | null;
};

const pageSizes = [10, 20, 50] as const;

export default function ContractInteractContent({contract_id}: { contract_id: string | null}) {
    const [limit, setLimit] = useState<10 | 20 | 50>(10);
    const [page, setPage] = useState(1);
    const [role, setRole] = useState<FlowRole>("Tất cả");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [contractCode, setContractCode] = useState("");
    const [contractTitle, setContractTitle] = useState("");
    const [partyName, setPartyName] = useState("");
    const [contractData, setContractData] = useState<FullContractData[]>([]);

    const [connectContractCode, setConnectContractCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchContractData = async () => {
            setContractData(fullContracts);
        };

        fetchContractData();
    }, []);

    useEffect(() => {
        const processContractData = () => {
            setContractCode(contract_id ?? "");
        }
        processContractData();
    }, [contract_id]);

    const rows = useMemo(() => {
        const flattenRows: ContractFlowRow[] = [];

        contractData.forEach((contract) => {
            const ourSide = contract.joiners[0]?.title ?? "Bên A";
            const joinerSummary = contract.joiners
                .map((joiner) => `${joiner.title}: ${joiner.name}`)
                .join(" | ");

            contract.processes.forEach((process) => {
                const role = process.side === ourSide ? "Khoản phải chi" : "Khoản được nhận";

                flattenRows.push({
                    contractCode: contract.code,
                    contractTitle: contract.title,
                    signDate: contract.signDate,
                    role,
                    amount: process.amount,
                    note: process.note,
                    moment: formatMoment(process),
                    side: process.side,
                    receiveSide: process.receiveSide,
                    joinerSummary,
                    id_payment: process.id_payment
                });
            });
        });

        return flattenRows;
    }, [contractData]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const matchRole = role === "Tất cả" || row.role === role;
            const matchFromDate = !fromDate || row.signDate >= fromDate;
            const matchToDate = !toDate || row.signDate <= toDate;
            const matchCode = !contractCode || row.contractCode.toLowerCase().includes(contractCode.toLowerCase());
            const matchTitle = !contractTitle || row.contractTitle.toLowerCase().includes(contractTitle.toLowerCase());
            const matchParty = !partyName || row.joinerSummary.toLowerCase().includes(partyName.toLowerCase());
            const matchContractId = !contract_id || row.contractCode === contract_id;

            return matchRole && matchFromDate && matchToDate && matchCode && matchTitle && matchParty && matchContractId;
        });
    }, [rows, role, fromDate, toDate, contractCode, contractTitle, partyName, contract_id]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filteredRows.slice((currentPage - 1) * limit, currentPage * limit);

    const totalPayable = filteredRows
        .filter((row) => row.role === "Khoản phải chi")
        .reduce((sum, row) => sum + row.amount, 0);

    const totalReceivable = filteredRows
        .filter((row) => row.role === "Khoản được nhận")
        .reduce((sum, row) => sum + row.amount, 0);

    const handleFilter = () => {
        setPage(1);
    };

    const handleReset = () => {
        setRole("Tất cả");
        setFromDate("");
        setToDate("");
        setContractCode("");
        setContractTitle("");
        setPartyName("");
        setLimit(10);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-4 w-full bg-[#F0F0F0] p-4 rounded">
            <Modal
                open={connectContractCode !== null}
                onCancel={() => setConnectContractCode(null)}
                title={`Ghép mã giao dịch`}
                footer={null}
            >
                <input
                    type="text"
                    className="border p-2 w-full"
                    placeholder="Nhập mã giao dịch"
                    value={connectContractCode || ""}
                    onChange={(e) => setConnectContractCode(e.target.value)}
                />
                <button
                    className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                    onClick={() => {
                        // Handle contract code connection logic here
                    }}
                >
                    Ghép mã giao dịch
                </button>
            </Modal>

            <div className="flex items-center gap-2 text-[1.5rem]">
                <FilterOutlined />
                <span className="font-medium">Bộ lọc</span>
            </div>

            <div className="w-full grid grid-cols-4 gap-4 shadow-md p-4 rounded-md bg-[#FFFFFF]">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Từ ngày</label>
                    <input type="date" className="border p-2 rounded" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Đến ngày</label>
                    <input type="date" className="border p-2 rounded" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Loại khoản</label>
                    <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value as FlowRole)}>
                        <option>Tất cả</option>
                        <option>Khoản phải chi</option>
                        <option>Khoản được nhận</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Mã hợp đồng</label>
                    <input type="text" className="border p-2 rounded" placeholder="Nhập mã hợp đồng" value={contractCode} onChange={(e) => setContractCode(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tên hợp đồng</label>
                    <input type="text" className="border p-2 rounded" placeholder="Nhập tên hợp đồng" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tìm bên liên quan</label>
                    <input type="text" className="border p-2 rounded" placeholder="Nhập tên bên A / B" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <button className="btn mt-6 p-2" onClick={handleReset}>
                        Đặt lại
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="btn mt-6 p-2" onClick={handleFilter}>
                        Lọc dữ liệu
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-md shadow p-4">
                    <p className="text-sm text-gray-500">Tổng khoản phải chi</p>
                    <strong className="text-xl text-red-600">{totalPayable.toLocaleString()} VND</strong>
                </div>
                <div className="bg-white rounded-md shadow p-4">
                    <p className="text-sm text-gray-500">Tổng khoản được nhận</p>
                    <strong className="text-xl text-green-600">{totalReceivable.toLocaleString()} VND</strong>
                </div>
                <div className="bg-white rounded-md shadow p-4">
                    <p className="text-sm text-gray-500">Số dòng dữ liệu</p>
                    <strong className="text-xl text-[#1E3A5F]">{filteredRows.length}</strong>
                </div>
            </div>

            <ChangePage currentPage={currentPage} totalPages={totalPages} onPrev={() => setPage((value) => Math.max(1, value - 1))} onNext={() => setPage((value) => Math.min(totalPages, value + 1))} />

            <table className="w-full border-collapse bg-white rounded-md shadow-md overflow-hidden">
                <thead>
                    <tr className="bg-[#DDEEFF]">
                        <th className="border p-2 text-left">Mã HĐ</th>
                        <th className="border p-2 text-left">Hợp đồng</th>
                        <th className="border p-2 text-left">Bên chi / nhận</th>
                        <th className="border p-2 text-left">Số tiền</th>
                        <th className="border p-2 text-left">Ghi chú</th>
                        <th className="border p-2 text-left">Thời điểm</th>
                        <th className="border p-2 text-left">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map((row, index) => (
                        <tr key={`${row.contractCode}-${row.moment}-${index}`} className="hover:bg-slate-50">
                            <td className="border p-2">{row.contractCode}</td>
                            <td className="border p-2">
                                <div className="flex flex-col gap-1">
                                    <strong>{row.contractTitle}</strong>
                                    <span className="text-xs text-gray-500">Ký ngày {row.signDate}</span>
                                    <span className="text-xs text-gray-500">{row.joinerSummary}</span>
                                </div>
                            </td>
                            <td className="border p-2">
                                <div className="flex flex-col gap-1 text-sm">
                                    <span><strong>Chi:</strong> {row.side}</span>
                                    <span><strong>Nhận:</strong> {row.receiveSide}</span>
                                </div>
                            </td>
                            <td className="border p-2">
                                <span className={row.role === "Khoản phải chi" ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                    {row.role === "Khoản phải chi" ? "-" : "+"}{row.amount.toLocaleString()} VND
                                </span>
                            </td>
                            <td className="border p-2">
                                <div className="flex flex-col gap-1 text-sm">
                                    <span>{row.note}</span>
                                </div>
                            </td>
                            <td className="border p-2">
                                <span>{row.moment}</span>
                            </td>
                            <td className="border p-2 flex flex-col gap-1">
                                {row.id_payment ? (
                                    <>
                                        <span className="text-sm text-green-600 font-medium bg-green-100">Đã thanh toán</span>
                                        <span className="text-xs text-gray-500">{row.id_payment}</span>
                                    </>
                                ) : (
                                    <>
                                        
                                        {row.moment && new Date(row.moment) < new Date() ? (
                                            <div className="flex items-center gap-1">
                                                <WarningOutlined className="text-sm font-bold text-red-500" />
                                                <span className="text-sm text-red-600 font-medium">Quá hạn thanh toán</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-orange-600 font-medium">Chưa thanh toán</span>
                                        )}
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded" onClick={() => setConnectContractCode("")}>
                                            Ghép mã giao dịch
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {pageRows.length === 0 && (
                        <tr>
                            <td className="border p-4 text-center text-gray-500" colSpan={7}>
                                Không có dữ liệu phù hợp với bộ lọc hiện tại.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ChangePage currentPage={currentPage} totalPages={totalPages} onPrev={() => setPage((value) => Math.max(1, value - 1))} onNext={() => setPage((value) => Math.min(totalPages, value + 1))} />

            <div className="flex justify-between items-center mt-2 bg-white rounded-md shadow p-4">
                <p className="text-sm">Số lượng bản ghi hiển thị:</p>
                <select className="border p-2 rounded" value={limit} onChange={(e) => setLimit(Number(e.target.value) as 10 | 20 | 50)}>
                    {pageSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function formatMoment(process: PayableProcessData) {
    if (!process?.moment) return "";

    // nếu là text custom thì return luôn
    if (typeof process.moment === "string") {
        const d = new Date(process.moment);

        // invalid date
        if (isNaN(d.getTime())) {
            return process.moment;
        }

        return d.toISOString().split("T")[0];
    }

    // nếu là Date object
    if (process.moment instanceof Date) {
        if (isNaN(process.moment.getTime())) {
            return "";
        }

        return process.moment.toISOString().split("T")[0];
    }

    return "";
}

function ChangePage({ currentPage, totalPages, onPrev, onNext }: { currentPage: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
    return (
        <div className="w-full grid grid-cols-3 justify-center items-center gap-2">
            <button className="btn text-center cursor-pointer disabled:opacity-40" onClick={onPrev} disabled={currentPage <= 1}>
                <ArrowLeftOutlined className="text-lg" />
            </button>
            <div className="flex justify-center">
                <p className="text-sm">{currentPage}/{totalPages}</p>
            </div>
            <button className="btn text-center cursor-pointer disabled:opacity-40" onClick={onNext} disabled={currentPage >= totalPages}>
                <ArrowRightOutlined className="text-lg" />
            </button>
        </div>
    );
}