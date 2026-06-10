import { useEffect, useState, useMemo } from "react";
// import { parseNumber } from "../../../utils";
import type { FreeContract, FreeContractPayable, Payable } from "../../../types/ContractDataType";
import type { ContractData } from "../../../types/ContractDataType";
import DocumentEdit from "./DocumentEdit";

type Props = {
    contract: ContractData | null;
    setContract: (contract: ContractData | null) => void;
    version: number | null;
    mode: "create" | "view" | "edit" | "viewVersion";
    setMode: (mode: "create" | "view" | "edit" | "viewVersion") => void;
    setPayablesReceive: (payables: Payable[]) => void;
    setPayablesPay: (payables: Payable[]) => void;
}

export default function FreeContractEdit({contract, setContract, version, mode, setMode, setPayablesReceive, setPayablesPay}: Props) {
    const isReadOnlyMode = mode === "view" || mode === "viewVersion";
    // const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

    const use = () => {
        setPayablesReceive([]);
        setPayablesPay([]);
    }

    const [contractCode, setContractCode] = useState("");
    const [contractName, setContractName] = useState("");
    const [contractContent, setContractContent] = useState("");
    const [signDate, setSignDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [timeLastChange, setTimeLastChange] = useState<"start" | "duration" | "end" | null>(null);
    const [endDate, setEndDate] = useState("");
    const [duration, setDuration] = useState(0);
    const [durationUnit, setDurationUnit] = useState<"day" | "month" | "year">("day");
    const [partner, setPartner] = useState<string[]>([]);
    const [totalTime, setTotalTime] = useState(0);
    const [author, setAuthor] = useState("");

    const [payables, setPayables] = useState<FreeContractPayable[]>([]);

    // const parterOptions = useMemo(() => {
    //     const partnersSet = new Set<string>(
    //         ["Công ty A", "Công ty B", "Công ty C", "Công ty D", "Công ty E"]
    //     );
    //     return Array.from(partnersSet);
    // }, []);
    
    const selectedConstruct = useMemo(() => {
        if (!contract || contract.type !== "free" || contract.constructs.length === 0) {
            return null;
        }

        return contract.constructs.find((item) => item.version === version) ?? contract.constructs[0];
    }, [contract, version]);

    const reset = () => {
        setContractCode("");
        setContractName("");
        setContractContent("");
        setSignDate("");
        setStartDate("");
        setEndDate("");
        setDuration(0);
        setDurationUnit("day");
        setPayables([]);
    }

    useEffect(() => {
        const load = async () => {
            const freeConstruct = selectedConstruct?.contract;

            if (!contract || contract.type !== "free" || !freeConstruct) {
                reset();
                return;
            }

            const freeContract = freeConstruct as FreeContract;

            setContractCode(freeContract.contractCode);
            setContractName(freeContract.title);
            setContractContent(freeContract.contractContent);
            setSignDate(freeContract.signDate);
            setStartDate(freeContract.startDate);
            setEndDate(freeContract.endDate);
            setDuration(freeContract.duration || 0);
            setDurationUnit(freeContract.durationUnit);
            setPayables(freeContract.payments);
        }
        load();
        use();
    }, [contract, selectedConstruct]);

    useEffect(() => {
        // Lấy id từ URL
        // const url = window.location.pathname;
        // const id = url.split("/").pop();

        const getUserDetail = async () => {
            // Lấy tên tài khoản trong phiên làm việc localStorage
            const username = localStorage.getItem("username") || "Nguyễn Văn A";
            setAuthor(username);
        }
        getUserDetail();
    }, [])

    useEffect(() => {
        if (
            timeLastChange !== "start" ||
            !startDate ||
            !duration
        ) {
            return;
        }
        const changeStartDate = () => {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(startDateObj);
            switch (durationUnit) {
                case "day":
                    endDateObj.setDate(startDateObj.getDate() + duration);
                    break;
                case "month":
                    endDateObj.setMonth(startDateObj.getMonth() + duration);
                    break;
                case "year":
                    endDateObj.setFullYear(startDateObj.getFullYear() + duration);
                    break;
            }
            endDateObj.setDate(endDateObj.getDate() - 1);
            setEndDate(endDateObj.toISOString().split("T")[0]);
        }
        changeStartDate();
    }, [
        timeLastChange,
        startDate,
        duration,
        durationUnit
    ]);

    useEffect(() => {
        if (
            timeLastChange !== "duration" ||
            !startDate ||
            !duration
        ) {
            return;
        }
        const changeEndDate = () => {
            const startDateObj = new Date(startDate);
            const endDate = new Date(startDateObj);

            switch (durationUnit) {
                case "day":
                    endDate.setDate(endDate.getDate() + duration);
                    break;
                case "month":
                    endDate.setMonth(endDate.getMonth() + duration);
                    break;
                case "year":
                    endDate.setFullYear(endDate.getFullYear() + duration);
                    break;
            }
            endDate.setDate(endDate.getDate() - 1);

            setEndDate(endDate.toISOString().split("T")[0]);
        }
        changeEndDate();
    }, [
        timeLastChange,
        startDate,
        duration,
        durationUnit
    ]);

    useEffect(() => {
        if (
            timeLastChange !== "end" ||
            !startDate ||
            !endDate
        ) {
            return;
        }

        const changeDuration = () => {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            const duration = Math.ceil(
                ((endDateObj.getTime() - startDateObj.getTime()) /
                (1000 * 60 * 60 * 24) + 1)
            );
            setDurationUnit("day");
            setDuration(duration);
        }
        changeDuration();
    }, [
        timeLastChange,
        startDate,
        endDate
    ]);

    useEffect(() => {
        console.log(totalTime);
        const updateTotalTime = () => {
            if (!startDate || !endDate) {
                setTotalTime(0);
                return;
            }

            if (durationUnit === "day") {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
                const totalDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24) + 1);
                setTotalTime(totalDays);
            } else if (durationUnit === "month") {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
                const totalMonths = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + (endDateObj.getMonth() - startDateObj.getMonth()) + 1;
                setTotalTime(totalMonths);
            } else if (durationUnit === "year") {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
                const totalYears = endDateObj.getFullYear() - startDateObj.getFullYear() + 1;
                setTotalTime(totalYears);
            }
        }
        updateTotalTime();
    }, [startDate, endDate, durationUnit]);

    const freeContract = useMemo<FreeContract>(() => ({
        contractCode,
        title: contractName,
        contractContent,
        signDate,
        startDate,
        duration,
        durationUnit,
        endDate,
        partner: partner,
        department: "",
        status: "pending",
        payments: payables,
        documents: []
    }), [
        contractCode,
        contractName,
        contractContent,
        signDate,
        startDate,
        duration,
        durationUnit,
        endDate,
        partner,
        payables
    ]);

    return (
        <div className="space-y-6">
            <div>
                <DocumentEdit contractCode={freeContract.contractCode} mode={mode}/>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mã hợp đồng</div>
                    <div className="mt-2 text-base font-bold text-slate-900">{freeContract.contractCode || "Chưa có mã"}</div>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Tổng sau thuế</div>
                    <div className="mt-2 text-base font-bold text-cyan-950">{ } VND</div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Lịch thu</div>
                    <div className="mt-2 text-base font-bold text-emerald-950">{freeContract.payments.length} đợt</div>
                </div>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Thông tin chung</h3>
                        <p className="mt-1 text-sm text-slate-500">Các trường cơ bản của hợp đồng dịch vụ.</p>
                    </div>
                    {isReadOnlyMode && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {freeContract.status === "active" ? "Đang hoạt động" : freeContract.status === "pending" ? "Chờ duyệt" : "Đã hết hạn"}
                        </span>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Mã hợp đồng</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={contractCode} onChange={(e) => setContractCode(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">Tên hợp đồng</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={contractName} onChange={(e) => setContractName(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700">Nội dung</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={contractContent} onChange={(e) => setContractContent(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Đối tác thuê dịch vụ</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={partner.join(", ")} onChange={(e) => setPartner(e.target.value.split(",").map((item) => item.trim()))} placeholder="Nhập tên đối tác, cách nhau bằng dấu phẩy" />
                        <div>Thêm đối tác</div>
                        <ul className="mt-1 list-disc pl-5 text-sm text-slate-500">
                            {partner.map((item, index) => (
                                <li key={index}>{item} <div className="text-red-500 cursor-pointer" onClick={() => setPartner(partner.filter((_, i) => i !== index))}>X</div></li>
                            ))}
                        </ul>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Người soạn</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={author} onChange={(e) => setAuthor(e.target.value)} />
                    </label>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900">Thời gian và giá trị</h3>
                    <p className="mt-1 text-sm text-slate-500">Những trường quyết định kỳ thanh toán và tổng tiền.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày ký</span>
                        <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={signDate} onChange={(e) => setSignDate(e.target.value)} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày bắt đầu</span>
                        <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={startDate} onChange={(e) => {
                            setTimeLastChange("start");
                            setStartDate(e.target.value);
                        }} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày hết hạn</span>
                        <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={endDate} onChange={(e) => {
                            setEndDate(e.target.value);
                            setTimeLastChange("end");
                        }} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Thời hạn</span>
                        <div className="flex items-center gap-2">
                            <input type="number" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" min={1} disabled={isReadOnlyMode} value={duration} onChange={(e) => {
                                setDuration(parseInt(e.target.value));
                                setTimeLastChange("duration");
                            }} />
                            <select className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={isReadOnlyMode} value={durationUnit} onChange={(e) => {
                                setDurationUnit(e.target.value  as "day" | "month" | "year");
                                setTimeLastChange("duration");
                            }}>
                                <option value="day">Ngày</option>
                                <option value="month">Tháng</option>
                                <option value="year">Năm</option>
                            </select>
                        </div>
                    </label>
                    
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng trước thuế</div>
                        <div className="mt-2 text-base font-bold text-slate-900">{ } VND</div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Tổng sau thuế</div>
                        <div className="mt-2 text-base font-bold text-emerald-950">{ } VND</div>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900">Lịch thu và trạng thái</h3>
                    <p className="mt-1 text-sm text-slate-500">Thông tin phát sinh dựa trên các tham số hiện tại.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-700">Lịch thu dự kiến</div>
                        <div className="mt-2 text-sm text-slate-500">{payables.length ? `${payables.length} khoản thu đã được tính.` : "Chưa có khoản thu nào."}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-700">Trạng thái hợp đồng</div>
                        <div className="mt-2 text-sm text-slate-500">{ }</div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                {mode === "create" && (
                    <button 
                        className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                        onClick={() => {
                            const contractData: ContractData = {
                                type: "service",
                                id: Date.now(),
                                constructs: [{
                                    version: 1,
                                    contract: freeContract
                                }],
                                recevices: [],
                                debts: []
                            };

                            setContract(contractData);
                        }}
                    >
                        Lưu hợp đồng mới
                    </button>
                )}

                {mode === "view" && (
                    <>
                        <button 
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                            onClick={() => {
                                setMode("edit");
                            }}
                        >
                            Sửa thông tin
                        </button>
                        <button 
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            onClick={() => {
                                setContract(null);

                                setMode("create");
                            }}
                        >
                            Tạo hợp đồng mới
                        </button>
                    </>
                )}

                {mode === "edit" && (
                    <>
                        <button 
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            onClick={() => {
                                // Gọi API để cập nhật thông tin đối tác
                            }}
                        >
                            Cập nhật
                        </button>
                        <button 
                            className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                            onClick={() => {
                                setMode("view");
                            }}
                        >
                            Hủy thay đổi
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
