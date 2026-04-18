// resources/js/components/admin/households/HouseholdsHeader.tsx

import { Button } from '@/components/ui/button';
import { Layers, MousePointer, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HouseholdsHeaderProps {
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isMobile?: boolean;
}

export default function HouseholdsHeader({ 
    isBulkMode, 
    setIsBulkMode, 
    isMobile = false 
}: HouseholdsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                    Households
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage and organize all households in the community
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
                        <p className="text-xs text-gray-500">Select multiple households for batch operations</p>
                    </TooltipContent>
                </Tooltip>
                
                {/* ✅ FIX: Remove asChild and nested <a> tag */}
                <Link href="/admin/households/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Household
                    </Button>
                </Link>
            </div>
        </div>
    );
}