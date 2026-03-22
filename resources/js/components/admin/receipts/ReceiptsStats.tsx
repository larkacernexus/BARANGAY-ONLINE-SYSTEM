// resources/js/components/admin/receipts/ReceiptsStats.tsx
import { Receipt, FileText, Printer, Ban } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface ReceiptsStatsProps {
    globalStats: {
        total: { count: number; amount: number; formatted_amount: string };
        today: { count: number; amount: number; formatted_amount: string };
        this_month: { count: number; amount: number; formatted_amount: string };
        voided: number;
    };
    filteredStats?: any;
    isLoading?: boolean;
}

export default function ReceiptsStats({ 
    globalStats, 
    filteredStats, 
    isLoading = false 
}: ReceiptsStatsProps) {
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Receipts"
                value={globalStats.total.count.toLocaleString()}
                icon={<Receipt className="h-4 w-4 text-blue-500" />}
                description={globalStats.total.formatted_amount}
            />
            <StatCard
                title="Today"
                value={globalStats.today.count.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-green-500" />}
                description={globalStats.today.formatted_amount}
            />
            <StatCard
                title="This Month"
                value={globalStats.this_month.count.toLocaleString()}
                icon={<Printer className="h-4 w-4 text-amber-500" />}
                description={globalStats.this_month.formatted_amount}
            />
            <StatCard
                title="Voided"
                value={globalStats.voided.toLocaleString()}
                icon={<Ban className="h-4 w-4 text-red-500" />}
                description={globalStats.total.count > 0 
                    ? `${((globalStats.voided / globalStats.total.count) * 100).toFixed(1)}% of total`
                    : "0% of total"}
            />
        </div>
    );
}