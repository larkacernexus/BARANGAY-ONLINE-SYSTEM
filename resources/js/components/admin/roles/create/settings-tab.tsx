// components/admin/roles/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, HelpCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SettingsTabProps {
    formData: any;
    errors: Record<string, string>;
    onSwitchChange: (checked: boolean) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
    isSystemRole?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    onSwitchChange,
    isSubmitting,
    isEdit = false,
    isSystemRole = false
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* System Role Switch */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300 font-medium">System Role</Label>
                            {formData.is_system_role && (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Protected
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEdit 
                                ? "System roles cannot be modified or deleted"
                                : "System roles cannot be deleted and have special privileges"
                            }
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_system_role}
                        onCheckedChange={onSwitchChange}
                        disabled={isSubmitting || (isEdit && isSystemRole)}
                        className="dark:data-[state=checked]:bg-indigo-600"
                    />
                </div>
            </div>

            {/* System Role Warning */}
            {formData.is_system_role && !isSystemRole && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">⚠️ System Role Warning</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                System roles are protected and cannot be deleted once created. 
                                Only create system roles for core administrative functions.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Information Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">About System Roles</h4>
                        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <p><strong className="dark:text-blue-200">System Role Features:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Cannot be deleted from the system</li>
                                <li>Name and description are locked after creation</li>
                                <li>Users with system roles have elevated privileges</li>
                                <li>Use sparingly for core administrative functions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Guidelines */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-sm dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role Guidelines
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="dark:text-gray-300">Principle of Least Privilege:</strong> Only assign permissions needed for the role's purpose.</p>
                    <p><strong className="dark:text-gray-300">System Roles:</strong> Reserved for administrative functions, cannot be deleted.</p>
                    <p><strong className="dark:text-gray-300">Custom Roles:</strong> Regular roles that can be modified or deleted as needed.</p>
                </div>
            </div>
        </div>
    );
}