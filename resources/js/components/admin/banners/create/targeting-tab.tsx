// components/admin/banners/create/targeting-tab.tsx
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Globe, MapPin } from 'lucide-react';

interface TargetingTabProps {
    formData: {
        target_audience: 'all' | 'specific_puroks';
        target_puroks: number[];
    };
    errors: Record<string, string>;
    puroks: Array<{ id: number; name: string }>;
    onSelectChange: (name: string, value: string) => void;
    onMultiSelectChange: (name: string, values: number[]) => void;
    isSubmitting: boolean;
}

export function TargetingTab({ 
    formData, 
    errors, 
    puroks = [], 
    onSelectChange, 
    onMultiSelectChange,
    isSubmitting 
}: TargetingTabProps) {
    
    const handleAudienceChange = (value: string) => {
        onSelectChange('target_audience', value);
        // Clear selections when switching to 'all'
        if (value === 'all') {
            onMultiSelectChange('target_puroks', []);
        }
    };

    const handlePurokToggle = (purokId: number) => {
        const currentPuroks = formData.target_puroks || [];
        const newPuroks = currentPuroks.includes(purokId)
            ? currentPuroks.filter(id => id !== purokId)
            : [...currentPuroks, purokId];
        onMultiSelectChange('target_puroks', newPuroks);
    };

    const handleSelectAllPuroks = () => {
        const allPurokIds = puroks.map(p => p.id);
        onMultiSelectChange('target_puroks', allPurokIds);
    };

    const handleDeselectAllPuroks = () => {
        onMultiSelectChange('target_puroks', []);
    };

    return (
        <div className="space-y-6">
            {/* Audience Selection */}
            <div className="space-y-4">
                <Label className="dark:text-gray-300 text-base">Target Audience</Label>
                
                <Select
                    value={formData.target_audience}
                    onValueChange={handleAudienceChange}
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="all" className="dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Everyone
                            </div>
                        </SelectItem>
                        <SelectItem value="specific_puroks" className="dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                                Specific Puroks
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Audience Description */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {formData.target_audience === 'all' && (
                        <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Everyone</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Banner will be visible to all users regardless of location
                                </p>
                            </div>
                        </div>
                    )}
                    {formData.target_audience === 'specific_puroks' && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Specific Puroks</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Only residents from selected puroks will see this banner
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Purok Selection */}
            {formData.target_audience === 'specific_puroks' && (
                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <Label className="dark:text-gray-300">
                            Select Puroks ({formData.target_puroks?.length || 0} selected)
                        </Label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAllPuroks}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                disabled={isSubmitting}
                            >
                                Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                type="button"
                                onClick={handleDeselectAllPuroks}
                                className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
                                disabled={isSubmitting}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700">
                        {puroks.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No puroks available
                            </div>
                        ) : (
                            puroks.map((purok) => (
                                <div 
                                    key={purok.id} 
                                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <Checkbox
                                        id={`purok-${purok.id}`}
                                        checked={formData.target_puroks?.includes(purok.id)}
                                        onCheckedChange={() => handlePurokToggle(purok.id)}
                                        disabled={isSubmitting}
                                    />
                                    <Label 
                                        htmlFor={`purok-${purok.id}`}
                                        className="flex-1 cursor-pointer dark:text-gray-300"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            {purok.name}
                                        </div>
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {errors.target_puroks && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.target_puroks}</p>
                    )}
                </div>
            )}
        </div>
    );
}