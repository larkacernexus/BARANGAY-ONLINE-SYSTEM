// resources/js/components/admin/payment/PaymentDetailsStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
// prettier-ignore
import { CreditCard, Calculator, Receipt, Building, FileText, AlertCircle, Smartphone, Banknote, Home, User, Users, Phone, MapPin, FileDigit, Lock, Check, FileBadge, RefreshCw, UserCircle, MapPinHouse, Hash, IdCard, Shield, Award, Briefcase, UsersRound, TrendingUp, Globe, CheckCircle2, XCircle, AlertTriangle, DollarSign, Wallet, Percent, Calendar } from 'lucide-react';

// Import ResidentAvatar component
import { ResidentAvatar } from './ResidentAvatar';

// Import types from central types file
import {
    PaymentFormData,
    PaymentItem,
    DiscountRule,
    FeeType
} from '@/types/admin/payments/payments';

// Import utility functions
import { generateORNumber } from '@/components/admin/payment/paymentCreate/utils';

// ========== LOCAL HELPER FUNCTIONS ==========
function formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function formatPercentage(percent: number | undefined | null): string {
    if (percent === undefined || percent === null || isNaN(percent)) return '0%';
    return `${percent.toFixed(1)}%`;
}

// Helper function to get photo URL
const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    if (photoPath.startsWith('/storage')) return photoPath;
    return `/storage/${photoPath}`;
};

// ========== INTERFACE DEFINITIONS ==========
interface ClearanceType {
    id: string | number;
    code: string;
    name: string;
    description?: string;
    fee: number | string;
    formatted_fee?: string;
    processing_days?: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    is_discountable?: boolean;
    [key: string]: any;
}

interface DiscountEligibility {
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id?: boolean;
    privilege_code?: string;
}

interface HouseholdInfo {
    id?: string | number;
    household_number?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    full_address?: string;
    purok?: string;
    purok_id?: string | number;
    member_count?: number;
    head_of_household?: {
        id: string | number;
        name: string;
        contact_number?: string;
        is_current_resident?: boolean;
    };
    head_name?: string;
    head_id?: string | number;
    resident_role?: string;
    is_head?: boolean;
    has_user_account?: boolean;
    members?: any[];
}

interface BusinessInfo {
    id: string | number;
    business_name: string;
    owner_name: string;
    owner_id?: string | number;
    contact_number?: string;
    email?: string;
    address: string;
    purok?: string;
    purok_id?: string | number;
    business_type?: string;
    business_type_label?: string;
    status?: string;
    permit_expiry_date?: string;
    is_permit_valid?: boolean;
    dti_sec_number?: string;
    tin_number?: string;
    mayors_permit_number?: string;
    employee_count?: number;
    capital_amount?: number;
    monthly_gross?: number;
    formatted_capital?: string;
    formatted_monthly_gross?: string;
}

interface ResidentDetails {
    id: number | string;
    name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    birthdate?: string;
    age?: number;
    gender?: string;
    civil_status?: string;
    occupation?: string;
    is_voter?: boolean;
    household_id?: string | number;
    household_number?: string;
    purok?: string;
    purok_id?: string | number;
    is_household_head?: boolean;
    household_info?: HouseholdInfo | null;
    privileges?: any[];
    privileges_count?: number;
    has_privileges?: boolean;
    discount_eligibility_list?: DiscountEligibility[];
    has_special_classification?: boolean;
    photo_path?: string | null;
    photo_url?: string | null;
    [key: string]: any;
}

interface PaymentDetailsStepProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    selectedDiscountCode: string;
    discountTypes: Record<string, string>;
    discountRules?: DiscountRule[];
    discountCodeToIdMap?: Record<string, number>;
    handleDiscountCodeChange: (code: string) => void;
    processing: boolean;
    handlePurposeChange: (value: string) => void;
    handlePeriodCoveredChange: (value: string) => void;
    userModifiedPurpose: boolean;
    setUserModifiedPurpose: (value: boolean) => void;
    generatePurpose: () => string;
    selectedResident?: ResidentDetails | null;
    selectedHousehold?: any;
    selectedBusiness?: BusinessInfo | null;
    payerSource?: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees' | 'other';
    feeTypes?: FeeType[];
    allPrivileges?: any[];
}

// ========== HELPER FUNCTIONS FOR PRIVILEGES ==========
function getPrivilegeIcon(code: string): string {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'S': '👴',
        'P': '♿',
        'I': '🏠',
        'F': '🌾',
        'O': '✈️',
        '4': '📦',
        'U': '💼',
        'A': '🎫',
        'B': '🎫',
        'C': '🎫',
        'D': '🎫',
        'E': '🎫',
    };
    
    return iconMap[firstChar] || '🎫';
}

function getPrivilegeColor(code: string): string {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
}

function getPrivilegeBadges(resident: any): Array<{ code: string; name: string; icon: string; color: string; id_number?: string }> {
    if (!resident || !resident.privileges) return [];
    
    return resident.privileges
        .filter((p: any) => p.status === 'active' || p.status === 'expiring_soon')
        .map((p: any) => ({
            code: p.code,
            name: p.name || p.code,
            icon: getPrivilegeIcon(p.code),
            color: getPrivilegeColor(p.code),
            id_number: p.id_number
        }));
}

export function PaymentDetailsStep({
    data,
    setData,
    setStep,
    paymentItems,
    selectedDiscountCode,
    discountTypes,
    discountRules = [],
    discountCodeToIdMap = {},
    handleDiscountCodeChange,
    processing,
    handlePurposeChange,
    handlePeriodCoveredChange,
    userModifiedPurpose,
    setUserModifiedPurpose,
    generatePurpose,
    selectedResident = null,
    selectedHousehold = null,
    selectedBusiness = null,
    payerSource = 'residents',
    feeTypes = [],
    allPrivileges = []
}: PaymentDetailsStepProps) {
    
    // ========== STATE DECLARATIONS ==========
    const [purposeError, setPurposeError] = useState<string>('');
    const [autoGeneratedOR, setAutoGeneratedOR] = useState<boolean>(false);
    const [amountTendered, setAmountTendered] = useState<string>(
        data.amount_paid ? data.amount_paid.toString() : ''
    );
    
    // ========== CORRECTED CALCULATIONS ==========
    const originalTotal = (data.subtotal || 0) + (data.surcharge || 0) + (data.penalty || 0);
    const discountAmount = data.discount || 0;
    const amountDue = originalTotal - discountAmount;
    const amountPaid = data.amount_paid || 0;
    
    const isExactAmount = Math.abs(amountPaid - amountDue) < 0.01;
    const isOverpaid = amountPaid > amountDue + 0.01;
    const isUnderpaid = amountPaid < amountDue - 0.01 && amountPaid > 0;
    const isUnpaid = amountPaid <= 0;
    
    const balance = Math.max(0, amountDue - amountPaid);
    const change = Math.max(0, amountPaid - amountDue);
    
    const paymentStatus = isUnpaid ? 'unpaid' : 
                         (isUnderpaid ? 'partial' : 
                         (isExactAmount ? 'paid' : 
                         (isOverpaid ? 'overpaid' : 'unknown')));
    
    // ========== GET CLEARANCE AND FEE ITEMS ==========
    const clearanceItems = useMemo(() => {
        return paymentItems.filter(item => 
            item.metadata?.is_clearance_fee === true || item.category === 'clearance'
        );
    }, [paymentItems]);

    const feeItems = useMemo(() => {
        return paymentItems.filter(item => 
            !(item.metadata?.is_clearance_fee === true || item.category === 'clearance')
        );
    }, [paymentItems]);

    const isClearanceFeePayment = clearanceItems.length > 0;
    const isFeePayment = payerSource === 'fees' || feeItems.length > 0;
    const isBusinessPayment = data.payer_type === 'business' || payerSource === 'businesses';

    const selectedDiscountRule = discountRules.find(rule => rule.code === selectedDiscountCode);

    // ========== BUILD RESIDENT FOR AVATAR FROM DATA ==========
    const residentForAvatar = useMemo(() => {
        console.log('🔍 PaymentDetailsStep - Building residentForAvatar...');
        console.log('📊 data.payer_type:', data.payer_type);
        console.log('📊 data.photo_path:', data.photo_path);
        console.log('📊 data.photo_url:', data.photo_url);
        console.log('📊 selectedResident:', selectedResident);
        
        // Only for resident payer type
        if (data.payer_type !== 'resident') {
            console.log('❌ Not a resident payer type, skipping avatar');
            return null;
        }
        
        // Get photo from data first (passed from parent)
        let photoPath = (data as any).photo_path;
        let photoUrl = (data as any).photo_url;
        let residentName = data.payer_name;
        let residentId = Number(data.payer_id);
        
        // If no photo in data, try selectedResident
        if (!photoPath && selectedResident) {
            console.log('📸 Found photo in selectedResident');
            photoPath = selectedResident.photo_path;
            photoUrl = selectedResident.photo_url;
            residentName = selectedResident.name || residentName;
            residentId = Number(selectedResident.id) || residentId;
        }
        
        // Build the full image URL
        let fullPhotoUrl = photoUrl;
        if (photoPath && !fullPhotoUrl) {
            if (photoPath.startsWith('http')) {
                fullPhotoUrl = photoPath;
            } else if (photoPath.startsWith('/storage')) {
                fullPhotoUrl = photoPath;
            } else {
                fullPhotoUrl = `/storage/${photoPath}`;
            }
        }
        
        const residentData = {
            id: residentId,
            name: residentName,
            photo_path: photoPath,
            photo_url: fullPhotoUrl
        };
        
        console.log('🎯 Final residentForAvatar in PaymentDetailsStep:', residentData);
        
        return residentData;
    }, [data.payer_type, data.payer_id, data.payer_name, (data as any).photo_path, (data as any).photo_url, selectedResident]);

    // Get display values with fallbacks
    const displayPayerName = data.payer_name || 
                             (selectedResident?.name) || 
                             (selectedHousehold?.head_name) || 
                             (selectedBusiness?.business_name) || 
                             'Unknown';
    
    const displayContactNumber = data.contact_number || 
                                 (selectedResident?.contact_number) || 
                                 (selectedHousehold?.contact_number) || 
                                 (selectedBusiness?.contact_number) || 
                                 '';
    
    const displayAddress = data.address || 
                          (selectedResident?.address) || 
                          (selectedHousehold?.address) || 
                          (selectedBusiness?.address) || 
                          '';
    
    const displayHouseholdNumber = data.household_number || 
                                   (selectedResident?.household_number) || 
                                   (selectedHousehold?.household_number) || 
                                   '';
    
    const displayPurok = data.purok || 
                        (selectedResident?.purok) || 
                        (selectedHousehold?.purok) || 
                        (selectedBusiness?.purok) || 
                        '';

    // ========== RESIDENT PRIVILEGES ==========
    const residentPrivileges = useMemo(() => {
        if (!selectedResident) return [];
        return getPrivilegeBadges(selectedResident);
    }, [selectedResident]);

    // ========== SYNC AMOUNT TENDERED WITH DATA ==========
    useEffect(() => {
        if (data.amount_paid !== undefined && data.amount_paid !== null) {
            const amountValue = typeof data.amount_paid === 'number' 
                ? data.amount_paid.toString() 
                : String(data.amount_paid);
            
            if (amountTendered !== amountValue) {
                setAmountTendered(amountValue);
            }
        }
    }, [data.amount_paid]);

    // ========== INITIALIZATION EFFECTS ==========
    useEffect(() => {
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
            setAutoGeneratedOR(true);
        }
    }, []);

    useEffect(() => {
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
        }
    }, []);

    // ✅ AUTO-UPDATE AMOUNT PAID WHEN DISCOUNT CHANGES
    // This eliminates the need to click "Pay Exact Amount" after applying a discount
    useEffect(() => {
        // Automatically set amount_paid to match amount_due
        // This happens whenever discount is applied or removed
        const dueValue = amountDue.toFixed(2);
        setAmountTendered(dueValue);
        setData((prev: PaymentFormData) => ({ ...prev, amount_paid: amountDue }));
    }, [amountDue]);

    // ========== HANDLER FUNCTIONS ==========
    const handlePaymentMethodChange = (methodId: string) => {
        setData((prev: PaymentFormData) => ({ 
            ...prev, 
            payment_method: methodId,
            reference_number: '' 
        }));
    };

    const handleAmountTenderedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmountTendered(value);
        
        const numericValue = parseFloat(value) || 0;
        setData((prev: PaymentFormData) => ({ ...prev, amount_paid: numericValue }));
    };

    const handleQuickAmount = (amount: number) => {
        const newAmount = amount.toFixed(2);
        setAmountTendered(newAmount);
        setData((prev: PaymentFormData) => ({ ...prev, amount_paid: amount }));
    };

    const handleExactAmount = () => {
        handleQuickAmount(amountDue);
    };

    const handleRegenerateOR = () => {
        const newOR = generateORNumber();
        setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
        setAutoGeneratedOR(true);
    };

    const handleDiscountSelect = (code: string) => {
        if (code === 'no_discount') {
            handleDiscountCodeChange('');
            return;
        }
        handleDiscountCodeChange(code);
    };

    const validateForm = () => {
        let isValid = true;
        
        setPurposeError('');
        
        if (!data.purpose || data.purpose.trim() === '') {
            setPurposeError('Purpose of payment is required');
            isValid = false;
        }
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
        }
        
        if (originalTotal <= 0) {
            setPurposeError('Total amount must be greater than 0');
            isValid = false;
        }

        if (selectedDiscountRule?.requires_verification && !data.verification_id_number) {
            alert('This discount requires verification. Please provide ID number.');
            isValid = false;
        }

        if (amountPaid < 0) {
            alert('Amount paid cannot be negative.');
            isValid = false;
        }
        
        return isValid;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
        }
        
        if (!isExactAmount && amountPaid > 0) {
            const message = isOverpaid 
                ? `You are overpaying by ${formatCurrency(change)}. Change of ${formatCurrency(change)} will be given. Continue?`
                : `You are underpaying by ${formatCurrency(balance)}. Remaining balance of ${formatCurrency(balance)} will be recorded as partial payment. Continue?`;
            
            if (!confirm(message)) {
                return;
            }
        }
        
        if (validateForm()) {
            const form = document.getElementById('paymentForm') as HTMLFormElement;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    const getPayerTypeIcon = () => {
        switch (data.payer_type) {
            case 'resident': return User;
            case 'household': return Users;
            case 'business': return Building;
            default: return UserCircle;
        }
    };

    const getPayerTypeLabel = () => {
        switch (data.payer_type) {
            case 'resident': return 'Resident';
            case 'household': return 'Household';
            case 'business': return 'Business';
            default: return 'Other';
        }
    };

    const PayerIcon = getPayerTypeIcon();

    const getPaymentTypeEmphasis = () => {
        if (isBusinessPayment) {
            return {
                badge: 'Business Payment',
                color: 'bg-orange-600',
                icon: <Building className="h-3 w-3 mr-1" />,
                description: 'Business Fees'
            };
        }
        if (isClearanceFeePayment && isFeePayment) {
            return {
                badge: 'Combined Payment',
                color: 'bg-gradient-to-r from-purple-600 to-blue-600',
                icon: <Receipt className="h-3 w-3 mr-1" />,
                description: `Clearance (${clearanceItems.length}) + Fees (${feeItems.length})`
            };
        }
        if (isClearanceFeePayment) {
            return {
                badge: 'Clearance Payment',
                color: 'bg-purple-600',
                icon: <FileBadge className="h-3 w-3 mr-1" />,
                description: `${clearanceItems.length} Clearance Item${clearanceItems.length !== 1 ? 's' : ''}`
            };
        }
        if (isFeePayment) {
            return {
                badge: 'Fee Payment',
                color: 'bg-blue-600',
                icon: <Receipt className="h-3 w-3 mr-1" />,
                description: `${feeItems.length} Fee Item${feeItems.length !== 1 ? 's' : ''}`
            };
        }
        return null;
    };

    const paymentEmphasis = getPaymentTypeEmphasis();

    const getPaymentStatusBadge = () => {
        switch (paymentStatus) {
            case 'paid':
                return {
                    label: 'PAID',
                    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
                    icon: <CheckCircle2 className="h-3 w-3 mr-1" />
                };
            case 'partial':
                return {
                    label: 'PARTIAL',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
                    icon: <AlertTriangle className="h-3 w-3 mr-1" />
                };
            case 'unpaid':
                return {
                    label: 'UNPAID',
                    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
                    icon: <XCircle className="h-3 w-3 mr-1" />
                };
            case 'overpaid':
                return {
                    label: 'OVERPAID',
                    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                    icon: <TrendingUp className="h-3 w-3 mr-1" />
                };
            default:
                return {
                    label: 'UNPAID',
                    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
                    icon: <XCircle className="h-3 w-3 mr-1" />
                };
        }
    };

    const statusBadge = getPaymentStatusBadge();

    // ========== RENDER FUNCTIONS ==========
    const renderResidentPrivileges = () => {
        if (!selectedResident || residentPrivileges.length === 0) return null;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award className="h-3 w-3" />
                    Privileges
                </div>
                <div className="flex flex-wrap gap-2">
                    {residentPrivileges.map((item, index) => (
                        <Badge 
                            key={index} 
                            variant="outline" 
                            className={`${item.color} flex items-center gap-1 px-2 py-1 cursor-help`}
                            title={item.id_number ? `ID: ${item.id_number}` : item.name}
                        >
                            <span>{item.icon}</span>
                            <span className="text-xs">{item.name}</span>
                        </Badge>
                    ))}
                </div>
            </div>
        );
    };

    const renderHouseholdInfo = () => {
        if (!selectedResident?.household_info) return null;

        const household = selectedResident.household_info;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Home className="h-3 w-3" />
                    Household Information
                </div>
                <div className="space-y-2">
                    {household.household_number && (
                        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                            <Hash className="h-3 w-3 mr-1" />
                            {household.household_number}
                        </Badge>
                    )}
                    {household.purok && (
                        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                            <MapPinHouse className="h-3 w-3 mr-1" />
                            {household.purok}
                        </Badge>
                    )}

                    {household.head_of_household && (
                        <div className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Head:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{household.head_of_household.name}</span>
                        </div>
                    )}

                    {household.member_count && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <UsersRound className="h-3 w-3" />
                            <span>{household.member_count} family members</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBusinessInfo = () => {
        if (!selectedBusiness) return null;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="h-3 w-3" />
                    Business Details
                </div>
                <div className="space-y-2">
                    {selectedBusiness.business_type && (
                        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                            <Building className="h-3 w-3 mr-1" />
                            {selectedBusiness.business_type_label || selectedBusiness.business_type}
                        </Badge>
                    )}
                    
                    {selectedBusiness.owner_name && (
                        <div className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{selectedBusiness.owner_name}</span>
                        </div>
                    )}

                    {selectedBusiness.permit_expiry_date && (
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Permit Expiry:</span>
                            <span className={`font-medium ${selectedBusiness.is_permit_valid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {new Date(selectedBusiness.permit_expiry_date).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payment Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Payment Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 dark:bg-blue-900/30 rounded-lg">
                                    <Receipt className="h-5 w-5 text-primary dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold dark:text-gray-100">
                                        Payment Details
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Complete the payment information
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {paymentEmphasis && (
                                    <Badge className={`${paymentEmphasis.color} text-white border-0`}>
                                        {paymentEmphasis.icon}
                                        {paymentEmphasis.badge}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Step 3 of 3</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Receipt Details */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2 dark:text-gray-200">
                                <FileDigit className="h-4 w-4" />
                                Receipt Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs dark:text-gray-300">OR Number</Label>
                                    <div className="relative">
                                        <Input
                                            value={data.or_number || ''}
                                            onChange={(e) => {
                                                setData((prev: PaymentFormData) => ({ ...prev, or_number: e.target.value }));
                                                setAutoGeneratedOR(false);
                                            }}
                                            className="font-mono text-sm pr-20 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            placeholder="BAR-YYYYMMDD-XXX"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-7 text-xs dark:text-gray-400 dark:hover:text-white"
                                            onClick={handleRegenerateOR}
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            New
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs dark:text-gray-300">Payment Date</Label>
                                    <Input
                                        type="date"
                                        value={data.payment_date || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            setData((prev: PaymentFormData) => ({ ...prev, payment_date: e.target.value }));
                                        }}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs dark:text-gray-300">Period Covered</Label>
                                <Input
                                    placeholder="e.g., January 2024, Q1 2024"
                                    value={data.period_covered || ''}
                                    onChange={(e) => handlePeriodCoveredChange(e.target.value)}
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Amount Paid Section */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2 dark:text-gray-200">
                                <Wallet className="h-4 w-4" />
                                Payment Amount
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-1 text-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="dark:text-gray-300">{formatCurrency(data.subtotal || 0)}</span>
                                    </div>
                                    {data.surcharge > 0 && (
                                        <div className="flex justify-between text-amber-700 dark:text-amber-400">
                                            <span>Surcharge:</span>
                                            <span>+{formatCurrency(data.surcharge)}</span>
                                        </div>
                                    )}
                                    {data.penalty > 0 && (
                                        <div className="flex justify-between text-red-700 dark:text-red-400">
                                            <span>Penalty:</span>
                                            <span>+{formatCurrency(data.penalty)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700 mt-1">
                                        <span className="dark:text-gray-300">Original Amount:</span>
                                        <span className="dark:text-gray-200">{formatCurrency(originalTotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-700 dark:text-green-400">
                                            <div className="flex items-center gap-1">
                                                <span>Discount:</span>
                                                {selectedDiscountRule && (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                        {selectedDiscountRule.percentage ? formatPercentage(selectedDiscountRule.percentage) : 'Fixed'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-primary dark:text-blue-400 pt-1 border-t border-gray-200 dark:border-gray-700 mt-1">
                                        <span>Amount Due:</span>
                                        <span>{formatCurrency(amountDue)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium dark:text-gray-300">Amount Tendered (Cash Received)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₱</span>
                                        <Input
                                            type="text"
                                            value={amountTendered}
                                            onChange={handleAmountTenderedChange}
                                            className={`pl-8 text-lg font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${
                                                !isExactAmount && amountPaid > 0 ? 'border-yellow-500 dark:border-yellow-600' : ''
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={handleExactAmount}
                                        className="text-xs bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                                    >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Pay Exact Amount ({formatCurrency(amountDue)})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAmount(Math.ceil(amountDue / 100) * 100)}
                                        className="text-xs dark:border-gray-600 dark:text-gray-300"
                                    >
                                        Round Up
                                    </Button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Amount Due:</span>
                                        <span className="font-medium dark:text-gray-300">{formatCurrency(amountDue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Amount Tendered:</span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(amountPaid)}</span>
                                    </div>
                                    
                                    <Separator className="dark:bg-gray-700" />
                                    
                                    {isOverpaid ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Change Due:</span>
                                            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(change)}</span>
                                        </div>
                                    ) : isUnderpaid ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Remaining Balance:</span>
                                            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(balance)}</span>
                                        </div>
                                    ) : isExactAmount ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-400">Payment Status:</span>
                                            <span className="text-lg font-bold text-green-700 dark:text-green-400">PAID</span>
                                        </div>
                                    ) : null}

                                    <div className="mt-2 flex justify-end">
                                        <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                                            {statusBadge.icon}
                                            {statusBadge.label}
                                        </Badge>
                                    </div>
                                </div>

                                {!isExactAmount && amountPaid > 0 && (
                                    <div className={`p-3 rounded-md ${
                                        isOverpaid 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                    }`}>
                                        <p className={`text-sm flex items-center gap-2 ${
                                            isOverpaid ? 'text-blue-800 dark:text-blue-400' : 'text-yellow-800 dark:text-yellow-400'
                                        }`}>
                                            {isOverpaid ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4" />
                                                    Overpayment of {formatCurrency(change)}. Change will be given.
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Underpayment of {formatCurrency(balance)}. Partial payment will be recorded.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Purpose of Payment */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2 dark:text-gray-200">
                                    <FileText className="h-4 w-4" />
                                    Purpose of Payment
                                </h3>
                                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">Required</Badge>
                            </div>
                            
                            <Textarea
                                placeholder="Enter the purpose of payment..."
                                value={data.purpose || ''}
                                onChange={(e) => handlePurposeChange(e.target.value)}
                                className={`min-h-[80px] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${purposeError ? 'border-red-300 dark:border-red-700' : ''}`}
                            />
                            
                            {purposeError && (
                                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {purposeError}
                                </p>
                            )}

                            {paymentItems.length > 0 && !userModifiedPurpose && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed text-xs dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => {
                                        const purpose = generatePurpose();
                                        handlePurposeChange(purpose);
                                        setUserModifiedPurpose(false);
                                    }}
                                >
                                    <Check className="h-3 w-3 mr-2" />
                                    Use "{paymentItems.map(item => item.fee_name).join(', ')}"
                                </Button>
                            )}
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2 dark:text-gray-200">
                                <CreditCard className="h-4 w-4" />
                                Payment Method
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'cash', icon: Banknote, name: 'Cash', desc: 'Cash payment', color: 'text-green-600 dark:text-green-400' },
                                    { id: 'gcash', icon: Smartphone, name: 'GCash', desc: 'Mobile payment', color: 'text-blue-600 dark:text-blue-400' },
                                    { id: 'maya', icon: Smartphone, name: 'Maya', desc: 'Mobile payment', color: 'text-purple-600 dark:text-purple-400' },
                                    { id: 'bank', icon: Building, name: 'Bank Transfer', desc: 'Bank transfer', color: 'text-orange-600 dark:text-orange-400' },
                                    { id: 'check', icon: FileText, name: 'Check', desc: 'Check payment', color: 'text-indigo-600 dark:text-indigo-400' },
                                    { id: 'online', icon: Globe, name: 'Online', desc: 'Online payment', color: 'text-cyan-600 dark:text-cyan-400' },
                                ].map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = data.payment_method === method.id;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'ring-2 ring-primary border-primary bg-primary/5 dark:ring-blue-600 dark:border-blue-600 dark:bg-blue-900/20'
                                                    : 'hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${method.color}`} />
                                                <span className="font-medium text-sm dark:text-gray-200">{method.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{method.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {data.payment_method !== 'cash' && (
                                <div className="space-y-2">
                                    <Label className="text-xs dark:text-gray-300">Reference Number</Label>
                                    <Input
                                        placeholder="Enter transaction reference"
                                        value={data.reference_number || ''}
                                        onChange={(e) => {
                                            setData((prev: PaymentFormData) => ({ ...prev, reference_number: e.target.value }));
                                        }}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label className="text-xs dark:text-gray-300">Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                rows={2}
                                value={data.remarks || ''}
                                onChange={(e) => {
                                    setData((prev: PaymentFormData) => ({ ...prev, remarks: e.target.value }));
                                }}
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                size="lg"
                                onClick={handleFormSubmit}
                            >
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Complete Payment
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(2)}
                                size="lg"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
                {/* Payer Summary */}
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            {/* Resident Avatar - Show for residents */}
                            {data.payer_type === 'resident' && residentForAvatar ? (
                                <ResidentAvatar 
                                    resident={residentForAvatar} 
                                    size="md"
                                    className="flex-shrink-0"
                                />
                            ) : (
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                    <PayerIcon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base dark:text-gray-100">Payer</CardTitle>
                                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                        {getPayerTypeLabel()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{displayPayerName}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span>{displayContactNumber}</span>
                            </div>
                            
                            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                                <span>{displayAddress}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                                {displayPurok && (
                                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                        <MapPinHouse className="h-3 w-3 mr-1" />
                                        {displayPurok}
                                    </Badge>
                                )}
                                {displayHouseholdNumber && (
                                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                        <Hash className="h-3 w-3 mr-1" />
                                        {displayHouseholdNumber}
                                    </Badge>
                                )}
                            </div>

                            {data.payer_type === 'resident' && selectedResident && (
                                <>
                                    {renderResidentPrivileges()}
                                    {renderHouseholdInfo()}
                                </>
                            )}
                            
                            {data.payer_type === 'household' && selectedHousehold && (
                                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Home className="h-3 w-3" />
                                        Household Details
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Number:</span>
                                            <span className="font-medium dark:text-gray-200">{selectedHousehold.household_number}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {data.payer_type === 'business' && selectedBusiness && renderBusinessInfo()}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                    <Calculator className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-base dark:text-gray-100">Summary</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                {paymentItems.length} item{paymentItems.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        {paymentEmphasis && (
                            <div className={`${paymentEmphasis.color} text-white p-3 rounded-lg flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    {paymentEmphasis.icon}
                                    <span className="font-medium text-sm">{paymentEmphasis.badge}</span>
                                </div>
                                <span className="text-xs opacity-90">{paymentEmphasis.description}</span>
                            </div>
                        )}

                        {clearanceItems.length > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-medium mb-2">
                                    <FileBadge className="h-4 w-4" />
                                    <span className="text-sm">Clearance Details ({clearanceItems.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {clearanceItems.map((item, index) => (
                                        <div key={item.id} className={`${index > 0 ? 'pt-2 border-t border-purple-200 dark:border-purple-800' : ''}`}>
                                            <div className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="font-medium text-purple-700 dark:text-purple-400">
                                                        {item.metadata?.clearance_type_name || item.fee_name}
                                                    </span>
                                                    {item.metadata?.reference_number && (
                                                        <Badge variant="outline" className="ml-2 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                                            #{item.metadata.reference_number}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="font-medium text-purple-700 dark:text-purple-400">
                                                    {formatCurrency(item.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {paymentItems.length > 0 && feeItems.length === 0 && !isClearanceFeePayment && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {paymentItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <div className="flex-1">
                                            <div className="font-medium flex items-center gap-1 dark:text-gray-200">
                                                {item.fee_name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.fee_code}</div>
                                        </div>
                                        <div className="font-medium dark:text-gray-200">
                                            {formatCurrency(item.total_amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator className="dark:bg-gray-700" />

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="dark:text-gray-300">{formatCurrency(data.subtotal || 0)}</span>
                            </div>
                            {data.surcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-700 dark:text-amber-400">
                                    <span>Surcharge</span>
                                    <span>+{formatCurrency(data.surcharge)}</span>
                                </div>
                            )}
                            {data.penalty > 0 && (
                                <div className="flex justify-between text-sm text-red-700 dark:text-red-400">
                                    <span>Penalty</span>
                                    <span>+{formatCurrency(data.penalty)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-200 dark:border-gray-700">
                                <span className="dark:text-gray-300">Original Amount</span>
                                <span className="dark:text-gray-200">{formatCurrency(originalTotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
                                    <div className="flex items-center gap-1">
                                        <span>Discount</span>
                                        {selectedDiscountRule && (
                                            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                {selectedDiscountRule.percentage ? formatPercentage(selectedDiscountRule.percentage) : 'Fixed'}
                                            </Badge>
                                        )}
                                    </div>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">Amount Due</span>
                                <span className="text-xl font-bold text-primary dark:text-blue-400">
                                    {formatCurrency(amountDue)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(amountPaid)}</span>
                            </div>
                            
                            {isUnderpaid && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                                    <span className="font-medium text-yellow-600 dark:text-yellow-400">{formatCurrency(balance)}</span>
                                </div>
                            )}
                            {isOverpaid && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Change:</span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(change)}</span>
                                </div>
                            )}
                            
                            <div className="mt-2">
                                <Badge className={`${statusBadge.color} flex items-center gap-1 w-full justify-center py-1`}>
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Discount Selection */}
                        <div className="pt-2 space-y-2">
                            <Label className="text-xs dark:text-gray-300">Apply Discount</Label>
                            <Select
                                value={selectedDiscountCode || 'no_discount'}
                                onValueChange={handleDiscountSelect}
                            >
                                <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                    <SelectValue placeholder="No discount" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    <SelectItem value="no_discount">No Discount</SelectItem>
                                    {discountRules.map((rule) => (
                                        <SelectItem key={rule.id} value={rule.code} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span>{rule.name}</span>
                                                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                    {rule.value_type === 'percentage' 
                                                        ? `${rule.discount_value}%` 
                                                        : `₱${rule.discount_value}`}
                                                </Badge>
                                                {rule.requires_verification && (
                                                    <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                                        <IdCard className="h-3 w-3 mr-1" />
                                                        Requires ID
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {selectedDiscountRule?.requires_verification && data.verification_id_number && (
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <p className="text-xs text-green-800 dark:text-green-400 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Verified with ID: {data.verification_id_number}
                                    </p>
                                    {(data as any).verified_discount_type_name && (
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            Discount Type: {(data as any).verified_discount_type_name} ({(data as any).verified_percentage}% OFF)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}