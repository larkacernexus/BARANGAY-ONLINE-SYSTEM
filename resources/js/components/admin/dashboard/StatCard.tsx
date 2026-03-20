// components/admin/dashboard/StatCard.tsx
import { Link } from '@inertiajs/react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { StatItem } from '@/components/admin/dashboard/types/dashboard';

interface StatCardProps {
    stat: StatItem;
}

export function StatCard({ stat }: StatCardProps) {
    const Icon = stat.icon;
    
    const getTrendIcon = () => {
        switch(stat.trend) {
            case 'up':
                return <ArrowUp className="h-3 w-3 text-green-600" />;
            case 'down':
                return <ArrowDown className="h-3 w-3 text-red-600" />;
            default:
                return <Minus className="h-3 w-3 text-gray-600" />;
        }
    };

    const getChangeColor = () => {
        switch(stat.changeType) {
            case 'increase':
                return 'text-green-600 bg-green-50';
            case 'decrease':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <Link href={stat.href} className="block">
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900">
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 ${stat.color}`} />
                
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                        </p>
                    </div>
                    
                    {/* Icon */}
                    <div className={`rounded-lg p-3 ${stat.color} text-white`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getChangeColor()}`}>
                        {getTrendIcon()}
                        {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                        vs yesterday
                    </span>
                </div>
            </div>
        </Link>
    );
}