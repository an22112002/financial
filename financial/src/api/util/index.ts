import { api } from '../basicAPI';

import { openNotification } from '../../utils';

export type Bank = {
    bankID: string;
    name: string;
    bankShortName: string;
    icon: string;
}

export type ContractUtilsResponse = {
    ourSide: string;
    banks: Bank[];
}

export const GetContractUtils = async (): Promise<ContractUtilsResponse | null> => {
    try {
        const res = await api.get('/utils/contract');
        if (res.status === 200) {
            if (res.data.success) {
                return res.data.data as ContractUtilsResponse;
            } else {
                openNotification('error', 'Lỗi', res.data.message || res.data.detail || 'Không thể lấy dữ liệu tiện ích hợp đồng');
                return null;
            }
        } else {
            return null;
        }
    } catch {
        openNotification('error', 'Lỗi', 'Đã xảy ra lỗi khi gọi API');
        return null;
    }
}