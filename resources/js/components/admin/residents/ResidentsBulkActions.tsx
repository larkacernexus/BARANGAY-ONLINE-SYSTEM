// components/admin/residents/ResidentsBulkActions.tsx
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Download, 
    Printer, 
    Edit, 
    Trash2, 
    Copy, 
    UserPlus,
    UserMinus,
    FileDown,
    CheckSquare,
    Square,
    Home,
    Award,
    X,
    Layers,
    Filter
} from 'lucide-react';
import { SelectionMode, SelectionStats } from '@/types/admin/residents/residents-types';
import { useState, useRef, useEffect } from 'react';

export interface BulkActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: boolean;
}

export interface ResidentBulkActionsProps {
    selectedResidents: number[];
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    isMobile?: boolean;
    
    // Actions
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: string, data?: any) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkPurokDialog?: (show: boolean) => void;
    setShowBulkPrivilegeDialog?: (show: boolean) => void;
    setShowBulkRemovePrivilegeDialog?: (show: boolean) => void;
    
    // Bulk actions configuration
    bulkActions?: {
        primary?: BulkActionItem[];
        secondary?: BulkActionItem[];
        destructive?: BulkActionItem[];
        privilege?: BulkActionItem[];
    };
}

export default function ResidentBulkActions({
    selectedResidents,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    isMobile = false,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkPurokDialog,
    setShowBulkPrivilegeDialog,
    setShowBulkRemovePrivilegeDialog,
    bulkActions: customBulkActions
}: ResidentBulkActionsProps) {
    
    const [showSelectMenu, setShowSelectMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showPrivilegeMenu, setShowPrivilegeMenu] = useState(false);
    
    const selectMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const privilegeMenuRef = useRef<HTMLDivElement>(null);
    
    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectMenuRef.current && !selectMenuRef.current.contains(event.target as Node)) {
                setShowSelectMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
            if (privilegeMenuRef.current && !privilegeMenuRef.current.contains(event.target as Node)) {
                setShowPrivilegeMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Helper to get selection mode display text
    const getSelectionModeText = () => {
        switch (selectionMode) {
            case 'filtered':
                return 'Filtered';
            case 'all':
                return 'All Residents';
            default:
                return '';
        }
    };
    
    // Default bulk actions if not provided
    const defaultBulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <Download className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected residents',
                variant: 'default' as const,
                disabled: false
            },
            {
                label: 'Print IDs',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print_ids'),
                tooltip: 'Print IDs for selected residents',
                variant: 'default' as const,
                disabled: false
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <UserPlus className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate'),
                tooltip: 'Activate selected residents',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Deactivate',
                icon: <UserMinus className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate'),
                tooltip: 'Deactivate selected residents',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Update Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Update status for selected residents',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Update Purok',
                icon: <Home className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkPurokDialog?.(true),
                tooltip: 'Update purok for selected residents',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Export CSV',
                icon: <FileDown className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export_csv'),
                tooltip: 'Export as CSV',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard',
                variant: 'outline' as const,
                disabled: false
            }
        ],
        privilege: [
            {
                label: 'Add Privilege',
                icon: <Award className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkPrivilegeDialog?.(true),
                tooltip: 'Add privilege to selected residents',
                variant: 'outline' as const,
                disabled: false
            },
            {
                label: 'Remove Privilege',
                icon: <Award className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkRemovePrivilegeDialog?.(true),
                tooltip: 'Remove privilege from selected residents',
                variant: 'outline' as const,
                disabled: false
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected residents',
                variant: 'destructive' as const,
                disabled: false
            }
        ]
    };

    const bulkActions = customBulkActions || defaultBulkActions;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side: Selection info */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                {selectedResidents.length}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-sm sm:text-base dark:text-gray-200">
                                {selectedResidents.length} resident(s) selected
                            </span>
                            {selectionMode !== 'page' && selectionMode !== 'none' && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {getSelectionModeText()}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Selection Stats */}
                    {selectionStats && (
                        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {selectionStats.males > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    {selectionStats.males} male
                                </span>
                            )}
                            {selectionStats.females > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                    {selectionStats.females} female
                                </span>
                            )}
                            {selectionStats.active > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {selectionStats.active} active
                                </span>
                            )}
                            {selectionStats.voters > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    {selectionStats.voters} voters
                                </span>
                            )}
                            {selectionStats.heads > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    {selectionStats.heads} heads
                                </span>
                            )}
                            {selectionStats.hasPrivileges > 0 && (
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    {selectionStats.hasPrivileges} with privileges
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Right side: Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Selection Options */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearSelection}
                            disabled={isPerformingBulkAction}
                            className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Clear
                        </Button>
                        
                        {/* Select All Dropdown */}
                        <div className="relative" ref={selectMenuRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPerformingBulkAction}
                                onClick={() => setShowSelectMenu(!showSelectMenu)}
                                className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                {isSelectAll ? (
                                    <>
                                        <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                                        Deselect
                                    </>
                                ) : (
                                    <>
                                        <Square className="h-3.5 w-3.5 mr-1.5" />
                                        Select...
                                    </>
                                )}
                            </Button>
                            {showSelectMenu && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onSelectAllOnPage();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            <Layers className="h-3.5 w-3.5" />
                                            Select Page
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSelectAllFiltered();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            <Filter className="h-3.5 w-3.5" />
                                            Select All Filtered
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSelectAll();
                                                setShowSelectMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                            disabled={isPerformingBulkAction}
                                        >
                                            <CheckSquare className="h-3.5 w-3.5" />
                                            Select All Residents
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Actions */}
                        {bulkActions.primary?.map((action, index) => (
                            <Tooltip key={`primary-${index}`}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant || 'default'}
                                        size="sm"
                                        onClick={action.onClick}
                                        disabled={isPerformingBulkAction || action.disabled}
                                        className="text-xs h-8 dark:border-gray-600 dark:text-gray-300"
                                    >
                                        {action.icon}
                                        {!isMobile && action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        
                        {/* Privilege Actions */}
                        {bulkActions.privilege && bulkActions.privilege.length > 0 && (
                            <div className="relative" ref={privilegeMenuRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPerformingBulkAction}
                                    onClick={() => setShowPrivilegeMenu(!showPrivilegeMenu)}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Award className="h-3.5 w-3.5 mr-1.5" />
                                    Privileges
                                </Button>
                                {showPrivilegeMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {bulkActions.privilege.map((action, index) => (
                                                <button
                                                    key={`privilege-${index}`}
                                                    onClick={() => {
                                                        action.onClick();
                                                        setShowPrivilegeMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                    disabled={isPerformingBulkAction || action.disabled}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* More Actions Dropdown */}
                        {bulkActions.secondary && bulkActions.secondary.length > 0 && (
                            <div className="relative" ref={moreMenuRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPerformingBulkAction}
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="text-xs h-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Layers className="h-3.5 w-3.5 mr-1.5" />
                                    More
                                </Button>
                                {showMoreMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            {bulkActions.secondary.map((action, index) => (
                                                <button
                                                    key={`secondary-${index}`}
                                                    onClick={() => {
                                                        action.onClick();
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-300"
                                                    disabled={isPerformingBulkAction || action.disabled}
                                                >
                                                    {action.icon}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Destructive Actions */}
                        {bulkActions.destructive?.map((action, index) => (
                            <Tooltip key={`destructive-${index}`}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={action.variant || 'destructive'}
                                        size="sm"
                                        onClick={action.onClick}
                                        disabled={isPerformingBulkAction || action.disabled}
                                        className="text-xs h-8"
                                    >
                                        {action.icon}
                                        {!isMobile && action.label}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                    <p>{action.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Mobile Stats Summary */}
            {isMobile && selectionStats && (
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    {selectionStats.males > 0 && (
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            {selectionStats.males} male
                        </span>
                    )}
                    {selectionStats.females > 0 && (
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                            {selectionStats.females} female
                        </span>
                    )}
                    {selectionStats.active > 0 && (
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            {selectionStats.active} active
                        </span>
                    )}
                    {selectionStats.voters > 0 && (
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            {selectionStats.voters} voters
                        </span>
                    )}
                    {selectionStats.hasPrivileges > 0 && (
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            {selectionStats.hasPrivileges} with privileges
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}