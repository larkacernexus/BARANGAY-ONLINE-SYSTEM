// clearance-show/components/tabs/DocumentsTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernDocumentThumbnail } from '@/components/residentui/modern-document-viewer';
import { Inbox } from 'lucide-react';
import { ClearanceDocument } from '@/types/portal/clearances/clearance.types';

interface DocumentsTabProps {
    documents: ClearanceDocument[];
    onView: (document: ClearanceDocument) => void;
    onDownload: (document: ClearanceDocument) => void;
}

export function DocumentsTab({ documents, onView, onDownload }: DocumentsTabProps) {
    return (
        <ModernCard
            title="Uploaded Documents"
            description={`${documents?.length || 0} document(s)`}
        >
            {documents && documents.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {documents.map((doc) => (
                        <ModernDocumentThumbnail
                            key={doc.id}
                            document={doc}
                            onView={() => onView(doc)}
                            onDownload={() => onDownload(doc)}
                        />
                    ))}
                </div>
            ) : (
                <ModernEmptyState
                    status="empty"
                    title="No Documents"
                    message="No documents have been uploaded for this clearance"
                    icon={Inbox}
                />
            )}
        </ModernCard>
    );
}