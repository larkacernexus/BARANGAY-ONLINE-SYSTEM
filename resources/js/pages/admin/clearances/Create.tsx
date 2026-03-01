import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    Save,
    FileText,
    User,
    Calendar,
    DollarSign,
    Search,
    Clock,
    AlertCircle,
    Zap,
    Info,
    FileCheck,
    Shield,
    Loader2,
    Tag,
    CreditCard,
    Home,
    Building
} from 'lucide-react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { route } from 'ziggy-js';

// --- Interfaces ---
interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    is_discountable: boolean;
    requirements?: string[];
    purpose_options?: string;
}

interface Resident {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    contact_number: string;
    address: string;
    purok: string;
    purok_id?: number;
    household_id?: number;
    household_number?: string;
}

interface Household {
    id: number;
    household_number: string;
    head_name: string;
    address: string;
    purok: string;
}

interface Business {
    id: number;
    business_name: string;
    owner_name: string;
    contact_number: string;
    address: string;
    purok: string;
    business_permit_number?: string;
}

interface PageProps {
    residents: Resident[];
    households?: Household[];
    businesses?: Business[];
    clearanceTypes: ClearanceType[];
    activeClearanceTypes: ClearanceType[];
    purposeOptions: string[] | null;
    requestData?: {
        resident_id?: string;
        household_id?: string;
        business_id?: string;
        payer_type?: 'resident' | 'household' | 'business';
        clearance_type_id?: string;
        purpose?: string;
        fee_amount?: string;
        reference_number?: string;
        needed_date?: string;
    };
}

// --- Helper Functions ---
const formatCurrency = (amount: any): string => {
    if (typeof amount === 'number') {
        return `₱${amount.toFixed(2)}`;
    }
    const num = parseFloat(amount);
    return `₱${isNaN(num) ? '0.00' : num.toFixed(2)}`;
};

const getFeeAsNumber = (fee: any): number => {
    if (typeof fee === 'number') return fee;
    const num = parseFloat(fee);
    return isNaN(num) ? 0 : num;
};

const getUrlParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
        resident_id: params.get('resident_id') || '',
        household_id: params.get('household_id') || '',
        business_id: params.get('business_id') || '',
        payer_type: params.get('payer_type') || 'resident',
        clearance_type_id: params.get('clearance_type_id') || '',
        purpose: params.get('purpose') || '',
        fee_amount: params.get('fee_amount') || '',
        reference_number: params.get('reference_number') || '',
        needed_date: params.get('needed_date') || '',
    };
};

const getPayerIcon = (payerType: string) => {
    switch (payerType) {
        case 'resident': return <User className="h-5 w-5" />;
        case 'household': return <Home className="h-5 w-5" />;
        case 'business': return <Building className="h-5 w-5" />;
        default: return <User className="h-5 w-5" />;
    }
};

// --- Main Component ---
export default function CreateClearanceRequest() {
    const { props } = usePage<PageProps>();
    const { 
        residents, 
        households = [], 
        businesses = [], 
        clearanceTypes, 
        activeClearanceTypes, 
        purposeOptions = [] 
    } = props;

    // State for payer selection
    const [payerType, setPayerType] = useState<'resident' | 'household' | 'business'>('resident');
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(null);
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
    const [filteredHouseholds, setFilteredHouseholds] = useState<Household[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    
    const [isFromRequest, setIsFromRequest] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sourceRequestInfo, setSourceRequestInfo] = useState<{
        reference_number?: string;
        needed_date?: string;
    }>({});

    // FIXED: Added payer_id to the form data
    const { data, setData, post, processing, errors } = useForm({
        payer_type: 'resident' as 'resident' | 'household' | 'business',
        payer_id: '', // ADDED: This was missing
        resident_id: '',
        household_id: '',
        business_id: '',
        clearance_type_id: '',
        purpose: '',
        specific_purpose: '',
        urgency: 'normal' as 'normal' | 'rush' | 'express',
        needed_date: new Date().toISOString().split('T')[0],
        additional_requirements: '',
        fee_amount: 0,
        remarks: '',
    });

    // Filter residents/households/businesses based on search
    useEffect(() => {
        if (payerType === 'resident') {
            const residentsArray = Array.isArray(residents) ? residents : [];
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const results = residentsArray.filter(resident =>
                    (resident.name?.toLowerCase() || '').includes(term) ||
                    (resident.first_name?.toLowerCase() || '').includes(term) ||
                    (resident.last_name?.toLowerCase() || '').includes(term) ||
                    (resident.address?.toLowerCase() || '').includes(term) ||
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
                    (household.head_name?.toLowerCase() || '').includes(term) ||
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
    }, [searchTerm, payerType, residents, households, businesses]);

    // Check URL parameters on component mount
    useEffect(() => {
        const urlParams = getUrlParams();

        if (urlParams.resident_id || urlParams.household_id || urlParams.business_id || urlParams.clearance_type_id) {
            setIsFromRequest(true);
            setSourceRequestInfo({
                reference_number: urlParams.reference_number,
                needed_date: urlParams.needed_date,
            });

            // Set payer type
            if (urlParams.payer_type) {
                setPayerType(urlParams.payer_type as 'resident' | 'household' | 'business');
                setData('payer_type', urlParams.payer_type as 'resident' | 'household' | 'business');
            }

            // Set resident
            if (urlParams.resident_id) {
                const residentId = urlParams.resident_id;
                const resident = residents.find(r => r.id.toString() === residentId);
                if (resident) {
                    setSelectedResident(resident);
                    setData({
                        ...data,
                        resident_id: residentId,
                        payer_id: residentId // ADDED: Set payer_id
                    });
                }
            }

            // Set household
            if (urlParams.household_id) {
                const householdId = urlParams.household_id;
                const household = households.find(h => h.id.toString() === householdId);
                if (household) {
                    setSelectedHousehold(household);
                    setData({
                        ...data,
                        household_id: householdId,
                        payer_id: householdId // ADDED: Set payer_id
                    });
                }
            }

            // Set business
            if (urlParams.business_id) {
                const businessId = urlParams.business_id;
                const business = businesses.find(b => b.id.toString() === businessId);
                if (business) {
                    setSelectedBusiness(business);
                    setData({
                        ...data,
                        business_id: businessId,
                        payer_id: businessId // ADDED: Set payer_id
                    });
                }
            }

            // Set clearance type
            if (urlParams.clearance_type_id) {
                const typeId = urlParams.clearance_type_id;
                const type = clearanceTypes.find(t => t.id.toString() === typeId);
                if (type) {
                    setSelectedClearanceType(type);
                    setData('clearance_type_id', typeId);
                }
            }

            if (urlParams.purpose) {
                setData('purpose', urlParams.purpose);
            }

            if (urlParams.fee_amount) {
                setData('fee_amount', parseFloat(urlParams.fee_amount) || 0);
            }

            if (urlParams.needed_date) {
                setData('needed_date', urlParams.needed_date);
            }

            if (urlParams.reference_number) {
                setData('remarks', `Created from online request: ${urlParams.reference_number}`);
            }
        }
    }, [residents, households, businesses, clearanceTypes]);

    // Update fee amount and auto-calculate urgency fee
    useEffect(() => {
        if (selectedClearanceType) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);

            if (data.urgency === 'rush') {
                fee *= 1.5;
            } else if (data.urgency === 'express') {
                fee *= 2.0;
            }

            setData('clearance_type_id', selectedClearanceType.id.toString());

            if (!isFromRequest) {
                setData('fee_amount', fee);
            }
        }
    }, [selectedClearanceType, data.urgency, setData, isFromRequest]);

    // Handle payer type change
    const handlePayerTypeChange = (type: 'resident' | 'household' | 'business') => {
        setPayerType(type);
        setData({
            ...data,
            payer_type: type,
            payer_id: '', // Clear payer_id
            resident_id: '',
            household_id: '',
            business_id: ''
        });
        
        // Clear selected payer
        setSelectedResident(null);
        setSelectedHousehold(null);
        setSelectedBusiness(null);
        setSearchTerm('');
    };

    // FIXED: Added payer_id to selection handlers
    const handleSelectResident = (resident: Resident) => {
        setSelectedResident(resident);
        setData({
            ...data,
            resident_id: resident.id.toString(),
            payer_id: resident.id.toString(), // ADDED: Set payer_id
            payer_type: 'resident'
        });
        setSearchTerm('');
    };

    const handleSelectHousehold = (household: Household) => {
        setSelectedHousehold(household);
        setData({
            ...data,
            household_id: household.id.toString(),
            payer_id: household.id.toString(), // ADDED: Set payer_id
            payer_type: 'household'
        });
        setSearchTerm('');
    };

    const handleSelectBusiness = (business: Business) => {
        setSelectedBusiness(business);
        setData({
            ...data,
            business_id: business.id.toString(),
            payer_id: business.id.toString(), // ADDED: Set payer_id
            payer_type: 'business'
        });
        setSearchTerm('');
    };

    const handleSelectClearanceType = (typeId: string) => {
        const type = clearanceTypes.find(t => t.id.toString() === typeId);
        setSelectedClearanceType(type || null);
    };

    const handleUrgencyChange = (urgency: 'normal' | 'rush' | 'express') => {
        setData('urgency', urgency);
        if (selectedClearanceType) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);
            if (urgency === 'rush') {
                fee *= 1.5;
            } else if (urgency === 'express') {
                fee *= 2.0;
            }
            setData('fee_amount', fee);
        }
    };

    const calculateEstimatedProcessingDays = () => {
        if (!selectedClearanceType) return 0;
        let days = selectedClearanceType.processing_days;
        if (data.urgency === 'rush') {
            days = Math.ceil(days * 0.5);
        } else if (data.urgency === 'express') {
            days = 1;
        }
        return days;
    };

    const validateForm = () => {
        if (payerType === 'resident' && !selectedResident) {
            alert('Please select a resident');
            return false;
        }
        if (payerType === 'household' && !selectedHousehold) {
            alert('Please select a household');
            return false;
        }
        if (payerType === 'business' && !selectedBusiness) {
            alert('Please select a business');
            return false;
        }
        if (!selectedClearanceType) {
            alert('Please select a clearance type');
            return false;
        }
        if (!data.purpose) {
            alert('Please select a purpose');
            return false;
        }
        if (!data.needed_date) {
            alert('Please select a needed by date');
            return false;
        }
        return true;
    };

    // ===== FIXED: submit function with payer_id already in form data =====
    const submit = (e: React.FormEvent, proceedToPayment: boolean = false) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        // Add a flag to indicate if we should proceed to payment
        const formData = {
            ...data,
            proceed_to_payment: proceedToPayment
        };

        console.log('Submitting form data:', formData); // For debugging

        post('/admin/clearances', {
            data: formData,
            onSuccess: (page) => {
                setIsSubmitting(false);
                
                // If proceedToPayment is true and fee > 0, redirect to payment page
                if (proceedToPayment && data.fee_amount > 0 && page.props?.clearance?.id) {
                    const clearance = page.props.clearance as any;
                    
                    // Get the selected payer info based on payer type
                    let payerId = '';
                    let payerName = '';
                    let contactNumber = '';
                    let address = '';
                    let purok = '';
                    
                    if (payerType === 'resident' && selectedResident) {
                        payerId = selectedResident.id.toString();
                        payerName = selectedResident.name;
                        contactNumber = selectedResident.contact_number;
                        address = selectedResident.address;
                        purok = selectedResident.purok;
                    } else if (payerType === 'household' && selectedHousehold) {
                        payerId = selectedHousehold.id.toString();
                        payerName = selectedHousehold.head_name;
                        address = selectedHousehold.address;
                        purok = selectedHousehold.purok;
                        
                        // For households, try to get contact from head resident if available
                        const headResident = residents.find(r => r.name === selectedHousehold.head_name);
                        if (headResident) {
                            contactNumber = headResident.contact_number;
                        }
                    } else if (payerType === 'business' && selectedBusiness) {
                        payerId = selectedBusiness.id.toString();
                        payerName = selectedBusiness.business_name;
                        contactNumber = selectedBusiness.contact_number;
                        address = selectedBusiness.address;
                        purok = selectedBusiness.purok;
                    }
                    
                    // Build URL parameters for direct navigation to payment page
                    const params = new URLSearchParams({
                        // Payer info (to fetch ALL their outstanding fees)
                        payer_type: payerType,
                        payer_id: payerId,
                        payer_name: payerName,
                        
                        // Contact details (for display)
                        contact_number: contactNumber || '',
                        address: address || '',
                        purok: purok || '',
                        
                        // NEWLY CREATED CLEARANCE FEE - this will be pre-selected
                        fee_id: clearance.id.toString(),
                        fee_code: clearance.fee_code || `CLR-${clearance.id}`,
                        fee_amount: clearance.amount?.toString() || data.fee_amount.toString(),
                        fee_description: `${selectedClearanceType?.name} Clearance`,
                        
                        // Additional context for the payment page
                        from_clearance: 'true',
                        clearance_created: 'true',
                        clearance_type: selectedClearanceType?.name || 'Clearance',
                        
                        // Timestamp to prevent caching
                        _t: Date.now().toString()
                    });
                    
                    // GO DIRECTLY TO PAYMENT PAGE
                    router.visit(route('payments.create') + '?' + params.toString());
                }
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Submission errors:', errors);
            }
        });
    };

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

    const getRequirements = () => {
        if (selectedClearanceType?.requirements) {
            if (Array.isArray(selectedClearanceType.requirements)) {
                return selectedClearanceType.requirements;
            }
            return [];
        }
        return [
            'Valid ID presented',
            'Proof of residency',
            'Barangay clearance fee payment receipt',
            'Recent 2x2 ID picture',
        ];
    };

    const requirements = getRequirements();
    const safePurposeOptions = Array.isArray(purposeOptions) ? purposeOptions : [];

    // Get current selected payer display
    const getSelectedPayerDisplay = () => {
        if (payerType === 'resident' && selectedResident) {
            return {
                name: selectedResident.name,
                details: `${selectedResident.address} • ${selectedResident.contact_number}`,
                extra: selectedResident.purok ? `Purok ${selectedResident.purok}` : null
            };
        } else if (payerType === 'household' && selectedHousehold) {
            return {
                name: selectedHousehold.head_name,
                details: `${selectedHousehold.address} • Household #${selectedHousehold.household_number}`,
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
    };

    const selectedPayer = getSelectedPayerDisplay();

    // FIXED: Added Change button handler to clear payer_id
    const handleChangePayer = () => {
        setSelectedResident(null);
        setSelectedHousehold(null);
        setSelectedBusiness(null);
        setData({
            ...data,
            resident_id: '',
            household_id: '',
            business_id: '',
            payer_id: '' // Clear payer_id
        });
        setSearchTerm('');
    };

    return (
        <AppLayout
            title="Create Clearance Request"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Requests', href: '/admin/clearances' },
                { title: 'Create Request', href: '/admin/clearances/create' }
            ]}
        >
            <form onSubmit={(e) => submit(e, false)}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/clearances">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {isFromRequest ? 'Process Online Request' : 'Create Clearance Request'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {isFromRequest
                                        ? 'Review and process an online clearance request'
                                        : 'Create a clearance request for a resident'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Create Button */}
                            <Button 
                                type="submit" 
                                disabled={processing || isSubmitting || !selectedPayer || !selectedClearanceType}
                                variant="outline"
                            >
                                {processing || isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Request
                                    </>
                                )}
                            </Button>

                            {/* Create & Pay Button - Goes DIRECTLY to payment page */}
                            <Button 
                                type="button"
                                onClick={(e) => submit(e, true)}
                                disabled={processing || isSubmitting || !selectedPayer || !selectedClearanceType || data.fee_amount === 0}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processing || isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Create & Pay
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Success Message for Create & Pay */}
                    {!isFromRequest && data.fee_amount > 0 && (
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            <AlertTitle>Quick Payment Available</AlertTitle>
                            <AlertDescription>
                                Click <span className="font-medium">"Create & Pay"</span> to create this clearance and 
                                go directly to payment. You'll be able to pay this fee along with any other outstanding fees.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Zero Fee Alert */}
                    {selectedClearanceType && data.fee_amount === 0 && (
                        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
                            <Info className="h-4 w-4 text-green-600 dark:text-green-300" />
                            <AlertTitle>No Payment Required</AlertTitle>
                            <AlertDescription>
                                This clearance type has no fee. The request will be created and automatically processed.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Source Request Info Alert */}
                    {isFromRequest && sourceRequestInfo.reference_number && (
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            <AlertTitle>Processing Online Request</AlertTitle>
                            <AlertDescription className="mt-2">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Reference No:</span>
                                            <div className="text-blue-700 dark:text-blue-300">
                                                {sourceRequestInfo.reference_number}
                                            </div>
                                        </div>
                                        {sourceRequestInfo.needed_date && (
                                            <div>
                                                <span className="font-medium">Requested Needed By:</span>
                                                <div className="text-blue-700 dark:text-blue-300">
                                                    {formatDate(sourceRequestInfo.needed_date)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                                        This request was submitted online. Details have been pre-filled.
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-900/20">
                            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Please fix the following errors:</span>
                            </div>
                            <ul className="mt-2 ml-7 list-disc text-sm text-rose-700 dark:text-rose-400">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{field}: {message as string}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Request Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Applicant Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Applicant Information
                                    </CardTitle>
                                    <CardDescription>
                                        Information about the person requesting clearance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Payer Type Selection */}
                                    <div className="space-y-2">
                                        <Label>Payer Type</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={payerType === 'resident' ? 'default' : 'outline'}
                                                onClick={() => handlePayerTypeChange('resident')}
                                                className="flex-1"
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                Resident
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={payerType === 'household' ? 'default' : 'outline'}
                                                onClick={() => handlePayerTypeChange('household')}
                                                className="flex-1"
                                            >
                                                <Home className="h-4 w-4 mr-2" />
                                                Household
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={payerType === 'business' ? 'default' : 'outline'}
                                                onClick={() => handlePayerTypeChange('business')}
                                                className="flex-1"
                                            >
                                                <Building className="h-4 w-4 mr-2" />
                                                Business
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="payer-search">
                                                Search {payerType === 'resident' ? 'Resident' : payerType === 'household' ? 'Household' : 'Business'} <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="payer-search"
                                                    placeholder={`Search ${payerType} by name, address, or contact...`}
                                                    className="pl-10"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Search Results */}
                                        {!selectedPayer && payerType === 'resident' && filteredResidents.length > 0 && (
                                            <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                                                {filteredResidents.map(resident => (
                                                    <div
                                                        key={resident.id}
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border"
                                                        onClick={() => handleSelectResident(resident)}
                                                    >
                                                        <div className="font-medium">{resident.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {resident.address} • {resident.contact_number}
                                                            {resident.purok && ` • ${resident.purok}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!selectedPayer && payerType === 'household' && filteredHouseholds.length > 0 && (
                                            <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                                                {filteredHouseholds.map(household => (
                                                    <div
                                                        key={household.id}
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border"
                                                        onClick={() => handleSelectHousehold(household)}
                                                    >
                                                        <div className="font-medium">{household.head_name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {household.address} • Household #{household.household_number}
                                                            {household.purok && ` • ${household.purok}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!selectedPayer && payerType === 'business' && filteredBusinesses.length > 0 && (
                                            <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                                                {filteredBusinesses.map(business => (
                                                    <div
                                                        key={business.id}
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border"
                                                        onClick={() => handleSelectBusiness(business)}
                                                    >
                                                        <div className="font-medium">{business.business_name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Owner: {business.owner_name} • {business.contact_number}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {business.address} • {business.purok}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Selected Payer Display */}
                                        {selectedPayer && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                            {getPayerIcon(payerType)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-lg">{selectedPayer.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {selectedPayer.details}
                                                            </div>
                                                            {selectedPayer.extra && (
                                                                <div className="text-xs text-gray-400">
                                                                    {selectedPayer.extra}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleChangePayer}
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {errors.payer_id && (
                                        <p className="text-sm text-rose-600">{errors.payer_id}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Clearance Request Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Clearance Request Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clearance_type_id">
                                            Clearance Type <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.clearance_type_id}
                                            onValueChange={handleSelectClearanceType}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeClearanceTypes.map(type => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-2">
                                                                <span>{type.name}</span>
                                                                {type.is_discountable && (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                                        <Tag className="h-3 w-3 mr-1" />
                                                                        Discountable
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-gray-500 ml-4">
                                                                {formatCurrency(type.fee)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.clearance_type_id && (
                                            <p className="text-sm text-rose-600">{errors.clearance_type_id}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="urgency">
                                                Processing Urgency <span className="text-rose-500">*</span>
                                            </Label>
                                            <Select
                                                value={data.urgency}
                                                onValueChange={(value: 'normal' | 'rush' | 'express') => handleUrgencyChange(value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Normal ({selectedClearanceType?.processing_days || 3} days)</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="rush">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-amber-600" />
                                                            <span>Rush (+50% fee, 50% faster)</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="express">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-orange-600" />
                                                            <span>Express (+100% fee, 1-day processing)</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="needed_date">
                                                Needed By Date <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="needed_date"
                                                type="date"
                                                value={data.needed_date}
                                                onChange={e => setData('needed_date', e.target.value)}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.needed_date && (
                                                <p className="text-sm text-rose-600">{errors.needed_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">
                                            Purpose <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.purpose}
                                            onValueChange={value => setData('purpose', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {safePurposeOptions.length > 0 ? (
                                                    safePurposeOptions.map((purpose, index) => (
                                                        <SelectItem key={index} value={purpose}>
                                                            {purpose}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <>
                                                        <SelectItem value="Employment">Employment</SelectItem>
                                                        <SelectItem value="Travel">Travel</SelectItem>
                                                        <SelectItem value="School Requirement">School Requirement</SelectItem>
                                                        <SelectItem value="Government Transaction">Government Transaction</SelectItem>
                                                        <SelectItem value="Loan Application">Loan Application</SelectItem>
                                                        <SelectItem value="Business Requirement">Business Requirement</SelectItem>
                                                    </>
                                                )}
                                                <SelectItem value="other">Other (specify below)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {data.purpose === 'other' && (
                                            <Input
                                                placeholder="Please specify purpose..."
                                                onChange={e => setData('purpose', e.target.value)}
                                                className="mt-2"
                                            />
                                        )}
                                        {errors.purpose && (
                                            <p className="text-sm text-rose-600">{errors.purpose}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specific_purpose">Specific Purpose Details (Optional)</Label>
                                        <Textarea
                                            id="specific_purpose"
                                            value={data.specific_purpose}
                                            onChange={e => setData('specific_purpose', e.target.value)}
                                            placeholder="Provide more specific details about the purpose..."
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additional_requirements">Additional Requirements/Special Requests</Label>
                                        <Textarea
                                            id="additional_requirements"
                                            value={data.additional_requirements}
                                            onChange={e => setData('additional_requirements', e.target.value)}
                                            placeholder="Any special requirements or additional documents needed..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fee_amount">Fee Amount</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="fee_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.fee_amount}
                                                onChange={e => setData('fee_amount', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                                readOnly={!isFromRequest && selectedClearanceType !== null}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {selectedClearanceType?.requires_payment ?
                                                "Fee includes urgency surcharge if applicable" :
                                                "Free service - no payment required"}
                                        </div>
                                        {errors.fee_amount && (
                                            <p className="text-sm text-rose-600">{errors.fee_amount}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Requirements Checklist Card */}
                            {requirements.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileCheck className="h-5 w-5" />
                                            Requirements Checklist
                                        </CardTitle>
                                        <CardDescription>
                                            Required documents for this clearance type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <div className="mt-0.5">•</div>
                                                    <span>{requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 text-sm text-gray-500">
                                            <p>Note: These requirements will need to be verified during processing.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Additional Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks/Notes</Label>
                                        <Textarea
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={e => setData('remarks', e.target.value)}
                                            placeholder="Additional notes or special conditions..."
                                            rows={3}
                                        />
                                        {errors.remarks && (
                                            <p className="text-sm text-rose-600">{errors.remarks}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Preview & Summary */}
                        <div className="space-y-6">
                            {/* Request Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Payer</div>
                                            <div className="font-medium flex items-center gap-2">
                                                {getPayerIcon(payerType)}
                                                {selectedPayer ? selectedPayer.name : 'Not selected'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Clearance Type</div>
                                            <div className="font-medium">
                                                {selectedClearanceType ? selectedClearanceType.name : 'Not selected'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Urgency</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    {data.urgency === 'rush' ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-amber-600" />
                                                            <span className="capitalize">{data.urgency} (1.5x)</span>
                                                        </>
                                                    ) : data.urgency === 'express' ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-orange-600" />
                                                            <span className="capitalize">{data.urgency} (2x)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3" />
                                                            <span className="capitalize">{data.urgency}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Fee</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {formatCurrency(data.fee_amount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Processing</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {calculateEstimatedProcessingDays()} days
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Needed By</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(data.needed_date)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clearance Type Details Card */}
                            {selectedClearanceType && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Type Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                                                <div className="text-sm font-medium">{selectedClearanceType.description}</div>
                                            </div>

                                            {selectedClearanceType.is_discountable && (
                                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                                        <Shield className="h-4 w-4" />
                                                        <span className="text-sm font-medium">Discount Eligible</span>
                                                    </div>
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                        This clearance type qualifies for discounts (Senior Citizen, PWD, Solo Parent, etc.)
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Normal Processing</div>
                                                    <div className="text-sm font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {selectedClearanceType.processing_days} days
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Validity Period</div>
                                                    <div className="text-sm font-medium flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {selectedClearanceType.validity_days} days
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedClearanceType.requires_payment && (
                                                    <Badge variant="default">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        Paid Service
                                                    </Badge>
                                                )}
                                                {selectedClearanceType.requires_approval && (
                                                    <Badge variant="secondary">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Needs Approval
                                                    </Badge>
                                                )}
                                                {selectedClearanceType.is_online_only && (
                                                    <Badge variant="outline">
                                                        Online Only
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Information Card - Shows what happens with Create & Pay */}
                            {data.fee_amount > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Payment Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">With "Create & Pay"</div>
                                                <div className="text-sm font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                    <p className="text-green-700 dark:text-green-300">
                                                        You'll go directly to the payment page where you can:
                                                    </p>
                                                    <ul className="list-disc list-inside text-xs text-green-600 dark:text-green-400 mt-2 space-y-1">
                                                        <li>Pay this clearance fee (pre-selected)</li>
                                                        <li>View and add other outstanding fees</li>
                                                        <li>Pay multiple fees in one transaction</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Outstanding Fees</div>
                                                <div className="text-sm">
                                                    After creation, the payment page will show other unpaid fees for this payer:
                                                </div>
                                                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                            <span>Garbage Collection Fee</span>
                                                        </div>
                                                        <span className="font-medium">₱50.00</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                            <span>Barangay Dues</span>
                                                        </div>
                                                        <span className="font-medium">₱100.00</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        * Example only. Actual fees will be shown on payment page.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Payment Status</div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pending Payment
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        (after creation)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Form Actions Card */}
                            <Card>
                                <CardContent className="space-y-3 pt-6">
                                    <div className="text-sm text-gray-500 text-center">
                                        <p>Review all information before submitting.</p>
                                        <p className="text-xs mt-1">
                                            {selectedClearanceType?.requires_payment && data.fee_amount > 0
                                                ? "Use 'Create & Pay' to go directly to payment and add other fees."
                                                : "This is a free service. No payment required."}
                                        </p>
                                    </div>
                                    <Link href="/admin/clearances">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            disabled={processing || isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}