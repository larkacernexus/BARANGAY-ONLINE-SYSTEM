// resources/js/Pages/Admin/Users/components/security-actions-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import {
    Zap,
    KeyRound,
    ShieldCheck,
    ShieldOff,
    Mail,
    RefreshCw,
} from 'lucide-react';

interface Props {
    user: any;
    onResetPassword: () => void;
    onToggle2FA: () => void;
    isResettingPassword: boolean;
}

export const SecurityActionsCard = ({
    user,
    onResetPassword,
    onToggle2FA,
    isResettingPassword
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Security Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onResetPassword}
                    disabled={isResettingPassword}
                >
                    {isResettingPassword ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                        </>
                    )}
                </Button>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onToggle2FA}
                >
                    {user.two_factor_confirmed_at ? (
                        <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Disable 2FA
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Enable 2FA
                        </>
                    )}
                </Button>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={() => router.post(`/users/${user.id}/send-verification`)}
                    disabled={user.email_verified_at}
                >
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email_verified_at ? 'Email Verified' : 'Send Verification'}
                </Button>
            </CardContent>
        </Card>
    );
};