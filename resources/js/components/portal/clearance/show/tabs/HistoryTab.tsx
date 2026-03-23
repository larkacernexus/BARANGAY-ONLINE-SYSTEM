// clearance-show/components/tabs/HistoryTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { History, Clock } from 'lucide-react';
import { StatusHistory } from '@/types/portal/clearances/clearance.types';
import { getStatusConfig } from '@/utils/portal/clearances/clearance-utils';

interface HistoryTabProps {
    statusHistory: StatusHistory[];
}

export function HistoryTab({ statusHistory }: HistoryTabProps) {
    return (
        <ModernCard title="Status History">
            {statusHistory && statusHistory.length > 0 ? (
                <div className="relative">
                    {statusHistory
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((history, index) => {
                            const StatusIcon = getStatusConfig(history.status).icon;
                            return (
                                <div key={history.id || index} className="relative pb-4 last:pb-0">
                                    {index < statusHistory.length - 1 && (
                                        <div className="absolute left-3.5 top-5 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-gray-200 dark:from-blue-400 dark:to-gray-700"></div>
                                    )}
                                    <div className="relative flex items-start gap-2">
                                        <div className={cn(
                                            "relative flex h-7 w-7 items-center justify-center rounded-lg shadow-sm flex-shrink-0",
                                            getStatusConfig(history.status).gradient
                                        )}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <ModernStatusBadge status={history.status} showIcon={false} />
                                                <p className="text-[10px] text-gray-500 flex-shrink-0">
                                                    {formatDateTime(history.created_at)}
                                                </p>
                                            </div>
                                            {history.remarks && (
                                                <div className="mt-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                    <p className="text-[10px]">{history.remarks}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                <ModernEmptyState
                    status="empty"
                    title="No History"
                    message="No status history available for this clearance"
                    icon={History}
                />
            )}
        </ModernCard>
    );
}