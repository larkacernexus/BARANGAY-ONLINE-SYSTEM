// resources/js/components/admin/blotters/BlottersTableView.tsx

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
    Scale,
    MoreVertical,
    Eye,
    Edit,
    User,
    MapPin,
    Copy,
    Printer,
    Trash2,
    CheckSquare,
    Square,
    ExternalLink,
    Phone,
    Clock,
    AlertCircle,
    CheckCircle,
    Archive,
    FileText
} from 'lucide-react';
import { Blotter, BlotterFilters } from '@/components/admin/blotters/blotter';
import { blotterUtils } from '@/admin-utils/blotter-utils';
import { JSX } from 'react';

interface BlottersTableViewProps {
    blotters: Blotter[];
    isBulkMode: boolean;
    selectedBlotters: number[];
    isMobile: boolean;
    filtersState: BlotterFilters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (blotter: Blotter) => void;
    selectionStats: any;
    getSortIcon: (column: string) => string | null;
}

export default function BlottersTableView({
    blotters,
    isBulkMode,
    selectedBlotters,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    selectionStats,
    getSortIcon
}: BlottersTableViewProps) {
    const getTruncationLength = (type: 'number' | 'type' | 'location' | 'reporter' | 'respondent' = 'type'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'number': return 12;
                case 'type': return 15;
                case 'location': return 20;
                case 'reporter': return 12;
                case 'respondent': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'number': return 15;
                case 'type': return 20;
                case 'location': return 25;
                case 'reporter': return 15;
                case 'respondent': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'number': return 18;
                case 'type': return 25;
                case 'location': return 30;
                case 'reporter': return 18;
                case 'respondent': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'number': return 20;
            case 'type': return 30;
            case 'location': return 35;
            case 'reporter': return 20;
            case 'respondent': return 20;
            default: return 30;
        }
    };

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'pending': 'default',
            'investigating': 'secondary',
            'resolved': 'default',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const getStatusBadgeClass = (status: string): string => {
        const classes: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'investigating': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getPriorityBadgeClass = (priority: string): string => {
        const classes: Record<string, string> = {
            'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return classes[priority.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getPriorityIcon = (priority: string) => {
        switch(priority) {
            case 'urgent': return <AlertCircle className="h-3 w-3" />;
            case 'high': return <AlertCircle className="h-3 w-3" />;
            case 'medium': return <Clock className="h-3 w-3" />;
            case 'low': return <CheckCircle className="h-3 w-3" />;
            default: return null;
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'investigating': return <AlertCircle className="h-3 w-3" />;
            case 'resolved': return <CheckCircle className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                                                checked={selectedBlotters.length === blotters.length && blotters.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedBlotters.length === blotters.length) {
                                                        blotters.forEach(b => onItemSelect(b.id));
                                                    } else {
                                                        blotters.forEach(b => {
                                                            if (!selectedBlotters.includes(b.id)) {
                                                                onItemSelect(b.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('blotter_number')}
                                >
                                    <div className="flex items-center gap-1">
                                        Blotter #
                                        {getSortIcon('blotter_number')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('incident_type')}
                                >
                                    <div className="flex items-center gap-1">
                                        Incident Type
                                        {getSortIcon('incident_type')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('incident_datetime')}
                                >
                                    <div className="flex items-center gap-1">
                                        Date & Time
                                        {getSortIcon('incident_datetime')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                    Location
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('reporter_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Reporter
                                        {getSortIcon('reporter_name')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                    Respondent
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
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('priority')}
                                >
                                    <div className="flex items-center gap-1">
                                        Priority
                                        {getSortIcon('priority')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {blotters.map((blotter) => {
                                const numberLength = getTruncationLength('number');
                                const typeLength = getTruncationLength('type');
                                const locationLength = getTruncationLength('location');
                                const reporterLength = getTruncationLength('reporter');
                                const respondentLength = getTruncationLength('respondent');
                                const isSelected = selectedBlotters.includes(blotter.id);
                                
                                return (
                                    <TableRow 
                                        key={blotter.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500' : ''
                                        }`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(blotter.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(blotter.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Scale className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {truncateText(blotter.blotter_number, numberLength)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                        ID: {blotter.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium truncate">
                                                {truncateText(blotter.incident_type, typeLength)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                {blotter.incident_type_code || ''}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="text-sm truncate">
                                                {formatDateTime(blotter.incident_datetime)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                {formatDate(blotter.incident_datetime)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm">
                                                        {truncateText(blotter.location, locationLength)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {blotter.barangay}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm">
                                                        {truncateText(blotter.reporter_name, reporterLength)}
                                                    </div>
                                                    {blotter.reporter_contact && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                            <Phone className="h-2.5 w-2.5" />
                                                            {blotter.reporter_contact}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {blotter.respondent_name ? (
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm">
                                                        {truncateText(blotter.respondent_name, respondentLength)}
                                                    </div>
                                                    {blotter.respondent_address && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {truncateText(blotter.respondent_address, 20)}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Not specified</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant={getStatusBadgeVariant(blotter.status)} 
                                                className={`flex items-center gap-1 truncate max-w-full ${getStatusBadgeClass(blotter.status)}`}
                                            >
                                                {getStatusIcon(blotter.status)}
                                                <span className="truncate capitalize">
                                                    {blotter.status}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                className={`flex items-center gap-1 truncate max-w-full ${getPriorityBadgeClass(blotter.priority)}`}
                                            >
                                                {getPriorityIcon(blotter.priority)}
                                                <span className="truncate capitalize">
                                                    {blotter.priority}
                                                </span>
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
                                                        <Link href={`/admin/blotters/${blotter.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/blotters/${blotter.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Blotter</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(blotter.blotter_number, 'Blotter Number')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Blotter #</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(blotter.reporter_name, 'Reporter Name')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Reporter</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {blotter.respondent_name && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleCopyToClipboard(blotter.respondent_name, 'Respondent Name')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Respondent</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {blotter.attachments && blotter.attachments.length > 0 && (
                                                        <DropdownMenuItem 
                                                            onClick={() => window.open(`/admin/blotters/${blotter.id}/attachments`, '_blank')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            <span>View Attachments</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(blotter.id)}
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
                                                        <Link href={`/admin/blotters/${blotter.id}/print`} className="flex items-center cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => onDelete(blotter)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Blotter</span>
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