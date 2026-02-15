import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunityReport } from '@/admin-utils/communityReportTypes';
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
        <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Quick Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Filtered Stats:</span>
                        <span className="font-medium">{stats.total} total</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending:</span>
                        <span className="font-medium text-amber-600">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Resolved:</span>
                        <span className="font-medium text-green-600">{stats.resolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical/High:</span>
                        <span className="font-medium text-red-600">{stats.critical + stats.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Safety Concerns:</span>
                        <span className="font-medium text-orange-600">{stats.safetyConcern}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estimated Affected:</span>
                        <span className="font-medium">{stats.totalEstimatedAffected}</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Distribution by Status:</p>
                    <div className="space-y-1 text-sm">
                        {Object.entries(statusCounts).map(([status, count]) => {
                            if (count === 0) return null;
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <span className="truncate max-w-[100px]" title={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <Badge variant="outline">{count}</Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}