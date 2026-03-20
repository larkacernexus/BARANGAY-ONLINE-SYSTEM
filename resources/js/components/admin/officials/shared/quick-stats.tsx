// components/admin/officials/shared/quick-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Crown, UserCheck } from 'lucide-react';
import { Resident, PositionOption, CommitteeOption } from '@/components/admin/officials/shared/types/official';

interface QuickStatsProps {
    availableResidents: Resident[];
    positions: PositionOption[];
    committees: CommitteeOption[];
    isCaptain: boolean;
    isKeyPosition: boolean;
}

export function QuickStats({
    availableResidents,
    positions,
    committees,
    isCaptain,
    isKeyPosition
}: QuickStatsProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                        <Info className="h-3 w-3 text-white" />
                    </div>
                    Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Available Residents:</span>
                        <span className="font-medium dark:text-gray-200">{availableResidents.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">With Photos:</span>
                        <span className="font-medium dark:text-gray-200">
                            {availableResidents.filter(r => r.photo_url).length}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Active Officials:</span>
                        <span className="font-medium dark:text-gray-200">{positions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Committees:</span>
                        <span className="font-medium dark:text-gray-200">{committees.length}</span>
                    </div>
                    {isCaptain && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                                <Crown className="h-4 w-4" />
                                <span className="text-sm font-medium">Barangay Captain Position</span>
                            </div>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                This is the highest position. Only one resident can be captain at a time.
                            </p>
                        </div>
                    )}
                    {isKeyPosition && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                            <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                                <UserCheck className="h-4 w-4" />
                                <span className="text-sm font-medium">Key Position</span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                System account is required for this position.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}