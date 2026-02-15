// components/admin/residents/ResidentsHeader.tsx
import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer } from 'lucide-react';

interface ResidentsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
}

export default function ResidentsHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false
}: ResidentsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Resident Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage all residents and their information
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
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            Bulk Select
                        </>
                    )}
                </Button>
                <Button asChild>
                    <a href="/residents/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resident
                    </a>
                </Button>
            </div>
        </div>
    );
}