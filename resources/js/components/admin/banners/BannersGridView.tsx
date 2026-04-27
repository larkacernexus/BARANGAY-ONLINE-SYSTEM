// resources/js/components/admin/banners/BannersGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
    Image,
    Eye,
    Edit,
    Users,
    Calendar,
    Copy,
    Trash2,
    ExternalLink,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Banner } from '@/types/admin/banners/banner';
import { useState, useMemo, useCallback, useEffect } from 'react';

interface BannersGridViewProps {
    banners: Banner[];
    isBulkMode: boolean;
    selectedBanners: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (banner: Banner) => void;
    onToggleActive: (banner: Banner) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    windowWidth?: number;
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

export default function BannersGridView({
    banners,
    isBulkMode,
    selectedBanners,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleActive,
    hasActiveFilters,
    onClearFilters,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: BannersGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    
    // Determine grid columns
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop: 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth]);

    const truncateText = (text: string, maxLength: number = 30): string => {
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

    const handleCopyToClipboard = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label}: ${text}`);
        }).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    };

    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleCardClick = (bannerId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(bannerId, e);
    };

    const selectedSet = useMemo(() => new Set(selectedBanners), [selectedBanners]);

    const emptyState = (
        <EmptyState
            title="No banners found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a banner.'}
            icon={<Image className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/banners/create'}
            createLabel="Create Banner"
        />
    );

    if (banners.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {banners.map((banner) => {
                const isSelected = selectedSet.has(banner.id);
                const isExpanded = expandedId === banner.id;
                
                return (
                    <Card 
                        key={banner.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(banner.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Image Header */}
                            <div className="relative mb-3">
                                {banner.image_url ? (
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title}
                                        className="w-full h-32 object-cover rounded-lg border dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 flex items-center justify-center">
                                        <Image className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                
                                {/* Status Badge Overlay */}
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(banner.status)}
                                </div>
                                
                                {/* Bulk Mode Checkbox Overlay */}
                                {isBulkMode && (
                                    <div className="absolute top-2 left-2">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(banner.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                                    {truncateText(banner.title, 30)}
                                </h3>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/banners/${banner.id}`} className="flex items-center">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/banners/${banner.id}/edit`} className="flex items-center">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Banner
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        {banner.link_url && (
                                            <DropdownMenuItem asChild>
                                                <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Preview Link
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem onClick={(e) => handleCopyToClipboard(banner.title, 'Banner Title', e)}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Title
                                        </DropdownMenuItem>
                                        
                                        {banner.link_url && (
                                            <DropdownMenuItem onClick={(e) => handleCopyToClipboard(banner.link_url!, 'Link URL', e)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Link URL
                                            </DropdownMenuItem>
                                        )}

                                        {isBulkMode && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onItemSelect(banner.id)}>
                                                    {isSelected ? (
                                                        <>
                                                            <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                            <span className="text-green-600">Deselect</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Square className="h-4 w-4 mr-2" />
                                                            Select for Bulk
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            className="text-red-600 dark:text-red-400"
                                            onClick={() => onDelete(banner)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Banner
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Description */}
                            {banner.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                    {truncateText(banner.description, 80)}
                                </p>
                            )}

                            {/* Button Text */}
                            {banner.button_text && (
                                <div className="mb-3">
                                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                        Button: {banner.button_text}
                                    </Badge>
                                </div>
                            )}

                            {/* Audience & Schedule Info */}
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {audienceLabels[banner.target_audience] || banner.target_audience}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {banner.start_date || banner.end_date ? (
                                            `${formatDate(banner.start_date)} → ${formatDate(banner.end_date)}`
                                        ) : (
                                            'Always active'
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Order & Active Toggle */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Order: <span className="font-medium text-gray-700 dark:text-gray-300">{banner.sort_order}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                                    <Switch
                                        checked={banner.is_active}
                                        onCheckedChange={() => onToggleActive(banner)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(banner.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Full Description */}
                                    {banner.description && banner.description.length > 80 && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {banner.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Mobile Image Preview */}
                                    {banner.mobile_image_url && banner.mobile_image_url !== banner.image_url && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Image:</p>
                                            <img
                                                src={banner.mobile_image_url}
                                                alt={`${banner.title} - Mobile`}
                                                className="h-24 w-auto object-cover rounded-md border dark:border-gray-700"
                                            />
                                        </div>
                                    )}

                                    {/* Link URL */}
                                    {banner.link_url && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL:</p>
                                            <a 
                                                href={banner.link_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {banner.link_url}
                                            </a>
                                        </div>
                                    )}

                                    {/* Created Info */}
                                    {banner.creator && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                                            Created by: {banner.creator.first_name} {banner.creator.last_name}
                                            <br />
                                            on {formatDate(banner.created_at)}
                                        </div>
                                    )}

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/admin/banners/${banner.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(banner.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}