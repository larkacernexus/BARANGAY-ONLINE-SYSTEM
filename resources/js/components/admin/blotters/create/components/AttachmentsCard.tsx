// components/admin/blotters/create/components/AttachmentsCard.tsx

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, X, FileUp, Trash2, FileImage, FileArchive, FileSpreadsheet } from 'lucide-react';

// Import type from blotter types
import type { Attachment } from '@/types/admin/blotters/blotter';

interface AttachmentsCardProps {
    newAttachments?: File[];
    existingAttachments?: Attachment[];
    previews?: string[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveNewFile: (index: number) => void;
    onRemoveExistingFile?: (fileId: number) => void;  // Changed to accept number only
    isEditMode?: boolean;
}

// Helper function to get file icon based on file type
const getFileIcon = (file: File | Attachment, fileType?: string) => {
    let mimeType = '';
    
    if (file instanceof File) {
        mimeType = file.type;
    } else {
        mimeType = file.type || file.file_type || fileType || '';
    }
    
    if (mimeType.startsWith('image/')) {
        return <FileImage className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
    if (mimeType.includes('pdf')) {
        return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
        return <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        return <FileSpreadsheet className="h-5 w-5 text-green-500 dark:text-green-400" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
        return <FileArchive className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
    }
    return <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AttachmentsCard = ({
    newAttachments = [],
    existingAttachments = [],
    previews = [],
    onFileChange,
    onRemoveNewFile,
    onRemoveExistingFile,
    isEditMode = false
}: AttachmentsCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Safe check for arrays
    const newAttachmentsCount = Array.isArray(newAttachments) ? newAttachments.length : 0;
    const existingAttachmentsCount = Array.isArray(existingAttachments) ? existingAttachments.length : 0;

    const handleTriggerFileInput = (): void => {
        fileInputRef.current?.click();
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileUp className="h-5 w-5" />
                    Attachments
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Upload supporting documents, photos, or evidence (Max 10MB per file)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="attachments" className="dark:text-gray-300">Upload Files</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={onFileChange}
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                            className="dark:bg-gray-900 dark:border-gray-700 flex-1"
                            ref={fileInputRef}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTriggerFileInput}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <FileUp className="h-4 w-4 mr-2" />
                            Browse
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Max size: 10MB per file. Allowed: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, TXT
                    </p>
                </div>

                {/* Existing Attachments (for edit mode) */}
                {isEditMode && existingAttachmentsCount > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Existing Files ({existingAttachmentsCount})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {existingAttachments.map((file) => (
                                <div 
                                    key={file.id} 
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex-shrink-0">
                                            {getFileIcon(file, file.file_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium truncate block dark:text-gray-200">
                                                {file.file_name || file.name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.file_size || file.size)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                    {file.file_type?.split('/')[1] || 'file'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveExistingFile?.(file.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Attachments */}
                {newAttachmentsCount > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            New Files ({newAttachmentsCount})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {newAttachments.map((file, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {previews[index] && file.type?.startsWith('image/') ? (
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={previews[index]} 
                                                    alt="preview" 
                                                    className="h-10 w-10 object-cover rounded-lg border dark:border-gray-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0">
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium truncate block dark:text-gray-200">
                                                {file.name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                    {file.type?.split('/')[1] || 'file'}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                                    New
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveNewFile(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isEditMode && newAttachmentsCount === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <FileUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No files uploaded yet. Click above to add attachments.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            You can upload multiple files at once
                        </p>
                    </div>
                )}

                {isEditMode && newAttachmentsCount === 0 && existingAttachmentsCount === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <FileUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No files attached. Click above to add attachments.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            You can upload supporting documents, photos, or evidence
                        </p>
                    </div>
                )}

                {/* Info message about supported files */}
                {(newAttachmentsCount > 0 || existingAttachmentsCount > 0) && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 border-t dark:border-gray-700">
                        <p>Supported formats: Images (JPG, PNG, GIF, WEBP), Documents (PDF, DOC, DOCX, XLS, XLSX), and Text files (TXT)</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};