import { 
    FileText, 
    AlertTriangle, 
    CheckCircle, 
    Globe
} from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';
import type { Stats } from '@/types/admin/reports/community-report';

interface CommunityReportsStatsProps {
    stats: Stats;
}

export default function CommunityReportsStats({ stats }: CommunityReportsStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Reports"
                value={stats.total.toLocaleString()}
                icon={<FileText className="h-4 w-4 text-blue-500" />}
                description={`${stats.today} today, ${stats.this_week} this week`}
            />
            <StatCard
                title="Pending & Urgent"
                value={stats.pending.toLocaleString()}
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                description={`${stats.critical_priority} critical, ${stats.high_urgency} urgent`}
            />
            <StatCard
                title="Resolved"
                value={stats.resolved.toLocaleString()}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description={`Avg: ${stats.average_resolution_time}, ${stats.safety_concerns} safety`}
            />
            <StatCard
                title="Community Impact"
                value={`${stats.community_impact_count}/${stats.individual_impact_count}`}
                icon={<Globe className="h-4 w-4 text-purple-500" />}
                description={`${stats.anonymous} anonymous reports`}
            />
        </div>
    );
}