// components/admin/users/create/security-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lock, Key, Eye, EyeOff, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SecurityTabProps {
    formData: any;
    errors: Record<string, string>;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    onGeneratePassword: () => void;
    isGeneratingPassword: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSubmitting: boolean;
    // Optional props for edit mode
    passwordResetMode?: boolean;
    onForcePasswordReset?: () => void;
    onClearPasswordFields?: () => void;
    onSwitchChange?: (name: string, checked: boolean) => void;
}

export function SecurityTab({
    formData,
    errors,
    showPassword,
    onToggleShowPassword,
    onGeneratePassword,
    isGeneratingPassword,
    onInputChange,
    isSubmitting,
    passwordResetMode,
    onForcePasswordReset,
    onClearPasswordFields,
    onSwitchChange
}: SecurityTabProps) {
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength indicators
    const hasMinLength = formData.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);
    const passwordsMatch = formData.password && formData.password_confirmation && formData.password === formData.password_confirmation;

    const getPasswordStrength = () => {
        const checks = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];
        const count = checks.filter(Boolean).length;
        if (count <= 2) return { text: 'Weak', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
        if (count <= 3) return { text: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
        if (count <= 4) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' };
        return { text: 'Strong', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
    };

    const strength = getPasswordStrength();

    return (
        <div className="space-y-6">
            {/* Password Reset Mode Indicator (for edit mode) */}
            {passwordResetMode && onClearPasswordFields && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Password Reset Mode</span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearPasswordFields}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            Clear Password
                        </Button>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        A new password has been generated. The user will be prompted to change it on next login.
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="password" className="dark:text-gray-300">
                        Password {!passwordResetMode && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={onInputChange}
                            placeholder={passwordResetMode ? "New password" : "Enter password"}
                            className={`pl-10 pr-20 ${errors.password ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={onToggleShowPassword}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Password Strength:</span>
                                <span className={`text-xs font-medium ${strength.color}`}>{strength.text}</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 rounded-full ${
                                        strength.text === 'Weak' ? 'bg-red-500 w-1/4' :
                                        strength.text === 'Fair' ? 'bg-yellow-500 w-2/4' :
                                        strength.text === 'Good' ? 'bg-blue-500 w-3/4' : 'bg-green-500 w-full'
                                    }`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="dark:text-gray-300">
                        Confirm Password {!passwordResetMode && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.password_confirmation}
                            onChange={onInputChange}
                            placeholder="Confirm password"
                            className={`pl-10 pr-10 ${errors.password_confirmation ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                            disabled={isSubmitting}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                    )}
                    {formData.password_confirmation && (
                        <div className="mt-1">
                            {passwordsMatch ? (
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Passwords match
                                </p>
                            ) : (
                                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Passwords do not match
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onGeneratePassword}
                    disabled={isGeneratingPassword || isSubmitting}
                    className="gap-2 dark:border-gray-600 dark:text-gray-300"
                >
                    <Key className="h-4 w-4" />
                    {isGeneratingPassword ? 'Generating...' : 'Generate Strong Password'}
                </Button>

                {onForcePasswordReset && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onForcePasswordReset}
                        disabled={isGeneratingPassword || isSubmitting}
                        className="gap-2 dark:border-gray-600 dark:text-gray-300"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Force Password Reset
                    </Button>
                )}
            </div>

            {/* Require Password Change Switch (for edit mode) */}
            {onSwitchChange && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="space-y-0.5">
                        <Label htmlFor="require_password_change" className="dark:text-gray-300">
                            Require password change on next login
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            User will be forced to change their password when they next log in
                        </p>
                    </div>
                    <Switch
                        id="require_password_change"
                        checked={formData.require_password_change}
                        onCheckedChange={(checked) => onSwitchChange('require_password_change', checked)}
                        disabled={isSubmitting}
                    />
                </div>
            )}

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium text-sm dark:text-gray-300 mb-3">Password Requirements:</div>
                <div className="grid gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {hasMinLength ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-current" />}
                        <span>At least 8 characters long</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasUpperCase && hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {hasUpperCase && hasLowerCase ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-current" />}
                        <span>Contains uppercase and lowercase letters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {hasNumber ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-current" />}
                        <span>Contains at least one number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {hasSpecialChar ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-current" />}
                        <span>Contains at least one special character (!@#$%^&*)</span>
                    </div>
                </div>
            </div>

            {/* Security Tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">🔐 Security Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-300">
                            <li>Use a unique password not used elsewhere</li>
                            <li>Avoid common words or personal information</li>
                            <li>Consider using a password manager</li>
                            <li>Enable two-factor authentication for extra security</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}