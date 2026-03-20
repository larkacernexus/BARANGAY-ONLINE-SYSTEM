// app/Pages/Admin/Payments/components/DiscountSelectionModal.tsx
import { Button } from '@/components/ui/button';
import { Tag, Info, Percent, BadgeCheck, Wallet, CheckCircle } from 'lucide-react';
import { OutstandingFee, PaymentFormData } from '../types';
import { useState, useEffect } from 'react';

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
    onDiscountApplied?: () => void;
    setData?: (data: any) => void;
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
    const [calculatedDiscount, setCalculatedDiscount] = useState<{
        originalAmount: number;
        discountAmount: number;
        discountedAmount: number;
        discountPercentage: number;
    } | null>(null);

    // ========== EFFECTS ==========
    useEffect(() => {
        if (selectedOutstandingFee && selectedDiscount) {
            calculateDiscountDetails();
        }
    }, [selectedDiscount, selectedOutstandingFee]);

    // ========== HELPER FUNCTIONS ==========
    const calculateDiscountDetails = () => {
        if (!selectedOutstandingFee) return;
        
        const balanceToPay = parseFloat(selectedOutstandingFee.balance?.toString() || '0');
        const baseAmount = parseFloat(selectedOutstandingFee.base_amount?.toString() || '0');
        
        // Find the selected discount
        const selectedDiscountObj = selectedOutstandingFee.applicableDiscounts?.find(
            d => d.type === selectedDiscount
        );
        
        if (selectedDiscountObj) {
            const discountPercentage = selectedDiscountObj.applicablePercentage || 0;
            
            // Calculate discount based on ORIGINAL amount (base_amount)
            const discountAmount = (baseAmount * discountPercentage) / 100;
            
            // Discounted amount = balance to pay - discount amount
            const discountedAmount = Math.max(0, balanceToPay - discountAmount);
            
            setCalculatedDiscount({
                originalAmount: balanceToPay,
                discountAmount,
                discountedAmount,
                discountPercentage
            });
            
            console.log('💰 Discount Calculation:', {
                baseAmount,
                balanceToPay,
                discountPercentage,
                discountAmount,
                discountedAmount
            });
        }
    };

    const getSelectedDiscountPercentage = (): number => {
        if (!selectedOutstandingFee || !selectedDiscount) return 0;
        
        const selectedDiscountObj = selectedOutstandingFee.applicableDiscounts?.find(
            d => d.type === selectedDiscount
        );
        
        return selectedDiscountObj?.applicablePercentage || 0;
    };

    const getDiscountedAmount = (): number => {
        return calculatedDiscount?.discountedAmount || 0;
    };

    // ========== DIRECT DOM UPDATE FUNCTION ==========
    const forceUpdateAmountPaidField = (amount: number) => {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            console.log('🔍 Searching for amount input field...');
            
            // Try multiple selectors to find the amount input
            const selectors = [
                'input[placeholder="0.00"]',
                'input[type="text"].pl-8',
                '.pl-8.text-lg.font-medium',
                'input[class*="pl-8"]',
                'input[class*="amount"]',
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
            
            // If still not found, try to find by label
            if (!amountInput) {
                const labels = Array.from(document.querySelectorAll('label'));
                const amountLabel = labels.find(l => 
                    l.textContent?.toLowerCase().includes('amount tendered') ||
                    l.textContent?.toLowerCase().includes('cash received')
                );
                
                if (amountLabel && amountLabel.nextElementSibling) {
                    const input = amountLabel.nextElementSibling.querySelector('input');
                    if (input) {
                        amountInput = input as HTMLInputElement;
                        console.log('✅ Found input via label');
                    }
                }
            }
            
            if (amountInput) {
                // Update the value
                amountInput.value = amount.toFixed(2);
                
                // Trigger all possible events
                const events = ['input', 'change', 'blur'];
                events.forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true });
                    amountInput?.dispatchEvent(event);
                });
                
                // Also try React's internal event system
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                )?.set;
                
                if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(amountInput, amount.toFixed(2));
                    const inputEvent = new Event('input', { bubbles: true });
                    amountInput.dispatchEvent(inputEvent);
                }
                
                console.log('💰 DIRECT DOM UPDATE: Set amount field to', amount.toFixed(2));
                
                // Highlight the field briefly to show it changed
                amountInput.style.backgroundColor = '#e6f7e6';
                setTimeout(() => {
                    if (amountInput) {
                        amountInput.style.backgroundColor = '';
                    }
                }, 500);
            } else {
                console.log('❌ Could not find amount input field');
                
                // Last resort: try to find any input with "amount" in name
                const allInputs = document.querySelectorAll('input');
                for (let i = 0; i < allInputs.length; i++) {
                    const input = allInputs[i];
                    const inputName = input.name || '';
                    const inputId = input.id || '';
                    const inputClass = input.className || '';
                    
                    if (inputName.includes('amount') || inputId.includes('amount') || 
                        inputClass.includes('amount') || inputClass.includes('tendered')) {
                        input.value = amount.toFixed(2);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        console.log('💰 Found input by attributes, updated to', amount.toFixed(2));
                        break;
                    }
                }
            }
        }, 100);
    };

    const handleApplyDiscount = () => {
        if (selectedDiscount && selectedOutstandingFee) {
            const discountedAmount = getDiscountedAmount();
            
            console.log('🎯 Applying discount with amount:', {
                feeId: selectedOutstandingFee.id,
                discountType: selectedDiscount,
                originalAmount: calculatedDiscount?.originalAmount,
                discountedAmount: discountedAmount,
                discountPercentage: calculatedDiscount?.discountPercentage
            });
            
            // 1. Pass to parent handler
            handleAddOutstandingFeeWithDiscount(
                selectedOutstandingFee, 
                selectedDiscount,
                discountedAmount
            );
            
            // 2. DIRECT DOM UPDATE - This will immediately update the input field
            forceUpdateAmountPaidField(discountedAmount);
            
            // 3. Update via setData if available
            if (setData) {
                if (typeof setData === 'function') {
                    if (setData.length === 2) {
                        // Key/value pattern
                        setData('amount_paid', discountedAmount);
                        setData('discount_type', selectedDiscount);
                    } else {
                        // Object pattern
                        setData((prev: PaymentFormData) => {
                            console.log('📝 setData: Setting amount_paid to', discountedAmount);
                            return {
                                ...prev,
                                amount_paid: discountedAmount,
                                discount_type: selectedDiscount
                            };
                        });
                    }
                }
            }
            
            // 4. Call callback
            if (onDiscountApplied) {
                onDiscountApplied();
            }
            
            // 5. Close modal
            setShowDiscountSelection(false);
            setSelectedDiscount('');
            setSelectedOutstandingFee(null);
            setCalculatedDiscount(null);
        }
    };

    const handleNoDiscount = () => {
        if (selectedOutstandingFee) {
            handleAddOutstandingFeeDirectly(selectedOutstandingFee);
        }
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedOutstandingFee(null);
        setCalculatedDiscount(null);
    };

    const handleCancel = () => {
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedOutstandingFee(null);
        setCalculatedDiscount(null);
    };

    if (!showDiscountSelection || !selectedOutstandingFee) return null;
    
    // Calculate the balance to pay
    const balanceToPay = parseFloat(selectedOutstandingFee.balance?.toString() || '0');
    const baseAmount = parseFloat(selectedOutstandingFee.base_amount?.toString() || '0');
    const discountedAmount = getDiscountedAmount();
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Tag className="h-5 w-5 text-green-600" />
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
                
                {/* Fee Information */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-medium text-blue-800 dark:text-blue-300">
                                {selectedOutstandingFee.fee_code}
                            </div>
                            <div className="text-blue-700 dark:text-blue-400">
                                {selectedOutstandingFee.fee_type_name || 'Fee'}
                            </div>
                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Balance to pay: {formatCurrency(balanceToPay)}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Resident Information */}
                {data.payer_name && (
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                Resident: {data.payer_name}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Discount Options */}
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                    {selectedOutstandingFee.applicableDiscounts?.map((discount, index) => {
                        const discountAmount = (baseAmount * discount.applicablePercentage) / 100;
                        const itemDiscountedAmount = balanceToPay - discountAmount;
                        
                        return (
                            <div 
                                key={index} 
                                className={`relative flex items-start p-4 border rounded-lg transition-all cursor-pointer ${
                                    selectedDiscount === discount.type
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500 ring-opacity-20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-gray-50 dark:hover:bg-gray-900'
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
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            <Percent className="h-3 w-3" />
                                            {discount.applicablePercentage}% OFF
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
                                                    <span>Discount ({discount.applicablePercentage}%):</span>
                                                    <span>-{formatCurrency(calculatedDiscount.discountAmount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 pt-2 border-t border-green-200 dark:border-green-800">
                                                    <span>Amount to Pay:</span>
                                                    <span className="text-primary">{formatCurrency(calculatedDiscount.discountedAmount)}</span>
                                                </div>
                                                
                                                {/* Show payment amount suggestion */}
                                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-xs font-medium">
                                                            Amount to enter in payment: {formatCurrency(calculatedDiscount.discountedAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* No Discounts Available */}
                {selectedOutstandingFee.applicableDiscounts?.length === 0 && (
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
                        disabled={!selectedDiscount || selectedOutstandingFee?.applicableDiscounts?.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Tag className="h-4 w-4 mr-2" />
                        Apply Discount (₱{discountedAmount.toFixed(2)})
                    </Button>
                </div>

                {/* Info Text */}
                {selectedDiscount && calculatedDiscount && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center font-semibold">
                        ⚡ The payment amount will be automatically set to {formatCurrency(calculatedDiscount.discountedAmount)}
                    </p>
                )}
            </div>
        </div>
    );
}