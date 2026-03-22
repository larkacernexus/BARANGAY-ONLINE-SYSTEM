import { Household } from '../types';
import { HouseholdInfo } from '../household/HouseholdInfo';
import { HousingInfo } from '../household/HousingInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink, FileText, Loader2, ZoomIn, ZoomOut, Satellite, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface OverviewTabProps {
    household: Household;
}

export const OverviewTab = ({ household }: OverviewTabProps) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(19); // Zoom 19 = house level, shows roof details
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite'); // Default to satellite imagery
    
    // Log the coordinates to debug
    useEffect(() => {
        console.log('Household coordinates:', {
            latitude: household.latitude,
            longitude: household.longitude,
            google_maps_url: household.google_maps_url,
            address: household.address
        });
        setMapLoading(false);
    }, [household]);
    
    const getEmbedUrl = (zoom: number = zoomLevel, type: string = mapType) => {
        if (!apiKey) return null;
        
        // PRIORITY 1: Use coordinates from table (most accurate with pin)
        if (household.latitude && household.longitude) {
            console.log('Using coordinates from table:', household.latitude, household.longitude, 'zoom:', zoom, 'type:', type);
            return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${household.latitude},${household.longitude}&zoom=${zoom}&maptype=${type}`;
        }
        
        // PRIORITY 2: Use Google Maps URL
        if (household.google_maps_url) {
            console.log('Using Google Maps URL:', household.google_maps_url);
            return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(household.google_maps_url)}&zoom=${zoom}&maptype=${type}`;
        }
        
        // PRIORITY 3: Use address (fallback)
        if (household.address) {
            console.log('Using address:', household.address);
            return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(household.address)}&zoom=${zoom}&maptype=${type}`;
        }
        
        return null;
    };
    
    const embedUrl = getEmbedUrl();
    const hasLocation = household.latitude || household.longitude || household.google_maps_url || household.address;

    // Handle iframe load error
    const handleIframeError = () => {
        console.error('Map failed to load');
        setMapError(true);
    };

    const handleIframeLoad = () => {
        setMapLoading(false);
    };
    
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 1, 21)); // Max zoom 21 (very detailed)
        setMapLoading(true);
    };
    
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 1, 15)); // Min zoom 15 for household (shows street/neighborhood)
        setMapLoading(true);
    };
    
    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
        setMapLoading(true);
    };

    return (
        <>
            <HouseholdInfo household={household} />
            
            {/* Google Maps Section */}
            {hasLocation && embedUrl && (
                <Card className="dark:bg-gray-900 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <MapPin className="h-5 w-5" />
                                Location Map
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 dark:border-gray-600 dark:text-gray-300"
                                    onClick={toggleMapType}
                                    disabled={mapLoading}
                                    title={mapType === 'satellite' ? 'Switch to Road Map' : 'Switch to Satellite'}
                                >
                                    {mapType === 'satellite' ? (
                                        <Map className="h-4 w-4" />
                                    ) : (
                                        <Satellite className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 dark:border-gray-600 dark:text-gray-300"
                                    onClick={handleZoomOut}
                                    disabled={mapLoading}
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 dark:border-gray-600 dark:text-gray-300"
                                    onClick={handleZoomIn}
                                    disabled={mapLoading}
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {mapLoading && !mapError && (
                            <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        )}
                        {mapError ? (
                            <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
                                <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Map could not be loaded</p>
                                <a 
                                    href={household.latitude && household.longitude 
                                        ? `https://www.google.com/maps/search/${household.latitude},${household.longitude}`
                                        : household.google_maps_url 
                                            ? household.google_maps_url
                                            : `https://www.google.com/maps/search/${encodeURIComponent(household.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2"
                                >
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Open in Google Maps
                                    </Button>
                                </a>
                            </div>
                        ) : (
                            <iframe
                                key={`${zoomLevel}-${mapType}`} // Force re-render when zoom or map type changes
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={embedUrl}
                                title="Household Location"
                                className="w-full"
                                onError={handleIframeError}
                                onLoad={handleIframeLoad}
                            />
                        )}
                        <div className="p-4 border-t dark:border-gray-700">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium dark:text-gray-200">Location</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {household.full_address || household.address}
                                    </p>
                                </div>
                                <a 
                                    href={household.latitude && household.longitude 
                                        ? `https://www.google.com/maps/search/${household.latitude},${household.longitude}`
                                        : household.google_maps_url 
                                            ? household.google_maps_url
                                            : `https://www.google.com/maps/search/${encodeURIComponent(household.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Open
                                    </Button>
                                </a>
                            </div>
                            
                            {/* Map Controls Info */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Zoom:</span>
                                    <span>{zoomLevel}</span>
                                </div>
                                <span className="text-gray-400">|</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">View:</span>
                                    <span className="capitalize">{mapType}</span>
                                    {mapType === 'satellite' && <span className="text-blue-500">🛰️</span>}
                                </div>
                                <span className="text-gray-400">|</span>
                                <span>
                                    {zoomLevel >= 19 ? '🏠 House level (roof visible)' : 
                                     zoomLevel >= 17 ? '🏘️ Street level' : 
                                     zoomLevel >= 15 ? '🏘️ Neighborhood view' : 
                                     '🗺️ Area view'}
                                </span>
                            </div>
                            
                            {/* SHOW COORDINATES FROM TABLE */}
                            {household.latitude && household.longitude ? (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        <span className="text-xs font-medium text-green-700 dark:text-green-300">Exact Location from Coordinates</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                        <div>
                                            <span className="text-green-600 dark:text-green-400">Latitude:</span>
                                            <code className="ml-1 text-green-800 dark:text-green-300 font-mono">
                                                {household.latitude.toFixed(6)}
                                            </code>
                                        </div>
                                        <div>
                                            <span className="text-green-600 dark:text-green-400">Longitude:</span>
                                            <code className="ml-1 text-green-800 dark:text-green-300 font-mono">
                                                {household.longitude.toFixed(6)}
                                            </code>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        💡 Tip: Zoom in to see the actual house roof from satellite view
                                    </p>
                                </div>
                            ) : household.google_maps_url ? (
                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                    📍 Location from Google Maps link
                                </div>
                            ) : household.address ? (
                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                    📍 Location from address (approximate)
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <HousingInfo household={household} />
            
            {household.remarks && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Remarks & Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap dark:text-gray-300">{household.remarks}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};