// hooks/usePhotoModal.ts
import { useState, useCallback } from 'react';
import { Resident } from '@/types/admin/residents/residents-types';

interface UsePhotoModalReturn {
    isOpen: boolean;
    selectedResident: Resident | null;
    openModal: (resident: Resident) => void;
    closeModal: () => void;
}

export const usePhotoModal = (): UsePhotoModalReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    
    const openModal = useCallback((resident: Resident) => {
        setSelectedResident(resident);
        setIsOpen(true);
    }, []);
    
    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedResident(null);
    }, []);
    
    return {
        isOpen,
        selectedResident,
        openModal,
        closeModal
    };
};