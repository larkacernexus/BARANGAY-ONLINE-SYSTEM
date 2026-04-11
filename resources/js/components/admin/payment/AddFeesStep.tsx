// resources/js/components/admin/payment/AddFeesStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Package, User, Users, Home, Building, UserCircle, ChevronRight, DollarSign, FileCheck, Shield, FileText, AlertTriangle, Receipt, Search, CheckCircle, Phone, MapPin, FileSearch, FileBadge, Loader2, X, Plus, Info } from 'lucide-react';

import { ResidentAvatar } from './ResidentAvatar';

import {
    PaymentFormData,
    PaymentItem,
    OutstandingFee,
    ClearanceRequest,
    FeeType
} from '@/types/admin/payments/payments';

import { LatePaymentSettings } from './LatePaymentSettings';

// ========== PROPS INTERFACE ==========
interface AddFeesStepProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    removePaymentItem: (id: string | number) => void;
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
    clearanceTypes?: Record<string, string>;
    clearanceTypesDetails?: any[];
}

// ========== HELPER FUNCTIONS ==========
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
    if (!fee.period_covered) return false;
    return false;
}

const getCorrectedBalance = (fee: OutstandingFee): number => {
    // For pending and pending_payment fees, use the balance field
    if (fee.status === 'pending' || fee.status === 'pending_payment') {
        const balance = parseCurrencyString(fee.balance);
        return Math.max(0, parseFloat(balance.toFixed(2)));
    }
    
    const balanceFromDB = parseCurrencyString(fee.balance);
    if (balanceFromDB >= 0) return parseFloat(balanceFromDB.toFixed(2));
    
    const base = parseCurrencyString(fee.base_amount);
    const totalFromFee = parseCurrencyString(fee.total_amount);
    
    const totalAmount = totalFromFee > 0 ? totalFromFee : base;
    return Math.max(0, parseFloat(totalAmount.toFixed(2)));
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
        'fee': Receipt,
        'other': Receipt
    };
    const IconComponent = icons[category] || Receipt;
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
        'pending_payment': { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
        'pending': { label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
        'partially_paid': { label: 'Partial', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
        'paid': { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
        'overdue': { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    };
    
    const configItem = config[status] || { label: status.replace('_', ' '), color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' };
    return (
        <Badge className={`text-xs px-1.5 py-0 ${configItem.color}`}>
            {configItem.label}
        </Badge>
    );
};

export function AddFeesStep({
    data,
    setData,
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
    
    // ========== STATE ==========
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddingFee, setIsAddingFee] = useState<boolean>(false);
    const [addingFeeId, setAddingFeeId] = useState<string | number | null>(null);
    const [activeTab, setActiveTab] = useState<string>(() => {
        const hasClearances = payerClearanceRequests && payerClearanceRequests.length > 0;
        const hasFees = payerOutstandingFees && payerOutstandingFees.length > 0;
        
        if (hasClearances && !hasFees) return 'clearances';
        if (hasFees && !hasClearances) return 'fees';
        
        return hasClearances ? 'clearances' : 'fees';
    });
    
    // ========== DEBUG: Log received fees ==========
    useEffect(() => {
        console.log('🔍 ========== FEES RECEIVED FROM BACKEND ==========');
        console.log('Total fees count:', payerOutstandingFees?.length);
        console.log('Raw fees data:', payerOutstandingFees);
        
        if (payerOutstandingFees && payerOutstandingFees.length > 0) {
            console.log('Fees by status:', payerOutstandingFees.reduce((acc, fee) => {
                acc[fee.status] = (acc[fee.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>));
            
            console.log('Pending payment fees:', payerOutstandingFees.filter(f => f.status === 'pending_payment'));
            console.log('Pending fees:', payerOutstandingFees.filter(f => f.status === 'pending'));
            console.log('Paid fees:', payerOutstandingFees.filter(f => f.status === 'paid'));
            
            // Log first fee details
            if (payerOutstandingFees[0]) {
                console.log('Sample fee:', {
                    id: payerOutstandingFees[0].id,
                    fee_code: payerOutstandingFees[0].fee_code,
                    status: payerOutstandingFees[0].status,
                    balance: payerOutstandingFees[0].balance,
                    total_amount: payerOutstandingFees[0].total_amount
                });
            }
        } else {
            console.log('❌ No fees received from backend!');
        }
    }, [payerOutstandingFees]);
    
    // ========== MEMOIZED VALUES ==========
    const isFeeAlreadyAdded = useCallback((feeId: string | number) => {
        const stringFeeId = String(feeId);
        return paymentItems.some(item => String(item.fee_id) === stringFeeId);
    }, [paymentItems]);

    const isClearanceAlreadyAdded = useCallback((clearanceId: string | number) => {
        return paymentItems.some(item => 
            item.metadata?.clearance_request_id === clearanceId
        );
    }, [paymentItems]);
    
    const totalSelectedAmount = useMemo(() => {
        return paymentItems.reduce((total, item) => total + parseCurrencyString(item.total_amount), 0);
    }, [paymentItems]);
    
    const filteredClearances = useMemo(() => {
        if (!payerClearanceRequests || payerClearanceRequests.length === 0) return [];
        
        return payerClearanceRequests
            .filter(cr => {
                if (cr.already_paid) return false;
                const feeAmount = parseFloat(String(cr.fee_amount));
                if (feeAmount <= 0) return false;
                
                if (isClearanceAlreadyAdded(cr.id)) return false;
                
                if (!searchQuery) return true;
                
                const query = searchQuery.toLowerCase();
                return (
                    cr.reference_number?.toLowerCase().includes(query) ||
                    cr.clearance_type?.name?.toLowerCase().includes(query) ||
                    cr.clearance_type?.code?.toLowerCase().includes(query) ||
                    cr.purpose?.toLowerCase().includes(query) ||
                    cr.specific_purpose?.toLowerCase().includes(query) ||
                    cr.resident?.name?.toLowerCase().includes(query)
                );
            });
    }, [payerClearanceRequests, searchQuery, isClearanceAlreadyAdded]);

    const filteredFees = useMemo(() => {
        if (!payerOutstandingFees || payerOutstandingFees.length === 0) return [];
        
        console.log('🔍 Filtering fees. Total before filter:', payerOutstandingFees.length);
        
        const filtered = payerOutstandingFees
            .filter(fee => {
                // Calculate the actual amount that can be paid
                let payableAmount = 0;
                
                // For pending/pending_payment, use balance
                if (fee.status === 'pending' || fee.status === 'pending_payment') {
                    payableAmount = parseCurrencyString(fee.balance);
                    console.log(`Fee ${fee.id} (${fee.status}) - balance: ${fee.balance}, payable: ${payableAmount}`);
                } 
                // For paid fees, skip them
                else if (fee.status === 'paid') {
                    console.log(`Fee ${fee.id} is paid, skipping`);
                    return false;
                }
                // For other statuses, use balance or calculate from total
                else {
                    payableAmount = parseCurrencyString(fee.balance);
                    if (payableAmount <= 0) {
                        const total = parseCurrencyString(fee.total_amount);
                        const paid = parseCurrencyString(fee.amount_paid);
                        payableAmount = Math.max(0, total - paid);
                    }
                    console.log(`Fee ${fee.id} (${fee.status}) - payable: ${payableAmount}`);
                }
                
                // Skip if nothing to pay
                if (payableAmount <= 0) {
                    console.log(`Fee ${fee.id} has no payable amount, skipping`);
                    return false;
                }
                
                // Skip if already added
                if (isFeeAlreadyAdded(fee.id)) {
                    console.log(`Fee ${fee.id} already added, skipping`);
                    return false;
                }
                
                // Apply search filter
                if (!searchQuery) return true;
                
                const query = searchQuery.toLowerCase();
                return (
                    fee.fee_code?.toLowerCase().includes(query) ||
                    fee.fee_name?.toLowerCase().includes(query) ||
                    fee.category?.toLowerCase().includes(query)
                );
            });
        
        console.log('🔍 Filtered fees result:', filtered.length, 'fees');
        console.log('Filtered fees details:', filtered.map(f => ({ id: f.id, status: f.status, balance: f.balance })));
        
        return filtered;
    }, [payerOutstandingFees, searchQuery, isFeeAlreadyAdded]);
    
    // Debug filtered fees changes
    useEffect(() => {
        console.log('🔍 ========== FILTERED FEES UPDATED ==========');
        console.log('Filtered fees count:', filteredFees.length);
        console.log('Filtered fees:', filteredFees.map(f => ({ id: f.id, status: f.status, fee_code: f.fee_code, balance: f.balance })));
        console.log('Search query:', searchQuery);
        console.log('Active tab:', activeTab);
    }, [filteredFees, searchQuery, activeTab]);
    
    // ========== FIXED: Get resident data for avatar from data prop ==========
    const residentForAvatar = useMemo(() => {
        console.log('🔍 AddFeesStep - Building residentForAvatar...');
        console.log('📊 data.payer_type:', data.payer_type);
        console.log('📊 data.photo_path:', data.photo_path);
        console.log('📊 data.photo_url:', data.photo_url);
        
        // Only for resident payer type
        if (data.payer_type !== 'resident') {
            console.log('❌ Not a resident payer type, skipping avatar');
            return null;
        }
        
        // Get photo from data first (passed from parent)
        let photoPath = (data as any).photo_path;
        let photoUrl = (data as any).photo_url;
        
        // If no photo in data, try selectedFeeDetails
        if (!photoPath && selectedFeeDetails?.resident_discount_info) {
            console.log('📸 Found photo in selectedFeeDetails.resident_discount_info');
            photoPath = selectedFeeDetails.resident_discount_info.photo_path;
            photoUrl = selectedFeeDetails.resident_discount_info.photo_url;
        }
        
        // If still no photo, try clearanceRequest
        if (!photoPath && clearanceRequest?.resident) {
            console.log('📸 Found photo in clearanceRequest.resident');
            photoPath = clearanceRequest.resident.photo_path;
            photoUrl = clearanceRequest.resident.photo_url;
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
            id: Number(data.payer_id),
            name: data.payer_name,
            photo_path: photoPath,
            photo_url: fullPhotoUrl
        };
        
        console.log('🎯 Final residentForAvatar:', residentData);
        console.log('🖼️ Will load image from:', fullPhotoUrl);
        
        return residentData;
    }, [data.payer_type, data.payer_id, data.payer_name, (data as any).photo_path, (data as any).photo_url, selectedFeeDetails, clearanceRequest]);
    
    // ========== HANDLERS ==========
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
            alert('Failed to add fee. Please try again.');
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

        onAddClearanceRequest(clearance);
    };
    
    const handleContinue = () => {
        if (paymentItems.length === 0) {
            alert('Please add at least one fee to pay.');
            return;
        }
        setStep(3);
    };
    
    const handleBack = () => setStep(1);
    
    // ========== COMPUTED VALUES ==========
    const isBusinessMode = data.payer_type === 'business' || payerSource === 'businesses';
    const isFeePayment = payerSource === 'fees' || !!pre_filled_data?.fee_id;
    const isClearanceMode = isClearancePayment && payerSource !== 'fees';
    
    const clearanceCount = filteredClearances.length;
    const feesCount = filteredFees.length;
    
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchQuery('');
    };
    
    // ========== RENDER ==========
    return (
        <div className="space-y-4">
            {/* Payer Information Header - with Avatar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-100 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        {/* Show Resident Avatar for residents */}
                        {data.payer_type === 'resident' && residentForAvatar ? (
                            <ResidentAvatar 
                                resident={residentForAvatar} 
                                size="lg"
                                className="flex-shrink-0 shadow-sm"
                            />
                        ) : data.payer_type === 'resident' && !residentForAvatar ? (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                                <User className="h-6 w-6 text-white" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-sm">
                                {getPayerTypeIcon(data.payer_type)}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{data.payer_name || 'N/A'}</h3>
                                {(isBusinessMode || isFeePayment || isClearanceMode) && (
                                    <Badge variant="outline" className={`text-xs ${
                                        isBusinessMode ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                        isFeePayment ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                        'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                    }`}>
                                        {isBusinessMode ? 'Business' : isFeePayment ? 'Fee Payment' : 'Clearance'}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {data.contact_number || 'N/A'}
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {data.address || 'N/A'}
                                </span>
                                {data.purok && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">|</span>
                                        <span>Purok {data.purok}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        onClick={handleBack}
                    >
                        Change Payer
                    </Button>
                </div>
            </div>

            {/* Rest of the component remains the same */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Payable Items */}
                <div className="lg:col-span-1">
                    <Card className="dark:bg-gray-900 shadow-sm">
                        <CardHeader className="pb-3 border-b dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center shadow-sm">
                                            <FileCheck className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        Payable Items
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 dark:text-gray-400">
                                        {isBusinessMode ? "Select business fees to pay" : 
                                         isFeePayment ? "Select additional fees (optional)" : 
                                         isClearanceMode ? "Select additional fees (optional)" : 
                                         "Select items to pay"}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {clearanceCount > 0 && (
                                        <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                                            {clearanceCount} clearance{clearanceCount !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                    {feesCount > 0 && (
                                        <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                            {feesCount} fee{feesCount !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {showLateSettings && selectedFee && (
                                <div className="mb-4">
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

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={`Search ${activeTab === 'clearances' ? 'clearance requests' : 'fees'}...`}
                                    className="pl-9 h-9 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="clearances" className="flex items-center gap-2 text-sm" type="button">
                                        <FileBadge className="h-4 w-4" />
                                        Clearances
                                        {clearanceCount > 0 && (
                                            <span className="ml-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 px-1.5 rounded-full">
                                                {clearanceCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="fees" className="flex items-center gap-2 text-sm" type="button">
                                        <Receipt className="h-4 w-4" />
                                        Fees
                                        {feesCount > 0 && (
                                            <span className="ml-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-1.5 rounded-full">
                                                {feesCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="clearances" className="mt-0">
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                        {filteredClearances.length > 0 ? (
                                            filteredClearances.map((cr) => (
                                                <div
                                                    key={`clearance-${cr.id}`}
                                                    className="group p-3 border rounded-lg text-sm transition-all bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm cursor-pointer"
                                                    onClick={() => handleSelectClearance(cr)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FileBadge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                <span className="font-medium text-sm truncate dark:text-gray-200">
                                                                    {cr.clearance_type?.name || 'Barangay Clearance'}
                                                                </span>
                                                                {getStatusBadge(cr.status)}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                <span className="truncate font-mono">{cr.reference_number}</span>
                                                                {cr.resident?.name && (
                                                                    <>
                                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                        <span className="truncate text-purple-600 dark:text-purple-400">
                                                                            {cr.resident.name}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            
                                                            {cr.purpose && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {cr.purpose}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 ml-3">
                                                            <div className="text-right">
                                                                <div className="text-base font-bold text-purple-700 dark:text-purple-400">
                                                                    {formatCurrency(parseFloat(String(cr.fee_amount)))}
                                                                </div>
                                                            </div>
                                                            
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectClearance(cr);
                                                                }}
                                                            >
                                                                <Plus className="h-3.5 w-3.5 mr-1" />
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                                {searchQuery ? (
                                                    <>
                                                        <FileSearch className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">No clearance requests match your search</p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-3"
                                                            onClick={() => setSearchQuery('')}
                                                        >
                                                            Clear search
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No pending clearance requests</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All clearances have been processed</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="fees" className="mt-0">
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                        {filteredFees.length > 0 ? (
                                            filteredFees.map((fee) => {
                                                const correctedBalance = getCorrectedBalance(fee);
                                                const isAdding = addingFeeId === fee.id;
                                                
                                                return (
                                                    <div
                                                        key={`fee-${fee.id}`}
                                                        className="group p-3 border rounded-lg text-sm transition-all hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-sm cursor-pointer border-gray-200 dark:border-gray-700"
                                                        onClick={() => !isAdding && handleSelectFee(fee)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {getCategoryIcon(fee.category || 'fee')}
                                                                    <span className="font-medium text-sm truncate dark:text-gray-200">
                                                                        {fee.fee_name || fee.fee_code}
                                                                    </span>
                                                                    {getStatusBadge(fee.status)}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="truncate font-mono">{fee.fee_code}</span>
                                                                    {fee.period_covered && (
                                                                        <>
                                                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                            <span className="truncate">{fee.period_covered}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3 ml-3">
                                                                <div className="text-right">
                                                                    <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                                        {formatCurrency(correctedBalance)}
                                                                    </div>
                                                                </div>
                                                                
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                                                    disabled={isAdding || isAddingFee}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectFee(fee);
                                                                    }}
                                                                >
                                                                    {isAdding ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Plus className="h-3.5 w-3.5 mr-1" />
                                                                            Add
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                                {searchQuery ? (
                                                    <>
                                                        <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">No fees match your search</p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-3"
                                                            onClick={() => setSearchQuery('')}
                                                        >
                                                            Clear search
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No outstanding fees</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All fees have been paid</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Selected Items */}
                <div className="lg:col-span-1">
                    <Card className="dark:bg-gray-900 shadow-sm h-full">
                        <CardHeader className="pb-3 border-b dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center shadow-sm">
                                            <Calculator className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        Selected Items
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 dark:text-gray-400">
                                        Review items before payment
                                    </CardDescription>
                                </div>
                                {paymentItems.length > 0 && (
                                    <Badge className="text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 px-2 py-1">
                                        {paymentItems.length} item{paymentItems.length !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {paymentItems.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No items selected</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Select items from the list to add them here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                        {paymentItems.map((item) => {
                                            const isClearanceFee = item.metadata?.is_clearance_fee === true || item.category === 'clearance';
                                            const isBusinessFee = item.metadata?.is_business_fee === true || item.category === 'business';
                                            const itemTotal = parseCurrencyString(item.total_amount);
                                            
                                            return (
                                                <div key={item.id} className={`p-3 rounded-lg border ${
                                                    isClearanceFee ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 
                                                    isBusinessFee ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 
                                                    'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {isClearanceFee ? (
                                                                    <FileBadge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                ) : isBusinessFee ? (
                                                                    <Building className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                                ) : (
                                                                    getCategoryIcon(item.category)
                                                                )}
                                                                <span className="font-medium text-sm truncate dark:text-gray-200">{item.fee_name}</span>
                                                                {isClearanceFee && item.metadata?.reference_number && (
                                                                    <Badge variant="outline" className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                                                                        #{item.metadata.reference_number}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                                                                {item.fee_code}
                                                            </div>
                                                            {isClearanceFee && item.metadata?.clearance_type_id && (
                                                                <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
                                                                    Clearance Request
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400"
                                                            onClick={() => removePaymentItem(item.id)}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(itemTotal)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-base font-semibold dark:text-gray-300">Total Amount:</span>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
                                                {formatCurrency(totalSelectedAmount)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 h-10 dark:border-gray-600 dark:text-gray-300"
                                                onClick={handleBack}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                                                onClick={handleContinue}
                                            >
                                                Continue
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}