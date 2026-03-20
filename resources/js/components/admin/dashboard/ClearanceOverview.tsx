// components/admin/dashboard/ClearanceOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusItem {
    status: string;
    original_status: string;
    count: number;
}

interface ClearanceOverviewProps {
    clearanceRequestStats?: {
        byStatus?: StatusItem[];
    };
    clearanceRequestsToday?: number;
    isMobile?: boolean;
}

export function ClearanceOverview({ 
    clearanceRequestStats, 
    clearanceRequestsToday = 0,
    isMobile = false 
}: ClearanceOverviewProps) {
    // Safely access byStatus with fallback to empty array
    const byStatus = clearanceRequestStats?.byStatus ?? [];
    
    // Ensure byStatus is an array before using map
    const pending = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'pending')?.count || 0 
        : 0;
    
    const approved = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'approved')?.count || 0 
        : 0;
    
    const rejected = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'rejected')?.count || 0 
        : 0;
    
    const completed = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'completed')?.count || 0 
        : 0;
    
    const processing = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'processing')?.count || 0 
        : 0;
    
    const readyForPickup = Array.isArray(byStatus) 
        ? byStatus.find(s => s?.status?.toLowerCase() === 'ready_for_pickup')?.count || 0 
        : 0;

    const total = pending + approved + rejected + completed + processing + readyForPickup;

    const stats = [
        {
            label: 'Pending',
            value: pending,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            darkColor: 'dark:text-amber-400',
            darkBg: 'dark:bg-amber-900/20'
        },
        {
            label: 'Approved',
            value: approved,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            darkColor: 'dark:text-green-400',
            darkBg: 'dark:bg-green-900/20'
        },
        {
            label: 'Rejected',
            value: rejected,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            darkColor: 'dark:text-red-400',
            darkBg: 'dark:bg-red-900/20'
        },
        {
            label: 'Completed',
            value: completed,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            darkColor: 'dark:text-blue-400',
            darkBg: 'dark:bg-blue-900/20'
        }
    ];

    // Only show processing and ready for pickup if they have values
    if (processing > 0) {
        stats.push({
            label: 'Processing',
            value: processing,
            icon: Clock,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            darkColor: 'dark:text-purple-400',
            darkBg: 'dark:bg-purple-900/20'
        });
    }

    if (readyForPickup > 0) {
        stats.push({
            label: 'Ready for Pickup',
            value: readyForPickup,
            icon: CheckCircle,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            darkColor: 'dark:text-indigo-400',
            darkBg: 'dark:bg-indigo-900/20'
        });
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className={isMobile ? 'p-3 pb-0' : 'pb-3'}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600 dark:text-purple-400`} />
                    Clearance Overview
                </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3' : ''}>
                {total === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No clearance data available</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.slice(0, 4).map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className="space-y-2">
                                        <div className={`inline-flex rounded-lg p-2 ${stat.bgColor} ${stat.darkBg}`}>
                                            <Icon className={`h-4 w-4 ${stat.color} ${stat.darkColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                            <p className={`text-lg font-bold text-gray-900 dark:text-white ${
                                                isMobile ? 'text-base' : ''
                                            }`}>
                                                {stat.value}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Additional stats if more than 4 */}
                        {stats.length > 4 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {stats.slice(4).map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.label} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className={`rounded-lg p-1.5 ${stat.bgColor} ${stat.darkBg}`}>
                                                <Icon className={`h-3 w-3 ${stat.color} ${stat.darkColor}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                                    <p className={`font-bold text-gray-900 dark:text-white ${
                                        isMobile ? 'text-xl' : 'text-2xl'
                                    }`}>
                                        {total}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                                    <p className={`font-bold text-blue-600 dark:text-blue-400 ${
                                        isMobile ? 'text-lg' : 'text-xl'
                                    }`}>
                                        +{clearanceRequestsToday}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Distribution */}
                        {isMobile && stats.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Distribution</p>
                                {stats.map((stat) => {
                                    const percentage = total > 0 ? Math.round((stat.value / total) * 100) : 0;
                                    return (
                                        <div key={stat.label} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-600 dark:bg-purple-500 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}