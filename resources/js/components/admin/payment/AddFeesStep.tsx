import React, { useState, useEffect } from 'react';
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
    Plus,
    AlertCircle,
    Phone,
    MapPin,
    Hash,
    Clock,
    FileSearch,
    CreditCard,
    Info
} from 'lucide-react';

// Import the LatePaymentSettings component
import { LatePaymentSettings } from './LatePaymentSettings';

// Updated Interfaces
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
    due_date: string;
    issue_date?: string;
    base_amount: string;
    surcharge_amount?: string;
    penalty_amount: string;
    discount_amount?: string;
    total_amount: string;
    amount_paid: string;
    balance: string;
    status: string;
    purpose?: string;
    fee_type_name?: string;
    fee_type_category?: string;
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
        original_surcharge: number;
        original_penalty: number;
        additional_surcharge: number;
        additional_penalty: number;
        is_late_payment: boolean;
        original_total: number;
        is_future_fee: boolean;
        data_warning: boolean;
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
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
}

interface PrefilledFee {
    id?: string | number;
    fee_id?: string | number;
    fee_name?: string;
    fee_code?: string;
    fee_type?: FeeType;
    payer_type?: string;
    payer_id?: string | number;
    payer_name?: string;
    contact_number?: string;
    address?: string;
    house_number?: string;
    purok?: string;
    total_amount?: number;
    amount_paid?: number;
    balance?: number;
    status?: string;
    description?: string;
    is_clearance_fee?: boolean;
    clearance_request_id?: string | number;
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

// Props interface - UPDATED
interface AddFeesStepProps {
    data: PaymentFormData;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    removePaymentItem: (id: number) => void;
    prefilledFee?: PrefilledFee;
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
    
    // Other props - UPDATED
    feeTypes?: FeeType[];
    dataWarnings?: string[];
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    clearanceFeeType?: any;
}

// Helper functions
function formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function parseCurrencyString(amountString: string): number {
    if (!amountString || amountString.trim() === '') return 0;
    const parsed = parseFloat(amountString.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
}

// Check if date is valid
function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Check if fee is a future fee
function isFutureFee(fee: OutstandingFee): boolean {
    if (!isValidDate(fee.due_date)) return false;
    const dueDate = new Date(fee.due_date);
    const today = new Date();
    return dueDate > today;
}

const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
        'tax': DollarSign,
        'clearance': FileCheck,
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
        'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
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
    prefilledFee,
    payerOutstandingFees,
    
    // Late payment modal props
    selectedFee,
    showLateSettings,
    isLatePayment,
    setIsLatePayment,
    monthsLate,
    setMonthsLate,
    
    // Event handlers
    onFeeClick,
    onAddWithLateSettings,
    onCancelLateSettings,
    onDirectAddFee,
    
    // Other props - UPDATED
    feeTypes = [],
    dataWarnings = [],
    isClearancePayment = false,
    clearanceRequest = null,
    clearanceFeeType = null
}: AddFeesStepProps) {
    
    // State for filtering
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showClearanceInfo, setShowClearanceInfo] = useState<boolean>(isClearancePayment);
    
    // Check if fee is already added
    const isFeeAlreadyAdded = (feeId: string | number) => {
        return paymentItems.some(item => item.fee_id === feeId);
    };
    
    // Auto-add prefilled fee on component mount
    useEffect(() => {
        if (prefilledFee && !prefilledFee.is_clearance_fee && paymentItems.length === 0) {
            // Create a payment item from prefilled fee data
            const feeItem: PaymentItem = {
                id: Date.now(),
                fee_id: prefilledFee.id || prefilledFee.fee_id || Date.now(),
                fee_name: prefilledFee.fee_name || 'Fee',
                fee_code: prefilledFee.fee_code || 'FEE',
                base_amount: prefilledFee.balance || prefilledFee.total_amount || 0,
                penalty: 0,
                total_amount: prefilledFee.balance || prefilledFee.total_amount || 0,
                category: prefilledFee.fee_type?.category || 'other',
                surcharge: 0,
                discount: 0,
                metadata: {
                    original_surcharge: 0,
                    original_penalty: 0,
                    additional_surcharge: 0,
                    additional_penalty: 0,
                    is_late_payment: false,
                    original_total: prefilledFee.balance || prefilledFee.total_amount || 0,
                    is_future_fee: false,
                    data_warning: false
                }
            };
            
            if (onDirectAddFee) {
                // Create a temporary OutstandingFee object for compatibility
                const tempFee: OutstandingFee = {
                    id: prefilledFee.id || prefilledFee.fee_id || Date.now(),
                    fee_type_id: prefilledFee.fee_type?.id || 0,
                    fee_code: prefilledFee.fee_code || 'FEE',
                    payer_name: prefilledFee.payer_name || data.payer_name,
                    due_date: new Date().toISOString().split('T')[0],
                    base_amount: (prefilledFee.balance || prefilledFee.total_amount || 0).toString(),
                    penalty_amount: '0',
                    discount_amount: '0',
                    surcharge_amount: '0',
                    total_amount: (prefilledFee.balance || prefilledFee.total_amount || 0).toString(),
                    amount_paid: '0',
                    balance: (prefilledFee.balance || prefilledFee.total_amount || 0).toString(),
                    status: 'issued',
                    purpose: prefilledFee.description || prefilledFee.fee_name || 'Fee Payment',
                    fee_type: prefilledFee.fee_type,
                    fee_type_name: prefilledFee.fee_type?.name,
                    fee_type_category: prefilledFee.fee_type?.category
                };
                
                onDirectAddFee(tempFee);
            }
        }
    }, [prefilledFee]);
    
    // Calculate total outstanding balance (with correct penalty logic)
    const totalOutstandingBalance = payerOutstandingFees.reduce((total, fee) => {
        const base = parseCurrencyString(fee.base_amount);
        const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
        const penalty = isFutureFee(fee) ? 0 : parseCurrencyString(fee.penalty_amount);
        const discount = parseCurrencyString(fee.discount_amount || '0');
        
        const correctedBalance = base + surcharge + penalty - discount;
        return total + correctedBalance;
    }, 0);
    
    // Calculate total selected amount
    const totalSelectedAmount = paymentItems.reduce((total, item) => {
        return total + item.total_amount;
    }, 0);
    
    // Filter outstanding fees
    const filteredFees = payerOutstandingFees.filter(fee => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            fee.fee_code.toLowerCase().includes(query) ||
            (fee.fee_type?.name && fee.fee_type.name.toLowerCase().includes(query)) ||
            (fee.fee_type_name && fee.fee_type_name.toLowerCase().includes(query)) ||
            (fee.purpose && fee.purpose.toLowerCase().includes(query))
        );
    });
    
    // Calculate corrected balance for a fee (removes penalty if future fee)
    const getCorrectedBalance = (fee: OutstandingFee): number => {
        const isFuture = isFutureFee(fee);
        const base = parseCurrencyString(fee.base_amount);
        const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
        const penalty = isFuture ? 0 : parseCurrencyString(fee.penalty_amount);
        const discount = parseCurrencyString(fee.discount_amount || '0');
        
        return base + surcharge + penalty - discount;
    };
    
    // Check if fee has data integrity issues
    const hasDataIssue = (fee: OutstandingFee): boolean => {
        return isFutureFee(fee) && parseCurrencyString(fee.penalty_amount) > 0;
    };
    
    // Handle fee selection
    const handleSelectFee = (fee: OutstandingFee) => {
        if (isFeeAlreadyAdded(fee.id)) {
            return;
        }
        
        // Use parent's onDirectAddFee function
        if (onDirectAddFee) {
            onDirectAddFee(fee);
        }
    };
    
    // Handle continue to payment
    const handleContinue = () => {
        if (paymentItems.length === 0) {
            alert('Please add at least one fee to pay.');
            return;
        }
        setStep(3);
    };
    
    // Handle back to payer selection
    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getPayerTypeIcon(data.payer_type)}
                            Payer Information
                            {isClearancePayment && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    Clearance
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Payer Information */}
                        <div>
                            <Label className="text-sm text-gray-500">Payer Name</Label>
                            <div className="font-medium">{data.payer_name}</div>
                        </div>
                        
                        {/* Contact and Household Number */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm text-gray-500">Contact</Label>
                                <div className="font-medium flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {data.contact_number || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Household #</Label>
                                <div className="font-medium flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    {data.household_number || 'N/A'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Address */}
                        <div>
                            <Label className="text-sm text-gray-500">Address</Label>
                            <div className="font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {data.address || 'N/A'}
                            </div>
                        </div>
                        
                        {/* Purok (if available) */}
                        {data.purok && (
                            <div>
                                <Label className="text-sm text-gray-500">Purok</Label>
                                <div className="font-medium">{data.purok}</div>
                            </div>
                        )}
                        
                        {/* Clearance Request Info (if applicable) */}
                        {isClearancePayment && clearanceRequest && (
                            <>
                                <Separator />
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileSearch className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium text-purple-800">Clearance Request</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-purple-700">Reference:</span>
                                            <div className="font-mono font-medium">{clearanceRequest.reference_number}</div>
                                        </div>
                                        <div>
                                            <span className="text-purple-700">Type:</span>
                                            <div>{clearanceRequest.clearance_type?.name || 'Clearance'}</div>
                                        </div>
                                        <div>
                                            <span className="text-purple-700">Purpose:</span>
                                            <div className="text-purple-900">{clearanceRequest.specific_purpose || clearanceRequest.purpose}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Outstanding Balance Summary */}
                        {payerOutstandingFees.length > 0 && (
                            <>
                                <Separator />
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-amber-800">Total Outstanding</span>
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                            {payerOutstandingFees.length} fees
                                        </Badge>
                                    </div>
                                    <div className="text-lg font-bold text-amber-900">
                                        {formatCurrency(totalOutstandingBalance)}
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
                            Select fees to pay {isClearancePayment && "(additional fees for clearance)"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Info Banner for Clearance Payments */}
                        {isClearancePayment && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Info className="h-4 w-4 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium">Clearance Payment Mode</p>
                                        <p className="text-blue-700">
                                            You're paying for a clearance request. You can add additional outstanding fees if needed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Late Payment Settings Modal (if shown) */}
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

                        {/* Search Bar */}
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
                        
                        {/* Fees List */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredFees.length > 0 ? (
                                filteredFees.map((fee) => {
                                    const isAdded = isFeeAlreadyAdded(fee.id);
                                    const category = fee.fee_type?.category || fee.fee_type_category || 'other';
                                    const isFuture = isFutureFee(fee);
                                    const dataIssue = hasDataIssue(fee);
                                    const correctedBalance = getCorrectedBalance(fee);
                                    const originalBalance = parseCurrencyString(fee.balance);
                                    const penaltyAmount = parseCurrencyString(fee.penalty_amount);
                                    
                                    return (
                                        <div
                                            key={fee.id}
                                            className={`p-3 border rounded-lg transition-all ${
                                                isAdded 
                                                    ? 'bg-green-50 border-green-200 cursor-default' 
                                                    : 'bg-white hover:border-primary hover:shadow-sm cursor-pointer'
                                            } ${dataIssue ? 'border-red-200 bg-red-50/50' : ''}`}
                                            onClick={() => !isAdded && onDirectAddFee && handleSelectFee(fee)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getCategoryIcon(category)}
                                                        <span className="font-medium">
                                                            {fee.fee_type?.name || fee.fee_type_name || 'Fee'}
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
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        Code: {fee.fee_code}
                                                        {fee.purpose && ` • ${fee.purpose}`}
                                                    </div>
                                                    
                                                    {/* Amount Breakdown - CLEANED UP */}
                                                    <div className="space-y-1 text-xs mb-2">
                                                        <div className="flex justify-between">
                                                            <span>Base:</span>
                                                            <span>{formatCurrency(parseCurrencyString(fee.base_amount))}</span>
                                                        </div>
                                                        
                                                        {parseCurrencyString(fee.surcharge_amount || '0') > 0 && (
                                                            <div className="flex justify-between text-amber-600">
                                                                <span>Surcharge:</span>
                                                                <span>+{formatCurrency(parseCurrencyString(fee.surcharge_amount || '0'))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Show penalty ONLY if fee is NOT future AND has penalty */}
                                                        {!isFuture && penaltyAmount > 0 && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Penalty:</span>
                                                                <span>+{formatCurrency(penaltyAmount)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* DON'T show penalty line for future fees at all */}
                                                        
                                                        {parseCurrencyString(fee.discount_amount || '0') > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount:</span>
                                                                <span>-{formatCurrency(parseCurrencyString(fee.discount_amount || '0'))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Always show the CORRECT total amount */}
                                                        <div className="flex justify-between font-bold pt-1 border-t mt-1">
                                                            <span>Total Amount:</span>
                                                            <span>
                                                                {formatCurrency(dataIssue ? correctedBalance : originalBalance)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Due: {fee.due_date}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-primary">
                                                                {formatCurrency(dataIssue ? correctedBalance : originalBalance)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Balance
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {!isAdded && onDirectAddFee && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="default"
                                                        className="ml-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectFee(fee);
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">No fees found</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchQuery 
                                            ? 'No fees match your search'
                                            : 'No outstanding fees available'}
                                    </p>
                                    {isClearancePayment && (
                                        <p className="text-sm text-blue-600 mt-2">
                                            You can proceed with the clearance payment only.
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
                                        Select fees from the list to add them here
                                    </p>
                                    {isClearancePayment && (
                                        <p className="text-sm text-blue-600 mt-2">
                                            The clearance fee will be automatically added.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Clearance Payment Note */}
                                    {isClearancePayment && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-purple-800">
                                                <FileCheck className="h-4 w-4" />
                                                <span className="font-medium">Clearance Payment</span>
                                            </div>
                                            {clearanceRequest && (
                                                <div className="mt-2 text-sm text-purple-700">
                                                    <div>Reference: {clearanceRequest.reference_number}</div>
                                                    <div>Fee: {formatCurrency(typeof clearanceRequest.fee_amount === 'string' 
                                                        ? parseCurrencyString(clearanceRequest.fee_amount)
                                                        : Number(clearanceRequest.fee_amount || 0)
                                                    )}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Selected Items List */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {paymentItems.map((item) => {
                                            // Check if this is a clearance fee
                                            const isClearanceFee = item.metadata?.is_clearance_fee;
                                            
                                            return (
                                                <div key={item.id} className={`p-3 border rounded-lg ${
                                                    isClearanceFee ? 'bg-purple-50 border-purple-200' : ''
                                                }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getCategoryIcon(item.category)}
                                                                <span className="font-medium">{item.fee_name}</span>
                                                                {isClearanceFee && (
                                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                        <FileCheck className="h-3 w-3 mr-1" />
                                                                        Clearance
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {item.fee_code}
                                                                {item.metadata?.clearance_request_id && (
                                                                    <span className="ml-2 text-purple-600">
                                                                        (Request #{item.metadata.clearance_request_id})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Don't allow removal of clearance fee if it's a clearance payment */}
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
                                                            <span>{formatCurrency(item.base_amount)}</span>
                                                        </div>
                                                        
                                                        {item.surcharge && item.surcharge > 0 && (
                                                            <div className="flex justify-between text-yellow-600">
                                                                <span>Surcharge:</span>
                                                                <span>+{formatCurrency(item.surcharge)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {item.penalty > 0 && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Penalty:</span>
                                                                <span>+{formatCurrency(item.penalty)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {item.discount && item.discount > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount:</span>
                                                                <span>-{formatCurrency(item.discount)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {isClearanceFee && (
                                                            <div className="flex justify-between text-purple-600 text-xs italic">
                                                                <span>Clearance fee</span>
                                                                <FileCheck className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between font-bold pt-1">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(item.total_amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Total Summary */}
                                    <div className="pt-4 border-t">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Total Amount:</span>
                                                <span className="text-primary">
                                                    {formatCurrency(totalSelectedAmount)}
                                                </span>
                                            </div>
                                            
                                            {isClearancePayment && (
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>
                                                            This payment includes a clearance request. Proceed to complete the payment.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <Button
                                                type="button"
                                                className="w-full"
                                                onClick={handleContinue}
                                            >
                                                Continue to Payment
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                            
                                            <div className="text-xs text-gray-500 text-center">
                                                {paymentItems.length} item{paymentItems.length !== 1 ? 's' : ''} selected
                                                {isClearancePayment && " (includes clearance)"}
                                            </div>
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