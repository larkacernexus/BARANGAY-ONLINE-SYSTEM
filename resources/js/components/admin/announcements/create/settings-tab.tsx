// components/admin/announcements/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Zap, CalendarClock, HelpCircle, AlertCircle } from 'lucide-react';
import type { AnnouncementType, PriorityLevel } from '@/types/admin/announcements/announcement.types';
import { LucideIcon } from 'lucide-react';

interface SettingsTabProps {
    formData: {
        type: AnnouncementType;
        priority: PriorityLevel;
        start_date: string;
        end_date: string;
        start_time: string;
        end_time: string;
        is_active: boolean;
        [key: string]: any;
    };
    errors: Record<string, string>;
    typeOptions: Array<{ value: AnnouncementType; label: string }>;
    priorityOptions: Array<{ value: PriorityLevel; label: string }>;
    showStartTime: boolean;
    showEndTime: boolean;
    getTypeIcon: (type: AnnouncementType) => LucideIcon;
    getPriorityColor: (priority: PriorityLevel) => string;
    onSelectChange: (name: string, value: string | number) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSwitchChange: (name: string, checked: boolean) => void;
    onAutoFillDates: () => void;
    onToggleTime: () => void;
    onShowStartTimeChange: (show: boolean) => void;
    onShowEndTimeChange: (show: boolean) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalType?: AnnouncementType;
    originalPriority?: PriorityLevel;
    originalStartDate?: string;
    originalEndDate?: string;
}

export function SettingsTab({
    formData,
    errors,
    typeOptions,
    priorityOptions,
    showStartTime,
    showEndTime,
    getTypeIcon,
    getPriorityColor,
    onSelectChange,
    onInputChange,
    onSwitchChange,
    onAutoFillDates,
    onToggleTime,
    onShowStartTimeChange,
    onShowEndTimeChange,
    isSubmitting,
    originalType,
    originalPriority,
    originalStartDate,
    originalEndDate
}: SettingsTabProps) {
    // Check if values have been modified from original
    const isTypeModified = originalType !== undefined && formData.type !== originalType;
    const isPriorityModified = originalPriority !== undefined && formData.priority !== originalPriority;
    const isStartDateModified = originalStartDate !== undefined && formData.start_date !== originalStartDate;
    const isEndDateModified = originalEndDate !== undefined && formData.end_date !== originalEndDate;

    // Check if dates are valid
    const isStartDateValid = !formData.start_date || !isNaN(new Date(formData.start_date).getTime());
    const isEndDateValid = !formData.end_date || !isNaN(new Date(formData.end_date).getTime());
    const isDateRangeValid = !formData.start_date || !formData.end_date || 
        new Date(formData.start_date) <= new Date(formData.end_date);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="type" className="dark:text-gray-300">
                            Type <span className="text-red-500">*</span>
                        </Label>
                        {isTypeModified && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Modified
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => onSelectChange('type', value as AnnouncementType)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {typeOptions.map((type) => {
                                const IconComponent = getTypeIcon(type.value);
                                return (
                                    <SelectItem key={type.value} value={type.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="h-4 w-4" />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {originalType && isTypeModified && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Original: {typeOptions.find(t => t.value === originalType)?.label || originalType}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="priority" className="dark:text-gray-300">
                            Priority Level <span className="text-red-500">*</span>
                        </Label>
                        {isPriorityModified && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Modified
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={formData.priority.toString()}
                        onValueChange={(value) => onSelectChange('priority', parseInt(value) as PriorityLevel)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {priorityOptions.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(priority.value)}`}>
                                            {priority.label}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {originalPriority !== undefined && isPriorityModified && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Original: {priorityOptions.find(p => p.value === originalPriority)?.label || originalPriority}
                        </p>
                    )}
                </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="space-y-4">
                <Label className="dark:text-gray-300">Schedule</Label>
                
                {/* Date Range Warning */}
                {(!isStartDateValid || !isEndDateValid || !isDateRangeValid) && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="text-sm text-red-700 dark:text-red-300">
                                {!isStartDateValid && <p>Start date is invalid</p>}
                                {!isEndDateValid && <p>End date is invalid</p>}
                                {!isDateRangeValid && <p>End date must be after start date</p>}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Start Date & Time */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium dark:text-gray-300">Start Date & Time</Label>
                            {isStartDateModified && (
                                <Badge variant="outline" className="ml-2 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-start-time"
                                checked={showStartTime}
                                onCheckedChange={onShowStartTimeChange}
                                className="dark:data-[state=checked]:bg-purple-600"
                            />
                            <Label htmlFor="show-start-time" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                                Add specific time
                            </Label>
                        </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Input 
                                name="start_date"
                                type="date" 
                                value={formData.start_date || ''}
                                onChange={onInputChange}
                                className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${
                                    (!isStartDateValid && formData.start_date) ? 'border-red-500 focus:ring-red-500' : ''
                                }`}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Leave empty to start immediately
                            </p>
                            {originalStartDate && isStartDateModified && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Original: {new Date(originalStartDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        
                        {showStartTime && (
                            <div className="space-y-2">
                                <Input 
                                    name="start_time"
                                    type="time" 
                                    value={formData.start_time || ''}
                                    onChange={onInputChange}
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium dark:text-gray-300">End Date & Time</Label>
                            {isEndDateModified && (
                                <Badge variant="outline" className="ml-2 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-end-time"
                                checked={showEndTime}
                                onCheckedChange={onShowEndTimeChange}
                                className="dark:data-[state=checked]:bg-purple-600"
                            />
                            <Label htmlFor="show-end-time" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                                Add specific time
                            </Label>
                        </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Input 
                                name="end_date"
                                type="date" 
                                value={formData.end_date || ''}
                                onChange={onInputChange}
                                min={formData.start_date || undefined}
                                className={`dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 ${
                                    (!isEndDateValid && formData.end_date) ? 'border-red-500 focus:ring-red-500' : ''
                                }`}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Leave empty for indefinite display
                            </p>
                            {originalEndDate && isEndDateModified && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Original: {new Date(originalEndDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        
                        {showEndTime && (
                            <div className="space-y-2">
                                <Input 
                                    name="end_time"
                                    type="time" 
                                    value={formData.end_time || ''}
                                    onChange={onInputChange}
                                    disabled={!formData.end_date || isSubmitting}
                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={onAutoFillDates}
                        disabled={isSubmitting}
                        className="flex-1 dark:border-gray-600 dark:text-gray-300"
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-fill Dates
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={onToggleTime}
                        disabled={isSubmitting}
                        className="flex-1 dark:border-gray-600 dark:text-gray-300"
                    >
                        <CalendarClock className="h-3 w-3 mr-1" />
                        Toggle Time
                    </Button>
                </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="space-y-0.5">
                    <Label className="dark:text-gray-300">Active Status</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Announcement will be visible to residents when active
                    </p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                    disabled={isSubmitting}
                    className="dark:data-[state=checked]:bg-green-600"
                />
            </div>

            {/* Date Schedule Info Card */}
            {(formData.start_date || formData.end_date) && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                        <CalendarClock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="text-sm text-green-700 dark:text-green-300">
                            <span className="font-medium">Schedule Summary:</span>{' '}
                            {formData.start_date && (
                                <span>
                                    Starts {new Date(formData.start_date).toLocaleDateString()}
                                    {showStartTime && formData.start_time && ` at ${formData.start_time}`}
                                </span>
                            )}
                            {formData.start_date && formData.end_date && ' and '}
                            {formData.end_date && (
                                <span>
                                    ends {new Date(formData.end_date).toLocaleDateString()}
                                    {showEndTime && formData.end_time && ` at ${formData.end_time}`}
                                </span>
                            )}
                            {!formData.start_date && !formData.end_date && 'No schedule set (always active)'}
                        </div>
                    </div>
                </div>
            )}

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">⚙️ Settings Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>Type:</strong> Categorize your announcement for better organization</li>
                            <li><strong>Priority:</strong> Higher priority announcements appear first</li>
                            <li><strong>Schedule:</strong> Set future dates for planned announcements</li>
                            <li><strong>Active Status:</strong> Only active announcements are visible to residents</li>
                            <li><strong>Time fields:</strong> Enable to set specific times for start/end</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}