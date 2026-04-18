// pages/admin/fee-types/create.tsx
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
import { FileText, DollarSign, Settings, Sparkles, Copy, FileCheck, RefreshCw, Users, Award } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/fee-types/create/basic-info-tab';
import { PricingTab } from '@/components/admin/fee-types/create/pricing-tab';
import { DiscountsTab } from '@/components/admin/fee-types/create/discounts-tab';
import { SettingsTab } from '@/components/admin/fee-types/create/settings-tab';
import { ApplicabilityTab } from '@/components/admin/fee-types/create/applicability-tab';
import { RequirementsTab } from '@/components/admin/fee-types/create/requirements-tab';
import { route } from 'ziggy-js';
import type { CategoryOption, FeeFormData, CreateFeeTypeProps } from '@/types/admin/fee-types/fee.types';

// Common Fee Type Templates
const COMMON_FEE_TEMPLATES: Record<string, Partial<FeeFormData & { icon: string; color: string }>> = {
    barangay_clearance: {
        name: 'Barangay Clearance',
        short_name: 'Clearance',
        description: 'Official clearance certificate for various purposes including employment, business permits, and legal requirements.',
        base_amount: 50.00,
        amount_type: 'fixed',
        unit: 'per certificate',
        frequency: 'one_time',
        validity_days: 180,
        is_mandatory: false,
        auto_generate: false,
        due_day: null,
        has_senior_discount: true,
        senior_discount_percentage: 20,
        has_pwd_discount: true,
        pwd_discount_percentage: 20,
        has_solo_parent_discount: true,
        solo_parent_discount_percentage: 10,
        has_indigent_discount: false,
        indigent_discount_percentage: null,
        requirements: ['Valid ID', 'Proof of Residency', 'Application Form'],
        notes: 'Required for most barangay transactions and certifications.',
        icon: '📄',
        color: 'blue'
    },
    cedula: {
        name: 'Community Tax Certificate (Cedula)',
        short_name: 'Cedula',
        description: 'Annual community tax certificate required for all residents and workers.',
        base_amount: 5.00,
        amount_type: 'fixed',
        unit: 'per year',
        frequency: 'annual',
        validity_days: 365,
        is_mandatory: true,
        auto_generate: true,
        due_day: 31,
        has_senior_discount: false,
        senior_discount_percentage: null,
        has_pwd_discount: false,
        pwd_discount_percentage: null,
        has_solo_parent_discount: false,
        solo_parent_discount_percentage: null,
        has_indigent_discount: false,
        indigent_discount_percentage: null,
        requirements: ['Valid ID', 'Previous Cedula (if renewal)'],
        notes: 'Base amount varies based on income. Additional 1 peso per 1,000 pesos of income.',
        icon: '🧾',
        color: 'green'
    },
    business_permit: {
        name: 'Business Permit',
        short_name: 'Biz Permit',
        description: 'Annual permit for operating a business within the barangay jurisdiction.',
        base_amount: 500.00,
        amount_type: 'fixed',
        unit: 'per year',
        frequency: 'annual',
        validity_days: 365,
        is_mandatory: true,
        auto_generate: true,
        due_day: 20,
        has_senior_discount: true,
        senior_discount_percentage: 20,
        has_pwd_discount: true,
        pwd_discount_percentage: 20,
        has_solo_parent_discount: true,
        solo_parent_discount_percentage: 10,
        has_indigent_discount: false,
        indigent_discount_percentage: null,
        requirements: ['Barangay Clearance', 'DTI/SEC Registration', 'Lease Contract', 'Fire Safety Certificate'],
        notes: 'Must be renewed annually before January 20.',
        icon: '🏪',
        color: 'purple'
    }
};

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['name', 'code', 'document_category_id'] },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, requiredFields: [] },
    { id: 'discounts', label: 'Discounts', icon: Award, requiredFields: [] },
    { id: 'applicability', label: 'Applicability', icon: Users, requiredFields: [] },
    { id: 'requirements', label: 'Requirements', icon: FileCheck, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code', 'document_category_id'],
    pricing: [],
    discounts: [],
    applicability: [],
    requirements: [],
    settings: []
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

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

// Philippine standard discount rates
const PHILIPPINE_STANDARD_DISCOUNTS = {
    senior: 20,
    pwd: 20,
    solo_parent: 10,
    indigent: 50
};

export default function FeeTypesCreate() {
    const { props } = usePage<CreateFeeTypeProps>();
    const categories = Array.isArray(props.categories) ? props.categories : [];
    const amountTypes = props.amountTypes || { fixed: 'Fixed', percentage: 'Percentage', sliding_scale: 'Sliding Scale' };
    const frequencies = props.frequencies || { one_time: 'One Time', monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' };
    const applicableTo = props.applicableTo || { all_residents: 'All Residents', business_owners: 'Business Owners', specific_purok: 'Specific Purok' };
    const puroks = Array.isArray(props.puroks) ? props.puroks : [];
    
    const firstCategoryId = categories.length > 0 ? categories[0].id.toString() : '';

    const [showPreview, setShowPreview] = useState(true);
    const [autoGenerateCode, setAutoGenerateCode] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDiscountInfo, setShowDiscountInfo] = useState(false);
    const [selectedPuroks, setSelectedPuroks] = useState<string[]>([]);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [newRequirement, setNewRequirement] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
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
    } = useFormManager<FeeFormData>({
        initialData: {
            code: '',
            name: '',
            short_name: '',
            document_category_id: firstCategoryId,
            base_amount: 0,
            amount_type: 'fixed',
            unit: '',
            description: '',
            frequency: 'one_time',
            validity_days: null,
            applicable_to: 'all_residents',
            applicable_puroks: [],
            requirements: [],
            effective_date: new Date().toISOString().split('T')[0],
            expiry_date: '',
            is_active: true,
            is_mandatory: false,
            auto_generate: false,
            due_day: null,
            sort_order: 0,
            has_senior_discount: false,
            senior_discount_percentage: null,
            has_pwd_discount: false,
            pwd_discount_percentage: null,
            has_solo_parent_discount: false,
            solo_parent_discount_percentage: null,
            has_indigent_discount: false,
            indigent_discount_percentage: null,
            has_surcharge: false,
            surcharge_percentage: null,
            surcharge_fixed: null,
            has_penalty: false,
            penalty_percentage: null,
            penalty_fixed: null,
            notes: '',
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
            if (data.sort_order < 0) {
                newErrors.sort_order = 'Sort order cannot be negative';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.post(route('fee-types.store'), data as any, {
                onSuccess: () => {
                    toast.success('Fee type created successfully');
                    router.visit(route('admin.fee-types.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create fee type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Auto-generate code when name or category changes
    useEffect(() => {
        if (autoGenerateCode && formData.name.trim() && formData.document_category_id) {
            const generatedCode = generateFeeCode(formData.name, formData.document_category_id, categories);
            if (generatedCode !== formData.code) {
                updateFormData({ code: generatedCode });
            }
        }
    }, [formData.name, formData.document_category_id, autoGenerateCode, categories, updateFormData, formData.code]);

    // Load template
    const loadTemplate = useCallback((templateKey: string) => {
        const template = COMMON_FEE_TEMPLATES[templateKey];
        if (template) {
            setSelectedTemplate(templateKey);
            updateFormData({
                name: template.name || '',
                short_name: template.short_name || '',
                description: template.description || '',
                base_amount: template.base_amount || 0,
                amount_type: (template.amount_type as 'fixed' | 'percentage' | 'sliding_scale') || 'fixed',
                unit: template.unit || '',
                frequency: (template.frequency as 'one_time' | 'annual' | 'quarterly' | 'monthly') || 'one_time',
                validity_days: template.validity_days ?? null,
                is_mandatory: template.is_mandatory || false,
                auto_generate: template.auto_generate || false,
                due_day: template.due_day ?? null,
                has_senior_discount: template.has_senior_discount || false,
                senior_discount_percentage: template.senior_discount_percentage ?? null,
                has_pwd_discount: template.has_pwd_discount || false,
                pwd_discount_percentage: template.pwd_discount_percentage ?? null,
                has_solo_parent_discount: template.has_solo_parent_discount || false,
                solo_parent_discount_percentage: template.solo_parent_discount_percentage ?? null,
                has_indigent_discount: template.has_indigent_discount || false,
                indigent_discount_percentage: template.indigent_discount_percentage ?? null,
                requirements: template.requirements || [],
                notes: template.notes || '',
            });
            setSelectedRequirements(template.requirements || []);
            toast.success(`"${template.name}" template loaded successfully`);
        }
    }, [updateFormData]);

    // Handle copy code
    const handleCopyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(formData.code);
            toast.success('Code copied to clipboard');
        } catch {
            toast.error('Failed to copy code');
        }
    }, [formData.code]);

    // Handle generate code
    const handleGenerateCode = useCallback(() => {
        setIsGenerating(true);
        const generatedCode = generateFeeCode(formData.name || 'New Fee', formData.document_category_id, categories);
        updateFormData({ code: generatedCode });
        setTimeout(() => setIsGenerating(false), 500);
    }, [formData.name, formData.document_category_id, categories, updateFormData]);

    // Handle number input changes
    const handleNumberChange = useCallback((name: string, value: number | null) => {
        updateFormData({ [name]: value });
        if (selectedTemplate) setSelectedTemplate('');
        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [updateFormData, selectedTemplate, validationErrors]);

    // Handle switch changes
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    // Handle checkbox changes (for penalties)
    const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    // Individual discount handlers for PricingTab
    const handleSeniorDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_senior_discount: checked,
            senior_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.senior : null
        });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    const handlePwdDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_pwd_discount: checked,
            pwd_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.pwd : null
        });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    const handleSoloParentDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_solo_parent_discount: checked,
            solo_parent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.solo_parent : null
        });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    const handleIndigentDiscountChange = useCallback((checked: boolean) => {
        updateFormData({
            has_indigent_discount: checked,
            indigent_discount_percentage: checked ? PHILIPPINE_STANDARD_DISCOUNTS.indigent : null
        });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

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
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    // Handle purok selection
    const handlePurokChange = useCallback((purok: string, checked: boolean) => {
        setSelectedPuroks(prev => {
            const newPuroks = checked ? [...prev, purok] : prev.filter(p => p !== purok);
            updateFormData({ applicable_puroks: newPuroks });
            return newPuroks;
        });
        if (selectedTemplate) setSelectedTemplate('');
    }, [updateFormData, selectedTemplate]);

    // Handle requirement management
    const addRequirement = useCallback(() => {
        if (newRequirement.trim()) {
            const updatedRequirements = [...selectedRequirements, newRequirement.trim()];
            setSelectedRequirements(updatedRequirements);
            updateFormData({ requirements: updatedRequirements });
            setNewRequirement('');
            if (selectedTemplate) setSelectedTemplate('');
        }
    }, [newRequirement, selectedRequirements, updateFormData, selectedTemplate]);

    const removeRequirement = useCallback((index: number) => {
        const newRequirements = selectedRequirements.filter((_, i) => i !== index);
        setSelectedRequirements(newRequirements);
        updateFormData({ requirements: newRequirements });
        if (selectedTemplate) setSelectedTemplate('');
    }, [selectedRequirements, updateFormData, selectedTemplate]);

    // Get active discount count
    const activeDiscountCount = useMemo(() => {
        let count = 0;
        if (formData.has_senior_discount) count++;
        if (formData.has_pwd_discount) count++;
        if (formData.has_solo_parent_discount) count++;
        if (formData.has_indigent_discount) count++;
        return count;
    }, [formData]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setSelectedPuroks([]);
            setSelectedRequirements([]);
            setSelectedTemplate('');
            setValidationErrors({});
            toast.info('Form reset');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.fee-types.index'));
            }
        } else {
            router.visit(route('admin.fee-types.index'));
        }
    }, [formData]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        pricing: getTabStatus('pricing'),
        discounts: getTabStatus('discounts'),
        applicability: getTabStatus('applicability'),
        requirements: getTabStatus('requirements'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Code', value: !!formData.code, tabId: 'basic' },
        { label: 'Category', value: !!formData.document_category_id, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'pricing', 'discounts', 'applicability', 'requirements', 'settings'];

    return (
        <AppLayout
            title="Create Fee Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fee Types', href: '/admin/fee-types' },
                { title: 'Create', href: '/admin/fee-types/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Fee Type"
                    description="Define a new fee type for barangay collections"
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

                {/* Template Selection */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-emerald-800 dark:text-emerald-300">Quick start with templates</h3>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                Choose from common fee type templates to get started quickly.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {Object.entries(COMMON_FEE_TEMPLATES).map(([key, template]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => loadTemplate(key)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border ${
                                            selectedTemplate === key
                                                ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700'
                                                : 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                        } transition-colors`}
                                    >
                                        <span>{template.icon}</span>
                                        {template.name}
                                    </button>
                                ))}
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
                                <FormContainer title="Basic Information" description="Enter the core details for this fee type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categories={categories}
                                        autoGenerateCode={autoGenerateCode}
                                        isGenerating={isGenerating}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onCopyCode={handleCopyCode}
                                        onGenerateCode={handleGenerateCode}
                                        onAutoGenerateToggle={setAutoGenerateCode}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    showPrevious={false}
                                    nextLabel="Next: Pricing"
                                />
                            </>
                        )}

                        {activeTab === 'pricing' && (
                            <>
                                <FormContainer title="Pricing Configuration" description="Configure pricing details for the fee">
                                    <PricingTab
                                        formData={formData}
                                        errors={allErrors}
                                        amountTypes={amountTypes}
                                        frequencies={frequencies}
                                        showDiscountInfo={showDiscountInfo}
                                        onNumberChange={handleNumberChange}
                                        onSelectChange={handleSelectChange}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Discounts"
                                />
                            </>
                        )}

                        {activeTab === 'discounts' && (
                            <>
                                <FormContainer title="Discount Configuration" description="Configure discounts for eligible groups">
                                    <DiscountsTab
                                        formData={formData}
                                        errors={allErrors}
                                        showDiscountInfo={showDiscountInfo}
                                        activeDiscountCount={activeDiscountCount}
                                        onNumberChange={handleNumberChange}
                                        onDiscountChange={handleDiscountChange}
                                        onToggleDiscountInfo={() => setShowDiscountInfo(!showDiscountInfo)}
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
                                    previousLabel="Back: Pricing"
                                    nextLabel="Next: Applicability"
                                />
                            </>
                        )}

                        {activeTab === 'applicability' && (
                            <>
                                <FormContainer title="Applicability" description="Define who this fee applies to">
                                    <ApplicabilityTab
                                        formData={formData}
                                        errors={allErrors}
                                        applicableTo={applicableTo}
                                        puroks={puroks}
                                        selectedPuroks={selectedPuroks}
                                        onSelectChange={handleSelectChange}
                                        onPurokChange={handlePurokChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: Discounts"
                                    nextLabel="Next: Requirements"
                                />
                            </>
                        )}

                        {activeTab === 'requirements' && (
                            <>
                                <FormContainer title="Requirements" description="Add requirements for this fee">
                                    <RequirementsTab
                                        selectedRequirements={selectedRequirements}
                                        newRequirement={newRequirement}
                                        onAddRequirement={addRequirement}
                                        onRemoveRequirement={removeRequirement}
                                        onNewRequirementChange={setNewRequirement}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: Applicability"
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
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.document_category_id}
                                    previousLabel="Back: Requirements"
                                    showNext={false}
                                    submitLabel="Create Fee Type"
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
                                
                                {/* Fee Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Fee Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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

                                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Amount</p>
                                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
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
                                            <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {frequencies[formData.frequency as keyof typeof frequencies] || formData.frequency}
                                            </span>
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