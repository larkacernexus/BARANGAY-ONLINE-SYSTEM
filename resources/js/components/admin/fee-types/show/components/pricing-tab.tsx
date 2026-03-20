// resources/js/Pages/Admin/FeeTypes/components/pricing-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DollarSign,
    Percent,
    PersonStanding,
    Award,
    AlertTriangle,
    AlertCircle,
} from 'lucide-react';

interface Props {
    feeType: any;
    hasDiscounts: boolean;
    activeDiscountFeeTypes: any[];
    formatCurrency: (amount: any) => string;
    getAmountTypeLabel: (type: string) => string;
    getDiscountPercentage: (specific: any, general: any) => string;
}

export const PricingTab = ({
    feeType,
    hasDiscounts,
    activeDiscountFeeTypes,
    formatCurrency,
    getAmountTypeLabel,
    getDiscountPercentage
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Base Amount Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <DollarSign className="h-5 w-5" />
                        Base Amount
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary dark:text-blue-400">
                            {formatCurrency(feeType.base_amount)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {getAmountTypeLabel(feeType.amount_type)}
                            {feeType.unit && ` • ${feeType.unit}`}
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <span className="text-sm font-medium dark:text-gray-300">Amount Type</span>
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                {getAmountTypeLabel(feeType.amount_type)}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <span className="text-sm font-medium dark:text-gray-300">Unit</span>
                            <span className="font-medium dark:text-gray-200">{feeType.unit || 'None'}</span>
                        </div>
                        {feeType.discount_percentage && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="text-sm font-medium dark:text-blue-300">General Discount</span>
                                <span className="font-bold text-blue-700 dark:text-blue-400">
                                    {feeType.discount_percentage}%
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Discounts Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Percent className="h-5 w-5" />
                        Discounts
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Special discounts for specific groups
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasDiscounts ? (
                        <div className="space-y-3">
                            {feeType.has_senior_discount && (
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <PersonStanding className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <div>
                                            <div className="font-medium dark:text-green-300">Senior Citizen</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">For senior citizens aged 60+</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            {getDiscountPercentage(feeType.senior_discount_percentage, feeType.discount_percentage)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Discount from base amount
                                        </div>
                                    </div>
                                </div>
                            )}
                            {feeType.has_pwd_discount && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <PersonStanding className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <div className="font-medium dark:text-blue-300">PWD</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">For persons with disabilities</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                            {getDiscountPercentage(feeType.pwd_discount_percentage, feeType.discount_percentage)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Discount from base amount
                                        </div>
                                    </div>
                                </div>
                            )}
                            {feeType.has_solo_parent_discount && (
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <PersonStanding className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <div>
                                            <div className="font-medium dark:text-purple-300">Solo Parent</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">For solo parents</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                            {getDiscountPercentage(feeType.solo_parent_discount_percentage, feeType.discount_percentage)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Discount from base amount
                                        </div>
                                    </div>
                                </div>
                            )}
                            {feeType.has_indigent_discount && (
                                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <PersonStanding className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        <div>
                                            <div className="font-medium dark:text-orange-300">Indigent</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">For indigent families</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                            {getDiscountPercentage(feeType.indigent_discount_percentage, feeType.discount_percentage)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Discount from base amount
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic discounts from discount_fee_types */}
                            {activeDiscountFeeTypes.map((discountFeeType) => (
                                <div 
                                    key={discountFeeType.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        <div>
                                            <div className="font-medium dark:text-gray-200">{discountFeeType.discount_type!.name}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {discountFeeType.discount_type!.description || 
                                                `Discount for ${discountFeeType.discount_type!.name.toLowerCase()}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                            {discountFeeType.percentage}%
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Discount from base amount
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Percent className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No discounts configured</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                This fee type doesn't have any special discounts
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Late Payment Fees Card */}
            {(feeType.has_surcharge || feeType.has_penalty) && (
                <Card className="lg:col-span-2 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <AlertTriangle className="h-5 w-5" />
                            Late Payment Fees
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Additional charges for late payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {feeType.has_surcharge && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-yellow-300">Surcharge</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Applied for late payments</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {feeType.surcharge_percentage && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                                                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                                                    {feeType.surcharge_percentage}%
                                                </span>
                                            </div>
                                        )}
                                        {feeType.surcharge_fixed && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Fixed Amount:</span>
                                                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                                                    {formatCurrency(feeType.surcharge_fixed)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {feeType.has_penalty && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-red-300">Penalty</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Additional penalty fees</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {feeType.penalty_percentage && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                                                <span className="font-bold text-red-700 dark:text-red-400">
                                                    {feeType.penalty_percentage}%
                                                </span>
                                            </div>
                                        )}
                                        {feeType.penalty_fixed && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Fixed Amount:</span>
                                                <span className="font-bold text-red-700 dark:text-red-400">
                                                    {formatCurrency(feeType.penalty_fixed)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};