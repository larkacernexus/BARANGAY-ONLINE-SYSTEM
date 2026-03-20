// resources/js/Pages/Admin/Fees/components/fee-computation-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Calculator,
} from 'lucide-react';
import { Fee, PaymentHistory } from '../types';

interface Props {
    fee: Fee;
    paymentHistory: PaymentHistory[];
    computationDetails: any;
    formatCurrency: (amount: number | string | undefined) => string;
}

export const FeeComputationTab = ({ fee, paymentHistory, computationDetails, formatCurrency }: Props) => {
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
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Amount</p>
                                    <p className="text-2xl font-bold dark:text-gray-100">{formatCurrency(fee.base_amount)}</p>
                                </div>
                                {fee.surcharge_amount > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Surcharge</p>
                                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                            + {formatCurrency(fee.surcharge_amount)}
                                        </p>
                                        {fee.fee_type?.surcharge_percentage && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {fee.fee_type.surcharge_percentage}% of base amount
                                            </p>
                                        )}
                                    </div>
                                )}
                                {fee.penalty_amount > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Penalty</p>
                                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            + {formatCurrency(fee.penalty_amount)}
                                        </p>
                                        {fee.fee_type?.penalty_percentage && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {fee.fee_type.penalty_percentage}% of base amount
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {fee.discount_amount > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount</p>
                                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            - {formatCurrency(fee.discount_amount)}
                                        </p>
                                        {/* DYNAMIC: Show discount info if available */}
                                        {paymentHistory && paymentHistory.length > 0 && paymentHistory[0]?.discounts?.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {paymentHistory[0].discounts.map((discount, idx) => (
                                                    <p key={idx} className="text-xs text-green-600 dark:text-green-400">
                                                        {discount.rule_name}: {discount.formatted_amount}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="text-3xl font-bold dark:text-gray-100">{formatCurrency(fee.total_amount)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Computation */}
                        {computationDetails && (
                            <div className="pt-4 border-t dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Detailed Computation</p>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                    <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {JSON.stringify(computationDetails, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};