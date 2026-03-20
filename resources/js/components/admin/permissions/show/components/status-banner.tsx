// resources/js/Pages/Admin/Permissions/components/status-banner.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, XCircle } from 'lucide-react';

interface Props {
    isSystem: boolean;
    isActive: boolean;
}

export const StatusBanner = ({ isSystem, isActive }: Props) => {
    if (!isSystem && isActive) return null;

    return (
        <>
            {isSystem && (
                <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium dark:text-gray-100">System Permission</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    This is a system permission. System permissions are managed by the IT department and should not be modified directly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isActive && (
                <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium dark:text-gray-100">Inactive Permission</p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    This permission is currently inactive and cannot be used or assigned to roles.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
};