// components/admin/blotters/create/components/AttachmentsCard.tsx
import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, X, FileUp, Trash2 } from 'lucide-react';

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
}

interface AttachmentsCardProps {
    newAttachments?: File[];
    existingAttachments?: Attachment[];
    previews?: string[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveNewFile: (index: number) => void;
    onRemoveExistingFile?: (fileId: number) => void;
    isEditMode?: boolean;
}

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

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileUp className="h-5 w-5" />
                    Attachments
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Upload supporting documents, photos, or evidence
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="attachments" className="dark:text-gray-300">Upload Files</Label>
                    <Input
                        id="attachments"
                        type="file"
                        multiple
                        onChange={onFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        className="dark:bg-gray-900 dark:border-gray-700"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Max size: 10MB. Allowed: JPG, PNG, PDF, DOC, DOCX
                    </p>
                </div>

                {/* Existing Attachments (for edit mode) */}
                {isEditMode && existingAttachmentsCount > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Existing Files ({existingAttachmentsCount})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {existingAttachments.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm truncate block dark:text-gray-300">
                                                {file.file_name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(file.file_size / 1024).toFixed(2)} KB
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveExistingFile?.(file.id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 flex-shrink-0"
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
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {newAttachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {previews[index] && file.type?.startsWith('image/') ? (
                                            <img 
                                                src={previews[index]} 
                                                alt="preview" 
                                                className="h-8 w-8 object-cover rounded flex-shrink-0"
                                            />
                                        ) : (
                                            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        )}
                                        <span className="text-sm truncate dark:text-gray-300">
                                            {file.name}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveNewFile(index)}
                                        className="dark:hover:bg-gray-700 flex-shrink-0"
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
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No files uploaded yet. Click above to add attachments.
                    </div>
                )}

                {isEditMode && newAttachmentsCount === 0 && existingAttachmentsCount === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No files attached. Click above to add attachments.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};