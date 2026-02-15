// components/admin/report-types/ReportTypesStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertTriangle, Shield, User, Zap, Clock } from 'lucide-react';

interface ReportTypesStatsProps {
    stats: {
        total: number;
        active: number;
        requires_immediate_action: number;
        allows_anonymous: number;
        requires_evidence: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    priorityCounts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export default function ReportTypesStats({ stats, priorityCounts }: ReportTypesStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Total Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.active} active • {stats.total - stats.active} inactive
                    </div>
                </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Active
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.requires_immediate_action} urgent
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Critical
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.critical.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.high} high • {stats.medium} medium • {stats.low} low
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-amber-500" />
                        Urgent Action
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.requires_immediate_action.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Requires immediate response
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-500" />
                        Anonymous
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.allows_anonymous.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Allows anonymous reports
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-indigo-500" />
                        Evidence Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.requires_evidence.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Requires proof/evidence
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}