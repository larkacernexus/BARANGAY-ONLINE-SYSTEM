// pages/admin/puroks/components/location-tab.tsx
import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, ExternalLink, Compass } from 'lucide-react';

interface LocationTabProps {
    formData: any;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isSubmitting: boolean;
    currentCoordinates?: {
        latitude: number | null;
        longitude: number | null;
    };
}

export function LocationTab({ 
    formData, 
    errors, 
    onInputChange, 
    isSubmitting,
    currentCoordinates 
}: LocationTabProps) {
    // Check if Google Maps URL is valid
    const isValidGoogleMapsUrl = useMemo(() => {
        if (!formData.google_maps_url) return false;
        const url = formData.google_maps_url.toLowerCase();
        return url.includes('maps.google.com') || 
               url.includes('maps.app.goo.gl') ||
               url.includes('google.com/maps');
    }, [formData.google_maps_url]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="google_maps_url" className="dark:text-gray-300">Google Maps Link</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="google_maps_url"
                            name="google_maps_url"
                            value={formData.google_maps_url}
                            onChange={onInputChange}
                            placeholder="https://maps.app.goo.gl/..."
                            className={`pl-10 ${errors.google_maps_url ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {formData.google_maps_url && isValidGoogleMapsUrl && (
                        <a href={formData.google_maps_url} target="_blank" rel="noopener noreferrer">
                            <Button type="button" variant="outline" size="icon" className="dark:border-gray-600 dark:text-gray-300">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    )}
                </div>
                {errors.google_maps_url && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.google_maps_url}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Paste any Google Maps link (short or long). Coordinates will be extracted automatically when you save.
                </p>
            </div>

            {/* Hidden fields for coordinates */}
            <input type="hidden" name="latitude" value={formData.latitude} />
            <input type="hidden" name="longitude" value={formData.longitude} />

            {/* Show current coordinates if they exist */}
            {currentCoordinates && (currentCoordinates.latitude || currentCoordinates.longitude) && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">📍 Current Coordinates:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-green-600 dark:text-green-400">Latitude:</span>
                            <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                {currentCoordinates.latitude?.toFixed(6) || 'N/A'}
                            </code>
                        </div>
                        <div>
                            <span className="text-green-600 dark:text-green-400">Longitude:</span>
                            <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                {currentCoordinates.longitude?.toFixed(6) || 'N/A'}
                            </code>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">How it works:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                            <li>Go to Google Maps and search for the purok location</li>
                            <li>Click the "Share" button and copy the link</li>
                            <li>Paste the link in the field above</li>
                            <li>Click Save - coordinates will be extracted automatically</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}