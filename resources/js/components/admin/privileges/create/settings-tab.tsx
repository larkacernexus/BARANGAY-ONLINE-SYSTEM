// components/admin/privileges/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Clock, HelpCircle, Shield, IdCard } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SettingsTabProps {
    formData: any;
    errors: Record<string, string>;
    originalRequiresIdNumber?: boolean;
    originalRequiresVerification?: boolean;
    originalValidityYears?: string;
    onSwitchChange: (name: string, checked: boolean) => void;
    onNumberChange: (name: string, value: string) => void;
    isSubmitting: boolean;
    isEdit?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    originalRequiresIdNumber,
    originalRequiresVerification,
    originalValidityYears,
    onSwitchChange,
    onNumberChange,
    isSubmitting,
    isEdit = false
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            {/* Requirements & Verification */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium dark:text-gray-300">Requirements & Verification</h3>
                
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="dark:text-gray-300 flex items-center gap-2">
                            <IdCard className="h-4 w-4" />
                            Require ID Number
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Resident must provide an ID number
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_id_number}
                        onCheckedChange={(checked) => onSwitchChange('requires_id_number', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-blue-600"
                    />
                </div>
                {isEdit && originalRequiresIdNumber !== undefined && formData.requires_id_number !== originalRequiresIdNumber && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 -mt-2 ml-4">
                        Was: {originalRequiresIdNumber ? 'Required' : 'Not required'}
                    </p>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="dark:text-gray-300 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Requires Verification
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Privilege needs to be verified before use
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_verification}
                        onCheckedChange={(checked) => onSwitchChange('requires_verification', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-purple-600"
                    />
                </div>
                {isEdit && originalRequiresVerification !== undefined && formData.requires_verification !== originalRequiresVerification && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 -mt-2 ml-4">
                        Was: {originalRequiresVerification ? 'Required' : 'Not required'}
                    </p>
                )}
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Validity & Status */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium dark:text-gray-300">Validity & Status</h3>

                <div className="space-y-2">
                    <Label htmlFor="validity_years" className="dark:text-gray-300 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Validity Period (Years)
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger type="button">
                                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                    <p>Number of years the privilege remains valid. Leave empty for lifetime.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="validity_years"
                            name="validity_years"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.validity_years ?? ''}
                            onChange={(e) => onNumberChange('validity_years', e.target.value)}
                            className={`pl-10 ${errors.validity_years ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                            placeholder="Leave empty for lifetime"
                        />
                    </div>
                    {errors.validity_years && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.validity_years}</p>
                    )}
                    {isEdit && originalValidityYears && formData.validity_years !== originalValidityYears && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Was: {originalValidityYears ? `${originalValidityYears} year(s)` : 'Lifetime'}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Leave empty for no expiration (lifetime validity)
                    </p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="dark:text-gray-300">Active Status</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Make this privilege available for assignment
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

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">⚙️ Settings Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li><strong>ID Number:</strong> Required for government-issued privileges</li>
                            <li><strong>Verification:</strong> Ensures privilege is legitimately claimed</li>
                            <li><strong>Validity:</strong> Set expiry for temporary privileges, leave empty for lifetime</li>
                            <li><strong>Active Status:</strong> Only active privileges can be assigned to residents</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}