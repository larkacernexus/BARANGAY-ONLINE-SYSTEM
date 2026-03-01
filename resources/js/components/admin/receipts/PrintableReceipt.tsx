// resources/js/components/admin/receipts/PrintableReceipt.tsx

import React, { forwardRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { route } from 'ziggy-js';

interface ReceiptItem {
    fee_name: string;
    fee_code?: string;
    base_amount: number | string;
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
    payment_id?: number; // Optional: to link back to original payment
    clearance_request_id?: number | null; // Optional: to link to clearance request
}

interface Props {
    receipt: ReceiptData;
    barangay?: {
        name: string;
        address: string;
        logo?: string;
    };
    copyType?: 'original' | 'duplicate' | 'triplicate';
    showSaveButton?: boolean; // Whether to show the save button
    onSave?: () => void; // Callback after successful save
}

const PrintableReceipt = forwardRef<HTMLDivElement, Props>(({ 
    receipt, 
    barangay = {
        name: 'Barangay San Vicente',
        address: 'San Vicente, City of San Fernando, La Union',
    },
    copyType = 'original',
    showSaveButton = true,
    onSave
}, ref) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    // Helper function to safely convert to number
    const toNumber = (value: number | string | undefined): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        return parseFloat(value) || 0;
    };

    // Helper function to safely format currency
    const formatCurrency = (value: number | string | undefined): string => {
        const num = toNumber(value);
        return num.toFixed(2);
    };

    const numberToWords = (num: number | string) => {
        const numericValue = toNumber(num);
        if (numericValue === 0) return 'Zero Pesos Only';
        
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convert = (n: number): string => {
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
            if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
            return '';
        };

        const whole = Math.floor(numericValue);
        const cents = Math.round((numericValue - whole) * 100);

        if (cents === 0) {
            return convert(whole) + ' Pesos Only';
        }
        return convert(whole) + ' Pesos and ' + convert(cents) + ' Centavos Only';
    };

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

        // Prepare the receipt data for saving
        const receiptData = {
            payment_id: receipt.payment_id || null,
            clearance_request_id: receipt.clearance_request_id || null,
            or_number: receipt.or_number,
            receipt_number: receipt.receipt_number,
            receipt_type: receipt.receipt_type,
            payer_name: receipt.payer_name,
            payer_address: receipt.payer_address,
            subtotal: toNumber(receipt.subtotal),
            surcharge: toNumber(receipt.surcharge),
            penalty: toNumber(receipt.penalty),
            discount: toNumber(receipt.discount),
            total_amount: toNumber(receipt.total_amount),
            amount_paid: toNumber(receipt.amount_paid),
            change_due: toNumber(receipt.change_due),
            payment_method: receipt.payment_method,
            reference_number: receipt.reference_number,
            payment_date: receipt.formatted_payment_date,
            issued_date: receipt.formatted_issued_date,
            issued_by: receipt.issued_by,
            fee_breakdown: receipt.fee_breakdown.map(fee => ({
                fee_name: fee.fee_name,
                fee_code: fee.fee_code,
                base_amount: toNumber(fee.base_amount),
                total_amount: toNumber(fee.total_amount)
            })),
            notes: receipt.notes,
            metadata: {
                saved_from: 'print_preview',
                saved_at: new Date().toISOString()
            }
        };

        // Send to server
        router.post(route('receipts.store'), receiptData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setSaveStatus('success');
                setSaveMessage('Receipt saved successfully!');
                if (onSave) onSave();
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage('');
                }, 3000);
            },
            onError: (errors) => {
                setIsSaving(false);
                setSaveStatus('error');
                setSaveMessage(errors.error || 'Failed to save receipt. Please try again.');
                
                // Clear error message after 5 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage('');
                }, 5000);
            }
        });
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
            {/* Save Button Overlay - Only show when not printing */}
            {showSaveButton && (
                <div className="print:hidden absolute top-4 right-4 z-50">
                    <div className="flex flex-col items-end gap-2">
                        {saveStatus === 'success' && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{saveMessage}</span>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{saveMessage}</span>
                            </div>
                        )}
                        <Button
                            onClick={handleSaveToReceipts}
                            disabled={isSaving || saveStatus === 'success'}
                            variant={saveStatus === 'success' ? "outline" : "default"}
                            className="shadow-lg"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : saveStatus === 'success' ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save to Receipts
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Receipt Content */}
            <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto relative">
                {/* Copy Type Watermark */}
                {copyType !== 'original' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-8xl font-bold text-gray-200 opacity-30 pointer-events-none select-none">
                        {getCopyTypeText()}
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                    {barangay.logo && (
                        <img 
                            src={barangay.logo} 
                            alt={barangay.name} 
                            className="h-20 w-20 mx-auto mb-4"
                        />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">{barangay.name}</h1>
                    <p className="text-gray-600">{barangay.address}</p>
                    <p className="text-sm text-gray-500 mt-2">Tel No: (072) 123-4567 • Email: info@barangay.gov.ph</p>
                </div>

                {/* Receipt Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                        {receipt.receipt_type_label}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{getCopyTypeText()}</p>
                </div>

                {/* Receipt Number and Date */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <p className="text-sm text-gray-600">Receipt No:</p>
                        <p className="text-xl font-bold text-gray-900">{receipt.receipt_number}</p>
                        {receipt.or_number && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">OR No:</p>
                                <p className="text-lg font-semibold text-gray-800">{receipt.or_number}</p>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Date Issued:</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(receipt.formatted_issued_date)}</p>
                        <p className="text-sm text-gray-600 mt-2">Payment Date:</p>
                        <p className="text-base text-gray-800">{receipt.formatted_payment_date}</p>
                    </div>
                </div>

                {/* Payer Information */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Received from:</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name:</p>
                            <p className="text-lg font-semibold text-gray-900">{receipt.payer_name}</p>
                        </div>
                        {receipt.payer_address && (
                            <div>
                                <p className="text-sm text-gray-600">Address:</p>
                                <p className="text-base text-gray-800">{receipt.payer_address}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount in Words */}
                <div className="mb-8 p-4 border border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Amount in Words:</p>
                    <p className="text-lg font-semibold text-gray-900 uppercase">
                        {numberToWords(totalAmount)}
                    </p>
                </div>

                {/* Fee Breakdown Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border border-gray-300">
                                    Particulars
                                </th>
                                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 border border-gray-300">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.fee_breakdown.map((fee, index) => {
                                const baseAmount = toNumber(fee.base_amount);
                                return (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border border-gray-300">
                                            <span className="font-medium">{fee.fee_name}</span>
                                            {fee.fee_code && (
                                                <span className="text-xs text-gray-500 ml-2">({fee.fee_code})</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right border border-gray-300 font-mono">
                                            ₱{formatCurrency(baseAmount)}
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {/* Subtotal */}
                            <tr className="bg-gray-50">
                                <td className="py-2 px-4 border border-gray-300 font-medium">Subtotal</td>
                                <td className="py-2 px-4 text-right border border-gray-300 font-mono">
                                    {receipt.formatted_subtotal || `₱${formatCurrency(subtotal)}`}
                                </td>
                            </tr>

                            {/* Additional Charges */}
                            {surcharge > 0 && (
                                <tr>
                                    <td className="py-2 px-4 border border-gray-300">Surcharge</td>
                                    <td className="py-2 px-4 text-right border border-gray-300 font-mono">
                                        {receipt.formatted_surcharge || `₱${formatCurrency(surcharge)}`}
                                    </td>
                                </tr>
                            )}
                            {penalty > 0 && (
                                <tr>
                                    <td className="py-2 px-4 border border-gray-300">Penalty</td>
                                    <td className="py-2 px-4 text-right border border-gray-300 font-mono">
                                        {receipt.formatted_penalty || `₱${formatCurrency(penalty)}`}
                                    </td>
                                </tr>
                            )}
                            
                            {/* Discount */}
                            {discount > 0 && (
                                <tr className="text-green-600">
                                    <td className="py-2 px-4 border border-gray-300">Discount</td>
                                    <td className="py-2 px-4 text-right border border-gray-300 font-mono">
                                        -{receipt.formatted_discount || `₱${formatCurrency(discount)}`}
                                    </td>
                                </tr>
                            )}

                            {/* Total */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="py-3 px-4 border border-gray-300">TOTAL AMOUNT</td>
                                <td className="py-3 px-4 text-right border border-gray-300 font-mono text-lg">
                                    {receipt.formatted_total || `₱${formatCurrency(totalAmount)}`}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Details */}
                <div className="mb-8 grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Payment Method
                        </h3>
                        <p className="text-base">{receipt.payment_method_label}</p>
                        {receipt.reference_number && (
                            <p className="text-sm text-gray-600 mt-1">
                                Ref No: {receipt.reference_number}
                            </p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Payment Summary
                        </h3>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Amount Paid:</span>
                                <span className="font-mono font-medium text-green-600">
                                    {receipt.formatted_amount_paid || `₱${formatCurrency(amountPaid)}`}
                                </span>
                            </div>
                            {changeDue > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Change Due:</span>
                                    <span className="font-mono font-medium text-blue-600">
                                        {receipt.formatted_change || `₱${formatCurrency(changeDue)}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {receipt.notes && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Notes:</p>
                        <p className="text-gray-600">{receipt.notes}</p>
                    </div>
                )}

                {/* Signatures */}
                <div className="mt-12 pt-8 border-t-2 border-gray-300">
                    <div className="grid grid-cols-2 gap-16">
                        <div className="text-center">
                            <div className="h-16 mb-2"></div>
                            <p className="font-semibold text-gray-900">MARIA SANTOS</p>
                            <p className="text-sm text-gray-600">Barangay Treasurer</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 mb-2"></div>
                            <p className="font-semibold text-gray-900">HON. JUAN DELA CRUZ</p>
                            <p className="text-sm text-gray-600">Barangay Captain</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 text-center text-sm text-gray-500 border-t border-gray-200">
                    <p>This is a computer-generated receipt. No signature required.</p>
                    <p className="mt-1">Generated by {receipt.issued_by} • {barangay.name}</p>
                </div>
            </div>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';

export default PrintableReceipt;