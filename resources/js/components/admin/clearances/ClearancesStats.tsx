// components/admin/clearances/ClearancesStats.tsx
import { CheckCircle, Clock, Zap, DollarSign, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface ClearancesStatsProps {
    stats: {
        totalIssued?: number;
        issuedThisMonth?: number;
        pending?: number;
        pendingToday?: number;
        expressRequests?: number;
        rushRequests?: number;
        totalRevenue?: number;
    };
}

export default function ClearancesStats({ stats }: ClearancesStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Issued"
                value={Number(stats?.totalIssued || 0).toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`${Number(stats?.issuedThisMonth || 0)} this month`}
                trend="up"
            />
            <StatCard
                title="Pending"
                value={Number(stats?.pending || 0).toLocaleString()}
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                description={`${Number(stats?.pendingToday || 0)} new today`}
                trend="neutral"
            />
            <StatCard
                title="Priority"
                value={(Number(stats?.expressRequests || 0) + Number(stats?.rushRequests || 0)).toString()}
                icon={<Zap className="h-4 w-4 text-red-500" />}
                // FIX: Use a span instead of div inside description
                description={(
                    <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-red-500" />
                            {Number(stats?.expressRequests || 0)} Express
                        </span>
                        <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            {Number(stats?.rushRequests || 0)} Rush
                        </span>
                    </span>
                )}
                trend="up"
            />
            <StatCard
                title="Total Revenue"
                value={`₱${Number(stats?.totalRevenue || 0).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`}
                icon={<DollarSign className="h-4 w-4 text-purple-500" />}
                description="All time"
                trend="up"
            />
        </div>
    );
}