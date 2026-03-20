// resources/js/Pages/Admin/Households/Show/components/household/HousingInfo.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building, Droplets, Zap, Wifi, Car } from 'lucide-react';
import { Household } from '../types';

interface HousingInfoProps {
    household: Household;
}

export const HousingInfo = ({ household }: HousingInfoProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Building className="h-5 w-5" />
                    Housing & Economic Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Details about housing and amenities
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Housing Type</p>
                        <p className="dark:text-gray-300">{household.housing_type || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ownership Status</p>
                        <p className="dark:text-gray-300">{household.ownership_status || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Water Source</p>
                        <div className="flex items-center gap-2 dark:text-gray-300">
                            <Droplets className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p>{household.water_source || 'Not specified'}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income Range</p>
                        <p className="dark:text-gray-300">{household.income_range || 'Not specified'}</p>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700 my-4" />

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Household Amenities</p>
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.electricity ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/50'} dark:text-gray-300`}>
                            <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Electricity</span>
                            {household.electricity ? (
                                <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                            ) : (
                                <Badge variant="outline" className="ml-auto dark:border-gray-600 dark:text-gray-300">No</Badge>
                            )}
                        </div>
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.internet ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/50'} dark:text-gray-300`}>
                            <Wifi className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Internet</span>
                            {household.internet ? (
                                <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                            ) : (
                                <Badge variant="outline" className="ml-auto dark:border-gray-600 dark:text-gray-300">No</Badge>
                            )}
                        </div>
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${household.vehicle ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/50'} dark:text-gray-300`}>
                            <Car className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span>Vehicle</span>
                            {household.vehicle ? (
                                <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Yes</Badge>
                            ) : (
                                <Badge variant="outline" className="ml-auto dark:border-gray-600 dark:text-gray-300">No</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};