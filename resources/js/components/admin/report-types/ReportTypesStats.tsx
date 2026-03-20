// components/admin/report-types/ReportTypesStats.tsx
import { FileText, CheckCircle, AlertTriangle, Shield, User, Zap } from 'lucide-react';
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
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        active: stats?.active || 0,
        requires_immediate_action: stats?.requires_immediate_action || 0,
        allows_anonymous: stats?.allows_anonymous || 0,
        requires_evidence: stats?.requires_evidence || 0,
        critical: stats?.critical || 0,
        high: stats?.high || 0,
        medium: stats?.medium || 0,
        low: stats?.low || 0
    };

    const inactiveCount = safeStats.total - safeStats.active;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
                title="Total Types"
                value={safeStats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${safeStats.active} active • ${inactiveCount} inactive`}
            />
            
            <StatCard
                title="Active"
                value={safeStats.active.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`${safeStats.requires_immediate_action} require urgent action`}
            />

            <StatCard
                title="Critical"
                value={safeStats.critical.toLocaleString()}
                icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                description={`${safeStats.high} high • ${safeStats.medium} med • ${safeStats.low} low`}
            />

            <StatCard
                title="Urgent Action"
                value={safeStats.requires_immediate_action.toLocaleString()}
                icon={<Zap className="h-4 w-4 text-amber-500" />}
                description="Require immediate response"
            />

            <StatCard
                title="Anonymous"
                value={safeStats.allows_anonymous.toLocaleString()}
                icon={<User className="h-4 w-4 text-purple-500" />}
                description="Allow anonymous reports"
            />

            <StatCard
                title="Evidence Required"
                value={safeStats.requires_evidence.toLocaleString()}
                icon={<Shield className="h-4 w-4 text-indigo-500" />}
                description="Require proof/evidence"
            />
        </div>
    );
}