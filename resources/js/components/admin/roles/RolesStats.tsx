// components/admin/roles/RolesStats.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Edit, Key } from 'lucide-react';

interface RolesStatsProps {
    stats: Array<{ label: string; value: string | number }>;
}

export default function RolesStats({ stats }: RolesStatsProps) {
    const getIcon = (label: string) => {
        if (label.toLowerCase().includes('system')) return <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
        if (label.toLowerCase().includes('custom')) return <Edit className="h-6 w-6 text-green-600 dark:text-green-400" />;
        if (label.toLowerCase().includes('user')) return <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
        return <Key className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
    };

    const getBgColor = (label: string) => {
        if (label.toLowerCase().includes('system')) return 'bg-purple-100 dark:bg-purple-900';
        if (label.toLowerCase().includes('custom')) return 'bg-green-100 dark:bg-green-900';
        if (label.toLowerCase().includes('user')) return 'bg-blue-100 dark:bg-blue-900';
        return 'bg-gray-100 dark:bg-gray-900';
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-full ${getBgColor(stat.label)} flex items-center justify-center`}>
                                {getIcon(stat.label)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}