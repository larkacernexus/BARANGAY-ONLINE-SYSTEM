// resources/js/components/admin/puroks/PuroksGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    MapPin,
    Eye,
    Edit,
    Users,
    Home,
    Copy,
    Trash2,
    ExternalLink,
    Phone,
    Calendar,
    UsersIcon,
    MoreVertical,
    Printer,
    Map,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Purok } from '@/types/admin/puroks/purok';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { JSX } from 'react';

interface PuroksGridViewProps {
    puroks: Purok[];
    isBulkMode: boolean;
    selectedPuroks: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (purok: Purok) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats?: any;
    onCopyToClipboard?: (text: string, label: string) => void;
    onViewOnMap?: (purok: Purok) => void;
    windowWidth?: number;
}

export default function PuroksGridView({
    puroks,
    isBulkMode,
    selectedPuroks,
    isMobile,
    onItemSelect,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats = {},
    onCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label}: ${text}`);
        }).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    },
    onViewOnMap,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: PuroksGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    const isCompactView = isMobile;
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusColor = (status: string): string => {
        const classes: Record<string, string> = {
            'active': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'inactive': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            'archived': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
        };
        return classes[status.toLowerCase()] || classes.inactive;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (purokId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(purokId, e);
    };

    const handleViewOnMap = (purok: Purok) => {
        if (onViewOnMap) {
            onViewOnMap(purok);
        } else if (purok.google_maps_url) {
            window.open(purok.google_maps_url, '_blank', 'noopener,noreferrer');
        }
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedPuroks), [selectedPuroks]);

    const emptyState = (
        <EmptyState
            title="No puroks found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a purok.'}
            icon={<MapPin className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/puroks/create'}
            createLabel="Create Purok"
        />
    );

    // Early return for empty state
    if (puroks.length === 0) {
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
            {puroks.map((purok) => {
                const isSelected = selectedSet.has(purok.id);
                const isExpanded = expandedId === purok.id;
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 25;
                const descriptionLength = isCompactView ? 60 : 80;
                const leaderNameLength = isCompactView ? 15 : 20;
                
                return (
                    <Card 
                        key={purok.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(purok.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(purok.name, nameLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: #{purok.id}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(purok.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/puroks/${purok.id}`} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/puroks/${purok.id}/edit`} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Purok
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            {purok.google_maps_url && (
                                                <DropdownMenuItem onClick={() => handleViewOnMap(purok)}>
                                                    <Map className="h-4 w-4 mr-2" />
                                                    View on Map
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/residents?purok_id=${purok.id}`} className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    View Residents
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/households?purok_id=${purok.id}`} className="flex items-center">
                                                    <Home className="h-4 w-4 mr-2" />
                                                    View Households
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(purok.name, 'Purok Name')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            
                                            {purok.leader_name && (
                                                <DropdownMenuItem onClick={() => onCopyToClipboard(purok.leader_name, 'Leader Name')}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Leader
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {purok.google_maps_url && (
                                                <DropdownMenuItem onClick={() => onCopyToClipboard(purok.google_maps_url, 'Map Link')}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Map Link
                                                </DropdownMenuItem>
                                            )}

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(purok.id)}>
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
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/puroks/${purok.id}/print`} className="flex items-center">
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Print Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400"
                                                onClick={() => onDelete(purok)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Purok
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(purok.status)}`}
                                >
                                    {purok.status}
                                </Badge>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <Home className="h-3.5 w-3.5" />
                                        <span>Households</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {(purok.total_households ?? 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <UsersIcon className="h-3.5 w-3.5" />
                                        <span>Residents</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {(purok.total_residents ?? 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Leader Info */}
                            {purok.leader_name && (
                                <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Leader</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {truncateText(purok.leader_name, leaderNameLength)}
                                    </div>
                                    {purok.leader_contact && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <Phone className="h-3 w-3" />
                                            {truncateText(purok.leader_contact, 15)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {formatDate(purok.created_at)}</span>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(purok.id, e)}
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
                                    {/* Description */}
                                    {purok.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {truncateText(purok.description, descriptionLength)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Map Link */}
                                    {purok.google_maps_url && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Location:</p>
                                            <button
                                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                onClick={() => handleViewOnMap(purok)}
                                            >
                                                <Map className="h-4 w-4" />
                                                View on Google Maps
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Quick Links */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            asChild
                                        >
                                            <Link href={`/residents?purok_id=${purok.id}`}>
                                                <Users className="h-3 w-3 mr-1" />
                                                Residents
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                            asChild
                                        >
                                            <Link href={`/households?purok_id=${purok.id}`}>
                                                <Home className="h-3 w-3 mr-1" />
                                                Households
                                            </Link>
                                        </Button>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/admin/puroks/${purok.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(purok.id, e)}
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