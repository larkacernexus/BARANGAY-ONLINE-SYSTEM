import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Globe,
    ExternalLink,
    Navigation,
    Copy,
    Check,
    Edit,
    Loader2,
    AlertCircle,
    MapPin,
    RefreshCw,
    Satellite,
    Map,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Purok } from '../types';
import { truncateUrl } from '../utils/helpers';

interface Props {
    purok: Purok;
}

export const GoogleMapsSection = ({ purok }: Props) => {
    const [copied, setCopied] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const [mapUrl, setMapUrl] = useState<string>('');
    const [isResolving, setIsResolving] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(17); // Zoom 17 = street level, good for purok view
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite'); // Default to satellite
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
        purok.latitude && purok.longitude ? { lat: purok.latitude, lng: purok.longitude } : null
    );

    const copyCoordinates = () => {
        if (coordinates) {
            navigator.clipboard.writeText(`${coordinates.lat}, ${coordinates.lng}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Function to resolve Google Maps short URL
    const resolveGoogleMapsUrl = async () => {
        if (!purok.google_maps_url) return;
        
        setIsResolving(true);
        
        try {
            const response = await fetch('/admin/resolve-google-maps-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ url: purok.google_maps_url })
            });
            
            const data = await response.json();
            
            if (data.success && data.coordinates) {
                setCoordinates(data.coordinates);
                await saveCoordinatesToDatabase(data.coordinates.lat, data.coordinates.lng);
            }
        } catch (error) {
            console.error('Error resolving Google Maps URL:', error);
        } finally {
            setIsResolving(false);
        }
    };

    // Save coordinates to database
    const saveCoordinatesToDatabase = async (lat: number, lng: number) => {
        try {
            await fetch(`/admin/puroks/${purok.id}/update-coordinates`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ latitude: lat, longitude: lng })
            });
        } catch (error) {
            console.error('Error saving coordinates:', error);
        }
    };

    // Function to extract location from various Google Maps URL formats
    const extractLocationFromUrl = (url: string): string => {
        if (!url) return '';

        if (coordinates) {
            return `${coordinates.lat},${coordinates.lng}`;
        }
        
        if (url.includes('maps.app.goo.gl')) {
            return url;
        }
        
        const placeMatch = url.match(/place\/([^/]+)/);
        if (placeMatch) {
            return `place_id:${placeMatch[1]}`;
        }
        
        const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
            return `${coordMatch[1]},${coordMatch[2]}`;
        }
        
        const queryMatch = url.match(/[?&]q=([^&]+)/);
        if (queryMatch) {
            return decodeURIComponent(queryMatch[1]);
        }
        
        return url;
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 1, 21));
        setMapLoading(true);
    };
    
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 1, 13)); // Min zoom 13 for purok (shows larger area)
        setMapLoading(true);
    };
    
    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
        setMapLoading(true);
    };

    // Setup the embedded map
    useEffect(() => {
        const setupMap = () => {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            
            if (!apiKey) {
                console.warn('Google Maps API key not found');
                setMapError(true);
                setMapLoading(false);
                return;
            }

            let location = '';
            
            if (coordinates) {
                location = `${coordinates.lat},${coordinates.lng}`;
            } 
            else if (purok.google_maps_url) {
                location = extractLocationFromUrl(purok.google_maps_url);
            }
            
            if (!location) {
                setMapError(true);
                setMapLoading(false);
                return;
            }
            
            const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}&zoom=${zoomLevel}&maptype=${mapType}`;
            setMapUrl(embedUrl);
            setMapLoading(false);
        };
        
        setupMap();
    }, [purok, coordinates, zoomLevel, mapType]);

    const hasLocationData = purok.google_maps_url || coordinates;

    useEffect(() => {
        if (purok.google_maps_url && purok.google_maps_url.includes('maps.app.goo.gl') && !coordinates) {
            resolveGoogleMapsUrl();
        }
    }, []);

    if (!hasLocationData) {
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
            {/* Embedded Map */}
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                {mapLoading && !mapError && (
                    <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                )}
                {mapError ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-4 bg-gray-100 dark:bg-gray-800">
                        <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Map could not be loaded</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Make sure your Google Maps API key is configured
                        </p>
                        <a 
                            href={purok.google_maps_url || `https://www.google.com/maps/search/${coordinates?.lat},${coordinates?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3"
                        >
                            <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open in Google Maps
                            </Button>
                        </a>
                    </div>
                ) : (
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
                            height="400"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={mapUrl}
                            title={`Map showing ${purok.name}`}
                            className="w-full"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Pinned location
                        </div>
                    </>
                )}
            </div>

            {/* Map Controls Info */}
            {!mapError && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
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
            )}

            {/* Resolver Status for Short URLs */}
            {purok.google_maps_url?.includes('maps.app.goo.gl') && !coordinates && isResolving && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Resolving Google Maps location...
                    </p>
                </div>
            )}

            {/* URL Display */}
            {purok.google_maps_url && (
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
                        {purok.google_maps_url.includes('maps.app.goo.gl') && !coordinates && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={resolveGoogleMapsUrl}
                                disabled={isResolving}
                            >
                                <RefreshCw className={`h-4 w-4 ${isResolving ? 'animate-spin' : ''}`} />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <a 
                    href={purok.google_maps_url || `https://www.google.com/maps/search/${coordinates?.lat},${coordinates?.lng}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                    </Button>
                </a>
                
                {coordinates ? (
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                        </Button>
                    </a>
                ) : purok.google_maps_url && (
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(purok.google_maps_url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                        </Button>
                    </a>
                )}
            </div>

            {/* Coordinates Display */}
            {coordinates && (
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Pinned Location Coordinates
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                            <div className="flex items-center justify-between mt-1">
                                <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300 flex-1">
                                    {coordinates.lat.toFixed(6)}
                                </code>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                            <div className="flex items-center justify-between mt-1">
                                <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-300 flex-1">
                                    {coordinates.lng.toFixed(6)}
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
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        💡 Tip: Use the zoom controls to explore the area. Satellite view shows actual terrain.
                    </p>
                </div>
            )}

            {/* Info text */}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                📍 Map is embedded in your system • Click "Open in Google Maps" to view externally
            </p>
        </div>
    );
};