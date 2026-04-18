// components/admin/residents/ResidentsTableView.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PhotoViewModal } from './photo-view-modal';
import { Crown, ChevronUp, ChevronDown, Phone, Home, User, Camera, Eye, Edit, Trash2, Clipboard, MoreVertical, UserPlus, UserMinus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { EmptyState } from '@/components/adminui/empty-state';
import { Resident, FilterState } from '@/types/admin/residents/residents-types';
import {
    getFullName,
    getStatusLabel,
    getTruncationLength,
    truncateText, 
    truncateAddress, 
    getPhotoUrl
} from '@/admin-utils/residentsUtils';
import { 
    extractResidentDisplayData,
    getTruncationLengths,
    safeFormatContactNumber
} from '@/admin-utils/residentsDisplayUtils';
import { usePhotoModal } from '@/hooks/admin/usePhotoModal';
import { useState, useCallback, memo, useMemo } from 'react';

interface ResidentsTableViewProps {
    residents: Resident[];
    isBulkMode: boolean;
    selectedResidents: number[];
    isMobile?: boolean;
    filtersState?: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    onToggleStatus?: (resident: Resident) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isLoading?: boolean;
}

// Memoized Table Row Component
const ResidentsTableRow = memo(({ 
    resident, 
    isBulkMode, 
    isSelected, 
    isMobile = false,
    onItemSelect,
    onDelete,
    onViewPhoto,
    onCopyToClipboard,
    onToggleStatus,
    isLoading = false
}: {
    resident: Resident;
    isBulkMode: boolean;
    isSelected: boolean;
    isMobile?: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onToggleStatus?: (resident: Resident) => void;
    isLoading?: boolean;
}) => {
    // Extract all display data using the centralized utility
    const displayData = extractResidentDisplayData(resident);
    const truncation = getTruncationLengths(isMobile);
    
    const {
        photoUrl,
        fullName,
        initials,
        age,
        householdInfo,
        isHead,
        hasPhoto,
        address,
        contactNumber,
        purokName,
        statusConfig
    } = displayData;
    
    const formattedContact = safeFormatContactNumber(contactNumber);
    const nameLength = getTruncationLength('name');
    const addressLength = getTruncationLength('address');
    
    const handleCopyToClipboardLocal = useCallback((text: string, label: string) => {
        if (onCopyToClipboard) {
            onCopyToClipboard(text, label);
        } else {
            navigator.clipboard.writeText(text).catch(() => {});
        }
    }, [onCopyToClipboard]);

    const handleViewPhoto = useCallback(() => {
        if (onViewPhoto) {
            onViewPhoto(resident);
        }
    }, [onViewPhoto, resident]);

    const handleDelete = useCallback(() => {
        onDelete(resident);
    }, [onDelete, resident]);

    const handleToggleStatus = useCallback(() => {
        onToggleStatus?.(resident);
    }, [onToggleStatus, resident]);

    return (
        <TableRow 
            className={`
                transition-colors border-b dark:border-gray-800
                hover:bg-gray-100/50 dark:hover:bg-gray-800/40
                ${isSelected ? 'bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''} 
                ${isHead && !isSelected ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}
                ${isLoading ? 'pointer-events-none opacity-60' : ''}
            `}
            onClick={(e) => {
                if (isLoading) return;
                if (isBulkMode && e.target instanceof HTMLElement && !e.target.closest('button, a, input, [role="menuitem"]')) {
                    onItemSelect(resident.id);
                }
            }}
        >
            {isBulkMode && (
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onItemSelect(resident.id)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                </TableCell>
            )}

            <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <AvatarImage src={photoUrl || undefined} alt={fullName} />
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
                            {truncateText(fullName, isMobile ? 15 : nameLength)}
                            {isHead && <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">ID: {resident.id}</span>
                            {isHead && (
                                <Badge variant="outline" className="h-4 px-1 text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                    Head
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>

            <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="text-gray-700 dark:text-gray-300">{age} yrs</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{resident.gender || 'N/A'}</div>
            </TableCell>

            <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{formattedContact}</span>
                </div>
            </TableCell>

            <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-1 min-w-0">
                    <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {truncateAddress(address, isMobile ? 20 : addressLength)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{purokName || 'No Purok'}</div>
                    </div>
                </div>
            </TableCell>

            {!isMobile && (
                <>
                    <TableCell className="px-4 py-3">
                        {householdInfo ? (
                            <Link href={`/households/${householdInfo.id}`} className="group">
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                                    {truncateText(householdInfo.name || '', 15)}
                                </div>
                                <div className="text-xs text-gray-500">Household</div>
                            </Link>
                        ) : (
                            <span className="text-gray-400 italic text-xs">No household</span>
                        )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                        <Badge 
                            className={`
                                font-medium text-[11px] ${statusConfig.color}
                            `}
                        >
                            {statusConfig.label}
                        </Badge>
                    </TableCell>
                </>
            )}

            <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900/95 backdrop-blur-sm shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            disabled={isLoading}
                        >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-800">
                        <DropdownMenuItem onClick={() => window.location.href = `/admin/residents/${resident.id}`} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/admin/residents/${resident.id}/edit`} className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        {hasPhoto && (
                            <DropdownMenuItem onClick={handleViewPhoto} className="gap-2 cursor-pointer">
                                <Camera className="h-4 w-4" /> View Photo
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="dark:bg-gray-800" />
                        <DropdownMenuItem onClick={() => handleCopyToClipboardLocal(fullName, 'Name')} className="gap-2 cursor-pointer">
                            <Clipboard className="h-4 w-4" /> Copy Name
                        </DropdownMenuItem>
                        {onToggleStatus && (
                            <DropdownMenuItem onClick={handleToggleStatus} className="gap-2 cursor-pointer">
                                {resident.status === 'active' ? <><UserMinus className="h-4 w-4" /> Deactivate</> : <><UserPlus className="h-4 w-4" /> Activate</>}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="dark:bg-gray-800" />
                        <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30">
                            <Trash2 className="h-4 w-4" /> Delete Resident
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

ResidentsTableRow.displayName = 'ResidentsTableRow';

// Empty State Component
const EmptyStateComponent = ({ 
    hasActiveFilters, 
    onClearFilters 
}: { 
    hasActiveFilters: boolean; 
    onClearFilters: () => void;
}) => (
    <EmptyState
        title="No residents found"
        description={hasActiveFilters ? 'Try changing your filters or search criteria.' : 'Get started by adding a resident.'}
        icon={<User className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
        action={hasActiveFilters ? {
            label: "Clear Filters",
            onClick: onClearFilters
        } : undefined}
    />
);

// Main Table Component
export default function ResidentsTableView({
    residents,
    isBulkMode,
    selectedResidents,
    isMobile = false,
    filtersState = {
        sort_by: 'last_name',
        sort_order: 'asc',
        status: 'all',
        purok_id: 'all',
        gender: 'all',
        min_age: '',
        max_age: '',
        civil_status: 'all',
        is_voter: 'all',
        is_head: 'all',
        privilege: '',
        privilege_id: ''
    },
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    onToggleStatus,
    sortBy = 'last_name',
    sortOrder = 'asc',
    isLoading = false
}: ResidentsTableViewProps) {
    const { isOpen, selectedResident, openModal, closeModal } = usePhotoModal();
    
    // Sort Icon Logic
    const getSortIcon = useCallback((column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }, [sortBy, sortOrder]);

    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedResidents), [selectedResidents]);

    // Early return for empty state
    if (residents.length === 0) {
        return (
            <div className="rounded-md border dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-b dark:border-gray-800">
                                {isBulkMode && (
                                    <TableHead className="w-12 text-center">
                                        <Checkbox
                                            checked={isSelectAll && residents.length > 0}
                                            onCheckedChange={onSelectAllOnPage}
                                            disabled={isLoading}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-900 dark:hover:text-gray-200" 
                                    onClick={() => !isLoading && onSort('last_name')}
                                >
                                    <div className="flex items-center gap-1">Name {getSortIcon('last_name')}</div>
                                </TableHead>
                                <TableHead 
                                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-900 dark:hover:text-gray-200" 
                                    onClick={() => !isLoading && onSort('age')}
                                >
                                    <div className="flex items-center gap-1">Age {getSortIcon('age')}</div>
                                </TableHead>
                                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Contact</TableHead>
                                <TableHead 
                                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-900 dark:hover:text-gray-200" 
                                    onClick={() => !isLoading && onSort('purok_id')}
                                >
                                    <div className="flex items-center gap-1">Address {getSortIcon('purok_id')}</div>
                                </TableHead>
                                {!isMobile && (
                                    <>
                                        <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Household</TableHead>
                                        <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</TableHead>
                                    </>
                                )}
                                <TableHead className="text-right sticky right-0 bg-gray-50 dark:bg-gray-800/50 z-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {residents.map((resident) => (
                                <ResidentsTableRow
                                    key={resident.id}
                                    resident={resident}
                                    isBulkMode={isBulkMode}
                                    isSelected={selectedSet.has(resident.id)}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    onViewPhoto={onViewPhoto || openModal}
                                    onCopyToClipboard={onCopyToClipboard}
                                    onToggleStatus={onToggleStatus}
                                    isLoading={isLoading}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Photo Modal */}
            <PhotoViewModal
                isOpen={isOpen}
                onClose={closeModal}
                resident={selectedResident}
                photoUrl={selectedResident ? getPhotoUrl(selectedResident.profile_photo, (selectedResident as any).photo_url) : null}
            />
        </>
    );
}