// pages/admin/clearances/create.tsx
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
import { User, FileText, FileCheck, CreditCard, Info, Sparkles, Copy, RefreshCw, Home, Building, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicantTab } from '@/components/admin/clearances/create/applicant-tab';
import { RequestTab } from '@/components/admin/clearances/create/request-tab';
import { RequirementsTab } from '@/components/admin/clearances/create/requirements-tab';
import { route } from 'ziggy-js';
import type { 
    ClearanceType, 
    UrgencyLevel,
    Resident,
    Household,
    Business
} from '@/types/admin/clearances/clearance';

const tabs: TabConfig[] = [
    { id: 'applicant', label: 'Applicant', icon: User, requiredFields: ['payer_id'] },
    { id: 'request', label: 'Request', icon: FileText, requiredFields: ['clearance_type_id', 'purpose', 'needed_date'] },
    { id: 'requirements', label: 'Requirements', icon: FileCheck, requiredFields: [] }
];

const requiredFieldsMap = {
    applicant: ['payer_id'],
    request: ['clearance_type_id', 'purpose', 'needed_date'],
    requirements: []
};

interface FormData {
    payer_type: string;
    payer_id: string;
    resident_id: string;
    household_id: string;
    business_id: string;
    clearance_type_id: string;
    purpose: string;
    specific_purpose: string;
    urgency: UrgencyLevel;
    needed_date: string;
    additional_requirements: string;
    fee_amount: number;
    remarks: string;
}

export default function CreateClearanceRequest() {
    const { props } = usePage<{
        residents: Resident[];
        households: Household[];
        businesses: Business[];
        clearanceTypes: ClearanceType[];
        activeClearanceTypes: ClearanceType[];
        purposeOptions: string[];
    }>();
    
    const {
        residents = [],
        households = [],
        businesses = [],
        clearanceTypes = [],
        activeClearanceTypes = [],
        purposeOptions = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [payerType, setPayerType] = useState<'resident' | 'household' | 'business'>('resident');
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
    const [filteredHouseholds, setFilteredHouseholds] = useState<Household[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

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
        setIsSubmitting
    } = useFormManager<FormData>({
        initialData: {
            payer_type: 'resident',
            payer_id: '',
            resident_id: '',
            household_id: '',
            business_id: '',
            clearance_type_id: '',
            purpose: '',
            specific_purpose: '',
            urgency: 'normal',
            needed_date: new Date().toISOString().split('T')[0],
            additional_requirements: '',
            fee_amount: 0,
            remarks: '',
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.post(route('admin.clearances.store'), data as any, {
                onSuccess: () => {
                    toast.success('Clearance request created successfully');
                    router.visit(route('admin.clearances.index'));
                },
                onError: (errs) => {
                    setLocalErrors(errs);
                    toast.error('Failed to create clearance request');
                }
            });
        }
    });

    // Ensure active tab is 'applicant' when component mounts
    useEffect(() => {
        // Set active tab to 'applicant' on initial load
        setActiveTab('applicant');
    }, []); // Empty dependency array ensures this runs once on mount

    // Memoized values
    const safePurposeOptions = useMemo(() => {
        return Array.isArray(purposeOptions) && purposeOptions.length > 0
            ? purposeOptions
            : ['Employment', 'Travel', 'School Requirement', 'Government Transaction', 'Loan Application', 'Business Requirement'];
    }, [purposeOptions]);

    const selectedPayerDisplay = useMemo(() => {
        if (payerType === 'resident' && selectedResident) {
            return {
                name: selectedResident.full_name,
                details: `${(selectedResident as any).address || 'No address'} • ${selectedResident.contact_number || 'No contact'}`,
                extra: (selectedResident as any).purok ? `Purok ${(selectedResident as any).purok}` : null
            };
        } else if (payerType === 'household' && selectedHousehold) {
            return {
                name: selectedHousehold.head_of_family,
                details: `${selectedHousehold.address || 'No address'} • Household #${selectedHousehold.household_number}`,
                extra: selectedHousehold.purok ? `Purok ${selectedHousehold.purok}` : null
            };
        } else if (payerType === 'business' && selectedBusiness) {
            return {
                name: selectedBusiness.business_name,
                details: `${selectedBusiness.address} • ${selectedBusiness.contact_number}`,
                extra: `Owner: ${selectedBusiness.owner_name}`
            };
        }
        return null;
    }, [payerType, selectedResident, selectedHousehold, selectedBusiness]);

    const requirements = useMemo(() => {
        if (selectedClearanceType?.document_requirements && selectedClearanceType.document_requirements.length > 0) {
            return selectedClearanceType.document_requirements.map(req => req.name);
        }
        return [
            'Valid ID presented',
            'Proof of residency',
            'Barangay clearance fee payment receipt',
            'Recent 2x2 ID picture',
        ];
    }, [selectedClearanceType]);

    const estimatedProcessingDays = useMemo(() => {
        if (!selectedClearanceType) return 0;
        let days = selectedClearanceType.processing_days;
        if (formData.urgency === 'rush') {
            days = Math.ceil(days * 0.5);
        } else if (formData.urgency === 'express') {
            days = 1;
        }
        return days;
    }, [selectedClearanceType, formData.urgency]);

    // Update fee amount based on urgency and clearance type
    useEffect(() => {
        if (selectedClearanceType) {
            let fee = selectedClearanceType.fee;
            if (formData.urgency === 'rush') {
                fee *= 1.5;
            } else if (formData.urgency === 'express') {
                fee *= 2.0;
            }
            updateFormData({ fee_amount: fee });
        }
    }, [selectedClearanceType, formData.urgency, updateFormData]);

    // Filter search results
    useEffect(() => {
        if (payerType === 'resident') {
            const residentsArray = Array.isArray(residents) ? residents : [];
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const results = residentsArray.filter(resident =>
                    (resident.full_name?.toLowerCase() || '').includes(term) ||
                    (resident.first_name?.toLowerCase() || '').includes(term) ||
                    (resident.last_name?.toLowerCase() || '').includes(term) ||
                    ((resident as any).address?.toLowerCase() || '').includes(term) ||
                    (resident.contact_number || '').includes(term)
                );
                setFilteredResidents(results);
            } else {
                setFilteredResidents(residentsArray.slice(0, 10));
            }
        } else if (payerType === 'household') {
            const householdsArray = Array.isArray(households) ? households : [];
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const results = householdsArray.filter(household =>
                    (household.head_of_family?.toLowerCase() || '').includes(term) ||
                    (household.household_number?.toLowerCase() || '').includes(term) ||
                    (household.address?.toLowerCase() || '').includes(term)
                );
                setFilteredHouseholds(results);
            } else {
                setFilteredHouseholds(householdsArray.slice(0, 10));
            }
        } else if (payerType === 'business') {
            const businessesArray = Array.isArray(businesses) ? businesses : [];
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const results = businessesArray.filter(business =>
                    (business.business_name?.toLowerCase() || '').includes(term) ||
                    (business.owner_name?.toLowerCase() || '').includes(term) ||
                    (business.address?.toLowerCase() || '').includes(term) ||
                    (business.contact_number || '').includes(term)
                );
                setFilteredBusinesses(results);
            } else {
                setFilteredBusinesses(businessesArray.slice(0, 10));
            }
        }
    }, [payerType, searchTerm, residents, households, businesses]);

    // Handle payer type change
    const handlePayerTypeChange = (type: 'resident' | 'household' | 'business') => {
        setPayerType(type);
        setSelectedResident(null);
        setSelectedHousehold(null);
        setSelectedBusiness(null);
        updateFormData({
            payer_type: type,
            payer_id: '',
            resident_id: '',
            household_id: '',
            business_id: ''
        });
        setSearchTerm('');
    };

    // Selection handlers
    const handleSelectResident = (resident: Resident) => {
        setSelectedResident(resident);
        updateFormData({
            resident_id: resident.id.toString(),
            payer_id: resident.id.toString(),
            payer_type: 'resident'
        });
        setSearchTerm('');
        toast.success(`Selected ${resident.full_name}`);
    };

    const handleSelectHousehold = (household: Household) => {
        setSelectedHousehold(household);
        updateFormData({
            household_id: household.id.toString(),
            payer_id: household.id.toString(),
            payer_type: 'household'
        });
        setSearchTerm('');
        toast.success(`Selected ${household.head_of_family}'s household`);
    };

    const handleSelectBusiness = (business: Business) => {
        setSelectedBusiness(business);
        updateFormData({
            business_id: business.id.toString(),
            payer_id: business.id.toString(),
            payer_type: 'business'
        });
        setSearchTerm('');
        toast.success(`Selected ${business.business_name}`);
    };

    const handleChangePayer = () => {
        setSelectedResident(null);
        setSelectedHousehold(null);
        setSelectedBusiness(null);
        updateFormData({
            resident_id: '',
            household_id: '',
            business_id: '',
            payer_id: ''
        });
        setSearchTerm('');
    };

    // Get payer icon
    const getPayerIcon = (type: string) => {
        switch (type) {
            case 'resident': return <User className="h-4 w-4" />;
            case 'household': return <Home className="h-4 w-4" />;
            case 'business': return <Building className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    // Get urgency color
    const getUrgencyColor = (urgency: UrgencyLevel): string => {
        switch (urgency) {
            case 'express': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'rush': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (payerType === 'resident' && !selectedResident) {
            newErrors.payer_id = 'Please select a resident';
        }
        if (payerType === 'household' && !selectedHousehold) {
            newErrors.payer_id = 'Please select a household';
        }
        if (payerType === 'business' && !selectedBusiness) {
            newErrors.payer_id = 'Please select a business';
        }
        if (!selectedClearanceType) {
            newErrors.clearance_type_id = 'Please select a clearance type';
        }
        if (!formData.purpose) {
            newErrors.purpose = 'Please select a purpose';
        }
        if (!formData.needed_date) {
            newErrors.needed_date = 'Please select a needed by date';
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle custom submit with payment
    const handleSubmitWithPayment = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setActiveTab('applicant');
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        const submitData = {
            ...formData,
            proceed_to_payment: true
        };

        router.post(route('admin.clearances.store'), submitData, {
            onSuccess: (page) => {
                toast.success('Clearance request created successfully');
                
                if (formData.fee_amount > 0 && (page.props as any)?.clearance?.id) {
                    const clearance = (page.props as any).clearance;
                    
                    let payerId = '';
                    let payerName = '';
                    let contactNumber = '';
                    let address = '';
                    let purok = '';
                    
                    if (payerType === 'resident' && selectedResident) {
                        payerId = selectedResident.id.toString();
                        payerName = selectedResident.full_name;
                        contactNumber = selectedResident.contact_number || '';
                        address = (selectedResident as any).address || '';
                        purok = (selectedResident as any).purok || '';
                    } else if (payerType === 'household' && selectedHousehold) {
                        payerId = selectedHousehold.id.toString();
                        payerName = selectedHousehold.head_of_family;
                        address = selectedHousehold.address || '';
                        purok = selectedHousehold.purok || '';
                    } else if (payerType === 'business' && selectedBusiness) {
                        payerId = selectedBusiness.id.toString();
                        payerName = selectedBusiness.business_name;
                        contactNumber = selectedBusiness.contact_number;
                        address = selectedBusiness.address;
                        purok = selectedBusiness.purok || '';
                    }
                    
                    const params = new URLSearchParams({
                        payer_type: payerType,
                        payer_id: payerId,
                        payer_name: payerName,
                        contact_number: contactNumber,
                        address: address,
                        purok: purok,
                        fee_id: clearance.id.toString(),
                        fee_code: clearance.fee_code || `CLR-${clearance.id}`,
                        fee_amount: clearance.amount?.toString() || formData.fee_amount.toString(),
                        fee_description: `${selectedClearanceType?.name} Clearance`,
                        from_clearance: 'true',
                        clearance_created: 'true',
                        clearance_type: selectedClearanceType?.name || 'Clearance',
                        _t: Date.now().toString()
                    });
                    
                    router.visit(route('payments.create') + '?' + params.toString());
                } else {
                    router.visit(route('admin.clearances.index'));
                }
                
                setIsSubmitting(false);
            },
            onError: (errs) => {
                setLocalErrors(errs);
                toast.error('Failed to create clearance request');
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setSelectedResident(null);
            setSelectedHousehold(null);
            setSelectedBusiness(null);
            setSelectedClearanceType(null);
            setSearchTerm('');
            setLocalErrors({});
            setActiveTab('applicant'); // Reset to applicant tab
            toast.info('Form reset');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (formData.clearance_type_id || selectedPayerDisplay) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.clearances.index'));
            }
        } else {
            router.visit(route('admin.clearances.index'));
        }
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        applicant: getTabStatus('applicant'),
        request: getTabStatus('request'),
        requirements: getTabStatus('requirements')
    };

    const missingFields = getMissingFields();
    const allErrors = { ...errors, ...localErrors };

    const requiredFieldsList = [
        { label: 'Applicant', value: !!selectedPayerDisplay, tabId: 'applicant' },
        { label: 'Clearance Type', value: !!selectedClearanceType, tabId: 'request' },
        { label: 'Purpose', value: !!formData.purpose, tabId: 'request' },
        { label: 'Needed Date', value: !!formData.needed_date, tabId: 'request' },
    ];

    const tabOrder = ['applicant', 'request', 'requirements'];

    return (
        <AppLayout
            title="Create Clearance Request"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearances', href: '/admin/clearances' },
                { title: 'Create', href: '/admin/clearances/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Clearance Request"
                    description="Process a clearance request for a resident, household, or business"
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
                            <h3 className="font-medium text-blue-800 dark:text-blue-300">Quick start</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                Select a popular clearance type to get started.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {activeClearanceTypes.filter(ct => ct.is_popular).slice(0, 4).map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedClearanceType(type);
                                            updateFormData({ clearance_type_id: type.id.toString(), fee_amount: type.fee });
                                            setActiveTab('request');
                                            toast.success(`${type.name} selected`);
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <Copy className="h-3 w-3" />
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {formData.fee_amount > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-green-800 dark:text-green-300">Payment Required</h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Use "Create & Pay" to go directly to payment and add other fees.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.fee_amount === 0 && selectedClearanceType && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-blue-800 dark:text-blue-300">No Payment Required</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        This clearance type has no fee. The request will be created and automatically processed.
                                    </p>
                                </div>
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

                        {activeTab === 'applicant' && (
                            <>
                                <FormContainer title="Applicant Information" description="Select who is requesting the clearance">
                                    <ApplicantTab
                                        payerType={payerType}
                                        searchTerm={searchTerm}
                                        selectedPayerDisplay={selectedPayerDisplay}
                                        filteredResidents={filteredResidents}
                                        filteredHouseholds={filteredHouseholds}
                                        filteredBusinesses={filteredBusinesses}
                                        errors={allErrors}
                                        isLocked={false}
                                        isSubmitting={isSubmitting}
                                        onPayerTypeChange={handlePayerTypeChange}
                                        onSearchChange={setSearchTerm}
                                        onClearSearch={() => setSearchTerm('')}
                                        onSelectResident={handleSelectResident}
                                        onSelectHousehold={handleSelectHousehold}
                                        onSelectBusiness={handleSelectBusiness}
                                        onChangePayer={handleChangePayer}
                                        onInputChange={handleInputChange}
                                        getPayerIcon={getPayerIcon}
                                        formData={formData}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={!!selectedPayerDisplay}
                                    showPrevious={false}
                                    nextLabel="Next: Request Details"
                                />
                            </>
                        )}

                        {activeTab === 'request' && (
                            <>
                                <FormContainer title="Clearance Request Details" description="Select clearance type and provide purpose">
                                    <RequestTab
                                        formData={formData}
                                        errors={allErrors}
                                        activeClearanceTypes={activeClearanceTypes}
                                        safePurposeOptions={safePurposeOptions}
                                        selectedClearanceType={selectedClearanceType}
                                        isSubmitting={isSubmitting}
                                        onSelectChange={handleSelectChange}
                                        onInputChange={handleInputChange}
                                        formatCurrency={formatCurrency}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={!!selectedClearanceType && !!formData.purpose}
                                    previousLabel="Back: Applicant"
                                    nextLabel="Next: Requirements"
                                />
                            </>
                        )}

                        {activeTab === 'requirements' && (
                            <>
                                <FormContainer title="Requirements Checklist" description="Required documents for this clearance type">
                                    <RequirementsTab
                                        requirements={requirements}
                                        selectedClearanceType={selectedClearanceType}
                                        formatCurrency={formatCurrency}
                                    />
                                </FormContainer>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                        className="dark:border-gray-600 dark:text-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <div className="flex-1" />
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !selectedPayerDisplay || !selectedClearanceType}
                                        className="dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Request'}
                                    </Button>
                                    {formData.fee_amount > 0 && (
                                        <Button
                                            type="button"
                                            onClick={handleSubmitWithPayment}
                                            disabled={isSubmitting || !selectedPayerDisplay || !selectedClearanceType}
                                            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Create & Pay
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Request Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Request Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Applicant:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {selectedPayerDisplay ? selectedPayerDisplay.name : 'Not selected'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Clearance Type:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {selectedClearanceType?.name || 'Not selected'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Urgency:</span>
                                                <span className={`font-medium px-2 py-0.5 rounded ${getUrgencyColor(formData.urgency)}`}>
                                                    {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(formData.fee_amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Processing:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {estimatedProcessingDays} days
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Needed By:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {formatDate(formData.needed_date)}
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