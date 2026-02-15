// components/admin/committees/CommitteesStats.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle, XCircle, Users, Folder } from 'lucide-react';

interface CommitteesStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        with_positions: number;
        without_positions: number;
    };
}

export function CommitteesStats({ stats }: CommitteesStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Committees</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Target className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Inactive</p>
                            <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-gray-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">With Positions</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.with_positions}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Without Positions</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.without_positions}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Folder className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}