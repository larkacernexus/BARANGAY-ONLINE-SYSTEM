// resources/js/Pages/Admin/Users/components/twofa-recovery-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Key,
    EyeIcon,
} from 'lucide-react';

interface Props {
    user: any;
}

export const TwoFARecoveryCard = ({ user }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Key className="h-5 w-5" />
                    Recovery Codes
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Use these codes if you lose access to your device
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg font-mono text-xs">
                        {JSON.parse(user.two_factor_recovery_codes).slice(0, 3).map((code: string, i: number) => (
                            <div key={i} className="py-1">{code}</div>
                        ))}
                        {JSON.parse(user.two_factor_recovery_codes).length > 3 && (
                            <div className="text-gray-500 dark:text-gray-400 pt-1">
                                +{JSON.parse(user.two_factor_recovery_codes).length - 3} more
                            </div>
                        )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View All Codes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};