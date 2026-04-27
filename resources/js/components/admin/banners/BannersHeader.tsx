// resources/js/components/admin/banners/BannersHeader.tsx

import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer, RefreshCw } from 'lucide-react';

interface BannersHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
    onUpdateOrder?: () => void;
}

export default function BannersHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false,
    onUpdateOrder
}: BannersHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Banner Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage homepage carousel banners and promotional content
                </p>
            </div>
            <div className="flex items-center gap-2">
                {onUpdateOrder && (
                    <Button
                        variant="outline"
                        onClick={onUpdateOrder}
                        className="gap-2"
                        title="Update sort order for all banners"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Update Order</span>
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                >
                    {isBulkMode ? (
                        <>
                            <Layers className="h-4 w-4 mr-2" />
                            Bulk Mode
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            Bulk Select
                        </>
                    )}
                </Button>
                <Button asChild>
                    <a href="/admin/banners/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Banner
                    </a>
                </Button>
            </div>
        </div>
    );
}