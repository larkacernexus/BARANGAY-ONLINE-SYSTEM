import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    MousePointer,
    Layers,
    Plus,
    Award
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PrivilegesHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile: boolean;
    canCreate: boolean;
}

export default function PrivilegesHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile,
    canCreate
}: PrivilegesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                    Privilege Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage resident privileges, discounts, and benefits
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : ''}
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
                        <p className="text-xs text-gray-500">Select multiple privileges for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                
                {canCreate && (
                    <Link href="/admin/privileges/privileges/create">
                        <Button asChild>
                            <a>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Privilege
                            </a>
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}