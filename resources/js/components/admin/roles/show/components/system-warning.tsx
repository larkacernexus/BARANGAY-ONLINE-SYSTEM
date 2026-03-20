// resources/js/Pages/Admin/Roles/components/system-warning.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface SystemWarningProps {
    warnings: string[];
}

export const SystemWarning = ({ warnings }: SystemWarningProps) => {
    if (!warnings || warnings.length === 0) return null;

    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium dark:text-gray-100">System Role Notice</p>
                        <ul className="list-disc list-inside space-y-1 mt-1 text-sm text-amber-600 dark:text-amber-400">
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};