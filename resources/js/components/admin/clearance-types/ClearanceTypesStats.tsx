// components/admin/clearance-types/ClearanceTypesStats.tsx

import { FileText, CheckCircle, CreditCard, Shield } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface Stats {
    total: number;
    active: number;
    requires_payment: number;
    requires_approval?: number;
    online_only?: number;
    inactive?: number;
    discountable?: number;
    non_discountable?: number;
    averageFee?: number;
}

interface ClearanceTypesStatsProps {
    stats: Stats;
}

export default function ClearanceTypesStats({ stats }: ClearanceTypesStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        requires_payment: stats?.requires_payment || 0,
        requires_approval: stats?.requires_approval || 0,
    };

    const calculatePercentage = (value: number) => {
        if (safeStats.total === 0) return 0;
        return Math.round((value / safeStats.total) * 100);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                description="All clearance types"
            />
            
            <StatCard
                title="Active Types"
                value={safeStats.active.toLocaleString()}
                icon={<CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />}
                description={`${calculatePercentage(safeStats.active)}% of total`}
            />

            <StatCard
                title="Paid Types"
                value={safeStats.requires_payment.toLocaleString()}
                icon={<CreditCard className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
                description={`${calculatePercentage(safeStats.requires_payment)}% require payment`}
            />

            <StatCard
                title="Needs Approval"
                value={safeStats.requires_approval.toLocaleString()}
                icon={<Shield className="h-5 w-5 text-purple-500 dark:text-purple-400" />}
                description={`${calculatePercentage(safeStats.requires_approval)}% require approval`}
            />
        </div>
    );
}