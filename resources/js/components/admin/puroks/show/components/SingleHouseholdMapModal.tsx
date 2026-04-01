// resources/js/Pages/Admin/Puroks/components/SingleHouseholdMapModal.tsx

import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Home, Satellite, Map, ZoomIn, ZoomOut, ExternalLink, AlertCircle } from 'lucide-react';
import { Household } from '@/types/admin/puroks/purok'; // Import from main types

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    household: Household | null;
    purokName: string;
}

export const SingleHouseholdMapModal = ({ open, onOpenChange, household, purokName }: Props) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(18);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
    const [mapUrl, setMapUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        
        if (!household) {
            setMapError(true);
            setMapLoading(false);
            return;
        }

        // Check if household has coordinates
        const hasLatLng = household.latitude && household.longitude;
        
        if (!hasLatLng) {
            setMapError(true);
            setMapLoading(false);
            return;
        }

        if (!apiKey) {
            console.error('Google Maps API key missing');
            setMapError(true);
            setMapLoading(false);
            return;
        }

        // Parse coordinates if they're strings
        const lat = typeof household.latitude === 'string' ? parseFloat(household.latitude) : household.latitude;
        const lng = typeof household.longitude === 'string' ? parseFloat(household.longitude) : household.longitude;
        
        if (isNaN(lat) || isNaN(lng)) {
            setMapError(true);
            setMapLoading(false);
            return;
        }

        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=${zoomLevel}&maptype=${mapType}`;
        setMapUrl(embedUrl);
        setMapLoading(true);
        setMapError(false);
    }, [open, household, zoomLevel, mapType, apiKey]);

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 1, 21));
        setMapLoading(true);
    };
    
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 1, 15));
        setMapLoading(true);
    };
    
    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
        setMapLoading(true);
    };

    const handleIframeLoad = () => {
        setMapLoading(false);
    };

    const handleIframeError = () => {
        console.error('Iframe failed to load');
        setMapError(true);
        setMapLoading(false);
    };

    // Get head of household name
    const getHeadName = () => {
        if (!household) return 'No household selected';
        
        // Check if head_of_household exists and has full_name
        if (household.head_of_household) {
            const head = household.head_of_household;
            let name = `${head.first_name}`;
            if (head.middle_name) {
                name += ` ${head.middle_name.charAt(0)}.`;
            }
            name += ` ${head.last_name}`;
            return name;
        }
        
        // If head_of_household is not set, try to find head from members
        if (household.members) {
            const head = household.members.find(member => member.is_head);
            if (head) {
                let name = `${head.first_name}`;
                if (head.middle_name) {
                    name += ` ${head.middle_name.charAt(0)}.`;
                }
                name += ` ${head.last_name}`;
                return name;
            }
        }
        
        return 'Not assigned';
    };

    // Get contact number from head of household
    const getContactNumber = () => {
        if (!household) return 'N/A';
        
        if (household.head_of_household?.contact_number) {
            return household.head_of_household.contact_number;
        }
        
        return 'N/A';
    };

    // Get member count
    const getMemberCount = () => {
        if (!household) return 0;
        return household.total_members || household.members?.length || 0;
    };

    // Check if household has valid coordinates
    const hasValidCoordinates = (): boolean => {
        if (!household) return false;
        if (!household.latitude || !household.longitude) return false;
        
        const lat = typeof household.latitude === 'string' ? parseFloat(household.latitude) : household.latitude;
        const lng = typeof household.longitude === 'string' ? parseFloat(household.longitude) : household.longitude;
        
        return !isNaN(lat) && !isNaN(lng);
    };

    if (!household) return null;

    const hasCoordinates = hasValidCoordinates();
    const latNum = hasCoordinates && household.latitude ? 
        (typeof household.latitude === 'string' ? parseFloat(household.latitude) : household.latitude) : null;
    const lngNum = hasCoordinates && household.longitude ? 
        (typeof household.longitude === 'string' ? parseFloat(household.longitude) : household.longitude) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-[90vw] w-full h-auto dark:bg-gray-900 p-6"
                style={{ maxWidth: '1200px', width: '90vw' }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Home className="h-5 w-5" />
                        Household Location: {household.household_number}
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        {getHeadName()} • {purokName}
                    </DialogDescription>
                </DialogHeader>

                {/* Landscape layout - side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Map Section - Left side */}
                    <div className="relative">
                        <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 h-[500px]">
                            {!hasCoordinates ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gray-100 dark:bg-gray-800">
                                    <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No location data for this household</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Please add coordinates to the household profile
                                    </p>
                                    <Link href={`/admin/households/${household.id}/edit`} className="mt-3">
                                        <Button size="sm" variant="outline">
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            Edit Household
                                        </Button>
                                    </Link>
                                </div>
                            ) : mapLoading && !mapError ? (
                                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : mapError ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gray-100 dark:bg-gray-800">
                                    <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">Map could not be loaded</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {!apiKey ? 'Google Maps API key not configured' : 'Invalid coordinates or API error'}
                                    </p>
                                    {latNum && lngNum && (
                                        <a 
                                            href={`https://www.google.com/maps/search/${latNum},${lngNum}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3"
                                        >
                                            <Button size="sm" variant="outline">
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                Open in Google Maps
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            ) : mapUrl ? (
                                <>
                                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 rounded-lg p-1 shadow-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 dark:text-gray-300"
                                            onClick={toggleMapType}
                                            disabled={mapLoading}
                                            title={mapType === 'satellite' ? 'Switch to Road Map' : 'Switch to Satellite'}
                                        >
                                            {mapType === 'satellite' ? (
                                                <Map className="h-3.5 w-3.5" />
                                            ) : (
                                                <Satellite className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 dark:text-gray-300"
                                            onClick={handleZoomOut}
                                            disabled={mapLoading}
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 dark:text-gray-300"
                                            onClick={handleZoomIn}
                                            disabled={mapLoading}
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <iframe
                                        key={`${zoomLevel}-${mapType}`}
                                        width="100%"
                                        height="500"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={mapUrl}
                                        title={`Map showing household ${household.household_number}`}
                                        className="w-full"
                                        onError={handleIframeError}
                                        onLoad={handleIframeLoad}
                                    />
                                    <div className="absolute bottom-3 left-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Home className="h-3 w-3" />
                                        {household.household_number}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Details Section - Right side */}
                    <div className="border dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto h-[500px]">
                        <h3 className="font-semibold text-lg dark:text-gray-200 mb-5 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            Household Details
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Household Number</p>
                                    <p className="font-mono font-bold text-xl dark:text-white mt-1">{household.household_number}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Head of Family</p>
                                    <p className="font-semibold text-base dark:text-gray-200 mt-1">{getHeadName()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Members</p>
                                    <p className="font-medium text-lg dark:text-gray-200 mt-1">{getMemberCount()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</p>
                                    <p className="font-medium dark:text-gray-200 mt-1">{getContactNumber()}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-sm dark:text-gray-300 mt-1 break-words">{household.address || 'No address'}</p>
                                </div>
                                {hasCoordinates && latNum && lngNum && (
                                    <>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Latitude</p>
                                            <code className="text-xs dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block mt-1">
                                                {latNum.toFixed(6)}
                                            </code>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Longitude</p>
                                            <code className="text-xs dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block mt-1">
                                                {lngNum.toFixed(6)}
                                            </code>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Map Controls Info */}
                            {hasCoordinates && !mapError && mapUrl && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Map Controls</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span>Zoom: {zoomLevel}</span>
                                            <span className="text-gray-400">|</span>
                                            <span className="capitalize">{mapType}</span>
                                            {mapType === 'satellite' && <span className="text-blue-500">🛰️</span>}
                                        </div>
                                        <span>
                                            {zoomLevel >= 19 ? '🏠 House level' : 
                                             zoomLevel >= 17 ? '🏘️ Street level' : 
                                             zoomLevel >= 15 ? '🏘️ Neighborhood' : 
                                             '🗺️ Area view'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {hasCoordinates && (
                                <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                    <a 
                                        href={`https://www.google.com/maps/search/${latNum},${lngNum}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Open in Google Maps
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};