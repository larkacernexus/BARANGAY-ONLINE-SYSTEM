import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunityReport } from '@/types/communityReportTypes';
import { BarChart3 } from 'lucide-react';

interface QuickInsightsProps {
    filteredReports: CommunityReport[];
}

export default function QuickInsights({ filteredReports }: QuickInsightsProps) {
    const stats = {
        total: filteredReports.length,
        pending: filteredReports.filter(c => c.status === 'pending').length,
        resolved: filteredReports.filter(c => c.status === 'resolved').length,
        critical: filteredReports.filter(c => c.priority === 'critical').length,
        high: filteredReports.filter(c => c.priority === 'high').length,
        highUrgency: filteredReports.filter(c => c.urgency_level === 'high').length,
        safetyConcern: filteredReports.filter(c => c.safety_concern).length,
        totalEstimatedAffected: filteredReports.reduce((sum, c) => sum + (c.estimated_affected_count || 0), 0),
    };

    const statusCounts = {
        pending: filteredReports.filter(c => c.status === 'pending').length,
        under_review: filteredReports.filter(c => c.status === 'under_review').length,
        assigned: filteredReports.filter(c => c.status === 'assigned').length,
        in_progress: filteredReports.filter(c => c.status === 'in_progress').length,
        resolved: filteredReports.filter(c => c.status === 'resolved').length,
        rejected: filteredReports.filter(c => c.status === 'rejected').length,
    };

    return (
        <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Quick Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Filtered Stats:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stats.total} total</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pending:</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Resolved:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{stats.resolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Critical/High:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">{stats.critical + stats.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Safety Concerns:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">{stats.safetyConcern}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Affected:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stats.totalEstimatedAffected}</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Distribution by Status:</p>
                    <div className="space-y-1 text-sm">
                        {Object.entries(statusCounts).map(([status, count]) => {
                            if (count === 0) return null;
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="truncate max-w-[100px] text-gray-700 dark:text-gray-300" title={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <Badge variant="outline" className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                                        {count}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}