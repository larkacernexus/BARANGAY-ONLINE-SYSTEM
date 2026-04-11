// resources/js/components/admin/puroks/PuroksHeader.tsx

import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer, RefreshCw } from 'lucide-react';

interface PuroksHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
    onUpdateStatistics?: () => void;
}

export default function PuroksHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false,
    onUpdateStatistics
}: PuroksHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Purok Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage barangay puroks/zones and their information
                </p>
            </div>
            <div className="flex items-center gap-2">
                {onUpdateStatistics && (
                    <Button
                        variant="outline"
                        onClick={onUpdateStatistics}
                        className="gap-2"
                        title="Update statistics for all puroks"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Update Stats</span>
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsBulkMode(!isBulkMode);
                    }}
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
                    <a href="/admin/puroks/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Purok
                    </a>
                </Button>
            </div>
        </div>
    );
}