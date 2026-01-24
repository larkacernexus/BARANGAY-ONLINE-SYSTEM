// resources/js/components/admin/payment/PaymentDetailsStep.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    CreditCard,
    Calculator,
    Receipt,
    Save,
    ChevronRight,
    DollarSign,
    Building,
    FileText,
    AlertCircle,
    Smartphone,
    Landmark,
    CheckCircle,
    Banknote,
    FileCheck,
    Shield,
    AlertTriangle,
    Home,
    Package,
    User,
    Users,
    Phone,
    MapPin,
    Calendar,
    FileDigit,
    Lock,
    Check,
    CalendarDays,
    FileBadge,
    CircleAlert,
    RefreshCw,
    UserCircle,
    Mail,
    MapPinHouse,
    Hash
} from 'lucide-react';

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
}

interface PaymentItem {
    id: number;
    fee_id: string | number;
    fee_name: string;
    fee_code: string;
    description: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    category: string;
    period_covered: string;
    months_late?: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
        clearance_type_id?: string | number;
    };
}

interface PaymentFormData {
    payer_type: string;
    payer_id: string | number;
    payer_name: string;
    contact_number: string;
    address: string;
    household_number: string;
    purok: string;
    items: PaymentItem[];
    payment_date: string;
    period_covered: string;
    or_number: string;
    payment_method: string;
    reference_number: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type: string;
    total_amount: number;
    purpose: string;
    remarks: string;
    is_cleared: boolean;
    clearance_type_id: string | number;
    validity_date: string;
    collection_type: 'manual' | 'system';
    clearance_request_id?: string | number;
}

interface PaymentDetailsStepProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    selectedDiscountType: string;
    handleDiscountTypeChange: (type: string) => void;
    discountTypes: Record<string, string>;
    processing: boolean;
    handlePurposeChange: (value: string) => void;
    handlePeriodCoveredChange: (value: string) => void;
    handleClearanceTypeChange?: (id: string | number) => void;
    userModifiedPurpose: boolean;
    setUserModifiedPurpose: (value: boolean) => void;
    generatePurpose: () => string;
    clearanceTypes?: ClearanceType[];
    isClearancePayment?: boolean;
    clearanceRequest?: any;
    selectedClearanceType?: ClearanceType | null;
    getClearanceTypeNameById?: (id: string | number) => string;
    selectedResident?: any;
    selectedHousehold?: any;
}

function formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now();
    const random = String(timestamp % 1000).padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

export function PaymentDetailsStep({
    data,
    setData,
    setStep,
    paymentItems,
    selectedDiscountType,
    handleDiscountTypeChange,
    discountTypes,
    processing,
    handlePurposeChange,
    handlePeriodCoveredChange,
    handleClearanceTypeChange,
    userModifiedPurpose,
    setUserModifiedPurpose,
    generatePurpose,
    clearanceTypes = [],
    isClearancePayment = false,
    clearanceRequest = null,
    selectedClearanceType = null,
    getClearanceTypeNameById = (id: string | number) => 'Clearance',
    selectedResident = null,
    selectedHousehold = null
}: PaymentDetailsStepProps) {
    const [purposeError, setPurposeError] = useState<string>('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [isCleared, setIsCleared] = useState(data.is_cleared || false);
    const [validityDate, setValidityDate] = useState(data.validity_date || '');
    const [clearanceError, setClearanceError] = useState<string>('');
    const [autoGeneratedOR, setAutoGeneratedOR] = useState<boolean>(false);
    
    const isClearanceFeePayment = isClearancePayment || paymentItems.some(item => 
        item.metadata?.is_clearance_fee || item.category === 'clearance'
    );

    // Get clearance item
    const clearanceItem = paymentItems.find(item => 
        item.metadata?.is_clearance_fee || item.category === 'clearance'
    );

    // Calculate totals based on payment items - FIXED VERSION
    const calculateTotals = (items: PaymentItem[]) => {
        console.log('🧮 PaymentDetailsStep - Calculating totals from items:', items);
        
        let subtotal = 0;
        let surcharge = 0;
        let penalty = 0;
        let total = 0;

        items.forEach(item => {
            console.log('📦 Processing item:', {
                name: item.fee_name,
                base_amount: item.base_amount,
                surcharge: item.surcharge,
                penalty: item.penalty,
                discount: item.discount,
                total_amount: item.total_amount
            });
            
            subtotal += item.base_amount || 0;
            surcharge += item.surcharge || 0;
            penalty += item.penalty || 0;
            // The total_amount field should already be set correctly (balance to pay)
            total += item.total_amount || 0;
        });

        console.log('🧮 Calculated totals:', { subtotal, surcharge, penalty, total });
        return { subtotal, surcharge, penalty, total };
    };

    // Auto-update totals when payment items change
    useEffect(() => {
        console.log('🔄 PaymentDetailsStep - Payment items changed:', {
            itemsCount: paymentItems.length,
            items: paymentItems
        });
        
        const { subtotal, surcharge, penalty, total } = calculateTotals(paymentItems);
        
        console.log('📊 Setting form data with totals:', { 
            subtotal, 
            surcharge, 
            penalty, 
            total,
            currentData: data
        });
        
        // Only update if values are different to avoid infinite loops
        if (data.subtotal !== subtotal || data.surcharge !== surcharge || 
            data.penalty !== penalty || data.total_amount !== total) {
            setData(prev => ({
                ...prev,
                subtotal: subtotal,
                surcharge: surcharge,
                penalty: penalty,
                total_amount: total,
            }));
        }
    }, [paymentItems]);

    // Auto-generate OR number
    useEffect(() => {
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData('or_number', newOR);
            setAutoGeneratedOR(true);
        }
    }, []);

    // Set default payment date
    useEffect(() => {
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            setData('payment_date', today);
        }
    }, []);

    // Auto-set validity date
    useEffect(() => {
        if (selectedClearanceType && selectedClearanceType.validity_days && !data.validity_date) {
            const today = new Date();
            const validUntil = new Date(today);
            validUntil.setDate(today.getDate() + selectedClearanceType.validity_days);
            
            const formattedDate = validUntil.toISOString().split('T')[0];
            setValidityDate(formattedDate);
            setData('validity_date', formattedDate);
        }
    }, [selectedClearanceType, data.validity_date]);

    const handlePaymentMethodChange = (methodId: string) => {
        setData('payment_method', methodId);
        setData('reference_number', '');
    };

    const handleClearanceTypeSelect = (value: string) => {
        const id = value;
        if (handleClearanceTypeChange) {
            handleClearanceTypeChange(id);
        }
        setClearanceError('');
    };

    const handleClearedChange = (checked: boolean) => {
        setIsCleared(checked);
        setData('is_cleared', checked);
    };

    const handleValidityDateChange = (value: string) => {
        setValidityDate(value);
        setData('validity_date', value);
    };

    const handleRegenerateOR = () => {
        const newOR = generateORNumber();
        setData('or_number', newOR);
        setAutoGeneratedOR(true);
    };

    const validateForm = () => {
        let isValid = true;
        
        setPurposeError('');
        setClearanceError('');
        
        if (!data.purpose || data.purpose.trim() === '') {
            setPurposeError('Purpose of payment is required');
            isValid = false;
        }
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData('or_number', newOR);
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            setData('payment_date', new Date().toISOString().split('T')[0]);
        }
        
        if (isClearanceFeePayment && clearanceTypes.length > 0) {
            if (!data.clearance_type_id || String(data.clearance_type_id).trim() === '') {
                setClearanceError('Please select a clearance type for clearance payment');
                isValid = false;
            }
        }
        
        // Validate that total amount is greater than 0
        if (data.total_amount <= 0) {
            setPurposeError('Total amount must be greater than 0. Please check your payment items.');
            isValid = false;
        }
        
        return isValid;
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        try {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            setData('or_number', newOR);
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            setData('payment_date', new Date().toISOString().split('T')[0]);
        }
        
        if (validateForm()) {
            const form = document.getElementById('paymentForm') as HTMLFormElement;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    // Calculate totals for display
    const displayTotals = calculateTotals(paymentItems);
    const discountAmount = data.discount || 0;
    // Use data.total_amount directly (already calculated correctly)
    const finalTotal = data.total_amount || 0;

    console.log('📋 PaymentDetailsStep - Final display:', {
        displayTotals,
        dataTotals: {
            subtotal: data.subtotal,
            surcharge: data.surcharge,
            penalty: data.penalty,
            total_amount: data.total_amount
        },
        discountAmount,
        finalTotal
    });

    // Get payer details based on selected resident or household
    const getPayerTypeDisplay = () => {
        switch (data.payer_type) {
            case 'resident':
                return { label: 'Individual Resident', icon: User, color: 'bg-blue-100 text-blue-700' };
            case 'household':
                return { label: 'Household/Family', icon: Users, color: 'bg-green-100 text-green-700' };
            case 'business':
                return { label: 'Business/Company', icon: Building, color: 'bg-purple-100 text-purple-700' };
            default:
                return { label: 'Other Payer', icon: UserCircle, color: 'bg-gray-100 text-gray-700' };
        }
    };

    const payerTypeInfo = getPayerTypeDisplay();

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer & Payment Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Payer Information Card */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserCircle className="h-5 w-5 text-blue-700" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                        Payer Information
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Details of the person or entity making the payment
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge className={`${payerTypeInfo.color} border-0`}>
                                {payerTypeInfo.label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {/* Payer Name and Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="payerName" className="flex items-center gap-1 text-sm font-medium">
                                    <User className="h-3.5 w-3.5 text-gray-500" />
                                    Payer Name *
                                </Label>
                                <Input
                                    id="payerName"
                                    value={data.payer_name || ''}
                                    onChange={(e) => setData('payer_name', e.target.value)}
                                    required
                                    className="bg-gray-50"
                                    placeholder="Enter payer's full name"
                                />
                                {data.payer_type === 'resident' && selectedResident && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Selected from resident records
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactNumber" className="flex items-center gap-1 text-sm font-medium">
                                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                                    Contact Number
                                </Label>
                                <Input
                                    id="contactNumber"
                                    value={data.contact_number || ''}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                    className="bg-gray-50"
                                    placeholder="e.g., 09123456789"
                                />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center gap-1 text-sm font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                    Complete Address
                                </Label>
                                <Textarea
                                    id="address"
                                    value={data.address || ''}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="min-h-[60px] bg-gray-50"
                                    placeholder="Enter complete address including street, barangay, city/municipality"
                                    rows={2}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purok" className="flex items-center gap-1 text-sm font-medium">
                                        <MapPinHouse className="h-3.5 w-3.5 text-gray-500" />
                                        Purok/Zone
                                    </Label>
                                    <Input
                                        id="purok"
                                        value={data.purok || ''}
                                        onChange={(e) => setData('purok', e.target.value)}
                                        className="bg-gray-50"
                                        placeholder="Purok number or name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="householdNumber" className="flex items-center gap-1 text-sm font-medium">
                                        <Hash className="h-3.5 w-3.5 text-gray-500" />
                                        Household Number
                                    </Label>
                                    <Input
                                        id="householdNumber"
                                        value={data.household_number || ''}
                                        onChange={(e) => setData('household_number', e.target.value)}
                                        className="bg-gray-50"
                                        placeholder="HH-0001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payer Summary */}
                        {(selectedResident || selectedHousehold) && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm text-gray-900">
                                        {data.payer_type === 'resident' ? 'Resident Details' : 'Household Details'}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                        From Records
                                    </Badge>
                                </div>
                                
                                {data.payer_type === 'resident' && selectedResident && (
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3 text-gray-500" />
                                            <span className="font-medium text-gray-900">{selectedResident.name}</span>
                                        </div>
                                        {selectedResident.contact_number && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-3 w-3" />
                                                <span>{selectedResident.contact_number}</span>
                                            </div>
                                        )}
                                        {selectedResident.address && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{selectedResident.address}</span>
                                            </div>
                                        )}
                                        {selectedResident.household_number && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Home className="h-3 w-3" />
                                                <span>HH#: {selectedResident.household_number}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {data.payer_type === 'household' && selectedHousehold && (
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3 text-gray-500" />
                                            <span className="font-medium text-gray-900">{selectedHousehold.head_name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                Head of Family
                                            </Badge>
                                        </div>
                                        {selectedHousehold.contact_number && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-3 w-3" />
                                                <span>{selectedHousehold.contact_number}</span>
                                            </div>
                                        )}
                                        {selectedHousehold.address && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{selectedHousehold.address}</span>
                                            </div>
                                        )}
                                        {selectedHousehold.family_members > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="h-3 w-3" />
                                                <span>{selectedHousehold.family_members} family members</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Information Card */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                        Payment Information
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Complete payment details and generate official receipt
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-white">
                                Step 3 of 3
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Clearance Payment Info */}
                        {isClearanceFeePayment && clearanceTypes.length > 0 && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileBadge className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-purple-900">Clearance/Certificate Payment</h3>
                                        <p className="text-sm text-purple-700">
                                            This payment includes a barangay clearance or certificate.
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Clearance Type Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="clearanceType" className="flex items-center gap-1 text-sm font-medium text-purple-800">
                                        <FileBadge className="h-3.5 w-3.5" />
                                        Clearance Type
                                    </Label>
                                    
                                    <Select
                                        value={String(data.clearance_type_id || "")}
                                        onValueChange={handleClearanceTypeSelect}
                                    >
                                        <SelectTrigger className={`h-9 text-sm bg-white ${clearanceError ? 'border-red-300' : 'border-purple-300'}`}>
                                            {selectedClearanceType ? (
                                                <div className="flex items-center gap-2 text-left">
                                                    <FileBadge className="h-3.5 w-3.5 text-purple-600" />
                                                    <span>{selectedClearanceType.name}</span>
                                                    <Badge variant="outline" className="ml-2 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                                        {selectedClearanceType.code}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Select clearance type...</span>
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clearanceTypes.length > 0 ? (
                                                clearanceTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)} className="text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <FileBadge className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <span>{type.name}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    Code: {type.code} • Fee: {type.formatted_fee}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="py-6 text-center">
                                                    <CircleAlert className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-500">No clearance types available</p>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    
                                    {clearanceError && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {clearanceError}
                                        </div>
                                    )}
                                    
                                    {/* Display selected clearance type details */}
                                    {selectedClearanceType && (
                                        <div className="mt-2 p-3 bg-white border border-purple-100 rounded-md">
                                            <div className="flex items-start gap-2">
                                                <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                                                <div className="text-sm">
                                                    <div className="font-medium text-purple-800">
                                                        {selectedClearanceType.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Code: <span className="font-mono">{selectedClearanceType.code}</span>
                                                        {selectedClearanceType.validity_days > 0 && (
                                                            <span> • Valid for {selectedClearanceType.validity_days} days</span>
                                                        )}
                                                    </div>
                                                    {clearanceRequest?.reference_number && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            Request ID: <span className="font-mono">{clearanceRequest.reference_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                    
                                {/* Validity Date */}
                                {selectedClearanceType && (
                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="validityDate" className="flex items-center gap-1 text-sm font-medium text-purple-800">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Valid Until
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="validityDate"
                                                type="date"
                                                value={validityDate}
                                                onChange={(e) => handleValidityDateChange(e.target.value)}
                                                className="bg-white border-purple-300"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Clearance validity date.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Clearance Issuance Status */}
                                {selectedClearanceType && (
                                    <div className="mt-4 flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                        <Switch
                                            checked={isCleared}
                                            onCheckedChange={handleClearedChange}
                                            className="data-[state=checked]:bg-green-600"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor="clearance-status" className="text-sm font-medium text-gray-900">
                                                Mark as ready for issuance
                                            </Label>
                                            <p className="text-xs text-gray-600">
                                                When checked, the clearance will be marked as ready for issuance after payment.
                                            </p>
                                        </div>
                                        {isCleared && (
                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                <Check className="h-3 w-3 mr-1" />
                                                Ready to Issue
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show info if no clearance types */}
                        {isClearanceFeePayment && clearanceTypes.length === 0 && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <CircleAlert className="h-5 w-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-900">Clearance Payment</h3>
                                        <p className="text-sm text-amber-700">
                                            This payment includes a clearance fee, but no clearance types are configured.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Receipt Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gray-100 rounded">
                                    <FileDigit className="h-4 w-4 text-gray-600" />
                                </div>
                                <h3 className="font-medium text-base text-gray-900">Receipt Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orNumber" className="flex items-center gap-1 text-sm font-medium">
                                        OR Number *
                                        <Badge variant="outline" className="text-xs bg-gray-50">
                                            {autoGeneratedOR ? 'Auto-generated' : 'Enter manually'}
                                        </Badge>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="orNumber"
                                            value={data.or_number || ''}
                                            onChange={(e) => {
                                                setData('or_number', e.target.value);
                                                setAutoGeneratedOR(false);
                                            }}
                                            required
                                            className="font-mono bg-gray-50 pr-24"
                                            placeholder="BAR-YYYYMMDD-XXX"
                                        />
                                        <div className="absolute right-1 top-1 flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 hover:bg-gray-100 text-xs"
                                                onClick={handleRegenerateOR}
                                                title="Generate new OR number"
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>
                                    {autoGeneratedOR && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            OR number auto-generated
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate" className="text-sm font-medium">
                                        Payment Date *
                                    </Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={data.payment_date || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        required
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {formatDateDisplay(data.payment_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="periodCovered" className="text-sm font-medium">
                                    Period Covered <span className="text-gray-500 font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="periodCovered"
                                    placeholder="e.g., January 2024, Q1 2024, Annual 2024"
                                    value={data.period_covered || ''}
                                    onChange={(e) => handlePeriodCoveredChange(e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Purpose of Payment */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-100 rounded">
                                        <FileText className="h-4 w-4 text-amber-700" />
                                    </div>
                                    <h3 className="font-medium text-base text-gray-900">Purpose of Payment *</h3>
                                </div>
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                    Required Field
                                </Badge>
                            </div>
                            
                            <div className="space-y-3">
                                <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
                                    What is this payment for?
                                </Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Enter the purpose of payment..."
                                    value={data.purpose || ''}
                                    onChange={(e) => handlePurposeChange(e.target.value)}
                                    required
                                    className={`min-h-[80px] bg-gray-50 ${purposeError ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                                    rows={3}
                                />
                                {purposeError ? (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {purposeError}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500">
                                        This description will appear on the official receipt.
                                    </div>
                                )}
                            </div>

                            {paymentItems.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-gray-600">Quick Fill Suggestion:</Label>
                                        <Badge variant="outline" className="text-xs bg-gray-100">
                                            {paymentItems.length} items
                                        </Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed hover:border-solid"
                                        onClick={() => {
                                            const purpose = generatePurpose();
                                            handlePurposeChange(purpose);
                                            setUserModifiedPurpose(false);
                                        }}
                                    >
                                        <Check className="h-3 w-3 mr-2 text-green-600" />
                                        Use suggested purpose: {paymentItems.map(item => item.fee_name).join(', ')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded">
                                    <CreditCard className="h-4 w-4 text-blue-700" />
                                </div>
                                <h3 className="font-medium text-base text-gray-900">Payment Method</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'cash', icon: Banknote, name: 'Cash', description: 'Pay with physical cash', badge: 'Instant', iconColor: 'text-green-600' },
                                    { id: 'gcash', icon: Smartphone, name: 'GCash', description: 'Mobile payment via GCash', badge: 'Popular', iconColor: 'text-blue-600' },
                                    { id: 'maya', icon: CreditCard, name: 'Maya', description: 'Mobile payment via Maya', badge: null, iconColor: 'text-purple-600' },
                                    { id: 'bank', icon: Landmark, name: 'Bank Transfer', description: 'Online bank transfer', badge: null, iconColor: 'text-indigo-600' },
                                ].filter(m => ['cash', 'gcash'].includes(m.id)).map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = data.payment_method === method.id;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                                isSelected
                                                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${isSelected ? 'bg-primary/5' : 'bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-sm' : 'bg-white/80'}`}>
                                                        <Icon className={`h-5 w-5 ${method.iconColor}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{method.name}</div>
                                                        <div className="text-xs text-gray-600 mt-0.5">{method.description}</div>
                                                    </div>
                                                </div>
                                                {method.badge && (
                                                    <Badge className={`${method.id === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} text-xs`}>
                                                        {method.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                    <span className="text-xs text-gray-600">Selected payment method</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reference Number for non-cash methods */}
                        {data.payment_method !== 'cash' && (
                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber" className="flex items-center gap-1 text-sm font-medium">
                                    Reference Number *
                                    <Badge variant="outline" className="text-xs">
                                        Required
                                    </Badge>
                                </Label>
                                <Input
                                    id="referenceNumber"
                                    placeholder={`Transaction reference`}
                                    value={data.reference_number || ''}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    required
                                    className="bg-gray-50"
                                />
                            </div>
                        )}

                        {/* Advanced Options */}
                        <div className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gray-600 hover:text-gray-900"
                                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            >
                                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                            </Button>
                            
                            {showAdvancedOptions && (
                                <div className="mt-3 space-y-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="space-y-2">
                                        <Label htmlFor="collectionType" className="text-sm font-medium">
                                            Collection Type
                                        </Label>
                                        <Select
                                            value={data.collection_type || 'manual'}
                                            onValueChange={(value) => setData('collection_type', value)}
                                        >
                                            <SelectTrigger className="h-9 text-sm bg-white">
                                                <SelectValue placeholder="Select collection type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual Collection</SelectItem>
                                                <SelectItem value="system">System Generated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks" className="text-sm font-medium">
                                            Remarks / Notes <span className="text-gray-500 font-normal">(optional)</span>
                                        </Label>
                                        <Textarea
                                            id="remarks"
                                            placeholder="Any additional notes or special instructions..."
                                            rows={2}
                                            value={data.remarks || ''}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-sm" 
                                size="lg"
                                onClick={handleFormSubmit}
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                        Processing Payment...
                                    </>
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
                                className="min-w-[120px] border-gray-300 hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Summary & Receipt */}
            <div className="space-y-6">
                {/* Payer Summary Card */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCircle className="h-5 w-5 text-green-700" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Payer Summary
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {payerTypeInfo.icon && (
                                        <div className={`p-1.5 rounded ${payerTypeInfo.color}`}>
                                            {React.createElement(payerTypeInfo.icon, { className: "h-3.5 w-3.5" })}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-900">Payer Type</span>
                                </div>
                                <Badge className={`${payerTypeInfo.color} border-0`}>
                                    {payerTypeInfo.label}
                                </Badge>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <User className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 mb-0.5">Payer Name</div>
                                        <div className="font-medium text-gray-900 text-sm">
                                            {data.payer_name || 'Not specified'}
                                        </div>
                                    </div>
                                </div>
                                
                                {data.contact_number && (
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-0.5">Contact Number</div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {data.contact_number}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {data.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-0.5">Address</div>
                                            <div className="font-medium text-gray-900 text-sm line-clamp-2">
                                                {data.address}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {data.purok && (
                                    <div className="flex items-start gap-2">
                                        <MapPinHouse className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-0.5">Purok/Zone</div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {data.purok}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {data.household_number && (
                                    <div className="flex items-start gap-2">
                                        <Hash className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-0.5">Household Number</div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {data.household_number}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary Card */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calculator className="h-5 w-5 text-blue-700" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Payment Summary
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white">
                                    {data.payment_method === 'cash' ? 'Cash' : data.payment_method === 'gcash' ? 'GCash' : data.payment_method}
                                </Badge>
                                {isClearanceFeePayment && (
                                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                                        <FileBadge className="h-3 w-3 mr-1" />
                                        Clearance
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {isClearanceFeePayment && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileBadge className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-purple-800">Clearance Details</span>
                                </div>
                                <div className="text-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium text-purple-700">
                                            {selectedClearanceType?.name || getClearanceTypeNameById(data.clearance_type_id) || 'Clearance Fee'}
                                        </span>
                                    </div>
                                    {selectedClearanceType && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Code:</span>
                                            <span className="font-mono text-xs text-gray-700">{selectedClearanceType.code}</span>
                                        </div>
                                    )}
                                    {clearanceItem && (
                                        <div className="mt-2 pt-2 border-t border-purple-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Fee:</span>
                                                <span className="font-medium text-purple-700">
                                                    {formatCurrency(clearanceItem.total_amount || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {clearanceRequest?.reference_number && (
                                        <div className="mt-2 pt-2 border-t border-purple-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Request ID:</span>
                                                <span className="font-medium text-purple-700 font-mono text-xs">
                                                    {clearanceRequest.reference_number}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentItems.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-gray-900">Payment Items</h4>
                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                        {paymentItems.length} items
                                    </Badge>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {paymentItems.map((item, index) => {
                                        const isClearanceItem = item.metadata?.is_clearance_fee || item.category === 'clearance';
                                        const itemTotal = item.total_amount || 0;
                                        return (
                                            <div 
                                                key={item.id} 
                                                className={`flex items-start gap-3 p-2 border rounded hover:bg-gray-50 text-sm transition-colors ${
                                                    isClearanceItem ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'
                                                }`}
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${
                                                    isClearanceItem ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {isClearanceItem ? (
                                                        <FileBadge className="h-3 w-3" />
                                                    ) : (
                                                        <span className="text-xs font-medium">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`font-medium truncate ${
                                                            isClearanceItem ? 'text-purple-800' : 'text-gray-900'
                                                        }`}>
                                                            {item.fee_name}
                                                            {isClearanceItem && (
                                                                <Badge variant="outline" className="ml-1 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                                                    Clearance
                                                                </Badge>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span className="font-mono">Code: {item.fee_code}</span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(itemTotal)}
                                                        </span>
                                                    </div>
                                                    {/* Show item breakdown */}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.base_amount > 0 && `Base: ${formatCurrency(item.base_amount)}`}
                                                        {item.surcharge > 0 && ` | Surcharge: ${formatCurrency(item.surcharge)}`}
                                                        {item.penalty > 0 && ` | Penalty: ${formatCurrency(item.penalty)}`}
                                                        {item.discount > 0 && ` | Discount: ${formatCurrency(item.discount)}`}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Totals Section - FIXED VERSION */}
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(data.subtotal || displayTotals.subtotal)}</span>
                                </div>
                                {data.surcharge > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-amber-700">Surcharge</span>
                                        <span className="font-medium text-amber-700">+{formatCurrency(data.surcharge)}</span>
                                    </div>
                                )}
                                {data.penalty > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-red-700">Penalty</span>
                                        <span className="font-medium text-red-700">+{formatCurrency(data.penalty)}</span>
                                    </div>
                                )}
                                {data.discount > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-green-700">Discount</span>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-1.5 py-0">
                                                {discountTypes[selectedDiscountType] || selectedDiscountType}
                                            </Badge>
                                        </div>
                                        <span className="font-medium text-green-700">-{formatCurrency(data.discount)}</span>
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center pt-1">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="text-primary font-bold text-lg">
                                    {formatCurrency(data.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Discount Selection */}
                        <div className="pt-3 border-t border-gray-200">
                            <Label htmlFor="discountType" className="text-sm font-medium text-gray-900 mb-2">
                                Apply Discount
                            </Label>
                            <Select
                                value={selectedDiscountType || 'no_discount'}
                                onValueChange={handleDiscountTypeChange}
                            >
                                <SelectTrigger className="h-9 text-sm bg-gray-50">
                                    <SelectValue placeholder="No discount" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no_discount">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                                            No Discount
                                        </div>
                                    </SelectItem>
                                    {Object.entries(discountTypes).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <span>{label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}