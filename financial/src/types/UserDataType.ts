export type UserPermission = 
    "create_contract" | 
    "edit_contract" | 
    "edit_status_contract" | 
    "view_contract" | 
    "edit_payable" | 
    "view_payable"

export type PermissionAndDescription = {
    permission: UserPermission;
    description: string;
}

export const permissionDescriptions: PermissionAndDescription[] = [
    { permission: "create_contract", description: "Tạo hợp đồng" },
    { permission: "edit_contract", description: "Chỉnh sửa thông tin hợp đồng đã tạo" },
    { permission: "edit_status_contract", description: "Cập nhật trạng thái hợp đồng (kích hoạt, hủy, chỉnh sửa)" },
    { permission: "view_contract", description: "Xem thông tin hợp đồng" },
    { permission: "edit_payable", description: "Chỉnh sửa công nợ" },
    { permission: "view_payable", description: "Xem công nợ" }
]

export interface UserData {
    id?: string;
    username: string;
    password: string;
    role: "admin" | "user";
    status: "active" | "locked" | "deleted";
    userPermissions: UserPermission[];
}

export interface LoginData {
    username: string;
    password: string;
}

export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

