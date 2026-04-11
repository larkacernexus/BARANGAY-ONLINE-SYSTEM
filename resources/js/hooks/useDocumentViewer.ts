import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ClearanceDocument } from '@/types/admin/clearances/clearance'; // Change this import

export function useDocumentViewer(documents: ClearanceDocument[] = []) { // Change the type here
    const [viewedDocument, setViewedDocument] = useState<ClearanceDocument | null>(null); // Change here
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState<number>(-1);

    const openDocument = (document: ClearanceDocument, index: number) => { // Change here
        setViewedDocument(document);
        setCurrentDocumentIndex(index);
        setIsViewerOpen(true);
    };

    const closeDocumentViewer = () => {
        setIsViewerOpen(false);
        setViewedDocument(null);
        setCurrentDocumentIndex(-1);
    };

    const navigateDocument = (direction: 'next' | 'prev') => {
        let newIndex = currentDocumentIndex;
        
        if (direction === 'next' && currentDocumentIndex < documents.length - 1) {
            newIndex = currentDocumentIndex + 1;
        } else if (direction === 'prev' && currentDocumentIndex > 0) {
            newIndex = currentDocumentIndex - 1;
        }
        
        if (newIndex !== currentDocumentIndex) {
            setViewedDocument(documents[newIndex]);
            setCurrentDocumentIndex(newIndex);
        }
    };

    const handleVerifyDocument = (documentId: number, onSuccess?: (doc: ClearanceDocument) => void) => { // Change here
        if (confirm('Verify this document?')) {
            router.post(`/documents/${documentId}/verify`, {}, {
                onSuccess: () => {
                    if (viewedDocument && onSuccess) {
                        onSuccess({ 
                            ...viewedDocument, 
                            verification_status: 'verified', // Change from is_verified/status to verification_status
                            verified_at: new Date().toISOString() 
                        });
                    }
                }
            });
        }
    };

    const handleRejectDocument = (documentId: number, notes: string, onSuccess?: (doc: ClearanceDocument) => void) => { // Change here
        router.post(`/documents/${documentId}/reject`, { notes }, {
            onSuccess: () => {
                if (viewedDocument && onSuccess) {
                    onSuccess({ 
                        ...viewedDocument, 
                        verification_status: 'rejected', // Change from is_verified/status to verification_status
                        rejection_reason: notes
                    });
                }
            }
        });
    };

    return {
        viewedDocument,
        setViewedDocument,
        isViewerOpen,
        currentDocumentIndex,
        openDocument,
        closeDocumentViewer,
        navigateDocument,
        handleVerifyDocument,
        handleRejectDocument
    };
}