// components/admin/payments/PaymentsStats.tsx
import { DollarSign, Calendar, Clock, Users } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface PaymentsStatsProps {
    stats: {
        total: number;
        today: number;
        monthly: number;
        total_amount: number;
        today_amount: number;
        monthly_amount: number;
    };
}

export default function PaymentsStats({ stats }: PaymentsStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        today: stats?.today || 0,
        monthly: stats?.monthly || 0,
        total_amount: stats?.total_amount || 0,
        today_amount: stats?.today_amount || 0,
        monthly_amount: stats?.monthly_amount || 0
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Payments"
                value={safeStats.total.toLocaleString()}
                icon={<DollarSign className="h-4 w-4 text-blue-500" />}
                description={`${formatCurrency(safeStats.total_amount)} total amount`}
            />
            <StatCard
                title="Today's Payments"
                value={safeStats.today.toLocaleString()}
                icon={<Calendar className="h-4 w-4 text-green-500" />}
                description={`Amount: ${formatCurrency(safeStats.today_amount)}`}
            />
            <StatCard
                title="Monthly Payments"
                value={safeStats.monthly.toLocaleString()}
                icon={<Calendar className="h-4 w-4 text-purple-500" />}
                description={`Amount: ${formatCurrency(safeStats.monthly_amount)}`}
            />
            <StatCard
                title="Total Amount"
                value={formatCurrency(safeStats.total_amount)}
                icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                description="All time collections"
            />
        </div>
    );
}