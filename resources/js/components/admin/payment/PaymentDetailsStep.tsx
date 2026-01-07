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
    ExternalLink,
    QrCode,
    ShieldCheck,
    Wallet,
    Banknote,
    FileCheck,
    Shield,
    AlertTriangle,
    Home,
    Package,
    Hash,
    User,
    Users,
    Phone,
    MapPin,
    Calendar,
    FileDigit,
    ClipboardList,
    BadgeCheck,
    Info,
    Lock,
    Check,
    CalendarDays,
    Download,
    Printer,
    Copy,
    Eye,
    EyeOff,
    FileType,
    FileKey,
    FileBadge
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentItem {
    id: number;
    fee_id: string | number;
    fee_name: string;
    fee_code: string;
    description: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    category: string;
    period_covered: string;
    months_late?: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
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
    certificate_type: string;
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
    handleCertificateTypeChange?: (value: string) => void;
    userModifiedPurpose: boolean;
    setUserModifiedPurpose: (value: boolean) => void;
    generatePurpose: () => string;
    clearanceTypes?: Record<string, string>;
    isClearancePayment?: boolean;
    clearanceRequest?: any;
}

// Enhanced payment method configurations
const paymentMethods = [
    {
        id: 'cash',
        name: 'Cash',
        icon: Banknote,
        description: 'Pay with physical cash',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
        badge: 'Instant',
        popular: true,
        fields: []
    },
    {
        id: 'gcash',
        name: 'GCash',
        icon: Smartphone,
        description: 'Mobile payment via GCash',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
        badge: 'Popular',
        popular: true,
        fields: [
            {
                label: 'GCash Transaction ID',
                placeholder: 'e.g., GX1234567890',
                required: true,
                pattern: '^[A-Z0-9]{10,}$'
            },
            {
                label: 'GCash Account Name',
                placeholder: 'Sender\'s name on GCash',
                required: true
            },
            {
                label: 'GCash Account Number',
                placeholder: '09XX XXX XXXX',
                required: true,
                pattern: '^09[0-9]{9}$'
            }
        ]
    },
    {
        id: 'maya',
        name: 'Maya',
        icon: CreditCard,
        description: 'Mobile payment via Maya',
        color: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-600',
        badge: null,
        popular: false,
        fields: [
            {
                label: 'Maya Reference Number',
                placeholder: 'Maya transaction reference',
                required: true
            },
            {
                label: 'Maya Account Name',
                placeholder: 'Sender\'s name on Maya',
                required: true
            }
        ]
    },
    {
        id: 'bank',
        name: 'Bank Transfer',
        icon: Landmark,
        description: 'Online bank transfer',
        color: 'bg-indigo-50 border-indigo-200',
        textColor: 'text-indigo-700',
        iconColor: 'text-indigo-600',
        badge: null,
        popular: false,
        fields: [
            {
                label: 'Bank Name',
                placeholder: 'e.g., BDO, BPI, Metrobank',
                required: true
            },
            {
                label: 'Account Number',
                placeholder: 'Bank account number',
                required: true
            },
            {
                label: 'Transaction Reference',
                placeholder: 'Bank transfer reference',
                required: true
            }
        ]
    },
    {
        id: 'check',
        name: 'Check',
        icon: FileText,
        description: 'Post-dated check payment',
        color: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-600',
        badge: null,
        popular: false,
        fields: [
            {
                label: 'Check Number',
                placeholder: 'Check number',
                required: true
            },
            {
                label: 'Bank Name',
                placeholder: 'Issuing bank',
                required: true
            },
            {
                label: 'Check Date',
                type: 'date',
                required: true
            }
        ]
    },
    {
        id: 'online',
        name: 'Online Payment',
        icon: ShieldCheck,
        description: 'Pay via online portal',
        color: 'bg-cyan-50 border-cyan-200',
        textColor: 'text-cyan-700',
        iconColor: 'text-cyan-600',
        badge: 'Secure',
        popular: false,
        fields: []
    }
];

// Helper functions
function formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Function to get category icon
const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
        'tax': DollarSign,
        'clearance': FileCheck,
        'certificate': Shield,
        'service': Package,
        'rental': Home,
        'fine': AlertTriangle,
    };
    const IconComponent = icons[category] || FileText;
    return <IconComponent className="h-3 w-3" />;
};

// Function to generate OR number
const generateORNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
};

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
    handleCertificateTypeChange,
    userModifiedPurpose,
    setUserModifiedPurpose,
    generatePurpose,
    clearanceTypes = {},
    isClearancePayment = false,
    clearanceRequest = null
}: PaymentDetailsStepProps) {
    const [selectedMethodFields, setSelectedMethodFields] = useState<Record<string, string>>({});
    const [purposeError, setPurposeError] = useState<string>('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [isCleared, setIsCleared] = useState(data.is_cleared);
    const [validityDate, setValidityDate] = useState(data.validity_date || '');

    // Get current payment method configuration
    const currentMethod = paymentMethods.find(method => method.id === data.payment_method);

    // Check if this is a clearance payment
    const isClearanceFeePayment = isClearancePayment || paymentItems.some(item => 
        item.metadata?.is_clearance_fee || item.category === 'clearance'
    );

    // Initialize data with default values to prevent uncontrolled inputs
    const safeData = {
        or_number: data.or_number || generateORNumber(),
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
        payment_method: data.payment_method || 'cash',
        reference_number: data.reference_number || '',
        period_covered: data.period_covered || '',
        purpose: data.purpose || '',
        remarks: data.remarks || '',
        subtotal: data.subtotal || 0,
        surcharge: data.surcharge || 0,
        penalty: data.penalty || 0,
        discount: data.discount || 0,
        total_amount: data.total_amount || 0,
        certificate_type: data.certificate_type || '',
        is_cleared: data.is_cleared || false,
        validity_date: data.validity_date || '',
    };

    // Generate purpose with ALL item names if not already set
    useEffect(() => {
        if (!data.purpose && paymentItems.length > 0) {
            const purpose = generatePurpose();
            handlePurposeChange(purpose);
        }
        
        // Set certificate type for clearance payments
        if (isClearanceFeePayment && !data.certificate_type && clearanceRequest?.clearance_type?.code) {
            setData('certificate_type', clearanceRequest.clearance_type.code);
        }
    }, [paymentItems, data.purpose, isClearanceFeePayment]);

    // Auto-set validity date for clearance certificates
    useEffect(() => {
        if (isClearanceFeePayment && data.certificate_type && !data.validity_date) {
            const today = new Date();
            const validityDays = 30; // Default validity days
            const validUntil = new Date(today);
            validUntil.setDate(today.getDate() + validityDays);
            
            const formattedDate = validUntil.toISOString().split('T')[0];
            setValidityDate(formattedDate);
            setData('validity_date', formattedDate);
        }
    }, [data.certificate_type, isClearanceFeePayment]);

    const handlePaymentMethodChange = (methodId: string) => {
        setData('payment_method', methodId);
        // Clear reference number when switching methods
        setData('reference_number', '');
        // Clear method-specific fields
        setSelectedMethodFields({});
    };

    const handleMethodFieldChange = (fieldName: string, value: string) => {
        setSelectedMethodFields(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Generate QR code text for GCash/Maya
    const generateQRText = () => {
        if (safeData.payment_method === 'gcash' || safeData.payment_method === 'maya') {
            const total = safeData.total_amount.toFixed(2);
            const message = `Payment for ${safeData.purpose || 'Barangay Fees'}`;
            const reference = safeData.or_number;
            return `Amount: ${total}\nReference: ${reference}\n${message}`;
        }
        return '';
    };

    // Validate form before submission
    const validateForm = () => {
        if (!safeData.purpose || safeData.purpose.trim() === '') {
            setPurposeError('Purpose of payment is required');
            return false;
        }
        
        // Validate certificate type for clearance payments
        if (isClearanceFeePayment && !safeData.certificate_type) {
            alert('Please select a certificate type for clearance payment');
            return false;
        }
        
        setPurposeError('');
        return true;
    };

    // Handle OR number regeneration
    const handleRegenerateOR = () => {
        const newOR = generateORNumber();
        setData('or_number', newOR);
    };

    // Handle reference number generation
    const handleGenerateReference = () => {
        if (currentMethod) {
            const random = Math.random().toString(36).substring(2, 10).toUpperCase();
            const newReference = `${currentMethod.name.substring(0, 2)}-${random}`;
            setData('reference_number', newReference);
        }
    };

    // Handle certificate type change
    const handleCertTypeChange = (value: string) => {
        setData('certificate_type', value);
        if (handleCertificateTypeChange) {
            handleCertificateTypeChange(value);
        }
        
        // Set default purpose based on certificate type
        if (!userModifiedPurpose && value) {
            const purpose = clearanceTypes[value] ? `Payment for ${clearanceTypes[value]}` : 'Certificate Payment';
            handlePurposeChange(purpose);
        }
    };

    // Handle cleared status change
    const handleClearedChange = (checked: boolean) => {
        setIsCleared(checked);
        setData('is_cleared', checked);
    };

    // Handle validity date change
    const handleValidityDateChange = (value: string) => {
        setValidityDate(value);
        setData('validity_date', value);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payment Information */}
            <div className="lg:col-span-2 space-y-6">
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
                        {isClearanceFeePayment && (
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
                                
                                {/* Certificate Type Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="certificateType" className="flex items-center gap-1 text-sm font-medium text-purple-800">
                                            <FileType className="h-3.5 w-3.5" />
                                            Certificate Type *
                                        </Label>
                                        <Select
                                            value={safeData.certificate_type || ''}
                                            onValueChange={handleCertTypeChange}
                                        >
                                            <SelectTrigger className={`h-9 text-sm ${!safeData.certificate_type ? 'border-purple-300 bg-purple-50' : 'bg-white'}`}>
                                                <SelectValue placeholder="Select certificate type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(clearanceTypes).map(([code, name]) => (
                                                    <SelectItem key={code} value={code} className="text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <FileBadge className="h-3.5 w-3.5 text-purple-600" />
                                                            <span>{name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="validityDate" className="flex items-center gap-1 text-sm font-medium text-purple-800">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Valid Until
                                        </Label>
                                        <Input
                                            id="validityDate"
                                            type="date"
                                            value={validityDate}
                                            onChange={(e) => handleValidityDateChange(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                                
                                {/* Certificate Issuance Status */}
                                <div className="mt-4 flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                    <Switch
                                        checked={isCleared}
                                        onCheckedChange={handleClearedChange}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="certificate-status" className="text-sm font-medium text-gray-900">
                                            Mark as cleared for issuance
                                        </Label>
                                        <p className="text-xs text-gray-600">
                                            When checked, the certificate will be marked as ready for issuance after payment.
                                        </p>
                                    </div>
                                    {isCleared && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <Check className="h-3 w-3 mr-1" />
                                            Ready to Issue
                                        </Badge>
                                    )}
                                </div>
                                
                                {/* Clearance Request Info */}
                                {clearanceRequest && (
                                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileKey className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-sm">Clearance Request:</span>
                                            <Badge variant="outline" className="text-xs font-mono bg-gray-100">
                                                {clearanceRequest.reference_number}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Purpose: {clearanceRequest.purpose}
                                        </div>
                                    </div>
                                )}
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
                                            Auto-generated
                                        </Badge>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="orNumber"
                                            value={safeData.or_number}
                                            onChange={(e) => setData('or_number', e.target.value)}
                                            required
                                            className="font-mono bg-gray-50"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-7 px-2 hover:bg-gray-100"
                                            onClick={handleRegenerateOR}
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate" className="text-sm font-medium">
                                        Payment Date *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="paymentDate"
                                            type="date"
                                            value={safeData.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            required
                                            className="bg-gray-50"
                                        />
                                        {safeData.payment_date === new Date().toISOString().split('T')[0] && (
                                            <Badge className="absolute -top-2 -right-2 text-xs" variant="secondary">
                                                Today
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="periodCovered" className="text-sm font-medium">
                                    Period Covered <span className="text-gray-500 font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="periodCovered"
                                    placeholder="e.g., January 2024, Q1 2024, Annual 2024"
                                    value={safeData.period_covered}
                                    onChange={(e) => handlePeriodCoveredChange(e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Purpose of Payment - REQUIRED */}
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
                                    placeholder="Enter the purpose of payment (e.g., Business Permit, Health Certificate, Real Property Tax)..."
                                    value={safeData.purpose}
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
                                        This description will appear on the official receipt. Be clear and specific.
                                    </div>
                                )}
                            </div>

                            {/* Auto-fill suggestion */}
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
                            
                            {/* Recommended Methods */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {paymentMethods.filter(m => m.popular).map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = safeData.payment_method === method.id;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                                isSelected
                                                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${method.color}`}
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

                            {/* All Methods */}
                            <div className="pt-2">
                                <div className="text-xs text-gray-500 mb-2 font-medium">OTHER PAYMENT OPTIONS</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {paymentMethods.filter(m => !m.popular).map((method) => {
                                        const Icon = method.icon;
                                        const isSelected = safeData.payment_method === method.id;
                                        return (
                                            <div
                                                key={method.id}
                                                onClick={() => handlePaymentMethodChange(method.id)}
                                                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`h-4 w-4 ${method.iconColor}`} />
                                                    <span className="text-sm font-medium text-gray-900">{method.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Specific Fields */}
                        {currentMethod && currentMethod.fields.length > 0 && (
                            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <currentMethod.icon className="h-4 w-4" />
                                    <h4 className="font-medium text-gray-900">{currentMethod.name} Details</h4>
                                </div>
                                <div className="space-y-3">
                                    {currentMethod.fields.map((field, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label htmlFor={`field-${field.label}`} className="text-sm">
                                                {field.label} {field.required && '*'}
                                            </Label>
                                            <Input
                                                id={`field-${field.label}`}
                                                type={field.type || 'text'}
                                                placeholder={field.placeholder}
                                                value={selectedMethodFields[field.label] || ''}
                                                onChange={(e) => handleMethodFieldChange(field.label, e.target.value)}
                                                required={field.required}
                                                pattern={field.pattern}
                                                className="bg-white"
                                            />
                                            {field.label.includes('Transaction') && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Info className="h-3 w-3" />
                                                    Keep this reference for verification purposes
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* QR Code Section for Mobile Payments */}
                                {(safeData.payment_method === 'gcash' || safeData.payment_method === 'maya') && (
                                    <div className="mt-4 p-4 border rounded-lg bg-white">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <QrCode className="h-4 w-4" />
                                                <span className="font-medium text-gray-900">Quick Pay with QR</span>
                                            </div>
                                            <Button variant="outline" size="sm" type="button" className="text-xs">
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Open App
                                            </Button>
                                        </div>
                                        <div className="text-center">
                                            <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                                                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                                                    <QrCode className="h-16 w-16 text-gray-400" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Scan this QR code with your {currentMethod.name} app
                                            </p>
                                            <div className="mt-3 text-left text-sm bg-gray-50 p-3 rounded border">
                                                <div className="font-mono text-xs break-all text-gray-700">
                                                    {generateQRText()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reference Number for all non-cash methods */}
                        {safeData.payment_method !== 'cash' && currentMethod && currentMethod.fields.length === 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber" className="flex items-center gap-1 text-sm font-medium">
                                    Reference Number *
                                    <Badge variant="outline" className="text-xs">
                                        Required
                                    </Badge>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="referenceNumber"
                                        placeholder={`${currentMethod.name} transaction reference`}
                                        value={safeData.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        required
                                        className="bg-gray-50"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-7 px-2 hover:bg-gray-100"
                                        onClick={handleGenerateReference}
                                    >
                                        Generate
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Info className="h-3 w-3" />
                                    Keep this reference number for payment tracking and verification
                                </div>
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
                                {showAdvancedOptions ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
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
                                    
                                    {/* Additional Information - Remarks */}
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks" className="text-sm font-medium">
                                            Remarks / Notes <span className="text-gray-500 font-normal">(optional)</span>
                                        </Label>
                                        <Textarea
                                            id="remarks"
                                            placeholder="Any additional notes or special instructions..."
                                            rows={2}
                                            value={safeData.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            className="bg-white"
                                        />
                                        <div className="text-xs text-gray-500">
                                            For internal use only. This will not appear on the official receipt.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button 
                                type="submit" 
                                disabled={processing || !safeData.purpose} 
                                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-sm" 
                                size="lg"
                                onClick={() => {
                                    if (!validateForm()) {
                                        return;
                                    }
                                }}
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
                {/* Payment Summary */}
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
                            <Badge variant="outline" className="bg-white">
                                {currentMethod?.name || 'Cash'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {/* Clearance Payment Badge */}
                        {isClearanceFeePayment && (
                            <div className="mb-3">
                                <Badge className="w-full justify-center bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                                    <FileBadge className="h-3.5 w-3.5 mr-1.5" />
                                    Clearance/Certificate Payment
                                </Badge>
                            </div>
                        )}

                        {/* ALL Items Display in Compact List */}
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
                                                        {getCategoryIcon(item.category)}
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
                                                            {formatCurrency(item.total_amount)}
                                                        </span>
                                                    </div>
                                                    {(item.surcharge > 0 || item.penalty > 0) && (
                                                        <div className="flex items-center gap-2 text-xs mt-1">
                                                            {item.surcharge > 0 && (
                                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-1.5">
                                                                    +{formatCurrency(item.surcharge)} surcharge
                                                                </Badge>
                                                            )}
                                                            {item.penalty > 0 && (
                                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-1.5">
                                                                    +{formatCurrency(item.penalty)} penalty
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Totals Section */}
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(safeData.subtotal)}</span>
                                </div>
                                {safeData.surcharge > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-700">Surcharge</span>
                                        </div>
                                        <span className="font-medium text-amber-700">+{formatCurrency(safeData.surcharge)}</span>
                                    </div>
                                )}
                                {safeData.penalty > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-red-700">Penalty</span>
                                        </div>
                                        <span className="font-medium text-red-700">+{formatCurrency(safeData.penalty)}</span>
                                    </div>
                                )}
                                {selectedDiscountType && safeData.discount > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-green-700">Discount</span>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-1.5 py-0">
                                                {selectedDiscountType}
                                            </Badge>
                                        </div>
                                        <span className="font-medium text-green-700">-{formatCurrency(safeData.discount)}</span>
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center pt-1">
                                <span className="font-bold text-gray-900">Total Amount</span>
                                <span className="text-primary font-bold text-lg">{formatCurrency(safeData.total_amount)}</span>
                            </div>
                            {safeData.payment_method === 'cash' && (
                                <div className="text-xs text-gray-500 text-center pt-1 italic">
                                    Please prepare exact amount for faster processing
                                </div>
                            )}
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
                                                <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700">
                                                    -10%
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedDiscountType && selectedDiscountType !== 'no_discount' && (
                                <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    10% discount has been applied to eligible items
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Receipt Preview */}
                <ReceiptPreview
                    orNumber={safeData.or_number}
                    paymentDate={safeData.payment_date}
                    payerName={data.payer_name}
                    totalAmount={safeData.total_amount}
                    paymentMethod={safeData.payment_method}
                    referenceNumber={safeData.reference_number}
                    purpose={safeData.purpose}
                    paymentItems={paymentItems}
                    isClearancePayment={isClearanceFeePayment}
                    certificateType={safeData.certificate_type}
                    clearanceTypes={clearanceTypes}
                />
            </div>
        </div>
    );
}

// Professional Receipt Preview Component
function ReceiptPreview({ 
    orNumber, 
    paymentDate, 
    payerName, 
    totalAmount,
    paymentMethod,
    referenceNumber,
    purpose,
    paymentItems = [],
    isClearancePayment = false,
    certificateType = '',
    clearanceTypes = {}
}: { 
    orNumber: string; 
    paymentDate: string; 
    payerName: string; 
    totalAmount: number;
    paymentMethod: string;
    referenceNumber: string;
    purpose: string;
    paymentItems?: PaymentItem[];
    isClearancePayment?: boolean;
    certificateType?: string;
    clearanceTypes?: Record<string, string>;
}) {
    const formatMethodName = (method: string) => {
        const methods: Record<string, string> = {
            'cash': 'Cash',
            'gcash': 'GCash',
            'maya': 'Maya',
            'bank': 'Bank Transfer',
            'check': 'Check',
            'online': 'Online Payment'
        };
        return methods[method] || method;
    };

    // Format date
    const formatDate = () => {
        if (!paymentDate) return '';
        try {
            return new Date(paymentDate).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });
        } catch (error) {
            return '';
        }
    };

    // Calculate totals from items
    const calculateTotals = () => {
        const subtotal = paymentItems.reduce((sum, item) => sum + item.base_amount, 0);
        const surcharge = paymentItems.reduce((sum, item) => sum + item.surcharge, 0);
        const penalty = paymentItems.reduce((sum, item) => sum + item.penalty, 0);
        return { subtotal, surcharge, penalty };
    };

    const totals = calculateTotals();
    const certificateName = certificateType && clearanceTypes[certificateType] 
        ? clearanceTypes[certificateType] 
        : certificateType;

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Receipt className="h-5 w-5 text-green-700" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Receipt Preview
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                        Live Preview
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {/* Receipt Container */}
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    {/* Receipt Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 text-center">
                        <h2 className="text-lg font-bold tracking-tight">BARANGAY GOVERNMENT</h2>
                        <p className="text-xs opacity-90 mt-1">Official Receipt</p>
                        {isClearancePayment && (
                            <div className="mt-2">
                                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                                    <FileBadge className="h-3 w-3 mr-1" />
                                    CERTIFICATE PAYMENT
                                </Badge>
                            </div>
                        )}
                    </div>
                    
                    {/* Receipt Body */}
                    <div className="p-4">
                        {/* Receipt Info */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">OR Number</div>
                                <div className="font-mono font-bold text-sm text-gray-900">{orNumber || 'BAR-20240101-001'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Date</div>
                                <div className="font-medium text-sm text-gray-900">{formatDate()}</div>
                            </div>
                        </div>

                        {/* Certificate Type */}
                        {isClearancePayment && certificateName && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileBadge className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-purple-900">Certificate Type:</span>
                                </div>
                                <div className="font-bold text-purple-800">{certificateName}</div>
                            </div>
                        )}

                        {/* Payer Info */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Paid By</div>
                            <div className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                                {payerName || 'Juan Dela Cruz'}
                            </div>
                        </div>

                        {/* Purpose */}
                        {purpose && (
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Purpose</div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                                    {purpose}
                                </div>
                            </div>
                        )}

                        {/* Items Summary */}
                        {paymentItems.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Items</div>
                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                        {paymentItems.length} items
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    {paymentItems.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className={`text-gray-700 truncate ${item.metadata?.is_clearance_fee ? 'font-medium' : ''}`}>
                                                {item.metadata?.is_clearance_fee && '✓ '}{item.fee_name}
                                            </span>
                                            <span className="font-medium text-gray-900">{formatCurrency(item.total_amount)}</span>
                                        </div>
                                    ))}
                                    {paymentItems.length > 3 && (
                                        <div className="text-xs text-gray-500 text-center">
                                            + {paymentItems.length - 3} more items
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="border-t border-gray-300 pt-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                                </div>
                                {totals.surcharge > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-amber-700">Surcharge</span>
                                        <span className="font-medium text-amber-700">+{formatCurrency(totals.surcharge)}</span>
                                    </div>
                                )}
                                {totals.penalty > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-red-700">Penalty</span>
                                        <span className="font-medium text-red-700">+{formatCurrency(totals.penalty)}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Total */}
                            <div className="mt-3 pt-3 border-t border-gray-400">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">TOTAL AMOUNT PAID</span>
                                    <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Payment Method</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-gray-100">
                                        {formatMethodName(paymentMethod)}
                                    </Badge>
                                    {referenceNumber && (
                                        <span className="text-xs text-gray-600">Ref: {referenceNumber}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificate Notice */}
                        {isClearancePayment && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileBadge className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-purple-800">Certificate Issuance</span>
                                </div>
                                <p className="text-sm text-purple-700">
                                    This payment confirms eligibility for {certificateName}. Certificate will be issued upon validation.
                                </p>
                            </div>
                        )}

                        {/* Signatures */}
                        <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="border-b border-gray-400 h-12 mb-1"></div>
                                <div className="text-xs text-gray-600">Treasurer</div>
                            </div>
                            <div>
                                <div className="border-b border-gray-400 h-12 mb-1"></div>
                                <div className="text-xs text-gray-600">Barangay Captain</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-300 text-center">
                            <div className="text-xs text-gray-500">
                                <div>Transaction ID: {orNumber}</div>
                                <div className="mt-1">Issued: {new Date().toLocaleDateString('en-PH')}</div>
                                <div className="mt-2 text-[10px] text-gray-400">
                                    This is an official receipt. Keep for your records.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Note */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-700">
                            This is a preview of how the official receipt will appear. All details shown here will be printed on the final document.
                        </div>
                    </div>
                    {isClearancePayment && (
                        <div className="mt-2 flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                                <Download className="h-3 w-3 mr-1" />
                                Download Receipt
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                                <Printer className="h-3 w-3 mr-1" />
                                Print Receipt
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}