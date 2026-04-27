// components/admin/banners/create/schedule-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ScheduleTabProps {
    formData: {
        start_date: string;
        end_date: string;
        is_active: boolean;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckboxChange?: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
}

export function ScheduleTab({ 
    formData, 
    errors, 
    onInputChange, 
    onCheckboxChange, 
    isSubmitting 
}: ScheduleTabProps) {
    const [useSchedule, setUseSchedule] = useState(!!formData.start_date || !!formData.end_date);

    const handleScheduleToggle = (checked: boolean) => {
        setUseSchedule(checked);
        if (!checked) {
            // Clear dates when disabling schedule
            onInputChange({ target: { name: 'start_date', value: '' } } as any);
            onInputChange({ target: { name: 'end_date', value: '' } } as any);
        }
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="space-y-1">
                    <Label htmlFor="is_active_schedule" className="dark:text-gray-300 font-medium">
                        Banner Status
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.is_active ? 'Banner is currently active' : 'Banner is currently inactive'}
                    </p>
                </div>
                <Switch
                    id="is_active_schedule"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => onCheckboxChange?.('is_active', checked)}
                    disabled={isSubmitting}
                />
            </div>

            {/* Schedule Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="space-y-1">
                    <Label htmlFor="use_schedule" className="dark:text-gray-300 font-medium">
                        Enable Scheduling
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Set specific dates for this banner to display
                    </p>
                </div>
                <Switch
                    id="use_schedule"
                    checked={useSchedule}
                    onCheckedChange={handleScheduleToggle}
                    disabled={isSubmitting}
                />
            </div>

            {/* Date Range */}
            {useSchedule && (
                <div className="space-y-4 pt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-medium mb-1">Scheduling Information</p>
                                <p className="text-blue-700 dark:text-blue-400">
                                    The banner will only be visible during the specified date range. 
                                    Leave both fields empty to show indefinitely.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label htmlFor="start_date" className="dark:text-gray-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Start Date
                        </Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="datetime-local"
                            value={formData.start_date}
                            onChange={onInputChange}
                            min={today}
                            className={`${errors.start_date ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                        {errors.start_date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            When the banner should start appearing (optional)
                        </p>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label htmlFor="end_date" className="dark:text-gray-300 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            End Date
                        </Label>
                        <Input
                            id="end_date"
                            name="end_date"
                            type="datetime-local"
                            value={formData.end_date}
                            onChange={onInputChange}
                            min={formData.start_date || today}
                            className={`${errors.end_date ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                        {errors.end_date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            When the banner should stop appearing (optional)
                        </p>
                    </div>

                    {/* Date Validation Warning */}
                    {formData.start_date && formData.end_date && formData.start_date >= formData.end_date && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                End date must be after start date
                            </p>
                        </div>
                    )}

                    {/* Status Indicator */}
                    {formData.start_date && formData.end_date && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(formData.start_date) > new Date() ? (
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                        Scheduled to start on {new Date(formData.start_date).toLocaleString()}
                                    </span>
                                ) : new Date(formData.end_date) < new Date() ? (
                                    <span className="text-red-600 dark:text-red-400">
                                        This banner has expired
                                    </span>
                                ) : (
                                    <span className="text-green-600 dark:text-green-400">
                                        Currently active • Ends on {new Date(formData.end_date).toLocaleString()}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Help Text */}
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2 pt-4 border-t dark:border-gray-700">
                <p className="font-medium text-gray-700 dark:text-gray-300">Scheduling Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Banners without schedule dates will show indefinitely until manually deactivated</li>
                    <li>Set only a start date to show from that date onward</li>
                    <li>Set only an end date to show until that date</li>
                    <li>Time is based on server timezone (Asia/Manila)</li>
                </ul>
            </div>
        </div>
    );
}