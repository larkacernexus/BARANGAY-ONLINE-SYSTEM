// pages/admin/committees/components/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsTabProps {
    formData: {
        is_active: boolean;
        [key: string]: any;
    };
    onSwitchChange: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
    originalValues?: {  // Add this as optional
        is_active: boolean;
    };
}

export function SettingsTab({ 
    formData, 
    onSwitchChange, 
    isSubmitting,
    originalValues 
}: SettingsTabProps) {
    const hasChanged = originalValues && formData.is_active !== originalValues.is_active;

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Active Status</Label>
                            {hasChanged && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                                    Modified
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Make this committee available for assignment
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}