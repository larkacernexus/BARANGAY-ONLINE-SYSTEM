// resources/js/components/admin/banners/BannersTableView.tsx

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
import { Switch } from '@/components/ui/switch';
import { Link } from '@inertiajs/react';
import { 
    Image,
    MoreVertical,
    Eye,
    Edit,
    Users,
    Calendar,
    Copy,
    Trash2,
    CheckSquare,
    Square,
    ExternalLink,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ArrowUpDown
} from 'lucide-react';
import { Banner, BannerFilters } from '@/types/admin/banners/banner';
import { JSX } from 'react';

interface BannersTableViewProps {
    banners: Banner[];
    isBulkMode: boolean;
    selectedBanners: number[];
    isMobile: boolean;
    filtersState: BannerFilters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    onDelete: (banner: Banner) => void;
    onToggleActive: (banner: Banner) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    getSortIcon: (column: string) => React.ReactNode;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', icon: CheckCircle },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', icon: Clock },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', icon: AlertCircle },
    inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: XCircle },
};

const audienceLabels: Record<string, string> = {
    all: 'All Users',
    residents: 'All Residents',
    puroks: 'Specific Puroks',
};

export default function BannersTableView({
    banners,
    isBulkMode,
    selectedBanners,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    onDelete,
    onToggleActive,
    hasActiveFilters,
    onClearFilters,
    getSortIcon
}: BannersTableViewProps) {
    
    const truncateText = (text: string, maxLength: number = 50): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || statusConfig.inactive;
        const Icon = config.icon;
        return (
            <Badge className={`gap-1 ${config.color}`} variant="outline">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label}: ${text}`);
        }).catch(() => {
            console.error(`Failed to copy ${label}`);
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
                                                checked={selectedBanners.length === banners.length && banners.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedBanners.length === banners.length) {
                                                        banners.forEach(b => onItemSelect(b.id));
                                                    } else {
                                                        banners.forEach(b => {
                                                            if (!selectedBanners.includes(b.id)) {
                                                                onItemSelect(b.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                                    Image
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('title')}
                                >
                                    <div className="flex items-center gap-1">
                                        Title
                                        <span className="ml-1">{getSortIcon('title')}</span>
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <span className="ml-1">{getSortIcon('status')}</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Audience
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                    Schedule
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('sort_order')}
                                >
                                    <div className="flex items-center gap-1">
                                        Order
                                        <span className="ml-1">{getSortIcon('sort_order')}</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                    Active
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {banners.map((banner) => {
                                const isSelected = selectedBanners.includes(banner.id);
                                
                                return (
                                    <TableRow 
                                        key={banner.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(banner.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(banner.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3">
                                            {banner.image_url ? (
                                                <img
                                                    src={banner.image_url}
                                                    alt={banner.title}
                                                    className="h-12 w-20 object-cover rounded-md border dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="h-12 w-20 bg-gray-100 dark:bg-gray-800 rounded-md border dark:border-gray-700 flex items-center justify-center">
                                                    <Image className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {truncateText(banner.title, 40)}
                                                </p>
                                                {banner.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                        {truncateText(banner.description, 60)}
                                                    </p>
                                                )}
                                                {banner.button_text && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        Button: {banner.button_text}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {getStatusBadge(banner.status)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">
                                                    {audienceLabels[banner.target_audience] || banner.target_audience}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {banner.start_date || banner.end_date ? (
                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {formatDate(banner.start_date)}
                                                        {' → '}
                                                        {formatDate(banner.end_date)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-500">Always active</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <span className="text-sm font-medium dark:text-gray-300">{banner.sort_order}</span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Switch
                                                checked={banner.is_active}
                                                onCheckedChange={() => onToggleActive(banner)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="data-[state=checked]:bg-green-600"
                                            />
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
                                                        <Link href={`/admin/banners/${banner.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/banners/${banner.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Banner</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    {banner.link_url && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                <span>Preview Link</span>
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(banner.title, 'Banner Title')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Title</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {banner.link_url && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleCopyToClipboard(banner.link_url!, 'Link URL')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Link URL</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(banner.id)}
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
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                        onClick={() => onDelete(banner)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Banner</span>
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