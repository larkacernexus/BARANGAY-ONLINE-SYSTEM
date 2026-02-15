// components/admin/document-types/DocumentTypesBulkActions.tsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    PackageCheck,
    PackageX,
    Clipboard,
    FileSpreadsheet,
    Edit,
    Layers,
    X,
    Hash,
    CheckCircle,
    XCircle,
    HardDrive,
    FileType,
    Folder,
    MoreVertical,
    Trash2,
    Copy,
    Timer
} from 'lucide-react';
import { BulkOperation, SelectionMode, SelectionStats } from '@/types/document-types';

interface DocumentTypesBulkActionsProps {
    selectedDocumentTypes: number[];
    selectionMode: SelectionMode;
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile: boolean;
    categories: Array<{ id: number; name: string }>;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkRequiredDialog?: (show: boolean) => void;
}

export default function DocumentTypesBulkActions({
    selectedDocumentTypes,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile,
    categories,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkRequiredDialog,
}: DocumentTypesBulkActionsProps) {
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm">
                            {selectedDocumentTypes.length} selected
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
                                    <Clipboard className="h-3.5 w-3.5" />
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('export')}
                                    className="h-8"
                                    disabled={isPerformingBulkAction}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Export selected document types
                            </TooltipContent>
                        </Tooltip>
                        
                        {setShowBulkRequiredDialog && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBulkRequiredDialog(true)}
                                        className="h-8"
                                        disabled={isPerformingBulkAction}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                        Edit Requirement
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Bulk edit document type requirements
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    
                    <div className="relative">
                        <Button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <Timer className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <MoreVertical className="h-3.5 w-3.5 mr-1" />
                                    More
                                </>
                            )}
                        </Button>
                        
                        {showBulkActions && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        BULK ACTIONS
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => onBulkOperation('duplicate')}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Duplicate
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    {setShowBulkDeleteDialog && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setShowBulkDeleteDialog(true)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Delete Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8"
                        onClick={onClearSelection}
                        disabled={isPerformingBulkAction}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Exit
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedDocumentTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                                {selectionStats.total} total
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            <span>
                                {selectionStats.required} required • {selectionStats.optional} optional
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                                Max: {selectionStats.maxFileSizeMB} MB
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileType className="h-3.5 w-3.5 text-indigo-500" />
                            <span>
                                {selectionStats.hasFormats} with formats
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            <span>
                                {Object.entries(selectionStats.categories).slice(0, 2).map(([categoryId, count]) => {
                                    const category = categories.find(c => c.id === parseInt(categoryId));
                                    return category ? `${count} in ${category.name}` : '';
                                }).filter(Boolean).join(', ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span>{selectionStats.inactive} inactive</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}