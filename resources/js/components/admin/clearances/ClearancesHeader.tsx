// components/admin/clearances/ClearancesHeader.tsx

import { Button } from '@/components/ui/button';
import { Plus, Layers, MousePointer } from 'lucide-react';

interface ClearancesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean; // Add optional isMobile prop
}

export default function ClearancesHeader({
    isBulkMode,
    setIsBulkMode,
    isMobile = false // Default to false
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
                    size={isMobile ? "sm" : "default"}
                >
                    {isBulkMode ? (
                        <>
                            <Layers className="h-4 w-4 mr-2" />
                            {!isMobile && "Bulk Mode"}
                            {isMobile && "Bulk"}
                        </>
                    ) : (
                        <>
                            <MousePointer className="h-4 w-4 mr-2" />
                            {!isMobile && "Bulk Select"}
                            {isMobile && "Select"}
                        </>
                    )}
                </Button>
                <Button asChild size={isMobile ? "sm" : "default"}>
                    <a href="/admin/clearances/create">
                        <Plus className="h-4 w-4 mr-2" />
                        {!isMobile && "New Request"}
                        {isMobile && "New"}
                    </a>
                </Button>
            </div>
        </div>
    );
}