// components/admin/report-types/ReportTypesStats.tsx

import { FileText, AlertTriangle, User, Zap } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface ReportTypesStatsProps {
    stats: {
        total: number;
        active: number;
        requires_immediate_action: number;
        allows_anonymous: number;
        requires_evidence: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    priorityCounts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export default function ReportTypesStats({ stats, priorityCounts }: ReportTypesStatsProps) {
    const safeStats = {
        total: stats?.total || 0,
        requires_immediate_action: stats?.requires_immediate_action || 0,
        allows_anonymous: stats?.allows_anonymous || 0,
        critical: priorityCounts?.critical || stats?.critical || 0,
        high: priorityCounts?.high || stats?.high || 0,
    };

    const calculatePercentage = (value: number) => {
        if (safeStats.total === 0) return 0;
        return Math.round((value / safeStats.total) * 100);
    };

    const criticalAndHigh = safeStats.critical + safeStats.high;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                description="All report categories"
            />
            
            <StatCard
                title="Critical & High"
                value={criticalAndHigh.toLocaleString()}
                icon={<AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />}
                description={`${calculatePercentage(criticalAndHigh)}% of total`}
            />

            <StatCard
                title="Urgent Action"
                value={safeStats.requires_immediate_action.toLocaleString()}
                icon={<Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
                description="Require immediate response"
            />

            <StatCard
                title="Anonymous Allowed"
                value={safeStats.allows_anonymous.toLocaleString()}
                icon={<User className="h-5 w-5 text-purple-500 dark:text-purple-400" />}
                description={`${calculatePercentage(safeStats.allows_anonymous)}% allow anonymous`}
            />
        </div>
    );
}