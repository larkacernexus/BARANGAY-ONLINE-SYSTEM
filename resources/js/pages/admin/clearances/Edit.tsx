// pages/admin/clearances/edit.tsx
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
import { User, FileText, FileCheck, CreditCard, History, Trash2, RefreshCw, AlertCircle, Home, Building } from 'lucide-react';
import { ApplicantTab } from '@/components/admin/clearances/create/applicant-tab';
import { RequestTab } from '@/components/admin/clearances/create/request-tab';
import { RequirementsTab } from '@/components/admin/clearances/create/requirements-tab';
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
    ClearanceRequest, 
    ClearanceType, 
    ClearanceStatus, 
    UrgencyLevel,
    PaymentStatus,
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
    status: ClearanceStatus;
}

export default function EditClearanceRequest() {
    const { props } = usePage<{
        clearance: ClearanceRequest;
        residents: Resident[];
        households: Household[];
        businesses: Business[];
        clearanceTypes: ClearanceType[];
        activeClearanceTypes: ClearanceType[];
        purposeOptions: string[];
    }>();
    
    const clearance = props.clearance;
    const {
        residents = [],
        households = [],
        businesses = [],
        clearanceTypes = [],
        activeClearanceTypes = [],
        purposeOptions = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [payerType, setPayerType] = useState<'resident' | 'household' | 'business'>(clearance.payer_type as 'resident' | 'household' | 'business');
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
    const [filteredHouseholds, setFilteredHouseholds] = useState<Household[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
            payer_type: clearance.payer_type || '',
            payer_id: clearance.payer_id?.toString() || '',
            resident_id: clearance.resident_id?.toString() || '',
            household_id: (clearance as any).household_id?.toString() || '',
            business_id: (clearance as any).business_id?.toString() || '',
            clearance_type_id: clearance.clearance_type_id.toString(),
            purpose: clearance.purpose,
            specific_purpose: clearance.specific_purpose || '',
            urgency: clearance.urgency,
            needed_date: clearance.needed_date,
            additional_requirements: clearance.additional_requirements || '',
            fee_amount: clearance.fee_amount,
            remarks: clearance.remarks || '',
            status: clearance.status,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.put(route('admin.clearances.update', clearance.id), data as any, {
                onSuccess: () => {
                    toast.success('Clearance request updated successfully');
                    router.visit(route('admin.clearances.show', clearance.id));
                },
                onError: (errs) => {
                    toast.error('Failed to update clearance request');
                }
            });
        }
    });

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

    const canEdit = clearance.status !== 'issued' && clearance.status !== 'rejected' && clearance.status !== 'cancelled';
    const isLocked = !canEdit;

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

    // Get status badge
    const getStatusBadge = (status: ClearanceStatus): string => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'pending_payment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'issued': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    // Get payment status badge
    const getPaymentStatusBadge = (status: PaymentStatus | string): string => {
        switch (status) {
            case 'pending': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'failed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

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

    // Handle delete
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.clearances.destroy', clearance.id), {
            onSuccess: () => {
                toast.success('Clearance request deleted successfully');
                router.visit(route('admin.clearances.index'));
            },
            onError: () => {
                toast.error('Failed to delete clearance request');
                setShowDeleteDialog(false);
            }
        });
    };

    // Count changed fields
    const changedFieldsCount = () => {
        let count = 0;
        if (formData.purpose !== clearance.purpose) count++;
        if (formData.urgency !== clearance.urgency) count++;
        if (formData.needed_date !== clearance.needed_date) count++;
        if (formData.clearance_type_id !== clearance.clearance_type_id?.toString()) count++;
        if (formData.status !== clearance.status) count++;
        if (formData.remarks !== (clearance.remarks || '')) count++;
        if (payerType !== clearance.payer_type) count++;
        if (selectedResident && clearance.resident_id?.toString() !== selectedResident.id.toString()) count++;
        if (selectedHousehold && (clearance as any).household_id?.toString() !== selectedHousehold.id.toString()) count++;
        if (selectedBusiness && (clearance as any).business_id?.toString() !== selectedBusiness.id.toString()) count++;
        return count;
    };

    // Load initial selected data
    useEffect(() => {
        const type = clearanceTypes.find(t => t.id.toString() === clearance.clearance_type_id.toString());
        if (type) {
            setSelectedClearanceType(type);
        }

        if (clearance.payer_type === 'resident' && clearance.resident_id) {
            const resident = residents.find(r => r.id.toString() === clearance.resident_id?.toString());
            if (resident) {
                setSelectedResident(resident);
            }
        } else if (clearance.payer_type === 'household' && (clearance as any).household_id) {
            const household = households.find(h => h.id.toString() === (clearance as any).household_id?.toString());
            if (household) {
                setSelectedHousehold(household);
            }
        } else if (clearance.payer_type === 'business' && (clearance as any).business_id) {
            const business = businesses.find(b => b.id.toString() === (clearance as any).business_id?.toString());
            if (business) {
                setSelectedBusiness(business);
            }
        }
    }, [clearance, clearanceTypes, residents, households, businesses]);

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

    // Handle reset
    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setPayerType(clearance.payer_type as 'resident' | 'household' | 'business');
            setSelectedClearanceType(clearanceTypes.find(t => t.id.toString() === clearance.clearance_type_id.toString()) || null);
            toast.info('Form reset to original values');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.clearances.show', clearance.id));
            }
        } else {
            router.visit(route('admin.clearances.show', clearance.id));
        }
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        applicant: getTabStatus('applicant'),
        request: getTabStatus('request'),
        requirements: getTabStatus('requirements')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Applicant', value: !!selectedPayerDisplay, tabId: 'applicant' },
        { label: 'Clearance Type', value: !!selectedClearanceType, tabId: 'request' },
        { label: 'Purpose', value: !!formData.purpose, tabId: 'request' },
        { label: 'Needed Date', value: !!formData.needed_date, tabId: 'request' },
    ];

    const tabOrder = ['applicant', 'request', 'requirements'];

    return (
        <AppLayout
            title={`Edit Clearance Request #${clearance.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearances', href: '/admin/clearances' },
                { title: `#${clearance.id}`, href: route('admin.clearances.show', clearance.id) },
                { title: 'Edit', href: route('admin.clearances.edit', clearance.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Clearance Request"
                    description={`Editing request #${clearance.id}`}
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
                            {hasUnsavedChanges && !isLocked && (
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
                                #{clearance.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${getStatusBadge(clearance.status)}`}>
                                {clearance.status}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${getPaymentStatusBadge((clearance as any).payment?.status || 'pending')}`}>
                                {(clearance as any).payment?.status || 'pending'}
                            </div>
                        </div>
                    }
                />

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className={`border-l-4 ${getStatusBadge(clearance.status).replace('bg-', 'border-l-').split(' ')[0]} bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4`}>
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <FileCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Request Status</p>
                                <p className="font-medium capitalize dark:text-gray-200">{clearance.status}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fee Amount</p>
                                <p className="font-medium dark:text-gray-200">{formatCurrency(clearance.fee_amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Last Updated Info */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Last updated: {formatDate(clearance.updated_at)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created: {formatDate(clearance.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Locked Alert */}
                {isLocked && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-300">Request is Locked</p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    This request cannot be edited because it has been {clearance.status}.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Changes Banner */}
                {hasUnsavedChanges && !isLocked && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                <span className="font-medium text-blue-800 dark:text-blue-300">
                                    {changedFieldsCount()} field{changedFieldsCount() !== 1 ? 's' : ''} modified
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

                <FormErrors errors={errors} />

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
                                        errors={errors}
                                        isLocked={isLocked}
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
                                        errors={errors}
                                        activeClearanceTypes={activeClearanceTypes}
                                        safePurposeOptions={safePurposeOptions}
                                        selectedClearanceType={selectedClearanceType}
                                        originalClearanceTypeId={clearance.clearance_type_id?.toString()}
                                        originalPurpose={clearance.purpose}
                                        originalUrgency={clearance.urgency}
                                        isLocked={isLocked}
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
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={!!selectedPayerDisplay && !!selectedClearanceType}
                                    previousLabel="Back: Request"
                                    showNext={false}
                                    submitLabel="Save Changes"
                                />
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
                                                <span className="text-gray-500 dark:text-gray-400">Request ID:</span>
                                                <span className="font-medium dark:text-gray-300">#{clearance.id}</span>
                                            </div>
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
                                            <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`font-medium ${getStatusBadge(formData.status)}`}>
                                                    {formData.status}
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
                            Delete Clearance Request
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete clearance request #{clearance.id}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 p-4 rounded dark:bg-gray-800">
                            <p className="font-medium dark:text-white">{selectedPayerDisplay?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {selectedClearanceType?.name || 'Clearance'} • Created: {formatDate(clearance.created_at)}
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete Request
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}