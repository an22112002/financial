import { api } from '../basicAPI';
import type { Document } from "../../types/ContractData3";
import { openNotification } from '../../utils';

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
                openNotification('error', 'Lỗi', res.data.message);
                return null;
            }
        } else {
            console.error('Error uploading document:', res.statusText);
            openNotification('error', 'Lỗi', res.statusText);
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

export const UploadDocuments = async (files: File[]): Promise<Document[] | null> => {
    try {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("uploadFiles", file);
        });

        const res = await api.post("/files/upload", formData);
        if (res.status === 200) {
            const data = res.data
            return data.data as Document[];
        } else {
            return null;
        }
    } catch {
        return null;
    }
}

export const DeleteDocument = async (documentId: string): Promise<boolean | null> => {
    try {
        const res = await api.delete(`/files/delete/${documentId}`);
        if (res.status === 200) {
            return true;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}

export const GetDocument = async (document: string): Promise<Document | null> => {
    try {
        const res = await api.get(`/documents/${document}`);
        if (res.status === 200) {
            return res.data as Document;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}