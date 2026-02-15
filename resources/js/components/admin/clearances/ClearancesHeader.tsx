// components/admin/clearances/ClearancesHeader.tsx
import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer } from 'lucide-react';

interface ClearancesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
}

export default function ClearancesHeader({
    isBulkMode,
    setIsBulkMode
}: ClearancesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Clearance Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Issue and manage barangay clearances and certificates
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsBulkMode(!isBulkMode);
                        if (isBulkMode) {
                            // Clear selection when exiting bulk mode
                        }
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
                    <a href="/clearances/create">
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </a>
                </Button>
            </div>
        </div>
    );
}