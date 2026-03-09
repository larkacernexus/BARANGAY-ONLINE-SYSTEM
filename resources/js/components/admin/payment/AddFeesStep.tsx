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
    FileDigit,
    X
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
    selectedFee: OutstandingFee | null;
    showLateSettings: boolean;
    isLatePayment: boolean;
    setIsLatePayment: (value: boolean) => void;
    monthsLate: number;
    setMonthsLate: (value: number) => void;
    onFeeClick: (fee: OutstandingFee) => void;
    onAddWithLateSettings: () => void;
    onCancelLateSettings: () => void;
    onDirectAddFee?: (fee: OutstandingFee) => void;
    onAddClearanceRequest?: (clearanceRequest: ClearanceRequest) => void;
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
    payerClearanceRequests?: ClearanceRequest[];
}

function parseCurrencyString(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    if (typeof amount === 'number') return parseFloat(amount.toFixed(2));
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    return 0;
}

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

const getCorrectedBalance = (fee: OutstandingFee): number => {
    const balanceFromDB = parseCurrencyString(fee.balance);
    if (balanceFromDB >= 0) return parseFloat(balanceFromDB.toFixed(2));
    
    const base = parseCurrencyString(fee.base_amount);
    const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
    const penalty = parseCurrencyString(fee.penalty_amount || '0');
    const discount = parseCurrencyString(fee.discount_amount || '0');
    const amountPaid = parseCurrencyString(fee.amount_paid || '0');
    
    const totalAmount = base + surcharge + penalty - discount;
    const calculatedBalance = totalAmount - amountPaid;
    return Math.max(0, parseFloat(calculatedBalance.toFixed(2)));
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
    return <IconComponent className="h-3.5 w-3.5" />;
};

const getPayerTypeIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
        'resident': User,
        'household': Users,
        'business': Building,
        'other': UserCircle
    };
    const IconComponent = icons[type] || UserCircle;
    return <IconComponent className="h-4 w-4" />;
};

const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string, color: string }> = {
        'issued': { label: 'Issued', color: 'bg-blue-100 text-blue-800' },
        'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-800' },
        'partially_paid': { label: 'Partial', color: 'bg-purple-100 text-purple-800' },
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800' },
        'pending_payment': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        'pending': { label: 'Pending', color: 'bg-blue-100 text-blue-800' },
        'approved': { label: 'Approved', color: 'bg-green-100 text-green-800' }
    };
    
    const configItem = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
        <Badge className={`text-xs px-1.5 py-0 ${configItem.color}`}>
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
    onAddClearanceRequest,
    feeTypes = [],
    isClearancePayment = false,
    clearanceRequest = null,
    pre_filled_data = null,
    payerSource = 'residents',
    selectedFeeDetails = null,
    clearanceTypes = {},
    clearanceTypesDetails = [],
    payerClearanceRequests = []
}: AddFeesStepProps) {
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddingFee, setIsAddingFee] = useState<boolean>(false);
    const [addingFeeId, setAddingFeeId] = useState<string | number | null>(null);
    
    const isFeeAlreadyAdded = useCallback((feeId: string | number) => {
        const stringFeeId = String(feeId);
        return paymentItems.some(item => String(item.fee_id) === stringFeeId);
    }, [paymentItems]);
    
    const safeAddFee = useCallback(async (fee: OutstandingFee) => {
        if (isAddingFee) return;
        if (isFeeAlreadyAdded(fee.id)) {
            alert(`"${fee.fee_code}" is already in your payment items.`);
            return;
        }
        
        setIsAddingFee(true);
        setAddingFeeId(fee.id);
        
        try {
            if (onDirectAddFee) {
                await onDirectAddFee(fee);
            } else {
                onFeeClick(fee);
            }
        } catch (error) {
            console.error('Error adding fee:', error);
        } finally {
            setTimeout(() => {
                setIsAddingFee(false);
                setAddingFeeId(null);
            }, 300);
        }
    }, [onDirectAddFee, onFeeClick, isFeeAlreadyAdded, isAddingFee]);
    
    const handleSelectFee = (fee: OutstandingFee) => {
        if (fee.is_clearance_fee && onAddClearanceRequest) {
            const clearanceRequest = payerClearanceRequests.find(cr => cr.id === fee.clearance_request_id);
            if (clearanceRequest) {
                onAddClearanceRequest(clearanceRequest);
            } else {
                const mockClearanceRequest: ClearanceRequest = {
                    id: fee.clearance_request_id as number,
                    resident_id: fee.payer_id as number,
                    clearance_type_id: fee.fee_type_id as number,
                    reference_number: fee.reference_number || fee.fee_code,
                    purpose: fee.purpose || 'Clearance Fee',
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
            safeAddFee(fee);
        }
    };
    
    const totalSelectedAmount = React.useMemo(() => {
        return paymentItems.reduce((total, item) => total + parseCurrencyString(item.total_amount), 0);
    }, [paymentItems]);
    
    const allPayableItems = React.useMemo(() => {
        const items: OutstandingFee[] = [];
        
        payerOutstandingFees.forEach(fee => items.push({ ...fee, is_clearance_fee: false }));
        
        payerClearanceRequests.forEach(cr => {
            if (cr.already_paid || !cr.can_be_paid) return;
            if (paymentItems.some(item => item.metadata?.clearance_request_id === cr.id)) return;
            
            const feeAmount = parseCurrencyString(cr.fee_amount);
            if (feeAmount <= 0) return;
            
            items.push({
                id: `clearance-${cr.id}`,
                fee_type_id: cr.clearance_type_id,
                fee_code: cr.clearance_type?.code || cr.reference_number || `CLR-${cr.id}`,
                payer_name: cr.resident?.name || data.payer_name || 'Unknown',
                payer_type: 'resident',
                payer_id: cr.resident_id,
                due_date: new Date().toISOString().split('T')[0],
                base_amount: feeAmount.toString(),
                surcharge_amount: '0',
                penalty_amount: '0',
                discount_amount: '0',
                amount_paid: '0',
                balance: feeAmount.toString(),
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
            (item.fee_type_name?.toLowerCase().includes(query)) ||
            (item.payer_name?.toLowerCase().includes(query)) ||
            (item.purpose?.toLowerCase().includes(query)) ||
            (item.business_name?.toLowerCase().includes(query)) ||
            (item.reference_number?.toLowerCase().includes(query))
        );
    });
    
    const sortedFilteredItems = React.useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const aAdded = isFeeAlreadyAdded(a.id);
            const bAdded = isFeeAlreadyAdded(b.id);
            if (aAdded && !bAdded) return -1;
            if (!aAdded && bAdded) return 1;
            return 0;
        });
    }, [filteredItems, isFeeAlreadyAdded]);
    
    const handleContinue = () => {
        if (paymentItems.length === 0) {
            alert('Please add at least one fee to pay.');
            return;
        }
        setStep(3);
    };
    
    const handleBack = () => setStep(1);
    
    const isBusinessMode = data.payer_type === 'business' || payerSource === 'businesses';
    const isFeePayment = payerSource === 'fees' || !!pre_filled_data?.fee_id;
    const isClearanceMode = isClearancePayment && payerSource !== 'fees';
    
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            {getPayerTypeIcon(data.payer_type)}
                            Payer Information
                            {(isBusinessMode || isFeePayment || isClearanceMode) && (
                                <Badge variant="outline" className={`text-xs ${
                                    isBusinessMode ? 'bg-orange-50 text-orange-700' :
                                    isFeePayment ? 'bg-blue-50 text-blue-700' :
                                    'bg-purple-50 text-purple-700'
                                }`}>
                                    {isBusinessMode ? 'Business' : isFeePayment ? 'Fee' : 'Clearance'}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-gray-500">Name</Label>
                                <div className="font-medium truncate">{data.payer_name || 'Juan Dela Cruz Sr.'}</div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Contact</Label>
                                <div className="font-medium flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {data.contact_number || '09171234567'}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-xs text-gray-500">Address</Label>
                            <div className="font-medium flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{data.address || '24158 Catherine Plain'}</span>
                            </div>
                        </div>
                        
                        {data.purok && (
                            <div>
                                <Label className="text-xs text-gray-500">Purok</Label>
                                <div className="font-medium">{data.purok || 'West Kibawe'}</div>
                            </div>
                        )}
                        
                        <Separator className="my-2" />
                        
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs"
                            onClick={handleBack}
                        >
                            Change Payer
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column - Payable Items (COMPACT DESIGN) */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileCheck className="h-4 w-4" />
                                Payable Items
                            </CardTitle>
                            {payerClearanceRequests.length > 0 && (
                                <Badge variant="outline" className="text-xs bg-purple-50">
                                    {payerClearanceRequests.length} clearance
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs">
                            {isBusinessMode ? "Select business fees to pay" : 
                             isFeePayment ? "Select additional fees (optional)" : 
                             isClearanceMode ? "Select additional fees (optional)" : 
                             "Select items to pay"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {showLateSettings && selectedFee && (
                            <div className="mb-3">
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

                        <div className="mb-3">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8 h-8 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                            {allPayableItems.length > 0 ? (
                                sortedFilteredItems.length > 0 ? (
                                    sortedFilteredItems.map((item) => {
                                        const isAdded = isFeeAlreadyAdded(item.id);
                                        const isAdding = addingFeeId === item.id;
                                        const correctedBalance = getCorrectedBalance(item);
                                        const isClearanceFee = item.is_clearance_fee === true;
                                        const isBusinessFee = item.payer_type === 'business' || item.business_name;
                                        
                                        return (
                                            <div
                                                key={String(item.id)}
                                                className={`p-2 border rounded-md text-sm transition-all ${
                                                    isAdded ? 'bg-green-50 border-green-200' :
                                                    isClearanceFee ? 'bg-purple-50 border-purple-200' :
                                                    isBusinessFee ? 'bg-orange-50 border-orange-200' :
                                                    'hover:border-primary hover:bg-gray-50 cursor-pointer'
                                                }`}
                                                onClick={() => !isAdded && !isAdding && handleSelectFee(item)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            {isClearanceFee ? (
                                                                <FileBadge className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                                                            ) : isBusinessFee ? (
                                                                <Building className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                                                            ) : (
                                                                getCategoryIcon(item.fee_type_category || item.category || 'other')
                                                            )}
                                                            <span className="font-medium truncate text-xs">
                                                                {item.fee_type_name || item.fee_type?.name || 'Fee'}
                                                            </span>
                                                            <div className="flex gap-0.5">
                                                                {getStatusBadge(item.status)}
                                                                {isFutureFee(item) && (
                                                                    <Badge className="text-xs px-1 py-0 bg-blue-100 text-blue-800">
                                                                        Future
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="truncate">{item.fee_code}</span>
                                                            {item.reference_number && (
                                                                <span className="truncate text-purple-600">#{item.reference_number}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-primary">
                                                                {formatCurrency(correctedBalance)}
                                                            </div>
                                                        </div>
                                                        
                                                        {!isAdded ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 px-2 text-xs"
                                                                disabled={isAdding || isAddingFee}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectFee(item);
                                                                }}
                                                            >
                                                                {isAdding ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    'Add'
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 border rounded-md">
                                        <FileCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm text-gray-500">No matches</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-6 border rounded-md">
                                    <FileCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm text-gray-500">No payable items</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Selected Items */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Selected
                            </CardTitle>
                            {paymentItems.length > 0 && (
                                <Badge>{paymentItems.length}</Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs">
                            Review items before payment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {paymentItems.length === 0 ? (
                            <div className="text-center py-6 border rounded-md">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-500">No items selected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                    {paymentItems.map((item) => {
                                        const isClearanceFee = item.metadata?.is_clearance_fee === true;
                                        const isBusinessFee = item.metadata?.is_business_fee === true || item.category === 'business';
                                        const itemTotal = parseCurrencyString(item.total_amount);
                                        
                                        return (
                                            <div key={item.id} className={`p-2 border rounded-md ${
                                                isClearanceFee ? 'bg-purple-50 border-purple-200' : 
                                                isBusinessFee ? 'bg-orange-50 border-orange-200' : 'bg-white'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            {isClearanceFee ? (
                                                                <FileBadge className="h-3.5 w-3.5 text-purple-600" />
                                                            ) : isBusinessFee ? (
                                                                <Building className="h-3.5 w-3.5 text-orange-600" />
                                                            ) : (
                                                                getCategoryIcon(item.category)
                                                            )}
                                                            <span className="font-medium text-xs truncate">{item.fee_name}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {item.fee_code}
                                                        </div>
                                                    </div>
                                                    {!isClearanceFee && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600"
                                                            onClick={() => removePaymentItem(item.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-1 pt-1 border-t text-xs">
                                                    <span className="text-gray-500">Total:</span>
                                                    <span className="font-bold text-primary">{formatCurrency(itemTotal)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                        <span className="font-medium">Total Amount:</span>
                                        <span className="text-lg font-bold text-primary">
                                            {formatCurrency(totalSelectedAmount)}
                                        </span>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full h-8 text-xs"
                                        onClick={handleContinue}
                                    >
                                        Continue
                                        <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}