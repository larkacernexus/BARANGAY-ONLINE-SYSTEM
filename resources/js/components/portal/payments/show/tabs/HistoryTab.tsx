// payment-show/components/tabs/HistoryTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { History as HistoryIcon } from 'lucide-react'; // Rename the import
import { PaymentAuditLog } from '@/utils/portal/payments/payment-utils';

interface HistoryTabProps {
    auditLog: PaymentAuditLog[];
}

export function HistoryTab({ auditLog }: HistoryTabProps) {
    return (
        <ModernCard title="Audit Log">
            {auditLog && auditLog.length > 0 ? (
                <div className="relative">
                    {auditLog
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((log, index) => (
                            <div key={log.id || index} className="relative pb-4 last:pb-0">
                                {index < auditLog.length - 1 && (
                                    <div className="absolute left-3.5 top-5 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"></div>
                                )}
                                <div className="relative flex items-start gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <HistoryIcon className="h-3.5 w-3.5 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium">{log.action}</p>
                                            <p className="text-[10px] text-gray-500 flex-shrink-0">
                                                {log.created_at ? formatDateTime(log.created_at) : 'N/A'}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {log.description}
                                        </p>
                                        {log.created_by && (
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                By: {log.created_by.name} ({log.created_by.role})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <ModernEmptyState
                    status="default"
                    title="No History"
                    message="No audit log entries available for this payment"
                    icon={HistoryIcon}
                />
            )}
        </ModernCard>
    );
}