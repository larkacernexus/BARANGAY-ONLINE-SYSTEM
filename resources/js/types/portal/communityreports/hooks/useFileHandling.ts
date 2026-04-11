// hooks/useFileHandling.ts
import { useState, useRef } from 'react';
import { FileWithPreview, PreviewModalState } from '@/types/portal/reports/community-report';
import { toast } from 'sonner';

interface UseFileHandlingProps {
    maxFiles?: number;
    maxFileSize?: number;
    allowedTypes?: string[];
    setData?: any;  // Add setData as optional prop
    data?: any;     // Add data as optional prop
}

export const useFileHandling = (props?: UseFileHandlingProps) => {
    const {
        maxFiles = 10,
        maxFileSize = 5 * 1024 * 1024,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/mov', 'video/avi'],
        setData,  // Destructure setData
        data      // Destructure data
    } = props || {};
    
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [existingFiles, setExistingFiles] = useState<Array<{name: string, size: number, type: string, lastModified: number, preview?: string}>>([]);
    const [previewModal, setPreviewModal] = useState<PreviewModalState>({
        isOpen: false,
        url: '',
        type: '',
        name: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper function to update evidence in parent state
    const updateEvidenceInParent = (newFiles: File[]) => {
        if (setData && data) {
            const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
            setData('evidence', [...currentEvidence, ...newFiles]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        
        // Use the configured maxFiles
        if (selectedFiles.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }
        
        const validFiles = selectedFiles.filter(file => {
            // Use the configured allowedTypes
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}. Allowed types: ${allowedTypes.join(', ')}`);
                return false;
            }
            
            // Use the configured maxFileSize
            if (file.size > maxFileSize) {
                toast.error(`File too large (max ${maxFileSize / (1024 * 1024)}MB): ${file.name}`);
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
        
        // Update parent state if setData and data are provided
        if (setData && data) {
            const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
            const updatedEvidence = [...currentEvidence, ...validFiles];
            setData('evidence', updatedEvidence);
        }
        
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
            
            // Update parent state to remove the file
            if (setData && data) {
                const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
                // Find the file to remove by name and size (or use a better identifier)
                const fileToRemove = removedFile;
                if (fileToRemove) {
                    const updatedEvidence = currentEvidence.filter((file: File) => 
                        file.name !== fileToRemove.name || file.size !== fileToRemove.size
                    );
                    setData('evidence', updatedEvidence);
                }
            }
            
            return newFiles;
        });
        
        toast.info('File removed');
    };

    const removeExistingFile = (index: number) => {
        setExistingFiles(prev => {
            const updated = [...prev];
            const removedFile = updated[index];
            updated.splice(index, 1);
            
            // Update parent state to remove existing file
            if (setData && data && removedFile) {
                const currentEvidence = Array.isArray(data.evidence) ? data.evidence : [];
                const updatedEvidence = currentEvidence.filter((file: any) => 
                    !(file.name === removedFile.name && file.size === removedFile.size)
                );
                setData('evidence', updatedEvidence);
            }
            
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
        
        // Clear parent state
        if (setData && data) {
            setData('evidence', []);
        }
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