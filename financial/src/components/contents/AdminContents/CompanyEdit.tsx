import {useState, useEffect} from "react"

export default function CompanyEdit() {
    const [companyName, setCompanyName] = useState<string>("");
    const [editInfo, setEditInfo] = useState<boolean>(false);

    useEffect(() => {
        // Fetch company name from API and set it to state
        const fetchCompany = async () => {
            const data = {
                companyName: "Công ty NIAD"
            }
            setCompanyName(data.companyName);
        }
        fetchCompany();
    }, []);

    return (
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="text-xl font-bold mb-4">Thông tin chủ thể</div>
            <div className="grid grid-cols-2 gap-4 items-center">
                <label className="block text-sm font-medium text-gray-700 text-right mr-[15%]">Tên công ty</label>
                <input
                    type="text"
                    value={companyName}
                    readOnly={!editInfo}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="mt-4">
                {editInfo ? (
                    <div className="flex justify-end gap-2">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() => {
                                // thêm API để cập nhật thông tin công ty vào backend
                                setEditInfo(false);
                            }}
                        >
                            Lưu thay đổi
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => setEditInfo(false)}
                        >
                            Hủy
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-end gap-2">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => setEditInfo(true)}
                        >
                            Chỉnh sửa
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}