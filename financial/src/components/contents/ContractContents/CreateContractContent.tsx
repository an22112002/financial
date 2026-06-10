import { Modal, Radio } from "antd";
import { useEffect, useState } from "react";
import { parseNumber, createCodeContract, displayDate, more30DayFromNow, getTitle } from "../../../utils";
import type { ContractJoinerData, PayableProcessData, InsurancePaymentData, FullContractData, InsuranceData } from "../../../types/DataType";

type sumPayableProcess = {
    side: string;
    totalSpend: number;
    totalReceive: number;
}

export default function CreateContractContent() {
    const [baseContractCode, setBaseContractCode] = useState("");

    const [editCodeConfig, setEditCodeConfig] = useState(false);
    const [contractCode, setContractCode] = useState("");

    const [contractName, setContractName] = useState("");

    const [dateSign, setDateSign] = useState<Date>(new Date());

    const radioTimeOptions = [
        { label: "Mốc thời gian", value: 1 },
        { label: "Khoảng thời gian", value: 2 }
    ];
    const [radioTime, setRadioTime] = useState(1);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(more30DayFromNow());
    const [duration, setDuration] = useState(30);
    const [delay, setDelay] = useState(0);

    const banks = ["Vietcombank", "Vietinbank", "BIDV", "Techcombank", "Agribank", "MB Bank", "Sacombank", "TPBank", "VPBank", "ACB"];
    const [joiners, setJoiners] = useState<ContractJoinerData[]>([
        { title: getTitle(0), name: "", bank: "", accountNumber: "", represent: "" },
        { title: getTitle(1), name: "", bank: "", accountNumber: "", represent: "" }
    ]);

    const [payableProcess, setPayableProcess] = useState<PayableProcessData[]>([
        { id: 0, amount: 0, side: "Bên A", receiveSide: "Bên B", moment: new Date(), note: "", id_payment: null }
    ]);
    const [sumPayableProcess, setSumPayableProcess] = useState<sumPayableProcess[]>([]);
    const [focusPayableProcess, setFocusPayableProcess] = useState<PayableProcessData | null>(null);
    const [modalMomentType, setModalMomentType] = useState<"date" | "condition">("date");

    const [hasInsurance, setHasInsurance] = useState(false);
    const [insuranceReceiver, setInsuranceReceiver] = useState<ContractJoinerData>(joiners[1]); // Mặc định bên hưởng bảo hiểm là Bên B
    const [insurancePayer, setInsurancePayer] = useState<ContractJoinerData>(joiners[0]); // Mặc định bên chi trả bảo hiểm là Bên A
    const [insuranceAmount, setInsuranceAmount] = useState(0);
    const [insuranceTax, setInsuranceTax] = useState(0);
    const insuranceConditions = [
        { label: "Triển khai khi quá trình thanh toán cuối cùng được thực hiện", value: "finalPayment" },
        { label: "Triển khai vào ngày cụ thể", value: "dateSpecific" }
    ];
    const insurancePaymentTypes = [
        { label: "Thanh toán một lần", value: "oneTime"},
        { label: "Thanh toán định kỳ", value: "periodic"}
    ];
    const periodicOptions = [
        { label: "Cụ thể", value: "specific" },
        { label: "Hàng tuần", value: "weekly" },
        { label: "Hàng tháng", value: "monthly" },
        { label: "Hàng quý", value: "quarterly" },
        { label: "Hàng năm", value: "yearly" }
    ];
    const [insuranceCondition, setInsuranceCondition] = useState<"finalPayment" | "dateSpecific">("finalPayment");
    const [insuranceDateBegin, setInsuranceDateBegin] = useState<Date | null>(null);
    const [insurancePaymentType, setInsurancePaymentType] = useState<"oneTime" | "periodic">("oneTime");
    const [periodicPaymentType, setPeriodicPaymentType] = useState("");
    const [numberOfPeriods, setNumberOfPeriods] = useState(1);
    const [insurancePayments, setInsurancePayments] = useState<InsurancePaymentData[]>([]);

    const [ourSide, setOurSide] = useState<ContractJoinerData>(joiners[0]); // Mặc định bên mình là Bên A
    const [totalMoney, setTotalMoney] = useState(0);
    const [tax, setTax] = useState(0);

    const createContract = () => {
        const insuranceData: InsuranceData = {
            paySide: insurancePayer.title,
            receiveSide: insuranceReceiver.title,
            insuranceMoney: insuranceAmount,
            insuranceCondition: insuranceCondition,
            insurancePaymentType: insurancePaymentType,
            insuranceDateBegin: insuranceDateBegin ? insuranceDateBegin.toISOString().split('T')[0] : null,
            insurancePayments: insurancePayments
        }
        const newContract: FullContractData = {
            code: contractCode,
            department: "",
            title: contractName,
            signDate: dateSign.toISOString().split('T')[0],
            timeExecute: radioTime === 1 ? { begin: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] } : { numberOfDay: duration, delay: delay },
            joiners: joiners,
            processes: payableProcess,
            tax: tax,
            insurance: hasInsurance ? insuranceData : null
        };
        const validation = validateContractData(newContract);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        console.log(newContract);
        // Xử lý logic tạo hợp đồng ở đây
    };

    useEffect(() => {
        // API lấy cấu hình mã hợp đồng mới nhất
        const fetchData = async () => {
            // Giả lập API trả về template mã hợp đồng
            const template = "{date}/HĐ-NIAD";
            // Giả lập lấy thông tin Bên A
            const data = {
                partyAName: "Công ty TNHH NIAD",
                partyABank: "BIDV",
                partyAAccount: "0123456789",
                represent: "Nguyễn Văn A"
            };
            setBaseContractCode(template);
            setContractCode(createCodeContract(template));

            setJoiners([
                { title: getTitle(0), name: data.partyAName, bank: data.partyABank, accountNumber: data.partyAAccount, represent: data.represent },
                { title: getTitle(1), name: "", bank: "", accountNumber: "", represent: "" }
            ]);
        }
        fetchData();
    }, []);

    useEffect(() => {
        const changeMomentType = () => {
            if (focusPayableProcess?.moment instanceof Date) {
                setModalMomentType("date");
            } else {
                setModalMomentType("condition");
            }
        }
        changeMomentType();
        
    }, [focusPayableProcess]);

    useEffect(() => {
        const calNewSum = () => {
            const newSum = calculateSumPayableProcess(payableProcess);
            setSumPayableProcess(newSum);
        };
        calNewSum();
    }, [payableProcess]);

    useEffect(() => {
        const calTotalMoney = () => {
            const total = sumPayableProcess.reduce((total, summary) => {
                if (summary.side === ourSide.title) {
                    return total + summary.totalSpend;
                }
                return total;
            }, 0);
            setTotalMoney(total);
        };
        calTotalMoney();
    }, [sumPayableProcess, ourSide]);

    useEffect(() => {
        const setupInsuranceTable = () => {
            const payments = [];

            const dateBegin =
                insuranceDateBegin ||
                endDate ||
                dateSign ||
                new Date();

            if (periodicPaymentType === "specific") {
                payments.push({
                    time: dateBegin,
                    amount: insuranceAmount,
                    tax: insuranceTax,
                    id_payment: null
                });
            } else {
                for (let i = 0; i < numberOfPeriods; i++) {
                    const time = new Date(dateBegin);

                    if (periodicPaymentType === "weekly") {
                        time.setDate(time.getDate() + i * 7);
                    } else if (periodicPaymentType === "monthly") {
                        time.setMonth(time.getMonth() + i);
                    } else if (periodicPaymentType === "quarterly") {
                        time.setMonth(time.getMonth() + i * 3);
                    } else if (periodicPaymentType === "yearly") {
                        time.setFullYear(time.getFullYear() + i);
                    }

                    payments.push({
                        time,
                        amount: Math.round(insuranceAmount / numberOfPeriods),
                        tax: insuranceTax,
                        id_payment: null
                    });
                }
            }

            setInsurancePayments(payments);
        };

        if (insurancePaymentType === "periodic") {
            setupInsuranceTable();
        }
    }, [insurancePaymentType, periodicPaymentType, numberOfPeriods, insuranceAmount, insuranceTax, insuranceDateBegin, endDate, dateSign]);

    useEffect(() => {
        const clearInsurance = () => {
            setHasInsurance(false);
            setInsuranceReceiver(joiners[1]);
            setInsurancePayer(joiners[0]);
            setInsuranceAmount(0);
            setInsuranceTax(0);
            setInsuranceCondition("finalPayment");
            setInsurancePaymentType("oneTime");
            setPeriodicPaymentType("");
            setNumberOfPeriods(1);
            setInsurancePayments([]);
        };

        if (!hasInsurance) {
            clearInsurance();
        }
    }, [hasInsurance]);

    useEffect(() => {
        const checkInsuranceConflict = () => {
            if (insuranceReceiver.title === insurancePayer.title) {
                setInsuranceReceiver(joiners.find(joiner => joiner.title !== insurancePayer.title) || joiners[1]);
            }
        }
        checkInsuranceConflict();
    }, [insurancePayer]);

    const showEditCodeModal = () => {
        setEditCodeConfig(true);
    };

    return (
        <>
            {/* Cấu hình mã hợp đồng */}
            <Modal
                title="Cấu hình mã hợp đồng"
                open={editCodeConfig}
                onCancel={() => setEditCodeConfig(false)}
                footer={null}
            >
                <p>Template mã hợp đồng:</p>
                <input 
                    type="text" 
                    value={baseContractCode}
                    onChange={(e) => setBaseContractCode(e.target.value)}
                    className="w-full border px-2 py-1"
                />
                <p className="mt-2 mb-4 text-sm text-gray-500">{`{date} -> ${createCodeContract("{date}")}`}</p>
                <button 
                    onClick={() => {
                        setContractCode(createCodeContract(baseContractCode));
                        setEditCodeConfig(false);
                    }} 
                    className="w-full mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                    Lưu
                </button>
            </Modal>

            <Modal
                title="Cấu hình quá trình thanh toán"
                open={focusPayableProcess !== null}
                onCancel={() => setFocusPayableProcess(null)}
                footer={null}
            >
                <div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Số tiền</label>
                        <input
                            type="text"
                            className="w-full border px-2 py-1"
                            value={focusPayableProcess?.amount || ""}
                            onChange={(e) => {
                                if (focusPayableProcess) {
                                    setFocusPayableProcess({...focusPayableProcess, amount: parseNumber(e.target.value)});
                                }
                            }}
                        />
                        <div className="w-full flex flex-row justify-center"><strong className="text-sm text-gray-500">{`${toVNString(focusPayableProcess?.amount || 0)}`}</strong></div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Ghi chú</label>
                        <input
                            type="text"
                            className="w-full border px-2 py-1"
                            value={focusPayableProcess?.note || ""}
                            onChange={(e) => {
                                if (focusPayableProcess) {
                                    setFocusPayableProcess({...focusPayableProcess, note: e.target.value});
                                }
                            }}
                        />
                        <label className="block mb-2 text-sm font-medium text-gray-700">Bên thanh toán</label>
                        <select
                            className="w-full border px-2 py-1"
                            value={focusPayableProcess?.side || ""}
                            onChange={(e) => {
                                if (focusPayableProcess) {
                                    setFocusPayableProcess({...focusPayableProcess, side: e.target.value});
                                }
                            }}
                        >
                            {joiners.map((joiner, index) => (
                                <option key={index} value={joiner.title}>
                                    {joiner.title} - {joiner.name}
                                </option>
                            ))}
                        </select>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Bên nhận</label>
                        <select
                            className="w-full border px-2 py-1"
                            value={focusPayableProcess?.receiveSide || ""}
                            onChange={(e) => {
                                if (focusPayableProcess) {
                                    setFocusPayableProcess({...focusPayableProcess, receiveSide: e.target.value});
                                }
                            }}
                        >
                            {joiners.map((joiner, index) => (
                                <option key={index} value={joiner.title}>
                                    {joiner.title} - {joiner.name}
                                </option>
                            ))}
                        </select>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Thời điểm thanh toán</label>
                        <Radio.Group
                            options={[{ label: "Ngày cụ thể", value: "date" }, { label: "Điều kiện khác", value: "condition" }]}
                            value={modalMomentType}
                            onChange={(e) => {if (e.target.value === "condition") {
                                setFocusPayableProcess({...focusPayableProcess!, moment: ""});
                            } else {
                                setFocusPayableProcess({...focusPayableProcess!, moment: new Date()});
                            } setModalMomentType(e.target.value);}}
                        />
                        {modalMomentType === "date" ? (
                            <input
                                type="date"
                                className="w-full border px-2 py-1"
                                value={
                                    focusPayableProcess?.moment instanceof Date
                                        ? focusPayableProcess.moment.toISOString().split("T")[0]
                                        : typeof focusPayableProcess?.moment === "string"
                                            ? focusPayableProcess.moment
                                            : ""
                                }
                                onChange={(e) => {
                                    if (focusPayableProcess) {
                                        setFocusPayableProcess({
                                            ...focusPayableProcess,
                                            moment: e.target.value
                                        });
                                    }
                                }}
                            />
                        ) : (
                            <input
                                type="text"
                                className="w-full border px-2 py-1"
                                value={typeof focusPayableProcess?.moment === "string" ? focusPayableProcess.moment : ""}
                                onChange={(e) => {
                                    if (focusPayableProcess) {
                                        setFocusPayableProcess({...focusPayableProcess, moment: e.target.value});
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                if (focusPayableProcess) {
                                    setPayableProcess(payableProcess.map(process => process.id === focusPayableProcess.id ? focusPayableProcess : process));
                                    setFocusPayableProcess(null);
                                }
                            }}
                            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex flex-col p-2">
                <div className="flex flex-row justify-center"><strong className="text-[1.5rem]">Tạo hợp đồng</strong></div>

                <div className="md:grid md:grid-cols-2 flex flex-col gap-3 mt-4">
                    
                    {/* Mã hợp đồng */}
                    <div className="bg-blue-200 rounded-xl p-4">
                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Mã hợp đồng</label>

                        <div>
                            <div><strong className="text-red-500">*</strong><strong>Số: {contractCode}</strong></div>
                            <button onClick={showEditCodeModal} className="w-[50%] m-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>

                    {/* Tên hợp đồng */}
                    <div className="bg-blue-200 rounded-xl p-4">
                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Tên hợp đồng</label>

                        <div>
                            <div><strong className="text-red-500">*</strong><strong>Hợp đồng: {contractName}</strong></div>
                            <input 
                                type="text" 
                                className="w-full mt-4 px-4 py-2 rounded"
                                value={contractName}
                                onChange={(e) => setContractName(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Ngày ký */}
                    <div className="bg-blue-200 rounded-xl p-4">
                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Ngày ký</label>

                        <div>
                            <div><strong className="text-red-500">*</strong><strong>Ngày {new Date(dateSign).getDate().toString()} Tháng {new Date(dateSign).getMonth() + 1} Năm {new Date(dateSign).getFullYear()}</strong></div>
                            <input 
                                type="date" 
                                className="w-full mt-4 px-4 py-2 rounded"
                                value={dateSign.toISOString().split("T")[0]}
                                onChange={(e) => setDateSign(new Date(e.target.value))}
                            />
                        </div>
                    </div>
                    {/* Thời gian thực hiện */}
                    <div className="bg-blue-200 rounded-xl p-4">
                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Thời gian thực hiện</label>
                        <div>
                            <strong className="text-red-500">*</strong>
                            {radioTime === 1 ? (
                                <strong>Bắt đầu từ ngày {displayDate(startDate)} đến ngày {displayDate(endDate)}</strong>
                            ) : delay === 0 ? (
                                <strong>Bắt đầu ngay sau khi ký hợp đồng. Thực hiện trong {duration} ngày. Kết thúc vào ngày {displayDate(new Date(dateSign.getTime() + duration * 24 * 60 * 60 * 1000))}</strong>
                            ) : (
                                <strong>Bắt đầu sau {delay} ngày từ ngày ký hợp đồng. Thực hiện trong {duration} ngày. Kết thúc vào ngày {displayDate(new Date(dateSign.getTime() + delay * 24 * 60 * 60 * 1000 + duration * 24 * 60 * 60 * 1000))}</strong>
                            )} 
                        </div>
                        <div className="mt-2">
                            <Radio.Group options={radioTimeOptions} value={radioTime} onChange={(e) => setRadioTime(e.target.value)} />
                        </div>
                        { radioTime === 1 ? (
                            <div className="mt-2">
                                <label className="block mb-2 text-xl font-medium text-blue-700">Mốc thời gian</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <span>Bắt đầu</span>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 rounded"
                                        placeholder="Ngày bắt đầu" 
                                        value={startDate.toISOString().split("T")[0]}
                                        onChange={(e) => setStartDate(new Date(e.target.value))}
                                    />

                                    <span>Kết thúc</span>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2 rounded" 
                                        placeholder="Ngày kết thúc" 
                                        value={endDate.toISOString().split("T")[0]}
                                        onChange={(e) => setEndDate(new Date(e.target.value))}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <label className="block mb-2 text-xl font-medium text-blue-700">Khoảng thời gian</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <span>Số ngày</span>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-2 rounded" 
                                        placeholder="Số ngày"
                                        min={1}
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                    />

                                    <span>Sau ngày ký hợp đồng</span>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-2 rounded" 
                                        placeholder="Số ngày"
                                        min={0}
                                        value={delay}
                                        onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div></div>

                    {/* Các bên tham gia hợp đồng */}
                    <div className="col-span-2 bg-gray-300 rounded-xl p-4">
                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Các bên tham gia hợp đồng</label>
                        <div className="flex flex-row gap-4 p-2 overflow-x-auto">
                            {joiners.map((joiner, index) => (
                                <div key={index} className="min-w-[300px] bg-blue-300 rounded-xl p-4 flex-1">
                                    <div><strong className="text-red-500">*</strong><strong>{joiner.title}</strong></div>
                                    <input 
                                        type="text"
                                        className="w-full mt-4 px-4 py-2 rounded"
                                        placeholder="Tên bên tham gia"
                                        value={joiner.name}
                                        onChange={(e) => {
                                            const newJoiners = [...joiners];
                                            newJoiners[index].name = e.target.value;
                                            setJoiners(newJoiners);
                                        }}
                                    />
                                    <select
                                        className="w-full mt-4 px-4 py-2 rounded"
                                        value={joiner.bank}
                                        onChange={(e) => {
                                            const newJoiners = [...joiners];
                                            newJoiners[index].bank = e.target.value;
                                            setJoiners(newJoiners);
                                        }}
                                    >
                                        <option value="">Chọn ngân hàng thụ hưởng</option>
                                        {banks.map((bank) => (
                                            <option key={bank} value={bank}>
                                                {bank}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        className="w-full mt-4 px-4 py-2 rounded"
                                        placeholder="Số tài khoản"
                                        value={joiner.accountNumber}
                                        onChange={(e) => {
                                            const newJoiners = [...joiners];
                                            newJoiners[index].accountNumber = e.target.value;
                                            setJoiners(newJoiners);
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="w-full mt-4 px-4 py-2 rounded"
                                        placeholder="Người đại diện"
                                        value={joiner.represent}
                                        onChange={(e) => {
                                            const newJoiners = [...joiners];
                                            newJoiners[index].represent = e.target.value;
                                            setJoiners(newJoiners);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <button
                                onClick={() => setJoiners([...joiners, { title: getTitle(joiners.length), name: "", bank: "", accountNumber: "", represent: "" }])}
                                className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                            >
                                Thêm bên tham gia
                            </button>
                            <button
                                onClick={() => {if (joiners.length > 2) { setJoiners(joiners.slice(0, -1)); }}}
                                className="mt-4 ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Xóa bên tham gia
                            </button>
                        </div>
                    </div>

                    {/* Quá trình thanh toán */}
                    <div className="bg-green-200 rounded-xl p-4 col-span-2 gap-4">

                        <label className="block mb-2 text-xl font-medium text-gray-700 col-span-2">Quá trình thanh toán</label>
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-cyan-300">Số tiền</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Bên thanh toán</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Bên nhận</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Thời điểm thanh toán</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Ghi chú</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Chỉnh sửa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payableProcess.map((process, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{process.amount.toLocaleString()} VND</td>
                                        <td className="border px-4 py-2">{process.side}</td>
                                        <td className="border px-4 py-2">{process.receiveSide}</td>
                                        <td className="border px-4 py-2">{process.moment instanceof Date ? displayDate(process.moment) : process.moment}</td>
                                        <td className="border px-4 py-2">{process.note}</td>
                                        <td className="border px-4 py-2 gap-2 flex md:flex-row flex-col">
                                            <button 
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                                onClick={() => setFocusPayableProcess(process)}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                                onClick={() => setPayableProcess(payableProcess.filter((_, i) => i !== index))}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div>
                            <button
                                onClick={() => setPayableProcess([...payableProcess, {id: createID(), amount: 0, side: "Bên A", receiveSide: "Bên B", moment: new Date(), note: "", id_payment: null}])}
                                className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                            >
                                Thêm quá trình thanh toán
                            </button>
                        </div>
                        <div className="my-4 text-xl font-medium text-gray-700">Tổng cộng thu chi các bên</div>
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-cyan-300">Bên thanh toán</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Loại</th>
                                    <th className="border px-4 py-2 bg-cyan-300">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sumPayableProcess.map((summary, index) => (
                                    <>
                                        <tr key={index-1}>
                                            <td className="border px-4 py-2" rowSpan={2}>{summary.side}</td>
                                            <td className="border px-4 py-2">Chi</td>
                                            <td className="border px-4 py-2">{summary.totalSpend.toLocaleString()} VND</td>
                                        </tr>
                                        <tr key={index-2}>
                                            <td className="border px-4 py-2">Thu</td>
                                            <td className="border px-4 py-2">{summary.totalReceive.toLocaleString()} VND</td>
                                        </tr>
                                    </>
                                    
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Bảo hiểm */}
                        <div className="my-4 flex flex-row gap-2 items-center justify-start">
                            <div className="text-xl font-[1.8rem] font-bold text-gray-700">Bảo hiểm</div> 
                            <input
                                type="checkbox"
                                className="mt-4 px-4 py-2 rounded size-large"
                                checked={hasInsurance}
                                onChange={(e) => setHasInsurance(e.target.checked)}
                            />
                            
                        </div>
                        <div
                            className={`
                                transition-all duration-300 overflow-hidden
                                ${hasInsurance
                                    ? "opacity-100 translate-y-0 max-h-auto"
                                    : "opacity-0 -translate-y-2 max-h-0"}
                            `}
                        >
                            <>
                                <div className="grid grid-cols-2 gap-4 items-center bg-yellow-200 rounded-xl p-4 duration-300">
                                    <div>Bên chi trả bảo hiểm:</div>
                                    <select
                                        className="px-2 py-2 rounded"
                                        value={insurancePayer.title}
                                        onChange={(e) => {
                                            setInsurancePayer(joiners.find(joiner => joiner.title === e.target.value) || joiners[0]);
                                        }}
                                    >
                                        {joiners.map((joiner, index) => (
                                            <option key={index} value={joiner.title}>
                                                {joiner.title} - {joiner.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div>Bên hưởng bảo hiểm:</div>
                                    <select
                                        className="px-2 py-2 rounded"
                                        value={insuranceReceiver.title}
                                        onChange={(e) => {
                                            setInsuranceReceiver(joiners.find(joiner => joiner.title === e.target.value) || joiners[1]);
                                        }}
                                    >
                                        {joiners.map((joiner, index) => (
                                            <option key={index} value={joiner.title}>
                                                {joiner.title} - {joiner.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div>Tổng số tiền bảo hiểm:</div>
                                    <input
                                        type="text"
                                        className="px-2 py-2 rounded"
                                        placeholder="Số tiền bảo hiểm"
                                        min={1}
                                        value={insuranceAmount}
                                        onChange={(e) => setInsuranceAmount(parseNumber(e.target.value))}
                                    />
                                    <div className="col-span-2 text-center">
                                        <strong className="text-sm text-gray-500">{`${toVNString(insuranceAmount)}`}</strong>
                                    </div>
                                    {insuranceReceiver.title === ourSide.title && (
                                        <>
                                            <div>{`Thuế bảo hiểm(%)`}</div>
                                            <input
                                                type="text"
                                                min={0}
                                                className="w-full px-4 py-2 rounded"
                                                placeholder="Thuế"
                                                value={insuranceTax}
                                                onChange={(e) => setInsuranceTax(parseNumber(e.target.value))}
                                            />
                                        </>
                                        )
                                    }

                                    <div className="col-span-2 text-center text-lg font-bold">Chi trả bảo hiểm</div>

                                    <div>
                                        Bảo hiểm triển khai khi:
                                    </div>
                                    <div>
                                        <select
                                            className="w-full px-2 py-2 rounded overflow-hidden whitespace-nowrap"
                                            value={insuranceCondition}
                                            onChange={(e) => setInsuranceCondition(e.target.value as "finalPayment" | "dateSpecific")}
                                        >
                                            {insuranceConditions.map((condition, index) => (
                                                <option key={index} value={condition.value}>
                                                    {condition.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {insuranceCondition === "dateSpecific" ? (
                                        <>
                                            <div>Ngày bắt đầu chi trả bảo hiểm:</div>
                                            <input
                                                type="date"
                                                className="px-2 py-2 rounded"
                                                value={insuranceDateBegin ? insuranceDateBegin.toISOString().split('T')[0] : ''}
                                                onChange={(e) => setInsuranceDateBegin(e.target.value ? new Date(e.target.value) : null)}
                                            />
                                        </>
                                    ) : null}

                                    <div>
                                        Kiểu chi trả bảo hiểm:
                                    </div>
                                    <div>
                                        <select
                                            className="w-full px-2 py-2 rounded overflow-hidden whitespace-nowrap"
                                            value={insurancePaymentType}
                                            onChange={(e) => setInsurancePaymentType(e.target.value as "oneTime" | "periodic")}
                                        >
                                            {insurancePaymentTypes.map((type, index) => (
                                                <option key={index} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {insurancePaymentType === "periodic" ? (
                                        <>
                                            <div>Kiểu phân bổ chi trả bảo hiểm:</div>
                                            <select
                                                className="w-full px-2 py-2 rounded overflow-hidden whitespace-nowrap"
                                                value={periodicPaymentType}
                                                onChange={(e) => setPeriodicPaymentType(e.target.value)}
                                            >
                                                {periodicOptions.map((type, index) => (
                                                    <option key={index} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : null}

                                    {periodicPaymentType !== "specific" && insurancePaymentType === "periodic" ? (
                                        <>
                                            <div>Số kỳ chi trả bảo hiểm:</div>
                                            <input
                                                type="number"
                                                min="1"
                                                className="px-2 py-2 rounded"
                                                value={numberOfPeriods}
                                                onChange={(e) => setNumberOfPeriods(parseInt(e.target.value) || 1)}
                                            />
                                        </>
                                    ) : null}

                                    {insurancePaymentType === "periodic" ? (
                                        <>
                                            <table className="w-full text-left col-span-2">
                                                <thead>
                                                    <tr>
                                                        <th className="border px-4 py-2 bg-yellow-300">Số lần</th>
                                                        <th className="border px-4 py-2 bg-yellow-300">Thời điểm chi trả</th>
                                                        <th className="border px-4 py-2 bg-yellow-300">Số tiền chi trả</th>
                                                        {insuranceReceiver.title === ourSide.title ? (
                                                            <th className="border px-4 py-2 bg-yellow-300">Thuế (%)</th>
                                                        ) : null}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {insurancePayments.map((payment, index) => (
                                                        <tr key={index}>
                                                            <td className="border px-4 py-2">Lần {index + 1}</td>
                                                            <td className="border px-4 py-2">
                                                                {payment.time instanceof Date ? (
                                                                    <input
                                                                        type="date"
                                                                        className="w-full px-2 py-1 rounded mt-1"
                                                                        value={payment.time.toISOString().split("T")[0]}
                                                                        onChange={(e) => {
                                                                            const newInsurancePayments = [...insurancePayments];
                                                                            newInsurancePayments[index].time = new Date(e.target.value);
                                                                            setInsurancePayments(newInsurancePayments);
                                                                        }}
                                                                    />
                                                                ) : 
                                                                    payment.time
                                                                }
                                                            </td>
                                                            <td className="border px-4 py-2">
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-2 py-1 rounded mt-1"
                                                                    value={payment.amount}
                                                                    onChange={(e) => {
                                                                        const newInsurancePayments = [...insurancePayments];
                                                                        newInsurancePayments[index].amount = parseFloat(e.target.value) || 0;
                                                                        setInsurancePayments(newInsurancePayments);
                                                                    }}
                                                                />
                                                            </td>
                                                            {insuranceReceiver.title === ourSide.title && (
                                                                <td className="border px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 rounded mt-1"
                                                                        value={payment.tax}
                                                                        onChange={(e) => {
                                                                            const newInsurancePayments = [...insurancePayments];
                                                                            newInsurancePayments[index].tax = parseFloat(e.target.value) || 0;
                                                                            setInsurancePayments(newInsurancePayments);
                                                                        }}
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {periodicPaymentType === "specific" ? (
                                                <div className="col-span-2 gap-2 flex justify-end">
                                                    <button
                                                        onClick={() => setInsurancePayments([...insurancePayments, { time: new Date(), amount: 0, tax: 0, id_payment: null }])}
                                                        className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                                                    >
                                                        Thêm kỳ chi trả
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newInsurancePayments = [...insurancePayments];
                                                            newInsurancePayments.pop();
                                                            setInsurancePayments(newInsurancePayments);
                                                        }}
                                                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                                    >
                                                        Bỏ kỳ chi trả
                                                    </button>
                                                </div>
                                                
                                            ) : null}

                                            {insurancePayments.reduce((hasZeroPayment, payment) => hasZeroPayment || payment.amount === 0, false) && (
                                                <div className="col-span-2 text-center">
                                                    <strong className="text-lg text-red-700">Cảnh báo: Không để chi trả bằng 0</strong>
                                                </div>
                                            )}

                                            {insurancePayments.reduce((sum, payment) => sum + payment.amount, 0) !== insuranceAmount && (
                                                <div className="col-span-2 text-center">
                                                    <strong className="text-lg text-red-700">Cảnh báo: Tổng số tiền chi trả không khớp với số tiền bảo hiểm</strong>
                                                </div>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            </>
                        </div>
                        

                        <div className="my-4 text-xl font-medium text-gray-700 col-span-2">Số tiền cần thanh toán</div>
                        
                        <div>
                            <div className="flex flex-row gap-4 items-center">
                                <div>Bên mình là:</div>
                                <select
                                    className="px-2 py-2 rounded"
                                    value={ourSide.title}
                                    onChange={(e) => {
                                        setOurSide(joiners.find(joiner => joiner.title === e.target.value) || joiners[0]);
                                    }}
                                >
                                    {joiners.map((joiner, index) => (
                                        <option key={index} value={joiner.title}>
                                            {joiner.title} - {joiner.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 items-center">
                                {/* Tổng tiền chi bên mình */}
                                <span className="pl-[40%]">Tổng tiền chi</span>
                                <div className="rounded bg-green-600 p-3">{totalMoney.toLocaleString()} VND</div>

                                <div className="col-span-2 text-center">
                                    <strong className="text-sm text-gray-500">{`${toVNString(totalMoney)}`}</strong>
                                </div>

                                <span className="pl-[40%]">{`Thuế (%)`}</span>
                                <input
                                    type="text"
                                    min={0}
                                    className="w-full px-4 py-2 rounded"
                                    placeholder="Thuế"
                                    value={tax}
                                    onChange={(e) => setTax(parseNumber(e.target.value))}
                                />

                                <span className="pl-[40%]"><strong className="text-red-500">*</strong><strong>{`Tổng tiền chi (đã tính thuế)`}</strong></span>
                                <div className="rounded bg-blue-500 text-white p-3"><strong>{calculateSumIncrease(totalMoney, tax).toLocaleString()} VND</strong></div>

                                <div className="col-span-2 text-center">
                                    <strong className="text-sm text-gray-500">{`${toVNString(calculateSumIncrease(totalMoney, tax))}`}</strong>
                                </div>
                                
                                {hasInsurance && (
                                    insurancePayer.title === ourSide.title ? (
                                        <>
                                            <span className="pl-[40%]"><strong className="text-red-500">*</strong><strong>{`Bảo hiểm`}</strong></span>
                                            <div className="rounded bg-yellow-500 text-white p-3">{"- " + insuranceAmount.toLocaleString()} VND</div>
                                        </>
                                    ) : (
                                        insurancePaymentType === "periodic" ? (
                                            <>
                                                <span className="pl-[40%]"><strong className="text-red-500">*</strong><strong>{`Bảo hiểm (đã trừ thuế)`}</strong></span>
                                                <div className="rounded bg-yellow-500 text-white p-3">{"+ " + calculateTotalInsuranceReceive(insurancePayments).toLocaleString()} VND</div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="pl-[40%]"><strong className="text-red-500">*</strong><strong>{`Bảo hiểm (đã trừ thuế)`}</strong></span>
                                                <div className="rounded bg-yellow-500 text-white p-3">{"+ " + calculateSumReduce(insuranceAmount, insuranceTax).toLocaleString()} VND</div>
                                            </>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nội dung hợp đồng */}

                    {/* Ảnh/file scan */}
                </div>
                
                <div>
                    <button 
                        className="w-full mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        onClick={() => {createContract();}}
                    >
                        Tạo hợp đồng
                    </button>
                </div>
            </div>
        </>
        
    )
}

// 1.2345.678.900 -> 1 tỉ 2 trăm 34 triệu 5 trăm 67 nghìn 9 trăm đồng
function toVNString(num: number): string {
    let b = Math.trunc(num / 1000000000);
    let m = Math.trunc((num % 1000000000) / 1000000);
    let t = Math.trunc((num % 1000000) / 1000);
    let d = Math.trunc(num % 1000);

    if (b < 1) {
        b = 0;
    }
    if (m < 1) {
        m = 0;
    }
    if (t < 1) {
        t = 0;
    }
    if (d < 1) {
        d = 0;
    }

    return `${b > 0 ? `${b} tỉ ` : ''}${m > 0 ? `${m} triệu ` : ''}${t > 0 ? `${t} nghìn ` : ''}${d > 0 ? `${d} đồng` : ''}`;
}

function calculateSumIncrease(amount: number, tax: number): number {
    return Math.round(amount + (amount * tax / 100));
}

function calculateSumReduce(amount: number, tax: number): number {
    return Math.round(amount - (amount * tax / 100));
}

// tính chi thu các bên trong quá trình thanh toán
function calculateSumPayableProcess(payableProcess: PayableProcessData[]): sumPayableProcess[] {
    const summary: { [key: string]: { totalSpend: number; totalReceive: number } } = {};

    payableProcess.forEach(process => {
        if (!summary[process.side]) {
            summary[process.side] = { totalSpend: 0, totalReceive: 0 };
        }
        if (!summary[process.receiveSide]) {
            summary[process.receiveSide] = { totalSpend: 0, totalReceive: 0 };
        }
        summary[process.side].totalSpend += process.amount;
        summary[process.receiveSide].totalReceive += process.amount;
    });

    return Object.entries(summary).map(([side, { totalSpend, totalReceive }]) => ({ side, totalSpend, totalReceive }));
}

function createID() : number {
    return Date.now();
}

// hàm tính tổng số tiền bảo hiểm nhận được sau khi trừ thuế
function calculateTotalInsuranceReceive(insurancePayment: InsurancePaymentData[]): number {
    return insurancePayment.reduce((total, payment) => total + calculateSumReduce(payment.amount, payment.tax), 0);
}

function validateContractData(contract: FullContractData): { valid: boolean; message: string } {
    if (!contract.code || !contract.title) {
        return { valid: false, message: "Mã hợp đồng và tên hợp đồng không được để trống." };
    }
    if (contract.joiners.length < 2) {
        return { valid: false, message: "Hợp đồng phải có ít nhất 2 bên tham gia." };
    }
    if (contract.processes.some(process => process.amount <= 0)) {
        return { valid: false, message: "Số tiền trong quá trình thanh toán phải lớn hơn 0." };
    }
    if (contract.insurance) {
        if (contract.insurance.insuranceMoney <= 0) {
            return { valid: false, message: "Số tiền bảo hiểm phải lớn hơn 0." };
        }
    }
    // Kiểm tra các ngày nếu có
    if (contract.timeExecute && 'begin' in contract.timeExecute && 'end' in contract.timeExecute) {
        const beginDate = new Date(contract.timeExecute.begin);
        const endDate = new Date(contract.timeExecute.end);
        if (beginDate >= endDate) {
            return { valid: false, message: "Ngày bắt đầu phải trước ngày kết thúc." };
        }
    }
    // Kiểm tra các bên tham gia thông tin đầy đủ và ko trùng nhau
    const joinerTitles = new Set();
    for (const joiner of contract.joiners) {
        if (!joiner.title || !joiner.name || !joiner.represent) {
            return { valid: false, message: "Thông tin các bên tham gia phải đầy đủ." };
        }
        if (joinerTitles.has(joiner.title)) {
            return { valid: false, message: "Tên các bên tham gia không được trùng nhau." };
        }
        joinerTitles.add(joiner.title);
    }
    // Nếu bảo hiểm là "dateSpecific" thì phải có ngày bắt đầu chi trả bảo hiểm
    if (contract.insurance && contract.insurance.insuranceCondition === "dateSpecific") {
        if (!contract.insurance.insuranceDateBegin) {
            return { valid: false, message: "Vui lòng chọn ngày bắt đầu chi trả bảo hiểm." };
        }
    }
    return { valid: true, message: "Dữ liệu hợp đồng hợp lệ." };
}