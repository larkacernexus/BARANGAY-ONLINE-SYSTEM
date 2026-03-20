// resources/js/Pages/Admin/Privileges/components/usage-statistics-card.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Privilege {
    residents_count?: number;
    active_residents_count?: number;
    pending_count?: number;
    expired_count?: number;
    default_discount_percentage: string | number;
}

interface Props {
    privilege: Privilege;
}

export const UsageStatisticsCard = ({ privilege }: Props) => {
    const total = privilege.residents_count || 0;
    const active = privilege.active_residents_count || 0;
    const pending = privilege.pending_count || 0;
    const expired = privilege.expired_count || 0;
    
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
    const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
    const expiredPercentage = total > 0 ? Math.round((expired / total) * 100) : 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Usage Statistics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Assignments</span>
                        <span className="font-medium dark:text-gray-200">{total}</span>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-1 dark:text-gray-300">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Active
                                </span>
                                <span className="font-medium dark:text-gray-200">{active} ({activePercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${activePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-1 dark:text-gray-300">
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                    Pending
                                </span>
                                <span className="font-medium dark:text-gray-200">{pending} ({pendingPercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-yellow-600 dark:bg-yellow-500 h-2 rounded-full" 
                                    style={{ width: `${pendingPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-1 dark:text-gray-300">
                                    <XCircle className="h-3 w-3 text-red-500" />
                                    Expired
                                </span>
                                <span className="font-medium dark:text-gray-200">{expired} ({expiredPercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-red-600 dark:bg-red-500 h-2 rounded-full" 
                                    style={{ width: `${expiredPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Separator className="dark:bg-gray-700" />
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Discount</p>
                        <p className="text-xl font-bold dark:text-gray-100">{privilege.default_discount_percentage}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Usage Rate</p>
                        <p className="text-xl font-bold dark:text-gray-100">{activePercentage}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};