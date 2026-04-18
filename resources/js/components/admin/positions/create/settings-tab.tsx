// pages/admin/positions/components/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsTabProps<T extends string = string> {
    formData: {
        is_active: boolean;
        requires_account: boolean;
        [key: string]: any;
    };
    onSwitchChange: (name: T, checked: boolean) => void;
    isSubmitting: boolean;
}

export function SettingsTab<T extends string = string>({ 
    formData, 
    onSwitchChange, 
    isSubmitting 
}: SettingsTabProps<T>) {
    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="dark:text-gray-300">Active Status</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Make this position available for assignment
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => onSwitchChange('is_active' as T, checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                            <Label className="dark:text-gray-300">Requires System Account</Label>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Officials with this position need a user account</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Officials with this position need a user account
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_account}
                        onCheckedChange={(checked) => onSwitchChange('requires_account' as T, checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-blue-600"
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}