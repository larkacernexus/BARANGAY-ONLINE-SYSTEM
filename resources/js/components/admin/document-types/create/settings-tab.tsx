// components/admin/document-types/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ListOrdered, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface SettingsTabProps {
    formData: any;
    errors: Record<string, string>;
    onNumberChange: (name: string, value: number) => void;
    onSwitchChange: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    onNumberChange,
    onSwitchChange,
    isSubmitting,
    isEdit = false
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100 flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                        Display Settings
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure how this document type appears in lists
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Sort Order */}
                    <div className="space-y-2">
                        <Label htmlFor="sort_order" className="dark:text-gray-300">Sort Order</Label>
                        <div className="relative">
                            <ListOrdered className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                min="0"
                                value={formData.sort_order}
                                onChange={(e) => onNumberChange('sort_order', parseInt(e.target.value) || 0)}
                                className={`pl-10 ${errors.sort_order ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.sort_order && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Lower numbers appear first in lists
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Separator className="dark:bg-gray-700" />

            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100 flex items-center gap-2">
                        <Switch className="h-4 w-4" />
                        Status Settings
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Configure document type availability and requirements
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Toggle Switches */}
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="dark:text-gray-300">Required Document</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Mark this document as required for all clearance types
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_required}
                            onCheckedChange={(checked) => onSwitchChange('is_required', checked)}
                            disabled={isSubmitting}
                            className="dark:data-[state=checked]:bg-orange-600"
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="dark:text-gray-300">Active Status</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enable this document type for use
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                            disabled={isSubmitting}
                            className="dark:data-[state=checked]:bg-green-600"
                        />
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
                    <div className="space-y-2 text-sm dark:text-gray-400">
                        <p><strong className="dark:text-gray-300">Sort Order:</strong> Controls the display order in dropdowns and lists.</p>
                        <p><strong className="dark:text-gray-300">Required Document:</strong> When enabled, this document must be uploaded for clearance applications.</p>
                        <p><strong className="dark:text-gray-300">Active Status:</strong> Inactive document types won't appear in selection lists.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}