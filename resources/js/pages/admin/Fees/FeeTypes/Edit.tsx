// pages/admin/fee-types/edit.tsx
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
import { DollarSign, Percent, Award, Settings, History, Trash2, RefreshCw } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/fee-types/create/basic-info-tab';
import { PricingTab } from '@/components/admin/fee-types/create/pricing-tab';
import { DiscountsTab } from '@/components/admin/fee-types/create/discounts-tab';
import { SettingsTab } from '@/components/admin/fee-types/create/settings-tab';
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
import type { FeeType, CategoryOption, FeeFormData, EditFeeTypeProps } from '@/types/admin/fee-types/fee.types';

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: DollarSign, requiredFields: ['name', 'document_category_id', 'base_amount', 'effective_date'] },
    { id: 'pricing', label: 'Pricing', icon: Percent, requiredFields: [] },
    { id: 'discounts', label: 'Discounts', icon: Award, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'document_category_id', 'base_amount', 'effective_date'],
    pricing: [],
    discounts: [],
    settings: []
};

// Philippine standard discount rates
const PHILIPPINE_STANDARD_DISCOUNTS = {
    senior: 20,
    pwd: 20,
    solo_parent: 10,
    indigent: 50
};

// Generate a fee code based on category name and fee name
function generateFeeCode(name: string, categoryId: string, categories: CategoryOption[]): string {
    const category = categories.find(c => c.id.toString() === categoryId);
    const categoryName = category?.name || 'FEE';
    
    const prefix = categoryName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
    
    const nameInitials = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
    
    const timestamp = Date.now().toString().slice(-4);
    
    return `${prefix}-${nameInitials}-${timestamp}`;
}

export default function EditFeeType() {
    const { props } = usePage<EditFeeTypeProps>();
    const {
        feeType,
        categories = [],
        amountTypes = {},
        frequencies = {},
        applicableTo = {},
        puroks = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [autoGenerateCode, setAutoGenerateCode] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedPuroks, setSelectedPuroks] = useState<string[]>(feeType.applicable_puroks || []);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(feeType.requirements || []);
    const [newRequirement, setNewRequirement] = useState('');
    const [showDiscountInfo, setShowDiscountInfo] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
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
    } = useFormManager<FeeFormData>({
        initialData: {
            code: feeType.code || '',
            name: feeType.name || '',
            short_name: feeType.short_name || '',
            document_category_id: feeType.document_category_id?.toString() || (categories.length > 0 ? categories[0].id.toString() : ''),
            base_amount: typeof feeType.base_amount === 'string' ? parseFloat(feeType.base_amount) : (feeType.base_amount || 0),
            amount_type: feeType.amount_type || 'fixed',
            unit: feeType.unit || '',
            description: feeType.description || '',
            frequency: feeType.frequency || 'one_time',
            validity_days: feeType.validity_days || null,
            applicable_to: feeType.applicable_to || 'all_residents',
            applicable_puroks: feeType.applicable_puroks || [],
            requirements: feeType.requirements || [],
            effective_date: feeType.effective_date || new Date().toISOString().split('T')[0],
            expiry_date: feeType.expiry_date || '',
            is_active: feeType.is_active ?? true,
            is_mandatory: feeType.is_mandatory ?? false,
            auto_generate: feeType.auto_generate ?? false,
            due_day: feeType.due_day || null,
            sort_order: feeType.sort_order || 0,
            has_senior_discount: feeType.has_senior_discount ?? false,
            senior_discount_percentage: feeType.senior_discount_percentage || null,
            has_pwd_discount: feeType.has_pwd_discount ?? false,
            pwd_discount_percentage: feeType.pwd_discount_percentage || null,
            has_solo_parent_discount: feeType.has_solo_parent_discount ?? false,
            solo_parent_discount_percentage: feeType.solo_parent_discount_percentage || null,
            has_indigent_discount: feeType.has_indigent_discount ?? false,
            indigent_discount_percentage: feeType.indigent_discount_percentage || null,
            has_surcharge: feeType.has_surcharge ?? false,
            surcharge_percentage: feeType.surcharge_percentage || null,
            surcharge_fixed: feeType.surcharge_fixed || null,
            has_penalty: feeType.has_penalty ?? false,
            penalty_percentage: feeType.penalty_percentage || null,
            penalty_fixed: feeType.penalty_fixed || null,
            notes: feeType.notes || '',
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Fee name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Fee code is required';
            }
            if (!data.document_category_id) {
                newErrors.document_category_id = 'Category is required';
            }
            if (data.base_amount < 0) {
                newErrors.base_amount = 'Base amount cannot be negative';
            }
            if (!data.effective_date) {
                newErrors.effective_date = 'Effective date is required';
            }
            if (data.sort_order < 0) {
                newErrors.sort_order = 'Sort order cannot be negative';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.put(route('admin.fee-types.update', feeType.id), data as any, {
                onSuccess: () => {
                    toast.success('Fee type updated successfully');
                    router.visit(route('admin.fee-types.show', feeType.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update fee type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Auto-generate code when name or category changes (if auto-generate is enabled)
    useEffect(() => {
        if (autoGenerateCode && formData.name.trim() && formData.document_category_id) {
            const generatedCode = generateFeeCode(formData.name, formData.document_category_id, categories);
            if (generatedCode !== formData.code) {
                updateFormData({ code: generatedCode });
            }
        }
    }, [formData.name, formData.document_category_id, autoGenerateCode, categories, updateFormData, formData.code]);

    // Handle number input changes - accepts string for PricingTab compatibility
    const handleNumberChange = useCallback((name: string, value: number | null) => {
        updateFormData({ [name]: value } as any);
        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

    // Handle switch changes - accepts string for PricingTab compatibility
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked } as any);
    }, [updateFormData]);

    // Individual discount handlers for PricingTab
    const handleSeniorDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_senior_discount: checked,
            senior_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.senior : null
        });
    }, [updateFormData]);

    const handlePwdDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_pwd_discount: checked,
            pwd_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.pwd : null
        });
    }, [updateFormData]);

    const handleSoloParentDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_solo_parent_discount: checked,
            solo_parent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.solo_parent : null
        });
    }, [updateFormData]);

    const handleIndigentDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_indigent_discount: checked,
            indigent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.indigent : null
        });
    }, [updateFormData]);

    // Single discount handler for DiscountsTab
    const handleDiscountChange = useCallback((type: 'senior' | 'pwd' | 'solo_parent' | 'indigent', checked: boolean) => {
        switch (type) {
            case 'senior':
                updateFormData({
                    has_senior_discount: checked,
                    senior_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.senior : null
                });
                break;
            case 'pwd':
                updateFormData({
                    has_pwd_discount: checked,
                    pwd_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.pwd : null
                });
                break;
            case 'solo_parent':
                updateFormData({
                    has_solo_parent_discount: checked,
                    solo_parent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.solo_parent : null
                });
                break;
            case 'indigent':
                updateFormData({
                    has_indigent_discount: checked,
                    indigent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.indigent : null
                });
                break;
        }
    }, [updateFormData]);

    // Handle purok selection
    const handlePurokChange = useCallback((purok: string, checked: boolean) => {
        let newPuroks: string[];
        if (checked) {
            newPuroks = [...selectedPuroks, purok];
        } else {
            newPuroks = selectedPuroks.filter(p => p !== purok);
        }
        setSelectedPuroks(newPuroks);
        updateFormData({ applicable_puroks: newPuroks });
    }, [selectedPuroks, updateFormData]);

    // Handle requirements
    const addRequirement = useCallback(() => {
        if (newRequirement.trim()) {
            const updatedRequirements = [...selectedRequirements, newRequirement.trim()];
            setSelectedRequirements(updatedRequirements);
            updateFormData({ requirements: updatedRequirements });
            setNewRequirement('');
            toast.success('Requirement added');
        }
    }, [newRequirement, selectedRequirements, updateFormData]);

    const removeRequirement = useCallback((index: number) => {
        const newRequirements = selectedRequirements.filter((_, i) => i !== index);
        setSelectedRequirements(newRequirements);
        updateFormData({ requirements: newRequirements });
        toast.info('Requirement removed');
    }, [selectedRequirements, updateFormData]);

    // Handle code generation
    const handleGenerateCode = useCallback(() => {
        setIsGenerating(true);
        const generatedCode = generateFeeCode(formData.name || 'New Fee', formData.document_category_id, categories);
        updateFormData({ code: generatedCode });
        setTimeout(() => setIsGenerating(false), 500);
        toast.success('Code generated');
    }, [formData.name, formData.document_category_id, categories, updateFormData]);

    // Handle copy to clipboard
    const handleCopyCode = useCallback(() => {
        if (!formData.code) return;
        navigator.clipboard.writeText(formData.code).then(() => {
            setCopiedField('Code');
            setTimeout(() => setCopiedField(null), 2000);
            toast.success('Code copied to clipboard');
        });
    }, [formData.code]);

    // Handle reset
    const handleReset = useCallback(() => {
        resetForm();
        setSelectedPuroks(feeType.applicable_puroks || []);
        setSelectedRequirements(feeType.requirements || []);
        setValidationErrors({});
        setShowResetDialog(false);
        toast.info('Form reset to original values');
    }, [resetForm, feeType]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.fee-types.show', feeType.id));
            }
        } else {
            router.visit(route('admin.fee-types.show', feeType.id));
        }
    }, [hasUnsavedChanges, feeType.id]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('admin.fee-types.destroy', feeType.id), {
            onSuccess: () => {
                toast.success('Fee type deleted successfully');
                router.visit(route('admin.fee-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete fee type');
                setShowDeleteDialog(false);
            }
        });
    }, [feeType.id]);

    // Get active discount count
    const activeDiscountCount = useMemo(() => {
        let count = 0;
        if (formData.has_senior_discount) count++;
        if (formData.has_pwd_discount) count++;
        if (formData.has_solo_parent_discount) count++;
        if (formData.has_indigent_discount) count++;
        return count;
    }, [formData]);

    // Count changed fields
    const changedFieldsCount = useMemo(() => {
        let count = 0;
        if (formData.name !== feeType.name) count++;
        if (formData.code !== feeType.code) count++;
        if (formData.base_amount !== feeType.base_amount) count++;
        if (formData.document_category_id !== feeType.document_category_id?.toString()) count++;
        if (formData.is_active !== feeType.is_active) count++;
        if (formData.is_mandatory !== feeType.is_mandatory) count++;
        if (JSON.stringify(selectedPuroks) !== JSON.stringify(feeType.applicable_puroks || [])) count++;
        if (JSON.stringify(selectedRequirements) !== JSON.stringify(feeType.requirements || [])) count++;
        return count;
    }, [formData, feeType, selectedPuroks, selectedRequirements]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        pricing: getTabStatus('pricing'),
        discounts: getTabStatus('discounts'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Category', value: !!formData.document_category_id, tabId: 'basic' },
        { label: 'Base Amount', value: formData.base_amount > 0, tabId: 'basic' },
        { label: 'Effective Date', value: !!formData.effective_date, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'pricing', 'discounts', 'settings'];

    // Format currency
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    }, []);

    // Format date
    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    // Get category name
    const getCategoryName = useCallback((categoryId: string) => {
        const category = categories.find(c => c.id.toString() === categoryId);
        return category?.name || 'Unknown';
    }, [categories]);

    return (
        <AppLayout
            title={`Edit Fee Type: ${feeType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fee Types', href: '/admin/fee-types' },
                { title: feeType.name, href: route('admin.fee-types.show', feeType.id) },
                { title: 'Edit', href: route('admin.fee-types.edit', feeType.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Fee Type"
                    description={`Editing ${feeType.name}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={() => setShowResetDialog(true)}
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
                                Code: {feeType.code}
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
                                    Last updated: {formatDate(feeType.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(feeType.created_at)}
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
                                    onClick={() => setShowResetDialog(true)}
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
                                <FormContainer title="Basic Information" description="Update the core details for this fee type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={categories}
                                        autoGenerateCode={autoGenerateCode}
                                        isGenerating={isGenerating}
                                        copiedField={copiedField}
                                        originalName={feeType.name}
                                        originalCode={feeType.code}
                                        originalBaseAmount={typeof feeType.base_amount === 'string' ? parseFloat(feeType.base_amount) : feeType.base_amount}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onCopyCode={handleCopyCode}
                                        onGenerateCode={handleGenerateCode}
                                        onAutoGenerateToggle={setAutoGenerateCode}
                                        formatCurrency={formatCurrency}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.document_category_id && formData.base_amount > 0 && !!formData.effective_date}
                                    showPrevious={false}
                                    nextLabel="Next: Pricing"
                                />
                            </>
                        )}

                        {activeTab === 'pricing' && (
                            <>
                                <FormContainer title="Pricing Configuration" description="Update pricing details for the fee">
                                    <PricingTab
                                        formData={formData}
                                        errors={allErrors}
                                        amountTypes={amountTypes}
                                        frequencies={frequencies}
                                        showDiscountInfo={showDiscountInfo}
                                        onNumberChange={handleNumberChange}
                                        onSelectChange={handleSelectChange}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleSwitchChange}
                                        onSeniorDiscountChange={handleSeniorDiscountChange}
                                        onPwdDiscountChange={handlePwdDiscountChange}
                                        onSoloParentDiscountChange={handleSoloParentDiscountChange}
                                        onIndigentDiscountChange={handleIndigentDiscountChange}
                                        onToggleDiscountInfo={() => setShowDiscountInfo(!showDiscountInfo)}
                                        formatCurrency={formatCurrency}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.document_category_id && formData.base_amount > 0 && !!formData.effective_date}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Discounts"
                                />
                            </>
                        )}

                        {activeTab === 'discounts' && (
                            <>
                                <FormContainer title="Discount Configuration" description="Update discount configurations for eligible groups">
                                    <DiscountsTab
                                        formData={formData}
                                        errors={allErrors}
                                        showDiscountInfo={showDiscountInfo}
                                        activeDiscountCount={activeDiscountCount}
                                        onNumberChange={handleNumberChange}
                                        onDiscountChange={handleDiscountChange}
                                        onToggleDiscountInfo={() => setShowDiscountInfo(!showDiscountInfo)}
                                        isSubmitting={isSubmitting}
                                        isEdit={true}
                                        originalSeniorDiscount={feeType.has_senior_discount}
                                        originalPwdDiscount={feeType.has_pwd_discount}
                                        originalSoloParentDiscount={feeType.has_solo_parent_discount}
                                        originalIndigentDiscount={feeType.has_indigent_discount}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.document_category_id && formData.base_amount > 0 && !!formData.effective_date}
                                    previousLabel="Back: Pricing"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Update fee status and behavior">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        onNumberChange={handleNumberChange}
                                        onSwitchChange={handleSwitchChange}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.document_category_id && formData.base_amount > 0 && !!formData.effective_date}
                                    previousLabel="Back: Discounts"
                                    showNext={false}
                                    submitLabel="Update Fee Type"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.document_category_id && formData.base_amount > 0 && !!formData.effective_date}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Fee Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Fee Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

                                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Amount</p>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                                {formatCurrency(formData.base_amount)}
                                            </p>
                                        </div>

                                        {activeDiscountCount > 0 && (
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <p className="text-xs text-green-700 dark:text-green-300 text-center">
                                                    {activeDiscountCount} discount{activeDiscountCount !== 1 ? 's' : ''} available
                                                </p>
                                            </div>
                                        )}

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
                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {getCategoryName(formData.document_category_id)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Effective:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {formatDate(formData.effective_date)}
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
                            Delete Fee Type
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{feeType.name}"? This action cannot be undone.
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
                            Delete Fee Type
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Reset Changes</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to reset all changes? This will revert the form to its original state.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                            Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}