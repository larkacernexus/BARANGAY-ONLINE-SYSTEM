import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, MousePointer, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface FeesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
}

export default function FeesHeader({ isBulkMode, setIsBulkMode, isMobile = false }: FeesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fees Management</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Manage and track barangay fees, bills, and certificates
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBulkMode(!isBulkMode)}
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
                        <p className="text-xs text-gray-500">Select multiple fees for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                <Link href={route('admin.fees.create')}>
                    <Button className="h-9">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">New Fee</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}