// resources/js/Pages/Admin/Puroks/components/google-maps-section.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Globe,
    ExternalLink,
    Navigation,
    Copy,
    Check,
    Edit,
} from 'lucide-react';
import { Purok } from '../types';
import { truncateUrl, formatCoordinates } from '../utils/helpers';

interface Props {
    purok: Purok;
}

export const GoogleMapsSection = ({ purok }: Props) => {
    const [copied, setCopied] = useState(false);

    const copyCoordinates = () => {
        if (purok.latitude && purok.longitude) {
            navigator.clipboard.writeText(`${purok.latitude}, ${purok.longitude}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!purok.google_maps_url) {
        return (
            <div className="border dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 text-center">
                <Globe className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-3">No Google Maps location set</p>
                <Link href={`/admin/puroks/${purok.id}/edit`}>
                    <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-3 w-3 mr-1" />
                        Add Map Location
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* URL Display */}
            <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium dark:text-gray-200">Google Maps Link</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                            {truncateUrl(purok.google_maps_url)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <a 
                    href={purok.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Maps
                    </Button>
                </a>
                {purok.latitude && purok.longitude ? (
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${purok.latitude},${purok.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                        </Button>
                    </a>
                ) : (
                    <a 
                        href={purok.google_maps_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                            <Navigation className="h-4 w-4 mr-2" />
                            Open & Get Directions
                        </Button>
                    </a>
                )}
            </div>

            {/* Coordinates Display */}
            {(purok.latitude || purok.longitude) && (
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Latitude</p>
                            <div className="flex items-center justify-between mt-1">
                                <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300 flex-1">
                                    {purok.latitude?.toFixed(6) || 'N/A'}
                                </code>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={copyCoordinates}
                                    className="h-6 w-6 p-0 ml-1"
                                >
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Longitude</p>
                            <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block mt-1 dark:text-gray-300">
                                {purok.longitude?.toFixed(6) || 'N/A'}
                            </code>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};