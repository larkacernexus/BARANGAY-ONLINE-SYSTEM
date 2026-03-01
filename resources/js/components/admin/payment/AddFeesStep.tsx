// resources/js/components/admin/payment/AddFeesStep.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Calculator,
    Package,
    User,
    Users,
    Home,
    Building,
    UserCircle,
    Trash2,
    ChevronRight,
    DollarSign,
    FileCheck,
    Shield,
    FileText,
    AlertTriangle,
    Receipt,
    Search,
    Calendar,
    CheckCircle,
    AlertCircle,
    Phone,
    MapPin,
    Hash,
    FileSearch,
    CreditCard,
    Info,
    FileBadge,
    BadgeCheck,
    Loader2,
    Clock,
    FileDigit
} from 'lucide-react';

import { LatePaymentSettings } from './LatePaymentSettings';

interface FeeType {
    id: string | number;
    name: string;
    code: string;
    base_amount: number | string;
    category: string;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
}

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    payer_type?: string;
    payer_id?: string | number;
    due_date: string;
    base_amount: string;
    surcharge_amount?: string;
    penalty_amount: string;
    discount_amount?: string;
    amount_paid: string;
    balance: string;
    status: string;
    purpose?: string;
    fee_type_name?: string;
    fee_type_category?: string;
    category?: string;
    applicableDiscounts?: any[];
    canApplyDiscount?: boolean;
    months_late?: number;
    business_name?: string;
    business_type?: string;
    contact_number?: string;
    address?: string;
    purok?: string;
    // Clearance specific fields
    is_clearance_fee?: boolean;
    clearance_request_id?: string | number;
    clearance_type?: string;
    clearance_type_name?: string;
    clearance_code?: string;
    reference_number?: string;
}

interface ClearanceRequest {
    id: string | number;
    resident_id: string | number;
    clearance_type_id: string | number;
    reference_number: string;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number | string;
    status: string;
    status_display?: string;
    can_be_paid?: boolean;
    already_paid?: boolean;
    clearance_type?: {
        id: string | number;
        name: string;
        code: string;
        fee: number;
        formatted_fee?: string;
        validity_days?: number;
        processing_days?: number;
        description?: string;
        has_senior_discount?: boolean;
        senior_discount_percentage?: number;
        has_pwd_discount?: boolean;
        pwd_discount_percentage?: number;
        has_solo_parent_discount?: boolean;
        solo_parent_discount_percentage?: number;
        has_indigent_discount?: boolean;
        indigent_discount_percentage?: number;
    };
    resident?: {
        id: string | number;
        name: string;
        contact_number?: string;
        address?: string;
        purok?: string;
        household_number?: string;
    };
    applicableDiscounts?: any[];
    canApplyDiscount?: boolean;
}

interface PaymentItem {
    id: number;
    fee_id: string | number;
    fee_name: string;
    fee_code: string;
    base_amount: number;
    surcharge?: number;
    penalty: number;
    discount?: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
        clearance_type_id?: string | number;
        clearance_type_code?: string;
        reference_number?: string;
        is_prefilled_clearance?: boolean;
        is_outstanding_fee?: boolean;
        appliedDiscount?: any;
        is_business_fee?: boolean;
        business_id?: string | number;
        business_name?: string;
        original_fee_data?: any;
    };
}

interface PaymentFormData {
    payer_type: string;
    payer_name: string;
    contact_number: string;
    address: string;
    purok: string;
    household_number?: string;
    payer_id?: string | number;
    clearance_request_id?: string | number;
    clearance_type?: string;
    clearance_type_id?: string | number;
    clearance_code?: string;
}

interface AddFeesStepProps {
    data: PaymentFormData;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    removePaymentItem: (id: number) => void;
    payerOutstandingFees: OutstandingFee[];
    
    // Late payment modal props
    selectedFee: OutstandingFee | null;
    showLateSettings: boolean;
    isLatePayment: boolean;
    setIsLatePayment: (value: boolean) => void;
    monthsLate: number;
    setMonthsLate: (value: number) => void;
    
    // Event handlers
    onFeeClick: (fee: OutstandingFee) => void;
    onAddWithLateSettings: () => void;
    onCancelLateSettings: () => void;
    onDirectAddFee?: (fee: OutstandingFee) => void;
    // ADDED: Handler for clearance requests
    onAddClearanceRequest?: (clearanceRequest: ClearanceRequest) => void;
    
    // Other props
    feeTypes?: FeeType[];
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    pre_filled_data?: {
        fee_type_id?: string | number | null;
        clearance_type_id?: string | number | null;
        clearance_code?: string | null;
        fee_id?: string | number | null;
        clearance_request_id?: string | number | null;
    } | null;
    payerSource?: 'clearance' | 'residents' | 'households' | 'businesses' | 'fees' | 'other';
    selectedFeeDetails?: any;
    clearanceTypes?: any;
    clearanceTypesDetails?: any[];
    // ADDED: Clearance requests for the payer
    payerClearanceRequests?: ClearanceRequest[];
}

/**
 * Consistent amount parsing with 2 decimal places
 */
function parseCurrencyString(amountString: string | number | null | undefined): number {
    if (amountString === null || amountString === undefined || amountString === '') return 0;
    
    if (typeof amountString === 'number') {
        return parseFloat(amountString.toFixed(2));
    }
    
    if (typeof amountString === 'string') {
        // Remove currency symbols and commas
        const cleaned = amountString.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    
    return 0;
}

/**
 * Format currency with 2 decimal places
 */
function formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function isFutureFee(fee: OutstandingFee): boolean {
    const dueDate = new Date(fee.due_date);
    const today = new Date();
    return dueDate > today;
}

/**
 * Get correct balance for outstanding fees - ALWAYS use balance from backend
 */
const getCorrectedBalance = (fee: OutstandingFee): number => {
    // ALWAYS use the balance from backend (this is the single source of truth)
    const balanceFromDB = parseCurrencyString(fee.balance);
    
    if (balanceFromDB >= 0) {
        return parseFloat(balanceFromDB.toFixed(2));
    }
    
    // Fallback calculation
    const base = parseCurrencyString(fee.base_amount);
    const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
    const penalty = parseCurrencyString(fee.penalty_amount || '0');
    const discount = parseCurrencyString(fee.discount_amount || '0');
    const amountPaid = parseCurrencyString(fee.amount_paid || '0');
    
    const totalAmount = base + surcharge + penalty - discount;
    const calculatedBalance = totalAmount - amountPaid;
    const finalBalance = Math.max(0, parseFloat(calculatedBalance.toFixed(2)));
    
    return finalBalance;
};

/**
 * Get total original amount including all components
 */
const getTotalOriginalAmount = (fee: OutstandingFee): number => {
    const base = parseCurrencyString(fee.base_amount);
    const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
    const penalty = parseCurrencyString(fee.penalty_amount || '0');
    const discount = parseCurrencyString(fee.discount_amount || '0');
    
    // Original amount = base + surcharge + penalty - discount
    const total = base + surcharge + penalty - discount;
    return parseFloat(Math.max(0, total).toFixed(2));
};

/**
 * Get amount already paid
 */
const getAmountPaid = (fee: OutstandingFee): number => {
    return parseCurrencyString(fee.amount_paid || '0');
};

/**
 * Calculate payment breakdown for the remaining balance
 */
const calculatePaymentBreakdown = (fee: OutstandingFee): {
    baseAmount: number;
    surchargeAmount: number;
    penaltyAmount: number;
    discountAmount: number;
    totalAmount: number;
} => {
    const balanceToPay = getCorrectedBalance(fee);
    const totalOriginal = getTotalOriginalAmount(fee);
    const amountPaid = getAmountPaid(fee);
    
    // If fully paid or no balance, return zeros
    if (balanceToPay <= 0) {
        return { baseAmount: 0, surchargeAmount: 0, penaltyAmount: 0, discountAmount: 0, totalAmount: 0 };
    }
    
    // Get original breakdown
    const originalBase = parseCurrencyString(fee.base_amount);
    const originalSurcharge = parseCurrencyString(fee.surcharge_amount || '0');
    const originalPenalty = parseCurrencyString(fee.penalty_amount || '0');
    const originalDiscount = parseCurrencyString(fee.discount_amount || '0');
    
    // Calculate original ratios
    const originalTotalBeforeDiscount = originalBase + originalSurcharge + originalPenalty;
    
    if (originalTotalBeforeDiscount <= 0) {
        // If no original amounts, just return the balance as base
        return { 
            baseAmount: balanceToPay, 
            surchargeAmount: 0, 
            penaltyAmount: 0, 
            discountAmount: 0, 
            totalAmount: balanceToPay 
        };
    }
    
    const originalDiscountRatio = originalTotalBeforeDiscount > 0 ? originalDiscount / originalTotalBeforeDiscount : 0;
    
    // Solve for X: X = balanceToPay / (1 - originalDiscountRatio)
    const totalBeforeDiscountForPayment = balanceToPay / (1 - originalDiscountRatio);
    
    // Calculate proportional amounts
    const baseRatio = originalBase / originalTotalBeforeDiscount;
    const surchargeRatio = originalSurcharge / originalTotalBeforeDiscount;
    const penaltyRatio = originalPenalty / originalTotalBeforeDiscount;
    
    const baseAmount = totalBeforeDiscountForPayment * baseRatio;
    const surchargeAmount = totalBeforeDiscountForPayment * surchargeRatio;
    const penaltyAmount = totalBeforeDiscountForPayment * penaltyRatio;
    const discountAmount = totalBeforeDiscountForPayment * originalDiscountRatio;
    
    // Verify the math
    const calculatedTotal = baseAmount + surchargeAmount + penaltyAmount - discountAmount;
    const roundingError = Math.abs(calculatedTotal - balanceToPay);
    
    if (roundingError > 0.01) {
        console.warn(`Rounding error in payment breakdown: ${roundingError}`);
        // Adjust to ensure total matches balanceToPay
        const adjustment = balanceToPay - calculatedTotal;
        return {
            baseAmount: parseFloat(baseAmount.toFixed(2)),
            surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
            penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
            discountAmount: parseFloat((discountAmount + adjustment).toFixed(2)),
            totalAmount: balanceToPay
        };
    }
    
    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        totalAmount: balanceToPay
    };
};

const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
        'tax': DollarSign,
        'clearance': FileBadge,
        'certificate': Shield,
        'service': Package,
        'rental': Home,
        'fine': AlertTriangle,
        'business': Building,
        'document': FileText,
        'other': Receipt
    };
    const IconComponent = icons[category] || FileText;
    return <IconComponent className="h-4 w-4" />;
};

const getPayerTypeIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
        'resident': User,
        'household': Users,
        'business': Building,
        'other': UserCircle
    };
    const IconComponent = icons[type] || UserCircle;
    return <IconComponent className="h-5 w-5" />;
};

const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string, color: string }> = {
        'issued': { label: 'Issued', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' },
        'partially_paid': { label: 'Partial', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' },
        'pending_payment': { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        'pending': { label: 'Pending', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        'processing': { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
        'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200' }
    };
    
    const configItem = config[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
        <Badge variant="outline" className={`text-xs ${configItem.color}`}>
            {configItem.label}
        </Badge>
    );
};

export function AddFeesStep({
    data,
    setStep,
    paymentItems,
    removePaymentItem,
    payerOutstandingFees,
    selectedFee,
    showLateSettings,
    isLatePayment,
    setIsLatePayment,
    monthsLate,
    setMonthsLate,
    onFeeClick,
    onAddWithLateSettings,
    onCancelLateSettings,
    onDirectAddFee,
    onAddClearanceRequest, // ADDED
    feeTypes = [],
    isClearancePayment = false,
    clearanceRequest = null,
    pre_filled_data = null,
    payerSource = 'residents',
    selectedFeeDetails = null,
    clearanceTypes = {},
    clearanceTypesDetails = [],
    payerClearanceRequests = [] // ADDED
}: AddFeesStepProps) {
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddingFee, setIsAddingFee] = useState<boolean>(false);
    const [addingFeeId, setAddingFeeId] = useState<string | number | null>(null);
    
    // Check if fee is already added - convert IDs to strings for reliable comparison
    const isFeeAlreadyAdded = useCallback((feeId: string | number) => {
        const stringFeeId = String(feeId);
        return paymentItems.some(item => String(item.fee_id) === stringFeeId);
    }, [paymentItems]);
    
    // Safe wrapper for onDirectAddFee with duplicate prevention
    const safeAddFee = useCallback(async (fee: OutstandingFee) => {
        // Prevent multiple simultaneous additions
        if (isAddingFee) {
            console.log('⏳ Already adding a fee, please wait...');
            return;
        }
        
        // Check if fee is already added
        if (isFeeAlreadyAdded(fee.id)) {
            console.log('⚠️ Fee already added:', fee.fee_code, 'ID:', fee.id);
            alert(`✅ "${fee.fee_code}" is already in your payment items. Check the "Selected Items" panel on the right.`);
            return;
        }
        
        console.log('🎯 Adding fee:', {
            feeId: fee.id,
            feeCode: fee.fee_code,
            hasDirectHandler: !!onDirectAddFee,
            feeCategory: fee.fee_type_category || fee.category,
            isClearancePayment,
            isClearanceFee: fee.is_clearance_fee
        });
        
        setIsAddingFee(true);
        setAddingFeeId(fee.id);
        
        try {
            if (onDirectAddFee) {
                await onDirectAddFee(fee);
            } else {
                onFeeClick(fee);
            }
        } catch (error) {
            console.error('❌ Error adding fee:', error);
        } finally {
            // Delay resetting to prevent double-clicks
            setTimeout(() => {
                setIsAddingFee(false);
                setAddingFeeId(null);
            }, 500);
        }
    }, [onDirectAddFee, onFeeClick, isFeeAlreadyAdded, isAddingFee, isClearancePayment]);
    
    // Handle selection of a payable item (fee or clearance)
    const handleSelectFee = (fee: OutstandingFee) => {
        // Check if this is a clearance fee
        if (fee.is_clearance_fee && onAddClearanceRequest) {
            console.log('📋 Adding clearance request:', {
                id: fee.clearance_request_id,
                reference: fee.reference_number
            });
            
            // Find the original clearance request
            const clearanceRequest = payerClearanceRequests.find(cr => 
                cr.id === fee.clearance_request_id
            );
            
            if (clearanceRequest) {
                onAddClearanceRequest(clearanceRequest);
            } else {
                // Create a minimal clearance request object
                const mockClearanceRequest: ClearanceRequest = {
                    id: fee.clearance_request_id as number,
                    resident_id: fee.payer_id as number,
                    clearance_type_id: fee.fee_type_id as number,
                    reference_number: fee.reference_number || fee.fee_code,
                    purpose: fee.purpose || 'Clearance Fee',
                    specific_purpose: fee.purpose || '',
                    fee_amount: parseCurrencyString(fee.base_amount),
                    status: fee.status || 'pending_payment',
                    can_be_paid: true,
                    already_paid: false,
                    clearance_type: {
                        id: fee.fee_type_id as number,
                        name: fee.fee_type_name || 'Barangay Clearance',
                        code: fee.clearance_code || 'BRGY_CLEARANCE',
                        fee: parseCurrencyString(fee.base_amount),
                    },
                    resident: {
                        id: fee.payer_id as number,
                        name: fee.payer_name || 'Unknown',
                        contact_number: fee.contact_number,
                        address: fee.address,
                        purok: fee.purok,
                    }
                };
                onAddClearanceRequest(mockClearanceRequest);
            }
        } else {
            // Regular fee - use safeAddFee
            safeAddFee(fee);
        }
    };
    
    const totalSelectedAmount = React.useMemo(() => {
        return paymentItems.reduce((total, item) => {
            return total + parseCurrencyString(item.total_amount);
        }, 0);
    }, [paymentItems]);
    
    // Combine fees and clearance requests into a single list
    const allPayableItems = React.useMemo(() => {
        const items: OutstandingFee[] = [];
        
        // Add outstanding fees
        payerOutstandingFees.forEach(fee => {
            items.push({
                ...fee,
                is_clearance_fee: false
            });
        });
        
        // Add clearance requests as "fees"
        payerClearanceRequests.forEach(cr => {
            // Skip if already paid or not payable
            if (cr.already_paid || !cr.can_be_paid) return;
            
            // Check if this clearance request is already in payment items
            const alreadyAdded = paymentItems.some(item => 
                item.metadata?.clearance_request_id === cr.id
            );
            
            if (alreadyAdded) return;
            
            // Get fee amount
            const feeAmount = parseCurrencyString(cr.fee_amount);
            if (feeAmount <= 0) return;
            
            // Create an OutstandingFee-like object from clearance request
            items.push({
                id: `clearance-${cr.id}`,
                fee_type_id: cr.clearance_type_id,
                fee_code: cr.clearance_type?.code || cr.reference_number || `CLR-${cr.id}`,
                payer_name: cr.resident?.name || data.payer_name || 'Unknown',
                payer_type: 'resident',
                payer_id: cr.resident_id,
                due_date: new Date().toISOString().split('T')[0], // Use current date or get from CR
                base_amount: feeAmount.toString(),
                surcharge_amount: '0',
                penalty_amount: '0',
                discount_amount: '0',
                amount_paid: '0',
                balance: feeAmount.toString(),
                total_amount: feeAmount.toString(),
                status: cr.status,
                purpose: cr.purpose,
                fee_type_name: cr.clearance_type?.name || 'Clearance Fee',
                fee_type_category: 'clearance',
                category: 'clearance',
                applicableDiscounts: cr.applicableDiscounts || [],
                canApplyDiscount: cr.canApplyDiscount || false,
                is_clearance_fee: true,
                clearance_request_id: cr.id,
                clearance_type: cr.clearance_type?.code,
                clearance_type_name: cr.clearance_type?.name,
                clearance_code: cr.clearance_type?.code,
                reference_number: cr.reference_number,
                contact_number: cr.resident?.contact_number,
                address: cr.resident?.address,
                purok: cr.resident?.purok
            });
        });
        
        return items;
    }, [payerOutstandingFees, payerClearanceRequests, paymentItems, data.payer_name]);
    
    const filteredItems = allPayableItems.filter(item => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            item.fee_code.toLowerCase().includes(query) ||
            (item.fee_type_name && item.fee_type_name.toLowerCase().includes(query)) ||
            (item.payer_name && item.payer_name.toLowerCase().includes(query)) ||
            (item.purpose && item.purpose.toLowerCase().includes(query)) ||
            (item.business_name && item.business_name.toLowerCase().includes(query)) ||
            (item.business_type && item.business_type.toLowerCase().includes(query)) ||
            (item.reference_number && item.reference_number.toLowerCase().includes(query)) ||
            (item.clearance_type_name && item.clearance_type_name.toLowerCase().includes(query))
        );
    });
    
    const handleContinue = () => {
        if (paymentItems.length === 0) {
            alert('Please add at least one fee to pay.');
            return;
        }
        setStep(3);
    };
    
    const handleBack = () => {
        setStep(1);
    };
    
    // Get payment mode title based on determined payment type
    const getPaymentModeTitle = () => {
        if (data.payer_type === 'business' || payerSource === 'businesses') {
            return 'Business Payment';
        }
        if (isClearancePayment && payerSource !== 'fees') {
            return 'Clearance Payment';
        }
        if (payerSource === 'fees' || pre_filled_data?.fee_id) {
            return 'Fee Payment';
        }
        return 'Payment Mode';
    };
    
    // Get payment mode description based on determined payment type
    const getPaymentModeDescription = () => {
        if (data.payer_type === 'business' || payerSource === 'businesses') {
            return "You're paying for business fees and permits.";
        }
        if (isClearancePayment && payerSource !== 'fees') {
            return "You're paying for a clearance request. You can add additional outstanding fees below.";
        }
        if (payerSource === 'fees' || pre_filled_data?.fee_id) {
            return 'Pay for barangay fees and charges';
        }
        return "Select fees to pay from the list below.";
    };
    
    // Get payment mode icon based on determined payment type
    const getPaymentModeIcon = () => {
        if (data.payer_type === 'business' || payerSource === 'businesses') {
            return <Building className="h-4 w-4 flex-shrink-0" />;
        }
        if (isClearancePayment && payerSource !== 'fees') {
            return <FileBadge className="h-4 w-4 flex-shrink-0" />;
        }
        if (payerSource === 'fees' || pre_filled_data?.fee_id) {
            return <Receipt className="h-4 w-4 flex-shrink-0" />;
        }
        return <Info className="h-4 w-4 flex-shrink-0" />;
    };
    
    // Get payment mode color based on determined payment type
    const getPaymentModeColor = () => {
        if (data.payer_type === 'business' || payerSource === 'businesses') {
            return 'bg-orange-50 border-orange-200 text-orange-800';
        }
        if (isClearancePayment && payerSource !== 'fees') {
            return 'bg-purple-50 border-purple-200 text-purple-800';
        }
        if (payerSource === 'fees' || pre_filled_data?.fee_id) {
            return 'bg-blue-50 border-blue-200 text-blue-800';
        }
        return 'bg-gray-50 border-gray-200 text-gray-800';
    };
    
    // Check if this is a fee payment
    const isFeePayment = payerSource === 'fees' || !!pre_filled_data?.fee_id;
    
    // Check if this is a clearance payment
    const isClearanceMode = isClearancePayment && payerSource !== 'fees';
    
    // Check if this is a business payment
    const isBusinessMode = data.payer_type === 'business' || payerSource === 'businesses';
    
    // Check if this is a clearance-only payment
    const isClearanceOnlyPayment = isClearanceMode && 
        paymentItems.length === 1 && 
        paymentItems[0]?.metadata?.is_clearance_fee === true;
    
    // Check if there's a fee ID in pre_filled_data
    const hasFeeId = !!pre_filled_data?.fee_id;
    
    // Get fee details for display
    const getFeeCode = () => {
        if (selectedFeeDetails?.fee_code) {
            return selectedFeeDetails.fee_code;
        }
        const clearanceItem = paymentItems.find(item => item.metadata?.is_clearance_fee);
        if (clearanceItem) {
            return clearanceItem.fee_code;
        }
        return paymentItems.find(item => item.metadata?.is_outstanding_fee)?.fee_code || 'TAX-T-3821';
    };
    
    const getFeeName = () => {
        if (selectedFeeDetails?.fee_type_name) {
            return selectedFeeDetails.fee_type_name;
        }
        const clearanceItem = paymentItems.find(item => item.metadata?.is_clearance_fee);
        if (clearanceItem) {
            return clearanceItem.fee_name;
        }
        return paymentItems.find(item => item.metadata?.is_outstanding_fee)?.fee_name || 'tax';
    };
    
    // Debug log when paymentItems changes
    useEffect(() => {
        console.log('📦 AddFeesStep - paymentItems updated:', {
            count: paymentItems.length,
            items: paymentItems.map(item => ({
                id: item.id,
                fee_id: item.fee_id,
                name: item.fee_name,
                amount: item.total_amount,
                isClearance: item.metadata?.is_clearance_fee,
                isBusiness: item.metadata?.is_business_fee || item.category === 'business'
            }))
        });
    }, [paymentItems]);

    // Debug log for props
    useEffect(() => {
        console.log('📋 AddFeesStep props:', {
            payerClearanceRequestsCount: payerClearanceRequests.length,
            hasOnAddClearanceRequest: !!onAddClearanceRequest,
            isClearanceMode: isClearanceMode,
            allPayableItemsCount: allPayableItems.length,
            isClearancePayment
        });
        
        // Log each clearance request
        payerClearanceRequests.forEach((cr, index) => {
            console.log(`📋 Clearance request ${index}:`, {
                id: cr.id,
                reference: cr.reference_number,
                amount: cr.fee_amount,
                status: cr.status,
                can_be_paid: cr.can_be_paid,
                already_paid: cr.already_paid
            });
        });
    }, [payerClearanceRequests, onAddClearanceRequest, isClearanceMode, allPayableItems.length, isClearancePayment]);
    
    // Sort items - added items at the top, then clearance, then fees
    const sortedFilteredItems = React.useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const aAdded = isFeeAlreadyAdded(a.id);
            const bAdded = isFeeAlreadyAdded(b.id);
            if (aAdded && !bAdded) return -1;
            if (!aAdded && bAdded) return 1;
            
            // If both not added, prioritize clearance fees
            if (!aAdded && !bAdded) {
                if (a.is_clearance_fee && !b.is_clearance_fee) return -1;
                if (!a.is_clearance_fee && b.is_clearance_fee) return 1;
            }
            
            return 0;
        });
    }, [filteredItems, isFeeAlreadyAdded]);
    
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getPayerTypeIcon(data.payer_type)}
                            Payer Information
                            {isBusinessMode && (
                                <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
                                    <Building className="h-3 w-3 mr-1" />
                                    Business Payment
                                </Badge>
                            )}
                            {isFeePayment && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                    <Receipt className="h-3 w-3 mr-1" />
                                    Fee Payment
                                </Badge>
                            )}
                            {isClearanceMode && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                    <FileBadge className="h-3 w-3 mr-1" />
                                    Clearance
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm text-gray-500">Payer Name</Label>
                            <div className="font-medium">{data.payer_name || 'Juan Dela Cruz Sr.'}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm text-gray-500">Contact</Label>
                                <div className="font-medium flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {data.contact_number || '09171234567'}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Household #</Label>
                                <div className="font-medium flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    {data.household_number || 'HH-2025-00001'}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-sm text-gray-500">Address</Label>
                            <div className="font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {data.address || '24158 Catherine Plain'}
                            </div>
                        </div>
                        
                        {data.purok && (
                            <div>
                                <Label className="text-sm text-gray-500">Purok</Label>
                                <div className="font-medium">{data.purok || 'West Kibawe'}</div>
                            </div>
                        )}
                        
                        {/* Show clearance info if this is actually a clearance payment */}
                        {isClearanceMode && (
                            <>
                                <Separator />
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileSearch className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium text-purple-800">
                                            {clearanceRequest?.clearance_type?.name || 
                                             clearanceRequest?.purpose || 
                                             'Barangay Clearance'}
                                        </span>
                                        {payerSource === 'clearance' && (
                                            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                From Clearance Tab
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        {clearanceRequest?.reference_number && (
                                            <div>
                                                <span className="text-purple-700">Reference:</span>
                                                <div className="font-mono font-medium">{clearanceRequest.reference_number}</div>
                                            </div>
                                        )}
                                        {data.clearance_code && (
                                            <div>
                                                <span className="text-purple-700">Code:</span>
                                                <div className="font-mono font-medium">{data.clearance_code}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Show business info for business payments */}
                        {isBusinessMode && (
                            <>
                                <Separator />
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="h-4 w-4 text-orange-600" />
                                        <span className="font-medium text-orange-800">
                                            Business Payment
                                        </span>
                                        <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                            Business
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-orange-700">Business:</span>
                                            <div className="font-medium">{data.payer_name}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Show fee info for fee payments */}
                        {isFeePayment && (hasFeeId || selectedFeeDetails) && (
                            <>
                                <Separator />
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Receipt className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-blue-800">
                                            {getFeeName()}
                                        </span>
                                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                            Fee Reference
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-blue-700">Fee Code:</span>
                                            <div className="font-mono font-medium">{getFeeCode()}</div>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Mode:</span>
                                            <div className="font-medium">Pre-filled from Fees</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <Separator />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleBack}
                        >
                            Change Payer
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column - Payable Items (Fees + Clearance Requests) */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            Payable Items
                        </CardTitle>
                        <CardDescription>
                            {isBusinessMode
                                ? "Select business fees to pay" 
                                : isFeePayment 
                                    ? "Select additional fees to pay (optional)" 
                                    : isClearanceMode 
                                        ? "Select additional fees to pay (optional)" 
                                        : "Select fees or clearance requests to pay"
                            }
                            {payerClearanceRequests.length > 0 && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                    {payerClearanceRequests.length} clearance request(s)
                                </Badge>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Show mode message based on payment type */}
                        {(isFeePayment || isClearanceMode || isBusinessMode) && (
                            <div className={`mb-4 p-3 border rounded-md ${getPaymentModeColor()}`}>
                                <div className="flex items-start gap-2">
                                    {getPaymentModeIcon()}
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {getPaymentModeTitle()}
                                        </p>
                                        <p className={
                                            isBusinessMode ? 'text-orange-700' :
                                            isFeePayment ? 'text-blue-700' : 'text-purple-700'
                                        }>
                                            {getPaymentModeDescription()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showLateSettings && selectedFee && (
                            <div className="mb-6">
                                <LatePaymentSettings
                                    selectedFee={selectedFee}
                                    isLatePayment={isLatePayment}
                                    setIsLatePayment={setIsLatePayment}
                                    monthsLate={monthsLate}
                                    setMonthsLate={setMonthsLate}
                                    handleAddWithLateSettings={onAddWithLateSettings}
                                    handleCancelLateSettings={onCancelLateSettings}
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search fees or clearance requests..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {allPayableItems.length > 0 ? (
                                sortedFilteredItems.length > 0 ? (
                                    sortedFilteredItems.map((item) => {
                                        const isAdded = isFeeAlreadyAdded(item.id);
                                        const isAdding = addingFeeId === item.id;
                                        const category = item.fee_type_category || item.category || 'other';
                                        const isFuture = isFutureFee(item);
                                        const isBusinessFee = item.payer_type === 'business' || item.business_name;
                                        const isClearanceFee = item.is_clearance_fee === true;
                                        
                                        // Calculate what WILL be paid if added
                                        const correctedBalance = getCorrectedBalance(item);
                                        const paymentBreakdown = calculatePaymentBreakdown(item);
                                        const amountPaid = getAmountPaid(item);
                                        
                                        return (
                                            <div
                                                key={String(item.id)}
                                                className={`p-3 border rounded-lg transition-all ${
                                                    isAdded 
                                                        ? 'bg-green-50 border-green-200 cursor-pointer hover:border-green-300' 
                                                        : isAdding
                                                            ? 'bg-blue-50 border-blue-200 cursor-wait'
                                                            : isClearanceFee
                                                                ? 'bg-purple-50 border-purple-200 hover:border-purple-300 cursor-pointer'
                                                                : isBusinessFee
                                                                    ? 'bg-orange-50 border-orange-200 hover:border-orange-300 cursor-pointer'
                                                                    : 'bg-white hover:border-primary hover:shadow-md cursor-pointer'
                                                }`}
                                                onClick={() => {
                                                    console.log('👆 Item clicked:', {
                                                        feeCode: item.fee_code,
                                                        isAdded,
                                                        isAdding,
                                                        isAddingFee,
                                                        isClearanceFee
                                                    });
                                                    
                                                    if (isAdded) {
                                                        alert(`✅ "${item.fee_code}" is already in your payment items. Check the "Selected Items" panel on the right.`);
                                                        return;
                                                    }
                                                    
                                                    if (isAdding || isAddingFee) {
                                                        console.log('⏳ Item is currently being added, please wait...');
                                                        return;
                                                    }
                                                    
                                                    // Not added and not adding - proceed with adding
                                                    handleSelectFee(item);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {isClearanceFee ? (
                                                                <FileBadge className="h-4 w-4 text-purple-600" />
                                                            ) : isBusinessFee ? (
                                                                <Building className="h-4 w-4 text-orange-600" />
                                                            ) : (
                                                                getCategoryIcon(category)
                                                            )}
                                                            <span className="font-medium">
                                                                {item.fee_type_name || item.fee_type?.name || 'Fee'}
                                                            </span>
                                                            {getStatusBadge(item.status)}
                                                            {isFuture && (
                                                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                                                    Future Due
                                                                </Badge>
                                                            )}
                                                            {isClearanceFee && (
                                                                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Clearance
                                                                </Badge>
                                                            )}
                                                            {isBusinessFee && (
                                                                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                                                                    Business
                                                                </Badge>
                                                            )}
                                                            {isAdded && (
                                                                <Badge className="bg-green-600">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Added
                                                                </Badge>
                                                            )}
                                                            {isAdding && (
                                                                <Badge className="bg-blue-600">
                                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                    Adding...
                                                                </Badge>
                                                            )}
                                                            {item.canApplyDiscount && !isAdded && (
                                                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                                    Discount Eligible
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            Code: {item.fee_code}
                                                            {isClearanceFee && item.reference_number && (
                                                                <span className="ml-2 text-purple-700">
                                                                    • Ref: {item.reference_number}
                                                                </span>
                                                            )}
                                                            {isBusinessFee && item.business_name && (
                                                                <span className="ml-2 font-medium text-orange-700">
                                                                    • {item.business_name}
                                                                </span>
                                                            )}
                                                            {item.payer_name && !isBusinessFee && ` • ${item.payer_name}`}
                                                            {item.purpose && ` • ${item.purpose}`}
                                                        </div>
                                                        
                                                        {/* Show EXACTLY what will be paid if added */}
                                                        <div className="space-y-1 text-xs mb-2">
                                                            {!isAdded ? (
                                                                <>
                                                                    <div className="font-medium text-blue-700 mb-1">
                                                                        If added, you will pay:
                                                                    </div>
                                                                    
                                                                    <div className="flex justify-between">
                                                                        <span>Base Amount:</span>
                                                                        <span>{formatCurrency(paymentBreakdown.baseAmount)}</span>
                                                                    </div>
                                                                    
                                                                    {paymentBreakdown.surchargeAmount > 0 && (
                                                                        <div className="flex justify-between text-amber-600">
                                                                            <span>Surcharge:</span>
                                                                            <span>+{formatCurrency(paymentBreakdown.surchargeAmount)}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {paymentBreakdown.penaltyAmount > 0 && (
                                                                        <div className="flex justify-between text-red-600">
                                                                            <span>Penalty:</span>
                                                                            <span>+{formatCurrency(paymentBreakdown.penaltyAmount)}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {paymentBreakdown.discountAmount > 0 && (
                                                                        <div className="flex justify-between text-green-600">
                                                                            <span>Discount:</span>
                                                                            <span>-{formatCurrency(paymentBreakdown.discountAmount)}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="flex justify-between font-bold pt-1 border-t mt-1">
                                                                        <span className="text-primary">Total to Pay:</span>
                                                                        <span className="text-primary font-bold">
                                                                            {formatCurrency(paymentBreakdown.totalAmount)}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="p-2 bg-green-100 rounded text-xs text-green-800">
                                                                    <CheckCircle className="h-3 w-3 inline mr-1" />
                                                                    This item has been added to your payment
                                                                </div>
                                                            )}
                                                            
                                                            {/* Show original amounts for context */}
                                                            {amountPaid > 0 && (
                                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                                    <div className="text-gray-600 font-medium mb-1">Original Summary:</div>
                                                                    <div className="flex justify-between">
                                                                        <span>Original Total:</span>
                                                                        <span>{formatCurrency(getTotalOriginalAmount(item))}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-green-600">
                                                                        <span>Already Paid:</span>
                                                                        <span>-{formatCurrency(amountPaid)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between font-medium">
                                                                        <span>Remaining Balance:</span>
                                                                        <span>{formatCurrency(correctedBalance)}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Due: {item.due_date}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-primary">
                                                                    {formatCurrency(correctedBalance)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {isAdded ? 'Already Added' : 'Balance to Pay'}
                                                                </div>
                                                                {amountPaid > 0 && (
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        (Already Paid: {formatCurrency(amountPaid)})
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {!isAdded && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={isAdding ? "outline" : "default"}
                                                            className={`ml-2 ${isAdding ? 'cursor-wait' : ''}`}
                                                            disabled={isAdding || isAddingFee}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                
                                                                if (isAdded) {
                                                                    alert(`✅ "${item.fee_code}" is already in your payment items.`);
                                                                    return;
                                                                }
                                                                
                                                                if (!isAdding && !isAddingFee) {
                                                                    console.log('🔘 Add button clicked:', item.fee_code);
                                                                    handleSelectFee(item);
                                                                }
                                                            }}
                                                        >
                                                            {isAdding ? (
                                                                <>
                                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                    Adding...
                                                                </>
                                                            ) : (
                                                                'Add'
                                                            )}
                                                        </Button>
                                                    )}
                                                    
                                                    {isAdded && (
                                                        <div className="ml-2 px-3 py-2 text-sm text-green-700 flex items-center gap-1">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Added</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                        <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <h4 className="font-medium text-gray-700">No matching items found</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Try adjusting your search query
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">No payable items found</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchQuery 
                                            ? 'No items match your search'
                                            : isBusinessMode
                                                ? 'No outstanding business fees'
                                                : isFeePayment || isClearanceMode
                                                    ? 'No additional outstanding fees'
                                                    : 'No outstanding fees or clearance requests available for this payer'
                                        }
                                    </p>
                                    {allPayableItems.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Payer ID: {data.payer_id} | Type: {data.payer_type}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Selected Items */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Selected Items
                            {paymentItems.length > 0 && (
                                <Badge className="ml-2">{paymentItems.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Review selected items
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentItems.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">No items selected</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isBusinessMode
                                            ? "Select business fees from the list to add them here"
                                            : isFeePayment 
                                                ? "Select fees from the list to add them here"
                                                : isClearanceMode 
                                                    ? "Add clearance fee or select other fees to pay"
                                                    : "Select fees or clearance requests from the list to add them here"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Show business info for business payments */}
                                    {isBusinessMode && (
                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-orange-800">
                                                <Building className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Business Payment
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm text-orange-700">
                                                <div>Business: {data.payer_name}</div>
                                            </div>
                                        </div>
                                    )}

                                 

                                    {/* Show fee info for fee payments */}
                                    {isFeePayment && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-blue-800">
                                                <Receipt className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {getFeeName()}
                                                </span>
                                                <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                    Fee
                                                </Badge>
                                            </div>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <div>Reference: {getFeeCode()}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {paymentItems.map((item) => {
                                            const isClearanceFee = item.metadata?.is_clearance_fee === true;
                                            const isOutstandingFee = item.metadata?.is_outstanding_fee === true;
                                            const isBusinessFee = item.metadata?.is_business_fee === true || item.category === 'business';
                                            const itemTotal = parseCurrencyString(item.total_amount);
                                            
                                            return (
                                                <div key={item.id} className={`p-3 border rounded-lg ${
                                                    isClearanceFee ? 'bg-purple-50 border-purple-200' : 
                                                    isBusinessFee ? 'bg-orange-50 border-orange-200' :
                                                    isOutstandingFee ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {isClearanceFee ? (
                                                                    <FileBadge className="h-4 w-4 text-purple-600" />
                                                                ) : isBusinessFee ? (
                                                                    <Building className="h-4 w-4 text-orange-600" />
                                                                ) : (
                                                                    getCategoryIcon(item.category)
                                                                )}
                                                                <span className="font-medium">{item.fee_name}</span>
                                                                {isClearanceFee && (
                                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                        <FileBadge className="h-3 w-3 mr-1" />
                                                                        Clearance
                                                                    </Badge>
                                                                )}
                                                                {isBusinessFee && (
                                                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                                                        <Building className="h-3 w-3 mr-1" />
                                                                        Business
                                                                    </Badge>
                                                                )}
                                                                {isOutstandingFee && !isClearanceFee && !isBusinessFee && (
                                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                                        <Receipt className="h-3 w-3 mr-1" />
                                                                        Fee
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.fee_code}
                                                                {item.metadata?.reference_number && (
                                                                    <span className="ml-2 text-purple-600">
                                                                        Ref: {item.metadata.reference_number}
                                                                    </span>
                                                                )}
                                                                {item.metadata?.business_name && (
                                                                    <span className="ml-2 text-orange-600">
                                                                        • {item.metadata.business_name}
                                                                    </span>
                                                                )}
                                                                {item.metadata?.is_prefilled_clearance && " (Prefilled)"}
                                                            </div>
                                                        </div>
                                                        {!isClearanceFee && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                                                onClick={() => removePaymentItem(item.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-xs space-y-1 pt-2 border-t">
                                                        <div className="flex justify-between">
                                                            <span>Base Amount:</span>
                                                            <span>{formatCurrency(parseCurrencyString(item.base_amount))}</span>
                                                        </div>
                                                        
                                                        {parseCurrencyString(item.surcharge || 0) > 0 && (
                                                            <div className="flex justify-between text-amber-600">
                                                                <span>Surcharge:</span>
                                                                <span>+{formatCurrency(parseCurrencyString(item.surcharge || 0))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {parseCurrencyString(item.penalty || 0) > 0 && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Penalty:</span>
                                                                <span>+{formatCurrency(parseCurrencyString(item.penalty || 0))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {parseCurrencyString(item.discount || 0) > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount:</span>
                                                                <span>-{formatCurrency(parseCurrencyString(item.discount || 0))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between font-bold pt-1">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(itemTotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="pt-4 border-t">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Total Amount:</span>
                                                <span className="text-primary">
                                                    {formatCurrency(totalSelectedAmount)}
                                                </span>
                                            </div>
                                            
                                            <Button
                                                type="button"
                                                className="w-full"
                                                onClick={handleContinue}
                                            >
                                                Continue to Payment
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                            
                                            {isClearanceMode && isClearanceOnlyPayment && (
                                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                    <p className="text-xs text-blue-700 text-center">
                                                        Proceeding with clearance-only payment
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}