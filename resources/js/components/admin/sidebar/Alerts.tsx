import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertOctagon as AlertOctagonIcon, Activity } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface ReportStats {
    total: number;
    pending: number;
    community_reports: number;
    blotters: number;
    today: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    high_priority: number;
    pending_clearances: number;
}

interface AlertsProps {
    reportStats: ReportStats;
    isCollapsed: boolean;
}

export function TodayStats({ reportStats, isCollapsed }: AlertsProps) {
    if (isCollapsed || reportStats.today === 0) return null;

    return (
        <div className="mb-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-2.5 dark:from-orange-900/20 dark:to-amber-900/20">
            <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-orange-900 dark:text-orange-200">
                        Today's Activity
                    </span>
                </div>
                <Badge
                    variant="outline"
                    className="h-5 border-orange-200 bg-orange-100 px-1.5 text-[10px] text-orange-700 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-300"
                >
                    {reportStats.today} new
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <StatsCard
                    icon={AlertCircle}
                    title="Community"
                    value={reportStats.community_reports}
                    color="bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400"
                    isCollapsed={isCollapsed}
                />
                <StatsCard
                    icon={AlertOctagonIcon}
                    title="Blotters"
                    value={reportStats.blotters}
                    color="bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400"
                    isCollapsed={isCollapsed}
                />
            </div>
        </div>
    );
}

export function PendingAlert({ reportStats, isCollapsed }: AlertsProps) {
    if (isCollapsed || reportStats.pending === 0) return null;

    return (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-2.5 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-900 dark:text-yellow-200">
                        Attention Needed
                    </span>
                </div>
                <Badge
                    variant="destructive"
                    className="h-5 animate-pulse px-1.5 text-[10px]"
                >
                    {reportStats.pending} pending
                </Badge>
            </div>
            <div className="text-[10px] text-yellow-800 dark:text-yellow-300">
                {reportStats.pending === 1
                    ? '1 community report needs review'
                    : `${reportStats.pending} community reports need review`}
            </div>
        </div>
    );
}

export function UrgentAlert({ reportStats, isCollapsed }: AlertsProps) {
    const urgentCount = reportStats.high_priority || 0;
    if (isCollapsed || urgentCount === 0) return null;

    return (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-900/20">
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <AlertOctagonIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-medium text-red-900 dark:text-red-200">
                        Urgent Reports
                    </span>
                </div>
                <Badge
                    variant="destructive"
                    className="h-5 animate-pulse bg-red-600 px-1.5 text-[10px]"
                >
                    {urgentCount} urgent
                </Badge>
            </div>
            <div className="text-[10px] text-red-800 dark:text-red-300">
                {urgentCount === 1
                    ? '1 high priority report requires immediate action'
                    : `${urgentCount} high priority reports require immediate action`}
            </div>
        </div>
    );
}

export function CollapsedStats({ reportStats, isCollapsed }: AlertsProps) {
    if (!isCollapsed) return null;

    return (
        <div className="mb-3 flex flex-col items-center gap-1">
            {reportStats.total > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-800">
                    <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                        {reportStats.total}
                    </span>
                </div>
            )}
            {reportStats.pending > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
                    <span className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-300">
                        {reportStats.pending}
                    </span>
                </div>
            )}
        </div>
    );
}