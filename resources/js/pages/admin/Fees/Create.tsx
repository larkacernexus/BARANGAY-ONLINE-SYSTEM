import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    Calendar,
    User,
    Home,
    Building,
    MapPin,
    Phone,
    FileText,
    Tag,
    Calculator,
    Percent,
    Clock,
    Copy,
    Check,
    X,
    Info
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface DiscountType {
    id: number | string;
    code: string;
    name: string;
    description: string | null;
    default_percentage: number;
    legal_basis: string | null;
    requirements: string[] | null;
    is_active: boolean;
    is_mandatory: boolean;
}

interface DiscountFeeType {
    id: number;
    fee_type_id: number;
    discount_type_id: number;
    percentage: number;
    is_active: boolean;
    sort_order: number | null;
    notes: string | null;
    discount_type?: DiscountType;
}

interface FeeType {
    id: number | string;
    code: string;
    name: string;
    category: string;
    base_amount: number;
    has_surcharge: boolean;
    surcharge_percentage?: number;
    has_penalty: boolean;
    penalty_fixed?: number;
    // Legacy discount fields (still support them for backward compatibility)
    has_senior_discount: boolean;
    has_pwd_discount: boolean;
    has_solo_parent_discount: boolean;
    has_indigent_discount: boolean;
    discount_percentage?: number;
    validity_days?: number;
    description?: string;
    // New discount relationship
    discount_fee_types?: DiscountFeeType[];
}

interface Resident {
    id: number | string;
    name: string;
    full_name: string;
    contact_number?: string;
    purok?: string;
    // Resident discount eligibility
    is_senior?: boolean;
    is_pwd?: boolean;
    is_solo_parent?: boolean;
    is_indigent?: boolean;
    // Array of discount type codes resident qualifies for
    eligible_discounts?: string[];
}

interface Household {
    id: number | string;
    name: string;
    contact_number?: string;
    purok?: string;
}

interface FeesCreateProps {
    feeTypes: FeeType[];
    residents: Resident[];
    households: Household[];
    preselectedResident?: Resident;
    preselectedHousehold?: Household;
    puroks: string[];
    discountTypes: DiscountType[];
    errors?: Record<string, string>;
    initialData?: Partial<FeeFormData>;
    duplicateFrom?: {
        id: number;
        fee_code: string;
        fee_type_name: string;
    };
}

interface FeeFormData {
    fee_type_id: string | number;
    payer_type: string;
    resident_id: string | number;
    household_id: string | number;
    business_name: string;
    payer_name: string;
    contact_number: string;
    address: string;
    purok: string;
    zone: string;
    billing_period: string;
    period_start: string;
    period_end: string;
    issue_date: string;
    due_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    // Array of discount type IDs (from discount_types table)
    discount_type_ids: string[];
    total_amount: number;
    purpose: string;
    property_description: string;
    business_type: string;
    area: number;
    remarks: string;
    requirements_submitted: string[];
}

// Helper function to safely parse numbers
const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '' || value === 'null') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

// Helper function to safely get string value (convert null to empty string)
const safeString = (value: any): string => {
    if (value === null || value === undefined || value === 'null') return '';
    return String(value);
};

// Helper function to format currency
const formatCurrency = (amount: any): string => {
    const num = parseNumber(amount);
    return `₱${num.toFixed(2)}`;
};

// Get active discount types for a fee type
const getActiveDiscountsForFeeType = (feeType: FeeType | null): DiscountType[] => {
    if (!feeType) return [];
    
    const activeDiscounts: DiscountType[] = [];
    
    // Check new discount_fee_types relationship
    if (feeType.discount_fee_types && feeType.discount_fee_types.length > 0) {
        feeType.discount_fee_types.forEach(dft => {
            if (dft.is_active && dft.discount_type) {
                activeDiscounts.push({
                    ...dft.discount_type,
                    // Use the percentage from the pivot table
                    default_percentage: dft.percentage
                });
            }
        });
    }
    
    // Also include legacy discounts for backward compatibility
    if (feeType.has_senior_discount) {
        activeDiscounts.push({
            id: 'senior_legacy',
            code: 'SENIOR',
            name: 'Senior Citizen',
            description: 'For senior citizens aged 60+',
            default_percentage: feeType.discount_percentage || 20,
            legal_basis: null,
            requirements: null,
            is_active: true,
            is_mandatory: false
        });
    }
    
    if (feeType.has_pwd_discount) {
        activeDiscounts.push({
            id: 'pwd_legacy',
            code: 'PWD',
            name: 'Person With Disability',
            description: 'For persons with disabilities',
            default_percentage: feeType.discount_percentage || 20,
            legal_basis: null,
            requirements: null,
            is_active: true,
            is_mandatory: false
        });
    }
    
    if (feeType.has_solo_parent_discount) {
        activeDiscounts.push({
            id: 'solo_parent_legacy',
            code: 'SOLO_PARENT',
            name: 'Solo Parent',
            description: 'For solo parents',
            default_percentage: feeType.discount_percentage || 20,
            legal_basis: null,
            requirements: null,
            is_active: true,
            is_mandatory: false
        });
    }
    
    if (feeType.has_indigent_discount) {
        activeDiscounts.push({
            id: 'indigent_legacy',
            code: 'INDIGENT',
            name: 'Indigent',
            description: 'For indigent families',
            default_percentage: feeType.discount_percentage || 20,
            legal_basis: null,
            requirements: null,
            is_active: true,
            is_mandatory: false
        });
    }
    
    return activeDiscounts;
};

// Get resident's eligible discounts based on their profile
const getResidentEligibleDiscounts = (resident: Resident | null): string[] => {
    if (!resident) return [];
    
    const eligibleDiscounts: string[] = [];
    
    // Check resident attributes
    if (resident.is_senior) eligibleDiscounts.push('SENIOR');
    if (resident.is_pwd) eligibleDiscounts.push('PWD');
    if (resident.is_solo_parent) eligibleDiscounts.push('SOLO_PARENT');
    if (resident.is_indigent) eligibleDiscounts.push('INDIGENT');
    
    // Also check the eligible_discounts array if provided
    if (resident.eligible_discounts && resident.eligible_discounts.length > 0) {
        resident.eligible_discounts.forEach(discountCode => {
            if (!eligibleDiscounts.includes(discountCode)) {
                eligibleDiscounts.push(discountCode);
            }
        });
    }
    
    return eligibleDiscounts;
};

// Calculate discounted amount based on selected discount types
const calculateDiscountedAmount = (
    baseAmount: number, 
    selectedDiscountTypeIds: string[], 
    availableDiscounts: DiscountType[]
): number => {
    if (selectedDiscountTypeIds.length === 0 || availableDiscounts.length === 0) return 0;
    
    let totalDiscountPercentage = 0;
    let discountAmount = 0;
    
    selectedDiscountTypeIds.forEach(discountTypeId => {
        const discount = availableDiscounts.find(d => 
            d.id.toString() === discountTypeId.toString()
        );
        
        if (discount) {
            totalDiscountPercentage += discount.default_percentage;
        }
    });
    
    // Cap discount at 100%
    totalDiscountPercentage = Math.min(totalDiscountPercentage, 100);
    
    // Calculate discount amount
    discountAmount = (baseAmount * totalDiscountPercentage) / 100;
    
    // Ensure discount doesn't exceed base amount
    discountAmount = Math.min(discountAmount, baseAmount);
    
    return discountAmount;
};

export default function FeesCreate({ 
    feeTypes, 
    residents, 
    households, 
    preselectedResident, 
    preselectedHousehold, 
    puroks,
    discountTypes,
    errors,
    initialData,
    duplicateFrom
}: FeesCreateProps) {
    // Default form data
    const defaultFormData: FeeFormData = {
        fee_type_id: '',
        payer_type: preselectedResident ? 'resident' : (preselectedHousehold ? 'household' : 'resident'),
        resident_id: '',
        household_id: '',
        business_name: '',
        payer_name: preselectedResident?.full_name || preselectedHousehold?.name || '',
        contact_number: preselectedResident?.contact_number || preselectedHousehold?.contact_number || '',
        address: '',
        purok: preselectedResident?.purok || preselectedHousehold?.purok || '',
        zone: '',
        billing_period: '',
        period_start: '',
        period_end: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        base_amount: 0,
        surcharge_amount: 0,
        penalty_amount: 0,
        discount_amount: 0,
        discount_type_ids: [],
        total_amount: 0,
        purpose: '',
        property_description: '',
        business_type: '',
        area: 0,
        remarks: '',
        requirements_submitted: [],
    };

    // Clean initial data
    const cleanInitialData = (data: any): Partial<FeeFormData> => {
        if (!data) return {};
        return {
            ...data,
            fee_type_id: safeString(data.fee_type_id),
            resident_id: safeString(data.resident_id),
            household_id: safeString(data.household_id),
            business_name: safeString(data.business_name),
            payer_name: safeString(data.payer_name),
            contact_number: safeString(data.contact_number),
            address: safeString(data.address),
            purok: safeString(data.purok),
            zone: safeString(data.zone),
            billing_period: safeString(data.billing_period),
            period_start: safeString(data.period_start),
            period_end: safeString(data.period_end),
            issue_date: safeString(data.issue_date),
            due_date: safeString(data.due_date),
            discount_type_ids: Array.isArray(data.discount_type_ids) 
                ? data.discount_type_ids 
                : (data.discount_type_id ? [data.discount_type_id] : []),
            purpose: safeString(data.purpose),
            property_description: safeString(data.property_description),
            business_type: safeString(data.business_type),
            remarks: safeString(data.remarks),
            base_amount: parseNumber(data.base_amount),
            surcharge_amount: parseNumber(data.surcharge_amount),
            penalty_amount: parseNumber(data.penalty_amount),
            discount_amount: parseNumber(data.discount_amount),
            total_amount: parseNumber(data.total_amount),
            area: parseNumber(data.area),
            requirements_submitted: Array.isArray(data.requirements_submitted) ? data.requirements_submitted : [],
        };
    };

    // Merge initial data with defaults
    const mergedInitialData: FeeFormData = {
        ...defaultFormData,
        ...cleanInitialData(initialData),
    };

    const { data, setData, post, processing } = useForm<FeeFormData>(mergedInitialData);

    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | null>(null);
    const [showSurcharge, setShowSurcharge] = useState(false);
    const [showPenalty, setShowPenalty] = useState(false);
    const [availableDiscounts, setAvailableDiscounts] = useState<DiscountType[]>([]);
    const [autoCalculateDiscount, setAutoCalculateDiscount] = useState(true);

    // Initialize form when component mounts
    useEffect(() => {
        if (data.fee_type_id) {
            const feeType = feeTypes.find(ft => ft.id.toString() === data.fee_type_id.toString());
            if (feeType) {
                setSelectedFeeType(feeType);
                setShowSurcharge(feeType.has_surcharge);
                setShowPenalty(feeType.has_penalty);
                updateAvailableDiscounts(feeType);
            }
        }
        
        // Set selected payer if applicable
        if (data.payer_type === 'resident' && data.resident_id) {
            const resident = residents.find(r => r.id.toString() === data.resident_id.toString());
            if (resident) {
                setSelectedPayer(resident);
                // Auto-select resident's eligible discounts
                if (autoCalculateDiscount && selectedFeeType) {
                    const residentEligibleDiscounts = getResidentEligibleDiscounts(resident);
                    const applicableDiscounts = availableDiscounts.filter(discount => 
                        residentEligibleDiscounts.includes(discount.code)
                    ).map(d => d.id.toString());
                    
                    if (applicableDiscounts.length > 0) {
                        setData('discount_type_ids', applicableDiscounts);
                    }
                }
            }
        } else if (data.payer_type === 'household' && data.household_id) {
            const household = households.find(h => h.id.toString() === data.household_id.toString());
            if (household) {
                setSelectedPayer(household);
            }
        }
    }, []);

    // Calculate total amount
    useEffect(() => {
        const base = parseNumber(data.base_amount);
        const surcharge = parseNumber(data.surcharge_amount);
        const penalty = parseNumber(data.penalty_amount);
        const discount = parseNumber(data.discount_amount);
        
        let total = base + surcharge + penalty - discount;
        total = Math.max(0, total);
        
        setData('total_amount', total);
    }, [data.base_amount, data.surcharge_amount, data.penalty_amount, data.discount_amount]);

    // Update discount amount when discount types or base amount changes
    useEffect(() => {
        if (autoCalculateDiscount && selectedFeeType && data.discount_type_ids.length > 0) {
            const calculatedDiscount = calculateDiscountedAmount(
                parseNumber(data.base_amount),
                data.discount_type_ids,
                availableDiscounts
            );
            setData('discount_amount', calculatedDiscount);
        }
    }, [data.discount_type_ids, data.base_amount, availableDiscounts, autoCalculateDiscount]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/fees');
    };

    const updateAvailableDiscounts = (feeType: FeeType) => {
        const discounts = getActiveDiscountsForFeeType(feeType);
        setAvailableDiscounts(discounts);
    };

    const handleFeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const feeTypeId = e.target.value;
        const selected = feeTypes.find(ft => ft.id.toString() === feeTypeId);
        
        setSelectedFeeType(selected || null);
        
        if (selected) {
            setData('fee_type_id', feeTypeId);
            setData('base_amount', selected.base_amount);
            setShowSurcharge(selected.has_surcharge);
            setShowPenalty(selected.has_penalty);
            updateAvailableDiscounts(selected);
            
            // Reset discounts
            setData('discount_type_ids', []);
            
            // Calculate surcharge/penalty
            if (selected.has_surcharge && selected.surcharge_percentage) {
                const surcharge = (selected.base_amount * selected.surcharge_percentage) / 100;
                setData('surcharge_amount', surcharge);
            } else {
                setData('surcharge_amount', 0);
            }
            
            if (selected.has_penalty && selected.penalty_fixed) {
                setData('penalty_amount', selected.penalty_fixed);
            } else {
                setData('penalty_amount', 0);
            }
        } else {
            setSelectedFeeType(null);
            setData('fee_type_id', '');
            setData('base_amount', 0);
            setShowSurcharge(false);
            setShowPenalty(false);
            setData('surcharge_amount', 0);
            setData('penalty_amount', 0);
            setAvailableDiscounts([]);
            setData('discount_type_ids', []);
        }
    };

    const handlePayerTypeChange = (payerType: string) => {
        setData('payer_type', payerType);
        
        // Reset related fields
        setData('resident_id', '');
        setData('household_id', '');
        setData('business_name', '');
        setSelectedPayer(null);
        
        if (payerType === 'resident' && preselectedResident) {
            setData('resident_id', preselectedResident.id);
            setData('payer_name', preselectedResident.full_name);
            setData('contact_number', preselectedResident.contact_number || '');
            setData('purok', preselectedResident.purok || '');
            
            // Auto-select resident's eligible discounts
            if (autoCalculateDiscount && selectedFeeType) {
                const residentEligibleDiscounts = getResidentEligibleDiscounts(preselectedResident);
                const applicableDiscounts = availableDiscounts.filter(discount => 
                    residentEligibleDiscounts.includes(discount.code)
                ).map(d => d.id.toString());
                
                if (applicableDiscounts.length > 0) {
                    setData('discount_type_ids', applicableDiscounts);
                }
            }
        } else if (payerType === 'household' && preselectedHousehold) {
            setData('household_id', preselectedHousehold.id);
            setData('payer_name', preselectedHousehold.name);
            setData('contact_number', preselectedHousehold.contact_number || '');
            setData('purok', preselectedHousehold.purok || '');
        } else {
            if (!initialData) {
                setData('payer_name', '');
            }
            setData('contact_number', '');
            setData('purok', '');
        }
    };

    const handleResidentSelect = (residentId: string) => {
        const resident = residents.find(r => r.id.toString() === residentId);
        if (resident) {
            setSelectedPayer(resident);
            setData('resident_id', residentId);
            setData('payer_name', resident.full_name);
            setData('contact_number', resident.contact_number || '');
            setData('purok', resident.purok || '');
            
            // Auto-select resident's eligible discounts
            if (autoCalculateDiscount && selectedFeeType) {
                const residentEligibleDiscounts = getResidentEligibleDiscounts(resident);
                const applicableDiscounts = availableDiscounts.filter(discount => 
                    residentEligibleDiscounts.includes(discount.code)
                ).map(d => d.id.toString());
                
                if (applicableDiscounts.length > 0) {
                    setData('discount_type_ids', applicableDiscounts);
                }
            }
        }
    };

    const handleHouseholdSelect = (householdId: string) => {
        const household = households.find(h => h.id.toString() === householdId);
        if (household) {
            setSelectedPayer(household);
            setData('household_id', householdId);
            setData('payer_name', household.name);
            setData('contact_number', household.contact_number || '');
            setData('purok', household.purok || '');
        }
    };

    const handleDiscountToggle = (discountTypeId: string) => {
        const currentIds = [...data.discount_type_ids];
        
        if (currentIds.includes(discountTypeId)) {
            // Remove discount
            const updatedIds = currentIds.filter(id => id !== discountTypeId);
            setData('discount_type_ids', updatedIds);
        } else {
            // Add discount if available
            if (availableDiscounts.some(d => d.id.toString() === discountTypeId)) {
                setData('discount_type_ids', [...currentIds, discountTypeId]);
            }
        }
    };

    const removeDiscount = (discountTypeId: string) => {
        const updatedIds = data.discount_type_ids.filter(id => id !== discountTypeId);
        setData('discount_type_ids', updatedIds);
    };

    const getDiscountBadgeColor = (discountCode: string) => {
        switch (discountCode) {
            case 'SENIOR': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PWD': return 'bg-green-100 text-green-800 border-green-200';
            case 'SOLO_PARENT': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'INDIGENT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleResetForm = () => {
        Object.entries(mergedInitialData).forEach(([key, value]) => {
            setData(key as keyof FeeFormData, value);
        });
        
        if (mergedInitialData.fee_type_id) {
            const feeType = feeTypes.find(ft => ft.id.toString() === mergedInitialData.fee_type_id.toString());
            if (feeType) {
                setSelectedFeeType(feeType);
                setShowSurcharge(feeType.has_surcharge);
                setShowPenalty(feeType.has_penalty);
                updateAvailableDiscounts(feeType);
            }
        } else {
            setSelectedFeeType(null);
            setShowSurcharge(false);
            setShowPenalty(false);
            setAvailableDiscounts([]);
        }
    };

    // Calculate total discount percentage
    const totalDiscountPercentage = useMemo(() => {
        if (data.discount_type_ids.length === 0) return 0;
        
        let total = 0;
        data.discount_type_ids.forEach(discountId => {
            const discount = availableDiscounts.find(d => d.id.toString() === discountId);
            if (discount) {
                total += discount.default_percentage;
            }
        });
        
        return Math.min(total, 100);
    }, [data.discount_type_ids, availableDiscounts]);

    // Check if resident is eligible for discount
    const isResidentEligibleForDiscount = (discount: DiscountType): boolean => {
        if (!selectedPayer || !('is_senior' in selectedPayer)) return true;
        
        const resident = selectedPayer as Resident;
        
        switch (discount.code) {
            case 'SENIOR': return resident.is_senior || false;
            case 'PWD': return resident.is_pwd || false;
            case 'SOLO_PARENT': return resident.is_solo_parent || false;
            case 'INDIGENT': return resident.is_indigent || false;
            default: return true;
        }
    };

    const payerTypes = [
        { value: 'resident', icon: User, label: 'Resident' },
        { value: 'business', icon: Building, label: 'Business' },
        { value: 'household', icon: Home, label: 'Household' },
        { value: 'visitor', icon: User, label: 'Visitor' },
        { value: 'other', icon: User, label: 'Other' },
    ];

    return (
        <AppLayout
            title={duplicateFrom ? "Duplicate Fee" : "Create New Fee"}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fees', href: '/fees' },
                { title: duplicateFrom ? 'Duplicate Fee' : 'Create Fee', href: '/fees/create' }
            ]}
        >
            <Head title={duplicateFrom ? "Duplicate Fee" : "Create New Fee"} />
            
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        {duplicateFrom && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <Copy className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            Duplicating from Fee <strong>#{duplicateFrom.fee_code}</strong> ({duplicateFrom.fee_type_name})
                                        </span>
                                        <Link 
                                            href={`/fees/${duplicateFrom.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Original
                                        </Link>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/fees">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {duplicateFrom ? "Duplicate Fee" : "Create New Fee"}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {duplicateFrom ? "Create a new fee based on an existing one" : "Issue a new fee, bill, or certificate"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={handleResetForm}
                                >
                                    Reset Form
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Creating...' : duplicateFrom ? 'Create Duplicate' : 'Create Fee'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Fee Type Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Fee Information
                                    </CardTitle>
                                    <CardDescription>
                                        Select the type of fee to issue
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fee_type_id">Fee Type *</Label>
                                        <select
                                            id="fee_type_id"
                                            required
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            value={safeString(data.fee_type_id)}
                                            onChange={handleFeeTypeChange}
                                        >
                                            <option value="">Select Fee Type</option>
                                            {feeTypes.map((feeType) => (
                                                <option key={feeType.id} value={feeType.id}>
                                                    {feeType.code} - {feeType.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors?.fee_type_id && (
                                            <p className="text-sm text-red-500">{errors.fee_type_id}</p>
                                        )}
                                    </div>
                                    
                                    {selectedFeeType && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium">Category:</span> {selectedFeeType.category}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Base Amount:</span> 
                                                    <span className="ml-2 font-semibold">₱{selectedFeeType.base_amount.toFixed(2)}</span>
                                                </div>
                                                {selectedFeeType.validity_days && (
                                                    <div>
                                                        <span className="font-medium">Validity:</span> {selectedFeeType.validity_days} days
                                                    </div>
                                                )}
                                                {selectedFeeType.description && (
                                                    <div className="col-span-2">
                                                        <span className="font-medium">Description:</span> {selectedFeeType.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Amount Calculation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Amount Calculation
                                    </CardTitle>
                                    <CardDescription>
                                        Configure the fee amount and adjustments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="base_amount">Base Amount *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                                                ₱
                                            </span>
                                            <Input
                                                id="base_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                className="pl-10"
                                                value={data.base_amount}
                                                onChange={(e) => setData('base_amount', parseNumber(e.target.value))}
                                            />
                                        </div>
                                        {errors?.base_amount && (
                                            <p className="text-sm text-red-500">{errors.base_amount}</p>
                                        )}
                                    </div>

                                    {showSurcharge && (
                                        <div className="space-y-2">
                                            <Label htmlFor="surcharge_amount">Surcharge Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                                                    ₱
                                                </span>
                                                <Input
                                                    id="surcharge_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="pl-10"
                                                    value={data.surcharge_amount}
                                                    onChange={(e) => setData('surcharge_amount', parseNumber(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {showPenalty && (
                                        <div className="space-y-2">
                                            <Label htmlFor="penalty_amount">Penalty Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                                                    ₱
                                                </span>
                                                <Input
                                                    id="penalty_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="pl-10"
                                                    value={data.penalty_amount}
                                                    onChange={(e) => setData('penalty_amount', parseNumber(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Discount Types Selection */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Discount Types</Label>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="auto-calculate"
                                                    checked={autoCalculateDiscount}
                                                    onCheckedChange={(checked) => setAutoCalculateDiscount(checked as boolean)}
                                                />
                                                <Label htmlFor="auto-calculate" className="text-sm font-normal cursor-pointer">
                                                    Auto-calculate
                                                </Label>
                                            </div>
                                        </div>
                                        
                                        {availableDiscounts.length > 0 ? (
                                            <div className="space-y-3">
                                                {availableDiscounts.map((discount) => (
                                                    <div key={discount.id} className="flex items-start space-x-2">
                                                        <Checkbox
                                                            id={`discount-${discount.id}`}
                                                            checked={data.discount_type_ids.includes(discount.id.toString())}
                                                            onCheckedChange={() => handleDiscountToggle(discount.id.toString())}
                                                            disabled={data.payer_type === 'resident' && !isResidentEligibleForDiscount(discount)}
                                                        />
                                                        <div className="flex-1">
                                                            <Label 
                                                                htmlFor={`discount-${discount.id}`}
                                                                className={`text-sm font-normal cursor-pointer ${
                                                                    data.payer_type === 'resident' && !isResidentEligibleForDiscount(discount) 
                                                                        ? 'text-gray-400' 
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span>
                                                                        {discount.name} ({discount.default_percentage}%)
                                                                    </span>
                                                                    {data.payer_type === 'resident' && !isResidentEligibleForDiscount(discount) && (
                                                                        <Badge variant="outline" className="text-xs text-gray-500">
                                                                            Not eligible
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {discount.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {discount.description}
                                                                    </p>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No discounts available for selected fee type</p>
                                        )}
                                        
                                        {/* Selected Discounts */}
                                        {data.discount_type_ids.length > 0 && (
                                            <div className="pt-2">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {data.discount_type_ids.map((discountId) => {
                                                        const discount = availableDiscounts.find(d => d.id.toString() === discountId);
                                                        if (!discount) return null;
                                                        
                                                        return (
                                                            <Badge
                                                                key={discount.id}
                                                                variant="outline"
                                                                className={`flex items-center gap-1 ${getDiscountBadgeColor(discount.code)}`}
                                                            >
                                                                {discount.name} ({discount.default_percentage}%)
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDiscount(discount.id.toString())}
                                                                    className="ml-1 hover:opacity-70"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                                {totalDiscountPercentage > 0 && (
                                                    <p className="text-sm text-green-600">
                                                        Total discount: {totalDiscountPercentage}% ({formatCurrency(data.discount_amount)})
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discount_amount">Discount Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                                                ₱
                                            </span>
                                            <Input
                                                id="discount_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={data.base_amount}
                                                className="pl-10"
                                                value={data.discount_amount}
                                                onChange={(e) => {
                                                    setData('discount_amount', parseNumber(e.target.value));
                                                    setAutoCalculateDiscount(false);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(data.base_amount)}</span>
                                            </div>
                                            {data.surcharge_amount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-gray-600">
                                                    <span>Surcharge:</span>
                                                    <span className="text-orange-600">+{formatCurrency(data.surcharge_amount)}</span>
                                                </div>
                                            )}
                                            {data.penalty_amount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-gray-600">
                                                    <span>Penalty:</span>
                                                    <span className="text-red-600">+{formatCurrency(data.penalty_amount)}</span>
                                                </div>
                                            )}
                                            {data.discount_amount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-gray-600">
                                                    <span>Discount:</span>
                                                    <span className="text-green-600">-{formatCurrency(data.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatCurrency(data.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Dates
                                    </CardTitle>
                                    <CardDescription>
                                        Set issue and due dates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="issue_date">Issue Date *</Label>
                                            <Input
                                                id="issue_date"
                                                type="date"
                                                required
                                                value={safeString(data.issue_date)}
                                                onChange={(e) => setData('issue_date', e.target.value)}
                                            />
                                            {errors?.issue_date && (
                                                <p className="text-sm text-red-500">{errors.issue_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="due_date">Due Date *</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                required
                                                value={safeString(data.due_date)}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                min={data.issue_date}
                                            />
                                            {errors?.due_date && (
                                                <p className="text-sm text-red-500">{errors.due_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Payer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Payer Information
                                    </CardTitle>
                                    <CardDescription>
                                        Select or enter payer details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Payer Type *</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                                {payerTypes.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => handlePayerTypeChange(type.value)}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-md border transition-colors ${
                                                            data.payer_type === type.value
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <type.icon className="h-5 w-5 mb-1" />
                                                        <span className="text-xs font-medium">{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors?.payer_type && (
                                                <p className="text-sm text-red-500">{errors.payer_type}</p>
                                            )}
                                        </div>

                                        {/* Resident/Household Selection */}
                                        {(data.payer_type === 'resident' || data.payer_type === 'household') && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`${data.payer_type}_id`}>
                                                    Select {data.payer_type === 'resident' ? 'Resident' : 'Household'} *
                                                </Label>
                                                <select
                                                    id={`${data.payer_type}_id`}
                                                    required={data.payer_type === 'resident' || data.payer_type === 'household'}
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    value={safeString(data.payer_type === 'resident' ? data.resident_id : data.household_id)}
                                                    onChange={(e) => {
                                                        if (data.payer_type === 'resident') {
                                                            handleResidentSelect(e.target.value);
                                                        } else if (data.payer_type === 'household') {
                                                            handleHouseholdSelect(e.target.value);
                                                        }
                                                    }}
                                                >
                                                    <option value="">
                                                        Select {data.payer_type === 'resident' ? 'Resident' : 'Household'}
                                                    </option>
                                                    {data.payer_type === 'resident' 
                                                        ? residents.map((resident) => (
                                                            <option key={resident.id} value={resident.id}>
                                                                {resident.full_name} {resident.purok ? `(Purok ${resident.purok})` : ''}
                                                            </option>
                                                        ))
                                                        : households.map((household) => (
                                                            <option key={household.id} value={household.id}>
                                                                {household.name} {household.purok ? `(Purok ${household.purok})` : ''}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}

                                        {/* Business Name */}
                                        {data.payer_type === 'business' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="business_name">Business Name *</Label>
                                                <Input
                                                    id="business_name"
                                                    required
                                                    value={safeString(data.business_name)}
                                                    onChange={(e) => {
                                                        setData('business_name', e.target.value);
                                                        setData('payer_name', e.target.value);
                                                    }}
                                                    placeholder="Enter business name"
                                                />
                                            </div>
                                        )}

                                        {/* Manual Payer Name */}
                                        {(data.payer_type === 'visitor' || data.payer_type === 'other') && (
                                            <div className="space-y-2">
                                                <Label htmlFor="payer_name">Payer Name *</Label>
                                                <Input
                                                    id="payer_name"
                                                    required
                                                    value={safeString(data.payer_name)}
                                                    onChange={(e) => setData('payer_name', e.target.value)}
                                                    placeholder="Enter payer's full name"
                                                />
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_number" className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    Contact Number
                                                </Label>
                                                <Input
                                                    id="contact_number"
                                                    value={safeString(data.contact_number)}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                    placeholder="09XXXXXXXXX"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="purok" className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    Purok
                                                </Label>
                                                <select
                                                    id="purok"
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    value={safeString(data.purok)}
                                                    onChange={(e) => setData('purok', e.target.value)}
                                                >
                                                    <option value="">Select Purok</option>
                                                    {puroks.map((purok) => (
                                                        <option key={purok} value={purok}>
                                                            {purok}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                id="address"
                                                rows={2}
                                                value={safeString(data.address)}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Complete address"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                    <CardDescription>
                                        Provide additional details and remarks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose / Description</Label>
                                        <Textarea
                                            id="purpose"
                                            rows={3}
                                            value={safeString(data.purpose)}
                                            onChange={(e) => setData('purpose', e.target.value)}
                                            placeholder="Describe the purpose of this fee or provide additional details..."
                                        />
                                    </div>

                                    {/* For Business Fees */}
                                    {data.payer_type === 'business' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="business_type">Business Type</Label>
                                                <Input
                                                    id="business_type"
                                                    value={safeString(data.business_type)}
                                                    onChange={(e) => setData('business_type', e.target.value)}
                                                    placeholder="e.g., Retail, Restaurant, Service"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="area">Area (sq.m.)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                        m²
                                                    </span>
                                                    <Input
                                                        id="area"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="pl-10"
                                                        value={data.area}
                                                        onChange={(e) => setData('area', parseNumber(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="property_description">
                                            Property Description (for property-related fees)
                                        </Label>
                                        <Textarea
                                            id="property_description"
                                            rows={2}
                                            value={safeString(data.property_description)}
                                            onChange={(e) => setData('property_description', e.target.value)}
                                            placeholder="Describe the property, lot, or structure..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks / Notes</Label>
                                        <Textarea
                                            id="remarks"
                                            rows={2}
                                            value={safeString(data.remarks)}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            placeholder="Any additional remarks or instructions..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Period */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing Period (Optional)</CardTitle>
                                    <CardDescription>
                                        Set the billing period for recurring fees
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="billing_period">Billing Period Description</Label>
                                            <Input
                                                id="billing_period"
                                                value={safeString(data.billing_period)}
                                                onChange={(e) => setData('billing_period', e.target.value)}
                                                placeholder="e.g., January 2024, Q1 2024"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="period_start">Period Start</Label>
                                            <Input
                                                id="period_start"
                                                type="date"
                                                value={safeString(data.period_start)}
                                                onChange={(e) => setData('period_start', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="period_end">Period End</Label>
                                            <Input
                                                id="period_end"
                                                type="date"
                                                value={safeString(data.period_end)}
                                                onChange={(e) => setData('period_end', e.target.value)}
                                                min={data.period_start}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}