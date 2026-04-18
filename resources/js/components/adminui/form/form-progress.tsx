// components/ui/form/form-progress.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissingField {
    field: string;
    label: string;
    tabId: string;
}

interface FormProgressProps {
    progress: number;
    isComplete: boolean;
    missingFields?: MissingField[]; // Change from string[] to MissingField[]
    onMissingFieldClick?: (tabId: string) => void;
    className?: string;
}

export function FormProgress({
    progress,
    isComplete,
    missingFields = [],
    onMissingFieldClick,
    className
}: FormProgressProps) {
    return (
        <Card className={cn("dark:bg-gray-900 border-2 border-emerald-200 dark:border-emerald-800", className)}>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Form Completion
                    </h3>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={cn(
                            "h-full transition-all duration-300",
                            isComplete 
                                ? 'bg-green-500' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {!isComplete && missingFields.length > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            <span className="font-medium">{missingFields.length}</span> required field{missingFields.length !== 1 ? 's' : ''} remaining
                        </p>
                    </div>
                )}
                {!isComplete && missingFields.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Missing fields:</p>
                        <div className="flex flex-wrap gap-1">
                            {missingFields.slice(0, 5).map((field, index) => (
                                <button
                                    key={index}
                                    onClick={() => onMissingFieldClick?.(field.tabId)}
                                    className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                    {field.label}
                                </button>
                            ))}
                            {missingFields.length > 5 && (
                                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    +{missingFields.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {isComplete && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-800 dark:text-green-300">
                            Ready to submit!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}