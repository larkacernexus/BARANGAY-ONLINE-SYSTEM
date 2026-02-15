import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    FileText, 
    DollarSign, 
    CreditCard, 
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Percent
} from 'lucide-react';
import { Stats } from '@/types/fees.types';

interface FeesStatsProps {
    stats: Stats;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function FeesStats({ stats }: FeesStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Fees Card */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Total Fees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {formatCurrency(stats.total_amount)} total amount
                    </div>
                </CardContent>
            </Card>

            {/* Collected Card */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Collected
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(stats.collected)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatCurrency(stats.pending)} pending
                    </div>
                </CardContent>
            </Card>

            {/* This Month Card */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        This Month
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">+{stats.issued_count}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            {stats.overdue_count} overdue
                        </span>
                        •
                        <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3 text-blue-500" />
                            {stats.partially_paid_count} partial
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Status Overview Card */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Status Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.waived_count}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Waived • {stats.partially_paid_count} Partial
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}