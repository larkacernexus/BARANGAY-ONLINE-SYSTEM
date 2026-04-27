// resources/js/Pages/Admin/Fees/components/fee-computation-tab.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Calculator,
    Receipt,
    Percent,
    Tag,
} from 'lucide-react';
import { Fee, PaymentHistory, DiscountItem, ComputationDetails } from '@/types/admin/fees/fees';

// ========== TYPES ==========


interface FeeComputationTabProps {
    fee: Fee;
    paymentHistory: PaymentHistory[];
    computationDetails: ComputationDetails | null;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeeComputationTab: React.FC<FeeComputationTabProps> = ({ 
    fee, 
    paymentHistory, 
    computationDetails, 
    formatCurrency 
}) => {
    // Calculate derived values
    const baseAmount = fee.base_amount || 0;
    const surchargeAmount = fee.surcharge_amount || 0;
    const penaltyAmount = fee.penalty_amount || 0;
    const discountAmount = fee.discount_amount || 0;
    const totalAmount = fee.total_amount || fee.amount || 0;
    
    // Check if there are any additional charges
    const hasSurcharge = surchargeAmount > 0;
    const hasPenalty = penaltyAmount > 0;
    const hasDiscount = discountAmount > 0;
    const hasAnyAdjustments = hasSurcharge || hasPenalty || hasDiscount;

    // Get discount details from payment history
    const getDiscountDetails = (): DiscountItem[] => {
        if (!paymentHistory || paymentHistory.length === 0) return [];
        
        const discounts: DiscountItem[] = [];
        paymentHistory.forEach(payment => {
            if ((payment as any).discounts && Array.isArray((payment as any).discounts)) {
                discounts.push(...(payment as any).discounts);
            }
        });
        
        return discounts;
    };

    const discountDetails = getDiscountDetails();

    // Format percentage for display
    const formatPercentage = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '';
        return `${value}%`;
    };

    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Calculator className="h-5 w-5" />
                        Fee Computation
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Detailed breakdown of how the fee amount was calculated
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Base and Charges */}
                            <div className="space-y-4">
                                {/* Base Amount */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Base Amount
                                    </p>
                                    <p className="text-2xl font-bold dark:text-gray-100">
                                        {formatCurrency(baseAmount)}
                                    </p>
                                    {fee.fee_type?.amount_type && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Type: {fee.fee_type.amount_type.replace('_', ' ')}
                                        </p>
                                    )}
                                </div>

                                {/* Surcharge */}
                                {hasSurcharge && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Percent className="h-3 w-3" />
                                            Surcharge
                                        </p>
                                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                            + {formatCurrency(surchargeAmount)}
                                        </p>
                                        {fee.fee_type?.surcharge_percentage && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatPercentage(fee.fee_type.surcharge_percentage)} of base amount
                                            </p>
                                        )}
                                        {fee.fee_type?.surcharge_description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                {fee.fee_type.surcharge_description}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Penalty */}
                                {hasPenalty && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            Penalty
                                        </p>
                                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            + {formatCurrency(penaltyAmount)}
                                        </p>
                                        {fee.fee_type?.penalty_percentage && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatPercentage(fee.fee_type.penalty_percentage)} of base amount
                                            </p>
                                        )}
                                        {fee.fee_type?.penalty_description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                {fee.fee_type.penalty_description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Discounts and Total */}
                            <div className="space-y-4">
                                {/* Discount */}
                                {hasDiscount && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            Discount
                                        </p>
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            - {formatCurrency(discountAmount)}
                                        </p>
                                        
                                        {/* Discount Details */}
                                        {discountDetails.length > 0 && (
                                            <div className="mt-2 space-y-1 pl-2 border-l-2 border-green-200 dark:border-green-800">
                                                {discountDetails.map((discount, idx) => (
                                                    <div key={idx} className="text-xs">
                                                        <span className="text-green-700 dark:text-green-400 font-medium">
                                                            {discount.rule_name || discount.discount_type || 'Discount'}:
                                                        </span>
                                                        <span className="text-green-600 dark:text-green-400 ml-1">
                                                            {discount.formatted_amount || formatCurrency(discount.amount || 0)}
                                                        </span>
                                                        {discount.percentage && (
                                                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                                ({discount.percentage}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Subtotal before discount if applicable */}
                                {hasDiscount && (
                                    <div className="space-y-2 pt-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Subtotal (before discount)
                                        </p>
                                        <p className="text-lg text-gray-600 dark:text-gray-300">
                                            {formatCurrency(baseAmount + surchargeAmount + penaltyAmount)}
                                        </p>
                                    </div>
                                )}

                                {/* Total Amount */}
                                <div className="space-y-2 pt-2 border-t dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Amount
                                    </p>
                                    <p className="text-3xl font-bold dark:text-gray-100">
                                        {formatCurrency(totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Summary */}
                        {hasAnyAdjustments && (
                            <div className="pt-4 border-t dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    Calculation Summary
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                                        <span className="font-mono dark:text-gray-300">{formatCurrency(baseAmount)}</span>
                                    </div>
                                    
                                    {hasSurcharge && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-orange-600 dark:text-orange-400">+ Surcharge</span>
                                            <span className="font-mono text-orange-600 dark:text-orange-400">
                                                {formatCurrency(surchargeAmount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {hasPenalty && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-red-600 dark:text-red-400">+ Penalty</span>
                                            <span className="font-mono text-red-600 dark:text-red-400">
                                                {formatCurrency(penaltyAmount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {hasDiscount && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-green-600 dark:text-green-400">- Discount</span>
                                            <span className="font-mono text-green-600 dark:text-green-400">
                                                {formatCurrency(discountAmount)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <Separator className="dark:bg-gray-700" />
                                    
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="dark:text-gray-100">Total</span>
                                        <span className="font-mono text-lg dark:text-gray-100">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Computation (JSON) */}
                        {computationDetails && (
                            <div className="pt-4 border-t dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Detailed Computation Data
                                </p>
                                
                                {/* Formatted Breakdown if available */}
                                {computationDetails.breakdown && Array.isArray(computationDetails.breakdown) && (
                                    <div className="mb-4 space-y-1">
                                        {computationDetails.breakdown.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                                                <span className={`font-mono ${
                                                    item.type === 'surcharge' || item.type === 'penalty' 
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : item.type === 'discount'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'dark:text-gray-300'
                                                }`}>
                                                    {item.type === 'discount' ? '- ' : '+ '}
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Raw JSON for debugging */}
                                <details className="text-xs">
                                    <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                        View Raw Data
                                    </summary>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mt-2 overflow-auto">
                                        <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {JSON.stringify(computationDetails, null, 2)}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}
                        
                        {/* No computation details message */}
                        {!computationDetails && !hasAnyAdjustments && (
                            <div className="pt-4 border-t dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                    No detailed computation data available. This fee uses a simple fixed amount.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};