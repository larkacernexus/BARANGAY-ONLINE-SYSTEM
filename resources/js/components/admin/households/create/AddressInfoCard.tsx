import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, AlertCircle, Home, Globe } from 'lucide-react';

interface Purok {
    id: number;
    name: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    puroks: Purok[];
}

export default function AddressInfoCard({ data, setData, errors, puroks }: Props) {
    const handlePurokChange = (value: string) => {
        const purokId = parseInt(value);
        const selectedPurok = puroks.find(p => p.id === purokId);
        setData('purok_id', purokId);
        if (selectedPurok) {
            setData('purok_name', selectedPurok.name);
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-white" />
                    </div>
                    Address Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="completeAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Complete Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                        id="completeAddress" 
                        placeholder="House No., Street, Barangay Kibawe" 
                        required 
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="purok" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Purok <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={data.purok_id?.toString() || ''}
                            onValueChange={handlePurokChange}
                        >
                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                <SelectValue placeholder="Select purok" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                {puroks.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                        No puroks available
                                    </div>
                                ) : (
                                    puroks.map((purok) => (
                                        <SelectItem key={purok.id} value={purok.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                            {purok.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.purok_id && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.purok_id}</p>
                        )}
                        {puroks.length === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Please create puroks first in the system settings.
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nearestLandmark" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nearest Landmark
                        </Label>
                        <Input 
                            id="nearestLandmark" 
                            placeholder="e.g., Near barangay hall, beside school"
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        />
                    </div>
                </div>

                {/* GOOGLE MAPS URL FIELD - ADD THIS SECTION */}
                <div className="space-y-2 pt-2">
                    <Label htmlFor="google_maps_url" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Google Maps Link
                    </Label>
                    <Input 
                        id="google_maps_url" 
                        placeholder="https://maps.app.goo.gl/..." 
                        value={data.google_maps_url || ''}
                        onChange={(e) => setData('google_maps_url', e.target.value)}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paste any Google Maps share link. Coordinates will be extracted automatically when you save.
                    </p>
                </div>

                {/* Coordinates Display - Shows after extraction */}
                {(data.latitude || data.longitude) && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">📍 Extracted Coordinates</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-green-600 dark:text-green-400">Latitude:</span>
                                <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                    {data.latitude?.toFixed(6)}
                                </code>
                            </div>
                            <div>
                                <span className="text-green-600 dark:text-green-400">Longitude:</span>
                                <code className="ml-2 text-green-800 dark:text-green-300 font-mono">
                                    {data.longitude?.toFixed(6)}
                                </code>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Preview */}
                {data.purok_name && data.address && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <Home className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Location Preview</p>
                                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                    {data.address}, Purok {data.purok_name}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}