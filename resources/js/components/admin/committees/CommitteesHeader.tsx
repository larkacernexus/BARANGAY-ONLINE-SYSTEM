import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { Plus, Layers, MousePointer } from 'lucide-react';

interface CommitteesHeaderProps {
    isBulkMode: boolean;
    toggleBulkMode: () => void;
    stats: {
        total: number;
        active: number;
        inactive: number;
        with_positions: number;
        without_positions: number;
    };
}

export function CommitteesHeader({ isBulkMode, toggleBulkMode, stats }: CommitteesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Committees</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage barangay committees and their assignments
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleBulkMode}
                            className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
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
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                        <p className="text-xs text-gray-500">Select multiple committees for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                <Link href="/admin/committees/create">
                    <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Committee</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}