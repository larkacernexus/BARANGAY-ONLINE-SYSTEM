import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Document } from '@/types/clearance';

export function useDocumentViewer(documents: Document[] = []) {
    const [viewedDocument, setViewedDocument] = useState<Document | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState<number>(-1);

    const openDocument = (document: Document, index: number) => {
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

    const handleVerifyDocument = (documentId: number, onSuccess?: (doc: Document) => void) => {
        if (confirm('Verify this document?')) {
            router.post(`/documents/${documentId}/verify`, {}, {
                onSuccess: () => {
                    if (viewedDocument && onSuccess) {
                        onSuccess({ 
                            ...viewedDocument, 
                            is_verified: true,
                            status: 'verified',
                            verified_at: new Date().toISOString() 
                        });
                    }
                }
            });
        }
    };

    const handleRejectDocument = (documentId: number, notes: string, onSuccess?: (doc: Document) => void) => {
        router.post(`/documents/${documentId}/reject`, { notes }, {
            onSuccess: () => {
                if (viewedDocument && onSuccess) {
                    onSuccess({ 
                        ...viewedDocument, 
                        is_verified: false,
                        status: 'rejected' 
                    });
                }
            }
        });
    };

    return {
        viewedDocument,
        isViewerOpen,
        currentDocumentIndex,
        openDocument,
        closeDocumentViewer,
        navigateDocument,
        handleVerifyDocument,
        handleRejectDocument
    };
}