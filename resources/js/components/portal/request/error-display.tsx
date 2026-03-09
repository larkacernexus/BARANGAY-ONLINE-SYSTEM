import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
    errors: Record<string, string>;
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
    if (Object.keys(errors).length === 0) return null;

    return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6 mx-4 lg:mx-0">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-red-700 mb-1">Please fix the following errors:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {Object.entries(errors).map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}