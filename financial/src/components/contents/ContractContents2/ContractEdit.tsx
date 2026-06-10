import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ServiceContractEdit from "./ServiceContractEdit";
import FreeContractEdit from "./FreeContractEdit";
import type { Payable, ContractData } from "../../../types/ContractDataType";
import { fullContracts } from "../../../types/mockOri";
import { Popover } from "antd";

type ContractType = "service" | "free";

export default function ContractEdit() {
    const navigate = useNavigate();

    const [mode, setMode] = useState<"create" | "view" | "edit" | "viewVersion">("create");

    const [contractType, setContractType] = useState<ContractType>("service");
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

    const [payablesReceive, setPayablesReceive] = useState<Payable[]>([]);
    const [payablesPay, setPayablesPay] = useState<Payable[]>([]);

    const [contracts, setContracts] = useState<ContractData[]>([]);
    const [focusContract, setFocusContract] = useState<ContractData | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredContracts = useMemo(() => {
        return contracts.filter((contract) => {
            const latestConstruct = contract.constructs[0];
            const title = latestConstruct?.contract.title ?? "";
            const signDate = latestConstruct?.contract.signDate ?? "";
            const query = searchTerm.toLowerCase();

            return (
                title.toLowerCase().includes(query) ||
                signDate.includes(searchTerm)
            );
        });
    }, [contracts, searchTerm]);

    const selectedTitle = focusContract?.constructs[0]?.contract.title ?? "Chưa chọn hợp đồng";
    const selectedPartner = focusContract?.constructs[0]?.contract.partner ?? "Chọn một hợp đồng bên phải để xem chi tiết";

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

    const getVersionLabel = (contract: ContractData) => {
        const latestVersion = contract.constructs[0]?.version ?? null;
        return latestVersion ? `Phiên bản ${latestVersion}` : "Chưa có phiên bản";
    };

    const getStatusClass = (status?: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
            case "pending":
                return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
            case "paided":
                return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
            default:
                return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
        }
    };

    useEffect(() => {
        const loadContract = async () => {
            // Load mock contracts từ mockOri và chuyển sang dạng ContractData tối giản
            const data: ContractData[] = fullContracts.map((fc, idx) => {
                const partner = fc.joiners?.[1]?.name ?? fc.joiners?.[0]?.name ?? "Đối tác";
                const payments: Payable[] = (fc.processes || []).map((p) => ({
                    partner,
                    amount: p.amount,
                    paytime: typeof p.moment === 'string' ? p.moment : (p.moment as Date).toString(),
                    lastTime: typeof p.moment === 'string' ? p.moment : (p.moment as Date).toString(),
                    status: p.id_payment ? "paided" : "pending",
                }));

                const serviceContract = {
                    contractCode: fc.code,
                    title: fc.title,
                    contractObject: partner,
                    contractContent: fc.title,
                    signDate: fc.signDate,
                    startDate: (fc.timeExecute as any).begin ?? "",
                    duration: 12,
                    durationUnit: "month",
                    endDate: (fc.timeExecute as any).end ?? "",
                    unitPrice: payments[0]?.amount ?? 0,
                    tax: Math.round((fc.tax ?? 0) * 100),
                    paytime: payments.length || 1,
                    lateTime: 0,
                    latePee: 0,
                    collectionMethod: "begin",
                    partner,
                    department: "Kinh doanh tài sản",
                    status: "active",
                    payments,
                    documents: [],
                } as any;

                return {
                    type: "service",
                    id: idx + 1,
                    recevices: payments,
                    debts: [],
                    constructs: [
                        {
                            version: 1,
                            contract: serviceContract,
                        }
                    ]
                } as ContractData;
            });
            setContracts(data);
        }
        loadContract();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 text-slate-800">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Quản lý hợp đồng</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Bộ phận: </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Xem nhanh, lọc nhanh và chỉnh sửa trên cùng một màn hình với bố cục rõ ràng hơn.
                            </p>
                        </div>
                        <button
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-700"
                            onClick={() => navigate(-1)}
                        >
                            Trở lại
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng hợp đồng</div>
                            <div className="mt-2 text-3xl font-bold text-slate-900">{contracts.length}</div>
                        </div>
                        <div className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Đang xem</div>
                            <div className="mt-2 text-lg font-bold text-cyan-950">{selectedTitle}</div>
                            <div className="mt-1 text-sm text-cyan-800/80">{selectedPartner}</div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Phiên bản</div>
                            <div className="mt-2 text-lg font-bold text-emerald-950">{focusContract ? getVersionLabel(focusContract) : "Chưa chọn"}</div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Thông tin hợp đồng</h2>
                                <p className="mt-1 text-sm text-slate-500">Khối chỉnh sửa và xem chi tiết hợp đồng.</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${contractType === "service" ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100" : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"}`}>
                                {contractType === "service" && "Cung cấp dịch vụ"}
                                {contractType === "free" && "Tự do"}
                            </span>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 md:grid-cols-2 md:items-end">
                                <div className="flex flex-col gap-2">
                                    <strong className="text-sm font-semibold text-slate-700">Loại hợp đồng</strong>
                                    <select
                                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                                        value={contractType}
                                        onChange={(e) => setContractType(e.target.value as ContractType)}
                                    >
                                        <option value="service">Cung cấp dịch vụ</option>
                                        <option value="free">Tự do</option>
                                    </select>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chế độ</div>
                                    <div className="mt-1 text-sm font-medium text-slate-800">
                                        {mode === "create" && "Tạo mới"}
                                        {mode === "view" && "Xem"}
                                        {mode === "edit" && "Chỉnh sửa"}
                                        {mode === "viewVersion" && "Phiên bản cũ"}
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[460px] overflow-y-auto pr-1">
                                {contractType === "service" && (
                                    <ServiceContractEdit
                                        contract={focusContract}
                                        setContract={setFocusContract}
                                        mode={mode}
                                        setMode={setMode}
                                        setPayablesReceive={setPayablesReceive}
                                        version={selectedVersion}
                                    />
                                )}
                                {contractType === "free" && (
                                    <FreeContractEdit
                                        contract={focusContract}
                                        setContract={setFocusContract}
                                        mode={mode}
                                        setMode={setMode}
                                        setPayablesReceive={setPayablesReceive}
                                        setPayablesPay={setPayablesPay}
                                        version={selectedVersion}
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Danh sách hợp đồng</h2>
                                <p className="mt-1 text-sm text-slate-500">Tìm nhanh theo tên, đối tác hoặc ngày ký.</p>
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <input
                                type="text"
                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                                placeholder="Tìm kiếm hợp đồng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {contracts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                Không có hợp đồng nào.
                            </div>
                        ) : filteredContracts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                Không tìm thấy hợp đồng phù hợp.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                                {filteredContracts.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${focusContract?.id === contract.id ? "border-cyan-300 bg-cyan-50 shadow-sm" : "border-slate-200 bg-white"}`}
                                        onClick={() => {
                                            if (mode === "edit") return;
                                            setContractType(contract.type);
                                            setFocusContract(contract);
                                            setSelectedVersion(contract.constructs[0]?.version ?? null);
                                            setMode("view");
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-base font-semibold text-slate-900">
                                                    {contract.constructs[0]?.contract.title}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{contract.constructs[0]?.contract.signDate}</span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{contract.constructs[0]?.contract.partner}</span>
                                                    <span className={`rounded-full px-2.5 py-1 font-medium ${getStatusClass(contract.constructs[0]?.contract.status)}`}>{contract.constructs[0]?.contract.status ?? "unknown"}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {contract.constructs.length > 1 && (
                                                    <Popover
                                                        trigger="click"
                                                        content={
                                                            <div className="min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                                                {contract.constructs.map((construct) => (
                                                                    <div
                                                                        key={construct.version}
                                                                        className="cursor-pointer px-3 py-2 text-sm transition hover:bg-cyan-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();

                                                                            setSelectedVersion(construct.version);

                                                                            setMode("viewVersion");
                                                                        }}
                                                                    >
                                                                        Phiên bản {construct.version}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        }
                                                    >
                                                        <span
                                                            className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {getVersionLabel(contract)}
                                                        </span>
                                                    </Popover>
                                                )}

                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    #{contract.id}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <div
                                                className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setContractType(contract.type);
                                                    setFocusContract(contract);
                                                    setSelectedVersion(contract.constructs[0]?.version ?? null);
                                                    setMode("edit");
                                                }}
                                            >
                                                Sửa
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Công nợ</h2>
                            <p className="mt-1 text-sm text-slate-500">Theo dõi lịch thu dự tính và lịch thu thực tế.</p>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {contractType === "service" ? "Chỉ hiển thị công nợ thu" : "Hiển thị công nợ thu và chi"}
                        </span>
                    </div>

                    {contractType === "service" && (
                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4">
                                    <strong className="text-base text-slate-900">Công nợ thu dự tính</strong>
                                    <div className="mt-1 text-sm text-slate-500">Lịch thu dự kiến của hợp đồng.</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                        <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                                            <tr>
                                                <th className="border-b border-slate-200 px-4 py-3">Đối tác</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Số tiền thu</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Thời điểm</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Hạn</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payablesReceive.length === 0 ? (
                                                <tr>
                                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={4}>
                                                        Chưa có dữ liệu công nợ thu.
                                                    </td>
                                                </tr>
                                            ) : (
                                                payablesReceive.map((payable, index) => (
                                                    <tr key={index} className="odd:bg-white even:bg-slate-50/70">
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.partner}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(payable.amount)}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.paytime}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.lastTime}</td>
                                                    </tr>
                                                ))
                                            )}
                                            <tr className="bg-cyan-50/60">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">Tổng</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-cyan-800">{formatCurrency(payablesReceive.reduce((total, p) => total + p.amount, 0))}</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">Số lần thu</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-cyan-800">{payablesReceive.length}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4">
                                    <strong className="text-base text-slate-900">Công nợ thu thực tế</strong>
                                    <div className="mt-1 text-sm text-slate-500">Các khoản thu đã ghi nhận.</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                        <thead className="bg-slate-100 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                                            <tr>
                                                <th className="border-b border-slate-200 px-4 py-3">Đối tác</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Số tiền thu</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Thời điểm</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Hạn</th>
                                                <th className="border-b border-slate-200 px-4 py-3">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {focusContract?.recevices?.length ? (
                                                focusContract.recevices.map((payable, index) => (
                                                    <tr key={index} className="odd:bg-white even:bg-slate-50/70">
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.partner}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(payable.amount)}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.paytime}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{payable.lastTime}</td>
                                                        <td className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">{payable.status}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                                                        Chưa có dữ liệu công nợ thực tế.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {contractType === "free" && (
                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4">
                                    <div className="text-base font-semibold text-slate-900">Công nợ chi</div>
                                    <div className="mt-1 text-sm text-slate-500">Dữ liệu sẽ hiển thị khi kết nối nguồn mua hàng.</div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                    Chưa có dữ liệu công nợ chi.
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-4">
                                    <div className="text-base font-semibold text-slate-900">Công nợ thu</div>
                                    <div className="mt-1 text-sm text-slate-500">Dữ liệu sẽ hiển thị khi có cấu hình công nợ thu.</div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                    Chưa có dữ liệu công nợ thu.
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}