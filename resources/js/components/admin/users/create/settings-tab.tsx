// components/admin/users/create/settings-tab.tsx
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HelpCircle, Shield, Mail, AlertCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SettingsTabProps {
    formData: any;
    errors: Record<string, string>;
    onSwitchChange: (name: string, checked: boolean) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    user?: any;
    lastLogin?: string;
    emailVerifiedAt?: string;
    createdAt?: string;
    onStatusChange?: (checked: boolean) => void;
}

export function SettingsTab({
    formData,
    errors,
    onSwitchChange,
    isSubmitting,
    user,
    lastLogin,
    emailVerifiedAt,
    createdAt,
    onStatusChange
}: SettingsTabProps) {
    // Use onStatusChange if provided, otherwise use onSwitchChange
    const handleStatusChange = (checked: boolean) => {
        if (onStatusChange) {
            onStatusChange(checked);
        } else {
            onSwitchChange('status', checked);
        }
    };

    return (
        <div className="space-y-6">
            {/* User Info Cards (for edit mode) */}
            {user && (
                <div className="grid gap-4 md:grid-cols-3">
                    {lastLogin && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">Last Login</span>
                            </div>
                            <p className="text-sm font-medium dark:text-gray-200">{lastLogin}</p>
                        </div>
                    )}
                    {emailVerifiedAt && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <Mail className="h-4 w-4" />
                                <span className="text-xs">Email Verified</span>
                            </div>
                            <p className="text-sm font-medium dark:text-gray-200">{emailVerifiedAt}</p>
                        </div>
                    )}
                    {createdAt && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">Account Created</span>
                            </div>
                            <p className="text-sm font-medium dark:text-gray-200">{createdAt}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {/* Account Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300 font-medium">Account Status</Label>
                            <Badge className={formData.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }>
                                {formData.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Activate or deactivate this user account
                        </p>
                    </div>
                    <Switch
                        checked={formData.status === 'active'}
                        onCheckedChange={handleStatusChange}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-green-600"
                    />
                </div>

                {/* Require Password Change */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300 font-medium">Require Password Change</Label>
                            {formData.require_password_change && (
                                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                    Enforced
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Force user to change password on next login
                        </p>
                    </div>
                    <Switch
                        checked={formData.require_password_change}
                        onCheckedChange={(checked) => onSwitchChange('require_password_change', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-amber-600"
                    />
                </div>

                {/* Email Verified */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300 font-medium">Email Verified</Label>
                            {formData.is_email_verified && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mark user's email as verified (bypasses verification)
                        </p>
                    </div>
                    <Switch
                        checked={formData.is_email_verified}
                        onCheckedChange={(checked) => onSwitchChange('is_email_verified', checked)}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-blue-600"
                    />
                </div>

                {/* Send Setup/Reset Email */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Label className="dark:text-gray-300 font-medium">
                                {formData.send_reset_email !== undefined ? 'Send Reset Email' : 'Send Setup Email'}
                            </Label>
                            {(formData.send_setup_email || formData.send_reset_email) && (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                    Will Send
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formData.send_reset_email !== undefined 
                                ? 'Send password reset email to the user' 
                                : 'Send email with login instructions to the user'}
                        </p>
                    </div>
                    <Switch
                        checked={formData.send_setup_email || formData.send_reset_email || false}
                        onCheckedChange={(checked) => {
                            if (formData.send_reset_email !== undefined) {
                                onSwitchChange('send_reset_email', checked);
                            } else {
                                onSwitchChange('send_setup_email', checked);
                            }
                        }}
                        disabled={isSubmitting}
                        className="dark:data-[state=checked]:bg-purple-600"
                    />
                </div>
            </div>

            {/* Settings Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-sm dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Settings Summary
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400">
                            Account is <strong>{formData.status === 'active' ? 'active' : 'inactive'}</strong>
                        </span>
                    </div>
                    {formData.require_password_change && (
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                User must change password on next login
                            </span>
                        </div>
                    )}
                    {formData.is_email_verified && (
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Email marked as verified
                            </span>
                        </div>
                    )}
                    {(formData.send_setup_email || formData.send_reset_email) && formData.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {formData.send_reset_email ? 'Reset email' : 'Setup email'} will be sent to {formData.email}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Need help?</h4>
                        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                            <p><strong className="dark:text-blue-200">Account Status:</strong> Deactivated users cannot log in</p>
                            <p><strong className="dark:text-blue-200">Require Password Change:</strong> Recommended for password resets</p>
                            <p><strong className="dark:text-blue-200">Email Verified:</strong> Only enable if you've confirmed the email manually</p>
                            <p><strong className="dark:text-blue-200">Send Email:</strong> User will receive notification with instructions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}