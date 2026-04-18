// pages/admin/forms/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { FileText, Upload, Settings, Sparkles, RefreshCw, FileArchive, FileImage, FileSpreadsheet, File as FileDocument } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/forms/create/basic-info-tab';
import { UploadTab } from '@/components/admin/forms/create/upload-tab';
import { SettingsTab } from '@/components/admin/forms/create/settings-tab';
import { route } from 'ziggy-js';
import type { FormFormData, FormsCreateProps } from '@/types/admin/forms/forms.types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// Extend Inertia's PageProps with index signature
interface PageProps extends InertiaPageProps, FormsCreateProps {
    [key: string]: unknown;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['title'] },
    { id: 'upload', label: 'Upload', icon: Upload, requiredFields: ['file'] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['title'],
    upload: ['file'],
    settings: []
};

const CATEGORIES = [
    'Social Services',
    'Permits & Licenses',
    'Health & Medical',
    'Education',
    'Legal & Police',
    'Employment',
    'Housing',
    'Other',
];

const AGENCIES = [
    'City Mayor\'s Office',
    'DSWD',
    'PNP',
    'SSS',
    'GSIS',
    'PhilHealth',
    'BIR',
    'DENR',
    'DOLE',
    'DepEd',
    'TESDA',
    'LGU',
    'Other',
];

export default function CreateForm() {
    const { props } = usePage<PageProps>();
    const { categories = [], agencies = [] } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [filePreview, setFilePreview] = useState<{
        name: string;
        size: string;
        type: string;
    } | null>(null);
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
    } = useFormManager<FormFormData>({
        initialData: {
            title: '',
            description: '',
            category: '',
            issuing_agency: '',
            file: undefined,
            is_active: true,
            is_featured: false,
            version: '',
            changelog: '',
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.title?.trim()) {
                newErrors.title = 'Form title is required';
            }
            if (!data.category) {
                newErrors.category = 'Category is required';
            }
            if (!data.issuing_agency) {
                newErrors.issuing_agency = 'Issuing agency is required';
            }
            if (!data.file) {
                newErrors.file = 'File is required';
            } else if (data.file.size > 10 * 1024 * 1024) {
                newErrors.file = 'File size exceeds 10MB limit';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            const submitData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (key === 'file' && value instanceof File) {
                        submitData.append(key, value);
                    } else if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });

            router.post(route('admin.forms.store'), submitData, {
                onSuccess: () => {
                    toast.success('Form uploaded successfully');
                    router.visit(route('admin.forms.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to upload form');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Get file icon component
    const getFileIconComponent = useCallback((type: string) => {
        if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
        if (type.includes('word') || type.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />;
        if (type.includes('excel') || type.includes('sheet')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
        if (type.includes('image')) return <FileImage className="h-5 w-5 text-purple-500" />;
        if (type.includes('zip') || type.includes('rar')) return <FileArchive className="h-5 w-5 text-amber-500" />;
        return <FileDocument className="h-5 w-5 text-gray-500" />;
    }, []);

    // Handle file change
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || undefined;
        
        if (file && file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            setValidationErrors(prev => ({ ...prev, file: 'File size exceeds 10MB limit' }));
            return;
        }
        
        updateFormData({ file });
        
        // Clear validation error if exists
        if (validationErrors.file) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.file;
                return newErrors;
            });
        }
        
        if (file) {
            setFilePreview({
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
            });
            toast.success(`File "${file.name}" selected`);
        } else {
            setFilePreview(null);
        }
    }, [formatFileSize, updateFormData, validationErrors]);

    // Clear file
    const clearFile = useCallback(() => {
        updateFormData({ file: undefined });
        setFilePreview(null);
        toast.info('File removed');
    }, [updateFormData]);

    // Trigger file input
    const triggerFileInput = useCallback(() => {
        document.getElementById('file')?.click();
    }, []);

    // Apply template
    const applyTemplate = useCallback((template: 'barangay_clearance' | 'medical_assistance' | 'indigency') => {
        switch (template) {
            case 'barangay_clearance':
                updateFormData({
                    title: 'Barangay Clearance Application Form',
                    description: 'Official application form for Barangay Clearance. Required for employment, business permits, and other government transactions.',
                    category: 'Permits & Licenses',
                    issuing_agency: 'LGU',
                });
                toast.success('Barangay Clearance template applied');
                break;
            case 'medical_assistance':
                updateFormData({
                    title: 'Medical Assistance Application Form',
                    description: 'Application form for medical assistance from the barangay. For residents needing financial support for medical expenses.',
                    category: 'Health & Medical',
                    issuing_agency: 'LGU',
                });
                toast.success('Medical Assistance template applied');
                break;
            case 'indigency':
                updateFormData({
                    title: 'Certificate of Indigency Application',
                    description: 'Application form for Certificate of Indigency. Required for social services and government assistance programs.',
                    category: 'Social Services',
                    issuing_agency: 'DSWD',
                });
                toast.success('Certificate of Indigency template applied');
                break;
        }
        // Clear validation errors for these fields
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.title;
            delete newErrors.category;
            delete newErrors.issuing_agency;
            return newErrors;
        });
    }, [updateFormData]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setFilePreview(null);
            setValidationErrors({});
            toast.info('Form reset');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.title || formData.file) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.forms.index'));
            }
        } else {
            router.visit(route('admin.forms.index'));
        }
    }, [formData]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        upload: getTabStatus('upload'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Form Title', value: !!formData.title, tabId: 'basic' },
        { label: 'File Upload', value: !!formData.file, tabId: 'upload' },
    ];

    const tabOrder = ['basic', 'upload', 'settings'];

    return (
        <AppLayout
            title="Upload Form"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Forms', href: '/admin/forms' },
                { title: 'Upload', href: '/admin/forms/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Upload Form"
                    description="Add downloadable forms for residents"
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

                {/* Quick Templates Card */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-blue-800 dark:text-blue-300">Quick start with templates</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                Choose from common form templates to get started quickly.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('barangay_clearance')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <FileText className="h-3 w-3" />
                                    Barangay Clearance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('medical_assistance')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <FileText className="h-3 w-3" />
                                    Medical Assistance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('indigency')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <FileText className="h-3 w-3" />
                                    Certificate of Indigency
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <FormContainer title="Form Information" description="Enter the basic details for this form">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={CATEGORIES}
                                        agencies={AGENCIES}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title && !!formData.file}
                                    showPrevious={false}
                                    nextLabel="Next: Upload"
                                />
                            </>
                        )}

                        {activeTab === 'upload' && (
                            <>
                                <FormContainer title="File Upload" description="Upload the form file (PDF, Word, Excel, or Image)">
                                    <UploadTab
                                        formData={formData}
                                        errors={allErrors}
                                        filePreview={filePreview}
                                        onFileChange={handleFileChange}
                                        onClearFile={clearFile}
                                        onTriggerFileInput={triggerFileInput}
                                        getFileIcon={getFileIconComponent}
                                        formatFileSize={formatFileSize}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title && !!formData.file}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Form Settings" description="Configure form visibility and access">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        onSwitchChange={(name, checked) => updateFormData({ [name]: checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title && !!formData.file}
                                    previousLabel="Back: Upload"
                                    showNext={false}
                                    submitLabel="Upload Form"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.title && !!formData.file}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Form Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Form Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.title || <span className="text-gray-400 italic">Untitled Form</span>}
                                                </div>
                                                {formData.category && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {formData.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {formData.issuing_agency && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Agency:</span>
                                                    <span className="font-medium dark:text-gray-300">{formData.issuing_agency}</span>
                                                </div>
                                            )}
                                            {filePreview && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">File:</span>
                                                    <span className="font-medium dark:text-gray-300 truncate">{filePreview.name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`font-medium ${
                                                    formData.is_active 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {formData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}
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