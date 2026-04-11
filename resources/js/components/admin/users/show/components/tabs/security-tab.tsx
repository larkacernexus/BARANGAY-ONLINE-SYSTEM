// components/admin/users/show/components/tabs/security-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    Shield, 
    Key, 
    Lock, 
    Unlock, 
    CheckCircle, 
    XCircle,
    RefreshCw,
    Smartphone,
    Mail,
    AlertTriangle,
    Clock,
    Fingerprint,
    QrCode,
    Trash2,
    ShieldCheck,
    ShieldOff,
    Loader2,
    Calendar,
    Globe
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { User } from '@/types/admin/users/user-types';

interface SecurityTabProps {
    user: User;
    onResetPassword: () => void;
    onToggle2FA: () => void;
    onDelete: () => void;
    isResettingPassword: boolean;
    formatDate: (date: string | null, includeTime?: boolean) => string;
    has2FA?: boolean;
    onClearSessions?: () => void;
    isClearingSessions?: boolean;
    onResendVerification?: () => void;
    isResendingVerification?: boolean;
}

// Password strength indicator component
const PasswordStrengthIndicator = ({ strength }: { strength: 'weak' | 'medium' | 'strong' }) => {
    const getStrengthConfig = () => {
        switch (strength) {
            case 'weak':
                return { width: '33%', color: 'bg-red-500', text: 'Weak', textColor: 'text-red-600 dark:text-red-400' };
            case 'medium':
                return { width: '66%', color: 'bg-yellow-500', text: 'Medium', textColor: 'text-yellow-600 dark:text-yellow-400' };
            case 'strong':
                return { width: '100%', color: 'bg-green-500', text: 'Strong', textColor: 'text-green-600 dark:text-green-400' };
        }
    };

    const config = getStrengthConfig();

    return (
        <div className="mt-1 flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${config.color} rounded-full`} style={{ width: config.width }} />
            </div>
            <span className={`text-sm ${config.textColor}`}>{config.text}</span>
        </div>
    );
};

export const SecurityTab = ({
    user,
    onResetPassword,
    onToggle2FA,
    onDelete,
    isResettingPassword,
    formatDate,
    has2FA: propHas2FA,
    onClearSessions,
    isClearingSessions = false,
    onResendVerification,
    isResendingVerification = false,
}: SecurityTabProps) => {
    // Safe access with fallbacks
    const has2FA = propHas2FA ?? !!user.two_factor_confirmed_at;
    const emailVerified = !!user.email_verified_at;
    const twoFactorEnabledAt = user.two_factor_confirmed_at;
    const emailVerifiedAt = user.email_verified_at;
    const lastPasswordChange = (user as any).password_changed_at || user.created_at;
    const lastActivityAt = (user as any).last_activity_at || user.last_login_at;
    const hasSessions = (user as any).sessions?.length > 0;

    // Calculate password strength (mock - replace with actual logic)
    const getPasswordStrength = (): 'weak' | 'medium' | 'strong' => {
        // This is a mock implementation. Replace with actual password strength logic
        return 'strong';
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Password Security Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Key className="h-5 w-5 text-blue-500" />
                        Password Security
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Manage password and authentication settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Password</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last changed: {formatDate(lastPasswordChange, true)}
                            </p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={onResetPassword}
                                        disabled={isResettingPassword}
                                    >
                                        {isResettingPassword ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Reset Password
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send password reset email to user</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Separator className="dark:bg-gray-800" />

                    <div>
                        <p className="font-medium dark:text-gray-200">Password Strength</p>
                        <PasswordStrengthIndicator strength={getPasswordStrength()} />
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Smartphone className="h-5 w-5 text-purple-500" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Add an extra layer of security to the account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {has2FA ? (
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            ) : (
                                <ShieldOff className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                                <p className="font-medium dark:text-gray-200">
                                    {has2FA ? '2FA Enabled' : '2FA Disabled'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {has2FA 
                                        ? `Enabled on ${formatDate(twoFactorEnabledAt, true)}`
                                        : 'Protect account with two-factor authentication'}
                                </p>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={has2FA ? 'outline' : 'default'}
                                        onClick={onToggle2FA}
                                    >
                                        {has2FA ? (
                                            <>
                                                <Unlock className="h-4 w-4 mr-2" />
                                                Disable 2FA
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4 mr-2" />
                                                Enable 2FA
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{has2FA ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {!has2FA && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                User can scan QR code with authenticator app to enable 2FA
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Email Verification Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Mail className="h-5 w-5 text-green-500" />
                        Email Verification
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Verify email address for account recovery
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {emailVerified ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                                <p className="font-medium dark:text-gray-200">
                                    {emailVerified ? 'Verified' : 'Not Verified'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {emailVerified 
                                        ? `Verified on ${formatDate(emailVerifiedAt, true)}`
                                        : 'Verify email to recover account if needed'}
                                </p>
                            </div>
                        </div>
                        {!emailVerified && onResendVerification && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={onResendVerification}
                                            disabled={isResendingVerification}
                                        >
                                            {isResendingVerification ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="h-3 w-3 mr-2" />
                                                    Resend
                                                </>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Resend verification email</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Session Management Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Fingerprint className="h-5 w-5 text-indigo-500" />
                        Session Management
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Manage active sessions and devices
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Current Session</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last active: {formatDate(lastActivityAt, true)}
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                        </Badge>
                    </div>

                    {hasSessions && (
                        <>
                            <Separator className="dark:bg-gray-800" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium dark:text-gray-200">Remembered Devices</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Devices that remember this user's login
                                    </p>
                                </div>
                                {onClearSessions && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={onClearSessions}
                                                    disabled={isClearingSessions}
                                                >
                                                    {isClearingSessions ? (
                                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                    ) : (
                                                        <Globe className="h-3 w-3 mr-2" />
                                                    )}
                                                    Clear All
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Clear all remembered devices and sessions</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-red-200 dark:border-red-900 md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600 dark:text-red-400">
                        Irreversible actions. Proceed with caution.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">Delete Account</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Permanently delete this user account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={onDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete User
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Permanently delete user account</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};