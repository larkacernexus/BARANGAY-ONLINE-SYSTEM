// resources/js/components/admin/positions/PositionsGridView.tsx

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
    Shield,
    Eye,
    Edit,
    Users,
    TargetIcon,
    Copy,
    Trash2,
    Key,
    Calendar,
    Crown,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Square,
    CheckSquare,
} from 'lucide-react';
import { Position } from '@/types/admin/positions/position.types';
import { useState, useMemo, useCallback, useEffect } from 'react';

interface PositionsGridViewProps {
    positions: Position[];
    isBulkMode: boolean;
    selectedPositions: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (position: Position) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats?: any;
    onCopyToClipboard?: (text: string, label: string) => void;
    windowWidth?: number;
}

export default function PositionsGridView({
    positions,
    isBulkMode,
    selectedPositions,
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
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: PositionsGridViewProps) {
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
    
    // Helper functions
    const truncateText = (text: string, length: number): string => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    const isKagawad = (name: string, code: string) => {
        return name?.toLowerCase().includes('kagawad') || code?.toLowerCase().includes('kagawad');
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (positionId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(positionId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedPositions), [selectedPositions]);

    const emptyState = (
        <EmptyState
            title="No positions found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a position.'}
            icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/positions/create'}
            createLabel="Create Position"
        />
    );

    // Early return for empty state
    if (positions.length === 0) {
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
            {positions.map((position) => {
                const isSelected = selectedSet.has(position.id);
                const isExpanded = expandedId === position.id;
                const isKagawadPos = isKagawad(position.name, position.code);
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 25;
                const descriptionLength = isCompactView ? 60 : 80;
                
                return (
                    <Card 
                        key={position.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(position.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        isKagawadPos 
                                            ? 'bg-amber-100 dark:bg-amber-900/30' 
                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        {isKagawadPos ? (
                                            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(position.name, nameLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Code: {position.code}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(position.id)}
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
                                                <Link href={`/admin/positions/${position.id}`} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/positions/${position.id}/edit`} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Position
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/officials?position_id=${position.id}`} className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    View Officials
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(position.name, 'Position Name')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(position.code, 'Position Code')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(position.id)}>
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
                                                onClick={() => onDelete(position)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Position
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(position.is_active)}`}
                                >
                                    {position.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                {isKagawadPos && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Kagawad
                                    </Badge>
                                )}
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${
                                        position.requires_account 
                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {position.requires_account && <Key className="h-3 w-3 mr-1" />}
                                    {position.requires_account ? 'Account' : 'No Account'}
                                </Badge>
                            </div>

                            {/* Committee Info */}
                            {position.committee && (
                                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Committee</div>
                                    <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                                        <TargetIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                        <span className="truncate">{position.committee.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Officials</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {position.officials_count ?? 0}
                                    </div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <Crown className="h-3.5 w-3.5" />
                                        <span>Order</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {position.order ?? '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {formatDate(position.created_at)}</span>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(position.id, e)}
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
                                    {position.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {truncateText(position.description, descriptionLength)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Responsibilities */}
                                    {position.responsibilities && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities:</p>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {position.responsibilities}
                                            </p>
                                        </div>
                                    )}

                                    {/* View Officials Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        asChild
                                    >
                                        <Link href={`/admin/officials?position_id=${position.id}`}>
                                            <Users className="h-3 w-3 mr-1" />
                                            View Officials ({position.officials_count ?? 0})
                                        </Link>
                                    </Button>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/admin/positions/${position.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(position.id, e)}
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