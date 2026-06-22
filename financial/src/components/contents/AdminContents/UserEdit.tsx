import { useState, useEffect } from "react"
import type {UserData, UserPermission} from "../../../types/UserDataType"
import { permissionDescriptions } from "../../../types/UserDataType"
import {UserAddOutlined} from "@ant-design/icons"
import { Modal } from "antd"

export default function UserEdit() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [focusUserId, setFocusUserId] = useState<string | null>(null);
    const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState(false);
    const [openConfirmLockModal, setOpenConfirmLockModal] = useState(false);

    const [newUserName, setNewUserName] = useState("");
    const [newUserPermissions, setNewUserPermissions] = useState<UserPermission[]>([]);

    const handleCreateUser = () => {
        // thêm API để tạo người dùng mới vào backend
        const newUser: UserData = {
            username: newUserName,
            password: "", // Replace with actual password handling
            role: "user",
            status: "active",
            userPermissions: newUserPermissions
        };
        setUsers([...users, newUser]);
        setOpenCreateUserModal(false);
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user data from the backend API
                const data: UserData[] = [{
                    id: "1",
                    username: "admin",
                    password: "admin123",
                    role: "user",
                    status: "active",
                    userPermissions: ["create_contract", "edit_contract", "view_contract", "edit_payable", "view_payable", "edit_status_contract"]
                },
                {
                    id: "2",
                    username: "user1",
                    password: "user123",
                    role: "user",
                    status: "locked",
                    userPermissions: ["view_contract"]
                }
                ]
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Modal tạo người dùng mới */}
            <Modal
                title="Tạo người dùng mới"
                open={openCreateUserModal}
                onCancel={() => {setOpenCreateUserModal(false)
                    setNewUserName("")
                    setNewUserPermissions([])
                }}
                footer={null}
            >
                <div className="mb-4">
                    <label className="block mb-2">Tên người dùng:</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Quyền hạn:</label>
                    <div className="flex flex-wrap gap-2">
                        {permissionDescriptions.map((perm) => (
                            <label key={perm.permission} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newUserPermissions.includes(perm.permission)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setNewUserPermissions([...newUserPermissions, perm.permission]);
                                        } else {
                                            setNewUserPermissions(newUserPermissions.filter(p => p !== perm.permission));
                                        }
                                    }}
                                />
                                {perm.description}
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleCreateUser}
                >
                    Tạo người dùng
                </button>
            </Modal>

            {/* Modal chỉnh sửa người dùng */}
            <Modal
                title="Chỉnh sửa người dùng"
                open={!!editUser}
                onCancel={() => setEditUser(null)}
                footer={null}
            >
                {editUser && (
                    <div>
                        <div className="mb-4">
                            <label className="block mb-2">Tên người dùng:</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={editUser.username}
                                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Quyền hạn:</label>
                            <div className="flex flex-wrap gap-2">
                                {permissionDescriptions.map((perm) => (
                                    <label key={perm.permission} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editUser.userPermissions.includes(perm.permission)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditUser({
                                                        ...editUser,
                                                        userPermissions: [...editUser.userPermissions, perm.permission]
                                                    });
                                                } else {
                                                    setEditUser({
                                                        ...editUser,
                                                        userPermissions: editUser.userPermissions.filter(p => p !== perm.permission)
                                                    });
                                                }
                                            }}
                                        />
                                        {perm.description}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                onClick={() => {
                                    // thêm API để cập nhật người dùng vào backend
                                    setEditUser(null);
                                }}
                            >
                                Đặt lại mật khẩu
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={() => setEditUser(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={() => {
                                    // thêm API để cập nhật người dùng vào backend
                                    setEditUser(null);
                                    setUsers(users.map(u => u.id === editUser.id ? editUser : u));
                                }}
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal xác nhận xóa người dùng */}
            <Modal
                title="Xác nhận xóa người dùng"
                open={openConfirmDeleteModal && focusUserId !== null}
                onCancel={() => setOpenConfirmDeleteModal(false)}
                footer={null}
            >
                <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={() => setOpenConfirmDeleteModal(false)}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => {
                            // thêm API để xóa người dùng vào backend
                            setOpenConfirmDeleteModal(false);
                            setUsers(users.filter(u => u.id !== focusUserId));
                            setFocusUserId(null);
                        }}
                    >
                        Xóa
                    </button>
                </div>
            </Modal>

            {/* Modal xác nhận khóa người dùng */}
            <Modal
                title="Xác nhận khóa người dùng"
                open={openConfirmLockModal}
                onCancel={() => setOpenConfirmLockModal(false)}
                footer={null}
            >
                <p>Bạn có chắc chắn muốn khóa người dùng này không?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={() => setOpenConfirmLockModal(false)}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => {
                            // thêm API để khóa người dùng vào backend
                            setOpenConfirmLockModal(false);
                            setUsers(users.map(u => u.id === focusUserId ? {...u, status: u.status === "locked" ? "active" : "locked"} : u));
                            setFocusUserId(null);
                        }}
                    >
                        {users.find(u => u.id === focusUserId)?.status === "locked" ? "Mở khóa" : "Khóa"}
                    </button>
                </div>
            </Modal>
            <h2 className="text-xl font-bold mb-4">Quản lý và phân quyền người dùng</h2>
            <div className="mb-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => setOpenCreateUserModal(true)}>
                    <UserAddOutlined /> Thêm người dùng mới
                </button>
            </div>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2 border-b w-[25%]">Tên người dùng</th>
                        <th className="px-4 py-2 border-b w-[50%]">Quyền hạn</th>
                        <th className="px-4 py-2 border-b w-[25%]">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border-b">{user.username}</td>
                            <td className="px-4 py-2 border-b gap-2">
                                {user.userPermissions.map((permission) => {
                                    const description = permissionDescriptions.find(p => p.permission === permission)?.description;
                                    return (
                                        <span key={permission} className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2 mt-1">
                                            {description}
                                        </span>
                                    );
                                })}
                            </td>
                            <td className="flex flex-row gap-2 px-4 py-2 border-b">
                                <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => setEditUser(user)}>
                                    Chỉnh sửa
                                </button>
                                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => {
                                    setFocusUserId(user.id || "");
                                    setOpenConfirmLockModal(true);
                                }}>
                                    {user.status === "locked" ? "Mở khóa" : "Khóa"}
                                </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => {
                                    setFocusUserId(user.id || "");
                                    setOpenConfirmDeleteModal(true);
                                }}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}