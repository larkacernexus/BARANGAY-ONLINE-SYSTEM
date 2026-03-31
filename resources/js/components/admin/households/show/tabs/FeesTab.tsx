// resources/js/Pages/Admin/Households/Show/tabs/FeesTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Receipt, 
    Plus, 
    Eye, 
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo } from 'react';

// Import types from shared types file
import { Fee, FeeStatus } from '@/types/admin/households/household.types';
import { formatDate, formatDateTime } from '@/types/admin/households/household.types';

interface FeesTabProps {
    householdId: number;
    fees: Fee[];
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    overdueFees: number;
    totalAmount: number;
    totalPaid: number;
}

export const FeesTab = ({ 
    householdId, 
    fees, 
    totalFees, 
    paidFees, 
    pendingFees, 
    overdueFees,
    totalAmount: initialTotalAmount,
    totalPaid: initialTotalPaid
}: FeesTabProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to safely convert to number
    const toNumber = (value: number | string | undefined): number => {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Recalculate totals from actual fees data to ensure accuracy
    const calculatedTotals = useMemo(() => {
        const totalAmount = fees.reduce((sum, fee) => sum + toNumber(fee.total_amount), 0);
        const totalPaid = fees.reduce((sum, fee) => sum + toNumber(fee.amount_paid), 0);
        const outstandingBalance = totalAmount - totalPaid;
        
        return {
            totalAmount,
            totalPaid,
            outstandingBalance
        };
    }, [fees]);

    // Use provided totals or calculated ones
    const totalAmount = initialTotalAmount > 0 ? initialTotalAmount : calculatedTotals.totalAmount;
    const totalPaid = initialTotalPaid > 0 ? initialTotalPaid : calculatedTotals.totalPaid;
    const outstandingBalance = calculatedTotals.outstandingBalance;

    const getStatusBadge = (status: FeeStatus) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
            case 'issued':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Issued</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Overdue</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: FeeStatus) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
            case 'issued':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Receipt className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatAmount = (amount: number | string): string => {
        const num = toNumber(amount);
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDateSafe = (date?: string): string => {
        if (!date) return 'N/A';
        return formatDate(date);
    };

    // Group fees by status for better organization
    const feesByStatus = useMemo(() => {
        return {
            overdue: fees.filter(f => f.status === 'overdue'),
            pending: fees.filter(f => f.status === 'pending' || f.status === 'issued'),
            paid: fees.filter(f => f.status === 'paid'),
            cancelled: fees.filter(f => f.status === 'cancelled')
        };
    }, [fees]);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Receipt className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{totalFees}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{paidFees}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Clock className="h-8 w-8 text-yellow-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{pendingFees}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{overdueFees}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Amount Summary */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount Due:</span>
                            <span className="font-bold text-lg dark:text-gray-100">{formatAmount(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount Paid:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{formatAmount(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Outstanding Balance:</span>
                            <span className={`font-bold ${outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {formatAmount(outstandingBalance)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fees List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="dark:text-gray-100">Fee Assessments</CardTitle>
                        <Link href={route('admin.fees.create', { household_id: householdId })}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Assess Fee
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {fees.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No fees found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This household has no fee assessments yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Overdue Fees Section */}
                            {feesByStatus.overdue.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Overdue Fees ({feesByStatus.overdue.length})
                                    </h4>
                                    {renderFeeList(feesByStatus.overdue)}
                                </div>
                            )}

                            {/* Pending Fees Section */}
                            {feesByStatus.pending.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Pending Fees ({feesByStatus.pending.length})
                                    </h4>
                                    {renderFeeList(feesByStatus.pending)}
                                </div>
                            )}

                            {/* Paid Fees Section */}
                            {feesByStatus.paid.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Paid Fees ({feesByStatus.paid.length})
                                    </h4>
                                    {renderFeeList(feesByStatus.paid)}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    function renderFeeList(feesList: Fee[]) {
        return (
            <div className="space-y-3">
                {feesList.map((fee) => {
                    const totalAmount = toNumber(fee.total_amount);
                    const amountPaid = toNumber(fee.amount_paid);
                    const balance = totalAmount - amountPaid;
                    const isPaid = fee.status === 'paid';
                    
                    return (
                        <div key={fee.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(fee.status)}
                                            <h3 className="font-semibold dark:text-gray-100">
                                                {fee.fee_type || 'Fee Assessment'}
                                            </h3>
                                        </div>
                                        {getStatusBadge(fee.status)}
                                        {fee.reference_number && (
                                            <Badge variant="outline" className="text-xs dark:border-gray-600">
                                                Ref: {fee.reference_number}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {fee.notes && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {fee.notes}
                                        </p>
                                    )}
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                            <p className="font-medium dark:text-gray-200">{formatAmount(totalAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Paid</p>
                                            <p className="font-medium text-green-600 dark:text-green-400">{formatAmount(amountPaid)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Balance</p>
                                            <p className={`font-medium ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {formatAmount(balance)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Due Date</p>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatDateSafe(fee.due_date)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isPaid && fee.paid_date && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            Paid on: {formatDateSafe(fee.paid_date)}
                                            {fee.payment_method && ` via ${fee.payment_method.toUpperCase()}`}
                                        </p>
                                    )}
                                    
                                    {fee.receipt_number && (
                                        <p className="text-xs text-gray-400 mt-1">Receipt #: {fee.receipt_number}</p>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Link href={route('admin.fees.show', fee.id)}>
                                        <Button variant="ghost" size="sm" title="View Details">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {!isPaid && (
                                        <Link href={route('admin.payments.create', { fee_id: fee.id, household_id: householdId })}>
                                            <Button variant="outline" size="sm" className="dark:border-gray-600">
                                                Pay
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="ghost" size="sm" title="Download Receipt">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
};