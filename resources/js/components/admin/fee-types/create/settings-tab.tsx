// components/admin/fee-types/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { HelpCircle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { FeeFormData } from '@/types/admin/fee-types/fee.types';

interface SettingsTabProps {
    formData: FeeFormData;
    errors: Record<string, string>;
    onNumberChange: (name: keyof FeeFormData, value: number | null) => void;
    onSwitchChange: (name: keyof FeeFormData, checked: boolean) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isSubmitting: boolean;
}

export function SettingsTab({
    formData,
    errors,
    onNumberChange,
    onSwitchChange,
    onInputChange,
    isSubmitting
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Fee Type Settings</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure behavior and display settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Sort Order */}
                    <div className="space-y-2">
                        <Label htmlFor="sort_order" className="dark:text-gray-300">Sort Order</Label>
                        <Input
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            min="0"
                            value={formData.sort_order}
                            onChange={(e) => onNumberChange('sort_order', parseInt(e.target.value) || 0)}
                            className={`${errors.sort_order ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                        {errors.sort_order && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Lower numbers appear first in lists
                        </p>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Toggle Switches */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="dark:text-gray-300">Active Status</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enable this fee type for use
                                </p>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                                disabled={isSubmitting}
                                className="dark:data-[state=checked]:bg-green-600"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="dark:text-gray-300">Mandatory</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Required for all applicable residents
                                </p>
                            </div>
                            <Switch
                                checked={formData.is_mandatory}
                                onCheckedChange={(checked) => onSwitchChange('is_mandatory', checked)}
                                disabled={isSubmitting}
                                className="dark:data-[state=checked]:bg-green-600"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="dark:text-gray-300">Auto-generate Bills</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Automatically create bills on schedule
                                </p>
                            </div>
                            <Switch
                                checked={formData.auto_generate}
                                onCheckedChange={(checked) => onSwitchChange('auto_generate', checked)}
                                disabled={isSubmitting}
                                className="dark:data-[state=checked]:bg-green-600"
                            />
                        </div>
                    </div>

                    {formData.auto_generate && (
                        <div className="space-y-2">
                            <Label htmlFor="due_day" className="dark:text-gray-300">Due Day of Month</Label>
                            <Input
                                id="due_day"
                                name="due_day"
                                type="number"
                                min="1"
                                max="31"
                                placeholder="e.g., 15 for 15th of each month"
                                value={formData.due_day ?? ''}
                                onChange={(e) => onNumberChange('due_day', e.target.value ? parseInt(e.target.value) : null)}
                                className={`${errors.due_day ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                disabled={isSubmitting}
                            />
                            {errors.due_day && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.due_day}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Day of the month when bills are due (1-31)
                            </p>
                        </div>
                    )}

                    <Separator className="dark:bg-gray-700" />

                    {/* Additional Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="dark:text-gray-300">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={formData.notes ?? ''}
                            onChange={onInputChange}
                            placeholder="Any additional notes or instructions..."
                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Internal notes about this fee type (not visible to residents)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <HelpCircle className="h-4 w-4" />
                        Need help?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm dark:text-gray-400">
                        <div>
                            <p className="font-medium dark:text-gray-300">Settings Guide:</p>
                        </div>
                        <div className="space-y-2 pl-4">
                            <p><strong className="dark:text-gray-300">Sort Order:</strong> Controls the display order in lists. Lower numbers appear first.</p>
                            <p><strong className="dark:text-gray-300">Active Status:</strong> Inactive fee types won't be available for selection.</p>
                            <p><strong className="dark:text-gray-300">Mandatory:</strong> Mandatory fees are automatically included for eligible residents.</p>
                            <p><strong className="dark:text-gray-300">Auto-generate Bills:</strong> Automatically creates bills on the schedule (for recurring fees).</p>
                            <p><strong className="dark:text-gray-300">Due Day:</strong> For recurring fees, the day of the month when payment is due.</p>
                            <p><strong className="dark:text-gray-300">Additional Notes:</strong> Internal notes for administrative reference.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}