import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { ActivityLog } from '@/types/clearance';

interface HistoryTabProps {
    activityLogs: ActivityLog[];
    formatDateTime: (date?: string) => string;
}

export function HistoryTab({ activityLogs, formatDateTime }: HistoryTabProps) {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Activity Log
                    </CardTitle>
                    <CardDescription>
                        Timeline of all actions performed on this clearance request
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activityLogs.length > 0 ? (
                        <div className="space-y-4">
                            {activityLogs.map((log: ActivityLog) => (
                                <div key={log.id} className="flex gap-3 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                                    <div className="flex-shrink-0 w-6 h-6 -ml-3 mt-0.5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{log.user?.name || 'System'}</p>
                                            <p className="text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                                        {log.event && (
                                            <Badge variant="outline" className="mt-2">
                                                {log.event}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <History className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
                            <p className="text-gray-500 mt-1">
                                No actions have been performed on this request yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}