// utils/document.utils.ts
import { File, FileText, FileImage, FileSpreadsheet, FileCode } from 'lucide-react';
import { FILE_TYPE_CONFIG } from '@/components/residentui/constants/document-ui';
import { Document } from '@/types/portal/records/records';

export const getDocumentStatus = (doc: Document): string => {
    if (doc.status) return doc.status;
    if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) {
        return 'expired';
    }
    return 'active';
};

export const getFileIcon = (extension: string = '') => {
    const config = FILE_TYPE_CONFIG[extension.toLowerCase() as keyof typeof FILE_TYPE_CONFIG];
    return config?.icon || File;
};

export const getFileColor = (extension: string = ''): string => {
    const config = FILE_TYPE_CONFIG[extension.toLowerCase() as keyof typeof FILE_TYPE_CONFIG];
    return config?.color || 'text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400';
};

export const getPreviewUrl = (document: Document): string => {
    if (document.preview_url) {
        return document.preview_url;
    }
    if (document.file_path) {
        return `/storage/${document.file_path}`;
    }
    return `/my-records/${document.id}/preview`;
};