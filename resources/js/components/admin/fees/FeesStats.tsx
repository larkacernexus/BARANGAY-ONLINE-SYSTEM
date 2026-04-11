// components/admin/fees/FeesStats.tsx

import { 
    FileText, 
    DollarSign, 
    CreditCard, 
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Percent
} from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface FilteredStats {
    total: number;
    active: number;
    inactive: number;
    totalAmount: number;
    averageAmount: number;
    overdue: number;
    pending: number;
    paid: number;
    issued: number;
    partially_paid: number;
    cancelled: number;
    refunded: number;
    residentCount: number;
    businessCount: number;
    householdCount: number;
}

interface FeesStatsProps {
    stats: FilteredStats;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function FeesStats({ stats }: FeesStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        totalAmount: stats?.totalAmount || 0,
        paid: stats?.paid || 0,
        pending: stats?.pending || 0,
        issued: stats?.issued || 0,
        overdue: stats?.overdue || 0,
        partially_paid: stats?.partially_paid || 0,
        active: stats?.active || 0,
        inactive: stats?.inactive || 0,
        cancelled: stats?.cancelled || 0,
        refunded: stats?.refunded || 0,
        residentCount: stats?.residentCount || 0,
        businessCount: stats?.businessCount || 0,
        householdCount: stats?.householdCount || 0
    };

    const collectionRate = safeStats.total > 0 
        ? Math.round((safeStats.paid / safeStats.total) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Fees"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${formatCurrency(safeStats.totalAmount)} total amount`}
            />
            <StatCard
                title="Collected"
                value={formatCurrency(safeStats.paid)}
                icon={<CreditCard className="h-4 w-4 text-green-500" />}
                description={`${formatCurrency(safeStats.pending)} pending`}
            />
            <StatCard
                title="Collection Rate"
                value={`${collectionRate}%`}
                icon={<Percent className="h-4 w-4 text-purple-500" />}
                description={`${safeStats.issued} issued • ${safeStats.overdue} overdue`}
            />
            <StatCard
                title="Status Breakdown"
                value={`${safeStats.active} Active`}
                icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
                description={`${safeStats.inactive} Inactive • ${safeStats.partially_paid} Partial`}
            />
        </div>
    );
}