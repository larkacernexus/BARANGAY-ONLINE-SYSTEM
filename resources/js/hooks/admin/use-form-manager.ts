// hooks/admin/use-form-manager.ts

import { useState, useCallback, useMemo } from 'react';

interface UseFormManagerProps<T> {
    initialData: T;
    requiredFields: Record<string, string[]>;
    onSubmit: (data: T) => void;
}

interface UseFormManagerReturn<T> {
    formData: T;
    errors: Record<string, string>;
    isSubmitting: boolean;
    activeTab: string;
    formProgress: number;
    allRequiredFieldsFilled: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSelectChange: (name: string, value: string | number | null) => void;
    handleSubmit: (e?: React.FormEvent) => void;
    setActiveTab: (tab: string) => void;
    getTabStatus: (tabId: string) => 'complete' | 'incomplete' | 'error' | 'optional';
    getMissingFields: () => Array<{ field: string; label: string; tabId: string }>;
    goToNextTab: (tabOrder: string[]) => void;
    goToPrevTab: (tabOrder: string[]) => void;
    updateFormData: (updates: Partial<T>) => void;
    resetForm: () => void; // Add this
    hasUnsavedChanges?: boolean; // Optional, if you want to track this
    setIsSubmitting: (value: boolean) => void;
}

export function useFormManager<T extends Record<string, any>>({
    initialData,
    requiredFields,
    onSubmit
}: UseFormManagerProps<T>): UseFormManagerReturn<T> {
    const [formData, setFormData] = useState<T>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('basic');
    const [initialFormData] = useState<T>(initialData); // Store initial data for reset

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
        setActiveTab('basic');
        setIsSubmitting(false);
    }, [initialFormData]);

    // Check if there are unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialFormData);
    }, [formData, initialFormData]);

    // Calculate form progress
    const formProgress = useMemo(() => {
        const allRequiredFields = Object.values(requiredFields).flat();
        const filledFields = allRequiredFields.filter(field => {
            const value = formData[field];
            return value !== undefined && value !== null && value !== '';
        });
        return (filledFields.length / allRequiredFields.length) * 100;
    }, [formData, requiredFields]);

    // Check if all required fields are filled
    const allRequiredFieldsFilled = useMemo(() => {
        const allRequiredFields = Object.values(requiredFields).flat();
        return allRequiredFields.every(field => {
            const value = formData[field];
            return value !== undefined && value !== null && value !== '';
        });
    }, [formData, requiredFields]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Handle select change
    const handleSelectChange = useCallback((name: string, value: string | number | null) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Update form data partially
    const updateFormData = useCallback((updates: Partial<T>) => {
        setFormData(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    // Get tab status
    const getTabStatus = useCallback((tabId: string): 'complete' | 'incomplete' | 'error' | 'optional' => {
        const tabRequiredFields = requiredFields[tabId] || [];
        
        if (tabRequiredFields.length === 0) {
            return 'optional';
        }
        
        const allFieldsFilled = tabRequiredFields.every(field => {
            const value = formData[field];
            return value !== undefined && value !== null && value !== '';
        });
        
        const hasErrors = tabRequiredFields.some(field => errors[field]);
        
        if (hasErrors) return 'error';
        if (allFieldsFilled) return 'complete';
        return 'incomplete';
    }, [formData, errors, requiredFields]);

    // Get missing fields for a tab
    const getMissingFields = useCallback(() => {
        const missing: Array<{ field: string; label: string; tabId: string }> = [];
        
        Object.entries(requiredFields).forEach(([tabId, fields]) => {
            fields.forEach(field => {
                const value = formData[field];
                if (value === undefined || value === null || value === '') {
                    missing.push({
                        field,
                        label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        tabId
                    });
                }
            });
        });
        
        return missing;
    }, [formData, requiredFields]);

    // Navigate to next tab
    const goToNextTab = useCallback((tabOrder: string[]) => {
        const currentIndex = tabOrder.indexOf(activeTab);
        if (currentIndex < tabOrder.length - 1) {
            setActiveTab(tabOrder[currentIndex + 1]);
        }
    }, [activeTab]);

    // Navigate to previous tab
    const goToPrevTab = useCallback((tabOrder: string[]) => {
        const currentIndex = tabOrder.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabOrder[currentIndex - 1]);
        }
    }, [activeTab]);

    // Handle form submission
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        // Validate all required fields
        const allRequiredFields = Object.values(requiredFields).flat();
        const newErrors: Record<string, string> = {};
        
        allRequiredFields.forEach(field => {
            const value = formData[field];
            if (value === undefined || value === null || value === '') {
                newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSubmit, requiredFields]);

    return {
        formData,
        errors,
        isSubmitting,
        activeTab,
        formProgress,
        allRequiredFieldsFilled,
        handleInputChange,
        handleSelectChange,
        handleSubmit,
        setActiveTab,
        getTabStatus,
        getMissingFields,
        goToNextTab,
        goToPrevTab,
        updateFormData,
        resetForm, // Return resetForm
        hasUnsavedChanges, // Optional: return this if you want to track unsaved changes
        setIsSubmitting
    };
}