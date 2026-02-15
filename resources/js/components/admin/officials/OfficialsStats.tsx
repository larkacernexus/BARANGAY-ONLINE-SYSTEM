// components/admin/officials/OfficialsStats.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Shield, TargetIcon } from 'lucide-react';
import { getColorClass } from '@/admin-utils/officialsUtils';

interface OfficialsStatsProps {
    stats: any;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
}

export default function OfficialsStats({ stats, positions, committees }: OfficialsStatsProps) {
    const getPositionCounts = () => {
        const positionEntries = Object.entries(stats.by_position || {});
        return positionEntries.slice(0, 3).map(([position, count]) => ({
            name: positions[position]?.name || position,
            count
        }));
    };

    return (
        <>
            {/* Main Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Officials</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    {stats.current} current • {stats.regular} regular
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current Term</p>
                                <p className="text-2xl font-bold text-green-600">{stats.current}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    Active officials
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">By Position</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.by_position?.captain || 0}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    Captain • Kagawads • Secretary
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Committee Heads</p>
                                <p className="text-2xl font-bold text-orange-600">{Object.keys(committees).length}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    Committee assignments
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                <TargetIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Position Distribution */}
            {getPositionCounts().length > 0 && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Position Distribution</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {getPositionCounts().map((position, index) => (
                                <div key={position.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">{position.name}</span>
                                    <Badge className={getColorClass(['blue', 'green', 'purple'][index] || 'blue')}>
                                        {position.count}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}