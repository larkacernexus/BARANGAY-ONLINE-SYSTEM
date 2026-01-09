// resources/js/components/admin/payment/AddFeesStep.tsx
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
    AlertCircle,
    Phone,
    MapPin,
    Hash,
    FileSearch,
    CreditCard,
    Info,
    FileBadge
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
    } | null;
    // Add source parameter to track where payer was selected from
    payerSource?: 'clearance' | 'residents' | 'business' | 'other';
}

function formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function parseCurrencyString(amountString: string): number {
    if (!amountString || amountString.trim() === '') return 0;
    const parsed = parseFloat(amountString.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
}

function isFutureFee(fee: OutstandingFee): boolean {
    const dueDate = new Date(fee.due_date);
    const today = new Date();
    return dueDate > today;
}

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
    payerSource = 'residents' // Default to residents
}: AddFeesStepProps) {
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [internalIsClearancePayment, setInternalIsClearancePayment] = useState<boolean>(false);
    const [showClearanceInfo, setShowClearanceInfo] = useState<boolean>(false);
    
    // Determine if this is a clearance payment based on multiple factors
    useEffect(() => {
        const determineClearanceMode = () => {
            console.log('🔍 AddFeesStep Clearance Check - START:', {
                payerSource,
                isClearancePayment,
                hasClearanceRequest: !!clearanceRequest,
                hasPreFilledClearance: !!(pre_filled_data && (
                    pre_filled_data.clearance_type_id != null || 
                    pre_filled_data.clearance_code != null ||
                    pre_filled_data.fee_type_id != null
                )),
                hasFormClearance: !!(data && (
                    data.clearance_type_id != null || 
                    data.clearance_code != null ||
                    data.clearance_type != null ||
                    data.clearance_request_id != null
                )),
                hasClearancePaymentItems: paymentItems.some(item => item.metadata?.is_clearance_fee),
                paymentItemsCount: paymentItems.length
            });
            
            // Check multiple conditions for clearance payment
            const hasClearanceRequest = !!clearanceRequest;
            const hasPreFilledClearance = pre_filled_data && (
                pre_filled_data.clearance_type_id != null || 
                pre_filled_data.clearance_code != null ||
                pre_filled_data.fee_type_id != null
            );
            
            const hasFormClearance = data && (
                data.clearance_type_id != null || 
                data.clearance_code != null ||
                data.clearance_type != null ||
                data.clearance_request_id != null
            );
            
            // Check if any payment item is a clearance fee
            const hasClearancePaymentItems = paymentItems.some(
                item => item.metadata?.is_clearance_fee
            );
            
            const result = isClearancePayment || 
                          hasClearanceRequest || 
                          hasPreFilledClearance || 
                          hasFormClearance ||
                          hasClearancePaymentItems ||
                          payerSource === 'clearance'; // Add this line - if coming from clearance tab
            
            console.log('🔍 AddFeesStep Clearance Check - RESULT:', {
                result,
                payerSource,
                isClearancePayment,
                hasClearanceRequest,
                hasPreFilledClearance,
                hasFormClearance,
                hasClearancePaymentItems
            });
            
            setInternalIsClearancePayment(result);
            setShowClearanceInfo(result || payerSource === 'clearance');
        };
        
        determineClearanceMode();
    }, [isClearancePayment, clearanceRequest, pre_filled_data, data, paymentItems, payerSource]);
    
    const isFeeAlreadyAdded = (feeId: string | number) => {
        return paymentItems.some(item => item.fee_id === feeId);
    };
    
    const totalSelectedAmount = paymentItems.reduce((total, item) => {
        return total + item.total_amount;
    }, 0);
    
    const filteredFees = payerOutstandingFees.filter(fee => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            fee.fee_code.toLowerCase().includes(query) ||
            (fee.fee_type_name && fee.fee_type_name.toLowerCase().includes(query)) ||
            (fee.purpose && fee.purpose.toLowerCase().includes(query))
        );
    });
    
    const getCorrectedBalance = (fee: OutstandingFee): number => {
        const isFuture = isFutureFee(fee);
        const base = parseCurrencyString(fee.base_amount);
        const surcharge = parseCurrencyString(fee.surcharge_amount || '0');
        const penalty = isFuture ? 0 : parseCurrencyString(fee.penalty_amount);
        const discount = parseCurrencyString(fee.discount_amount || '0');
        
        return base + surcharge + penalty - discount;
    };
    
    const handleSelectFee = (fee: OutstandingFee) => {
        if (isFeeAlreadyAdded(fee.id)) {
            return;
        }
        
        if (onDirectAddFee) {
            onDirectAddFee(fee);
        }
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
    
    // Get clearance type name from various sources
    const getClearanceTypeName = () => {
        if (clearanceRequest?.clearance_type?.name) {
            return clearanceRequest.clearance_type.name;
        }
        
        // Check form data
        if (data.clearance_type) {
            return data.clearance_type;
        }
        
        // If coming from clearance tab but no specific type, show generic
        if (payerSource === 'clearance') {
            return 'Clearance Payment';
        }
        
        return 'Clearance Payment';
    };
    
    // Check if this is specifically a clearance-only payment (no other fees)
    const isClearanceOnlyPayment = internalIsClearancePayment && 
        paymentItems.length > 0 && 
        paymentItems.every(item => item.metadata?.is_clearance_fee);

    // Check if we should show clearance mode message
    const shouldShowClearanceMode = internalIsClearancePayment || payerSource === 'clearance';

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer Info */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getPayerTypeIcon(data.payer_type)}
                            Payer Information
                            {showClearanceInfo && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                    <FileBadge className="h-3 w-3 mr-1" />
                                    {payerSource === 'clearance' ? 'From Clearance Tab' : 'Clearance'}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm text-gray-500">Payer Name</Label>
                            <div className="font-medium">{data.payer_name}</div>
                        </div>
                        
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
                        
                        <div>
                            <Label className="text-sm text-gray-500">Address</Label>
                            <div className="font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {data.address || 'N/A'}
                            </div>
                        </div>
                        
                        {data.purok && (
                            <div>
                                <Label className="text-sm text-gray-500">Purok</Label>
                                <div className="font-medium">{data.purok}</div>
                            </div>
                        )}
                        
                        {showClearanceInfo && (
                            <>
                                <Separator />
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileSearch className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium text-purple-800">
                                            {getClearanceTypeName()}
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
                                        {data.clearance_type_id && !clearanceRequest?.reference_number && !data.clearance_code && (
                                            <div>
                                                <span className="text-purple-700">Type ID:</span>
                                                <div className="font-medium">{data.clearance_type_id}</div>
                                            </div>
                                        )}
                                        {isClearanceOnlyPayment && (
                                            <div className="mt-2 p-2 bg-purple-100 rounded">
                                                <p className="text-xs text-purple-800 font-medium">
                                                    This is a clearance-only payment
                                                </p>
                                            </div>
                                        )}
                                        {payerSource === 'clearance' && !internalIsClearancePayment && (
                                            <div className="mt-2 p-2 bg-blue-100 rounded">
                                                <p className="text-xs text-blue-800 font-medium">
                                                    Selected from Clearance tab
                                                </p>
                                            </div>
                                        )}
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
                            {shouldShowClearanceMode 
                                ? "Select additional fees to pay (optional)" 
                                : "Select fees to pay"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {shouldShowClearanceMode && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Info className="h-4 w-4 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {payerSource === 'clearance' ? 'Clearance Tab Selection' : 'Clearance Payment Mode'}
                                        </p>
                                        <p className="text-blue-700">
                                            {payerSource === 'clearance' 
                                                ? "You selected this payer from the Clearance tab. You can add clearance fees or other outstanding fees below."
                                                : "You're paying for a clearance request. " + 
                                                  (isClearanceOnlyPayment 
                                                    ? "You can add other outstanding fees if needed." 
                                                    : "You can add additional outstanding fees below.")
                                            }
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
                            {filteredFees.length > 0 ? (
                                filteredFees.map((fee) => {
                                    const isAdded = isFeeAlreadyAdded(fee.id);
                                    const category = fee.fee_type_category || 'other';
                                    const isFuture = isFutureFee(fee);
                                    const correctedBalance = getCorrectedBalance(fee);
                                    const penaltyAmount = parseCurrencyString(fee.penalty_amount);
                                    
                                    return (
                                        <div
                                            key={fee.id}
                                            className={`p-3 border rounded-lg transition-all ${
                                                isAdded 
                                                    ? 'bg-green-50 border-green-200 cursor-default' 
                                                    : 'bg-white hover:border-primary hover:shadow-sm cursor-pointer'
                                            }`}
                                            onClick={() => !isAdded && onDirectAddFee && handleSelectFee(fee)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getCategoryIcon(category)}
                                                        <span className="font-medium">
                                                            {fee.fee_type_name || 'Fee'}
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
                                                        
                                                        {!isFuture && penaltyAmount > 0 && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Penalty:</span>
                                                                <span>+{formatCurrency(penaltyAmount)}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {parseCurrencyString(fee.discount_amount || '0') > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount:</span>
                                                                <span>-{formatCurrency(parseCurrencyString(fee.discount_amount || '0'))}</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between font-bold pt-1 border-t mt-1">
                                                            <span>Total Amount:</span>
                                                            <span>
                                                                {formatCurrency(correctedBalance)}
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
                                                                {formatCurrency(correctedBalance)}
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
                                            : shouldShowClearanceMode 
                                                ? 'No additional outstanding fees'
                                                : 'No outstanding fees available'
                                        }
                                    </p>
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
                                        {shouldShowClearanceMode 
                                            ? "Add clearance fee or select other fees to pay"
                                            : "Select fees from the list to add them here"
                                        }
                                        {payerSource === 'clearance' && (
                                            <span className="block text-purple-600 font-medium mt-1">
                                                (Selected from Clearance tab)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {showClearanceInfo && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-4">
                                            <div className="flex items-center gap-2 text-purple-800">
                                                <FileBadge className="h-4 w-4" />
                                                <span className="font-medium">{getClearanceTypeName()}</span>
                                                {payerSource === 'clearance' && (
                                                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                                        From Clearance Tab
                                                    </Badge>
                                                )}
                                            </div>
                                            {(clearanceRequest?.reference_number || data.clearance_code) && (
                                                <div className="mt-2 text-sm text-purple-700">
                                                    {clearanceRequest?.reference_number && (
                                                        <div>Reference: {clearanceRequest.reference_number}</div>
                                                    )}
                                                    {data.clearance_code && (
                                                        <div>Code: {data.clearance_code}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {paymentItems.map((item) => {
                                            const isClearanceFee = item.metadata?.is_clearance_fee;
                                            
                                            return (
                                                <div key={item.id} className={`p-3 border rounded-lg ${
                                                    isClearanceFee ? 'bg-purple-50 border-purple-200' : 'bg-white'
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
                                                        
                                                        <div className="flex justify-between font-bold pt-1">
                                                            <span>Total:</span>
                                                            <span>{formatCurrency(item.total_amount)}</span>
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
                                            
                                            {internalIsClearancePayment && isClearanceOnlyPayment && (
                                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                    <p className="text-xs text-blue-700 text-center">
                                                        Proceeding with clearance-only payment
                                                    </p>
                                                </div>
                                            )}
                                            {payerSource === 'clearance' && !internalIsClearancePayment && (
                                                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                                                    <p className="text-xs text-purple-700 text-center">
                                                        Payer selected from Clearance tab
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