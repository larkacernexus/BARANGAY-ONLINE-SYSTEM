import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommunityReport } from '@/admin-utils/communityReportTypes';
import { truncateText, getTimeAgo } from '@/admin-utils/communityReportHelpers';
import { Clock } from 'lucide-react';

interface RecentReportsProps {
    reports: CommunityReport[];
    windowWidth: number;
}

export default function RecentReports({ reports, windowWidth }: RecentReportsProps) {
    const titleLength = 30;
    const userNameLength = 15;
    
    return (
        <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Recent Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                {reports.slice(0, 3).length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">No recent reports</p>
                ) : (
                    <div className="space-y-3">
                        {reports.slice(0, 3).map((report) => (
                            <div key={report.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex-1 min-w-0">
                                    <p 
                                        className="font-medium truncate"
                                        title={report.title}
                                    >
                                        {truncateText(report.title, titleLength)}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {report.report_number} • {getTimeAgo(report.created_at)}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {report.is_anonymous ? 'Anonymous' : truncateText(report.user?.name || 'Unknown', userNameLength)} • {report.report_type?.name}
                                    </p>
                                </div>
                                <Badge 
                                    variant={report.priority === 'critical' || report.priority === 'high' ? 'destructive' : 'outline'} 
                                    className="ml-2 flex-shrink-0"
                                >
                                    {report.priority}
                                </Badge>
                            </div>
                        ))}
                        {reports.length > 3 && (
                            <div className="text-center pt-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8"
                                >
                                    View All Reports
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}