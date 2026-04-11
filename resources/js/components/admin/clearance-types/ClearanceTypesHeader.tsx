// components/admin/clearance-types/ClearanceTypesHeader.tsx

import { Button } from '@/components/ui/button';
import { Layers, MousePointer, Plus } from 'lucide-react';

interface ClearanceTypesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
    selectedCount?: number;
}

export default function ClearanceTypesHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false,
    selectedCount = 0
}: ClearanceTypesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Clearance Types</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage different types of clearances and certificates
                </p>
            </div>
            <div className="flex items-center gap-2">
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
                            {selectedCount > 0 && (
                                <span className="ml-1 text-xs bg-blue-200 px-1.5 py-0.5 rounded-full">
                                    {selectedCount}
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            Bulk Select
                        </>
                    )}
                </Button>
                <Button asChild>
                    <a href="/admin/clearance-types/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Type
                    </a>
                </Button>
            </div>
        </div>
    );
}