// components/admin/fees/FeesStats.tsx

import { 
    FileText, 
    DollarSign, 
    CreditCard, 
    Percent,
    CheckCircle
} from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';
import { Stats } from '@/types/admin/fees/fees';

interface FeesStatsProps {
    stats: Stats;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function FeesStats({ stats }: FeesStatsProps) {
    // Extract values safely from the Stats interface
    const total = stats?.total || 0;
    const totalAmount = stats?.total_amount || 0;
    const paid = stats?.status_counts?.paid || 0;
    const pending = stats?.status_counts?.pending || stats?.pending || 0;
    const issued = stats?.issued_count || 0;
    const overdue = stats?.overdue_count || 0;
    const collected = stats?.collected || paid || 0;
    const active = stats?.active || 0;
    const inactive = stats?.inactive || 0;
    const partiallyPaid = stats?.partially_paid_count || stats?.status_counts?.partial || stats?.status_counts?.partially_paid || 0;

    const collectionRate = total > 0 
        ? Math.round((paid / total) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Fees"
                value={total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${formatCurrency(totalAmount)} total amount`}
            />
            <StatCard
                title="Collected"
                value={formatCurrency(collected)}
                icon={<CreditCard className="h-4 w-4 text-green-500" />}
                description={`${formatCurrency(pending)} pending`}
            />
            <StatCard
                title="Collection Rate"
                value={`${collectionRate}%`}
                icon={<Percent className="h-4 w-4 text-purple-500" />}
                description={`${issued} issued • ${overdue} overdue`}
            />
            <StatCard
                title="Status Breakdown"
                value={`${total} Total`}
                icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
                description={`${paid} Paid • ${pending} Pending • ${partiallyPaid} Partial`}
            />
        </div>
    );
}