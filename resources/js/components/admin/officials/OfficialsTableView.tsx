// components/admin/officials/OfficialsTableView.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { Shield, Phone, MoreVertical, Eye, Edit, User, Copy, Printer, Trash2, CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { Official } from '@/types/officials';
import { FilterState } from '@/admin-utils/officialsUtils';
import { truncateText, getTruncationLength, getStatusBadgeVariant, formatDate, getPositionBadgeVariant } from '@/admin-utils/officialsUtils';

interface OfficialsTableViewProps {
    officials: Official[];
    isBulkMode: boolean;
    selectedOfficials: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (official: Official) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    positions: Record<string, { name: string; order: number }>;
    committees: Record<string, string>;
    windowWidth: number;
}

export default function OfficialsTableView({
    officials,
    isBulkMode,
    selectedOfficials,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    positions,
    committees,
    windowWidth
}: OfficialsTableViewProps) {
    
    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && officials.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Official
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('position')}
                                >
                                    <div className="flex items-center gap-1">
                                        Position
                                        {getSortIcon('position')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('committee')}
                                >
                                    <div className="flex items-center gap-1">
                                        Committee
                                        {getSortIcon('committee')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('term_start')}
                                >
                                    <div className="flex items-center gap-1">
                                        Term
                                        {getSortIcon('term_start')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {officials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Shield className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                    No officials found
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {hasActiveFilters 
                                                        ? 'Try changing your filters or search criteria.'
                                                        : 'Get started by adding a barangay official.'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={onClearFilters}
                                                        className="h-8"
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                )}
                                                <Link href="/officials/create">
                                                    <Button className="h-8">
                                                        Add First Official
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                officials.map((official) => {
                                    const isSelected = selectedOfficials.includes(official.id);
                                    const resident = official.resident;
                                    const nameLength = getTruncationLength('name', windowWidth);
                                    const positionLength = getTruncationLength('position', windowWidth);
                                    const committeeLength = getTruncationLength('committee', windowWidth);
                                    const termLength = getTruncationLength('term', windowWidth);
                                    const statusVariant = getStatusBadgeVariant(official.status, official.is_current);
                                    const positionVariant = getPositionBadgeVariant(official.position);
                                    
                                    return (
                                        <TableRow 
                                            key={official.id} 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                            }`}
                                            onClick={(e) => {
                                                if (isBulkMode && e.target instanceof HTMLElement && 
                                                    !e.target.closest('a') && 
                                                    !e.target.closest('button') &&
                                                    !e.target.closest('.dropdown-menu-content') &&
                                                    !e.target.closest('input[type="checkbox"]')) {
                                                    onItemSelect(official.id);
                                                }
                                            }}
                                        >
                                            {isBulkMode && (
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => onItemSelect(official.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {official.photo_url || resident?.photo_url ? (
                                                            <img 
                                                                src={official.photo_url || resident?.photo_url} 
                                                                alt={resident?.full_name || 'Official'}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                                            {truncateText(resident?.full_name || 'Unknown', nameLength)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {official.contact_number || resident?.contact_number || 'No contact'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <div className="font-medium truncate">
                                                        {truncateText(official.full_position, positionLength)}
                                                    </div>
                                                    <Badge className={positionVariant.className}>
                                                        {positionVariant.text}
                                                    </Badge>
                                                    {official.is_regular ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                                                            Regular
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs">
                                                            Ex-Officio
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {official.committee ? (
                                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50">
                                                        {truncateText(committees[official.committee] || official.committee, committeeLength)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">No committee</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <div className="text-sm truncate">
                                                        {truncateText(`${formatDate(official.term_start)} - ${formatDate(official.term_end)}`, termLength)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {official.term_duration}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <Badge className={statusVariant.className}>
                                                        {statusVariant.text}
                                                    </Badge>
                                                    {official.is_current && (
                                                        <div className="text-xs text-green-600">Current Term</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/officials/${official.id}`} className="flex items-center cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>View Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/officials/${official.id}/edit`} className="flex items-center cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit Official</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/residents/${resident?.id}`} className="flex items-center cursor-pointer">
                                                                <User className="mr-2 h-4 w-4" />
                                                                <span>View Resident</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => onCopyToClipboard(resident?.full_name || '', 'Official Name')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Name</span>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => onCopyToClipboard(official.full_position, 'Position')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Position</span>
                                                        </DropdownMenuItem>
                                                        
                                                        {isBulkMode && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onClick={() => onItemSelect(official.id)}
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
                                                            <Link href={`/officials/${official.id}/print`} className="flex items-center cursor-pointer">
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                <span>Print Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            onClick={() => onDelete(official)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete Official</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}