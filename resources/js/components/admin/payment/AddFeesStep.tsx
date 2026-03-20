// resources/js/components/admin/payment/AddFeesStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    X,
    Filter
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
    payerClearanceRequests?: ClearanceRequest[];
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
        'issued': { label: 'Issued', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
        'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
        'partially_paid': { label: 'Partial', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
        'pending_payment': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
        'pending': { label: 'Pending', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
        'approved': { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' }
    };
    
    const configItem = config[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700' };
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
    payerClearanceRequests = [],
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
    clearanceTypesDetails = []
}: AddFeesStepProps) {
    
    // ========== DEBUG LOGS ==========
    console.log('🔍 ========== ADD FEES STEP RENDERED ==========');
    console.log('🔍 Props received:', {
        payerClearanceRequestsCount: payerClearanceRequests?.length || 0,
        payerOutstandingFeesCount: payerOutstandingFees?.length || 0,
        paymentItemsCount: paymentItems?.length || 0,
        data: {
            payer_type: data.payer_type,
            payer_name: data.payer_name,
            payer_id: data.payer_id
        }
    });

    // Debug log for paymentItems changes
    useEffect(() => {
        console.log('📦 AddFeesStep - paymentItems updated:', {
            count: paymentItems.length,
            items: paymentItems.map(item => ({
                id: item.id,
                name: item.fee_name,
                isClearance: item.metadata?.is_clearance_fee === true || item.category === 'clearance',
                amount: item.total_amount,
                category: item.category
            }))
        });
    }, [paymentItems]);

    // Log each clearance request in detail
    if (payerClearanceRequests && payerClearanceRequests.length > 0) {
        console.log('📋 Clearance requests details:', payerClearanceRequests.map(cr => ({
            id: cr.id,
            reference: cr.reference_number,
            amount: cr.fee_amount,
            status: cr.status,
            type: cr.clearance_type?.name,
            resident: cr.resident?.name
        })));
    } else {
        console.log('❌ No clearance requests received in props');
    }

    if (payerOutstandingFees && payerOutstandingFees.length > 0) {
        console.log('📋 Outstanding fees details:', payerOutstandingFees.map(fee => ({
            id: fee.id,
            code: fee.fee_code,
            amount: fee.balance,
            status: fee.status
        })));
    }

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddingFee, setIsAddingFee] = useState<boolean>(false);
    const [addingFeeId, setAddingFeeId] = useState<string | number | null>(null);
    const [activeTab, setActiveTab] = useState<string>('clearances');
    
    const isFeeAlreadyAdded = useCallback((feeId: string | number) => {
        const stringFeeId = String(feeId);
        return paymentItems.some(item => String(item.fee_id) === stringFeeId);
    }, [paymentItems]);

    const isClearanceAlreadyAdded = useCallback((clearanceId: string | number) => {
        return paymentItems.some(item => 
            item.metadata?.clearance_request_id === clearanceId
        );
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
        safeAddFee(fee);
    };

    const handleSelectClearance = (clearance: ClearanceRequest) => {
        if (!onAddClearanceRequest) {
            alert('Clearance request handler not available');
            return;
        }

        if (isClearanceAlreadyAdded(clearance.id)) {
            alert('This clearance request is already added to your payment.');
            return;
        }

        console.log('📋 Adding clearance:', clearance);
        onAddClearanceRequest(clearance);
    };
    
    const totalSelectedAmount = React.useMemo(() => {
        return paymentItems.reduce((total, item) => total + parseCurrencyString(item.total_amount), 0);
    }, [paymentItems]);
    
    // Filtered clearance requests
    const filteredClearances = React.useMemo(() => {
        if (!payerClearanceRequests) return [];
        
        return payerClearanceRequests
            .filter(cr => {
                if (cr.already_paid) return false;
                if (parseFloat(String(cr.fee_amount)) <= 0) return false;
                
                // Apply search query
                if (!searchQuery) return true;
                
                const query = searchQuery.toLowerCase();
                return (
                    cr.reference_number?.toLowerCase().includes(query) ||
                    cr.clearance_type?.name?.toLowerCase().includes(query) ||
                    cr.purpose?.toLowerCase().includes(query) ||
                    cr.resident?.name?.toLowerCase().includes(query)
                );
            })
            .map(cr => ({
                ...cr,
                isAdded: isClearanceAlreadyAdded(cr.id)
            }));
    }, [payerClearanceRequests, searchQuery, isClearanceAlreadyAdded]);

    // Filtered fees
    const filteredFees = React.useMemo(() => {
        return payerOutstandingFees
            .filter(fee => {
                if (parseFloat(fee.balance) <= 0) return false;
                
                // Apply search query
                if (!searchQuery) return true;
                
                const query = searchQuery.toLowerCase();
                return (
                    fee.fee_code.toLowerCase().includes(query) ||
                    fee.fee_type_name?.toLowerCase().includes(query) ||
                    fee.purpose?.toLowerCase().includes(query) ||
                    fee.business_name?.toLowerCase().includes(query) ||
                    fee.reference_number?.toLowerCase().includes(query)
                );
            })
            .map(fee => ({
                ...fee,
                isAdded: isFeeAlreadyAdded(fee.id)
            }));
    }, [payerOutstandingFees, searchQuery, isFeeAlreadyAdded]);
    
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
    
    const clearanceCount = filteredClearances.length;
    const feesCount = filteredFees.length;
    
    // Handle tab change without triggering form validation
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Don't trigger any form submission or validation
    };
    
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                {getPayerTypeIcon(data.payer_type)}
                            </div>
                            Payer Information
                            {(isBusinessMode || isFeePayment || isClearanceMode) && (
                                <Badge variant="outline" className={`text-xs ${
                                    isBusinessMode ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                    isFeePayment ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                }`}>
                                    {isBusinessMode ? 'Business' : isFeePayment ? 'Fee' : 'Clearance'}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Name</Label>
                                <div className="font-medium truncate dark:text-gray-200">{data.payer_name || 'Juan Dela Cruz Sr.'}</div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Contact</Label>
                                <div className="font-medium flex items-center gap-1 dark:text-gray-200">
                                    <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    {data.contact_number || '09171234567'}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Address</Label>
                            <div className="font-medium flex items-center gap-1 text-sm dark:text-gray-200">
                                <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                <span className="truncate">{data.address || '24158 Catherine Plain'}</span>
                            </div>
                        </div>
                        
                        {data.purok && (
                            <div>
                                <Label className="text-xs text-gray-500 dark:text-gray-400">Purok</Label>
                                <div className="font-medium dark:text-gray-200">{data.purok || 'West Kibawe'}</div>
                            </div>
                        )}
                        
                        <Separator className="my-2 dark:bg-gray-700" />
                        
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs dark:text-gray-400 dark:hover:text-white"
                            onClick={handleBack}
                        >
                            Change Payer
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column - Payable Items with Tabs */}
            <div className="lg:col-span-1">
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                    <FileCheck className="h-3 w-3 text-white" />
                                </div>
                                Payable Items
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {clearanceCount > 0 && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        {clearanceCount} clearance
                                    </Badge>
                                )}
                                {feesCount > 0 && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                        {feesCount} fees
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardDescription className="text-xs dark:text-gray-400">
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

                        <div className="mb-3 space-y-2">
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={`Search ${activeTab}...`}
                                    className="pl-8 h-8 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {/* Tabs - with type="button" to prevent form submission */}
                            <Tabs defaultValue="clearances" value={activeTab} onValueChange={handleTabChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="clearances" className="flex items-center gap-1" type="button">
                                        <FileBadge className="h-3.5 w-3.5" />
                                        Clearances
                                        {clearanceCount > 0 && (
                                            <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 rounded-full">
                                                {clearanceCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="fees" className="flex items-center gap-1" type="button">
                                        <Receipt className="h-3.5 w-3.5" />
                                        Fees
                                        {feesCount > 0 && (
                                            <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 rounded-full">
                                                {feesCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="clearances" className="mt-3">
                                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                        {filteredClearances.length > 0 ? (
                                            filteredClearances.map((cr) => (
                                                <div
                                                    key={`clearance-${cr.id}`}
                                                    className={`p-2 border rounded-md text-sm transition-all ${
                                                        cr.isAdded ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-60' :
                                                        'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer'
                                                    }`}
                                                    onClick={() => !cr.isAdded && handleSelectClearance(cr)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <FileBadge className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                                <span className="font-medium truncate text-xs dark:text-gray-200">
                                                                    {cr.clearance_type?.name || 'Barangay Clearance'}
                                                                </span>
                                                                <div className="flex gap-0.5">
                                                                    {getStatusBadge(cr.status)}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span className="truncate">{cr.reference_number}</span>
                                                                {cr.resident?.name && (
                                                                    <span className="truncate text-purple-600 dark:text-purple-400">
                                                                        {cr.resident.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {cr.purpose && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                                    {cr.purpose}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                                                                    {formatCurrency(parseFloat(String(cr.fee_amount)))}
                                                                </div>
                                                            </div>
                                                            
                                                            {!cr.isAdded ? (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 px-2 text-xs text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectClearance(cr);
                                                                    }}
                                                                >
                                                                    Add
                                                                </Button>
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 border rounded-md dark:border-gray-700">
                                                <FileSearch className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {searchQuery ? 'No clearance requests match your search' : 'No clearance requests available'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="fees" className="mt-3">
                                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                        {filteredFees.length > 0 ? (
                                            filteredFees.map((fee) => {
                                                const correctedBalance = getCorrectedBalance(fee);
                                                const isAdding = addingFeeId === fee.id;
                                                
                                                return (
                                                    <div
                                                        key={`fee-${fee.id}`}
                                                        className={`p-2 border rounded-md text-sm transition-all ${
                                                            fee.isAdded ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-60' :
                                                            'hover:border-primary dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer border-gray-200 dark:border-gray-700'
                                                        }`}
                                                        onClick={() => !fee.isAdded && !isAdding && handleSelectFee(fee)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                    {getCategoryIcon(fee.fee_type_category || fee.category || 'other')}
                                                                    <span className="font-medium truncate text-xs dark:text-gray-200">
                                                                        {fee.fee_type_name || fee.fee_type?.name || 'Fee'}
                                                                    </span>
                                                                    <div className="flex gap-0.5">
                                                                        {getStatusBadge(fee.status)}
                                                                        {isFutureFee(fee) && (
                                                                            <Badge className="text-xs px-1 py-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                                Future
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="truncate">{fee.fee_code}</span>
                                                                    {fee.reference_number && (
                                                                        <span className="truncate text-purple-600 dark:text-purple-400">#{fee.reference_number}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <div className="text-right">
                                                                    <div className="text-sm font-bold text-primary dark:text-blue-400">
                                                                        {formatCurrency(correctedBalance)}
                                                                    </div>
                                                                </div>
                                                                
                                                                {!fee.isAdded ? (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 px-2 text-xs dark:text-gray-400 dark:hover:text-white"
                                                                        disabled={isAdding || isAddingFee}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectFee(fee);
                                                                        }}
                                                                    >
                                                                        {isAdding ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            'Add'
                                                                        )}
                                                                    </Button>
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-6 border rounded-md dark:border-gray-700">
                                                <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {searchQuery ? 'No fees match your search' : 'No fees available'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Selected Items */}
            <div className="lg:col-span-1">
                <Card className="dark:bg-gray-900">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                    <Calculator className="h-3 w-3 text-white" />
                                </div>
                                Selected
                            </CardTitle>
                            {paymentItems.length > 0 && (
                                <Badge className="dark:bg-gray-700 dark:text-gray-300">{paymentItems.length}</Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs dark:text-gray-400">
                            Review items before payment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {paymentItems.length === 0 ? (
                            <div className="text-center py-6 border rounded-md dark:border-gray-700">
                                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No items selected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                    {paymentItems.map((item) => {
                                        // Properly identify clearance items
                                        const isClearanceFee = item.metadata?.is_clearance_fee === true || item.category === 'clearance';
                                        const isBusinessFee = item.metadata?.is_business_fee === true || item.category === 'business';
                                        const itemTotal = parseCurrencyString(item.total_amount);
                                        
                                        return (
                                            <div key={item.id} className={`p-2 border rounded-md ${
                                                isClearanceFee ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 
                                                isBusinessFee ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                                                'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            {isClearanceFee ? (
                                                                <FileBadge className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                            ) : isBusinessFee ? (
                                                                <Building className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                            ) : (
                                                                getCategoryIcon(item.category)
                                                            )}
                                                            <span className="font-medium text-xs truncate dark:text-gray-200">{item.fee_name}</span>
                                                            {isClearanceFee && item.metadata?.reference_number && (
                                                                <Badge variant="outline" className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                                                    #{item.metadata.reference_number}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {item.fee_code}
                                                        </div>
                                                        {isClearanceFee && item.metadata?.clearance_type_id && (
                                                            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                                                                Clearance Request
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Allow removal for all items, including clearance */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400"
                                                        onClick={() => removePaymentItem(item.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-1 pt-1 border-t dark:border-gray-700 text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                                    <span className="font-bold text-primary dark:text-blue-400">{formatCurrency(itemTotal)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="pt-2 border-t dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-3 text-sm">
                                        <span className="font-medium dark:text-gray-300">Total Amount:</span>
                                        <span className="text-lg font-bold text-primary dark:text-blue-400">
                                            {formatCurrency(totalSelectedAmount)}
                                        </span>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
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