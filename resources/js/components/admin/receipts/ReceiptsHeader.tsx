// resources/js/components/admin/receipts/ReceiptsHeader.tsx
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    MousePointer,
    Layers,
    Plus,
    Receipt
} from 'lucide-react';
import { route } from 'ziggy-js';

interface ReceiptsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
}

export default function ReceiptsHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile
}: ReceiptsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Receipts Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage and track official receipts
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={`
                        h-9 
                        bg-white dark:bg-gray-900 
                        border-gray-200 dark:border-gray-700
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${isBulkMode ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50' : ''}
                    `}
                >
                    {isBulkMode ? (
                        <>
                            <Layers className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Bulk Mode</span>
                            <span className="sm:hidden">Bulk</span>
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Bulk Select</span>
                            <span className="sm:hidden">Select</span>
                        </>
                    )}
                </Button>
                
                <Link href={route('receipts.create')}>
                    <Button 
                        size="sm"
                        className="h-9 bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Generate Receipt</span>
                        <span className="sm:hidden">Generate</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}