// components/admin/dashboard/PopularClearances.tsx
import { FileText, TrendingUp } from 'lucide-react';

interface Clearance {
    id: number;
    name: string;
    code: string;
    total_requests: number;
    monthly_requests: number;
}

interface PopularClearancesProps {
    clearances: Clearance[];
}

export function PopularClearances({ clearances }: PopularClearancesProps) {
    if (!clearances || clearances.length === 0) {
        return (
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Clearances</h3>
                <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No clearance data</p>
                </div>
            </div>
        );
    }

    const sorted = [...clearances].sort((a, b) => b.monthly_requests - a.monthly_requests).slice(0, 5);
    const maxRequests = Math.max(...sorted.map(c => c.monthly_requests));

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Clearances</h3>
            
            <div className="space-y-4">
                {sorted.map((clearance) => {
                    const percentage = maxRequests > 0 ? (clearance.monthly_requests / maxRequests) * 100 : 0;
                    
                    return (
                        <div key={clearance.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {clearance.name}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {clearance.monthly_requests}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                                <div 
                                    className="h-full bg-blue-600 rounded-full dark:bg-blue-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Total: {clearance.total_requests}
                                </span>
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <TrendingUp className="h-3 w-3" />
                                    {clearance.monthly_requests} this month
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}