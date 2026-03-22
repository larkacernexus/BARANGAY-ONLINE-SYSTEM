// resources/js/components/admin/community-reports/show/components/quick-actions-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Send, Layers, HistoryIcon, Zap } from 'lucide-react';
import { CommunityReport } from './types';

interface QuickActionsCardProps {
    report: CommunityReport;
    onSendResponse: () => void;
}

export function QuickActionsCard({ report, onSendResponse }: QuickActionsCardProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-700 dark:to-yellow-700 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-white" />
                    </div>
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                    onClick={onSendResponse}
                    size="sm"
                >
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                </Button>
                <Button
                    variant="outline"
                    className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                    onClick={() => router.visit(route('admin.community-reports.related', report.id))}
                    size="sm"
                >
                    <Layers className="h-4 w-4 mr-2" />
                    View Related Reports
                </Button>
                {report.has_previous_report && report.previous_report && (
                    <Link href={route('admin.community-reports.show', report.previous_report.id)}>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-sm dark:border-gray-600 dark:text-gray-300"
                            size="sm"
                        >
                            <HistoryIcon className="h-4 w-4 mr-2" />
                            View Previous Report
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}