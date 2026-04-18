// pages/admin/clearance-types/create.tsx
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
import { FileText, DollarSign, File, Settings, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/clearance-types/create/basic-info-tab';
import { FeesTab } from '@/components/admin/clearance-types/create/fees-tab';
import { RequirementsTab } from '@/components/admin/clearance-types/create/requirements-tab';
import { SettingsTab } from '@/components/admin/clearance-types/create/settings-tab';
import { route } from 'ziggy-js';
import type { 
    ClearanceTypeFormData, 
    CommonType, 
    DocumentType, 
    PrivilegeData,
    EligibilityCriterion,
    DiscountConfig
} from '@/types/admin/clearance-types/clearance-types';

interface PageProps {
    commonTypes: Record<string, CommonType>;
    documentTypes: DocumentType[];
    defaultPurposeOptions: string[];
    eligibilityOperators: Array<{ value: string; label: string }>;
    privileges?: PrivilegeData[];
    [key: string]: unknown;
}

interface FormData extends ClearanceTypeFormData {
    // Additional form-specific fields
    purpose_options: string;
    document_type_ids: number[];
    eligibility_criteria: EligibilityCriterion[];
    discount_configs: DiscountConfig[];
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['name', 'code'] },
    { id: 'fees', label: 'Fees', icon: DollarSign, requiredFields: [] },
    { id: 'requirements', label: 'Requirements', icon: File, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code'],
    fees: [],
    requirements: [],
    settings: []
};

// Define residentFields for eligibility criteria
const residentFields = [
    { value: 'age', label: 'Age', icon: <span className="text-sm">👤</span> },
    { value: 'years_of_residency', label: 'Years of Residency', icon: <span className="text-sm">🏠</span> },
    { value: 'is_employed', label: 'Employment Status', icon: <span className="text-sm">💼</span> },
    { value: 'has_business', label: 'Has Business', icon: <span className="text-sm">🏪</span> },
    { value: 'is_registered_voter', label: 'Registered Voter', icon: <span className="text-sm">🗳️</span> },
    { value: 'no_pending_case', label: 'No Pending Case', icon: <span className="text-sm">⚖️</span> },
    { value: 'good_standing', label: 'Good Standing', icon: <span className="text-sm">⭐</span> },
    { value: 'has_clearance', label: 'Has Previous Clearance', icon: <span className="text-sm">📄</span> },
    { value: 'is_head_of_household', label: 'Head of Household', icon: <span className="text-sm">👨‍👩‍👧‍👦</span> },
];

export default function CreateClearanceType() {
    const { props } = usePage<PageProps>();
    const {
        commonTypes = {},
        documentTypes = [],
        defaultPurposeOptions = [],
        eligibilityOperators = [],
        privileges = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [selectedCommonType, setSelectedCommonType] = useState<string>('');
    const [purposeOptions, setPurposeOptions] = useState<string[]>(defaultPurposeOptions);
    const [newPurposeOption, setNewPurposeOption] = useState('');
    const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriterion[]>([
        { field: 'age', operator: 'greater_than_or_equal', value: '18' }
    ]);
    const [showEligibilityForm, setShowEligibilityForm] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>([]);
    const [documentCategory, setDocumentCategory] = useState<string>('all');
    const [searchDocument, setSearchDocument] = useState('');
    const [discountConfigs, setDiscountConfigs] = useState<DiscountConfig[]>([]);
    const [showDiscounts, setShowDiscounts] = useState(false);
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
            name: '',
            code: '',
            description: '',
            fee: 0,
            processing_days: 1,
            validity_days: 30,
            is_active: true,
            requires_payment: true,
            requires_approval: false,
            is_online_only: false,
            is_discountable: false,
            purpose_options: defaultPurposeOptions.join(', '),
            document_type_ids: [],
            eligibility_criteria: [],
            discount_configs: [],
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Clearance name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Clearance code is required';
            }
            
            // Safe number conversion
            const feeAmount = typeof data.fee === 'string' ? parseFloat(data.fee) : data.fee;
            const processingDays = typeof data.processing_days === 'string' ? parseInt(data.processing_days) : data.processing_days;
            const validityDays = typeof data.validity_days === 'string' ? parseInt(data.validity_days) : data.validity_days;
            
            if (isNaN(feeAmount) || feeAmount < 0) {
                newErrors.fee = 'Fee must be a valid non-negative number';
            }
            if (isNaN(processingDays) || processingDays < 1) {
                newErrors.processing_days = 'Processing days must be at least 1';
            }
            if (isNaN(validityDays) || validityDays < 1) {
                newErrors.validity_days = 'Validity days must be at least 1';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.post(route('clearance-types.store'), data as any, {
                onSuccess: () => {
                    toast.success('Clearance type created successfully');
                    router.visit(route('admin.clearance-types.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create clearance type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Memoized Values
    const documentCategories = useMemo(() => [
        'all',
        ...Array.from(new Set(
            documentTypes
                .map(doc => doc.category)
                .filter((category): category is string => category != null && category !== '')
        ))
    ], [documentTypes]);

    const filteredDocumentTypes = useMemo(() => {
        return documentTypes.filter(doc => {
            const matchesCategory = documentCategory === 'all' || doc.category === documentCategory;
            const matchesSearch = searchDocument === '' || 
                doc.name.toLowerCase().includes(searchDocument.toLowerCase()) ||
                (doc.description && doc.description.toLowerCase().includes(searchDocument.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [documentTypes, documentCategory, searchDocument]);

    // Initialize discount configs from privileges
    useEffect(() => {
        if (privileges && privileges.length > 0 && discountConfigs.length === 0) {
            const initialConfigs: DiscountConfig[] = privileges
                .filter(p => p.is_active)
                .map(p => ({
                    privilege_id: p.id,
                    privilege_code: p.code,
                    privilege_name: p.name,
                    discount_percentage: p.default_discount_percentage ?? 0,
                    is_active: false,
                    requires_verification: p.requires_verification ?? false,
                    requires_id_number: p.requires_id_number ?? false
                }));
            setDiscountConfigs(initialConfigs);
        }
    }, [privileges, discountConfigs.length]);

    // Handle common type select
    const handleCommonTypeSelect = useCallback((typeKey: string) => {
        if (typeKey === 'custom') {
            setSelectedCommonType('custom');
            return;
        }

        const commonType = commonTypes[typeKey];
        if (commonType) {
            setSelectedCommonType(typeKey);
            updateFormData({
                name: commonType.name,
                code: commonType.code,
                description: commonType.description,
                fee: commonType.fee,
                processing_days: commonType.processing_days,
                validity_days: commonType.validity_days,
                requires_payment: commonType.requires_payment !== false,
            });
            toast.success('Template loaded successfully');
        }
    }, [commonTypes, updateFormData]);

    // Handle document type toggle
    const handleDocumentTypeToggle = useCallback((documentTypeId: number) => {
        setSelectedDocumentTypes(prev => {
            const updatedSelection = prev.includes(documentTypeId)
                ? prev.filter(id => id !== documentTypeId)
                : [...prev, documentTypeId];
            updateFormData({ document_type_ids: updatedSelection });
            return updatedSelection;
        });
    }, [updateFormData]);

    // Handle purpose options
    const handleAddPurposeOption = useCallback(() => {
        if (newPurposeOption.trim()) {
            const updatedOptions = [...purposeOptions, newPurposeOption.trim()];
            setPurposeOptions(updatedOptions);
            updateFormData({ purpose_options: updatedOptions.join(', ') });
            setNewPurposeOption('');
        }
    }, [newPurposeOption, purposeOptions, updateFormData]);

    const handleRemovePurposeOption = useCallback((index: number) => {
        const updatedOptions = purposeOptions.filter((_, i) => i !== index);
        setPurposeOptions(updatedOptions);
        updateFormData({ purpose_options: updatedOptions.join(', ') });
    }, [purposeOptions, updateFormData]);

    // Handle eligibility criteria
    const handleAddEligibilityCriterion = useCallback(() => {
        setEligibilityCriteria(prev => [
            ...prev,
            { field: '', operator: 'equals', value: '' }
        ]);
    }, []);

    const handleUpdateEligibilityCriterion = useCallback((index: number, field: keyof EligibilityCriterion, value: string) => {
        setEligibilityCriteria(prev => {
            const updatedCriteria = [...prev];
            updatedCriteria[index][field] = value;
            updateFormData({ eligibility_criteria: updatedCriteria });
            return updatedCriteria;
        });
    }, [updateFormData]);

    const handleRemoveEligibilityCriterion = useCallback((index: number) => {
        setEligibilityCriteria(prev => {
            const updatedCriteria = prev.filter((_, i) => i !== index);
            updateFormData({ eligibility_criteria: updatedCriteria });
            return updatedCriteria;
        });
    }, [updateFormData]);

    // Handle discount configs
    const handleDiscountToggle = useCallback((index: number, checked: boolean) => {
        setDiscountConfigs(prev => {
            const updatedConfigs = [...prev];
            updatedConfigs[index].is_active = checked;

            const activeDiscounts = updatedConfigs.filter(c => c.is_active);
            updateFormData({
                discount_configs: activeDiscounts,
                is_discountable: activeDiscounts.length > 0
            });

            return updatedConfigs;
        });
    }, [updateFormData]);

    const handleDiscountPercentageChange = useCallback((index: number, percentage: number) => {
        setDiscountConfigs(prev => {
            const updatedConfigs = [...prev];
            updatedConfigs[index].discount_percentage = percentage;

            if (updatedConfigs[index].is_active) {
                const activeDiscounts = updatedConfigs.filter(c => c.is_active);
                updateFormData({ discount_configs: activeDiscounts });
            }

            return updatedConfigs;
        });
    }, [updateFormData]);

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
            toast.error('Please enter a name first');
        }
    }, [formData.name, updateFormData]);

    // Handle number input changes
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

    // Handle switch changes
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setSelectedDocumentTypes([]);
            setPurposeOptions(defaultPurposeOptions);
            setEligibilityCriteria([{ field: 'age', operator: 'greater_than_or_equal', value: '18' }]);
            setSelectedCommonType('');
            setDiscountConfigs([]);
            setValidationErrors({});
            toast.info('Form reset');
        }
    }, [resetForm, defaultPurposeOptions]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.clearance-types.index'));
            }
        } else {
            router.visit(route('admin.clearance-types.index'));
        }
    }, [formData]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        fees: getTabStatus('fees'),
        requirements: getTabStatus('requirements'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Code', value: !!formData.code, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'fees', 'requirements', 'settings'];

    return (
        <AppLayout
            title="Create Clearance Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Types', href: '/admin/clearance-types' },
                { title: 'Create', href: '/admin/clearance-types/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Clearance Type"
                    description="Configure a new type of clearance or certificate"
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
                {Object.keys(commonTypes).length > 0 && (
                    <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-teal-800 dark:text-teal-300">Quick start with templates</h3>
                                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                                    Choose from common clearance type templates to get started quickly.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {Object.entries(commonTypes).map(([key, type]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleCommonTypeSelect(key)}
                                            className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                        >
                                            <Copy className="h-3 w-3" />
                                            {type.name}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleCommonTypeSelect('custom')}
                                        className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                    >
                                        Custom Type
                                    </button>
                                </div>
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
                                <FormContainer title="Basic Information" description="Enter the core details for this clearance type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        onInputChange={handleInputChange}
                                        onGenerateCode={generateCode}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    showPrevious={false}
                                    nextLabel="Next: Fees"
                                />
                            </>
                        )}

                        {activeTab === 'fees' && (
                            <>
                                <FormContainer title="Fees & Duration" description="Configure processing time and validity period">
                                    <FeesTab
                                        formData={formData}
                                        errors={allErrors}
                                        purposeOptions={purposeOptions}
                                        newPurposeOption={newPurposeOption}
                                        onNumberChange={handleNumberChange}
                                        onAddPurposeOption={handleAddPurposeOption}
                                        onRemovePurposeOption={handleRemovePurposeOption}
                                        onNewPurposeOptionChange={setNewPurposeOption}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Requirements"
                                />
                            </>
                        )}

                        {activeTab === 'requirements' && (
                            <>
                                <FormContainer 
                                    title="Requirements" 
                                    description="Configure document requirements and eligibility criteria"
                                >
                                    <RequirementsTab
                                        formData={formData}
                                        errors={allErrors}
                                        documentTypes={documentTypes}
                                        filteredDocumentTypes={filteredDocumentTypes}
                                        documentCategories={documentCategories}
                                        selectedDocumentTypes={selectedDocumentTypes}
                                        documentCategory={documentCategory}
                                        searchDocument={searchDocument}
                                        eligibilityCriteria={eligibilityCriteria}
                                        eligibilityOperators={eligibilityOperators}
                                        showEligibilityForm={showEligibilityForm}
                                        residentFields={residentFields}
                                        onDocumentCategoryChange={setDocumentCategory}
                                        onSearchDocumentChange={setSearchDocument}
                                        onDocumentTypeToggle={handleDocumentTypeToggle}
                                        onAddEligibilityCriterion={handleAddEligibilityCriterion}
                                        onUpdateEligibilityCriterion={handleUpdateEligibilityCriterion}
                                        onRemoveEligibilityCriterion={handleRemoveEligibilityCriterion}
                                        onToggleEligibilityForm={() => setShowEligibilityForm(!showEligibilityForm)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Fees"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Configure behavior and discount options">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        discountConfigs={discountConfigs}
                                        showDiscounts={showDiscounts}
                                        onSwitchChange={handleSwitchChange}
                                        onDiscountToggle={handleDiscountToggle}
                                        onDiscountPercentageChange={handleDiscountPercentageChange}
                                        onToggleDiscounts={() => setShowDiscounts(!showDiscounts)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Requirements"
                                    showNext={false}
                                    submitLabel="Create Clearance Type"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Clearance Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Clearance Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
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

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Fee</p>
                                                <p className="font-bold text-teal-600 dark:text-teal-400">
                                                    ₱{Number(formData.fee).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Processing</p>
                                                <p className="font-semibold dark:text-gray-300">{formData.processing_days} days</p>
                                            </div>
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