// resources/js/components/admin/positions/PositionsTableView.tsx

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@inertiajs/react';
import { 
    Shield,
    MoreVertical,
    Eye,
    Edit,
    Users,
    TargetIcon,
    Copy,
    Printer,
    Trash2,
    CheckSquare,
    Square,
    Key,
    CheckCircle,
    XCircle,
    Crown
} from 'lucide-react';
import { Position, PositionFilters } from '@/types/admin/positions/position.types'; // ← FIX IMPORT PATH
import { positionUtils } from '@/admin-utils/position-utils';

interface PositionsTableViewProps {
    positions: Position[];
    isBulkMode: boolean;
    selectedPositions: number[];
    isMobile: boolean;
    filtersState: PositionFilters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (position: Position) => void;
    selectionStats?: any; // ← MAKE OPTIONAL
    getSortIcon: (column: string) => React.ReactNode;
}

export default function PositionsTableView({
    positions,
    isBulkMode,
    selectedPositions,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    selectionStats = {}, // ← ADD DEFAULT VALUE
    getSortIcon
}: PositionsTableViewProps) {
    
    // Helper functions that might be missing from positionUtils
    const truncateText = (text: string, length: number): string => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getTruncationLength = (type: 'name' | 'description' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'name': return 15;
                case 'description': return 20;
                case 'code': return 8;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'code': return 10;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'code': return 12;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'code': return 15;
            default: return 30;
        }
    };

    const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    };

    const getAccountBadgeVariant = (requiresAccount: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return requiresAccount ? 'default' : 'outline';
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Toast would be handled by parent
            console.log(`Copied ${label}: ${text}`);
        }).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    };

    const isKagawad = (name: string, code: string) => {
        return name?.toLowerCase().includes('kagawad') || code?.toLowerCase().includes('kagawad');
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedPositions.length === positions.length && positions.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedPositions.length === positions.length) {
                                                        // Deselect all on page
                                                        positions.forEach(p => {
                                                            if (selectedPositions.includes(p.id)) {
                                                                onItemSelect(p.id);
                                                            }
                                                        });
                                                    } else {
                                                        // Select all on page
                                                        positions.forEach(p => {
                                                            if (!selectedPositions.includes(p.id)) {
                                                                onItemSelect(p.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Position
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                    Code
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Committee
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('order')}
                                >
                                    <div className="flex items-center gap-1">
                                        Order
                                        {getSortIcon('order')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('officials_count')}
                                >
                                    <div className="flex items-center gap-1">
                                        Officials
                                        {getSortIcon('officials_count')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Account
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('is_active')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('is_active')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {positions.map((position) => {
                                const nameLength = getTruncationLength('name');
                                const descLength = getTruncationLength('description');
                                const codeLength = getTruncationLength('code');
                                const isSelected = selectedPositions.includes(position.id);
                                const isKagawadPos = isKagawad(position.name, position.code);
                                
                                return (
                                    <TableRow 
                                        key={position.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(position.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(position.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full ${isKagawadPos ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center flex-shrink-0`}>
                                                    {isKagawadPos ? (
                                                        <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    ) : (
                                                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {truncateText(position.name, nameLength)}
                                                        {isKagawadPos && (
                                                            <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                                Kagawad
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {position.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                            {truncateText(position.description, descLength)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <code 
                                                className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono cursor-text select-text"
                                                onDoubleClick={(e) => {
                                                    const selection = window.getSelection();
                                                    if (selection) {
                                                        const range = document.createRange();
                                                        range.selectNodeContents(e.currentTarget);
                                                        selection.removeAllRanges();
                                                        selection.addRange(range);
                                                    }
                                                }}
                                                title="Double-click to select"
                                            >
                                                {truncateText(position.code, codeLength)}
                                            </code>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {position.committee ? (
                                                <div className="flex items-center gap-2">
                                                    <TargetIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm truncate" title={position.committee.name}>
                                                        {truncateText(position.committee.name, 20)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic truncate">No committee</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-900 text-sm font-medium">
                                                    {position.order}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <Badge variant="outline" className="text-xs">
                                                    {position.officials_count ?? 0}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant={getAccountBadgeVariant(position.requires_account)} 
                                                className="flex items-center gap-1"
                                            >
                                                {position.requires_account ? (
                                                    <>
                                                        <Key className="h-3 w-3" />
                                                        Required
                                                    </>
                                                ) : (
                                                    'Optional'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant={getStatusBadgeVariant(position.is_active)} 
                                                className="flex items-center gap-1"
                                            >
                                                {position.is_active ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/positions/${position.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/positions/${position.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Position</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/officials?position_id=${position.id}`} className="flex items-center cursor-pointer">
                                                            <Users className="mr-2 h-4 w-4" />
                                                            <span>View Officials</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(position.name, 'Position Name')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Name</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(position.code, 'Position Code')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Code</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(position.id)}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                {isSelected ? (
                                                                    <>
                                                                        <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600">Deselect</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Square className="mr-2 h-4 w-4" />
                                                                        <span>Select for Bulk</span>
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/positions/${position.id}/print`} className="flex items-center cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                        onClick={() => onDelete(position)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Position</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}