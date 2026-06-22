import UserEdit from "./AdminContents/UserEdit"
import CompanyEdit from "./AdminContents/CompanyEdit"

export default function AdminContent() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Quản trị hệ thống</h1>
            <p>Đây là trang quản trị hệ thống. Tại đây bạn có thể quản lý người dùng, phân quyền, và cấu hình hệ thống.</p>
        
            <div>
                <UserEdit />
            </div>
            <hr className="my-4" />
            <div>
                <CompanyEdit />
            </div>

        </div>
    )
}