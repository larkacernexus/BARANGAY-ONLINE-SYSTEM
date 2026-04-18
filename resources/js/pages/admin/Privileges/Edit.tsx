// pages/admin/privileges/edit.tsx
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
import { Award, Percent, Settings, History, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BasicInfoTab } from '@/components/admin/privileges/create/basic-info-tab';
import { DiscountTab } from '@/components/admin/privileges/create/discount-tab';
import { SettingsTab } from '@/components/admin/privileges/create/settings-tab';
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
import type { 
    DiscountType, 
    Privilege, 
    PrivilegeFormData 
} from '@/types/admin/privileges/privilege.types';

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: Award, requiredFields: ['name', 'code'] },
    { id: 'discount', label: 'Discount', icon: Percent, requiredFields: ['discount_type_id', 'default_discount_percentage'] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code'],
    discount: ['discount_type_id', 'default_discount_percentage'],
    settings: []
};

interface PageProps {
    privilege: Privilege;
    discountTypes: DiscountType[];
    [key: string]: unknown;
}

// Helper function for safe number conversion
const safeNumber = (value: string | number | undefined | null, defaultValue: number = 0): number => {
    if (value === undefined || value === null || value === '') return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
};

export default function EditPrivilege() {
    const { props } = usePage<PageProps>();
    const privilege = props.privilege;
    const discountTypes: DiscountType[] = props.discountTypes || [];

    const [showPreview, setShowPreview] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
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
    } = useFormManager<PrivilegeFormData>({
        initialData: {
            name: privilege.name || '',
            code: privilege.code || '',
            description: privilege.description || '',
            discount_type_id: privilege.discount_type_id,
            default_discount_percentage: typeof privilege.default_discount_percentage === 'string' 
                ? parseFloat(privilege.default_discount_percentage) 
                : privilege.default_discount_percentage,
            requires_id_number: privilege.requires_id_number,
            requires_verification: privilege.requires_verification,
            validity_years: privilege.validity_years,
            is_active: privilege.is_active,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Privilege name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Privilege code is required';
            }
            if (!data.discount_type_id) {
                newErrors.discount_type_id = 'Discount type is required';
            }
            if (data.default_discount_percentage <= 0) {
                newErrors.default_discount_percentage = 'Discount percentage must be greater than 0';
            }
            if (data.default_discount_percentage > 100) {
                newErrors.default_discount_percentage = 'Discount percentage cannot exceed 100';
            }
            if (data.validity_years !== null && data.validity_years < 0) {
                newErrors.validity_years = 'Validity years cannot be negative';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.put(route('admin.privileges.update', privilege.id), data as any, {
                onSuccess: () => {
                    toast.success('Privilege updated successfully');
                    router.visit(route('admin.privileges.show', privilege.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update privilege');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Memoized values
    const selectedDiscountType = useMemo(() => {
        if (!formData.discount_type_id) return null;
        return discountTypes.find(dt => dt.id === formData.discount_type_id);
    }, [discountTypes, formData.discount_type_id]);

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
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a privilege name first');
        }
    }, [formData.name, updateFormData]);

    // Handle number change
    const handleNumberChange = useCallback((name: string, value: string) => {
        const parsedValue = name === 'default_discount_percentage' 
            ? parseFloat(value) 
            : (value === '' ? null : parseInt(value));
        
        updateFormData({ [name]: parsedValue });
        
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

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setValidationErrors({});
            toast.info('Form reset to original values');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.privileges.show', privilege.id));
            }
        } else {
            router.visit(route('admin.privileges.show', privilege.id));
        }
    }, [hasUnsavedChanges, privilege.id]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('admin.privileges.destroy', privilege.id), {
            onSuccess: () => {
                toast.success('Privilege deleted successfully');
                router.visit(route('admin.privileges.index'));
            },
            onError: () => {
                toast.error('Failed to delete privilege');
                setShowDeleteDialog(false);
            }
        });
    }, [privilege.id]);

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
        if (formData.name !== privilege.name) count++;
        if (formData.code !== privilege.code) count++;
        if (formData.description !== (privilege.description || '')) count++;
        if (formData.discount_type_id !== privilege.discount_type_id) count++;
        if (formData.default_discount_percentage !== privilege.default_discount_percentage) count++;
        if (formData.requires_id_number !== privilege.requires_id_number) count++;
        if (formData.requires_verification !== privilege.requires_verification) count++;
        if (formData.validity_years !== privilege.validity_years) count++;
        if (formData.is_active !== privilege.is_active) count++;
        return count;
    }, [formData, privilege]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        discount: getTabStatus('discount'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Privilege Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Code', value: !!formData.code, tabId: 'basic' },
        { label: 'Discount Type', value: !!formData.discount_type_id, tabId: 'discount' },
        { label: 'Discount Percentage', value: formData.default_discount_percentage > 0, tabId: 'discount' },
    ];

    const tabOrder = ['basic', 'discount', 'settings'];

    return (
        <AppLayout
            title={`Edit Privilege: ${privilege.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Privileges', href: '/admin/privileges' },
                { title: privilege.name, href: route('admin.privileges.show', privilege.id) },
                { title: 'Edit', href: route('admin.privileges.edit', privilege.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Privilege"
                    description={`Editing ${privilege.name}`}
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
                                Code: {privilege.code}
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
                                    Last updated: {formatDate(privilege.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(privilege.created_at)}
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
                                <FormContainer title="Basic Information" description="Update the core details for this privilege">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        copiedField={copiedField}
                                        originalName={privilege.name}
                                        originalCode={privilege.code}
                                        onInputChange={handleInputChange}
                                        onGenerateCode={generateCode}
                                        onCopy={handleCopy}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    showPrevious={false}
                                    nextLabel="Next: Discount"
                                />
                            </>
                        )}

                        {activeTab === 'discount' && (
                            <>
                                <FormContainer title="Discount Configuration" description="Update the discount amount and type">
                                    <DiscountTab
                                        formData={formData}
                                        errors={allErrors}
                                        discountTypes={discountTypes}
                                        selectedDiscountType={selectedDiscountType}
                                        originalDiscountTypeId={privilege.discount_type_id?.toString()}
                                        originalDiscountPercentage={privilege.default_discount_percentage?.toString()}
                                        onSelectChange={handleSelectChange}
                                        onNumberChange={handleNumberChange}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.discount_type_id && formData.default_discount_percentage > 0}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Update requirements, verification, and status">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        originalRequiresIdNumber={privilege.requires_id_number}
                                        originalRequiresVerification={privilege.requires_verification}
                                        originalValidityYears={privilege.validity_years?.toString()}
                                        onSwitchChange={handleSwitchChange}
                                        onNumberChange={handleNumberChange}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.discount_type_id && formData.default_discount_percentage > 0}
                                    previousLabel="Back: Discount"
                                    showNext={false}
                                    submitLabel="Update Privilege"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.discount_type_id && formData.default_discount_percentage > 0}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Privilege Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Privilege Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                                                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Discount Type:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {selectedDiscountType?.name || 'Not selected'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {formData.default_discount_percentage}%
                                                </span>
                                            </div>
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
                            Delete Privilege
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{privilege.name}"? This action cannot be undone.
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
                        <DialogTitle className="dark:text-gray-100">Privilege History</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Creation and modification details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Created</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(privilege.created_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Last Updated</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(privilege.updated_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">ID</p>
                            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                {privilege.id}
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