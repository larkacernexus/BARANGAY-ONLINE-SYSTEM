// components/admin/announcements/create/attachments-tab.tsx
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Upload, X, Trash2, Maximize2, Paperclip, FileText, FileImage, FileSpreadsheet, FileArchive } from 'lucide-react';

interface Attachment {
    id?: number;
    file: File;
    preview?: string;
    name: string;
    size: number;
    type: string;
    error?: string;
    isImage?: boolean;
}

interface AttachmentsTabProps {
    attachments: Attachment[];
    maxFileSize: number;
    allowedFileTypes: string[];
    isDragging: boolean;
    isSubmitting: boolean;
    onFileSelect: (files: FileList | null) => void;
    onRemoveAttachment: (index: number) => void;
    onClearAttachments: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onPreviewImage: (attachment: Attachment) => void;
    formatFileSize: (bytes: number) => string;
    getFileIcon: (attachment: Attachment) => any;
    errors: Record<string, string>;
}

export function AttachmentsTab({
    attachments,
    maxFileSize,
    allowedFileTypes,
    isDragging,
    isSubmitting,
    onFileSelect,
    onRemoveAttachment,
    onClearAttachments,
    onDrop,
    onDragOver,
    onDragLeave,
    onPreviewImage,
    formatFileSize,
    getFileIcon,
    errors
}: AttachmentsTabProps) {
    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${isDragging 
                        ? 'border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20' 
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                `}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="hidden"
                    onChange={(e) => onFileSelect(e.target.files)}
                    accept={allowedFileTypes.join(',')}
                />
                
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-lg dark:text-gray-100">
                        Drop files here or click to upload
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Drag and drop your files here, or click to browse
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Max size: {maxFileSize}MB</span>
                        {allowedFileTypes.slice(0, 3).map((type, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{type}</span>
                        ))}
                        {allowedFileTypes.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">+{allowedFileTypes.length - 3} more</span>
                        )}
                    </div>
                </div>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold dark:text-gray-100">
                            Selected Files ({attachments.length})
                        </h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearAttachments}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {attachments.map((attachment, index) => {
                            const FileIcon = getFileIcon(attachment);
                            
                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center gap-3 p-3 border rounded-lg
                                        ${attachment.error 
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }
                                        transition-colors
                                    `}
                                >
                                    {/* Thumbnail for images */}
                                    {attachment.isImage && attachment.preview ? (
                                        <div className="relative group flex-shrink-0">
                                            <img
                                                src={attachment.preview}
                                                alt={attachment.name}
                                                className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPreviewImage(attachment);
                                                }}
                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                                <Maximize2 className="h-4 w-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <FileIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                        </div>
                                    )}

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate dark:text-gray-200">
                                                {attachment.name}
                                            </p>
                                            {attachment.error && (
                                                <Badge variant="destructive" className="text-xs flex-shrink-0">
                                                    Error
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatFileSize(attachment.size)}</span>
                                            <span>•</span>
                                            <span className="truncate">
                                                {attachment.type || 'Unknown type'}
                                            </span>
                                        </div>
                                        {attachment.error && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                {attachment.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                            onClick={() => onRemoveAttachment(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {errors.attachments && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.attachments}</p>
            )}
        </div>
    );
}