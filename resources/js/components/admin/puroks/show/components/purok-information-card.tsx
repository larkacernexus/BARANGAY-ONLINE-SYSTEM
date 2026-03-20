// resources/js/Pages/Admin/Puroks/components/purok-information-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Building2,
    Globe,
} from 'lucide-react';
import { Purok } from '../types';
import { GoogleMapsSection } from './google-maps-section';

interface Props {
    purok: Purok;
}

export const PurokInformationCard = ({ purok }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Building2 className="h-5 w-5" />
                    Purok Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purok Name</p>
                        <p className="text-base dark:text-gray-200">{purok.name}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug/Code</p>
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                            {purok.slug}
                        </code>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        {purok.description || 'No description provided.'}
                    </p>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Google Maps Section */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Google Maps Location
                    </p>
                    <GoogleMapsSection purok={purok} />
                </div>
            </CardContent>
        </Card>
    );
};