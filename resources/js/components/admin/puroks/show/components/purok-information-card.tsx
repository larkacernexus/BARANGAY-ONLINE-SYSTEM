// resources/js/Pages/Admin/Puroks/components/purok-information-card.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Building2,
    Globe,
    MapPin,
    Hash,
    FileText,
    ExternalLink
} from 'lucide-react';
import { Purok } from '@/types/admin/puroks/purok';

interface Props {
    purok: Purok;
}

export const PurokInformationCard = ({ purok }: Props) => {
    const hasMapUrl = purok.google_maps_url && purok.google_maps_url.trim() !== '';

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
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            Purok Name
                        </div>
                        <p className="text-base font-medium dark:text-gray-200">{purok.name}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <Hash className="h-4 w-4" />
                            Slug/Code
                        </div>
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                            {purok.slug}
                        </code>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <FileText className="h-4 w-4" />
                        Description
                    </div>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        {purok.description || 'No description provided.'}
                    </p>
                </div>

                <Separator className="dark:bg-gray-700" />

                {/* Google Maps Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Globe className="h-4 w-4" />
                        Google Maps Location
                    </div>
                    
                    {hasMapUrl ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <a 
                                    href={purok.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="text-sm truncate">{purok.google_maps_url}</span>
                                </a>
                            </div>
                            
                            {/* Embedded Map Preview */}
                            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <iframe
                                    title={`Map of ${purok.name}`}
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(purok.google_maps_url)}`}
                                    className="dark:opacity-90"
                                >
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        <p>Map preview requires Google Maps API key</p>
                                        <a 
                                            href={purok.google_maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline mt-2 inline-block"
                                        >
                                            Open in Google Maps →
                                        </a>
                                    </div>
                                </iframe>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                            <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No map location set for this purok.
                            </p>
                            <a 
                                href={`/admin/puroks/${purok.id}/edit`}
                                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Add map location
                            </a>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};