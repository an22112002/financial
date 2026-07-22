import { api } from '../basicAPI';
import { openNotification } from '../../utils';
import type { PayableEditData } from "../../types/ContractData3";

export type LinkPayableTransactionRequest = {
    payableID: string;
    bankTransactionId: string;
    fromAccount: string;
    toAccount: string;
    amount: number;
    dayExecute: string;
    documentIDs: string[];
};

export const GetContractPayables = async (contractID: string): Promise<PayableEditData[]> => {
    try {
        const res = await api.get(`/payables/contract/${contractID}`);
        if (res.status === 200) {
            if (res.data.success) {
                return (res.data.data || []) as PayableEditData[];
            }
            openNotification('error', 'Lỗi', res.data.message || 'Không thể tải danh sách công nợ');
            return [];
        }
        openNotification('error', 'Lỗi', res.statusText);
        return [];
    } catch (error) {
        console.error('Error fetching contract payables:', error);
        openNotification('error', 'Lỗi', 'Không thể tải danh sách công nợ. Vui lòng thử lại.');
        return [];
    }
};

export const LinkPayableTransaction = async (request: LinkPayableTransactionRequest): Promise<boolean> => {
    try {
        const res = await api.post('/payables/link-transaction', request);
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Đã ghép công nợ với giao dịch.');
                return true;
            }
            openNotification('error', 'Lỗi', res.data.message || 'Không thể ghép giao dịch');
            return false;
        }
        openNotification('error', 'Lỗi', res.statusText);
        return false;
    } catch (error) {
        console.error('Error linking payable transaction:', error);
        openNotification('error', 'Lỗi', 'Không thể ghép công nợ với giao dịch. Vui lòng thử lại.');
        return false;
    }
};

export const UnlinkPayableTransaction = async (payableID: string): Promise<boolean> => {
    try {
        const res = await api.delete(`/payables/${payableID}/unlink-transaction`);
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Đã tách ghép giao dịch khỏi công nợ.');
                return true;
            }
            openNotification('error', 'Lỗi', res.data.message || 'Không thể tách giao dịch');
            return false;
        }
        openNotification('error', 'Lỗi', res.statusText);
        return false;
    } catch (error) {
        console.error('Error unlinking payable transaction:', error);
        openNotification('error', 'Lỗi', 'Không thể tách giao dịch khỏi công nợ. Vui lòng thử lại.');
        return false;
    }
};
