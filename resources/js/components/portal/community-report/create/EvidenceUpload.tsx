// components/community-report/EvidenceUpload.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Info, File, AlertCircle } from 'lucide-react';
import { FileWithPreview } from '@/types/portal/reports/community-report';
import { getFileIcon, formatFileSize } from '@/types/portal/communityreports/utils/community-report-helpers';

interface EvidenceUploadProps {
    files: FileWithPreview[];
    existingFiles: Array<{name: string, size: number, type: string, lastModified: number, preview?: string}>;
    fileInputRef: React.RefObject<HTMLInputElement | null>; // Updated to accept null
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (id: string) => void;
    onRemoveExistingFile: (index: number) => void;
    onClearAllNew: () => void;
    onClearAllExisting: () => void;
    onOpenPreview: (url: string, type: string, name: string) => void;
    requiresEvidence?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
    files,
    existingFiles,
    fileInputRef,
    onFileSelect,
    onRemoveFile,
    onRemoveExistingFile,
    onClearAllNew,
    onClearAllExisting,
    onOpenPreview,
    requiresEvidence = false,
    maxFiles = 10,
    maxFileSize = 10
}) => {
    const totalFiles = files.length + existingFiles.length;
    const isAtMaxFiles = totalFiles >= maxFiles;

    const handleUploadClick = () => {
        if (!isAtMaxFiles && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Card className="rounded-xl">
            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/mov,video/avi"
                    onChange={onFileSelect}
                    className="hidden"
                    disabled={isAtMaxFiles}
                />
                
                {/* Required Evidence Notice */}
                {requiresEvidence && totalFiles === 0 && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Evidence is required for this type of report. Please upload at least one file.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Upload Area */}
                <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isAtMaxFiles 
                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 cursor-not-allowed opacity-60'
                            : 'bg-gray-50 dark:bg-gray-900 cursor-pointer hover:border-blue-500'
                    }`}
                    onClick={handleUploadClick}
                >
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="font-semibold mb-2">
                        {isAtMaxFiles ? 'Maximum files reached' : 'Click to upload evidence'}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        {isAtMaxFiles 
                            ? `You have reached the maximum of ${maxFiles} files`
                            : 'Drag and drop or click to browse files'
                        }
                    </p>
                    {!isAtMaxFiles && (
                        <Button type="button" variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            Select Files
                        </Button>
                    )}
                    <p className="text-xs text-gray-400 mt-4">
                        JPG, PNG, GIF, WebP, PDF, MP4, MOV, AVI • Max {maxFileSize}MB per file • Up to {maxFiles} files
                    </p>
                    {totalFiles > 0 && (
                        <p className="text-xs text-blue-600 mt-2">
                            {totalFiles} of {maxFiles} files used
                        </p>
                    )}
                </div>

                {/* File Lists */}
                {(existingFiles.length > 0 || files.length > 0) && (
                    <div className="space-y-4">
                        {/* Existing Files from Draft */}
                        {existingFiles.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Saved Files ({existingFiles.length})</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearAllExisting}
                                        className="text-xs h-7 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {existingFiles.map((file, index) => {
                                        const FileIcon = getFileIcon(file.type);
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <div key={`existing-${index}`} className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white dark:bg-gray-900">
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                                            }`}>
                                                                <FileIcon className={`h-5 w-5 ${
                                                                    isImage ? 'text-blue-500' : 'text-gray-500'
                                                                }`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate" title={file.name}>
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onRemoveExistingFile(index)}
                                                            className="flex-shrink-0 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isImage && file.preview && (
                                                        <div className="mt-3">
                                                            <div 
                                                                className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                                                                onClick={() => onOpenPreview(file.preview!, file.type, file.name)}
                                                            >
                                                                <img 
                                                                    src={file.preview} 
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-white text-xs font-medium">Click to preview</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!isImage && (
                                                        <div className="mt-3">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-xs"
                                                                onClick={() => onOpenPreview(file.preview || '#', file.type, file.name)}
                                                            >
                                                                Preview File
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* New Files */}
                        {files.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">New Files ({files.length})</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearAllNew}
                                        className="text-xs h-7 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {files.map((file) => {
                                        if (!file) return null;
                                        const FileIcon = getFileIcon(file.type);
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <div key={file.id} className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white dark:bg-gray-900">
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                                            }`}>
                                                                <FileIcon className={`h-5 w-5 ${
                                                                    isImage ? 'text-blue-500' : 'text-gray-500'
                                                                }`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate" title={file.name}>
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onRemoveFile(file.id)}
                                                            className="flex-shrink-0 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isImage && file.preview && (
                                                        <div className="mt-3">
                                                            <div 
                                                                className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                                                                onClick={() => onOpenPreview(file.preview!, file.type, file.name)}
                                                            >
                                                                <img 
                                                                    src={file.preview} 
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-white text-xs font-medium">Click to preview</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!isImage && (
                                                        <div className="mt-3">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-xs"
                                                                onClick={() => onOpenPreview(file.preview || '#', file.type, file.name)}
                                                            >
                                                                Preview File
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State when no files */}
                {totalFiles === 0 && (
                    <div className="text-center py-8">
                        <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                            No files uploaded yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Click the upload area above to add files
                        </p>
                    </div>
                )}

                {/* Evidence Tips */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-sm font-medium mb-1">What makes good evidence?</h5>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Clear photos showing the issue or incident</li>
                                <li>• Timestamps and location information</li>
                                <li>• Multiple angles and context shots</li>
                                <li>• Documents supporting your report</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};