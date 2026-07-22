import { api } from '../basicAPI';
import { openNotification } from '../../utils';
import type { Contract } from "../../types/ContractData3";

export type SearchContractRequest = {
    contractCode ?: string;
    contractNumber ?: string;
    contractTitle ?: string;
    partner ?: string;
    signDate ?: string;
}

export const CreateContract = async (contractData: Contract): Promise<boolean> => {
    try {
        const res = await api.post('/contracts/create', contractData);
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Hợp đồng đã được tạo thành công.');
                return true;
            } else {
                console.error('Failed to create contract:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return false;
            }
        } else {
            console.error('Error creating contract:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error creating contract:', error);
        openNotification('error', 'Lỗi', 'Không thể tạo hợp đồng. Vui lòng thử lại.');
        return false;
    }
}

export const GetContracts = async (request: SearchContractRequest): Promise<Contract[]> => {
    try {
        const res = await api.post('/contracts/search', request);
        if (res.status === 200) {
            return res.data.contracts || [];
        } else {
            console.error('Error fetching contracts:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching contracts:', error);
        openNotification('error', 'Lỗi', 'Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
        return [];
    }
}

export const UpdateContract = async (contractData: Contract): Promise<boolean> => {
    try {
        const res = await api.put('/contracts/update', contractData);
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Hợp đồng đã được cập nhật thành công.');
                return true;
            } else {
                console.error('Failed to update contract:', res.data.message || res.data.detail || 'Unknown error');
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Unknown error');
                return false;
            }
        } else {
            console.error('Error updating contract:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error updating contract:', error);
        openNotification('error', 'Lỗi', 'Không thể cập nhật hợp đồng. Vui lòng thử lại.');
        return false;
    }
}
