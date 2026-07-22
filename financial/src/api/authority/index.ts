import { api } from '../basicAPI';
import { openNotification } from '../../utils';

export const refreshToken = async (refresh_token: string): Promise<{ token: string } | null> => {
    try {
        const res = await api.post('/auth/refresh-token', { refresh_token: refresh_token });
        if (res.status === 200) {
            if (res.data.success) {
                return { token: res.data.token };
            } else {
                openNotification('warning', 'Làm mới token thất bại', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch {
        openNotification('error', 'Lỗi', 'Không thể làm mới token. Vui lòng thử lại.');
        return null;
    }
};

export const Login = async (username: string, password: string): Promise<{ token: string, refresh_token: string, permit: string[] } | null> => {
    try {
        const res = await api.post('/auth/login', { username: username, password: password });
        if (res.status === 200) {
            if (res.data.success) {
                return { token: res.data.token, refresh_token: res.data.refresh_token, permit: res.data.permit };
            } else {
                openNotification('warning', 'Đăng nhập thất bại', res.data.message || res.data.detail || 'Unknown error');
                return null;
            }
        } else {
            openNotification('error', 'Lỗi', res.statusText);
            return null;
        }
    } catch {
        openNotification('error', 'Lỗi', 'Không thể đăng nhập. Vui lòng thử lại.');
        return null;
    }
}

export const Logout = async (refresh_token: string): Promise<boolean> => {
    try {
        const res = await api.post('/auth/logout', { refresh_token: refresh_token });
        console.log(res)
        return true;
    } catch {
        openNotification('error', 'Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
        return false;
    }
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
        const res = await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
        if (res.status === 200) {
            if (res.data.success) {
                openNotification('success', 'Thành công', 'Đổi mật khẩu thành công');
                return true;
            } else {
                openNotification('warning', 'Thất bại', res.data.message || res.data.detail || 'Unknown error');
                return false;
            }
        } else {
            openNotification('error', 'Lỗi', res.statusText);
            return false;
        }
    } catch {
        openNotification('error', 'Lỗi', 'Không thể đổi mật khẩu. Vui lòng thử lại.');
        return false;
    }
}
