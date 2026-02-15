// components/admin/clearance-types/ClearanceTypesStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, CreditCard, Shield, Globe } from 'lucide-react';

interface Stats {
    total: number;
    active: number;
    requires_payment: number;
    requires_approval: number;
    online_only: number;
}

interface ClearanceTypesStatsProps {
    stats: Stats;
}

export default function ClearanceTypesStats({ stats }: ClearanceTypesStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Total Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        All clearance types
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
                    <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                        Paid Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.requires_payment}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.total > 0 ? Math.round((stats.requires_payment / stats.total) * 100) : 0}% of total
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-purple-500" />
                        Needs Approval
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.requires_approval}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.total > 0 ? Math.round((stats.requires_approval / stats.total) * 100) : 0}% of total
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                        Online Only
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.online_only}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.total > 0 ? Math.round((stats.online_only / stats.total) * 100) : 0}% of total
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}