// resources/js/components/admin/banners/BannersBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    ChevronDown,
    FileSpreadsheet, 
    Printer, 
    BarChart3,
    Share2,
    Edit,
    Copy,
    Trash2,
    Users,
    CheckSquare,
    X
} from 'lucide-react';

interface BulkActionsProps {
    selectedBanners: number[];
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
        primary: Array<{ label: string; icon: JSX.Element; onClick: () => void; tooltip: string }>;
        secondary: Array<{ label: string; icon: JSX.Element; onClick: () => void; tooltip: string; variant?: 'destructive' }>;
        destructive: Array<{ label: string; icon: JSX.Element; onClick: () => void; tooltip: string; variant: 'destructive' }>;
    };
}

export default function BannersBulkActions({
    selectedBanners,
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
}: BulkActionsProps) {
    const selectedCount = selectedBanners.length;

    // Get selection description
    const getSelectionDescription = () => {
        if (selectionMode === 'all') {
            return `All ${totalItems} banners selected`;
        }
        if (selectionMode === 'filtered') {
            return `All filtered banners (${selectedCount}) selected`;
        }
        return `${selectedCount} banner${selectedCount !== 1 ? 's' : ''} selected`;
    };

    return (
        <Card className="sticky top-0 z-10 mb-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 shadow-lg">
            <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                            {getSelectionDescription()}
                        </span>
                    </div>
                    
                    {/* Selection stats */}
                    {selectedCount > 0 && (
                        <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                            <span>Active: {selectionStats.active || 0}</span>
                            <span className="mx-1">•</span>
                            <span>Scheduled: {selectionStats.scheduled || 0}</span>
                            <span className="mx-1">•</span>
                            <span>Expired: {selectionStats.expired || 0}</span>
                            <span className="mx-1">•</span>
                            <span>Inactive: {selectionStats.inactive || 0}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Selection options dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                                disabled={isPerformingBulkAction}
                            >
                                Select More
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onSelectAllOnPage}>
                                Select All on Current Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onSelectAllFiltered}>
                                Select All Filtered Banners
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onSelectAll}>
                                Select All {totalItems} Banners
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Primary Actions */}
                    <div className="flex gap-1">
                        {bulkActions.primary.map((action, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={action.onClick}
                                disabled={isPerformingBulkAction}
                                className="border-blue-300 dark:border-blue-700"
                                title={action.tooltip}
                            >
                                {action.icon}
                                {!isMobile && <span className="ml-1">{action.label}</span>}
                            </Button>
                        ))}
                    </div>

                    {/* Secondary Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-300 dark:border-blue-700"
                                disabled={isPerformingBulkAction}
                            >
                                More Actions
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {bulkActions.secondary.map((action, idx) => (
                                <DropdownMenuItem 
                                    key={idx} 
                                    onClick={action.onClick}
                                    disabled={isPerformingBulkAction}
                                >
                                    {action.icon}
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {bulkActions.destructive.map((action, idx) => (
                                <DropdownMenuItem 
                                    key={idx} 
                                    onClick={action.onClick}
                                    className="text-red-600"
                                    disabled={isPerformingBulkAction}
                                >
                                    {action.icon}
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear Selection */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSelection}
                        disabled={isPerformingBulkAction}
                        className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </div>
            </div>
        </Card>
    );
}