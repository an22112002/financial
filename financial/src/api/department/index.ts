import { api } from '../basicAPI';
import { openNotification } from '../../utils';
import type { Department } from "../../types/ContractData3";

export type PayableShortInfo = {
    payableID: string;
    type: "intime" | "delay" | "waiting";
    note: string;
    condition: string;
    amount: number;
}

export type ContractShortInfo = {
    contractID: string;
    contractType: "receive" | "pay";
    title: string;
    payableNow: PayableShortInfo[];
};

export const CreateDepartment = async (name: string): Promise<Department[] | null> => {
    try {
        const res = await api.post(`/departments/create/${name}`);
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Bộ phận đã được tạo thành công.');
                return res.data.data;
            } else {
                console.error('Failed to create department:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            console.error('Error creating department:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error creating department:', error);
        openNotification('error', 'Lỗi', 'Không thể tạo bộ phận. Vui lòng thử lại.');
        return null;
    }
}

export const GetDepartments = async (): Promise<Department[] | null> => {
    try {
        const res = await api.get('/departments/get');
        if (res.status === 200) {
            if (res.data.success) {
                return res.data.data;
            } else {
                console.error('Failed to fetch departments:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            console.error('Error fetching departments:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        openNotification('error', 'Lỗi', 'Không thể tải danh sách bộ phận. Vui lòng thử lại.');
        return null;
    }
}

export const DeleteDepartment = async (departmentID: string): Promise<Department[] | null> => {
    try {
        const res = await api.delete(`/departments/delete/${departmentID}`);
        if (res.status === 200) {
            if (res.data.success) {
                return res.data.data;
            } else {
                console.error('Failed to fetch departments:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            console.error('Error fetching departments:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        openNotification('error', 'Lỗi', 'Không thể tải danh sách bộ phận. Vui lòng thử lại.');
        return null;
    }
}

export const GetDepartmentContracts = async (departmentID: string): Promise<ContractShortInfo[] | null> => {
    try {
        const res = await api.get(`/departments/contracts-info/${departmentID}`);
        if (res.status === 200) {
            if (res.data.success) {
                return res.data.data;
            } else {
                console.error('Failed to fetch department contracts:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            console.error('Error fetching department contracts:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching department contracts:', error);
        openNotification('error', 'Lỗi', 'Không thể tải danh sách hợp đồng của bộ phận. Vui lòng thử lại.');
        return null;
    }
}
