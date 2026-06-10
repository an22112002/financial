import { api } from '../basicAPI';

export type ScanDocumentResponse = {
    success: boolean;
    image_id?: string;
    message?: string;
    error?: string;
}

export const SendScanDocument = async (file: File): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/scan/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        if (res.status === 200) {
            if (res.data.success) {
                return res.data.image_id;
            } else {
                console.error('Failed to upload document:', res.data.message);
                return null;
            }
        } else {
            console.error('Error uploading document:', res.statusText);
            return null;
        }
    } catch {
        // console.error('Error uploading document:', error);
        return null;
    }
}

export const GetScanDocument = async (imageId: string): Promise<File | null> => { 
    try {
        const res = await api.get(`/scan/${imageId}`, {
            responseType: 'blob'
        });
        if (res.status === 200) {
            return new File([res.data], `scan_${imageId}.jpg`, { type: 'image/jpeg' });
        } else {
            return null;
        }
    } catch {
        return null;
    }
    
}

export const DeleteScanDocument = async (imageId: string): Promise<boolean | null> => { 
    try {
        const res = await api.delete(`/scan/delete/${imageId}`);
        if (res.status === 200) {
            return true;
        } else {
            return null;
        }
    } catch {
        return null;
    }
    
}