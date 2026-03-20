// components/admin/fee-types/FeeTypesStats.tsx
import { FileText, CheckCircle, DollarSign, Tag } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface FeeTypesStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        mandatory: number;
        autoGenerate: number;
        totalAmount: number;
    };
    categoryCounts: Record<string, number>;
}

export default function FeeTypesStats({ stats, categoryCounts }: FeeTypesStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        inactive: stats?.inactive || 0,
        mandatory: stats?.mandatory || 0,
        autoGenerate: stats?.autoGenerate || 0,
        totalAmount: stats?.totalAmount || 0
    };

    const safeCategoryCounts = categoryCounts || {};

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const averagePerFee = safeStats.total > 0 
        ? safeStats.totalAmount / safeStats.total 
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Filtered Fee Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${safeStats.active} active • ${safeStats.inactive} inactive`}
            />
            
            <StatCard
                title="Active"
                value={safeStats.active.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`${safeStats.mandatory} mandatory • ${safeStats.autoGenerate} auto-gen`}
            />

            <StatCard
                title="Total Base Amount"
                value={formatCurrency(safeStats.totalAmount)}
                icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                description={`Average: ${formatCurrency(averagePerFee)} per type`}
            />

            <StatCard
                title="Categories"
                value={Object.keys(safeCategoryCounts).length.toLocaleString()}
                icon={<Tag className="h-4 w-4 text-purple-500" />}
                description={`${(safeCategoryCounts['uncategorized'] || 0).toLocaleString()} uncategorized`}
            />
        </div>
    );
}