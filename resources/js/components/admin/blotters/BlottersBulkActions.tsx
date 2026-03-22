// resources/js/components/admin/blotters/BlottersBulkActions.tsx

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    PackageCheck,
    PackageX,
    ClipboardCopy,
    FileSpreadsheet,
    Printer,
    Edit,
    Layers,
    X,
    Loader2,
    AlertCircle,
    Scale,
    Clock,
    CheckCircle,
    Archive
} from 'lucide-react';

interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface BlottersBulkActionsProps {
    selectedBlotters: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats: any;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    totalItems: number;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    bulkActions: {
        primary: BulkActionItem[];
        secondary: BulkActionItem[];
        destructive: BulkActionItem[];
    };
}

export default function BlottersBulkActions({
    selectedBlotters,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile,
    totalItems,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    bulkActions
}: BlottersBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'investigating': return <AlertCircle className="h-3 w-3" />;
            case 'resolved': return <CheckCircle className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return null;
        }
    };

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="font-medium text-sm">
                            {selectedBlotters.length} selected
                        </span>
                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                            {selectionMode === 'page' ? 'Page' : 
                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <PackageX className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCopySelectedData}
                                    className="h-7"
                                >
                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Copy selected data as CSV
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                    <div className="flex items-center gap-2">
                        {bulkActions.primary.map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={action.onClick}
                                        className="h-8"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {action.tooltip}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                    
                    <div className="relative">
                        <Button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-8 bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                    More
                                </>
                            )}
                        </Button>
                        
                        {showBulkActions && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        BULK ACTIONS
                                    </div>
                                    {bulkActions.secondary.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm"
                                            onClick={action.onClick}
                                        >
                                            {action.icon}
                                            {action.label}
                                        </Button>
                                    ))}
                                    {bulkActions.destructive.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={action.onClick}
                                        >
                                            {action.icon}
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'Escape',
                                code: 'Escape',
                                keyCode: 27,
                                which: 27,
                                bubbles: true
                            });
                            document.dispatchEvent(event);
                        }}
                        disabled={isPerformingBulkAction}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Exit
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedBlotters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Scale className="h-3.5 w-3.5 text-red-500" />
                            <span>
                                {selectionStats.total || selectedBlotters.length} blotters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-yellow-500" />
                            <span>
                                {selectionStats.pending || 0} pending
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                                {selectionStats.investigating || 0} investigating
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.resolved || 0} resolved
                            </span>
                        </div>
                    </div>
                    {selectionStats.urgent !== undefined && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span>{selectionStats.urgent || 0} urgent</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                <span>{selectionStats.high || 0} high</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                <span>{selectionStats.medium || 0} medium</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}