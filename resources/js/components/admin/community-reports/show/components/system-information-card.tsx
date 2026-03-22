// resources/js/components/admin/community-reports/show/components/system-information-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Hash } from 'lucide-react';
import { CommunityReport } from './types';

interface SystemInformationCardProps {
    report: CommunityReport;
}

export function SystemInformationCard({ report }: SystemInformationCardProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                        <Hash className="h-3 w-3 text-white" />
                    </div>
                    System Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Report ID</p>
                    <p className="text-xs font-mono mt-1 dark:text-gray-300">{report.report_number || 'N/A'}</p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Database ID</p>
                    <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.id}</p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Report Type ID</p>
                    <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.report_type?.id || 'N/A'}</p>
                </div>
                {report.has_previous_report && report.previous_report_id && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Previous Report</p>
                            <p className="text-xs font-mono mt-1 dark:text-gray-300">#{report.previous_report_id}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}