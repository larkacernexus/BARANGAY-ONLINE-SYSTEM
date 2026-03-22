// components/admin/users/show/components/tabs/security-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    Trash2
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface SecurityTabProps {
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
}: SecurityTabProps) => {
    const has2FA = !!user.two_factor_confirmed_at;
    const emailVerified = !!user.email_verified_at;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Password Security Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Key className="h-5 w-5" />
                        Password Security
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Manage password and authentication
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Password</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last changed: {formatDate(user.password_changed_at, true)}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onResetPassword}
                            disabled={isResettingPassword}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isResettingPassword ? 'animate-spin' : ''}`} />
                            {isResettingPassword ? 'Sending...' : 'Reset Password'}
                        </Button>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Password Strength</p>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <span className="text-sm text-green-600 dark:text-green-400">Strong</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Smartphone className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {has2FA ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                                <p className="font-medium dark:text-gray-200">
                                    {has2FA ? '2FA Enabled' : '2FA Disabled'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {has2FA 
                                        ? `Enabled on ${formatDate(user.two_factor_confirmed_at, true)}`
                                        : 'Protect your account with two-factor authentication'}
                                </p>
                            </div>
                        </div>
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
                    </div>

                    {!has2FA && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                Scan QR code with authenticator app to enable 2FA
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Email Verification Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Mail className="h-5 w-5" />
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
                                        ? `Verified on ${formatDate(user.email_verified_at, true)}`
                                        : 'Verify email to recover account if needed'}
                                </p>
                            </div>
                        </div>
                        {!emailVerified && (
                            <Button variant="outline" size="sm">
                                Resend Verification
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Session Management Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Fingerprint className="h-5 w-5" />
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
                                Last active: {formatDate(user.last_activity_at, true)}
                            </p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Remembered Devices</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Devices that remember your login
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onResetPassword}>
                            Clear All
                        </Button>
                    </div>
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
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-300">Delete Account</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Permanently delete this user account and all associated data
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};