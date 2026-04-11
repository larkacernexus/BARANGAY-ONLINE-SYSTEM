// resources/js/components/admin/community-reports/show/components/flash-message.tsx
import { CheckCircle, AlertCircle } from 'lucide-react';
import { FlashMessage } from '@/types/admin/reports/community-report';

interface FlashMessageProps {
    flash: FlashMessage | null;
}

export function FlashMessageComponent({ flash }: FlashMessageProps) {
    if (!flash) return null;

    return (
        <>
            {flash.success && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500 mr-3" />
                        <div>
                            <p className="text-green-800 dark:text-green-300 font-medium">Success</p>
                            <p className="text-green-700 dark:text-green-400 text-sm mt-1">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-3" />
                        <div>
                            <p className="text-red-800 dark:text-red-300 font-medium">Error</p>
                            <p className="text-red-700 dark:text-red-400 text-sm mt-1">{flash.error}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}