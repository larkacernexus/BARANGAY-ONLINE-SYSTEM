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
    MapPin,
    MoreVertical,
    Eye,
    Edit,
    Users,
    Home,
    Copy,
    Printer,
    Trash2,
    CheckSquare,
    Square,
    ExternalLink,
    Phone
} from 'lucide-react';
import { Purok, PurokFilters } from '@/types/purok';
import { purokUtils } from '@/admin-utils/purok-utils';
import { JSX } from 'react';

interface PuroksTableViewProps {
    puroks: Purok[];
    isBulkMode: boolean;
    selectedPuroks: number[];
    isMobile: boolean;
    filtersState: PurokFilters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (purok: Purok) => void;
    selectionStats: any;
    getSortIcon: (column: string) => string | null;
}

export default function PuroksTableView({
    puroks,
    isBulkMode,
    selectedPuroks,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    selectionStats,
    getSortIcon
}: PuroksTableViewProps) {
    const getTruncationLength = (type: 'name' | 'description' | 'contact' | 'leader' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'name': return 15;
                case 'description': return 20;
                case 'contact': return 10;
                case 'leader': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'contact': return 12;
                case 'leader': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'contact': return 15;
                case 'leader': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'contact': return 15;
            case 'leader': return 20;
            default: return 30;
        }
    };

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formatContactNumber = (contact: string): string => {
        if (!contact) return 'Not assigned';
        if (contact.length <= 12) return contact;
        return truncateText(contact, 12);
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'active': <div className="h-2 w-2 rounded-full bg-green-500"></div>,
            'inactive': <div className="h-2 w-2 rounded-full bg-gray-400"></div>,
            'pending': <div className="h-2 w-2 rounded-full bg-amber-500"></div>,
            'archived': <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        };
        return icons[status.toLowerCase()] || null;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Toast would be handled by parent
        }).catch(() => {
            // Toast would be handled by parent
        });
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
                                                checked={selectedPuroks.length === puroks.length && puroks.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedPuroks.length === puroks.length) {
                                                        puroks.forEach(p => onItemSelect(p.id));
                                                    } else {
                                                        puroks.forEach(p => {
                                                            if (!selectedPuroks.includes(p.id)) {
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
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Purok Name
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                    Leader
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Map
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('total_households')}
                                >
                                    <div className="flex items-center gap-1">
                                        Households
                                        {getSortIcon('total_households')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('total_residents')}
                                >
                                    <div className="flex items-center gap-1">
                                        Residents
                                        {getSortIcon('total_residents')}
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
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Created
                                        {getSortIcon('created_at')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {puroks.map((purok) => {
                                const nameLength = getTruncationLength('name');
                                const descLength = getTruncationLength('description');
                                const leaderLength = getTruncationLength('leader');
                                const isSelected = selectedPuroks.includes(purok.id);
                                
                                return (
                                    <TableRow 
                                        key={purok.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(purok.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(purok.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {truncateText(purok.name, nameLength)}
                                                    </div>
                                                    {purok.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                            {truncateText(purok.description, descLength)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {purok.leader_name ? (
                                                <div>
                                                    <div className="font-medium truncate">
                                                        {truncateText(purok.leader_name, leaderLength)}
                                                    </div>
                                                    {purok.leader_contact && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            {formatContactNumber(purok.leader_contact)}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {purok.google_maps_url ? (
                                                <a 
                                                    href={purok.google_maps_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                                >
                                                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate">View Map</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm truncate">No map link</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{purok.total_households.toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{purok.total_residents.toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant={getStatusBadgeVariant(purok.status)} 
                                                className="flex items-center gap-1 truncate max-w-full"
                                            >
                                                {getStatusIcon(purok.status)}
                                                <span className="truncate capitalize">
                                                    {purok.status}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {formatDate(purok.created_at)}
                                            </div>
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
                                                        <Link href={`/admin/puroks/${purok.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/puroks/${purok.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Purok</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/residents?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                            <Users className="mr-2 h-4 w-4" />
                                                            <span>View Residents</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/households?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                            <Home className="mr-2 h-4 w-4" />
                                                            <span>View Households</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(purok.name, 'Purok Name')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Name</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {purok.leader_name && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleCopyToClipboard(purok.leader_name, 'Leader Name')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Leader</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {purok.google_maps_url && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleCopyToClipboard(purok.google_maps_url, 'Map Link')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Map Link</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(purok.id)}
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
                                                        <Link href={`/admin/puroks/${purok.id}/print`} className="flex items-center cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => onDelete(purok)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Purok</span>
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