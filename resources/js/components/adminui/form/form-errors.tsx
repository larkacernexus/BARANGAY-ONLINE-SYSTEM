// components/ui/form/form-errors.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface FormErrorsProps {
    errors: Record<string, string>;
}

export function FormErrors({ errors }: FormErrorsProps) {
    if (Object.keys(errors).length === 0) return null;
    
    return (
        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                    <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}