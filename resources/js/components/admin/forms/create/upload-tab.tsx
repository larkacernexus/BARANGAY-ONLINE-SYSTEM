// components/admin/forms/create/upload-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, FileSpreadsheet, FileImage, FileArchive, File, AlertCircle, CheckCircle } from 'lucide-react';
import { JSX } from 'react';
import type { FormFormData } from '@/types/admin/forms/forms.types';

interface UploadTabProps {
    formData: FormFormData & { existing_file?: { name: string; size: string; path: string; type: string } };
    errors: Record<string, string>;
    filePreview: { name: string; size: string; type: string; isExisting?: boolean } | null;
    replaceFile?: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFile: () => void;
    onTriggerFileInput: () => void;
    getFileIcon: (type: string) => JSX.Element;
    formatFileSize: (bytes: number) => string;
    isSubmitting: boolean;
    // Optional props for edit mode
    onRemoveNewFile?: () => void;
    onCancelReplace?: () => void;
    onReplaceClick?: () => void;
    onDownloadCurrent?: () => void;
}

export function UploadTab({
    formData,
    errors,
    filePreview,
    replaceFile = false,
    onFileChange,
    onClearFile,
    onTriggerFileInput,
    getFileIcon,
    formatFileSize,
    isSubmitting,
    onRemoveNewFile,
    onCancelReplace,
    onReplaceClick,
    onDownloadCurrent
}: UploadTabProps) {
    const hasExistingFile = !!formData.existing_file?.name;
    const hasNewFile = !!formData.file;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="file" className="dark:text-gray-300">
                    Form File <span className="text-red-500">*</span>
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    hasNewFile
                        ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                        : hasExistingFile && !replaceFile
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}>
                    <div className="flex flex-col items-center justify-center text-center">
                        {hasNewFile ? (
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                        ) : hasExistingFile && !replaceFile ? (
                            <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                        ) : (
                            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                        )}
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">
                                {hasNewFile
                                    ? 'New File Selected'
                                    : hasExistingFile && !replaceFile
                                    ? 'Existing File Kept'
                                    : 'Upload form file'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, Word, Excel, or Image files up to 10MB
                            </p>
                        </div>
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            className="hidden"
                            onChange={onFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="button"
                                variant={hasNewFile || (hasExistingFile && !replaceFile) ? "outline" : "default"}
                                className="dark:border-gray-600 dark:text-gray-300"
                                onClick={onTriggerFileInput}
                            >
                                {hasNewFile ? 'Change File' : hasExistingFile && !replaceFile ? 'Replace File' : 'Choose File'}
                            </Button>
                            {hasExistingFile && !replaceFile && onDownloadCurrent && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onDownloadCurrent}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Download Current
                                </Button>
                            )}
                            {replaceFile && onCancelReplace && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancelReplace}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    Cancel Replace
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {errors.file && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.file}</p>
                )}
            </div>

            {/* Current File Display (Edit Mode) */}
            {hasExistingFile && !replaceFile && !hasNewFile && (
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon(formData.existing_file!.type)}
                            <div>
                                <p className="font-medium dark:text-gray-200">{formData.existing_file!.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formData.existing_file!.size} • Current file
                                </p>
                            </div>
                        </div>
                        {onReplaceClick && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onReplaceClick}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Replace File
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* New File Preview */}
            {hasNewFile && filePreview && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon(filePreview.type)}
                            <div>
                                <p className="font-medium dark:text-gray-200">{filePreview.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filePreview.size} • New file
                                </p>
                                <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Will replace existing file
                                </Badge>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemoveNewFile || onClearFile}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* File Requirements */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Important Notes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Only upload forms from legitimate government agencies</li>
                            <li>Ensure forms are the latest version</li>
                            <li>Files should be readable and not corrupted</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Supported formats: PDF, Word, Excel, JPEG, PNG</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}