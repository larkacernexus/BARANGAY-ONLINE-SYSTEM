// resources/js/Pages/Admin/Payments/components/fee-details-card.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileBarChart,
    ChevronUp,
    ChevronDown,
    User,
    Users,
    Building2,
    ExternalLink,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { FeeDetails } from '../types';
import { formatCurrency, getRoute, getFeeStatusIcon, getFeeStatusColor, getFeePayerIcon } from '../utils/helpers';

interface Props {
    fees: FeeDetails[];
}

export const FeeDetailsCard = ({ fees }: Props) => {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleFee = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(feeId => feeId !== id) : [...prev, id]
        );
    };

    // ✅ Safe number parser
    const safeNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(num) ? 0 : num;
    };

    // Helper to get clean payer type display
    const getPayerTypeDisplay = (payerType: string): string => {
        if (!payerType) return 'Unknown';
        
        const cleanType = payerType.replace(/^App\\Models\\/, '').replace(/^App\\\\Models\\\\/, '');
        
        const typeMap: Record<string, string> = {
            'Resident': 'Resident',
            'Household': 'Household',
            'Business': 'Business',
            'resident': 'Resident',
            'household': 'Household',
            'business': 'Business',
        };
        
        return typeMap[cleanType] || cleanType;
    };

    // Helper to get payer icon based on type
    const getPayerIconByType = (payerType: string) => {
        const cleanType = payerType.toLowerCase().replace(/^app\\models\\/, '');
        
        if (cleanType.includes('resident')) {
            return <User className="h-3 w-3" />;
        }
        if (cleanType.includes('household')) {
            return <Users className="h-3 w-3" />;
        }
        if (cleanType.includes('business')) {
            return <Building2 className="h-3 w-3" />;
        }
        return <User className="h-3 w-3" />;
    };

    if (fees.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileBarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Fee Details
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Associated fees for this payment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {fees.map((fee) => {
                        // ✅ Safe parsing of all numeric values
                        const totalAmount = safeNumber(fee.total_amount);
                        const amountPaid = safeNumber(fee.amount_paid);
                        const discountAmount = safeNumber(fee.discount_amount);
                        
                        // ✅ Calculate total settled (cash + discount)
                        const totalSettled = amountPaid + discountAmount;
                        const paymentPercentage = totalAmount > 0 ? (totalSettled / totalAmount) * 100 : 0;
                        const isFullyPaid = totalAmount > 0 && totalSettled >= totalAmount - 0.01;
                        const remainingBalance = Math.max(0, totalAmount - totalSettled);
                        
                        return (
                            <div key={fee.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFee(fee.id)}
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedIds.includes(fee.id) ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 dark:text-gray-100">
                                                {fee.fee_type?.name || fee.fee_type_name || 'Fee'}
                                                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                    {fee.fee_code || fee.fee_type?.code || 'N/A'}
                                                </Badge>
                                            </h4>
                                            {fee.or_number && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">OR: {fee.or_number}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-bold dark:text-gray-100">{formatCurrency(totalAmount)}</p>
                                            <Badge className={`${getFeeStatusColor(fee.status)} flex items-center gap-1 mt-1`}>
                                                {getFeeStatusIcon(fee.status)}
                                                {isFullyPaid ? 'Paid' : fee.status}
                                                {fee.is_overdue && fee.days_overdue && fee.days_overdue > 0 && !isFullyPaid && (
                                                    <span className="ml-1">({fee.days_overdue}d overdue)</span>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </button>
                                
                                {expandedIds.includes(fee.id) && (
                                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Payer Type</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {getPayerIconByType(fee.payer_type)}
                                                    <span className="text-sm capitalize dark:text-gray-300">
                                                        {getPayerTypeDisplay(fee.payer_type)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {fee.payer_type && (fee.payer_type.toLowerCase().includes('resident') || fee.payer_type === 'resident') && fee.resident && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Resident</p>
                                                    <p className="text-sm font-medium dark:text-gray-100">{fee.resident.name}</p>
                                                    {fee.resident.household && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            House #{fee.resident.household.household_number}, Purok {fee.resident.household.purok}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {fee.payer_type && (fee.payer_type.toLowerCase().includes('household') || fee.payer_type === 'household') && fee.household && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Household</p>
                                                    <p className="text-sm font-medium dark:text-gray-100">House #{fee.household.household_number}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Purok {fee.household.purok}</p>
                                                </div>
                                            )}
                                            
                                            {fee.business_name && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Business</p>
                                                    <p className="text-sm font-medium dark:text-gray-100">{fee.business_name}</p>
                                                    {fee.business_type && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Type: {fee.business_type}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                            {fee.issue_date && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Issue Date</p>
                                                    <p className="text-sm dark:text-gray-300">{fee.formatted_issue_date}</p>
                                                </div>
                                            )}
                                            {fee.due_date && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                                                    <p className={`text-sm ${fee.is_overdue && !isFullyPaid ? 'text-red-600 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                        {fee.formatted_due_date}
                                                    </p>
                                                </div>
                                            )}
                                            {fee.valid_until && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Valid Until</p>
                                                    <p className="text-sm dark:text-gray-300">{fee.formatted_valid_until}</p>
                                                </div>
                                            )}
                                        </div>

                                        {fee.period_start && fee.period_end && (
                                            <div className="mt-3">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Billing Period</p>
                                                <p className="text-sm dark:text-gray-300">
                                                    {fee.formatted_period_start} to {fee.formatted_period_end}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Amount Breakdown</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <div className="bg-white dark:bg-gray-900 p-2 rounded border dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Base Amount</p>
                                                    <p className="text-sm font-bold dark:text-gray-100">{formatCurrency(safeNumber(fee.base_amount))}</p>
                                                </div>
                                                {(safeNumber(fee.surcharge_amount) || 0) > 0 && (
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                                                        <p className="text-xs text-amber-600 dark:text-amber-400">Surcharge</p>
                                                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatCurrency(safeNumber(fee.surcharge_amount))}</p>
                                                    </div>
                                                )}
                                                {(safeNumber(fee.penalty_amount) || 0) > 0 && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                                                        <p className="text-xs text-red-600 dark:text-red-400">Penalty</p>
                                                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(safeNumber(fee.penalty_amount))}</p>
                                                    </div>
                                                )}
                                                {discountAmount > 0 && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                                                        <p className="text-xs text-green-600 dark:text-green-400">Discount</p>
                                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(discountAmount)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ✅ FIXED: Payment Progress - Now with safe numbers */}
                                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Progress</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatCurrency(totalSettled)} of {formatCurrency(totalAmount)} settled
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${isFullyPaid ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                                                    style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span>0%</span>
                                                <span>{paymentPercentage.toFixed(1)}%</span>
                                                <span>100%</span>
                                            </div>
                                            
                                            {/* Breakdown of how it was paid */}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                {amountPaid > 0 && (
                                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                        <span>💰 Cash paid: {formatCurrency(amountPaid)}</span>
                                                    </div>
                                                )}
                                                {discountAmount > 0 && (
                                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <span>🏷️ Discount: {formatCurrency(discountAmount)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {isFullyPaid && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Fully paid (Cash + Discount)
                                                </div>
                                            )}
                                            {!isFullyPaid && amountPaid > 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                    <Clock className="h-3 w-3" />
                                                    Remaining balance: {formatCurrency(remainingBalance)}
                                                </div>
                                            )}
                                            {!isFullyPaid && amountPaid === 0 && discountAmount === 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                    <XCircle className="h-3 w-3" />
                                                    Unpaid - No payment received
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t dark:border-gray-700 flex justify-end">
                                            <Link 
                                                href={getRoute('admin.fees.show', fee.id)}
                                                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View Full Fee Details
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};