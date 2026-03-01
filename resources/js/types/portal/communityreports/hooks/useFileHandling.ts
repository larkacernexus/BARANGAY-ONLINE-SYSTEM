// hooks/useFileHandling.ts

import { useState, useRef } from 'react';
import { FileWithPreview, PreviewModalState } from '@/types/portal/community-report';
import { toast } from 'sonner';

export const useFileHandling = () => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [existingFiles, setExistingFiles] = useState<Array<{name: string, size: number, type: string, lastModified: number, preview?: string}>>([]);
    const [previewModal, setPreviewModal] = useState<PreviewModalState>({
        isOpen: false,
        url: '',
        type: '',
        name: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setData: any, data: any) => {
        const selectedFiles = Array.from(e.target.files || []);
        
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
        }
        
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/mov', 'video/avi'];
            const maxSize = 5 * 1024 * 1024;
            
            if (!validTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}. Use JPG, PNG, GIF, WebP, PDF, MP4, MOV, or AVI.`);
                return false;
            }
            
            if (file.size > maxSize) {
                toast.error(`File too large (max 5MB): ${file.name}`);
                return false;
            }
            
            return true;
        });

        const newFiles = validFiles.map(file => ({
            ...file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
            id: Math.random().toString(36).substr(2, 9),
            type: file.type
        })) as FileWithPreview[];

        setFiles(prev => [...prev, ...newFiles]);
        
        const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
        const updatedEvidence = [...currentEvidence, ...validFiles];
        setData('evidence', updatedEvidence);
        
        if (validFiles.length > 0) {
            toast.success(`Added ${validFiles.length} file(s)`);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(file => file && file.id !== id);
            const removedFile = prev.find(file => file && file.id === id);
            
            if (removedFile?.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            
            return newFiles;
        });
        
        toast.info('File removed');
    };

    const removeExistingFile = (index: number) => {
        setExistingFiles(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
        toast.info('File removed from draft');
    };

    const openPreview = (url: string, type: string, name: string) => {
        setPreviewModal({
            isOpen: true,
            url,
            type,
            name
        });
    };

    const closePreview = () => {
        setPreviewModal({
            isOpen: false,
            url: '',
            type: '',
            name: ''
        });
    };

    const clearAllFiles = () => {
        files.forEach(file => {
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setFiles([]);
    };

    return {
        files,
        setFiles,
        existingFiles,
        setExistingFiles,
        previewModal,
        fileInputRef,
        handleFileSelect,
        removeFile,
        removeExistingFile,
        openPreview,
        closePreview,
        clearAllFiles
    };
};