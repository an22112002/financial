import { useState, useEffect } from "react";

type PartnerData = {
    id: number;
    name: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    represent: string;
    bankAccounts: BankAccountData[];
}

type BankAccountData = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}
export default function PartnerContent() {
    const [mode, setMode] = useState<"create" | "view" | "edit">("create");
    const [partnersData, setPartnersData] = useState<PartnerData[]>([]);
    const [focusedPartner, setFocusedPartner] = useState<PartnerData | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadPartnerData = async () => {
            // Giả lập gọi API để lấy dữ liệu đối tác
            const data: PartnerData[] = [{
                id: 1,
                name: "Công ty ABC",
                taxCode: "0123456789",
                address: "123 Đường XYZ, Quận 1, TP.HCM",
                phone: "0123456789",
                email: "",
                represent: "Nguyễn Văn A",
                bankAccounts: [
                    {
                        bankName: "MB Bank",
                        accountNumber: "123456789",
                        accountHolder: "Nguyễn Văn A"
                    }
                ]
            },
            {
                id: 2,
                name: "Công ty DEF",
                taxCode: "9876543210",
                address: "456 Đường UVW, Quận 2, TP.HCM",
                phone: "0987654321",
                email: "",
                represent: "Trần Thị B",
                bankAccounts: [
                    {
                        bankName: "BIDV",
                        accountNumber: "987654321",
                        accountHolder: "Trần Thị B"
                    },
                    {
                        bankName: "Vietcombank",
                        accountNumber: "555555555",
                        accountHolder: "Trần Thị B"
                    }
                ]
            }];
            setPartnersData(data);
        };

        loadPartnerData();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Đối tác{focusedPartner ? ` - ${focusedPartner.name}` : ""}</h1>

            <div className="mt-4 md:max-h-[72vh] flex flex-col md:flex-row gap-4 h-full">
                <div className="md:w-2/3 w-full overflow-y-auto bg-gray-100 rounded shadow">
                    <p><strong>Thông tin đối tác</strong></p>
                    <PartnerForm partnerData={focusedPartner} setPartnerData={setFocusedPartner} mode={mode} setMode={setMode} />
                </div>

                <div className="md:w-1/3 w-full overflow-y-auto bg-gray-100 rounded shadow">
                    <p><strong>Danh sách đối tác</strong></p>
                    <div>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded mb-4"
                            placeholder="Tìm kiếm đối tác..."
                            onChange={(e) => {
                                const searchTerm = e.target.value.toLowerCase();
                                setSearchTerm(searchTerm);
                            }}
                        />
                    </div>
                    <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
                        {partnersData.length > 0 ? (
                            <>
                                {partnersData
                                    .filter((partner) => {
                                        return (
                                            partner.name.toLowerCase().includes(searchTerm) ||
                                            partner.taxCode.includes(searchTerm)
                                        );
                                    })
                                    .map((partner) => (
                                        <div key={partner.id} className="bg-orange-100 p-4 rounded shadow mb-4 w-full hover cursor-pointer"
                                            onClick={() => {
                                                if (mode === "create" || mode === "view") {
                                                    setFocusedPartner(partner);
                                                    setMode("view");
                                            }
                                        }}
                                    >
                                        <h2 className="text-xl font-semibold mb-2">{partner.name}</h2>
                                        <p className="text-gray-700 mb-1">Mã số thuế: {partner.taxCode}</p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p>Không có dữ liệu đối tác.</p>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

function PartnerForm({ partnerData, setPartnerData, mode, setMode }: { partnerData: PartnerData | null, setPartnerData: React.Dispatch<React.SetStateAction<PartnerData | null>>, mode: "create" | "view" | "edit", setMode: (mode: "create" | "view" | "edit") => void }) {
    const [name, setName] = useState(partnerData?.name || "");
    const [taxCode, setTaxCode] = useState(partnerData?.taxCode || "");
    const [address, setAddress] = useState(partnerData?.address || "");
    const [phone, setPhone] = useState(partnerData?.phone || "");
    const [email, setEmail] = useState(partnerData?.email || "");
    const [representative, setRepresentative] = useState(partnerData?.represent || "");
    const [bankAccounts, setBankAccounts] = useState<BankAccountData[]>(partnerData?.bankAccounts || []);

    const [bankNames, setBankNames] = useState<string[]>([]);

    const load = async (p: PartnerData | null) => {
        setName(p?.name || "");
        setTaxCode(p?.taxCode || "");
        setAddress(p?.address || "");
        setPhone(p?.phone || "");
        setEmail(p?.email || "");
        setRepresentative(p?.represent || "");
        setBankAccounts(p?.bankAccounts || []);
    };

    const reset = () => {
        setName("");
        setTaxCode("");
        setAddress("");
        setPhone("");
        setEmail("");
        setRepresentative("");
        setBankAccounts([]);
    }

    useEffect(() => {
        const loadBankName = async () => {
            // Giả lập gọi API để lấy danh sách tên ngân hàng
            const bankNames = ["MB Bank", "BIDV", "Vietcombank", "Techcombank", "Agribank"];
            setBankNames(bankNames);
        };

        loadBankName();
    }, []);

    useEffect(() => {
        const loadPartnerData = async () => {
            if (partnerData) {
                load(partnerData);
            } else {
                reset();
            }
        };

        loadPartnerData();
    }, [partnerData]);

    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">(<strong className="text-red-500">*</strong>)Tên đối tác</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded" 
                    value={name}
                    disabled={mode === "view"}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">(<strong className="text-red-500">*</strong>)Mã số thuế</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded" 
                    value={taxCode}
                    disabled={mode === "view"}
                    onChange={(e) => setTaxCode(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Địa chỉ</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded" 
                    value={address}
                    disabled={mode === "view"}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Số điện thoại</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded" 
                    value={phone}
                    disabled={mode === "view"}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Email</label>
                <input 
                    type="email" 
                    className="w-full px-3 py-2 border rounded" 
                    value={email}
                    disabled={mode === "view"}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Đại diện</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded" 
                    value={representative}
                    disabled={mode === "view"}
                    onChange={(e) => setRepresentative(e.target.value)}
                />
            </div>

            <div className="w-full mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Tài khoản ngân hàng</label>
                <table className="md:w-full overflow-x-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Tên ngân hàng</th>
                            <th className="border px-4 py-2">Số tài khoản</th>
                            <th className="border px-4 py-2">Chủ tài khoản</th>
                            {mode !== "view" && (
                                <th className="border px-4 py-2">Hành động</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {bankAccounts.length ? (
                            <>
                                {bankAccounts.map((account, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">
                                            <select
                                                className="w-full px-3 py-2 border rounded"
                                                value={account.bankName}
                                                disabled={mode === "view"}
                                                onChange={(e) => {
                                                    const newBankAccounts = [...bankAccounts];
                                                    newBankAccounts[index].bankName = e.target.value;
                                                    setBankAccounts(newBankAccounts);
                                                }}
                                            >
                                                <option value="">Chọn ngân hàng</option>
                                                {bankNames.map((name, idx) => (
                                                    <option key={idx} value={name}>
                                                        {name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border px-4 py-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border rounded"
                                                placeholder="Số tài khoản"
                                                value={account.accountNumber}
                                                disabled={mode === "view"}
                                                onChange={(e) => {
                                                    const newBankAccounts = [...bankAccounts];
                                                    newBankAccounts[index].accountNumber = e.target.value;
                                                    setBankAccounts(newBankAccounts);
                                                }}
                                            />
                                        </td>
                                        <td className="border px-4 py-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border rounded"
                                                placeholder="Chủ tài khoản"
                                                value={account.accountHolder}
                                                disabled={mode === "view"}
                                                onChange={(e) => {
                                                    const newBankAccounts = [...bankAccounts];
                                                    newBankAccounts[index].accountHolder = e.target.value;
                                                    setBankAccounts(newBankAccounts);
                                                }}
                                            />
                                        </td>
                                        {mode !== "view" && 
                                            <td className="border px-4 py-2">
                                                <button 
                                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    onClick={() => {
                                                        const newBankAccounts = [...bankAccounts];
                                                        newBankAccounts.splice(index, 1);
                                                        setBankAccounts(newBankAccounts);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        }
                                    </tr>
                                ))}
                            </>
                        ) : (
                            <tr>
                                <td className="border px-4 py-2 text-center" colSpan={4}>Không có tài khoản ngân hàng</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {mode !== "view" && (
                    <div className="mt-2 flex flex-row gap-2 justify-start">
                        <button 
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => {
                                setBankAccounts([...bankAccounts, { bankName: "", accountNumber: "", accountHolder: "" }]);
                            }}
                        >
                            Thêm tài khoản ngân hàng
                        </button>
                    </div>
                )}
                
            </div>

            {mode === "create" && (
                <div className="flex flex-row gap-4 justify-end">
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => {
                            // Gọi API để tạo đối tác mới
                        }}
                    >
                        Lưu đối tác mới
                    </button>
                </div>
            )}

            {mode === "view" && (
                <div className="flex flex-row gap-4 justify-end">
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => {
                            setMode("edit");
                        }}
                    >
                        Sửa thông tin
                    </button>
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => {
                            setPartnerData(null);
                            setMode("create");
                        }}
                    >
                        Tạo đối tác mới
                    </button>
                </div>
            )}

            {mode === "edit" && (
                <div className="flex flex-row gap-4 justify-end">
                    <button 
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => {
                            // Gọi API để cập nhật thông tin đối tác
                        }}
                    >
                        Cập nhật
                    </button>
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => {
                            setMode("view");
                            load(partnerData);
                        }}
                    >
                        Hủy thay đổi
                    </button>
                </div>
                
            )}
        </div>
    )
}