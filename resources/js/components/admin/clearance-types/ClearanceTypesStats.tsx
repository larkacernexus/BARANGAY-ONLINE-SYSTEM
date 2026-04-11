// components/admin/clearance-types/ClearanceTypesStats.tsx

import { FileText, CheckCircle, CreditCard, Shield, Globe } from 'lucide-react';
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
        online_only: stats?.online_only || 0,
        inactive: stats?.inactive || 0,
        discountable: stats?.discountable || 0,
        non_discountable: stats?.non_discountable || 0,
        averageFee: stats?.averageFee || 0
    };

    const calculatePercentage = (value: number) => {
        if (safeStats.total === 0) return 0;
        return Math.round((value / safeStats.total) * 100);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description="All clearance types"
            />
            
            <StatCard
                title="Active"
                value={safeStats.active.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`${calculatePercentage(safeStats.active)}% of total`}
            />

            <StatCard
                title="Paid Types"
                value={safeStats.requires_payment.toLocaleString()}
                icon={<CreditCard className="h-4 w-4 text-amber-500" />}
                description={`${calculatePercentage(safeStats.requires_payment)}% of total`}
            />

            <StatCard
                title="Needs Approval"
                value={safeStats.requires_approval.toLocaleString()}
                icon={<Shield className="h-4 w-4 text-purple-500" />}
                description={`${calculatePercentage(safeStats.requires_approval)}% of total`}
            />

            <StatCard
                title="Online Only"
                value={safeStats.online_only.toLocaleString()}
                icon={<Globe className="h-4 w-4 text-cyan-500" />}
                description={`${calculatePercentage(safeStats.online_only)}% of total`}
            />
        </div>
    );
}