// components/admin/dashboard/ClearanceStatusChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
    PieChart, 
    CheckCircle, 
    Clock, 
    XCircle, 
    FileCheck,
    Loader,
    FileText
} from 'lucide-react';

interface StatusItem {
    status: string;
    original_status: string;
    count: number;
}

interface ClearanceStatusChartProps {
    data: StatusItem[];
    isMobile?: boolean;
}

export function ClearanceStatusChart({ data, isMobile = false }: ClearanceStatusChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader className={isMobile ? 'p-3 pb-0' : 'pb-3'}>
                    <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                        <PieChart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600 dark:text-purple-400`} />
                        Clearance Status
                    </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'p-3' : ''}>
                    <div className="text-center py-8">
                        <PieChart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No clearance data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return Clock;
            case 'approved':
                return CheckCircle;
            case 'rejected':
                return XCircle;
            case 'processing':
                return Loader;
            case 'ready_for_pickup':
                return FileCheck;
            case 'completed':
                return CheckCircle;
            default:
                return FileText;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'ready_for_pickup':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
        }
    };

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const sortedData = [...data].sort((a, b) => b.count - a.count);

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className={isMobile ? 'p-3 pb-0' : 'pb-3'}>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    <PieChart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600 dark:text-purple-400`} />
                    Clearance Status
                </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3' : ''}>
                <div className="space-y-4">
                    {sortedData.map((item, index) => {
                        const percentage = total > 0 ? (item.count / total) * 100 : 0;
                        const IconComponent = getStatusIcon(item.original_status);
                        
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${getStatusColor(item.original_status)}`}>
                                            <IconComponent className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-medium dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold dark:text-gray-100">
                                            {item.count}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress 
                                    value={percentage} 
                                    className="h-2 dark:bg-gray-700"
                                />
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FileText className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            Total Clearances
                        </span>
                        <span className="font-bold text-lg dark:text-gray-100">
                            {total}
                        </span>
                    </div>
                    
                    {!isMobile && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {sortedData.slice(0, 4).map((item, index) => {
                                const IconComponent = getStatusIcon(item.original_status);
                                return (
                                    <div key={index} className="flex items-center gap-1 text-xs">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.original_status).split(' ')[0]}`} />
                                        <IconComponent className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400 truncate">
                                            {item.status}: {item.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}