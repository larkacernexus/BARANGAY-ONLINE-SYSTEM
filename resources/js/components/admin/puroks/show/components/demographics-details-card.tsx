// resources/js/Pages/Admin/Puroks/components/demographics-details-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Demographics } from '../types';

interface Props {
    demographics: Demographics;
}

export const DemographicsDetailsCard = ({ demographics }: Props) => {
    const total = demographics.gender.male + demographics.gender.female + demographics.gender.other;
    const maleToFemaleRatio = demographics.gender.female > 0 
        ? (demographics.gender.male / demographics.gender.female).toFixed(2)
        : 'N/A';

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="dark:text-gray-100">Detailed Demographics</CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Additional demographic information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Gender Breakdown</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{demographics.gender.male}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Male</p>
                            </div>
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{demographics.gender.female}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Female</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demographics.gender.other}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Other</p>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div>
                        <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Age Distribution</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Children (0-17)</span>
                                <span className="font-medium dark:text-gray-200">{demographics.age_groups.children}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Adults (18-59)</span>
                                <span className="font-medium dark:text-gray-200">{demographics.age_groups.adults}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm dark:text-gray-300">Seniors (60+)</span>
                                <span className="font-medium dark:text-gray-200">{demographics.age_groups.seniors}</span>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div>
                        <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Population</p>
                                <p className="text-xl font-bold dark:text-gray-100">{total}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Male to Female Ratio</p>
                                <p className="text-xl font-bold dark:text-gray-100">{maleToFemaleRatio}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};