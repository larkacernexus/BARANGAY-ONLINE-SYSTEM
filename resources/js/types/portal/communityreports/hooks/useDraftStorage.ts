// hooks/useDraftStorage.ts

import { useState, useEffect } from 'react';
import { LocalDraft } from '@/types/portal/reports/community-report';
import { generateDraftId, DRAFT_KEY, DRAFTS_LIST_KEY } from '@/types/portal/communityreports/utils/community-report-helpers';
import { toast } from 'sonner';

interface UseDraftStorageProps {
    data: any;
    files: any[];
    existingFiles: any[];
    anonymous: boolean;
    currentDraftId: string | null;
    setCurrentDraftId: (id: string | null) => void;
    setExistingFiles: (files: any[]) => void;
    reset: () => void;
    setFiles: (files: any[]) => void;
    setData: (data: any) => void;
    setSelectedTypeId: (id: number | null) => void;
    setAnonymous: (value: boolean) => void;
}

export const useDraftStorage = ({
    data,
    files,
    existingFiles,
    anonymous,
    currentDraftId,
    setCurrentDraftId,
    setExistingFiles,
    reset,
    setFiles,
    setData,
    setSelectedTypeId,
    setAnonymous
}: UseDraftStorageProps) => {
    
    const getDraftList = (): LocalDraft[] => {
        try {
            const drafts = localStorage.getItem(DRAFTS_LIST_KEY);
            return drafts ? JSON.parse(drafts) : [];
        } catch (error) {
            return [];
        }
    };

    const saveDraftList = (drafts: LocalDraft[]) => {
        try {
            localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(drafts));
        } catch (error) {
            console.error('Error saving draft list to localStorage:', error);
        }
    };

    const hasUnsavedChanges = () => {
        return data.report_type_id || 
               data.title.trim() || 
               data.description.trim() || 
               data.location.trim() || 
               files.length > 0 ||
               existingFiles.length > 0;
    };

    const saveDraft = () => {
        try {
            const draftId = currentDraftId || generateDraftId();
            const now = new Date().toISOString();
            
            const draft: LocalDraft = {
                id: draftId,
                report_type_id: data.report_type_id,
                title: data.title,
                description: data.description,
                location: data.location,
                incident_date: data.incident_date,
                incident_time: data.incident_time,
                urgency: data.urgency,
                is_anonymous: anonymous,
                reporter_name: anonymous ? '' : data.reporter_name,
                reporter_contact: anonymous ? '' : data.reporter_contact,
                files: existingFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                })),
                created_at: currentDraftId ? (() => {
                    try {
                        const existing = localStorage.getItem(DRAFT_KEY);
                        if (existing) {
                            const existingDraft = JSON.parse(existing);
                            return existingDraft.created_at || now;
                        }
                    } catch (e) {}
                    return now;
                })() : now,
                updated_at: now
            };
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            
            const draftList = getDraftList();
            const existingIndex = draftList.findIndex(d => d.id === draftId);
            if (existingIndex >= 0) {
                draftList[existingIndex] = draft;
            } else {
                draftList.push(draft);
            }
            saveDraftList(draftList);
            
            setCurrentDraftId(draftId);
        } catch (error) {
            console.error('Error saving draft to localStorage:', error);
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setCurrentDraftId(null);
        setExistingFiles([]);
        toast.success('Draft cleared');
    };

    const handleDeleteDraft = () => {
        if (!currentDraftId) return;
        
        if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
            clearDraft();
            
            const draftList = getDraftList();
            const updatedList = draftList.filter(d => d.id !== currentDraftId);
            saveDraftList(updatedList);
            
            reset();
            setFiles([]);
            setData({ ...data, evidence: [] });
            setSelectedTypeId(null);
            setAnonymous(false);
            setCurrentDraftId(null);
            
            toast.success('Draft deleted successfully');
        }
    };

    return {
        hasUnsavedChanges,
        saveDraft,
        clearDraft,
        handleDeleteDraft,
        getDraftList,
        saveDraftList
    };
};