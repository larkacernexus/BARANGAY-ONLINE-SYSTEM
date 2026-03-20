// resources/js/Pages/Admin/Users/components/security-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    ShieldAlert,
    KeyRound,
    LogOut,
    Key,
    Mail,
    EyeIcon,
    Zap,
    ShieldOff,
    History,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { DangerZoneCard } from './danger-zone-card';
import { SecurityActionsCard } from './security-actions-card';
import { TwoFARecoveryCard } from './twofa-recovery-card';

interface Props {
    user: any;
    onResetPassword: () => void;
    onToggle2FA: () => void;
    onDelete: () => void;
    isResettingPassword: boolean;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const SecurityTab = ({
    user,
    onResetPassword,
    onToggle2FA,
    onDelete,
    isResettingPassword,
    formatDate
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Security Status */}
            <div className="lg:col-span-2 space-y-6">
                {/* Security Overview Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <ShieldCheck className="h-5 w-5" />
                            Security Overview
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Current security status and recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 border dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${user.email_verified_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                        {user.email_verified_at ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium dark:text-gray-200">Email Verification</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.email_verified_at ? 'Verified' : 'Not verified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${user.two_factor_confirmed_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                        {user.two_factor_confirmed_at ? (
                                            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium dark:text-gray-200">Two-Factor Auth</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.two_factor_confirmed_at ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${user.password_changed_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                        <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium dark:text-gray-200">Password Age</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.password_changed_at 
                                                ? `${differenceInDays(new Date(), parseISO(user.password_changed_at))} days`
                                                : 'Never changed'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${user.last_login_at ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900'} flex items-center justify-center`}>
                                        <LogOut className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium dark:text-gray-200">Last Login</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Recommendations */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                Recommendations
                            </h4>
                            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                                {!user.two_factor_confirmed_at && (
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                        Enable two-factor authentication for enhanced security
                                    </li>
                                )}
                                {!user.email_verified_at && (
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                        Verify email address to enable account recovery
                                    </li>
                                )}
                                {user.password_changed_at && 
                                    differenceInDays(new Date(), parseISO(user.password_changed_at)) > 90 && (
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                        Password is over 90 days old. Consider resetting.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Login History Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <History className="h-5 w-5" />
                            Login History
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Recent login attempts and locations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {user.last_login_at ? (
                                <div className="p-3 border dark:border-gray-700 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium dark:text-gray-200">Last Login</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(user.last_login_at, true)}
                                            </p>
                                            {user.last_login_ip && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    IP: {user.last_login_ip}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                            Current
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No login history</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Security Actions */}
            <div className="space-y-6">
                <SecurityActionsCard
                    user={user}
                    onResetPassword={onResetPassword}
                    onToggle2FA={onToggle2FA}
                    isResettingPassword={isResettingPassword}
                />

                {user.two_factor_confirmed_at && user.two_factor_recovery_codes && (
                    <TwoFARecoveryCard user={user} />
                )}

                <DangerZoneCard user={user} onDelete={onDelete} />
            </div>
        </div>
    );
};