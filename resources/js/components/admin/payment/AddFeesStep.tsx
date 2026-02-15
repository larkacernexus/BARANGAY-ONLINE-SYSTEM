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
    Loader2
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
        is_prefilled_clearance?: boolean;
        is_outstanding_fee?: boolean;
        appliedDiscount?: any;
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

interface ClearanceRequest {
    id: string | number;
    reference_number: string;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number | string;
    clearance_type?: {
        name: string;
        code: string;
    };
    resident?: {
        name: string;
    };
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
    payerSource?: 'clearance' | 'residents' | 'households' | 'fees' | 'other';
    selectedFeeDetails?: any;
    clearanceTypes?: any;
    clearanceTypesDetails?: any[];
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
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' }
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
    feeTypes = [],
    isClearancePayment = false,
    clearanceRequest = null,
    pre_filled_data = null,
    payerSource = 'residents',
    selectedFeeDetails = null,
    clearanceTypes = {},
    clearanceTypesDetails = []
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
            isClearancePayment
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
    
    const totalSelectedAmount = React.useMemo(() => {
        return paymentItems.reduce((total, item) => {
            return total + parseCurrencyString(item.total_amount);
        }, 0);
    }, [paymentItems]);
    
    const filteredFees = payerOutstandingFees.filter(fee => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            fee.fee_code.toLowerCase().includes(query) ||
            (fee.fee_type_name && fee.fee_type_name.toLowerCase().includes(query)) ||
            (fee.payer_name && fee.payer_name.toLowerCase().includes(query)) ||
            (fee.purpose && fee.purpose.toLowerCase().includes(query))
        );
    });
    
    const handleSelectFee = (fee: OutstandingFee) => {
        safeAddFee(fee);
    };
    
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
        return paymentItems.find(item => item.metadata?.is_outstanding_fee)?.fee_code || 'TAX-T-3821';
    };
    
    const getFeeName = () => {
        if (selectedFeeDetails?.fee_type_name) {
            return selectedFeeDetails.fee_type_name;
        }
        return paymentItems.find(item => item.metadata?.is_outstanding_fee)?.fee_name || 'tax';
    };
    
    // Debug log when paymentItems changes
    React.useEffect(() => {
        console.log('📦 AddFeesStep - paymentItems updated:', {
            count: paymentItems.length,
            items: paymentItems.map(item => ({
                id: item.id,
                fee_id: item.fee_id,
                name: item.fee_name,
                amount: item.total_amount
            }))
        });
    }, [paymentItems]);
    
    // Sort fees - added fees at the top
    const sortedFilteredFees = React.useMemo(() => {
        return [...filteredFees].sort((a, b) => {
            const aAdded = isFeeAlreadyAdded(a.id);
            const bAdded = isFeeAlreadyAdded(b.id);
            if (aAdded && !bAdded) return -1;
            if (!aAdded && bAdded) return 1;
            return 0;
        });
    }, [filteredFees, isFeeAlreadyAdded]);
    
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getPayerTypeIcon(data.payer_type)}
                            Payer Information
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

            {/* Middle Column - Outstanding Fees */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            Outstanding Fees
                        </CardTitle>
                        <CardDescription>
                            {isFeePayment 
                                ? "Select additional fees to pay (optional)" 
                                : isClearanceMode 
                                    ? "Select additional fees to pay (optional)" 
                                    : "Select fees to pay"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Show mode message based on payment type */}
                        {(isFeePayment || isClearanceMode) && (
                            <div className={`mb-4 p-3 border rounded-md ${getPaymentModeColor()}`}>
                                <div className="flex items-start gap-2">
                                    {getPaymentModeIcon()}
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {getPaymentModeTitle()}
                                        </p>
                                        <p className={isFeePayment ? 'text-blue-700' : 'text-purple-700'}>
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
                                    placeholder="Search fees..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {payerOutstandingFees.length > 0 ? (
                                sortedFilteredFees.length > 0 ? (
                                    sortedFilteredFees.map((fee) => {
                                        const isAdded = isFeeAlreadyAdded(fee.id);
                                        const isAdding = addingFeeId === fee.id;
                                        const category = fee.fee_type_category || fee.category || 'other';
                                        const isFuture = isFutureFee(fee);
                                        
                                        // Calculate what WILL be paid if added
                                        const correctedBalance = getCorrectedBalance(fee);
                                        const paymentBreakdown = calculatePaymentBreakdown(fee);
                                        const amountPaid = getAmountPaid(fee);
                                        
                                        return (
                                            <div
                                                key={String(fee.id)}
                                                className={`p-3 border rounded-lg transition-all ${
                                                    isAdded 
                                                        ? 'bg-green-50 border-green-200 cursor-pointer hover:border-green-300' 
                                                        : isAdding
                                                            ? 'bg-blue-50 border-blue-200 cursor-wait'
                                                            : 'bg-white hover:border-primary hover:shadow-md cursor-pointer'
                                                }`}
                                                onClick={() => {
                                                    console.log('👆 Fee card clicked:', {
                                                        feeCode: fee.fee_code,
                                                        isAdded,
                                                        isAdding,
                                                        isAddingFee
                                                    });
                                                    
                                                    if (isAdded) {
                                                        alert(`✅ "${fee.fee_code}" is already in your payment items. Check the "Selected Items" panel on the right.`);
                                                        return;
                                                    }
                                                    
                                                    if (isAdding || isAddingFee) {
                                                        console.log('⏳ Fee is currently being added, please wait...');
                                                        return;
                                                    }
                                                    
                                                    // Not added and not adding - proceed with adding
                                                    handleSelectFee(fee);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getCategoryIcon(category)}
                                                            <span className="font-medium">
                                                                {fee.fee_type_name || fee.fee_type?.name || 'Fee'}
                                                            </span>
                                                            {getStatusBadge(fee.status)}
                                                            {isFuture && (
                                                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                                                    Future Due
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
                                                            {fee.canApplyDiscount && !isAdded && (
                                                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                                    Discount Eligible
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            Code: {fee.fee_code}
                                                            {fee.payer_name && ` • ${fee.payer_name}`}
                                                            {fee.purpose && ` • ${fee.purpose}`}
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
                                                                    This fee has been added to your payment
                                                                </div>
                                                            )}
                                                            
                                                            {/* Show original amounts for context */}
                                                            {amountPaid > 0 && (
                                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                                    <div className="text-gray-600 font-medium mb-1">Original Fee Summary:</div>
                                                                    <div className="flex justify-between">
                                                                        <span>Original Total:</span>
                                                                        <span>{formatCurrency(getTotalOriginalAmount(fee))}</span>
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
                                                                Due: {fee.due_date}
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
                                                                    alert(`✅ "${fee.fee_code}" is already in your payment items.`);
                                                                    return;
                                                                }
                                                                
                                                                if (!isAdding && !isAddingFee) {
                                                                    console.log('🔘 Add button clicked:', fee.fee_code);
                                                                    handleSelectFee(fee);
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
                                        <h4 className="font-medium text-gray-700">No matching fees found</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Try adjusting your search query
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">No fees found</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchQuery 
                                            ? 'No fees match your search'
                                            : isFeePayment || isClearanceMode
                                                ? 'No additional outstanding fees'
                                                : 'No outstanding fees available for this payer'
                                        }
                                    </p>
                                    {payerOutstandingFees.length === 0 && (
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
                            Review selected fees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentItems.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">No items selected</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isFeePayment 
                                            ? "Select fees from the list to add them here"
                                            : isClearanceMode 
                                                ? "Add clearance fee or select other fees to pay"
                                                : "Select fees from the list to add them here"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Show clearance info if this is actually a clearance payment */}
                                    {isClearanceMode && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-purple-800">
                                                <FileBadge className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {clearanceRequest?.clearance_type?.name || 
                                                     clearanceRequest?.purpose || 
                                                     'Barangay Clearance'}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm text-purple-700">
                                                <div>Code: BRGY_CLEARANCE</div>
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
                                            const itemTotal = parseCurrencyString(item.total_amount);
                                            
                                            return (
                                                <div key={item.id} className={`p-3 border rounded-lg ${
                                                    isClearanceFee ? 'bg-purple-50 border-purple-200' : 
                                                    isOutstandingFee ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getCategoryIcon(item.category)}
                                                                <span className="font-medium">{item.fee_name}</span>
                                                                {isClearanceFee && (
                                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                        <FileBadge className="h-3 w-3 mr-1" />
                                                                        Clearance
                                                                    </Badge>
                                                                )}
                                                                {isOutstandingFee && !isClearanceFee && (
                                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                                        <Receipt className="h-3 w-3 mr-1" />
                                                                        Fee
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.fee_code}
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