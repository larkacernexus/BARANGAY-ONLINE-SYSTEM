// components/admin/payments/PaymentsStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, Clock, Users } from 'lucide-react';

interface Stat {
    label: string;
    value: string | number;
    change?: string;
    icon: string;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
}

interface PaymentsStatsProps {
    stats: {
        total: number;
        today: number;
        monthly: number;
        total_amount: number;
        today_amount: number;
        monthly_amount: number;
    };
}

export default function PaymentsStats({ stats }: PaymentsStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const statCards: Stat[] = [
        {
            label: 'Total Payments',
            value: stats?.total?.toLocaleString() || '0',
            icon: 'dollar-sign',
            color: 'text-blue-600 bg-blue-50',
            trend: 'up'
        },
        {
            label: "Today's Payments",
            value: stats?.today?.toLocaleString() || '0',
            icon: 'calendar',
            color: 'text-green-600 bg-green-50',
            change: formatCurrency(stats?.today_amount || 0)
        },
        {
            label: 'Monthly Payments',
            value: stats?.monthly?.toLocaleString() || '0',
            icon: 'calendar',
            color: 'text-purple-600 bg-purple-50',
            change: formatCurrency(stats?.monthly_amount || 0)
        },
        {
            label: 'Total Amount',
            value: formatCurrency(stats?.total_amount || 0),
            icon: 'dollar-sign',
            color: 'text-amber-600 bg-amber-50'
        }
    ];

    const getStatIcon = (iconName: string) => {
        switch (iconName) {
            case 'dollar-sign': return <DollarSign className="h-5 w-5" />;
            case 'calendar': return <Calendar className="h-5 w-5" />;
            case 'clock': return <Clock className="h-5 w-5" />;
            case 'users': return <Users className="h-5 w-5" />;
            default: return <DollarSign className="h-5 w-5" />;
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
                const bgColor = stat.color?.split(' ')[1] || 'bg-gray-50';
                const textColor = stat.color?.split(' ')[0] || 'text-gray-600';
                
                return (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {stat.label}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${bgColor}`}>
                                    {getStatIcon(stat.icon)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                                {stat.value}
                            </div>
                            {stat.change && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Amount: {stat.change}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}