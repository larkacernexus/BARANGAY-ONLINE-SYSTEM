// app/Pages/Admin/Payments/components/DiscountSelectionModal.tsx
import { Button } from '@/components/ui/button';
import { Tag, Info, Percent, BadgeCheck, Wallet } from 'lucide-react';
import { OutstandingFee, PaymentFormData } from '../types';

interface DiscountSelectionModalProps {
    showDiscountSelection: boolean;
    selectedOutstandingFee: OutstandingFee | null;
    selectedDiscount: string;
    setSelectedDiscount: (value: string) => void;
    setShowDiscountSelection: (value: boolean) => void;
    setSelectedOutstandingFee: (value: OutstandingFee | null) => void;
    handleAddOutstandingFeeDirectly: (fee: OutstandingFee) => void;
    handleAddOutstandingFeeWithDiscount: (fee: OutstandingFee, discountType: string) => void;
    data: PaymentFormData;
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
    data
}: DiscountSelectionModalProps) {
    if (!showDiscountSelection || !selectedOutstandingFee) return null;
    
    // Calculate the balance to pay
    const balanceToPay = parseFloat(selectedOutstandingFee.balance?.toString() || '0');
    const baseAmount = parseFloat(selectedOutstandingFee.base_amount?.toString() || '0');
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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
                        const discountedAmount = balanceToPay - discountAmount;
                        
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
                                    <div className="mt-2 text-sm">
                                        <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                            <span>Original Amount:</span>
                                            <span>{formatCurrency(balanceToPay)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600 font-medium">
                                            <span>You Save:</span>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                                            <span>Total to Pay:</span>
                                            <span className="text-primary">{formatCurrency(discountedAmount)}</span>
                                        </div>
                                    </div>
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
                        onClick={() => {
                            setShowDiscountSelection(false);
                            setSelectedDiscount('');
                            setSelectedOutstandingFee(null);
                            if (selectedOutstandingFee) {
                                handleAddOutstandingFeeDirectly(selectedOutstandingFee);
                            }
                        }}
                        className="border-gray-300 dark:border-gray-600"
                    >
                        <Wallet className="h-4 w-4 mr-2" />
                        No Discount
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (selectedDiscount && selectedOutstandingFee) {
                                console.log('🎯 Applying discount:', {
                                    feeId: selectedOutstandingFee.id,
                                    discountType: selectedDiscount,
                                    balance: balanceToPay,
                                    discountPercentage: selectedOutstandingFee.applicableDiscounts?.find(d => d.type === selectedDiscount)?.applicablePercentage
                                });
                                
                                handleAddOutstandingFeeWithDiscount(
                                    selectedOutstandingFee, 
                                    selectedDiscount
                                );
                            }
                            setShowDiscountSelection(false);
                            setSelectedDiscount('');
                            setSelectedOutstandingFee(null);
                        }}
                        disabled={!selectedDiscount || selectedOutstandingFee?.applicableDiscounts?.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Tag className="h-4 w-4 mr-2" />
                        Apply Discount
                    </Button>
                </div>
            </div>
        </div>
    );
}