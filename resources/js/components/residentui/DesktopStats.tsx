import { Card, CardContent } from '@/components/ui/card';
import { BarChart, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DesktopStatsProps {
    statusFilter: string;
    stats: {
        total_paid: number;
        total_balance: number;
        balance_due?: number; // Add optional properties
        total_payments?: number;
        pending_payments?: number;
    };
    fees: {
        data: any[];
        from: number;
        to: number;
        total: number;
    } | null; // Make it nullable
    getStatusCount: (status: string) => number;
    formatCurrency: (amount: number) => string;
}

export function DesktopStats({ 
    statusFilter,
    stats,
    fees,
    getStatusCount,
    formatCurrency 
}: DesktopStatsProps) {
    // Safely access fees properties with null checks
    const feesData = fees?.data || [];
    const from = fees?.from || 0;
    const to = fees?.to || 0;
    const total = fees?.total || 0;
    
    return (
        <div className="hidden md:grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-0">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Total ({statusFilter === 'all' ? 'All' : statusFilter})
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {feesData.length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Showing {from} to {to} of {total}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                            <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-0">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                Total Paid
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {formatCurrency(stats?.total_paid || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Total amount paid
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-0">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {getStatusCount('pending')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Pending fees
                            </p>
                        </div>
                        <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-0">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                Balance Due
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {formatCurrency(stats?.total_balance || stats?.balance_due || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Unpaid balance
                            </p>
                        </div>
                        <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}