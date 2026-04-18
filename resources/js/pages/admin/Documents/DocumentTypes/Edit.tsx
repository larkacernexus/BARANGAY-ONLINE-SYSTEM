// pages/admin/document-types/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Button } from '@/components/ui/button';
import { FileText, HardDrive, ListOrdered, History, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/document-types/create/basic-info-tab';
import { SpecsTab } from '@/components/admin/document-types/create/specs-tab';
import { SettingsTab } from '@/components/admin/document-types/create/settings-tab';
import { route } from 'ziggy-js';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CategoryOption, DocumentType } from '@/types/admin/document-types/document-types';

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['name', 'code', 'document_category_id'] },
    { id: 'specs', label: 'File Specs', icon: HardDrive, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: ListOrdered, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code', 'document_category_id'],
    specs: [],
    settings: []
};

interface FormData {
    code: string;
    name: string;
    description: string;
    document_category_id: string;
    is_required: boolean;
    is_active: boolean;
    accepted_formats: string[];
    max_file_size: number;
    sort_order: number;
}

interface PageProps {
    documentType: DocumentType;
    categories: CategoryOption[];
    commonFormats: Record<string, string>;
    [key: string]: any;
}

export default function EditDocumentType() {
    const { props } = usePage<PageProps>();
    const documentType = props.documentType;
    const categories: CategoryOption[] = props.categories || [];
    const commonFormats: Record<string, string> = props.commonFormats || {};

    const [showPreview, setShowPreview] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
    const [selectedFormats, setSelectedFormats] = useState<string[]>(documentType.accepted_formats || []);
    const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
    const [customFormat, setCustomFormat] = useState('');
    const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>(documentType.max_file_size > 1024 ? 'MB' : 'KB');
    const [fileSizeValue, setFileSizeValue] = useState(
        documentType.max_file_size > 1024 
            ? Math.round(documentType.max_file_size / 1024) 
            : documentType.max_file_size
    );
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const {
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
        resetForm,
        hasUnsavedChanges
    } = useFormManager<FormData>({
        initialData: {
            code: documentType.code || '',
            name: documentType.name || '',
            description: documentType.description || '',
            document_category_id: documentType.document_category_id?.toString() || '',
            is_required: documentType.is_required || false,
            is_active: documentType.is_active ?? true,
            accepted_formats: documentType.accepted_formats || [],
            max_file_size: documentType.max_file_size || 2048,
            sort_order: documentType.sort_order || 0,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Document name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Document code is required';
            } else if (!/^[A-Z0-9_]+$/.test(data.code)) {
                newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
            }
            if (!data.document_category_id) {
                newErrors.document_category_id = 'Category is required';
            }
            if (data.max_file_size <= 0) {
                newErrors.max_file_size = 'File size must be greater than 0';
            }
            if (data.sort_order < 0) {
                newErrors.sort_order = 'Sort order cannot be negative';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.put(route('document-types.update', documentType.id), data as any, {
                onSuccess: () => {
                    toast.success('Document type updated successfully');
                    router.visit(route('admin.document-types.show', documentType.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update document type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Handle number change
    const handleNumberChange = useCallback((name: string, value: number) => {
        updateFormData({ [name]: value });
        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

    // Handle switch change
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Handle copy to clipboard
    const handleCopy = useCallback((text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success(`${field} copied to clipboard`);
        });
    }, []);

    // Generate code from name
    const generateCode = useCallback(() => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code });
            setCodeManuallyEdited(false);
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a name first');
        }
    }, [formData.name, updateFormData]);

    // Reset auto-generate
    const resetAutoGenerate = useCallback(() => {
        setCodeManuallyEdited(false);
        if (formData.name) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code: generatedCode });
            toast.success('Auto-generation re-enabled');
        }
    }, [formData.name, updateFormData]);

    // Handle format selection
    const toggleFormat = useCallback((format: string) => {
        setSelectedFormats(prev => {
            const newFormats = prev.includes(format)
                ? prev.filter(f => f !== format)
                : [...prev, format];
            updateFormData({ accepted_formats: newFormats });
            return newFormats;
        });
    }, [updateFormData]);

    // Add custom format
    const addCustomFormat = useCallback(() => {
        if (customFormat.trim()) {
            const format = customFormat.trim().toLowerCase();
            if (!selectedFormats.includes(format)) {
                setSelectedFormats(prev => {
                    const newFormats = [...prev, format];
                    updateFormData({ accepted_formats: newFormats });
                    return newFormats;
                });
                setCustomFormat('');
                setShowCustomFormatInput(false);
                toast.success(`Format "${format}" added`);
            } else {
                toast.error('Format already exists');
            }
        }
    }, [customFormat, selectedFormats, updateFormData]);

    // Remove format
    const removeFormat = useCallback((format: string) => {
        setSelectedFormats(prev => {
            const newFormats = prev.filter(f => f !== format);
            updateFormData({ accepted_formats: newFormats });
            return newFormats;
        });
        toast.success(`Format "${format}" removed`);
    }, [updateFormData]);

    // Handle file size change
    const handleFileSizeValueChange = useCallback((value: number) => {
        setFileSizeValue(value);
        if (fileSizeUnit === 'MB') {
            updateFormData({ max_file_size: value * 1024 });
        } else {
            updateFormData({ max_file_size: value });
        }
        // Clear validation error if exists
        if (validationErrors.max_file_size) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.max_file_size;
                return newErrors;
            });
        }
    }, [fileSizeUnit, updateFormData, validationErrors]);

    // Handle file size unit change
    const handleFileSizeUnitChange = useCallback((unit: 'KB' | 'MB') => {
        setFileSizeUnit(unit);
        if (unit === 'MB') {
            setFileSizeValue(Math.round(formData.max_file_size / 1024));
        } else {
            setFileSizeValue(formData.max_file_size);
        }
    }, [formData.max_file_size]);

    // Format file size
    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 KB';
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${Math.round(bytes / 1024)} KB`;
    }, []);

    // Format date
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Get category name
    const getCategoryName = useCallback((categoryId: string) => {
        const category = categories.find(c => c.id.toString() === categoryId);
        return category?.name || 'Unknown';
    }, [categories]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setSelectedFormats(documentType.accepted_formats || []);
            setFileSizeUnit(documentType.max_file_size > 1024 ? 'MB' : 'KB');
            setFileSizeValue(
                documentType.max_file_size > 1024 
                    ? Math.round(documentType.max_file_size / 1024) 
                    : documentType.max_file_size
            );
            setCodeManuallyEdited(false);
            setValidationErrors({});
            toast.info('Form reset to original values');
        }
    }, [resetForm, documentType]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.document-types.show', documentType.id));
            }
        } else {
            router.visit(route('admin.document-types.show', documentType.id));
        }
    }, [hasUnsavedChanges, documentType.id]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('document-types.destroy', documentType.id), {
            onSuccess: () => {
                toast.success('Document type deleted successfully');
                router.visit(route('admin.document-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete document type');
                setShowDeleteDialog(false);
            }
        });
    }, [documentType.id]);

    // Count changed fields
    const changedFieldsCount = useCallback(() => {
        let count = 0;
        if (formData.code !== documentType.code) count++;
        if (formData.name !== documentType.name) count++;
        if (formData.description !== (documentType.description || '')) count++;
        if (formData.document_category_id !== documentType.document_category_id?.toString()) count++;
        if (formData.is_required !== documentType.is_required) count++;
        if (formData.is_active !== documentType.is_active) count++;
        if (JSON.stringify(formData.accepted_formats) !== JSON.stringify(documentType.accepted_formats || [])) count++;
        if (formData.max_file_size !== documentType.max_file_size) count++;
        if (formData.sort_order !== documentType.sort_order) count++;
        return count;
    }, [formData, documentType]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        specs: getTabStatus('specs'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Code', value: !!formData.code, tabId: 'basic' },
        { label: 'Category', value: !!formData.document_category_id, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'specs', 'settings'];

    return (
        <AppLayout
            title={`Edit Document Type: ${documentType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Document Types', href: '/admin/document-types' },
                { title: documentType.name, href: route('admin.document-types.show', documentType.id) },
                { title: 'Edit', href: route('admin.document-types.edit', documentType.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Document Type"
                    description={`Editing ${documentType.name}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowHistory(true)}
                                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1"
                            >
                                <History className="h-4 w-4" />
                                History
                            </button>
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                Code: {documentType.code}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                formData.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {formData.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    }
                />

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Last updated: {formatDate(documentType.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(documentType.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">
                                        {changedFieldsCount()} field{changedFieldsCount() !== 1 ? 's' : ''} modified
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Inactive Alert */}
                {!documentType.is_active && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-300">Document Type is Inactive</p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    This document type is currently inactive and won't be available for use.
                                    Toggle the active status to enable it.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <FormErrors errors={allErrors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {activeTab === 'basic' && (
                            <>
                                <FormContainer title="Basic Information" description="Update the core details for this document type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={categories}
                                        autoGenerateCode={false}
                                        copiedField={copiedField}
                                        codeManuallyEdited={codeManuallyEdited}
                                        originalName={documentType.name}
                                        originalCode={documentType.code}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onCopy={handleCopy}
                                        onGenerateCode={generateCode}
                                        onAutoGenerateToggle={() => {}}
                                        onResetAutoGenerate={resetAutoGenerate}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    showPrevious={false}
                                    nextLabel="Next: File Specs"
                                />
                            </>
                        )}

                        {activeTab === 'specs' && (
                            <>
                                <FormContainer title="File Specifications" description="Update accepted file formats and size limits">
                                    <SpecsTab
                                        formData={formData}
                                        errors={allErrors}
                                        commonFormats={commonFormats}
                                        selectedFormats={selectedFormats}
                                        showCustomFormatInput={showCustomFormatInput}
                                        customFormat={customFormat}
                                        fileSizeUnit={fileSizeUnit}
                                        fileSizeValue={fileSizeValue}
                                        onToggleFormat={toggleFormat}
                                        onAddCustomFormat={addCustomFormat}
                                        onRemoveFormat={removeFormat}
                                        onShowCustomFormatInputChange={setShowCustomFormatInput}
                                        onCustomFormatChange={setCustomFormat}
                                        onFileSizeUnitChange={handleFileSizeUnitChange}
                                        onFileSizeValueChange={handleFileSizeValueChange}
                                        formatFileSize={formatFileSize}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Update behavior and display settings">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        onNumberChange={handleNumberChange}
                                        onSwitchChange={handleSwitchChange}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: File Specs"
                                    showNext={false}
                                    submitLabel="Update Document Type"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Document Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Document Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formData.code || 'No code'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {getCategoryName(formData.document_category_id)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Max Size:</span>
                                            <span className="font-medium dark:text-gray-300">{formatFileSize(formData.max_file_size)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${
                                                formData.is_active 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {formData.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Required:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {formData.is_required ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Document Type
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{documentType.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">Document Type History</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Creation and modification details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Created</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(documentType.created_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Last Updated</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(documentType.updated_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">ID</p>
                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                {documentType.id}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowHistory(false)} className="dark:bg-gray-700 dark:text-white">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}