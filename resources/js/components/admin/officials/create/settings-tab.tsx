// components/admin/officials/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCircle, Shield, Users, Calendar, Star } from 'lucide-react';

interface SettingsTabProps {
    formData: any;
    errors: Record<string, string>;
    onIsRegularChange: (checked: boolean) => void;
    isSubmitting: boolean;
}

export function SettingsTab({
    formData,
    errors,
    onIsRegularChange,
    isSubmitting
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="space-y-0.5">
                    <Label className="dark:text-gray-300 flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Regular Official
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mark as an elected/appointed regular official
                    </p>
                </div>
                <Switch
                    checked={formData.is_regular}
                    onCheckedChange={onIsRegularChange}
                    disabled={isSubmitting}
                    className="dark:data-[state=checked]:bg-green-600"
                />
            </div>

            {/* Help Cards */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Official Guidelines</h3>
                
                <div className="grid gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Position Assignment</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Select the appropriate position with correct committee if needed. Key positions (Captain, Secretary, Treasurer) require system accounts.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">Term Management</p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    Set accurate term start and end dates. Mark officials as former after term ends. Regular officials are typically elected.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-3">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Resident Requirements</p>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                    Must be a registered resident of the barangay, at least 18 years old, with no pending legal cases.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Need Help?</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                For assistance with creating officials or managing positions, contact the system administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}