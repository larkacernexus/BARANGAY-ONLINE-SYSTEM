import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartBar, ChevronUp, ChevronDown, CheckCircle, Clock, AlertCircle, BarChart } from 'lucide-react';

interface CollapsibleStatsProps {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    statusFilter: string;
    stats: {
        total_paid: number;
        total_balance: number;
        pending_payments?: number;
        total_payments?: number;
    };
    fees: {
        data: any[];
    } | null; // Make it optional
    getStatusCount: (status: string) => number;
    formatCurrency: (amount: number) => string;
}

export function CollapsibleStats({ 
    showStats, 
    setShowStats,
    statusFilter,
    stats,
    fees,
    getStatusCount,
    formatCurrency 
}: CollapsibleStatsProps) {
    // Safely access fees.data with null check
    const feesData = fees?.data || [];
    
    return (
        <div className="md:hidden">
            <Button 
                variant="outline" 
                className="w-full justify-between bg-white dark:bg-gray-900"
                onClick={() => setShowStats(!showStats)}
            >
                <div className="flex items-center gap-2">
                    <ChartBar className="h-4 w-4" />
                    <span>{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
                </div>
                {showStats ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </Button>
            
            {showStats && (
                <div className="mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                            Total ({statusFilter === 'all' ? 'All' : statusFilter})
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {feesData.length}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                        <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                            Total Paid
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {formatCurrency(stats?.total_paid || 0)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            Pending
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {getStatusCount('pending')}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                            Balance Due
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {formatCurrency(stats?.total_balance || 0)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}