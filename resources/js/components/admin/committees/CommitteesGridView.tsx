// components/admin/committees/CommitteesGridView.tsx

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
    Target,
    Users,
    Eye,
    Edit,
    Trash2,
    Copy,
    Calendar,
    CheckCircle,
    XCircle,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Square,
    CheckSquare,
} from 'lucide-react';
import { Committee } from '@/types/admin/committees/committees';
import { truncateText } from '@/lib/committeeutils';
import { useState, useMemo, useCallback, useEffect } from 'react';

interface CommitteesGridViewProps {
    committees: Committee[];
    selectedIds: number[];
    isBulkMode: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (committee: Committee) => void;
    onToggleStatus?: (committee: Committee) => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onCopyToClipboard: (text: string, label: string) => void;
    windowWidth?: number;
}

export function CommitteesGridView({
    committees,
    selectedIds,
    isBulkMode,
    onItemSelect,
    onDelete,
    onToggleStatus,
    isMobile,
    hasActiveFilters,
    onClearFilters,
    onCopyToClipboard,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: CommitteesGridViewProps) {
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

    const formatDate = (dateString: string) => {
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
    const handleCardClick = (committeeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(committeeId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const emptyState = (
        <EmptyState
            title="No committees found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a committee.'}
            icon={<Target className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/committees/create'}
            createLabel="Create Committee"
        />
    );

    // Early return for empty state
    if (committees.length === 0) {
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
            {committees.map((committee) => {
                const isSelected = selectedSet.has(committee.id);
                const isExpanded = expandedId === committee.id;
                const hasPositions = (committee.positions_count || 0) > 0;
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 25;
                const descriptionLength = isCompactView ? 60 : 80;
                
                return (
                    <Card 
                        key={committee.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(committee.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        hasPositions 
                                            ? 'bg-purple-100 dark:bg-purple-900/30' 
                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        <Target className={`h-5 w-5 ${
                                            hasPositions 
                                                ? 'text-purple-600 dark:text-purple-400' 
                                                : 'text-blue-600 dark:text-blue-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(committee.name, nameLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Code: {committee.code}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(committee.id)}
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
                                                <Link href={`/admin/committees/${committee.id}`} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/committees/${committee.id}/edit`} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Committee
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            {onToggleStatus && (
                                                <DropdownMenuItem onClick={() => onToggleStatus(committee)}>
                                                    {committee.is_active ? (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/positions?committee_id=${committee.id}`} className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    View Positions
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(committee.name, 'Committee Name')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(committee.code, 'Committee Code')}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(committee.id)}>
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
                                                onClick={() => onDelete(committee)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Committee
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${
                                        committee.is_active 
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                    }`}
                                >
                                    {committee.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                {hasPositions && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Users className="h-3 w-3 mr-1" />
                                        Has Positions
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Positions</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {committee.positions_count || 0}
                                    </div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <Target className="h-3.5 w-3.5" />
                                        <span>Order</span>
                                    </div>
                                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {committee.order ?? '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {formatDate(committee.created_at)}</span>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(committee.id, e)}
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
                                    {committee.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {truncateText(committee.description, descriptionLength)}
                                            </p>
                                        </div>
                                    )}

                                    {/* View Positions Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        asChild
                                    >
                                        <Link href={`/admin/positions?committee_id=${committee.id}`}>
                                            <Users className="h-3 w-3 mr-1" />
                                            View Positions ({committee.positions_count || 0})
                                        </Link>
                                    </Button>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={`/admin/committees/${committee.id}`}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(committee.id, e)}
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