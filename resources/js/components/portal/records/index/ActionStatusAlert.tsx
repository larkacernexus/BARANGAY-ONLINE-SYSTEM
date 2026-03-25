// /components/residentui/records/ActionStatusAlert.tsx
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionStatusAlertProps {
    type: 'success' | 'error' | 'info' | null;
    message: string;
}

export const ActionStatusAlert: React.FC<ActionStatusAlertProps> = ({ type, message }) => {
    if (!type) return null;

    return (
        <div className="fixed top-16 sm:top-4 right-4 z-50 max-w-xs sm:max-w-sm animate-in slide-in-from-top duration-300">
            <Alert 
                variant={type === 'error' ? 'destructive' : 'default'} 
                className={cn(
                    "shadow-lg border",
                    type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                        : type === 'info'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        : ''
                )}
            >
                <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
                    {type === 'success' ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    ) : type === 'error' ? (
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="truncate">{message}</span>
                </AlertDescription>
            </Alert>
        </div>
    );
};