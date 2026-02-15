import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    PackageCheck, 
    PackageX, 
    ClipboardCopy,
    FileSpreadsheet,
    Edit,
    Layers,
    X,
    Loader2,
    Trash2,
    CheckCircle,
    XCircle,
    BarChart3
} from 'lucide-react';

interface CommitteesBulkActionsProps {
    selectedIds: number[];
    selectedCount: number;
    selectionMode?: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    isPerformingBulkAction: boolean;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered?: () => void;
    onSelectAll?: () => void;
    onBulkOperation?: (operation: string) => void;
    onCopySelectedData?: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
}

export function CommitteesBulkActions({
    selectedIds,
    selectedCount,
    selectionMode = 'page',
    selectionStats,
    isPerformingBulkAction,
    onClearSelection,
    onSelectAllOnPage,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog
}: CommitteesBulkActionsProps) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">
                            {selectedCount} selected
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
                
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation?.('export')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export selected committees
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBulkStatusDialog?.(true)}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                    Edit Status
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Bulk edit selected committees
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        disabled={isPerformingBulkAction}
                    >
                        {isPerformingBulkAction ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <Layers className="h-3.5 w-3.5 mr-1" />
                                More Actions
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}