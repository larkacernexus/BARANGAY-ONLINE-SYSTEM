import { BarChart3, PieChart, Heart, Briefcase, GraduationCap } from 'lucide-react';
import { AgeDistributionChart } from '../charts/AgeDistributionChart';
import { GenderDistributionChart } from '../charts/GenderDistributionChart';
import type { PageProps } from '@/components/admin/dashboard/types/dashboard';

interface DemographicsViewProps {
    demographicStats: PageProps['demographicStats'];
    totalResidents: number;
}

export function DemographicsView({ demographicStats, totalResidents }: DemographicsViewProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Age Distribution
                    </h3>
                </div>
                <AgeDistributionChart ageGroups={demographicStats?.ageGroups || []} />
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-rose-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Gender Distribution
                    </h3>
                </div>
                <GenderDistributionChart gender={demographicStats?.gender || { male: 0, female: 0, other: 0 }} />
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Civil Status
                    </h3>
                </div>
                <div className="space-y-3">
                    {demographicStats?.civilStatus?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className="h-2 rounded-full bg-purple-500"
                                        style={{ width: `${(item.count / totalResidents) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Employment Status
                    </h3>
                </div>
                <div className="space-y-3">
                    {demographicStats?.employment?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.type}</span>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${(item.count / totalResidents) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Educational Attainment
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {demographicStats?.educationalAttainment?.map((item, index) => (
                        <div key={index} className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {item.count}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.level}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}