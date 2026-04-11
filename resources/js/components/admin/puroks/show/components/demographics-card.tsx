import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3 } from 'lucide-react';
import { Demographics } from '@/types/admin/puroks/purok';

interface Props {
    demographics: Demographics;
}

export const DemographicsCard = ({ demographics }: Props) => {
    // Safely extract demographics with default values
    const safeDemographics = useMemo(() => {
        if (!demographics) {
            return {
                gender: { male: 0, female: 0, other: 0 },
                ageGroups: { '0-17': 0, '18-30': 0, '31-59': 0, '60+': 0 },
                civilStatus: { single: 0, married: 0, widowed: 0, divorced: 0 }
            };
        }
        
        return {
            gender: {
                male: demographics.gender?.male ?? 0,
                female: demographics.gender?.female ?? 0,
                other: demographics.gender?.other ?? 0
            },
            ageGroups: {
                '0-17': demographics.ageGroups?.['0-17'] ?? 0,
                '18-30': demographics.ageGroups?.['18-30'] ?? 0,
                '31-59': demographics.ageGroups?.['31-59'] ?? 0,
                '60+': demographics.ageGroups?.['60+'] ?? 0
            },
            civilStatus: {
                single: demographics.civilStatus?.single ?? 0,
                married: demographics.civilStatus?.married ?? 0,
                widowed: demographics.civilStatus?.widowed ?? 0,
                divorced: demographics.civilStatus?.divorced ?? 0
            }
        };
    }, [demographics]);

    const { gender, ageGroups, civilStatus } = safeDemographics;

    // Calculate totals safely
    const total = (gender.male || 0) + (gender.female || 0) + (gender.other || 0);
    const malePercentage = total > 0 ? Math.round(((gender.male || 0) / total) * 100) : 0;
    const femalePercentage = total > 0 ? Math.round(((gender.female || 0) / total) * 100) : 0;
    const otherPercentage = total > 0 && (gender.other || 0) > 0 ? Math.round(((gender.other || 0) / total) * 100) : 0;

    // Calculate total for age groups
    const totalAgeGroups = (ageGroups['0-17'] || 0) + 
                          (ageGroups['18-30'] || 0) + 
                          (ageGroups['31-59'] || 0) + 
                          (ageGroups['60+'] || 0);

    // Check if there's any data to display
    const hasData = total > 0 || totalAgeGroups > 0;

    if (!hasData) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <BarChart3 className="h-5 w-5" />
                        Demographics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No demographic data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Demographics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Gender Distribution with Progress Bars */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Gender Distribution</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Total: {total}</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="dark:text-gray-300">Male</span>
                                <span className="font-medium dark:text-gray-200">{gender.male || 0} ({malePercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${malePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="dark:text-gray-300">Female</span>
                                <span className="font-medium dark:text-gray-200">{gender.female || 0} ({femalePercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-pink-600 dark:bg-pink-500 h-2 rounded-full" 
                                    style={{ width: `${femalePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        {(gender.other || 0) > 0 && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="dark:text-gray-300">Other</span>
                                    <span className="font-medium dark:text-gray-200">{gender.other || 0} ({otherPercentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full" 
                                        style={{ width: `${otherPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Age Groups */}
                <div>
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600 dark:text-gray-400">Age Groups</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Total: {totalAgeGroups}</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                0-17 (Children)
                            </span>
                            <span className="font-medium dark:text-gray-200">{ageGroups['0-17'] || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                18-30 (Young Adults)
                            </span>
                            <span className="font-medium dark:text-gray-200">{ageGroups['18-30'] || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                31-59 (Adults)
                            </span>
                            <span className="font-medium dark:text-gray-200">{ageGroups['31-59'] || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                60+ (Seniors)
                            </span>
                            <span className="font-medium dark:text-gray-200">{ageGroups['60+'] || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Civil Status Section */}
                {(civilStatus.single > 0 || civilStatus.married > 0 || civilStatus.widowed > 0 || civilStatus.divorced > 0) && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-gray-600 dark:text-gray-400">Civil Status</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-gray-300">Single</span>
                                    <span className="font-medium dark:text-gray-200">{civilStatus.single || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-gray-300">Married</span>
                                    <span className="font-medium dark:text-gray-200">{civilStatus.married || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-gray-300">Widowed</span>
                                    <span className="font-medium dark:text-gray-200">{civilStatus.widowed || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm dark:text-gray-300">Divorced</span>
                                    <span className="font-medium dark:text-gray-200">{civilStatus.divorced || 0}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};