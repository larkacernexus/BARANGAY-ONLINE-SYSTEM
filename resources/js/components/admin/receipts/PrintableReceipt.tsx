// resources/js/components/admin/receipts/PrintableReceipt.tsx

import React, { forwardRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Printer,
    Download,
    MapPin,
    Phone,
    FileDigit,
    BadgeCheck,
    Shield,
    QrCode,
    Info,
    ClipboardList,
    User,
    Users,
    CreditCard,
    DollarSign,
    Building,
    FileCheck,
    Hash,
    Calendar,
    X,
    Receipt as ReceiptIcon
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';

interface ReceiptItem {
    fee_name: string;
    fee_code?: string;
    description?: string;
    base_amount: number | string;
    surcharge?: number | string;
    penalty?: number | string;
    total_amount: number | string;
}

interface ReceiptData {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    payer_type?: 'resident' | 'household';
    contact_number?: string;
    subtotal: number | string;
    surcharge: number | string;
    penalty: number | string;
    discount: number | string;
    total_amount: number | string;
    amount_paid: number | string;
    change_due: number | string;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: string;
    payment_method_label: string;
    reference_number: string | null;
    formatted_payment_date: string;
    formatted_issued_date: string;
    issued_by: string;
    fee_breakdown: ReceiptItem[];
    notes: string | null;
    payment_id?: number;
    clearance_request_id?: number | null;
    purpose?: string;
    collection_type?: string;
    remarks?: string;
    certificate_type?: string;
    certificate_type_display?: string;
}

interface Props {
    receipt: ReceiptData;
    barangay?: {
        name: string;
        address: string;
        contact?: string;
        logo?: string;
        bir_reg_no?: string;
    };
    officer?: {
        name: string;
        position: string;
        signature?: string;
    };
    copyType?: 'original' | 'duplicate' | 'triplicate';
    showSaveButton?: boolean;
    onSave?: () => void;
    onPrint?: () => void;
    onDownload?: () => void;
    onClose?: () => void;
    isModal?: boolean;
}

// Helper function to format currency
const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return '₱0.00';
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

// Helper function to safely convert to number
const toNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
};

const getPaymentMethodIcon = (method: string) => {
    switch (method) {
        case 'cash': return <DollarSign className="h-3 w-3" />;
        case 'gcash':
        case 'maya':
        case 'online':
            return <CreditCard className="h-3 w-3" />;
        case 'bank':
            return <Building className="h-3 w-3" />;
        case 'check':
            return <FileCheck className="h-3 w-3" />;
        default: return <CreditCard className="h-3 w-3" />;
    }
};

const getPaymentMethodColor = (method: string) => {
    switch (method) {
        case 'cash': return 'bg-green-50 text-green-700 border-green-200';
        case 'gcash': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'maya': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'online': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        case 'bank': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'check': return 'bg-amber-50 text-amber-700 border-amber-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getPayerIcon = (type?: string) => {
    return type === 'resident' ? 
        <User className="h-3 w-3" /> : 
        <Users className="h-3 w-3" />;
};

const numberToWords = (num: number | string) => {
    const numericValue = toNumber(num);
    if (numericValue === 0) return 'Zero Pesos Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const units = ['', 'Thousand', 'Million', 'Billion'];

    const convert = (n: number): string => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        return '';
    };

    let whole = Math.floor(numericValue);
    let words = '';
    let unitIndex = 0;

    while (whole > 0) {
        const chunk = whole % 1000;
        if (chunk !== 0) {
            const chunkWords = convert(chunk);
            words = chunkWords + (units[unitIndex] ? ' ' + units[unitIndex] : '') + ' ' + words;
        }
        whole = Math.floor(whole / 1000);
        unitIndex++;
    }

    const cents = Math.round((numericValue - Math.floor(numericValue)) * 100);
    
    if (cents === 0) {
        return words.trim() + ' Pesos Only';
    }
    
    const centsWords = cents < 20 ? 
        teens[cents] || ones[cents] : 
        tens[Math.floor(cents / 10)] + (cents % 10 ? ' ' + ones[cents % 10] : '');
    
    return words.trim() + ' Pesos and ' + centsWords + ' Centavos Only';
};

const PrintableReceipt = forwardRef<HTMLDivElement, Props>(({ 
    receipt, 
    barangay = {
        name: 'Barangay San Vicente',
        address: 'San Vicente, City of San Fernando, La Union',
        contact: '(072) 123-4567',
        bir_reg_no: 'XXXX-XXXX-XXXX'
    },
    officer = {
        name: 'MARIA SANTOS',
        position: 'Barangay Treasurer'
    },
    copyType = 'original',
    showSaveButton = true,
    onSave,
    onPrint,
    onDownload,
    onClose,
    isModal = true
}, ref) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const getCopyTypeText = () => {
        switch(copyType) {
            case 'original': return 'ORIGINAL COPY';
            case 'duplicate': return 'DUPLICATE COPY';
            case 'triplicate': return 'TRIPLICATE COPY';
            default: return '';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSaveToReceipts = () => {
        setIsSaving(true);
        setSaveStatus('idle');
        setSaveMessage('');

        // Check if we have a payment_id
        if (!receipt.payment_id) {
            setSaveStatus('error');
            setSaveMessage('Cannot save: No associated payment found. Please create a payment first.');
            setIsSaving(false);
            
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage('');
            }, 5000);
            return;
        }

        // Map receipt_type to valid values expected by controller
        let mappedReceiptType = receipt.receipt_type;
        
        // Map common values to valid enum values
        if (receipt.receipt_type === 'payment' || receipt.receipt_type === 'official_receipt' || receipt.receipt_type === 'official') {
            mappedReceiptType = 'official';
        } else if (receipt.receipt_type === 'clearance_receipt' || receipt.receipt_type === 'clearance') {
            mappedReceiptType = 'clearance';
        } else if (receipt.receipt_type === 'certificate_receipt' || receipt.receipt_type === 'certificate') {
            mappedReceiptType = 'certificate';
        } else if (receipt.receipt_type === 'fee_receipt' || receipt.receipt_type === 'fee') {
            mappedReceiptType = 'fee';
        } else {
            // Default to official if unknown
            mappedReceiptType = 'official';
        }
        
        // Ensure it's one of the valid values
        const validTypes = ['official', 'clearance', 'certificate', 'fee'];
        if (!validTypes.includes(mappedReceiptType)) {
            mappedReceiptType = 'official'; // Default to official
        }

        // Prepare the data according to what the controller expects
        const receiptData = {
            payment_id: receipt.payment_id,
            receipt_type: mappedReceiptType,
            notes: receipt.notes || null,
        };

        console.log('Saving receipt with data:', receiptData);

        // Send to server with retry logic
        const saveReceipt = (retryCount = 0) => {
            router.post(route('admin.receipts.store'), receiptData, {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Success response:', page);
                    setIsSaving(false);
                    setSaveStatus('success');
                    setSaveMessage('Receipt saved successfully!');
                    if (onSave) onSave();
                    
                    setTimeout(() => {
                        setSaveStatus('idle');
                        setSaveMessage('');
                    }, 3000);
                },
                onError: (errors) => {
                    console.error('Error response:', errors);
                    
                    // Check if it's a "receipt already exists" error
                    const errorMessage = typeof errors === 'object' ? Object.values(errors).flat().join(', ') : errors;
                    
                    if (errorMessage.includes('already exists') && retryCount < 2) {
                        // Retry up to 2 times if receipt already exists (race condition)
                        console.log(`Receipt may already exist, retrying... (${retryCount + 1}/2)`);
                        setTimeout(() => saveReceipt(retryCount + 1), 500);
                        return;
                    }
                    
                    setIsSaving(false);
                    setSaveStatus('error');
                    
                    // Format error message
                    let displayMessage = 'Failed to save receipt. ';
                    if (typeof errors === 'object') {
                        const errorList = Object.values(errors).flat();
                        if (errorList.length > 0) {
                            displayMessage = errorList.join(', ');
                        } else {
                            displayMessage += 'Please check the form and try again.';
                        }
                    } else {
                        displayMessage += errors || 'Please try again.';
                    }
                    
                    setSaveMessage(displayMessage);
                    
                    setTimeout(() => {
                        setSaveStatus('idle');
                        setSaveMessage('');
                    }, 5000);
                },
                onFinish: () => {
                    console.log('Request finished');
                }
            });
        };

        // Start the save with retry logic
        saveReceipt();
    };

    // Extract numeric values
    const subtotal = toNumber(receipt.subtotal);
    const surcharge = toNumber(receipt.surcharge);
    const penalty = toNumber(receipt.penalty);
    const discount = toNumber(receipt.discount);
    const totalAmount = toNumber(receipt.total_amount);
    const amountPaid = toNumber(receipt.amount_paid);
    const changeDue = toNumber(receipt.change_due);

    return (
        <div className="relative">
            {/* Modal Header */}
            {isModal && (
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <ReceiptIcon className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Receipt Preview</h3>
                        {copyType !== 'original' && (
                            <Badge variant="outline" className="text-xs">
                                {getCopyTypeText()}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {onDownload && (
                            <Button onClick={onDownload} size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                        {onPrint && (
                            <Button onClick={onPrint} size="sm" variant="outline">
                                <Printer className="h-4 w-4" />
                            </Button>
                        )}
                        {showSaveButton && receipt.payment_id && (
                            <Button
                                onClick={handleSaveToReceipts}
                                size="sm"
                                disabled={isSaving || saveStatus === 'success'}
                                variant={saveStatus === 'success' ? "outline" : "default"}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : saveStatus === 'success' ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        {onClose && (
                            <Button onClick={onClose} size="sm" variant="ghost">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {saveStatus !== 'idle' && (
                <div className={`mx-4 my-2 px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    saveStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {saveStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{saveMessage}</span>
                </div>
            )}

            {/* No Payment ID Warning */}
            {showSaveButton && !receipt.payment_id && (
                <div className="mx-4 my-2 px-3 py-2 rounded-lg flex items-center gap-2 text-sm bg-yellow-100 text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>Cannot save: No associated payment found.</span>
                </div>
            )}

            {/* Scrollable Receipt Content - Scaled down version */}
            <div className="max-h-[70vh] overflow-y-auto p-4">
                <div ref={ref} className="bg-white max-w-md mx-auto relative scale-[0.85] origin-top">
                    {/* Watermark */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 font-black text-7xl text-center rotate-45 flex items-center justify-center select-none">
                        {barangay.name}
                    </div>

                    {/* Copy Type Watermark */}
                    {copyType !== 'original' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-6xl font-bold text-gray-200 opacity-30 pointer-events-none select-none">
                            {getCopyTypeText()}
                        </div>
                    )}

                    {/* Barangay Header */}
                    <div className="text-center border-b-2 border-gray-900 pb-6 mb-6 relative">
                        {barangay.logo && (
                            <div className="flex justify-center mb-4">
                                <img 
                                    src={barangay.logo} 
                                    alt="Barangay Seal" 
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                        )}
                        <h1 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-1">
                            {barangay.name}
                        </h1>
                        <div className="text-[10px] tracking-widest text-gray-500 mb-2">
                            BARANGAY GOVERNMENT UNIT
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center justify-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {barangay.address}
                            </div>
                            {barangay.contact && (
                                <div className="flex items-center justify-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {barangay.contact}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Receipt Title */}
                    <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-5 mb-6 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                        <div className="relative">
                            <div className="text-3xl font-black uppercase tracking-widest text-white mb-1">
                                {receipt.receipt_type_label || 'OFFICIAL RECEIPT'}
                            </div>
                            <div className="text-xs text-gray-300 tracking-widest">
                                {getCopyTypeText()} • VALID ONLY WITH OFFICIAL SEAL
                            </div>
                            {barangay.bir_reg_no && (
                                <div className="absolute -top-2 -right-2 bg-white text-gray-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    BIR Reg. No. {barangay.bir_reg_no}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Receipt Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                                    Receipt Details
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Receipt No:</span>
                                        <span className="font-mono font-bold text-sm text-gray-900">{receipt.receipt_number}</span>
                                    </div>
                                    {receipt.or_number && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">OR Number:</span>
                                            <span className="font-mono font-bold text-sm text-gray-900">{receipt.or_number}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Date Issued:</span>
                                        <span className="text-sm font-medium text-gray-900">{formatDate(receipt.formatted_issued_date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Payment Date:</span>
                                        <span className="text-sm font-medium text-gray-900">{receipt.formatted_payment_date}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Payment Method:</span>
                                        <Badge className={`${getPaymentMethodColor(receipt.payment_method)} text-xs py-0`}>
                                            {getPaymentMethodIcon(receipt.payment_method)}
                                            <span className="ml-1">{receipt.payment_method_label}</span>
                                        </Badge>
                                    </div>
                                    {receipt.reference_number && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Reference No:</span>
                                            <span className="font-mono text-sm font-medium text-gray-900">{receipt.reference_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Transaction Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <ClipboardList className="h-4 w-4 text-blue-600" />
                                <div className="font-semibold text-sm text-gray-900">Transaction Summary</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-mono font-medium">{receipt.formatted_subtotal || formatCurrency(subtotal)}</span>
                                </div>
                                {surcharge > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-amber-700">Surcharge</span>
                                        <span className="font-mono font-medium text-amber-700">+{receipt.formatted_surcharge || formatCurrency(surcharge)}</span>
                                    </div>
                                )}
                                {penalty > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-red-700">Penalty</span>
                                        <span className="font-mono font-medium text-red-700">+{receipt.formatted_penalty || formatCurrency(penalty)}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-green-700">Discount</span>
                                        <span className="font-mono font-medium text-green-700">-{receipt.formatted_discount || formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-blue-200 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm text-gray-900">Total Amount</span>
                                        <span className="text-xl font-bold text-gray-900">{receipt.formatted_total || formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payer Information */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            {getPayerIcon(receipt.payer_type)}
                            <h3 className="text-sm font-semibold text-gray-900">PAYER INFORMATION</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                                        Payer Details
                                    </div>
                                    <div className="space-y-1.5">
                                        <div>
                                            <div className="text-xs text-gray-600">Name</div>
                                            <div className="font-semibold text-sm text-gray-900">{receipt.payer_name}</div>
                                        </div>
                                        {receipt.payer_type && (
                                            <div>
                                                <div className="text-xs text-gray-600">Type</div>
                                                <Badge className="bg-gray-100 text-gray-700 text-xs">
                                                    {receipt.payer_type === 'resident' ? 'Individual Resident' : 'Household Account'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {(receipt.payer_address || receipt.contact_number) && (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                                            Contact Information
                                        </div>
                                        <div className="space-y-1.5">
                                            {receipt.contact_number && (
                                                <div>
                                                    <div className="text-xs text-gray-600">Contact Number</div>
                                                    <div className="font-medium text-sm text-gray-900">{receipt.contact_number}</div>
                                                </div>
                                            )}
                                            {receipt.payer_address && (
                                                <div>
                                                    <div className="text-xs text-gray-600">Address</div>
                                                    <div className="font-medium text-sm text-gray-900">{receipt.payer_address}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fee Breakdown Table */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <FileDigit className="h-4 w-4 text-gray-700" />
                            <h3 className="text-sm font-semibold text-gray-900">PAYMENT BREAKDOWN</h3>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {receipt.fee_breakdown.map((fee, index) => {
                                        const feeTotal = toNumber(fee.total_amount);
                                        
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="py-2 px-3">
                                                    <div className="font-medium text-gray-900">{fee.fee_name}</div>
                                                    {fee.fee_code && (
                                                        <div className="mt-0.5">
                                                            <Badge variant="outline" className="text-[8px] bg-gray-100 py-0">
                                                                {fee.fee_code}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono font-medium">
                                                    {formatCurrency(feeTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    
                                    {/* Additional Charges */}
                                    {surcharge > 0 && (
                                        <tr>
                                            <td className="py-1.5 px-3 text-gray-600">Surcharge</td>
                                            <td className="py-1.5 px-3 text-right font-mono text-amber-700">
                                                +{receipt.formatted_surcharge || formatCurrency(surcharge)}
                                            </td>
                                        </tr>
                                    )}
                                    {penalty > 0 && (
                                        <tr>
                                            <td className="py-1.5 px-3 text-gray-600">Penalty</td>
                                            <td className="py-1.5 px-3 text-right font-mono text-red-700">
                                                +{receipt.formatted_penalty || formatCurrency(penalty)}
                                            </td>
                                        </tr>
                                    )}
                                    
                                    {/* Discount */}
                                    {discount > 0 && (
                                        <tr className="text-green-600">
                                            <td className="py-1.5 px-3">Discount</td>
                                            <td className="py-1.5 px-3 text-right font-mono">
                                                -{receipt.formatted_discount || formatCurrency(discount)}
                                            </td>
                                        </tr>
                                    )}

                                    {/* Total */}
                                    <tr className="bg-gray-100 font-bold">
                                        <td className="py-2 px-3">TOTAL AMOUNT</td>
                                        <td className="py-2 px-3 text-right font-mono text-base">
                                            {receipt.formatted_total || formatCurrency(totalAmount)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-700 mb-1">Amount in Words:</div>
                        <div className="font-medium text-xs text-gray-900 italic">
                            "{numberToWords(totalAmount)}"
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Payment Method
                            </h3>
                            <p className="text-sm">{receipt.payment_method_label}</p>
                            {receipt.reference_number && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Ref No: {receipt.reference_number}
                                </p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                Payment Summary
                            </h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-mono font-medium text-green-600">
                                        {receipt.formatted_amount_paid || formatCurrency(amountPaid)}
                                    </span>
                                </div>
                                {changeDue > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Change Due:</span>
                                        <span className="font-mono font-medium text-blue-600">
                                            {receipt.formatted_change || formatCurrency(changeDue)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certificate Information */}
                    {receipt.certificate_type && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <BadgeCheck className="h-4 w-4 text-green-600" />
                                <h4 className="font-semibold text-sm text-green-900">CERTIFICATE ISSUED</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-green-700 font-medium">Certificate Type</div>
                                    <div className="font-semibold text-sm text-green-900">{receipt.certificate_type_display || receipt.certificate_type}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-green-700 font-medium">Status</div>
                                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                        Issued & Processed
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {receipt.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-semibold text-gray-700 mb-1">Notes:</p>
                            <p className="text-xs text-gray-600">{receipt.notes}</p>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="mt-8 pt-6 border-t border-gray-300">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-center">
                                <div className="mb-4">
                                    <div className="text-[10px] font-semibold text-gray-700 mb-1">
                                        Prepared By:
                                    </div>
                                    <div className="font-bold text-sm text-gray-900">{receipt.issued_by}</div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-400 w-40 mx-auto">
                                    <div className="text-[8px] text-gray-600">Signature over Printed Name</div>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="mb-4">
                                    <div className="text-[10px] font-semibold text-gray-700 mb-1">
                                        Received By:
                                    </div>
                                    <div className="font-bold text-sm text-gray-900">{officer.name}</div>
                                    <div className="text-xs text-gray-600">{officer.position}</div>
                                </div>
                                {officer.signature ? (
                                    <div className="mt-4">
                                        <img 
                                            src={officer.signature} 
                                            alt="Signature" 
                                            className="h-12 mx-auto mb-2"
                                        />
                                        <div className="border-t border-gray-400 w-40 mx-auto pt-1">
                                            <div className="text-[8px] text-gray-600">Authorized Signature</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-8 pt-6 border-t border-gray-400 w-40 mx-auto">
                                        <div className="text-[8px] text-gray-600">Signature over Printed Name</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Receipt Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center">
                        <div className="mb-3">
                            <div className="font-semibold text-xs text-gray-900 mb-1">
                                <Shield className="h-3 w-3 inline mr-1" />
                                THIS IS AN OFFICIAL RECEIPT
                            </div>
                            <div className="text-[10px] text-gray-600">
                                Valid for accounting and legal purposes
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[8px] text-gray-500">
                            <div className="flex items-center gap-1">
                                <Hash className="h-2 w-2" />
                                Receipt No: {receipt.receipt_number}
                            </div>
                            <div className="hidden sm:block">•</div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-2 w-2" />
                                Generated: {new Date().toLocaleDateString('en-PH')}
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="mt-4 flex justify-center">
                        <div className="bg-gray-100 p-2 rounded-lg inline-flex flex-col items-center">
                            <QrCode className="h-12 w-12 text-gray-400" />
                            <div className="mt-1 text-[6px] text-gray-500">
                                Scan to verify
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';

export default PrintableReceipt;