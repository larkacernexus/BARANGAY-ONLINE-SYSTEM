// payment-show/components/tabs/AttachmentsTab.tsx
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { Plus, Inbox, Trash2 } from 'lucide-react';
import { PaymentAttachment } from '@/utils/portal/payments/payment-utils';

interface AttachmentsTabProps {
    attachments: PaymentAttachment[];
    canUpload: boolean;
    onUpload: () => void;
    onView: (attachment: PaymentAttachment) => void;
    onDownload: (attachmentId: number) => void;
    onDelete: (attachmentId: number) => void;
}

export function AttachmentsTab({ 
    attachments, 
    canUpload, 
    onUpload, 
    onView, 
    onDownload, 
    onDelete 
}: AttachmentsTabProps) {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ModernCard
            title="Attachments"
            description={`${attachments?.length || 0} file(s)`}
            action={canUpload && (
                <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={onUpload}>
                    <Plus className="h-4 w-4" />
                    Upload
                </Button>
            )}
        >
            {attachments && attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="relative group">
                            <ModernDocumentThumbnail
                                document={{
                                    ...attachment,
                                    name: attachment.original_name,
                                    size: formatFileSize(attachment.file_size),
                                    type: attachment.mime_type,
                                    url: `/storage/${attachment.file_path}`
                                }}
                                onView={() => onView(attachment)}
                                onDownload={() => onDownload(attachment.id)}
                            />
                            {canUpload && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onDelete(attachment.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <ModernEmptyState
                    status="default"
                    title="No Attachments"
                    message="No attachments have been uploaded for this payment"
                    icon={Inbox}
                    actionLabel={canUpload ? "Upload File" : undefined}
                    onAction={canUpload ? onUpload : undefined}
                />
            )}
        </ModernCard>
    );
}