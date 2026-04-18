// pages/admin/clearance-types/edit.tsx
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
import { FileText, DollarSign, File, Settings, History, Trash2, RefreshCw, Calendar, Heart, GraduationCap, Briefcase, Wallet, Vote, Clock, Gavel, Award } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/clearance-types/create/basic-info-tab';
import { FeesTab } from '@/components/admin/clearance-types/create/fees-tab';
import { RequirementsTab } from '@/components/admin/clearance-types/create/requirements-tab';
import { SettingsTab } from '@/components/admin/clearance-types/create/settings-tab';
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
import type { 
    ClearanceType, 
    DocumentType, 
    PrivilegeData,
    EligibilityCriterion,
    DiscountConfig,
    ClearanceTypeFormData
} from '@/types/admin/clearance-types/clearance-types';

interface PageProps {
    clearanceType: ClearanceType;
    documentTypes: DocumentType[];
    defaultPurposeOptions: string[];
    eligibilityOperators: Array<{ value: string; label: string }>;
    privileges: PrivilegeData[];
    [key: string]: unknown;
}

interface FormData extends ClearanceTypeFormData {
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

// Helper function for safe number conversion
const safeNumber = (value: string | number | undefined | null, defaultValue: number = 0): number => {
    if (value === undefined || value === null || value === '') return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
};

// Helper function to parse eligibility criteria (handles both string and array)
const parseEligibilityCriteria = (criteria: string | EligibilityCriterion[] | undefined): EligibilityCriterion[] => {
    if (!criteria) return [];
    if (Array.isArray(criteria)) return criteria;
    if (typeof criteria === 'string') {
        try {
            const parsed = JSON.parse(criteria);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

export default function EditClearanceType() {
    const { props } = usePage<PageProps>();
    const {
        clearanceType,
        documentTypes = [],
        defaultPurposeOptions = [],
        eligibilityOperators = [],
        privileges = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [purposeOptions, setPurposeOptions] = useState<string[]>(
        clearanceType.purpose_options 
            ? clearanceType.purpose_options.split(',').map(s => s.trim()).filter(s => s)
            : defaultPurposeOptions
    );
    const [newPurposeOption, setNewPurposeOption] = useState('');
    const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriterion[]>(
        parseEligibilityCriteria(clearanceType.eligibility_criteria)
    );
    const [showEligibilityForm, setShowEligibilityForm] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>(
        clearanceType.document_types?.map(d => d.id) || []
    );
    const [documentCategory, setDocumentCategory] = useState<string>('all');
    const [searchDocument, setSearchDocument] = useState('');
    const [discountConfigs, setDiscountConfigs] = useState<DiscountConfig[]>([]);
    const [showDiscounts, setShowDiscounts] = useState(false);
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
    } = useFormManager<FormData>({
        initialData: {
            name: clearanceType.name || '',
            code: clearanceType.code || '',
            description: clearanceType.description || '',
            fee: clearanceType.fee || 0,
            processing_days: clearanceType.processing_days || 1,
            validity_days: clearanceType.validity_days || 30,
            is_active: clearanceType.is_active ?? true,
            requires_payment: clearanceType.requires_payment ?? true,
            requires_approval: clearanceType.requires_approval ?? false,
            is_online_only: clearanceType.is_online_only ?? false,
            is_discountable: clearanceType.is_discountable ?? false,
            purpose_options: clearanceType.purpose_options || defaultPurposeOptions.join(', '),
            document_type_ids: clearanceType.document_types?.map(d => d.id) || [],
            eligibility_criteria: parseEligibilityCriteria(clearanceType.eligibility_criteria),
            discount_configs: clearanceType.discount_configs || [],
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
            
            // Safe number conversions
            const feeAmount = safeNumber(data.fee, 0);
            const processingDays = safeNumber(data.processing_days, 1);
            const validityDays = safeNumber(data.validity_days, 1);
            
            if (feeAmount < 0) {
                newErrors.fee = 'Fee cannot be negative';
            }
            if (processingDays < 1) {
                newErrors.processing_days = 'Processing days must be at least 1';
            }
            if (validityDays < 1) {
                newErrors.validity_days = 'Validity days must be at least 1';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.put(route('clearance-types.update', clearanceType.id), data as any, {
                onSuccess: () => {
                    toast.success('Clearance type updated successfully');
                    router.visit(route('clearance-types.show', clearanceType.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update clearance type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Memoized values
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

    const residentFields = useMemo(() => [
        { value: 'age', label: 'Age', icon: <Calendar className="h-4 w-4" /> },
        { value: 'civil_status', label: 'Civil Status', icon: <Heart className="h-4 w-4" /> },
        { value: 'educational_attainment', label: 'Educational Attainment', icon: <GraduationCap className="h-4 w-4" /> },
        { value: 'occupation', label: 'Occupation', icon: <Briefcase className="h-4 w-4" /> },
        { value: 'monthly_income', label: 'Monthly Income', icon: <Wallet className="h-4 w-4" /> },
        { value: 'is_registered_voter', label: 'Registered Voter', icon: <Vote className="h-4 w-4" /> },
        { value: 'years_in_barangay', label: 'Years in Barangay', icon: <Clock className="h-4 w-4" /> },
        { value: 'has_pending_case', label: 'Has Pending Case', icon: <Gavel className="h-4 w-4" /> },
        ...privileges.map(p => ({
            value: `has_${p.code.toLowerCase()}`,
            label: p.name,
            icon: <Award className="h-4 w-4" />
        }))
    ], [privileges]);

    // Initialize discount configs
    useEffect(() => {
        if (privileges && privileges.length > 0) {
            const existingConfigs = formData.discount_configs || [];
            
            const initialConfigs: DiscountConfig[] = privileges
                .filter(p => p.is_active)
                .map(p => {
                    const existing = existingConfigs.find(c => c.privilege_id === p.id);
                    return {
                        privilege_id: p.id,
                        privilege_code: p.code,
                        privilege_name: p.name,
                        discount_percentage: existing?.discount_percentage ?? p.default_discount_percentage ?? 0,
                        is_active: existing?.is_active ?? false,
                        requires_verification: p.requires_verification ?? false,
                        requires_id_number: p.requires_id_number ?? false
                    };
                });
            setDiscountConfigs(initialConfigs);
        }
    }, [privileges, formData.discount_configs]);

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
    const handleSwitchChange = useCallback((name: keyof FormData, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

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
            toast.success('Purpose option added');
        }
    }, [newPurposeOption, purposeOptions, updateFormData]);

    const handleRemovePurposeOption = useCallback((index: number) => {
        const updatedOptions = purposeOptions.filter((_, i) => i !== index);
        setPurposeOptions(updatedOptions);
        updateFormData({ purpose_options: updatedOptions.join(', ') });
        toast.info('Purpose option removed');
    }, [purposeOptions, updateFormData]);

    // Handle eligibility criteria
    const handleAddEligibilityCriterion = useCallback(() => {
        const newCriteria = [...eligibilityCriteria, { field: '', operator: 'equals', value: '' }];
        setEligibilityCriteria(newCriteria);
        updateFormData({ eligibility_criteria: newCriteria });
    }, [eligibilityCriteria, updateFormData]);

    const handleUpdateEligibilityCriterion = useCallback((index: number, field: keyof EligibilityCriterion, value: string) => {
        const updatedCriteria = [...eligibilityCriteria];
        updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
        setEligibilityCriteria(updatedCriteria);
        updateFormData({ eligibility_criteria: updatedCriteria });
    }, [eligibilityCriteria, updateFormData]);

    const handleRemoveEligibilityCriterion = useCallback((index: number) => {
        const updatedCriteria = eligibilityCriteria.filter((_, i) => i !== index);
        setEligibilityCriteria(updatedCriteria);
        updateFormData({ eligibility_criteria: updatedCriteria });
    }, [eligibilityCriteria, updateFormData]);

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
            toast.error('Please enter a clearance name first');
        }
    }, [formData.name, updateFormData]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('clearance-types.destroy', clearanceType.id), {
            onSuccess: () => {
                toast.success('Clearance type deleted successfully');
                router.visit(route('admin.clearance-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete clearance type');
                setShowDeleteDialog(false);
            }
        });
    }, [clearanceType.id]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setPurposeOptions(
                clearanceType.purpose_options 
                    ? clearanceType.purpose_options.split(',').map(s => s.trim()).filter(s => s)
                    : defaultPurposeOptions
            );
            setEligibilityCriteria(parseEligibilityCriteria(clearanceType.eligibility_criteria));
            setSelectedDocumentTypes(clearanceType.document_types?.map(d => d.id) || []);
            setValidationErrors({});
            setShowResetDialog(false);
            toast.info('Form reset to original values');
        }
    }, [resetForm, clearanceType, defaultPurposeOptions]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('clearance-types.show', clearanceType.id));
            }
        } else {
            router.visit(route('clearance-types.show', clearanceType.id));
        }
    }, [hasUnsavedChanges, clearanceType.id]);

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

    // Format currency
    const formatCurrency = useCallback((amount: number) => `₱${amount.toFixed(2)}`, []);

    // Format date
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
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
        if (formData.name !== clearanceType.name) count++;
        if (formData.description !== (clearanceType.description || '')) count++;
        if (formData.fee !== clearanceType.fee) count++;
        if (formData.processing_days !== clearanceType.processing_days) count++;
        if (formData.validity_days !== clearanceType.validity_days) count++;
        if (formData.is_active !== clearanceType.is_active) count++;
        if (formData.requires_payment !== clearanceType.requires_payment) count++;
        if (formData.requires_approval !== clearanceType.requires_approval) count++;
        if (formData.is_online_only !== clearanceType.is_online_only) count++;
        if (JSON.stringify(selectedDocumentTypes) !== JSON.stringify(clearanceType.document_types?.map(d => d.id) || [])) count++;
        if (JSON.stringify(eligibilityCriteria) !== JSON.stringify(parseEligibilityCriteria(clearanceType.eligibility_criteria))) count++;
        return count;
    }, [formData, clearanceType, selectedDocumentTypes, eligibilityCriteria]);

    return (
        <AppLayout
            title={`Edit Clearance Type: ${clearanceType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Types', href: '/admin/clearance-types' },
                { title: clearanceType.name, href: route('clearance-types.show', clearanceType.id) },
                { title: 'Edit', href: route('clearance-types.edit', clearanceType.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Clearance Type"
                    description={`Editing ${clearanceType.name}`}
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
                                    onClick={() => setShowResetDialog(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                Code: {clearanceType.code}
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
                                    Last updated: {formatDate(clearanceType.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(clearanceType.created_at)}
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
                                <FormContainer title="Basic Information" description="Update the core details for this clearance type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        originalName={clearanceType.name}
                                        originalCode={clearanceType.code}
                                        originalDescription={clearanceType.description}
                                        copiedField={copiedField}
                                        onInputChange={handleInputChange}
                                        onGenerateCode={generateCode}
                                        onCopy={handleCopy}
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
                                <FormContainer title="Fees & Duration" description="Update processing time and validity period">
                                    <FeesTab
                                        formData={formData}
                                        errors={allErrors}
                                        purposeOptions={purposeOptions}
                                        newPurposeOption={newPurposeOption}
                                        originalFee={clearanceType.fee}
                                        originalProcessingDays={clearanceType.processing_days}
                                        originalValidityDays={clearanceType.validity_days}
                                        onNumberChange={handleNumberChange}
                                        onAddPurposeOption={handleAddPurposeOption}
                                        onRemovePurposeOption={handleRemovePurposeOption}
                                        onNewPurposeOptionChange={setNewPurposeOption}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Requirements"
                                />
                            </>
                        )}

                        {activeTab === 'requirements' && (
                            <>
                                <FormContainer title="Requirements" description="Update document requirements and eligibility criteria">
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
                                        residentFields={residentFields}
                                        showEligibilityForm={showEligibilityForm}
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
                                <FormContainer title="Settings" description="Update behavior and discount options">
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
                                    submitLabel="Update Clearance Type"
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
                                                <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                    {formData.code || <span className="text-gray-400 italic">No code</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Fee</p>
                                                <p className="font-bold text-teal-600 dark:text-teal-400">
                                                    {formatCurrency(safeNumber(formData.fee, 0))}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">Processing</p>
                                                <p className="font-semibold dark:text-gray-300">{safeNumber(formData.processing_days, 0)} days</p>
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
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Documents:</span>
                                            <span className="font-medium dark:text-gray-300">{selectedDocumentTypes.length} required</span>
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
                            Delete Clearance Type
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{clearanceType.name}"? This action cannot be undone.
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