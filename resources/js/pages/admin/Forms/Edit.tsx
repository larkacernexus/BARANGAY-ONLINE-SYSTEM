// pages/admin/forms/edit.tsx
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
import { FileText, Upload, Settings, History, Trash2, RefreshCw, FileArchive, FileImage, FileSpreadsheet, File as FileDocument } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/forms/create/basic-info-tab';
import { UploadTab } from '@/components/admin/forms/create/upload-tab';
import { SettingsTab } from '@/components/admin/forms/create/settings-tab';
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
import type { Form, FormFormData, FormsEditProps } from '@/types/admin/forms/forms.types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// Extend Inertia's PageProps with index signature
interface PageProps extends InertiaPageProps, FormsEditProps {
    [key: string]: unknown;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['title'] },
    { id: 'upload', label: 'File', icon: Upload, requiredFields: ['file'] },
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

export default function EditForm() {
    const { props } = usePage<PageProps>();
    const form = props.form;

    const [showPreview, setShowPreview] = useState(true);
    const [replaceFile, setReplaceFile] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Format file size - MOVED BEFORE it's used
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const [filePreview, setFilePreview] = useState<{
        name: string;
        size: string;
        type: string;
        isExisting: boolean;
    } | null>(form.file_name ? {
        name: form.file_name,
        size: formatFileSize(form.file_size),
        type: form.file_type,
        isExisting: true,
    } : null);

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
    } = useFormManager<FormFormData & { existing_file?: any }>({
        initialData: {
            title: form.title || '',
            description: form.description || '',
            category: form.category || '',
            issuing_agency: form.issuing_agency || '',
            file: undefined,
            is_active: form.is_active,
            is_featured: (form as any).is_featured || false,
            version: (form as any).version || '',
            changelog: '',
            existing_file: {
                name: form.file_name,
                size: formatFileSize(form.file_size),
                path: form.file_path,
                type: form.file_type,
            },
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.title?.trim()) {
                newErrors.title = 'Form title is required';
            }
            if (!data.category && data.category !== '') {
                newErrors.category = 'Category is required';
            }
            if (!data.issuing_agency && data.issuing_agency !== '') {
                newErrors.issuing_agency = 'Issuing agency is required';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            const submitData = new FormData();
            submitData.append('title', data.title);
            submitData.append('description', data.description || '');
            submitData.append('category', data.category || '');
            submitData.append('issuing_agency', data.issuing_agency || '');
            submitData.append('is_active', data.is_active ? '1' : '0');
            submitData.append('is_featured', data.is_featured ? '1' : '0');
            
            if (data.file instanceof File) {
                if (data.file.size > 10 * 1024 * 1024) {
                    newErrors.file = 'File size exceeds 10MB limit';
                    setValidationErrors(newErrors);
                    toast.error('File size exceeds 10MB limit');
                    return;
                }
                submitData.append('file', data.file);
                submitData.append('replace_file', '1');
            } else {
                submitData.append('replace_file', '0');
            }
            submitData.append('_method', 'PUT');

            router.post(route('admin.forms.update', form.id), submitData, {
                onSuccess: () => {
                    toast.success('Form updated successfully');
                    router.visit(route('admin.forms.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update form');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

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
        setReplaceFile(!!file);
        
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
                isExisting: false,
            });
            toast.success(`File "${file.name}" selected for upload`);
        } else if (!replaceFile && formData.existing_file) {
            setFilePreview({
                name: formData.existing_file.name,
                size: formData.existing_file.size,
                type: formData.existing_file.type,
                isExisting: true,
            });
        }
    }, [formatFileSize, updateFormData, validationErrors, replaceFile, formData.existing_file]);

    // Remove new file
    const removeNewFile = useCallback(() => {
        updateFormData({ file: undefined });
        setReplaceFile(false);
        if (formData.existing_file) {
            setFilePreview({
                name: formData.existing_file.name,
                size: formData.existing_file.size,
                type: formData.existing_file.type,
                isExisting: true,
            });
        } else {
            setFilePreview(null);
        }
        toast.info('New file removed, keeping existing file');
    }, [updateFormData, formData.existing_file]);

    // Cancel replace
    const cancelReplace = useCallback(() => {
        setReplaceFile(false);
        updateFormData({ file: undefined });
        if (formData.existing_file) {
            setFilePreview({
                name: formData.existing_file.name,
                size: formData.existing_file.size,
                type: formData.existing_file.type,
                isExisting: true,
            });
        }
    }, [updateFormData, formData.existing_file]);

    // Trigger file input
    const triggerFileInput = useCallback(() => {
        document.getElementById('file')?.click();
    }, []);

    // Download current file
    const downloadCurrentFile = useCallback(() => {
        if (formData.existing_file?.path) {
            window.open(formData.existing_file.path, '_blank');
        }
    }, [formData.existing_file]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setReplaceFile(false);
            setValidationErrors({});
            setFilePreview({
                name: form.file_name,
                size: formatFileSize(form.file_size),
                type: form.file_type,
                isExisting: true,
            });
            toast.info('Form reset to original values');
        }
    }, [resetForm, form, formatFileSize]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.forms.index'));
            }
        } else {
            router.visit(route('admin.forms.index'));
        }
    }, [hasUnsavedChanges]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('admin.forms.destroy', form.id), {
            onSuccess: () => {
                toast.success('Form deleted successfully');
                router.visit(route('admin.forms.index'));
            },
            onError: () => {
                toast.error('Failed to delete form');
                setShowDeleteDialog(false);
            }
        });
    }, [form.id]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        upload: getTabStatus('upload'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Form Title', value: !!formData.title, tabId: 'basic' },
        { label: 'File Upload', value: !!(formData.file || formData.existing_file), tabId: 'upload' },
    ];

    const tabOrder = ['basic', 'upload', 'settings'];

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

    // Count changed fields
    const changedFieldsCount = useMemo(() => {
        let count = 0;
        if (formData.title !== form.title) count++;
        if (formData.description !== (form.description || '')) count++;
        if (formData.category !== (form.category || '')) count++;
        if (formData.issuing_agency !== (form.issuing_agency || '')) count++;
        if (formData.is_active !== form.is_active) count++;
        if (formData.file !== undefined && formData.file !== null) count++;
        return count;
    }, [formData, form]);

    return (
        <AppLayout
            title={`Edit Form: ${form.title}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Forms', href: '/admin/forms' },
                { title: form.title, href: route('admin.forms.show', form.id) },
                { title: 'Edit', href: route('admin.forms.edit', form.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Form"
                    description={`Editing ${form.title}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
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
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {form.id}
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
                                    Last updated: {formatDate(form.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(form.created_at)}
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
                                        {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
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
                                <FormContainer title="Form Information" description="Update the basic details for this form">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={CATEGORIES}
                                        agencies={AGENCIES}
                                        originalTitle={form.title}
                                        originalCategory={form.category || undefined}
                                        originalAgency={form.issuing_agency || undefined}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title}
                                    showPrevious={false}
                                    nextLabel="Next: File"
                                />
                            </>
                        )}

                        {activeTab === 'upload' && (
                            <>
                                <FormContainer title="File Management" description="Manage the form file">
                                    <UploadTab
                                        formData={formData}
                                        errors={allErrors}
                                        filePreview={filePreview}
                                        replaceFile={replaceFile}
                                        onFileChange={handleFileChange}
                                        onRemoveNewFile={removeNewFile}
                                        onCancelReplace={cancelReplace}
                                        onReplaceClick={() => setReplaceFile(true)}
                                        onDownloadCurrent={downloadCurrentFile}
                                        onTriggerFileInput={triggerFileInput}
                                        getFileIcon={getFileIconComponent}
                                        formatFileSize={formatFileSize}
                                        isSubmitting={isSubmitting} onClearFile={function (): void {
                                            throw new Error('Function not implemented.');
                                        } }                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title && !!(formData.file || formData.existing_file)}
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
                                        downloads={(form as any).downloads || 0}
                                        onSwitchChange={(name, checked) => updateFormData({ [name]: checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.title && !!(formData.file || formData.existing_file)}
                                    previousLabel="Back: File"
                                    showNext={false}
                                    submitLabel="Update Form"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.title && !!(formData.file || formData.existing_file)}
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
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                                                <span className="font-medium dark:text-gray-300">{(form as any).downloads || 0}</span>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Form
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{form.title}"? This action cannot be undone.
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
        </AppLayout>
    );
}