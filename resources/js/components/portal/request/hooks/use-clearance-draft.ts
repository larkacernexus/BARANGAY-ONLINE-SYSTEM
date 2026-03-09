import { useState } from 'react';
import { toast } from 'sonner';
import { CLEARANCE_DRAFT_KEY, generateDraftId, type ClearanceDraft } from '@/components/portal/request/constants';

interface DraftData {
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    uploadedFiles: any[];
    selectedDocumentTypes: Set<number>;
    activeStep: number;
}

export function useClearanceDraft() {
    const [hasDraft, setHasDraft] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

    const saveDraft = (data: DraftData) => {
        try {
            const draftId = currentDraftId || generateDraftId();
            const now = new Date().toISOString();
            
            const draft: ClearanceDraft = {
                clearance_type_id: data.clearance_type_id,
                purpose: data.purpose,
                purpose_custom: data.purpose_custom,
                specific_purpose: data.specific_purpose,
                needed_date: data.needed_date,
                additional_notes: data.additional_notes,
                uploadedFilesMetadata: data.uploadedFiles.map((file: any) => ({
                    name: file.file.name,
                    size: file.file.size,
                    type: file.file.type,
                    description: file.description,
                    document_type_id: file.document_type_id
                })),
                selectedDocumentTypes: Array.from(data.selectedDocumentTypes),
                activeStep: data.activeStep,
                lastSaved: now
            };
            
            localStorage.setItem(CLEARANCE_DRAFT_KEY, JSON.stringify(draft));
            setHasDraft(true);
            setCurrentDraftId(draftId);
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(CLEARANCE_DRAFT_KEY);
        setHasDraft(false);
        setCurrentDraftId(null);
        toast.success('Draft cleared');
    };

    const deleteDraft = () => {
        if (!currentDraftId) return;
        
        if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
            clearDraft();
        }
    };

    return { hasDraft, currentDraftId, saveDraft, clearDraft, deleteDraft };
}