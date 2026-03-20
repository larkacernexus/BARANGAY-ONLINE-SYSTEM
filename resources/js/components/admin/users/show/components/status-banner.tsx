// resources/js/Pages/Admin/Users/components/status-banner.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    RefreshCw,
    Key,
} from 'lucide-react';
import { User } from '../types';

interface Props {
    user: User;
    onResetPassword: () => void;
    isResettingPassword: boolean;
}

export const StatusBanner = ({ user, onResetPassword, isResettingPassword }: Props) => {
    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Password Change Required</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                This user must change their password on next login.
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onResetPassword}
                        disabled={isResettingPassword}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        {isResettingPassword ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Key className="h-4 w-4 mr-2" />
                                Reset Now
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};