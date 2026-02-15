import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stats } from '@/admin-utils/communityReportTypes';
import { 
    FileText, 
    AlertTriangle, 
    CheckCircle, 
    Globe, 
    Clock, 
    TrendingUp, 
    Zap, 
    ShieldAlert,
    Timer 
} from 'lucide-react';

interface CommunityReportsStatsProps {
    stats: Stats;
}

export default function CommunityReportsStats({ stats }: CommunityReportsStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Total Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {stats.today} today
                        </div>
                        <div className="flex items-center ml-auto">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stats.this_week} this week
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Pending & Urgent
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                            <span className="text-red-600 font-medium">{stats.critical_priority} critical</span>
                        </div>
                        <div className="flex items-center ml-auto">
                            <Zap className="h-3 w-3 mr-1 text-red-500" />
                            {stats.high_urgency} high urgency
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Resolved
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                            <Timer className="h-3 w-3 mr-1" />
                            Avg: {stats.average_resolution_time}
                        </div>
                        <div className="flex items-center ml-auto">
                            <ShieldAlert className="h-3 w-3 mr-1 text-orange-500" />
                            {stats.safety_concerns} safety
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-500" />
                        Community Impact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{stats.community_impact_count}</div>
                            <div className="text-xs text-gray-500 mt-1">Community</div>
                        </div>
                        <div className="text-gray-300">/</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-600">{stats.individual_impact_count}</div>
                            <div className="text-xs text-gray-500 mt-1">Individual</div>
                        </div>
                        <div className="text-gray-300">/</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.anonymous}</div>
                            <div className="text-xs text-gray-500 mt-1">Anonymous</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}