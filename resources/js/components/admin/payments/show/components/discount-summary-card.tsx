// resources/js/Pages/Admin/Payments/components/discount-summary-card.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tag,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { DiscountDetail } from '../types';

interface Props {
    discountDetails: DiscountDetail[];
    paymentDiscount: number;
    formattedDiscount: string;
    discountType?: string;
    formatDate: (date?: string, includeTime?: boolean) => string;
}

export const DiscountSummaryCard = ({
    discountDetails,
    paymentDiscount,
    formattedDiscount,
    discountType,
    formatDate
}: Props) => {
    const [expanded, setExpanded] = useState(false);

    // Filter and validate discount details
    const validDiscountDetails = useMemo(() => {
        if (!discountDetails || discountDetails.length === 0) return [];
        
        console.log('🔍 Processing discount details:', discountDetails);
        
        // Filter out zero or negative amounts
        const positiveDiscounts = discountDetails.filter(d => d.amount > 0);
        
        if (positiveDiscounts.length === 0) return [];
        
        // If we have exactly one discount, return it
        if (positiveDiscounts.length === 1) return positiveDiscounts;
        
        // If multiple discounts, try to find combination that matches payment discount
        const totalFromDetails = positiveDiscounts.reduce((sum, d) => sum + d.amount, 0);
        
        // If total matches exactly, all discounts are valid
        if (Math.abs(totalFromDetails - paymentDiscount) < 0.01) {
            return positiveDiscounts;
        }
        
        // If total is less than payment discount, return all (there might be rounding)
        if (totalFromDetails < paymentDiscount + 0.01) {
            return positiveDiscounts;
        }
        
        // If total is more, try to find the most likely combination
        // Sort by amount descending and take until we match payment discount
        const sorted = [...positiveDiscounts].sort((a, b) => b.amount - a.amount);
        const combination: DiscountDetail[] = [];
        let runningTotal = 0;
        
        for (const discount of sorted) {
            if (runningTotal + discount.amount <= paymentDiscount + 0.01) {
                combination.push(discount);
                runningTotal += discount.amount;
            }
        }
        
        if (Math.abs(runningTotal - paymentDiscount) < 0.01) {
            return combination;
        }
        
        // Last resort: return the first discount
        return [positiveDiscounts[0]];
        
    }, [discountDetails, paymentDiscount]);

    if (validDiscountDetails.length === 0 && paymentDiscount <= 0) {
        return null;
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                        <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Discount Summary
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                        {formattedDiscount}
                    </Badge>
                </div>
                <CardDescription className="dark:text-gray-400">
                    {validDiscountDetails.length === 1 
                        ? '1 discount applied' 
                        : `${validDiscountDetails.length} discounts applied`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {validDiscountDetails.slice(0, expanded ? undefined : 2).map((discount, index) => (
                        <div key={index} className="border-b border-green-100 dark:border-green-900 last:border-0 pb-2 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-400">
                                        {discount.type} Discount
                                    </p>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mt-0.5">
                                        {discount.code && (
                                            <p>Code: {discount.code}</p>
                                        )}
                                        {discount.id_number && (
                                            <p>ID: {discount.id_number}</p>
                                        )}
                                        {discount.verified_by && (
                                            <p>Verified by: {discount.verified_by}</p>
                                        )}
                                        {discount.verified_at && (
                                            <p>{formatDate(discount.verified_at, true)}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-700 dark:text-green-400">
                                        {discount.formatted_amount}
                                    </p>
                                    {discount.id_presented && (
                                        <Badge variant="outline" className="mt-1 text-[10px] bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                            ID Presented
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {validDiscountDetails.length > 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="w-full text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            {expanded ? (
                                <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
                            ) : (
                                <>Show {validDiscountDetails.length - 2} more <ChevronDown className="h-3 w-3 ml-1" /></>
                            )}
                        </Button>
                    )}

                    {discountType && validDiscountDetails.length === 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Type:</span> {discountType}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};