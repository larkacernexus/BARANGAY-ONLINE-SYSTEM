// components/admin/clearance-types/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Shield, File, Award, HelpCircle, Percent, CheckCircle } from 'lucide-react';
import type { DiscountConfig, ClearanceTypeFormData } from '@/types/admin/clearance-types/clearance-types';

interface SettingsTabProps {
    formData: ClearanceTypeFormData;
    errors: Record<string, string>;
    discountConfigs: DiscountConfig[];
    showDiscounts: boolean;
    onSwitchChange: (name: keyof ClearanceTypeFormData, checked: boolean) => void;
    onDiscountToggle: (index: number, checked: boolean) => void;
    onDiscountPercentageChange: (index: number, percentage: number) => void;
    onToggleDiscounts: () => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    originalIsActive?: boolean;
    originalRequiresPayment?: boolean;
    originalRequiresApproval?: boolean;
    originalIsOnlineOnly?: boolean;
}

export function SettingsTab({
    formData,
    errors,
    discountConfigs,
    showDiscounts,
    onSwitchChange,
    onDiscountToggle,
    onDiscountPercentageChange,
    onToggleDiscounts,
    isSubmitting,
    originalIsActive,
    originalRequiresPayment,
    originalRequiresApproval,
    originalIsOnlineOnly
}: SettingsTabProps) {
    // Check if values have been modified
    const isActiveModified = originalIsActive !== undefined && formData.is_active !== originalIsActive;
    const isPaymentModified = originalRequiresPayment !== undefined && formData.requires_payment !== originalRequiresPayment;
    const isApprovalModified = originalRequiresApproval !== undefined && formData.requires_approval !== originalRequiresApproval;
    const isOnlineOnlyModified = originalIsOnlineOnly !== undefined && formData.is_online_only !== originalIsOnlineOnly;

    const activeDiscountCount = discountConfigs.filter(c => c.is_active).length;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Active Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Active Status</Label>
                            {isActiveModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Make this clearance type available for use
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => onSwitchChange('is_active', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>
                {originalIsActive !== undefined && isActiveModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalIsActive ? 'Active' : 'Inactive'}
                    </p>
                )}

                {/* Requires Payment */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Requires Payment</Label>
                            {isPaymentModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Must payment be collected for this clearance?
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_payment}
                        onCheckedChange={(checked) => onSwitchChange('requires_payment', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>
                {originalRequiresPayment !== undefined && isPaymentModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalRequiresPayment ? 'Requires Payment' : 'No Payment'}
                    </p>
                )}

                {/* Requires Approval */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Requires Approval</Label>
                            {isApprovalModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Needs barangay official approval
                        </p>
                    </div>
                    <Switch
                        checked={formData.requires_approval}
                        onCheckedChange={(checked) => onSwitchChange('requires_approval', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-blue-600"
                    />
                </div>
                {originalRequiresApproval !== undefined && isApprovalModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalRequiresApproval ? 'Requires Approval' : 'No Approval'}
                    </p>
                )}

                {/* Online Only */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300">Online Only</Label>
                            {isOnlineOnlyModified && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    Modified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Available for online application only
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_online_only}
                        onCheckedChange={(checked) => onSwitchChange('is_online_only', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-purple-600"
                    />
                </div>
                {originalIsOnlineOnly !== undefined && isOnlineOnlyModified && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 pl-3">
                        Was: {originalIsOnlineOnly ? 'Online Only' : 'Offline Available'}
                    </p>
                )}
            </div>

            {/* Discount Configuration */}
            {discountConfigs.length > 0 && (
                <>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="dark:text-gray-300">Discount Configuration</Label>
                                {activeDiscountCount > 0 && (
                                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        {activeDiscountCount} active
                                    </Badge>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onToggleDiscounts}
                                className="dark:text-gray-400 dark:hover:text-white"
                                disabled={isSubmitting}
                            >
                                {showDiscounts ? 'Hide' : 'Configure'}
                            </Button>
                        </div>
                        {showDiscounts && (
                            <div className="space-y-3">
                                {discountConfigs.map((config, index) => (
                                    <div
                                        key={config.privilege_id}
                                        className={`flex items-center gap-3 p-3 border rounded-lg ${
                                            config.is_active
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Checkbox
                                            checked={config.is_active}
                                            onCheckedChange={(checked) => onDiscountToggle(index, checked as boolean)}
                                            id={`discount-${config.privilege_code}`}
                                            className="dark:border-gray-600"
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Label
                                                    htmlFor={`discount-${config.privilege_code}`}
                                                    className="font-medium cursor-pointer dark:text-gray-200"
                                                >
                                                    {config.privilege_name}
                                                </Label>
                                                {config.requires_verification && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger type="button">
                                                                <Shield className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Requires verification</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {config.requires_id_number && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger type="button">
                                                                <File className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Requires ID number</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {config.is_active && (
                                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Code: {config.privilege_code}
                                            </p>
                                        </div>
                                        <div className="w-32">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={config.discount_percentage}
                                                    onChange={(e) => onDiscountPercentageChange(
                                                        index,
                                                        parseFloat(e.target.value) || 0
                                                    )}
                                                    className="h-8 text-right pr-7 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    disabled={!config.is_active || isSubmitting}
                                                    placeholder="%"
                                                />
                                                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Discount Summary (when discounts are configured but not shown) */}
            {!showDiscounts && activeDiscountCount > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                            {activeDiscountCount} discount{activeDiscountCount !== 1 ? 's' : ''} active
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onToggleDiscounts}
                            className="ml-auto text-green-600 hover:text-green-700 dark:text-green-400"
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Need help?</h4>
                        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                            <p><strong className="dark:text-blue-200">Active Status:</strong> Inactive clearance types won't appear for applications</p>
                            <p><strong className="dark:text-blue-200">Requires Payment:</strong> Enables payment processing for this clearance</p>
                            <p><strong className="dark:text-blue-200">Requires Approval:</strong> Clearance needs official approval before issuance</p>
                            <p><strong className="dark:text-blue-200">Online Only:</strong> Only available through the online portal</p>
                            <p><strong className="dark:text-blue-200">Discounts:</strong> Only the highest applicable discount is applied (no stacking)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Note */}
            {activeDiscountCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>Note:</strong> Only the highest applicable discount will be applied. Discounts do not stack.
                    </p>
                </div>
            )}
        </div>
    );
}