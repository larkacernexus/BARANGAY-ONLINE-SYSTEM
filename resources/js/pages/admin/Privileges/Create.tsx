// pages/admin/privileges/create.tsx
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
import { Award, Percent, Settings, Sparkles, RefreshCw } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/privileges/create/basic-info-tab';
import { DiscountTab } from '@/components/admin/privileges/create/discount-tab';
import { SettingsTab } from '@/components/admin/privileges/create/settings-tab';
import { route } from 'ziggy-js';
import type { 
    DiscountType, 
    PrivilegeFormData
} from '@/types/admin/privileges/privilege.types';

// Define PrivilegeTemplate locally since it's not in the types file
interface PrivilegeTemplate {
    name: string;
    code: string;
    description: string;
    discount_type_name: string;
    default_discount_percentage: number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    is_active: boolean;
}

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

const defaultTemplates: PrivilegeTemplate[] = [
    {
        name: 'Senior Citizen Discount',
        code: 'SENIOR_CITIZEN',
        description: '20% discount and VAT exemption for senior citizens on certain goods and services',
        discount_type_name: 'Percentage',
        default_discount_percentage: 20,
        requires_id_number: true,
        requires_verification: true,
        validity_years: 5,
        is_active: true,
    },
    {
        name: 'PWD Discount',
        code: 'PWD',
        description: '20% discount and VAT exemption for persons with disabilities',
        discount_type_name: 'Percentage',
        default_discount_percentage: 20,
        requires_id_number: true,
        requires_verification: true,
        validity_years: 5,
        is_active: true,
    },
    {
        name: 'Solo Parent Discount',
        code: 'SOLO_PARENT',
        description: '10% discount for solo parents on specific services',
        discount_type_name: 'Percentage',
        default_discount_percentage: 10,
        requires_id_number: true,
        requires_verification: true,
        validity_years: 5,
        is_active: true,
    },
    {
        name: 'Student Discount',
        code: 'STUDENT',
        description: 'Discount for students on transportation and certain services',
        discount_type_name: 'Percentage',
        default_discount_percentage: 10,
        requires_id_number: true,
        requires_verification: true,
        validity_years: 1,
        is_active: true,
    },
];

interface PageProps {
    discountTypes: DiscountType[];
    templates?: PrivilegeTemplate[];
    [key: string]: unknown;
}

export default function CreatePrivilege() {
    const { props } = usePage<PageProps>();
    const discountTypes: DiscountType[] = props.discountTypes || [];
    const templates: PrivilegeTemplate[] = props.templates || defaultTemplates;

    const [showPreview, setShowPreview] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
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
    } = useFormManager<PrivilegeFormData>({
        initialData: {
            name: '',
            code: '',
            description: null,
            discount_type_id: null,
            default_discount_percentage: 0,
            requires_id_number: true,
            requires_verification: true,
            validity_years: null,
            is_active: true,
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
            
            router.post(route('admin.privileges.store'), data as any, {
                onSuccess: () => {
                    toast.success('Privilege created successfully');
                    router.visit(route('admin.privileges.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create privilege');
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

    // Apply template
    const applyTemplate = useCallback((template: PrivilegeTemplate) => {
        const discountType = discountTypes.find(dt => dt.name === template.discount_type_name);
        
        updateFormData({
            name: template.name,
            code: template.code,
            description: template.description,
            discount_type_id: discountType?.id || null,
            default_discount_percentage: template.default_discount_percentage,
            requires_id_number: template.requires_id_number,
            requires_verification: template.requires_verification,
            validity_years: template.validity_years,
            is_active: template.is_active,
        });
        
        // Clear validation errors for these fields
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.name;
            delete newErrors.code;
            delete newErrors.discount_type_id;
            delete newErrors.default_discount_percentage;
            return newErrors;
        });
        
        toast.success(`${template.name} template applied`);
    }, [discountTypes, updateFormData]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setValidationErrors({});
            toast.info('Form reset');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.privileges.index'));
            }
        } else {
            router.visit(route('admin.privileges.index'));
        }
    }, [formData]);

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
            title="Create Privilege"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Privileges', href: '/admin/privileges' },
                { title: 'Create', href: '/admin/privileges/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Privilege"
                    description="Create a new privilege or discount for residents"
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
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">Quick start with templates</h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                Choose from common privilege templates to get started quickly.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.code}
                                        type="button"
                                        onClick={() => applyTemplate(template)}
                                        className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                    >
                                        <Award className="h-3 w-3" />
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
                                <FormContainer title="Basic Information" description="Enter the core details for this privilege">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        copiedField={copiedField}
                                        onInputChange={handleInputChange}
                                        onGenerateCode={generateCode}
                                        onCopy={handleCopy}
                                        isSubmitting={isSubmitting}
                                        isEdit={false}
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
                                <FormContainer title="Discount Configuration" description="Configure the discount amount and type">
                                    <DiscountTab
                                        formData={formData}
                                        errors={allErrors}
                                        discountTypes={discountTypes}
                                        selectedDiscountType={selectedDiscountType}
                                        onSelectChange={handleSelectChange}
                                        onNumberChange={handleNumberChange}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.discount_type_id && formData.default_discount_percentage > 0}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Configure requirements, verification, and status">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        onSwitchChange={handleSwitchChange}
                                        onNumberChange={handleNumberChange}
                                        isSubmitting={isSubmitting}
                                        isEdit={false}
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
                                    submitLabel="Create Privilege"
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
        </AppLayout>
    );
}