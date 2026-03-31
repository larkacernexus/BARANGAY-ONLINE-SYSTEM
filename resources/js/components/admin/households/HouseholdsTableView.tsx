// components/admin/households/HouseholdsTableView.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/adminui/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Clipboard, Home, Users, Phone, MapPin, ChevronUp, ChevronDown, Square, CheckSquare, Map as MapIcon, MoreVertical, PlayCircle, PauseCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { getPurokName, getStatusBadgeVariant, truncateText, truncateAddress, formatContactNumber } from '../../../admin-utils/householdUtils';
import { SingleHouseholdMapModal } from '@/components/admin/puroks/show/components/SingleHouseholdMapModal';
import { useState } from 'react';

interface HouseholdsTableViewProps {
    households: any[];
    isBulkMode: boolean;
    selectedHouseholds: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (household: any) => void;
    onToggleStatus?: (household: any) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    puroks: any[];
    sortBy: string;
    sortOrder: string;
}

export default function HouseholdsTableView({
    households,
    isBulkMode,
    selectedHouseholds,
    isMobile,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    puroks,
    sortBy,
    sortOrder
}: HouseholdsTableViewProps) {
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [selectedHouseholdForMap, setSelectedHouseholdForMap] = useState<any>(null);

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'household' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 480) {
            switch(type) {
                case 'name': return 12;
                case 'address': return 18;
                case 'contact': return 8;
                case 'household': return 10;
                default: return 12;
            }
        }
        if (width < 640) {
            switch(type) {
                case 'name': return 15;
                case 'address': return 20;
                case 'contact': return 10;
                case 'household': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 20;
                case 'address': return 25;
                case 'contact': return 12;
                case 'household': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'address': return 30;
                case 'contact': return 15;
                case 'household': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'household': return 20;
            default: return 30;
        }
    };

    const handleOpenMap = (household: any) => {
        setSelectedHouseholdForMap(household);
        setMapModalOpen(true);
    };

    const handleViewDetails = (householdId: number) => {
        router.get(`/admin/households/${householdId}`);
    };

    const handleEdit = (householdId: number) => {
        router.get(`/admin/households/${householdId}/edit`);
    };

    const handleToggleStatus = (household: any) => {
        if (onToggleStatus) {
            onToggleStatus(household);
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-900">
                                    {isBulkMode && (
                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-center w-10 sm:w-12">
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    checked={isSelectAll && households.length > 0}
                                                    onCheckedChange={onSelectAllOnPage}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                                />
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] sm:min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => onSort('household_number')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Household No.
                                            {getSortIcon('household_number')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px] sm:min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => onSort('head_of_family')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Head of Family
                                            {getSortIcon('head_of_family')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => onSort('member_count')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Members
                                            {getSortIcon('member_count')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                                        Contact
                                    </TableHead>
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] sm:min-w-[180px]">
                                        Address
                                    </TableHead>
                                    {!isMobile && (
                                        <>
                                            <TableHead 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => onSort('purok')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Purok
                                                    {getSortIcon('purok')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => onSort('status')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    {getSortIcon('status')}
                                                </div>
                                            </TableHead>
                                        </>
                                    )}
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[60px] sm:min-w-[80px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {households.length === 0 ? (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={
                                                isBulkMode ? 
                                                (isMobile ? 7 : 9) : 
                                                (isMobile ? 6 : 8)
                                            } 
                                            className="text-center py-8"
                                        >
                                            <EmptyState
                                                title="No households found"
                                                description={hasActiveFilters 
                                                    ? 'Try changing your filters or search criteria.'
                                                    : 'Get started by registering a household.'}
                                                icon={<Home className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                                                hasFilters={hasActiveFilters}
                                                onClearFilters={onClearFilters}
                                                onCreateNew={() => router.get('/admin/households/create')}
                                                createLabel="Register Household"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    households.map(household => {
                                        const purokName = getPurokName(household, puroks);
                                        const householdLength = getTruncationLength('household');
                                        const nameLength = getTruncationLength('name');
                                        const addressLength = getTruncationLength('address');
                                        const isSelected = selectedHouseholds.includes(household.id);
                                        const hasCoordinates = !!(household.latitude && household.longitude);
                                        
                                        return (
                                            <TableRow 
                                                key={household.id}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                }`}
                                                onClick={(e) => {
                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                        !e.target.closest('a') && 
                                                        !e.target.closest('button') &&
                                                        !e.target.closest('.dropdown-menu-content') &&
                                                        !e.target.closest('input[type="checkbox"]')) {
                                                        onItemSelect(household.id);
                                                    }
                                                }}
                                            >
                                                {isBulkMode && (
                                                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => onItemSelect(household.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                                                    <div 
                                                        className="flex items-center gap-2 cursor-text select-text"
                                                        onDoubleClick={(e) => {
                                                            const selection = window.getSelection();
                                                            if (selection) {
                                                                const range = document.createRange();
                                                                range.selectNodeContents(e.currentTarget);
                                                                selection.removeAllRanges();
                                                                selection.addRange(range);
                                                            }
                                                        }}
                                                        title={`Double-click to select all\nHousehold Number: ${household.household_number}`}
                                                    >
                                                        <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                        <div 
                                                            className="font-medium truncate"
                                                            data-full-text={household.household_number}
                                                        >
                                                            {truncateText(household.household_number, isMobile ? 12 : householdLength)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                                                    <div 
                                                        className="cursor-text select-text"
                                                        onDoubleClick={(e) => {
                                                            const selection = window.getSelection();
                                                            if (selection) {
                                                                const range = document.createRange();
                                                                range.selectNodeContents(e.currentTarget);
                                                                selection.removeAllRanges();
                                                                selection.addRange(range);
                                                            }
                                                        }}
                                                        title={`Double-click to select all\nHead of Family: ${household.head_of_family}`}
                                                    >
                                                        <div 
                                                            className="truncate"
                                                            data-full-text={household.head_of_family}
                                                        >
                                                            {truncateText(household.head_of_family, isMobile ? 15 : nameLength)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                                        <span className="text-sm">{household.member_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                                                    <div 
                                                        className="flex items-center gap-1 cursor-text select-text"
                                                        onDoubleClick={(e) => {
                                                            const selection = window.getSelection();
                                                            if (selection) {
                                                                const range = document.createRange();
                                                                range.selectNodeContents(e.currentTarget);
                                                                selection.removeAllRanges();
                                                                selection.addRange(range);
                                                            }
                                                        }}
                                                        title={`Double-click to select all\nContact: ${household.contact_number || 'N/A'}`}
                                                    >
                                                        <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                        <div 
                                                            className="truncate text-sm"
                                                            data-full-text={household.contact_number}
                                                        >
                                                            {formatContactNumber(household.contact_number)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                                                    <div 
                                                        className="flex items-center gap-1 cursor-text select-text"
                                                        onDoubleClick={(e) => {
                                                            const selection = window.getSelection();
                                                            if (selection) {
                                                                const range = document.createRange();
                                                                range.selectNodeContents(e.currentTarget);
                                                                selection.removeAllRanges();
                                                                selection.addRange(range);
                                                            }
                                                        }}
                                                        title={`Double-click to select all\nAddress: ${household.address}`}
                                                    >
                                                        <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                        <div 
                                                            className="truncate text-sm"
                                                            data-full-text={household.address}
                                                        >
                                                            {truncateAddress(household.address, isMobile ? 20 : addressLength)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {!isMobile && (
                                                    <>
                                                        <TableCell className="px-4 py-3">
                                                            <Badge 
                                                                variant="outline" 
                                                                className="truncate max-w-full text-xs"
                                                                title={purokName}
                                                            >
                                                                {truncateText(purokName, 15)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <Badge 
                                                                variant={getStatusBadgeVariant(household.status)}
                                                                className="truncate max-w-full text-xs"
                                                                title={household.status}
                                                            >
                                                                {household.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                            <DropdownMenuItem 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleViewDetails(household.id);
                                                                }}
                                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                <span>View Details</span>
                                                            </DropdownMenuItem>
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleEdit(household.id);
                                                                }}
                                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span>Edit Household</span>
                                                            </DropdownMenuItem>

                                                            {onToggleStatus && (
                                                                <>
                                                                    <DropdownMenuItem 
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleToggleStatus(household);
                                                                        }}
                                                                        className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    >
                                                                        {household.status === 'active' ? (
                                                                            <>
                                                                                <PauseCircle className="h-4 w-4" />
                                                                                <span>Deactivate</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <PlayCircle className="h-4 w-4" />
                                                                                <span>Activate</span>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                </>
                                                            )}

                                                            {hasCoordinates && (
                                                                <>
                                                                    <DropdownMenuItem 
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleOpenMap(household);
                                                                        }}
                                                                        className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    >
                                                                        <MapIcon className="h-4 w-4" />
                                                                        <span>View Map</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                </>
                                                            )}
                                                            
                                                            <DropdownMenuItem 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    onCopyToClipboard(household.household_number, 'Household Number');
                                                                }}
                                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                <Clipboard className="h-4 w-4" />
                                                                <span>Copy Household No.</span>
                                                            </DropdownMenuItem>
                                                            
                                                            {household.contact_number && (
                                                                <DropdownMenuItem 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        onCopyToClipboard(household.contact_number, 'Contact');
                                                                    }}
                                                                    className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                                >
                                                                    <Clipboard className="h-4 w-4" />
                                                                    <span>Copy Contact</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            
                                                            {isBulkMode && (
                                                                <>
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                    <DropdownMenuItem 
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            onItemSelect(household.id);
                                                                        }}
                                                                        className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                                    >
                                                                        {isSelected ? (
                                                                            <>
                                                                                <CheckSquare className="h-4 w-4 text-green-600" />
                                                                                <span className="text-green-600">Deselect</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Square className="h-4 w-4" />
                                                                                <span>Select for Bulk</span>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            
                                                            {household.status !== 'inactive' && (
                                                                <>
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                    <DropdownMenuItem 
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            onDelete(household);
                                                                        }}
                                                                        className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span>Delete Household</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
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

            {/* Map Modal */}
            {selectedHouseholdForMap && (
                <SingleHouseholdMapModal
                    open={mapModalOpen}
                    onOpenChange={(open) => {
                        setMapModalOpen(open);
                        if (!open) setSelectedHouseholdForMap(null);
                    }}
                    household={selectedHouseholdForMap}
                    purokName={getPurokName(selectedHouseholdForMap, puroks)}
                />
            )}
        </>
    );
}