// components/admin/fee-types/FeeTypesStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, DollarSign, Tag } from 'lucide-react';

interface FeeTypesStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        mandatory: number;
        autoGenerate: number;
        totalAmount: number;
    };
    categoryCounts: Record<string, number>;
}

export default function FeeTypesStats({ stats, categoryCounts }: FeeTypesStatsProps) {
    const formatCurrency = (amount: number): string => {
        return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        Filtered Fee Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {stats.active} active • {stats.inactive} inactive
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
                        {stats.mandatory} mandatory • {stats.autoGenerate} auto-gen
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-amber-500" />
                        Total Base Amount
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Average per fee type
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-purple-500" />
                        Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {categoryCounts['uncategorized'] || 0} uncategorized
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}