// pages/admin/document-types/create.tsx
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
import { FileText, HardDrive, ListOrdered, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/document-types/create/basic-info-tab';
import { SpecsTab } from '@/components/admin/document-types/create/specs-tab';
import { SettingsTab } from '@/components/admin/document-types/create/settings-tab';
import { route } from 'ziggy-js';
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
    categories: CategoryOption[];
    commonFormats: Record<string, string>;
    [key: string]: any;
}

export default function DocumentTypeCreate() {
    const { props } = usePage<PageProps>();
    const categories: CategoryOption[] = props.categories || [];
    const commonFormats: Record<string, string> = props.commonFormats || {};

    const [showPreview, setShowPreview] = useState(true);
    const [autoGenerateCode, setAutoGenerateCode] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
    const [customFormat, setCustomFormat] = useState('');
    const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>('KB');
    const [fileSizeValue, setFileSizeValue] = useState(2048);
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
        resetForm
    } = useFormManager<FormData>({
        initialData: {
            code: '',
            name: '',
            description: '',
            document_category_id: '',
            is_required: false,
            is_active: true,
            accepted_formats: [],
            max_file_size: 2048,
            sort_order: 0,
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
            
            router.post(route('document-types.store'), data as any, {
                onSuccess: () => {
                    toast.success('Document type created successfully');
                    router.visit(route('admin.document-types.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create document type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Generate code from name (only if auto-generate is enabled)
    const generateCode = useCallback(() => {
        if (formData.name && autoGenerateCode) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            if (code !== formData.code) {
                updateFormData({ code });
            }
        }
    }, [formData.name, autoGenerateCode, formData.code, updateFormData]);

    // Auto-generate code when name changes and autoGenerateCode is true
    useEffect(() => {
        if (autoGenerateCode && formData.name) {
            generateCode();
        }
    }, [formData.name, autoGenerateCode, generateCode]);

    // Handle copy to clipboard
    const handleCopy = useCallback((text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success(`${field} copied to clipboard`);
        });
    }, []);

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
    }, [fileSizeUnit, updateFormData]);

    // Handle file size unit change
    const handleFileSizeUnitChange = useCallback((unit: 'KB' | 'MB') => {
        setFileSizeUnit(unit);
        if (unit === 'MB') {
            setFileSizeValue(Math.round(formData.max_file_size / 1024));
        } else {
            setFileSizeValue(formData.max_file_size);
        }
    }, [formData.max_file_size]);

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

    // Format file size
    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 KB';
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${Math.round(bytes / 1024)} KB`;
    }, []);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setSelectedFormats([]);
            setFileSizeUnit('KB');
            setFileSizeValue(2048);
            setValidationErrors({});
            setAutoGenerateCode(true);
            toast.info('Form reset');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.document-types.index'));
            }
        } else {
            router.visit(route('admin.document-types.index'));
        }
    }, [formData]);

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
            title="Create Document Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Document Types', href: '/admin/document-types' },
                { title: 'Create', href: '/admin/document-types/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Document Type"
                    description="Add a new document type to the system"
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reset
                            </button>
                        </div>
                    }
                />

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
                                <FormContainer title="Basic Information" description="Enter the core details for this document type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={categories}
                                        autoGenerateCode={autoGenerateCode}
                                        copiedField={copiedField}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onCopy={handleCopy}
                                        onGenerateCode={generateCode}
                                        onAutoGenerateToggle={setAutoGenerateCode}
                                        isSubmitting={isSubmitting}
                                        isEdit={false}
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
                                <FormContainer title="File Specifications" description="Configure accepted file formats and size limits">
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
                                        isEdit={false}
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
                                <FormContainer title="Settings" description="Configure behavior and display settings">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        onNumberChange={handleNumberChange}
                                        onSwitchChange={handleSwitchChange}
                                        isSubmitting={isSubmitting}
                                        isEdit={false}
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
                                    submitLabel="Create Document Type"
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
                                                {categories.find(c => c.id.toString() === formData.document_category_id)?.name || 'Not selected'}
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
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Sort Order:</span>
                                            <span className="font-medium dark:text-gray-300">{formData.sort_order}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}