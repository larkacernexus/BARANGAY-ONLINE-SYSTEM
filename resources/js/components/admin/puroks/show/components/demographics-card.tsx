// resources/js/Pages/Admin/Puroks/components/demographics-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
} from 'lucide-react';
import { Demographics } from '../types';

interface Props {
    demographics: Demographics;
}

export const DemographicsCard = ({ demographics }: Props) => {
    const total = demographics.gender.male + demographics.gender.female + demographics.gender.other;
    const malePercentage = total > 0 ? Math.round((demographics.gender.male / total) * 100) : 0;
    const femalePercentage = total > 0 ? Math.round((demographics.gender.female / total) * 100) : 0;
    const otherPercentage = total > 0 ? Math.round((demographics.gender.other / total) * 100) : 0;

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
                                <span className="font-medium dark:text-gray-200">{demographics.gender.male} ({malePercentage}%)</span>
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
                                <span className="font-medium dark:text-gray-200">{demographics.gender.female} ({femalePercentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-pink-600 dark:bg-pink-500 h-2 rounded-full" 
                                    style={{ width: `${femalePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        {demographics.gender.other > 0 && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="dark:text-gray-300">Other</span>
                                    <span className="font-medium dark:text-gray-200">{demographics.gender.other} ({otherPercentage}%)</span>
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
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Children (&lt;18)
                            </span>
                            <span className="font-medium dark:text-gray-200">{demographics.age_groups.children}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Adults (18-59)
                            </span>
                            <span className="font-medium dark:text-gray-200">{demographics.age_groups.adults}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm dark:text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                Seniors (60+)
                            </span>
                            <span className="font-medium dark:text-gray-200">{demographics.age_groups.seniors}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};