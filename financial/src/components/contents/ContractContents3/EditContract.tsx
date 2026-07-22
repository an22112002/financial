import { useState, useEffect } from "react";
import type { Contract, Moment, Payable, Partner, Document, FinishMoment } from "../../../types/ContractData3";
import { Modal, Select} from "antd";
import { GetContractUtils } from "../../../api/util";
import type { ContractUtilsResponse, Bank } from "../../../api/util";
// import { isPartnerJoin } from "../../../utils/contractUtils";
import { openNotification } from "../../../utils/index";
import DocumentEdit from "./DocumentEdit";
import ViewContractPayable from "./ViewContractPayable.tsx";
import { BACKEND_SERVER } from "../../../api/configAPI"; 

import { CreateContract, UpdateContract } from "../../../api/contract";

// import { useNavigate } from "react-router-dom";

type Props = {
    mode: "view" | "create" | "edit";
    setMode: React.Dispatch<React.SetStateAction<"view" | "create" | "edit">>;
    contract: Contract | null;
}

export default function EditContract({ contract, mode, setMode }: Props) {
    // const navigate = useNavigate();

    const [ourSide, setOurSide] = useState("");
    const [departmentID, setDepartmentID] = useState("");

    const [openInsertOnePayableModal, setOpenInsertOnePayableModal] = useState(false);
    const [openInsertCyclePayableModal, setOpenInsertCyclePayableModal] = useState(false);
    // Thông số form
    const [focusPayable, setFocusPayable] = useState<Payable | null>(null);

    const [contractCode, setContractCode] = useState("");
    const [contractTitle, setContractTitle] = useState("");
    const [contractNumber, setContractNumber] = useState("");
    const [signDate, setSignDate] = useState<Date>(new Date());
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [contractContent, setContractContent] = useState("");
    const [partners, setPartners] = useState<Partner[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    const [finishDateType, setFinishDateType] = useState<"date" | "forever">("date");
    const [finishDateValue, setFinishDateValue] = useState<string>(""); // lưu giá trị ngày kết thúc khi type là "date"
    const [finishConditionValue, setFinishConditionValue] = useState<string>(""); // lưu giá trị điều kiện kết thúc khi type là "forever"

    // Thông số form tạo/sửa đối tác
    const [banks, setBanks] = useState<Bank[]>([]);

    const [openInsertOnePartnerModal, setOpenInsertOnePartnerModal] = useState(false);

    const [partnerName, setPartnerName] = useState<string>("");
    const [partnerAddress, setPartnerAddress] = useState<string>("");
    const [partnerPhone, setPartnerPhone] = useState<string>("");
    const [partnerTaxCode, setPartnerTaxCode] = useState<string>("");
    const [partnerBankAccount, setPartnerBankAccount] = useState<string>("");
    const [partnerBankID, setPartnerBankID] = useState<string>("");

    const resetPartnerForm = () => {
        setPartnerName("");
        setPartnerAddress("");
        setPartnerPhone("");
        setPartnerTaxCode("");
        setPartnerBankAccount("");
        setPartnerBankID("");
    };

    // Thông số form tạo/sửa khoản thu/chi
    const [payableType, setPayableType] = useState<"receive" | "pay">("receive");
    const [payableAmount, setPayableAmount] = useState<number>(0);
    const [payableTax, setPayableTax] = useState<number>(0);
    const [payableLateFee, setPayableLateFee] = useState<number>(0);
    const [payablePartner, setPayablePartner] = useState<string>("");
    const [payableMomentType, setPayableMomentType] = useState<"date" | "condition">("date");
    const [payableNote, setPayableNote] = useState<string>("");
    const [payableDate, setPayableDate] = useState<Date | null>(null);
    const [payableCondition, setPayableCondition] = useState<string>("");
    const [payableNeedDocument, setPayableNeedDocument] = useState<boolean>(false);
    const [payableDelay, setPayableDelay] = useState<number>(0);

    const resetPayableForm = () => {
        setPayableType("receive");
        setPayableAmount(0);
        setPayableTax(0);
        setPayableLateFee(0);
        setPayablePartner("");
        setPayableMomentType("date");
        setPayableNote("");
        setPayableDate(null);
        setPayableCondition("");
        setPayableNeedDocument(false);
        setPayableDelay(0);
    };

    // load dữ liệu công nợ vào để edit
    useEffect(() => {
        const reloadPayableForm = () => {
            if (focusPayable) {
                setPayableType(focusPayable.type);
                setPayableAmount(focusPayable.amount);
                setPayableTax(focusPayable.tax);
                setPayableLateFee(focusPayable.lateFee);
                setPayablePartner(focusPayable.partner);
                setPayableNote(focusPayable.note);
                if (focusPayable.moment.type === "date") {
                    setPayableMomentType("date");
                    setPayableDate(focusPayable.moment.date ? new Date(focusPayable.moment.date) : null);
                    setPayableDelay(focusPayable.moment.delay);
                } else {
                    setPayableMomentType("condition");
                    setPayableCondition(focusPayable.moment.condition || "");
                    setPayableDelay(focusPayable.moment.delay);
                    setPayableNeedDocument(focusPayable.moment.needDocument || false);
                }
            }
        }
        reloadPayableForm();
    }, [focusPayable]);
    // Thông số form tạo chuỗi thu/chi có chu kỳ sẽ được thêm sau
    const [cyclePayableType, setCyclePayableType] = useState<"receive" | "pay">("receive");
    const [cyclePayableAmount, setCyclePayableAmount] = useState<number>(0);
    const [cyclePayableTax, setCyclePayableTax] = useState<number>(0);
    const [cyclePayablePartner, setCyclePayablePartner] = useState<Partner | null>(null);
    const [cyclePayableNote, setCyclePayableNote] = useState<string>("");
    const [cycleDateBegin, setCycleDateBegin] = useState<Date>(new Date());
    const [cycleDurationUnit, setCycleDurationUnit] = useState<"day" | "month" | "year">("month");
    const [cycleDuration, setCycleDuration] = useState<number>(1);
    const [cycleCount, setCycleCount] = useState<number>(1);
    const [cycleDelay, setCycleDelay] = useState<number>(0);
    const [cycleLateFee, setCycleLateFee] = useState<number>(0);
    const [cycleCollectionMethod, setCycleCollectionMethod] = useState<"atBegin" | "atEnd">("atBegin");

    const resetCyclePayableForm = () => {
        setCyclePayableType("receive");
        setCyclePayableAmount(0);
        setCyclePayableTax(0);
        setCyclePayablePartner(null);
        setCyclePayableNote("");
        setCycleCollectionMethod("atBegin");
        setCycleDateBegin(new Date());
        setCycleDurationUnit("month");
        setCycleDuration(1);
        setCycleCount(1);
        setCycleDelay(0);
        setCycleLateFee(0);
    };
    useEffect(() => {
        const resetForm = () => {
            const today = new Date();
            // reset form về mặc định khi chuyển sang mode "create"
            // code mặc định vd: ngày 2/6/2020 -> mã 020620
            setContractCode(`${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getFullYear()}`);
            setContractTitle("");
            setContractNumber("");
            setSignDate(today);
            setContractContent("");
            setPartners([]);
            setPayables([]);
            setDocuments([]);
        }
        const loadForm = (contract: Contract) => {
            setContractCode(contract.contractCode);
            setContractTitle(contract.title);
            setContractNumber(contract.contractNumber);
            setSignDate(new Date(contract.signDate));
            setStartDate(new Date(contract.startDate));
            setFinishDateType(contract.finishDate.type);
            setFinishDateValue(contract.finishDate.type === "date" ? contract.finishDate.date || "" : "");
            setContractContent(contract.contractContent);
            setPartners(contract.partners);
            setPayables(contract.payables);
            setDocuments(contract.documents);
        }
        if (mode === "create") {
            resetForm();
        } else if (mode === "edit" && contract) {
            loadForm(contract);
        } else if (mode === "view" && contract) {
            loadForm(contract);
        }
    }, [mode, contract]);

    useEffect(() => {
        const loadDepartmentID = () => {
            const departmentID = localStorage.getItem("selectedDepartmentID");
            if (departmentID) {
                setDepartmentID(departmentID);
            } else {
                window.alert("Không tìm thấy thông tin bộ phận. Vui lòng đăng nhập lại.");
            }
        }
        loadDepartmentID();
    }, []);

    // sắp xếp các hàng thu/chi
    const [sortType, setSortType] = useState<TableRowSortedType>("dayPayment");
    const [shownPayables, setShownPayables] = useState<Payable[]>([]);

    useEffect(() => {
        const sorting = () => {
            const sortedPayables = [...payables];
            const x = renderSortedPayables(sortType, sortedPayables);
            setShownPayables(x); 
        }
        sorting();
    }, [sortType, payables]);

    // hiển thị cột
    const [showPayableColumnsOpen, setShowPayableColumnsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<TableColumnKey, boolean>>({
        receive: false,
        pay: false,
        amount: true,
        tax: true,
        total: true,
        moment: true,
        note: true,
        lateFee: false,
        latePay: false,
    });

    // Lấy dữ liệu công ty để hiển thị trong form
    useEffect(() => {
        const loadContractUtils = async () => {
            const utils: ContractUtilsResponse | null = await GetContractUtils();
            if (utils) {
                setOurSide(utils.ourSide);
                setBanks(utils.banks);
            }
        }
        loadContractUtils();
    }, []);

    const addPayable = async () => {
        if (!isPayableFormValid()) {
            openNotification("warning", "Vui lòng điền đầy đủ thông tin khoản thu/chi");
            return;
        }
        let moment: Moment;
        if (payableMomentType === "date") {
            moment = {
                type: "date",
                date: payableDate ? payableDate.toISOString().split("T")[0] : null,
                needDocument: payableNeedDocument,
                delay: payableDelay,
                condition: ""
            }
        } else {
            moment = {
                type: "condition",
                condition: payableCondition,
                needDocument: payableNeedDocument,
                delay: payableDelay,
                date: null
            }
        }
        setPayables([...payables, {
            type: payableType,
            amount: payableAmount,
            partner: payablePartner,
            tax: payableTax,
            lateFee: payableLateFee,
            note: payableNote,
            moment: moment
        }]);
        resetPayableForm();
        setOpenInsertOnePayableModal(false);
    }

    const updatePayable = async () => {
        let moment: Moment;
            if (payableMomentType === "date") {
                moment = {
                    type: "date",
                    date: payableDate ? payableDate.toISOString().split("T")[0] : null,
                    needDocument: payableNeedDocument,
                    delay: payableDelay,
                    condition: ""
                }
            } else {
                moment = {
                    type: "condition",
                    condition: payableCondition,
                    needDocument: payableNeedDocument,
                    delay: payableDelay,
                    date: null
                }
            }
            const updatedPayable: Payable = {
                type: payableType,
                amount: payableAmount,
                partner: payablePartner,
                tax: payableTax,
                lateFee: payableLateFee,
                note: payableNote,
                moment: moment
            };
            setPayables(payables.map(p => p === focusPayable ? updatedPayable : p));
    }

    const isPayableFormValid = () => {
        if (!payablePartner) return false;
        if (payableAmount === 0) return false;
        if (payableMomentType === "date" && !payableDate) return false;
        if (payableMomentType === "condition" && !payableCondition.trim()) return false;
        return true;
    };

    const isCyclePayableFormValid = () => {
        if (!cyclePayablePartner) return false;
        if (cyclePayableAmount === 0) return false;
        if (cyclePayableTax < 0) return false;
        if (cycleCount < 1) return false;
        if (cycleDuration < 1) return false;
        if (!cycleDateBegin) return false;
        if (!cyclePayableNote.trim() && cyclePayableNote !== "") return false;
        return true;
    };

    const isFormValid = async () => {
        if (!contractCode.trim()) return false;
        if (!contractNumber.trim()) return false;
        if (!contractTitle.trim()) return false;
        if (!signDate) return false;
        if (!startDate) return false;
        if (finishDateType === "date" && !finishDateValue) return false;
        if (finishDateType === "forever" && !finishConditionValue.trim()) return false;
        if (partners.length === 0) return false;
        if (payables.length === 0) return false;
        return true;
    };

    const handleCreateContract = async () => {
        if (! await isFormValid()) {
            alert("Vui lòng điền đầy đủ thông tin hợp đồng");
            return;
        }
        const finishDate: FinishMoment = finishDateType === "date" ? {
            type: "date",
            date: finishDateValue || null
        } : {
            type: "forever",
            condition: finishConditionValue || null
        };
        if (finishDateType === "date" && finishDateValue && new Date(finishDateValue) < startDate) {
            alert("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
            return;
        }
        const newContract: Contract = {
            contractID: "", // ID sẽ được tạo bởi backend
            contractCode: contractCode,
            contractNumber: contractNumber,
            departmentID: departmentID,
            title: contractTitle,
            contractContent: contractContent,
            signDate: signDate.toISOString().split("T")[0],
            startDate: startDate.toISOString().split("T")[0],
            finishDate: finishDate,
            status: "waiting",
            userEdit: "", // sẽ được set bởi backend
            partners: partners,
            payables: payables,
            documents: documents
        };
        const created = await CreateContract(newContract);
        if (created) {
            setMode("view");
        }
    }

    const handleUpdateContract = async () => {
        if (!contract) {
            alert("Không có hợp đồng để cập nhật");
            return;
        }
        if (! await isFormValid()) {
            alert("Vui lòng điền đầy đủ thông tin hợp đồng");
            return;
        }
        const finishDate: FinishMoment = finishDateType === "date" ? {
            type: "date",
            date: finishDateValue || null
        } : {
            type: "forever",
            condition: finishConditionValue || null
        };
        if (finishDateType === "date" && finishDateValue && new Date(finishDateValue) < startDate) {
            alert("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
            return;
        }
        const updateContract: Contract = {
            contractID: contract.contractID,
            contractCode: contract.contractCode,
            contractNumber: contract.contractNumber,
            departmentID: departmentID,
            title: contract.title,
            contractContent: contractContent,
            signDate: contract.signDate,
            startDate: contract.startDate,
            finishDate: finishDate,
            status: contract.status,
            userEdit: "", // sẽ được set bởi backend
            partners: partners,
            payables: payables,
            documents: documents
        };
        const updated = await UpdateContract(updateContract);
        if (updated) {
            setMode("view");
        }
    }

    return (
        <div className="w-full flex flex-col">
            <div className="w-full flex flex-col md:flex-row gap-2 mb-4">
                {/* Form tạo/sửa hợp đồng */}
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                    <h2 className="text-lg font-bold mb-2 col-span-2">Thông tin hợp đồng</h2>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Mã hợp đồng</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={mode !== "create"} value={contractCode} onChange={(e) => setContractCode(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Số hợp đồng</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={mode !== "create"} value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Tên hợp đồng</span>
                        <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" disabled={mode !== "create"} value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày ký</span>
                        <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={signDate ? signDate.toISOString().split("T")[0] : ""} onChange={(e) => setSignDate(e.target.value ? new Date(e.target.value) : new Date())} disabled={mode !== "create"} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày bắt đầu</span>
                        <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={startDate ? startDate.toISOString().split("T")[0] : ""} onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : new Date())} disabled={mode !== "create"} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Ngày kết thúc</span>
                        <select className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={finishDateType} onChange={(e) => setFinishDateType(e.target.value as "date" | "forever")} disabled={mode === "view"}>
                            <option value="date">Ngày cụ thể</option>
                            <option value="forever">Vô thời hạn</option>
                        </select>
                        {finishDateType === "date" ? (
                            <input type="date" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={finishDateValue} onChange={(e) => {
                                setFinishDateValue(e.target.value);
                            }} disabled={mode === "view"} />
                        ) : null}
                        {finishDateType === "forever" ? (
                            <input type="text" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={finishConditionValue} onChange={(e) => {
                                setFinishConditionValue(e.target.value);
                            }} disabled={mode === "view"} placeholder="Nhập điều kiện kết thúc hợp đồng, nếu có" />
                        ) : null}
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Nội dung hợp đồng</span>
                        <textarea className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 h-32 resize-none" value={contractContent} onChange={(e) => setContractContent(e.target.value)} disabled={mode === "view"} />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700">Các bên liên quan</span>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" onClick={() => {
                            resetPartnerForm();
                            setOpenInsertOnePartnerModal(true);
                        }}>Thêm đối tác</button>
                    </label>
                    <Modal title="Thêm đối tác mới"
                        open={openInsertOnePartnerModal}
                        width={800}
                        onCancel={() => { resetPartnerForm(); setOpenInsertOnePartnerModal(false) }}
                        footer={null}>
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Tên đối tác</span>
                                <input type="text" className="border border-gray-300 rounded px-2 py-1" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Địa chỉ</span>
                                <input type="text" className="border border-gray-300 rounded px-2 py-1" value={partnerAddress} onChange={(e) => setPartnerAddress(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
                                <input type="text" className="border border-gray-300 rounded px-2 py-1" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Mã số thuế</span>
                                <input type="text" className="border border-gray-300 rounded px-2 py-1" value={partnerTaxCode} onChange={(e) => setPartnerTaxCode(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Số tài khoản ngân hàng</span>
                                <input type="text" className="border border-gray-300 rounded px-2 py-1" value={partnerBankAccount} onChange={(e) => setPartnerBankAccount(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-slate-700">Ngân hàng</span>
                                <Select
                                    showSearch
                                    value={partnerBankID}
                                    onChange={setPartnerBankID}
                                    style={{ width: "100%" }}
                                    options={banks.map(bank => ({
                                        value: bank.bankID,
                                        label: (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={`${BACKEND_SERVER}${bank.icon}`}
                                                    className="w-6 h-5"
                                                    alt={bank.bankShortName}
                                                />
                                                <span>{bank.bankShortName} - {bank.name}</span>
                                            </div>
                                        ),
                                        bank // lưu object để dùng trong filter
                                    }))}
                                    filterOption={(input, option) => {
                                        const bank = option?.bank as Bank;

                                        return (
                                            bank.name.toLowerCase().includes(input.toLowerCase()) ||
                                            bank.bankShortName.toLowerCase().includes(input.toLowerCase())
                                        );
                                    }}
                                />
                            </label>
                            <div className="w-full text-center bg-green-700 hover:bg-green-500 text-white px-4 py-2 rounded cursor-pointer col-span-2" onClick={() => {
                                if (!partnerName.trim()) {
                                    openNotification("warning", "Vui lòng nhập tên đối tác");
                                    return;
                                }
                                const newPartner: Partner = {
                                    name: partnerName,
                                    address: partnerAddress,
                                    phone: partnerPhone,
                                    taxCode: partnerTaxCode,
                                    bankAccount: partnerBankAccount,
                                    bankID: partnerBankID
                                };
                                setPartners([...partners, newPartner]);
                                resetPartnerForm();
                                setOpenInsertOnePartnerModal(false);
                            }}>
                                Thêm đối tác
                            </div>
                        </div>
                    </Modal>

                    <div>
                        <DocumentEdit mode={mode} documents={documents} setDocuments={setDocuments} parentCode={contractCode} forParent="contract" />
                    </div>
                    
                    <div className="col-span-2">
                        {mode === "create" && 
                        <div className="w-full h-max-[1.2rem] text-center bg-blue-700 hover:bg-blue-500 text-white px-4 py-2 rounded cursor-pointer col-span-2" onClick={async () => {await handleCreateContract()}}>
                            Tạo hợp đồng
                        </div>}

                        {mode === "view" && 
                        <div className="w-full text-center bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer col-span-2" onClick={() => setMode("edit")}>
                            Sửa hợp đồng
                        </div>}

                        {mode === "edit" && 
                        <div className="w-full text-center bg-green-700 hover:bg-green-500 text-white px-4 py-2 rounded cursor-pointer col-span-2" onClick={async () => {await handleUpdateContract()}}>
                            Lưu hợp đồng
                        </div>}
                    </div>
                    

                    
                </div>
                {/* Danh sách khoản thu/chi của hợp đồng */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-lg font-bold mb-2">Danh sách thu/chi</h2>
                    <Modal title="Thêm khoản thu/chi mới" 
                        open={ openInsertOnePayableModal } 
                        width={800}
                        onCancel={() => {resetPayableForm(); setOpenInsertOnePayableModal(false)}} 
                        footer={null}>
                        <div className="flex flex-col gap-4">
                            <span className="text-sm text-slate-500"><strong>Khoản thanh toán và đối tác</strong></span>
                            <label className="grid grid-cols-2 gap-4 flex-col md:flex-row">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Loại khoản thu/chi</span>
                                    <select className="border border-gray-300 rounded px-2 py-1"
                                        disabled={mode === "view"}
                                        value={payableType} onChange={(e) => setPayableType(e.target.value as "receive" | "pay")}>
                                        <option value="receive">Khoản thu</option>
                                        <option value="pay">Khoản chi</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Đối tác</span>
                                    <select className="border border-gray-300 rounded px-2 py-1"
                                        disabled={mode === "view"}
                                        value={payablePartner} onChange={(e) => setPayablePartner(e.target.value)}>
                                        <option value="">Chọn đối tác</option>
                                        {partners.map((p, index) => (
                                            <option key={index} value={p.name}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {payableType === "receive" ? 
                                    <div className="flex flex-row justify-between gap-1">
                                        <span className="text-sm text-slate-500">Bên thu: {ourSide}</span>
                                        <span className="text-sm text-slate-500">Bên chi: {payablePartner}</span>
                                    </div>
                                    :
                                    <div className="flex flex-row justify-between gap-1">
                                        <span className="text-sm text-slate-500">Bên thu: {payablePartner}</span>
                                        <span className="text-sm text-slate-500">Bên chi: {ourSide}</span>
                                    </div>
                                }
                            </label>
                            <span className="text-sm text-slate-500"><strong>Thông tin khoản thanh toán</strong></span>
                            <label className="grid grid-cols-2 gap-4 flex-col md:flex-row">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Số tiền</span>
                                    <input type="number" min="0" step="1000" placeholder="Số tiền" className="border border-gray-300 rounded px-2 py-1" 
                                        disabled={mode === "view"}
                                        value={payableAmount} onChange={(e) => setPayableAmount(parseFloat(e.target.value) || 0)} />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Thuế (%)</span>
                                    <input type="number" min="0" step="0.001" placeholder="Thuế (%)" className="border border-gray-300 rounded px-2 py-1" 
                                        disabled={mode === "view"}
                                        value={payableTax} onChange={(e) => setPayableTax(parseFloat(e.target.value) || 0)} />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Phí trễ (%/năm)</span>
                                    <input type="number" min="0" step="0.001" placeholder="Phí trễ (%/năm)" className="border border-gray-300 rounded px-2 py-1" 
                                        disabled={mode === "view"}
                                        value={payableLateFee} onChange={(e) => setPayableLateFee(parseFloat(e.target.value) || 0)} />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Ghi chú</span>
                                    <input type="text" placeholder="Ghi chú" className="border border-gray-300 rounded px-2 py-1" 
                                        disabled={mode === "view"}
                                        value={payableNote} onChange={(e) => setPayableNote(e.target.value)} />
                                </label>
                            </label>
                            <span className="text-sm text-slate-500"><strong>Thông tin thời điểm thanh toán</strong></span>
                            <label className="flex flex-col gap-2">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Ngày {payableType === "receive" ? "thu" : "chi"} hoặc điều kiện {payableType === "receive" ? "thu" : "chi"}</span>
                                    <select className="border border-gray-300 rounded px-2 py-1"
                                        disabled={mode === "view"}
                                        value={payableMomentType} onChange={(e) => setPayableMomentType(e.target.value as "date" | "condition")}>
                                        <option value="date">Ngày cụ thể</option>
                                        <option value="condition">Điều kiện cụ thể</option>
                                    </select>
                                </label>
                                {payableMomentType === "date" ? (
                                    <div>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-700">Ngày {payableType === "receive" ? "thu" : "chi"} thực tế</span>
                                            <input type="date" className="border border-gray-300 rounded px-2 py-1" 
                                                disabled={mode === "view"}
                                                value={payableDate ? payableDate.toISOString().split('T')[0] : ''} 
                                                onChange={(e) => setPayableDate(e.target.value ? new Date(e.target.value) : null)} />
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-700">Hạn thanh toán (số ngày thanh toán chậm)</span>
                                            <input type="number" min="0" step="1" placeholder="Số ngày trễ" className="border border-gray-300 rounded px-2 py-1" 
                                                disabled={mode === "view"}
                                                value={payableDelay} onChange={(e) => setPayableDelay(parseInt(e.target.value) || 0)} />
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-700">Điều kiện thực hiện</span>
                                            <input type="text" className="border border-gray-300 rounded px-2 py-1" placeholder="VD: Sau khi nhận hồ sơ bàn giao, Sau khi nghiệm thu..." 
                                                disabled={mode === "view"}
                                                value={payableCondition} onChange={(e) => setPayableCondition(e.target.value)} />
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-600">Có cần tài liệu xác thực không?</span>
                                            <div className="flex flex-row items-center gap-2">
                                                <input type="checkbox" className="border border-gray-300 rounded px-2 py-1" 
                                                    disabled={mode === "view"}
                                                    checked={payableNeedDocument} onChange={(e) => setPayableNeedDocument(e.target.checked)} />
                                                <span className="text-sm text-slate-500">{payableNeedDocument ? "Có" : "Không"}</span>
                                            </div>
                                            
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm font-semibold text-slate-700">Hạn thanh toán (số ngày thanh toán chậm)</span>
                                            <input type="number" min="0" step="1" placeholder="Số ngày trễ" className="border border-gray-300 rounded px-2 py-1" 
                                                disabled={mode === "view"}
                                                value={payableDelay} onChange={(e) => setPayableDelay(parseInt(e.target.value) || 0)} />
                                        </label>
                                    </div>
                                )}
                            </label>
                            {/* Thêm khoản thu/chi vào danh sách */}
                            {focusPayable === null ? (
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={async () => {
                                    await addPayable();
                                }}>
                                    Thêm
                                </button>
                            ) : (
                                <div>
                                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={ async () => {
                                        await updatePayable();
                                        resetPayableForm();
                                        setFocusPayable(null);
                                        setOpenInsertOnePayableModal(false);
                                    }}>
                                        Lưu
                                    </button>
                                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2" onClick={() => {
                                        setPayables(payables.filter(p => p !== focusPayable));
                                        resetPayableForm();
                                        setFocusPayable(null);
                                        setOpenInsertOnePayableModal(false);
                                    }}>
                                        Hủy
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    </Modal>
                    {mode === "create" || mode === "edit" ? (
                        <>
                            <div className="w-full text-center bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer mb-4" onClick={() => {
                                setOpenInsertOnePayableModal(true);
                            }}>
                                Thêm 1 khoản thu/chi mới
                            </div>

                            <Modal title="Thêm chuỗi khoản thu/chi có chu kỳ" 
                                open={ openInsertCyclePayableModal } 
                                onCancel={() => {setOpenInsertCyclePayableModal(false)}}
                                footer={null}>
                                <div className="flex flex-col gap-4">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Loại khoản thu/chi</span>
                                        <select className="border border-gray-300 rounded px-2 py-1"
                                            value={cyclePayableType} onChange={(e) => setCyclePayableType(e.target.value as "receive" | "pay")}>
                                            <option value="receive">Khoản thu</option>
                                            <option value="pay">Khoản chi</option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Đối tác</span>
                                        <select className="border border-gray-300 rounded px-2 py-1"
                                            disabled={partners.length === 0}
                                            value={cyclePayablePartner?.partnerID || cyclePayablePartner?.name || ""}
                                            onChange={(e) => {
                                                const partner = partners.find((p) => (p.partnerID || p.name) === e.target.value);
                                                setCyclePayablePartner(partner || null);
                                            }}>
                                            <option value="">Chọn đối tác</option>
                                            {partners.map((partner, index) => (
                                                <option key={partner.partnerID || `${partner.name}-${index}`} value={partner.partnerID || partner.name}>
                                                    {partner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    {cyclePayableType === "receive" ?
                                        <div className="flex flex-row justify-between gap-1">
                                            <span className="text-sm text-slate-500">Bên thu: {ourSide}</span>
                                            <span className="text-sm text-slate-500">Bên chi: {cyclePayablePartner?.name || ""}</span>
                                        </div>
                                        :
                                        <div className="flex flex-row justify-between gap-1">
                                            <span className="text-sm text-slate-500">Bên thu: {cyclePayablePartner?.name || ""}</span>
                                            <span className="text-sm text-slate-500">Bên chi: {ourSide}</span>
                                        </div>
                                    }
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Số tiền mỗi kỳ</span>
                                        <input type="number" min="0" step="1000" placeholder="Số tiền" className="border border-gray-300 rounded px-2 py-1"
                                            value={cyclePayableAmount} onChange={(e) => setCyclePayableAmount(parseFloat(e.target.value) || 0)} />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Thuế (%)</span>
                                        <input type="number" min="0" step="0.001" placeholder="Thuế (%)" className="border border-gray-300 rounded px-2 py-1"
                                            value={cyclePayableTax} onChange={(e) => setCyclePayableTax(parseFloat(e.target.value) || 0)} />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Ghi chú</span>
                                        <input type="text" placeholder="Ghi chú" className="border border-gray-300 rounded px-2 py-1"
                                            value={cyclePayableNote} onChange={(e) => setCyclePayableNote(e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Ngày bắt đầu</span>
                                        <input type="date" className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleDateBegin ? cycleDateBegin.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setCycleDateBegin(new Date(e.target.value))} />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Thời gian 1 kỳ</span>
                                        <input type="number" min="0" step="1" placeholder="Thời gian 1 kỳ" className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleDuration} onChange={(e) => setCycleDuration(parseInt(e.target.value) || 0)} />
                                        <select className="border border-gray-300 rounded px-2 py-1 mt-1"
                                            value={cycleDurationUnit} onChange={(e) => setCycleDurationUnit(e.target.value as "day" | "month" | "year")}>
                                            <option value="day">Ngày</option>
                                            <option value="month">Tháng</option>
                                            <option value="year">Năm</option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Số kỳ</span>
                                        <input type="number" min="1" step="1" placeholder="Số kỳ" className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleCount} onChange={(e) => setCycleCount(parseInt(e.target.value) || 0)} />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Thời điểm thanh toán trong kỳ</span>
                                        <select className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleCollectionMethod} onChange={(e) => setCycleCollectionMethod(e.target.value as "atBegin" | "atEnd")}>
                                            <option value="atBegin">Vào đầu kỳ</option>
                                            <option value="atEnd">Vào cuối kỳ</option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Hạn thanh toán (số ngày thanh toán chậm)</span>
                                        <input type="number" min="0" step="1" placeholder="Số ngày trễ" className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleDelay} onChange={(e) => setCycleDelay(parseInt(e.target.value) || 0)} />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700">Phí trễ (%/năm)</span>
                                        <input type="number" min="0" step="0.01" placeholder="Phí trễ" className="border border-gray-300 rounded px-2 py-1"
                                            value={cycleLateFee} onChange={(e) => setCycleLateFee(parseFloat(e.target.value) || 0)} />
                                    </label>
                                    <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center"
                                    onClick={async () => {
                                        if (!isCyclePayableFormValid()) {
                                            openNotification("warning", "Vui lòng điền đầy đủ thông tin để tạo chuỗi thu/chi có chu kỳ");
                                            return;
                                        }
                                        const newPayables = await calculatePayable(
                                            cyclePayablePartner?.name || "",
                                            cyclePayableType,
                                            cycleDateBegin ? cycleDateBegin.toISOString().split("T")[0] : "",
                                            cyclePayableAmount,
                                            cyclePayableTax,
                                            cycleCount,
                                            cycleDuration,
                                            cycleDurationUnit,
                                            cycleCollectionMethod,
                                            cycleLateFee,
                                            cycleDelay,
                                            cyclePayableNote
                                        );
                                        setPayables([...payables, ...newPayables]);
                                        // reset form
                                        resetCyclePayableForm();
                                        setOpenInsertCyclePayableModal(false);
                                    }}
                                    >
                                        Tạo chuỗi thu/chi
                                    </div>
                                </div>
                            </Modal>
                            <div className="w-full text-center bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer mb-4" onClick={() => {
                                setOpenInsertCyclePayableModal(true);
                            }}>
                                Thêm các khoản thu/chi có chu kỳ
                            </div>
                        </>
                    ) : null}
                    {/* Bộ lọc/sắp xếp */}
                    <div className="flex flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div>
                                <span className="text-sm text-slate-500">Sắp xếp theo:</span>
                            </div>
                            <select className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" value={sortType} onChange={(e) => setSortType(e.target.value as TableRowSortedType)}>
                                <option value="dayPayment">Ngày giao dịch</option>
                                <option value="totalAmount">Số tiền thuế</option>
                            </select>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                className="rounded-xl mb-2 border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                onClick={() => setShowPayableColumnsOpen((value) => !value)}
                            >
                                Hiển thị cột
                            </button>

                            {showPayableColumnsOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                    <div className="mb-2 text-sm font-semibold text-slate-900">Cột bảng</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {renderColumnCheckbox("Bên thu", "receive", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Bên chi", "pay", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Số tiền", "amount", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Thuế (%)", "tax", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Số tiền thuế", "total", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Ngày thu/Điều kiện", "moment", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Ghi chú", "note", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Phí trễ (%/năm)", "lateFee", visibleColumns, setVisibleColumns)}
                                        {renderColumnCheckbox("Hạn thanh toán chậm", "latePay", visibleColumns, setVisibleColumns)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <table className="w-full border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-2 py-1">STT</th>
                                {visibleColumns.receive && (
                                    <th className="border border-gray-300 px-2 py-1">Bên thu</th>
                                )}
                                {visibleColumns.pay && (
                                    <th className="border border-gray-300 px-2 py-1">Bên chi</th>
                                )}
                                {visibleColumns.amount && (
                                    <th className="border border-gray-300 px-2 py-1">Số tiền</th>
                                )}
                                {visibleColumns.tax && (
                                    <th className="border border-gray-300 px-2 py-1">Thuế (%)</th>
                                )}
                                {visibleColumns.total && (
                                    <th className="border border-gray-300 px-2 py-1">Số tiền thuế</th>
                                )}
                                {visibleColumns.moment && (
                                    <th className="border border-gray-300 px-2 py-1">Ngày thu/Điều kiện</th>
                                )}
                                {visibleColumns.note && (
                                    <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                                )}
                                {visibleColumns.lateFee && (
                                    <th className="border border-gray-300 px-2 py-1">Phí trễ (%/năm)</th>
                                )}
                                {visibleColumns.latePay && (
                                    <th className="border border-gray-300 px-2 py-1">Hạn thanh toán chậm</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {shownPayables.map((item, index) => (
                                <tr key={index} onClick={() => {
                                    setFocusPayable(item);
                                    setOpenInsertOnePayableModal(true);
                                }} className="cursor-pointer hover:bg-gray-100">
                                    <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
                                    {visibleColumns.receive && (
                                        <td className="border border-gray-300 px-2 py-1">{item.type === "receive" ? ourSide : item.partner}</td>
                                    )}
                                    {visibleColumns.pay && (
                                        <td className="border border-gray-300 px-2 py-1">{item.type === "pay" ? ourSide : item.partner}</td>
                                    )}
                                    {visibleColumns.amount && (
                                        <td className="border border-gray-300 px-2 py-1">{item.amount.toLocaleString()}</td>
                                    )}
                                    {visibleColumns.tax && (
                                        <td className="border border-gray-300 px-2 py-1">{item.tax}</td>
                                    )}
                                    {visibleColumns.total && (
                                        <td className="border border-gray-300 px-2 py-1">{(item.amount * item.tax / 100).toLocaleString()}</td>
                                    )}
                                    {visibleColumns.moment && (
                                        <td className="border border-gray-300 px-2 py-1">
                                            {item.moment.type === "date" ? (item.moment.date ? new Date(item.moment.date).toLocaleDateString() : "") : item.moment.condition}
                                        </td>
                                    )}
                                    {visibleColumns.note && (
                                        <td className="border border-gray-300 px-2 py-1">{item.note}</td>
                                    )}
                                    {visibleColumns.lateFee && (
                                        <td className="border border-gray-300 px-2 py-1">{item.lateFee}</td>
                                    )}
                                    {visibleColumns.latePay && (
                                        <td className="border border-gray-300 px-2 py-1">
                                            {item.moment.type === "date" ? (
                                                item.moment.date ? 
                                                new Date(new Date(item.moment.date).getTime() + item.moment.delay * getDurationInMilliseconds("day")).toLocaleDateString(): "") 
                                                : `${item.moment.delay} ngày sau khi điều kiện được đáp ứng`}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
                        Tổng số tiền nhận (trước thuế): {totalAmountReceiveBeforeTax(payables).toLocaleString()}
                    </div>
                    <div>
                        Tổng số tiền trả: {totalAmountPay(payables).toLocaleString()}
                    </div>
                    <div>
                        Tổng số tiền nhận (sau thuế): {totalAmountReceiveAfterTax(payables).toLocaleString()}
                    </div>
                    
                </div>

                
                
            </div>
            {mode === "view" ? (
                <ViewContractPayable contractID={contract?.contractID} contractDocuments={contract?.documents || []} mode={mode} />
            ) : null}

            {mode === "view" || mode === "edit" ? (
                <div>
                    <div>
                        Trạng thái hợp đồng: <span className="font-semibold">
                            {contract?.status === "waiting" ? "Chờ duyệt" : contract?.status === "active" ? "Đang thực hiện" : contract?.status === "terminated" ? "Đã chấm dứt" : contract?.status === "completed" ? "Đã hoàn thành" : ""}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 my-2">
                        Đổi trạng thái
                    </div>
                    <div className="flex flex-row gap-2">
                        {contract?.status === "waiting" ? (
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={() => {
                                // Gọi API để đổi trạng thái hợp đồng sang "active"
                            }}>
                                Kích hoạt hợp đồng
                            </button>
                        ) : null}
                        
                        {contract?.status === "active" ? (
                            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" onClick={() => {
                                // Gọi API để đổi trạng thái hợp đồng sang "terminated"
                            }}>
                                Chấm dứt hợp đồng
                            </button>
                        ) : null}
                        
                        {contract?.status === "terminated" ? (
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => {
                                // Gọi API để đổi trạng thái hợp đồng sang lại "active"
                            }}>
                                Khôi phục hợp đồng
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null} 
        </div>
    )
}

function totalAmountReceiveAfterTax(payables: Payable[]) {
    return payables.reduce((total, p) => {
        if (p.type === "receive") {
            return total + p.amount * (1 - p.tax / 100);
        }
        return total;
    }, 0);
}

function totalAmountReceiveBeforeTax(payables: Payable[]) {
    return payables.reduce((total, p) => {
        if (p.type === "receive") {
            return total + p.amount;
        }
        return total;
    }, 0);
}

function totalAmountPay(payables: Payable[]) {
    return payables.reduce((total, p) => {
        if (p.type === "pay") {
            return total + p.amount;
        }
        return total;
    }, 0);
}

async function calculatePayable(partner: string, type: "receive" | "pay", begin: string, unitPrice: number, tax: number, paytime: number, duration: number, durationUnit: string, collectionMethod: string, lateFee: number, delay: number, note: string): Promise<Payable[]> {
    const beginDate = new Date(begin);
    // tính các ngày trả tiền
    // unitPrice là số tiền mỗi đơn vị thời gian, ví dụ unitPrice = 100 và durationUnit = "month" thì sẽ trả 100 mỗi tháng
    // paytime là số đơn vị thời gian giữa các lần trả tiền, ví dụ paytime = 1 và durationUnit = "month" thì sẽ trả tiền mỗi tháng một lần
    // collectionMethod là phương thức thu tiền, có thể là "atBegin" (thu tiền vào ngày đầu tiên của kỳ) hoặc "atEnd" (thu tiền vào ngày cuối cùng của kỳ)
    // lateTime là số ngày chậm trả mà chưa bị tính phí phạt


    if (collectionMethod === "atBegin") {
        // thu tiền vào ngày đầu tiên của kỳ
        const payables: Payable[] = [];
        let count = 0;
        let currentDate = new Date(beginDate);
        while (count < paytime) {
            const amount = unitPrice;
            payables.push({
                amount: amount,
                partner: partner,
                type: type,
                tax: tax,
                lateFee: lateFee,
                note: `Lần ${type === "receive" ? "thu" : "trả"} ` + (payables.length + 1) + ". " + note.trim(),
                moment: {
                    type: "date",
                    date: currentDate.toISOString().split("T")[0],
                    delay: delay,
                    condition: "",
                    needDocument: false
                }
            });
            if (durationUnit === "day") {
                currentDate = new Date(currentDate.getTime() + duration * getDurationInMilliseconds("day"));
            } else if (durationUnit === "month") {
                currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + duration));
            } else if (durationUnit === "year") {
                currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + duration));
            }
            count++;
        }
        return payables;
    } else {
        // thu tiền vào ngày cuối cùng của kỳ
        const payables: Payable[] = [];
        let count = 0;
        let currentDate = new Date(beginDate);
        let lastTime = new Date();
        while (count < paytime) {
            const amount = unitPrice;
            const copyCurrentDate = new Date(currentDate);
            if (durationUnit === "day") {
                lastTime = new Date(copyCurrentDate.getTime() + duration * getDurationInMilliseconds("day"));
            } else if (durationUnit === "month") {
                lastTime = new Date(copyCurrentDate.setMonth(copyCurrentDate.getMonth() + duration));
            } else if (durationUnit === "year") {
                lastTime = new Date(copyCurrentDate.setFullYear(copyCurrentDate.getFullYear() + duration));
            }
            lastTime = new Date(lastTime.getTime() - getDurationInMilliseconds("day"));
            payables.push({
                partner: partner,
                type: type,
                amount: amount,
                tax: tax,
                lateFee: lateFee,
                note: `Lần ${type === "receive" ? "thu" : "trả"} ` + (payables.length + 1) + ". " + note.trim(),
                moment: {
                    type: "date",
                    date: lastTime.toISOString().split("T")[0],
                    needDocument: false,
                    delay: delay,
                    condition: ""
                }
            });
            if (durationUnit === "day") {
                currentDate = new Date(currentDate.getTime() + duration * getDurationInMilliseconds("day"));
            } else if (durationUnit === "month") {
                currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + duration));
            } else if (durationUnit === "year") {
                currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + duration));
            }
            count++;
        }
        return payables;
    }
}

function getDurationInMilliseconds(durationUnit: string): number {
    switch (durationUnit) {
        case "day":
            return 24 * 60 * 60 * 1000;
        case "month":
            return 30 * 24 * 60 * 60 * 1000;
        case "year":
            return 365 * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}

type TableColumnKey = "receive" | "pay" | "amount" | "tax" | "total" | "moment" | "note" | "lateFee" | "latePay";

function renderColumnCheckbox(
    label: string,
    key: TableColumnKey,
    state: Record<TableColumnKey, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<TableColumnKey, boolean>>>
) {
    return (
        <label className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={state[key]}
                onChange={() => setState((prev) => ({ ...prev, [key]: !prev[key] }))}
            />
            <span className="text-slate-700">{label}</span>
        </label>
    );
}

type TableRowSortedType = "dayPayment" | "totalAmount";

function renderSortedPayables(type: TableRowSortedType, payables: Payable[]) {
    // nhận vào danh sách các khoản thu/chi và kiểu sắp xếp, trả về một mảng đã được sắp xếp tương ứng
    const sortedPayables = [...payables];
    switch (type) {
        case "dayPayment":
            sortedPayables.sort((a, b) => {
                const aDate = a.moment.type === "date" ? new Date(a.moment.date || "") : null;
                const bDate = b.moment.type === "date" ? new Date(b.moment.date || "") : null;
                if (aDate && bDate) {
                    return aDate.getTime() - bDate.getTime();
                } else if (aDate) {
                    return -1;
                }
                else if (bDate) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            break;
        case "totalAmount":
            sortedPayables.sort((a, b) => (a.amount * (1 + a.tax / 100)) - (b.amount * (1 + b.tax / 100)));
            break;
        default:
            break;
    }
    return sortedPayables;
}