// resources/js/Pages/Admin/Positions/components/officials-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    UserPlus,
    UserCheck,
    Info,
} from 'lucide-react';
import { Position } from '@/types/admin/positions/position.types';

interface Props {
    position: Position;
}

export const OfficialsTab = ({ position }: Props) => {
    const hasOfficials = (position.officials_count ?? 0) > 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 dark:text-gray-100">
                        <Users className="h-5 w-5" />
                        Officials ({position.officials_count ?? 0})
                    </span>
                    <Link href={`/admin/officials/create?position_id=${position.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Official
                        </Button>
                    </Link>
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Officials assigned to this position
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasOfficials ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                                        {position.officials_count} Official(s) Assigned
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                        This position currently has {position.officials_count} official(s) assigned.
                                    </p>
                                </div>
                                <Link href={`/admin/officials?position_id=${position.id}`}>
                                    <Button variant="outline" className="border-blue-300 dark:border-blue-700">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p>Manage officials assigned to this position:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>View detailed information about each official</li>
                                        <li>Update official status and任期</li>
                                        <li>Remove or reassign officials as needed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">No officials assigned</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                This position doesn't have any officials assigned yet
                            </p>
                        </div>
                        <Link href={`/admin/officials/create?position_id=${position.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign First Official
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};