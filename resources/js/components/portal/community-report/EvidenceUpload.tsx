// components/community-report/EvidenceUpload.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Info, Image as ImageIcon, Video, FileText, File } from 'lucide-react';
import { FileWithPreview } from '@/types/portal/community-report';
import { getFileIcon, formatFileSize } from '@/types/portal/communityreports/utils/community-report-helpers';

interface EvidenceUploadProps {
    files: FileWithPreview[];
    existingFiles: Array<{name: string, size: number, type: string, lastModified: number, preview?: string}>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (id: string) => void;
    onRemoveExistingFile: (index: number) => void;
    onClearAllNew: () => void;
    onClearAllExisting: () => void;
    onOpenPreview: (url: string, type: string, name: string) => void;
    requiresEvidence?: boolean;
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
    requiresEvidence = false
}) => {
    return (
        <Card className="rounded-xl">
            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf,video/mp4,video/mov,video/avi"
                    onChange={onFileSelect}
                    className="hidden"
                />
                
                <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="font-semibold mb-2">Click to upload evidence</h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Drag and drop or click to browse files
                    </p>
                    <Button type="button" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Select Files
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">
                        JPG, PNG, GIF, WebP, PDF, MP4, MOV, AVI • Max 5MB per file • Up to 10 files
                    </p>
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
                                        className="text-xs h-7 px-3"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {existingFiles.map((file, index) => {
                                        const FileIcon = getFileIcon(file.type);
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <div key={index} className="border rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white dark:bg-gray-900">
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'
                                                            }`}>
                                                                <FileIcon className={`h-5 w-5 ${
                                                                    isImage ? 'text-blue-500' : 'text-gray-500'
                                                                }`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{file.name}</p>
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
                                                            className="flex-shrink-0 h-8 w-8"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isImage && file.preview && (
                                                        <div className="mt-3">
                                                            <div 
                                                                className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                                onClick={() => onOpenPreview(file.preview!, file.type, file.name)}
                                                            >
                                                                <img 
                                                                    src={file.preview} 
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
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
                                        className="text-xs h-7 px-3"
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
                                                                isImage ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900'
                                                            }`}>
                                                                <FileIcon className={`h-5 w-5 ${
                                                                    isImage ? 'text-blue-500' : 'text-gray-500'
                                                                }`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{file.name}</p>
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
                                                            className="flex-shrink-0 h-8 w-8"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isImage && file.preview && (
                                                        <div className="mt-3">
                                                            <div 
                                                                className="relative aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
                                                                onClick={() => onOpenPreview(file.preview, file.type, file.name)}
                                                            >
                                                                <img 
                                                                    src={file.preview} 
                                                                    alt={file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
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