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
import { Stats } from '@/types/admin/fee-types/fee.types';

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
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        total_amount: stats?.total_amount || 0,
        collected: stats?.collected || 0,
        pending: stats?.pending || 0,
        issued_count: stats?.issued_count || 0,
        overdue_count: stats?.overdue_count || 0,
        partially_paid_count: stats?.partially_paid_count || 0,
        waived_count: stats?.waived_count || 0
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Fees"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${formatCurrency(safeStats.total_amount)} total amount`}
            />
            <StatCard
                title="Collected"
                value={formatCurrency(safeStats.collected)}
                icon={<CreditCard className="h-4 w-4 text-green-500" />}
                description={`${formatCurrency(safeStats.pending)} pending`}
            />
            <StatCard
                title="This Month"
                value={`+${safeStats.issued_count.toLocaleString()}`}
                icon={<Calendar className="h-4 w-4 text-purple-500" />}
                description={`${safeStats.overdue_count} overdue • ${safeStats.partially_paid_count} partial`}
            />
            <StatCard
                title="Status Overview"
                value={safeStats.waived_count.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
                description={`Waived • ${safeStats.partially_paid_count} Partial`}
            />
        </div>
    );
}