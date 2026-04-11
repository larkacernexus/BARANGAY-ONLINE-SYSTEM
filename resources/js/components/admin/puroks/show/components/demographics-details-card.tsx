// resources/js/Pages/Admin/Puroks/components/demographics-details-card.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Demographics } from '@/types/admin/puroks/purok';

interface Props {
    demographics: Demographics;
}

export const DemographicsDetailsCard = ({ demographics }: Props) => {
    // Safely extract demographics with default values
    const safeDemographics = useMemo(() => {
        if (!demographics) {
            return {
                gender: { male: 0, female: 0, other: 0 },
                ageGroups: { '0-17': 0, '18-30': 0, '31-59': 0, '60+': 0 },
                civilStatus: { single: 0, married: 0, widowed: 0, divorced: 0 },
                occupation: { employed: 0, unemployed: 0, student: 0, retired: 0 },
                education: { none: 0, elementary: 0, highSchool: 0, college: 0, postgraduate: 0 }
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
            },
            occupation: {
                employed: demographics.occupation?.employed ?? 0,
                unemployed: demographics.occupation?.unemployed ?? 0,
                student: demographics.occupation?.student ?? 0,
                retired: demographics.occupation?.retired ?? 0
            },
            education: {
                none: demographics.education?.none ?? 0,
                elementary: demographics.education?.elementary ?? 0,
                highSchool: demographics.education?.highSchool ?? 0,
                college: demographics.education?.college ?? 0,
                postgraduate: demographics.education?.postgraduate ?? 0
            }
        };
    }, [demographics]);

    const { gender, ageGroups, civilStatus, occupation, education } = safeDemographics;

    // Calculate totals
    const total = (gender.male || 0) + (gender.female || 0) + (gender.other || 0);
    
    // Calculate male to female ratio
    const maleToFemaleRatio = gender.female > 0 
        ? (gender.male / gender.female).toFixed(2)
        : gender.male > 0 ? '∞' : 'N/A';
    
    // Calculate age group totals for summary
    const children = ageGroups['0-17'] || 0;
    const youngAdults = ageGroups['18-30'] || 0;
    const adults = ageGroups['31-59'] || 0;
    const seniors = ageGroups['60+'] || 0;
    const adultsTotal = youngAdults + adults; // 18-59 age group
    
    // Calculate civil status percentages
    const civilStatusTotal = (civilStatus.single || 0) + 
                            (civilStatus.married || 0) + 
                            (civilStatus.widowed || 0) + 
                            (civilStatus.divorced || 0);
    
    // Calculate occupation percentages
    const occupationTotal = (occupation.employed || 0) + 
                           (occupation.unemployed || 0) + 
                           (occupation.student || 0) + 
                           (occupation.retired || 0);
    
    // Calculate education percentages
    const educationTotal = (education.elementary || 0) + 
                          (education.highSchool || 0) + 
                          (education.college || 0) + 
                          (education.postgraduate || 0) + 
                          (education.none || 0);

    // Check if there's any data to display
    const hasData = total > 0 || civilStatusTotal > 0 || occupationTotal > 0 || educationTotal > 0;

    if (!hasData) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Detailed Demographics</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Comprehensive demographic breakdown of residents
                    </CardDescription>
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
                <CardTitle className="dark:text-gray-100">Detailed Demographics</CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Comprehensive demographic breakdown of residents
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Gender Breakdown */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Gender Distribution</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gender.male || 0}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Male</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {total > 0 ? ((gender.male / total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{gender.female || 0}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Female</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {total > 0 ? ((gender.female / total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gender.other || 0}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Other</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {total > 0 ? (((gender.other || 0) / total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Age Distribution */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Age Distribution</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm dark:text-gray-300">Children (0-17)</span>
                                    <span className="font-medium dark:text-gray-200">{children}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ width: `${total > 0 ? (children / total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm dark:text-gray-300">Young Adults (18-30)</span>
                                    <span className="font-medium dark:text-gray-200">{youngAdults}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${total > 0 ? (youngAdults / total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm dark:text-gray-300">Adults (31-59)</span>
                                    <span className="font-medium dark:text-gray-200">{adults}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-yellow-500 h-2 rounded-full" 
                                        style={{ width: `${total > 0 ? (adults / total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm dark:text-gray-300">Seniors (60+)</span>
                                    <span className="font-medium dark:text-gray-200">{seniors}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full" 
                                        style={{ width: `${total > 0 ? (seniors / total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Civil Status */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Civil Status</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm dark:text-gray-300">Single</span>
                                <span className="font-medium dark:text-gray-200">{civilStatus.single || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm dark:text-gray-300">Married</span>
                                <span className="font-medium dark:text-gray-200">{civilStatus.married || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm dark:text-gray-300">Widowed</span>
                                <span className="font-medium dark:text-gray-200">{civilStatus.widowed || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm dark:text-gray-300">Divorced</span>
                                <span className="font-medium dark:text-gray-200">{civilStatus.divorced || 0}</span>
                            </div>
                        </div>
                        {civilStatusTotal > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Total: {civilStatusTotal} individuals
                            </p>
                        )}
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Occupation */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Occupation</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Employed</span>
                                <span className="font-medium dark:text-gray-200">{occupation.employed || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Unemployed</span>
                                <span className="font-medium dark:text-gray-200">{occupation.unemployed || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Student</span>
                                <span className="font-medium dark:text-gray-200">{occupation.student || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Retired</span>
                                <span className="font-medium dark:text-gray-200">{occupation.retired || 0}</span>
                            </div>
                        </div>
                        {occupationTotal > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Total: {occupationTotal} individuals
                            </p>
                        )}
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Education Level */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Education Level</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">No Formal Education</span>
                                <span className="font-medium dark:text-gray-200">{education.none || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Elementary</span>
                                <span className="font-medium dark:text-gray-200">{education.elementary || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">High School</span>
                                <span className="font-medium dark:text-gray-200">{education.highSchool || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">College</span>
                                <span className="font-medium dark:text-gray-200">{education.college || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Post Graduate</span>
                                <span className="font-medium dark:text-gray-200">{education.postgraduate || 0}</span>
                            </div>
                        </div>
                        {educationTotal > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Total: {educationTotal} individuals
                            </p>
                        )}
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    {/* Summary */}
                    <div>
                        <h4 className="text-sm font-medium mb-3 dark:text-gray-300">Summary Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Population</p>
                                <p className="text-2xl font-bold dark:text-gray-100">{total}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Male to Female Ratio</p>
                                <p className="text-2xl font-bold dark:text-gray-100">{maleToFemaleRatio}:1</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Working Age (18-59)</p>
                                <p className="text-2xl font-bold dark:text-gray-100">{adultsTotal}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {total > 0 ? ((adultsTotal / total) * 100).toFixed(1) : 0}% of population
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Dependency Ratio</p>
                                <p className="text-2xl font-bold dark:text-gray-100">
                                    {adultsTotal > 0 ? ((children + seniors) / adultsTotal * 100).toFixed(1) : 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Dependents per 100 working age
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};