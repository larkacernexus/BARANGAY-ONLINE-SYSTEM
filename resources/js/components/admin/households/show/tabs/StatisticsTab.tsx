// resources/js/Pages/Admin/Households/Show/tabs/StatisticsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { BarChart3, History } from 'lucide-react';
import { Household } from '../types';
import { formatDateTime, formatTimeAgo } from '../utils/helpers';

interface StatisticsTabProps {
    household: Household;
    membersWithPrivileges: number;
    onShowMore: () => void;
    showMore: boolean;
}

export const StatisticsTab = ({ 
    household, 
    membersWithPrivileges,
    onShowMore,
    showMore
}: StatisticsTabProps) => {
    const maleCount = household.household_members?.filter(m => m.resident.gender?.toLowerCase() === 'male').length || 0;
    const femaleCount = household.household_members?.filter(m => m.resident.gender?.toLowerCase() === 'female').length || 0;
    const avgAge = household.household_members && household.household_members.length > 0
        ? Math.round(household.household_members.reduce((sum, m) => sum + m.resident.age, 0) / household.household_members.length)
        : 0;

    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <BarChart3 className="h-5 w-5" />
                        Household Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{household.member_count}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {household.statistics?.total_seniors || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Seniors</p>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Demographic Breakdown */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Demographic Breakdown</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Male Members:</span>
                                    <span className="font-medium dark:text-gray-200">{maleCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Female Members:</span>
                                    <span className="font-medium dark:text-gray-200">{femaleCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Age:</span>
                                    <span className="font-medium dark:text-gray-200">{avgAge} years</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Members with Photos:</span>
                                    <span className="font-medium dark:text-gray-200">
                                        {household.household_members?.filter(m => m.resident.has_photo).length || 0} / {household.member_count}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Members with Privileges:</span>
                                    <span className="font-medium dark:text-gray-200">{membersWithPrivileges}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Filter Links */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Members</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Link 
                                    href={route('admin.residents.index', { household_id: household.id, gender: 'male' })}
                                    className="block hover:no-underline"
                                >
                                    <Button variant="outline" size="sm" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                                        <span className="text-blue-600 dark:text-blue-400">{maleCount}</span>
                                        <span className="ml-2">Male Members</span>
                                    </Button>
                                </Link>
                                <Link 
                                    href={route('admin.residents.index', { household_id: household.id, gender: 'female' })}
                                    className="block hover:no-underline"
                                >
                                    <Button variant="outline" size="sm" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                                        <span className="text-pink-600 dark:text-pink-400">{femaleCount}</span>
                                        <span className="ml-2">Female Members</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <History className="h-5 w-5" />
                        Household Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="relative pl-6 pb-4">
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200 dark:bg-blue-900"></div>
                            <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                            <div>
                                <p className="font-medium dark:text-gray-200">Household Created</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(household.created_at)}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeAgo(household.created_at)}</p>
                            </div>
                        </div>
                        <div className="relative pl-6">
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                            <div>
                                <p className="font-medium dark:text-gray-200">Last Updated</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(household.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};