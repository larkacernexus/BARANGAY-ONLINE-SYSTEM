// resources/js/components/admin/blotters/BlottersHeader.tsx

import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    MousePointer,
    Layers,
    Plus,
    RefreshCw,
    FileText
} from 'lucide-react';

interface BlottersHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
    isRefreshing?: boolean;
    onRefresh?: () => void;
}

export default function BlottersHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile,
    isRefreshing = false,
    onRefresh
}: BlottersHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Blotter Records
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage and track incident reports, complaints, and cases
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
                        ${isBulkMode ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50' : ''}
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
                
                {onRefresh && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                        <span className="sm:hidden">{isRefreshing ? '...' : 'Refresh'}</span>
                    </Button>
                )}
                
                <Link href="/admin/blotters/create">
                    <Button 
                        size="sm"
                        className="h-9 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">File Blotter</span>
                        <span className="sm:hidden">File</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}