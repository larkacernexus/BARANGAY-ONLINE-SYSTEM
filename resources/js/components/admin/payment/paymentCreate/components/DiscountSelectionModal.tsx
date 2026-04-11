// resources/js/components/admin/payment/paymentCreate/components/DiscountSelectionModal.tsx

import { Button } from '@/components/ui/button';
import { Tag, Info, Percent, BadgeCheck, Wallet, CheckCircle, X } from 'lucide-react';
import { OutstandingFee, PaymentFormData } from '@/types/admin/payments/payments';
import { useState, useEffect, useCallback } from 'react';

interface DiscountSelectionModalProps {
    showDiscountSelection: boolean;
    selectedOutstandingFee: OutstandingFee | null;
    selectedDiscount: string;
    setSelectedDiscount: (value: string) => void;
    setShowDiscountSelection: (value: boolean) => void;
    setSelectedOutstandingFee: (value: OutstandingFee | null) => void;
    handleAddOutstandingFeeDirectly: (fee: OutstandingFee) => void;
    handleAddOutstandingFeeWithDiscount: (fee: OutstandingFee, discountType: string, discountedAmount?: number) => void;
    data: PaymentFormData;
    onDiscountApplied?: (discountedAmount: number) => void;
    setData: {
        (key: string, value: any): void;
        (callback: (prev: PaymentFormData) => PaymentFormData): void;
    };
}

interface DiscountCalculation {
    originalAmount: number;
    discountAmount: number;
    discountedAmount: number;
    discountPercentage: number;
    baseAmount: number;
}

// Helper function to format currency
const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2)}`;
};

export default function DiscountSelectionModal({
    showDiscountSelection,
    selectedOutstandingFee,
    selectedDiscount,
    setSelectedDiscount,
    setShowDiscountSelection,
    setSelectedOutstandingFee,
    handleAddOutstandingFeeDirectly,
    handleAddOutstandingFeeWithDiscount,
    data,
    onDiscountApplied,
    setData
}: DiscountSelectionModalProps) {
    // ========== LOCAL STATE ==========
    const [calculatedDiscount, setCalculatedDiscount] = useState<DiscountCalculation | null>(null);

    // ========== EFFECTS ==========
    useEffect(() => {
        if (selectedOutstandingFee && selectedDiscount) {
            calculateDiscountDetails();
        } else {
            setCalculatedDiscount(null);
        }
    }, [selectedDiscount, selectedOutstandingFee]);

    // ========== HELPER FUNCTIONS ==========
    const calculateDiscountDetails = useCallback(() => {
        if (!selectedOutstandingFee) return;
        
        const balanceToPay = parseFloat(String(selectedOutstandingFee.balance ?? '0'));
        const baseAmount = parseFloat(String(selectedOutstandingFee.base_amount ?? selectedOutstandingFee.base_amount ?? '0'));
        
        // Find the selected discount
        const selectedDiscountObj = selectedOutstandingFee.applicableDiscounts?.find(
            d => d.type === selectedDiscount
        );
        
        if (selectedDiscountObj) {
            const discountPercentage = selectedDiscountObj.applicablePercentage || selectedDiscountObj.percentage || 0;
            
            // Calculate discount based on ORIGINAL amount (base_amount)
            const discountAmount = (baseAmount * discountPercentage) / 100;
            
            // Discounted amount = balance to pay - discount amount
            const discountedAmount = Math.max(0, balanceToPay - discountAmount);
            
            setCalculatedDiscount({
                originalAmount: balanceToPay,
                discountAmount,
                discountedAmount,
                discountPercentage,
                baseAmount
            });
            
            console.log('💰 Discount Calculation:', {
                baseAmount,
                balanceToPay,
                discountPercentage,
                discountAmount,
                discountedAmount
            });
        }
    }, [selectedOutstandingFee, selectedDiscount]);

    const getDiscountedAmount = useCallback((): number => {
        return calculatedDiscount?.discountedAmount || 0;
    }, [calculatedDiscount]);

    // ========== UPDATE AMOUNT PAID FIELD ==========
    const updateAmountPaidField = useCallback((amount: number) => {
        // Try multiple methods to update the amount field
        
        // Method 1: Try to find by common selectors
        const selectors = [
            'input[name="amount_paid"]',
            'input[name="tendered_amount"]',
            'input[name="payment_amount"]',
            'input[id="amount_paid"]',
            'input[placeholder*="amount"]',
            'input[placeholder*="Amount"]',
            'input[class*="amount"]',
            'input[type="number"][step="0.01"]',
            '.pl-8.text-lg.font-medium',
            'input[class*="tendered"]'
        ];
        
        let amountInput: HTMLInputElement | null = null;
        
        for (const selector of selectors) {
            amountInput = document.querySelector(selector) as HTMLInputElement;
            if (amountInput) {
                console.log(`✅ Found input with selector: ${selector}`);
                break;
            }
        }
        
        // Method 2: Try to find by label text
        if (!amountInput) {
            const labels = Array.from(document.querySelectorAll('label'));
            const amountLabel = labels.find(l => {
                const text = l.textContent?.toLowerCase() || '';
                return text.includes('amount tendered') || 
                       text.includes('cash received') || 
                       text.includes('amount paid') ||
                       text.includes('payment amount');
            });
            
            if (amountLabel) {
                const input = amountLabel.nextElementSibling?.querySelector('input') || 
                             amountLabel.parentElement?.querySelector('input');
                if (input) {
                    amountInput = input as HTMLInputElement;
                    console.log('✅ Found input via label');
                }
            }
        }
        
        // Method 3: Search all inputs with related names
        if (!amountInput) {
            const allInputs = document.querySelectorAll('input');
            for (let i = 0; i < allInputs.length; i++) {
                const input = allInputs[i];
                const inputName = (input.getAttribute('name') || '').toLowerCase();
                const inputId = (input.getAttribute('id') || '').toLowerCase();
                const inputClass = (input.getAttribute('class') || '').toLowerCase();
                const inputPlaceholder = (input.getAttribute('placeholder') || '').toLowerCase();
                
                if (inputName.includes('amount') || inputId.includes('amount') || 
                    inputClass.includes('amount') || inputPlaceholder.includes('amount') ||
                    inputName.includes('tendered') || inputClass.includes('tendered')) {
                    amountInput = input;
                    console.log(`✅ Found input by attributes: name=${inputName}, id=${inputId}`);
                    break;
                }
            }
        }
        
        if (amountInput) {
            // Update the value using direct property setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            )?.set;
            
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(amountInput, amount.toFixed(2));
            } else {
                amountInput.value = amount.toFixed(2);
            }
            
            // Dispatch all relevant events
            const events = ['input', 'change', 'blur', 'keyup'];
            events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true, cancelable: true });
                amountInput?.dispatchEvent(event);
            });
            
            // Also dispatch React-specific event
            const reactEvent = new InputEvent('input', { bubbles: true, cancelable: true });
            amountInput.dispatchEvent(reactEvent);
            
            console.log('💰 Updated amount field to:', amount.toFixed(2));
            
            // Visual feedback
            const originalBg = amountInput.style.backgroundColor;
            amountInput.style.backgroundColor = '#e6f7e6';
            amountInput.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
                if (amountInput) {
                    amountInput.style.backgroundColor = originalBg;
                }
            }, 500);
            
            return true;
        } else {
            console.warn('❌ Could not find amount input field');
            return false;
        }
    }, []);

    // ========== HANDLE APPLY DISCOUNT ==========
    const handleApplyDiscount = useCallback(() => {
        if (!selectedDiscount || !selectedOutstandingFee) return;
        
        const discountedAmount = getDiscountedAmount();
        
        console.log('🎯 Applying discount:', {
            feeId: selectedOutstandingFee.id,
            discountType: selectedDiscount,
            originalAmount: calculatedDiscount?.originalAmount,
            discountedAmount,
            discountPercentage: calculatedDiscount?.discountPercentage
        });
        
        // 1. Call parent handler with the discounted amount
        handleAddOutstandingFeeWithDiscount(
            selectedOutstandingFee, 
            selectedDiscount,
            discountedAmount
        );
        
        // 2. Update form data via setData
        if (setData) {
            // Update the amount_paid field
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    // Key/value pattern
                    setData('amount_paid', discountedAmount);
                    setData('discount_type', selectedDiscount);
                } else {
                    // Object/callback pattern
                    setData((prev: PaymentFormData) => ({
                        ...prev,
                        amount_paid: discountedAmount,
                        discount_type: selectedDiscount,
                        discount_amount: calculatedDiscount?.discountAmount || 0
                    }));
                }
            }
        }
        
        // 3. Direct DOM update for immediate visual feedback
        setTimeout(() => {
            updateAmountPaidField(discountedAmount);
        }, 50);
        
        // 4. Call onDiscountApplied callback
        if (onDiscountApplied) {
            onDiscountApplied(discountedAmount);
        }
        
        // 5. Close modal and reset state
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedOutstandingFee(null);
        setCalculatedDiscount(null);
        
    }, [selectedDiscount, selectedOutstandingFee, getDiscountedAmount, calculatedDiscount, 
        handleAddOutstandingFeeWithDiscount, setData, onDiscountApplied, 
        setShowDiscountSelection, setSelectedDiscount, setSelectedOutstandingFee, updateAmountPaidField]);

    // ========== HANDLE NO DISCOUNT ==========
    const handleNoDiscount = useCallback(() => {
        if (selectedOutstandingFee) {
            handleAddOutstandingFeeDirectly(selectedOutstandingFee);
        }
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedOutstandingFee(null);
        setCalculatedDiscount(null);
    }, [selectedOutstandingFee, handleAddOutstandingFeeDirectly, setShowDiscountSelection, 
        setSelectedDiscount, setSelectedOutstandingFee]);

    // ========== HANDLE CANCEL ==========
    const handleCancel = useCallback(() => {
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedOutstandingFee(null);
        setCalculatedDiscount(null);
    }, [setShowDiscountSelection, setSelectedDiscount, setSelectedOutstandingFee]);

    // ========== EARLY RETURN ==========
    if (!showDiscountSelection || !selectedOutstandingFee) return null;
    
    // Calculate values for display
    const balanceToPay = parseFloat(String(selectedOutstandingFee.balance ?? '0'));
    const discountedAmount = getDiscountedAmount();
    const hasDiscounts = selectedOutstandingFee.applicableDiscounts && 
                         selectedOutstandingFee.applicableDiscounts.length > 0;
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Apply Discount
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Select a discount type to apply to this fee
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                {/* Fee Information */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-medium text-blue-800 dark:text-blue-300">
                                {selectedOutstandingFee.fee_code || selectedOutstandingFee.fee_name}
                            </div>
                            <div className="text-blue-700 dark:text-blue-400">
                                {selectedOutstandingFee.category || 'Fee'}
                            </div>
                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Balance to pay: {formatCurrency(balanceToPay)}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Payer Information */}
                {data.payer_name && (
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                {data.payer_type === 'business' ? 'Business' : 'Resident'}: {data.payer_name}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Discount Options */}
                {hasDiscounts ? (
                    <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                        {selectedOutstandingFee.applicableDiscounts!.map((discount, index) => {
                            const discountPercentage = discount.applicablePercentage || discount.percentage || 0;
                            const baseAmount = parseFloat(String(selectedOutstandingFee.base_amount ?? selectedOutstandingFee.base_amount ?? '0'));
                            const discountAmount = (baseAmount * discountPercentage) / 100;
                            const itemDiscountedAmount = Math.max(0, balanceToPay - discountAmount);
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`relative flex items-start p-4 border rounded-lg transition-all cursor-pointer ${
                                        selectedDiscount === discount.type
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500 ring-opacity-20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() => setSelectedDiscount(discount.type)}
                                >
                                    <div className="flex items-center h-5">
                                        <input
                                            type="radio"
                                            id={`discount-${index}`}
                                            name="discount"
                                            value={discount.type}
                                            checked={selectedDiscount === discount.type}
                                            onChange={(e) => setSelectedDiscount(e.target.value)}
                                            className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                        />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <label htmlFor={`discount-${index}`} className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                                            {discount.label}
                                        </label>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                <Percent className="h-3 w-3" />
                                                {discountPercentage}% OFF
                                            </span>
                                            {discount.has_id && discount.id_number && (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    ID: {discount.id_number}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Show calculation for selected discount */}
                                        {selectedDiscount === discount.type && calculatedDiscount && (
                                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="text-sm space-y-2">
                                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                                        <span>Original Amount:</span>
                                                        <span>{formatCurrency(calculatedDiscount.originalAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-green-600 font-medium">
                                                        <span>Discount ({discountPercentage}%):</span>
                                                        <span>-{formatCurrency(calculatedDiscount.discountAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 pt-2 border-t border-green-200 dark:border-green-800">
                                                        <span>Amount to Pay:</span>
                                                        <span className="text-green-600 dark:text-green-400">
                                                            {formatCurrency(calculatedDiscount.discountedAmount)}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Show payment amount suggestion */}
                                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-xs font-medium">
                                                                Amount to enter: {formatCurrency(calculatedDiscount.discountedAmount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show preview for non-selected discounts */}
                                        {selectedDiscount !== discount.type && (
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Savings: {formatCurrency(discountAmount)} → Pay {formatCurrency(itemDiscountedAmount)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                No discounts are available for this fee type.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-gray-300 dark:border-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleNoDiscount}
                        className="border-gray-300 dark:border-gray-600"
                    >
                        <Wallet className="h-4 w-4 mr-2" />
                        No Discount
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!selectedDiscount || !hasDiscounts}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Tag className="h-4 w-4 mr-2" />
                        Apply Discount {discountedAmount > 0 && `(${formatCurrency(discountedAmount)})`}
                    </Button>
                </div>

                {/* Info Text */}
                {selectedDiscount && calculatedDiscount && calculatedDiscount.discountedAmount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        ⚡ The payment amount will be automatically set to {formatCurrency(calculatedDiscount.discountedAmount)}
                    </p>
                )}
            </div>
        </div>
    );
}