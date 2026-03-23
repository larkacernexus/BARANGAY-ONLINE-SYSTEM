import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
    onGoHome?: () => void;
}

export function ErrorState({ message, onRetry, onGoHome }: ErrorStateProps) {
    return (
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Error</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
                <div className="flex gap-3 justify-center">
                    {onRetry && (
                        <Button 
                            onClick={onRetry}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        >
                            Try Again
                        </Button>
                    )}
                    {onGoHome && (
                        <Button 
                            variant="outline"
                            onClick={onGoHome}
                            className="border-gray-200 dark:border-gray-700"
                        >
                            Go to Dashboard
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}