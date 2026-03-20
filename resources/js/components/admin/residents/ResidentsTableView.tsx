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
import { Crown, ChevronUp, ChevronDown, Phone, Home, User, Camera, Eye, Edit, QrCode, FileText, Trash2, Clipboard, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { EmptyState } from '@/components/adminui/empty-state';
import { Resident } from '@/types';
import {
    getFullName,
    truncateText,
    truncateAddress,
    formatContactNumber,
    getPhotoUrl,
    getHouseholdInfo,
    isHeadOfHousehold,
    getStatusBadgeVariant,
    getStatusLabel,
    getTruncationLength
} from '@/admin-utils/residentsUtils';
import { useState, useEffect } from 'react';

// Define FilterState interface locally to match the one from residentsUtils
interface FilterState {
    sort_by: string;
    sort_order: 'asc' | 'desc';
    status: string;
    purok_id: string | number;
    gender: string;
    min_age?: number | string;
    max_age?: number | string;
    civil_status: string;
    is_voter: string;
    is_head: string;
    privilege_id?: string | number;
    privilege?: string;
}

interface HouseholdInfo {
    id: number;
    name: string;
}

interface ResidentsTableViewProps {
    residents: Resident[];
    isBulkMode: boolean;
    selectedResidents: number[];
    isMobile: boolean;
    filtersState?: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (resident: Resident) => void;
    onViewPhoto: (resident: Resident) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
}

// Helper function to get initials from name
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export default function ResidentsTableView({
    residents,
    isBulkMode,
    selectedResidents,
    isMobile,
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
        is_head: 'all'
    },
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    onSelectAllOnPage,
    isSelectAll
}: ResidentsTableViewProps) {
    // Add local state for window width to prevent hydration issues
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedResidentForPhoto, setSelectedResidentForPhoto] = useState<Resident | null>(null);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Safely get sort icon
    const getSortIcon = (column: string) => {
        if (!filtersState || filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`${label} copied to clipboard`);
        }).catch(() => {
            console.error('Failed to copy to clipboard');
        });
    };

    const handleViewPhoto = (resident: Resident) => {
        setSelectedResidentForPhoto(resident);
        setPhotoModalOpen(true);
    };

    const handleClosePhotoModal = () => {
        setPhotoModalOpen(false);
        setSelectedResidentForPhoto(null);
    };

    const renderTableRow = (resident: Resident) => {
        const fullName = getFullName(resident);
        const nameLength = getTruncationLength('name');
        const addressLength = getTruncationLength('address');
        const photoUrl = getPhotoUrl(resident.photo_path, resident.photo_url);
        const hasPhoto = !!photoUrl;
        const householdInfo = getHouseholdInfo(resident);
        const isHead = isHeadOfHousehold(resident);
        const isSelected = selectedResidents.includes(resident.id);
        const initials = getInitials(resident.first_name || '', resident.last_name || '');
        
        // Get household details for display
        const householdNumber = householdInfo?.name || '';
        
        return (
            <TableRow 
                key={resident.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                } ${isHead ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                onClick={(e) => {
                    if (isBulkMode && e.target instanceof HTMLElement && 
                        !e.target.closest('a') && 
                        !e.target.closest('button') &&
                        !e.target.closest('[role="menuitem"]') &&
                        !e.target.closest('[data-radix-menu-content]') &&
                        !e.target.closest('input[type="checkbox"]')) {
                        onItemSelect(resident.id);
                    }
                }}
            >
                {isBulkMode && (
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(resident.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                    <div 
                        className="flex items-center gap-2 sm:gap-3 cursor-text select-text"
                        onDoubleClick={(e) => {
                            const selection = window.getSelection();
                            if (selection) {
                                const range = document.createRange();
                                range.selectNodeContents(e.currentTarget);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }}
                        title={`Double-click to select all\n${fullName}`}
                    >
                        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <AvatarImage 
                                src={photoUrl || undefined} 
                                alt={fullName}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white text-xs">
                                {initials || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div 
                                className="font-medium truncate flex items-center gap-1"
                                data-full-text={fullName}
                            >
                                {truncateText(fullName, isMobile ? 15 : nameLength)}
                                {isHead && (
                                    <Crown className="h-3 w-3 text-amber-600 flex-shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="text-xs text-gray-500">
                                    ID: {resident.id}
                                </div>
                                {hasPhoto && (
                                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                        <Camera className="h-2.5 w-2.5 mr-1" />
                                        Photo
                                    </Badge>
                                )}
                                {isHead && (
                                    <Badge variant="outline" className="text-xs bg-amber-50 hidden sm:inline-flex">
                                        <Crown className="h-2.5 w-2.5 mr-1" />
                                        Head
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <div>
                        <div>{resident.age} years</div>
                        <div className="text-sm text-gray-500 capitalize truncate">
                            {resident.gender}
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
                        title={`Double-click to select all\n${resident.contact_number || 'N/A'}`}
                    >
                        <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <div 
                            className="truncate"
                            data-full-text={resident.contact_number}
                        >
                            {formatContactNumber(resident.contact_number)}
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
                        title={`Double-click to select all\nAddress: ${resident.address}\nPurok: ${resident.purok?.name || 'No Purok'}`}
                    >
                        <Home className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                            <div 
                                className="truncate"
                                data-full-text={resident.address}
                            >
                                {truncateAddress(resident.address, isMobile ? 20 : addressLength)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {typeof resident.purok === 'object' && resident.purok?.name 
                                    ? resident.purok.name 
                                    : typeof resident.purok === 'string' 
                                    ? resident.purok 
                                    : 'No Purok'}
                            </div>
                        </div>
                    </div>
                </TableCell>
                {!isMobile && (
                    <>
                        <TableCell className="px-4 py-3">
                            {householdInfo ? (
                                <Link href={`/households/${householdInfo.id}`} className="hover:text-primary hover:underline">
                                    <div 
                                        className="font-medium truncate flex items-center gap-1"
                                        title={householdNumber}
                                    >
                                        {truncateText(householdNumber, 15)}
                                        {isHead && (
                                            <Crown className="h-3 w-3 text-amber-600" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        Head of Household
                                    </div>
                                </Link>
                            ) : (
                                <span className="text-gray-400 italic text-sm">No household</span>
                            )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                            <Badge 
                                variant={getStatusBadgeVariant(resident.status) as "default" | "secondary" | "destructive" | "outline"}
                                className="truncate max-w-full text-xs"
                                title={getStatusLabel(resident.status)}
                            >
                                {getStatusLabel(resident.status)}
                            </Badge>
                        </TableCell>
                    </>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
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
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/admin/residents/${resident.id}`;
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Eye className="h-4 w-4" />
                                <span>View Details</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/admin/residents/${resident.id}/edit`;
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>

                            {hasPhoto && (
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleViewPhoto(resident);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span>View Photo</span>
                                </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCopyToClipboard(fullName, 'Name');
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Clipboard className="h-4 w-4" />
                                <span>Copy Name</span>
                            </DropdownMenuItem>
                            
                            {resident.contact_number && (
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleCopyToClipboard(resident.contact_number, 'Contact');
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Clipboard className="h-4 w-4" />
                                    <span>Copy Contact</span>
                                </DropdownMenuItem>
                            )}
                            
                           
                            {isBulkMode && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onItemSelect(resident.id);
                                        }}
                                        className="flex items-center gap-2 cursor-pointer"
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
                            
                            <DropdownMenuSeparator />
                            
                            {resident.status !== 'deceased' && (
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDelete(resident);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Resident</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        );
    };

    // Calculate column span
    const calculateColumnSpan = (): number => {
        let baseCols = isMobile ? 4 : 6;
        if (isBulkMode) baseCols += 1;
        return baseCols + 1; // +1 for actions column
    };

    return (
        <>
            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                    {isBulkMode && (
                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-center w-10 sm:w-12">
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    checked={isSelectAll && residents.length > 0}
                                                    onCheckedChange={onSelectAllOnPage}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                                />
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] sm:min-w-[160px] cursor-pointer hover:bg-gray-100"
                                        onClick={() => onSort('last_name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            {getSortIcon('last_name')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[100px] cursor-pointer hover:bg-gray-100"
                                        onClick={() => onSort('age')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Age/Gender
                                            {getSortIcon('age')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                                        Contact
                                    </TableHead>
                                    <TableHead 
                                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] sm:min-w-[180px] cursor-pointer hover:bg-gray-100"
                                        onClick={() => onSort('purok_id')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Address/Purok
                                            {getSortIcon('purok_id')}
                                        </div>
                                    </TableHead>
                                    {!isMobile && (
                                        <>
                                            <TableHead 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                onClick={() => onSort('household')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Household
                                                    {getSortIcon('household')}
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
                                        </>
                                    )}
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[60px] sm:min-w-[80px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {residents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={calculateColumnSpan()} className="text-center py-8">
                                            <EmptyState
                                                title="No residents found"
                                                description={hasActiveFilters 
                                                    ? 'Try changing your filters or search criteria.'
                                                    : 'Get started by adding a resident.'}
                                                icon={<User className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                                                hasFilters={hasActiveFilters}
                                                onClearFilters={onClearFilters}
                                                onCreateNew={() => window.location.href = '/admin/residents/create'}
                                                createLabel="Add Resident"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    residents.map(resident => renderTableRow(resident))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            <PhotoViewModal
                isOpen={photoModalOpen}
                onClose={handleClosePhotoModal}
                resident={selectedResidentForPhoto}
                photoUrl={selectedResidentForPhoto ? getPhotoUrl(selectedResidentForPhoto.photo_path, selectedResidentForPhoto.photo_url) : null}
            />
        </>
    );
}