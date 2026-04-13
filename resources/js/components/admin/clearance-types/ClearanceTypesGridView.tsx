// components/admin/clearance-types/ClearanceTypesGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    CheckCircle,
    Calendar,
    Users,
    MoreVertical,
    Copy,
    FileText,
    DollarSign,
    Shield,
    Globe,
    XCircle,
    Eye,
    Edit,
    Printer,
    Trash2,
    CreditCard,
    Timer,
    FileSpreadsheet,
    CheckSquare,
    Square,
    Lock,
    Unlock,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo, useCallback, useEffect } from 'react';

// Import types and utilities
import { 
    ClearanceType, 
    getStatusBadgeVariant,
    formatClearanceTypeDate as formatDate,
    truncateText
} from '@/types/admin/clearance-types/clearance-types';

interface ClearanceTypesGridViewProps {
    clearanceTypes: ClearanceType[];
    isBulkMode: boolean;
    selectedTypes: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (type: ClearanceType) => void;
    onToggleStatus?: (type: ClearanceType) => void;
    onToggleDiscountable?: (type: ClearanceType) => void;
    onDuplicate?: (type: ClearanceType) => void;
    onViewPhoto: (type: ClearanceType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    getPurposeOptionsCount: (type: ClearanceType) => number;
    getTruncationLength: (type: 'name' | 'description' | 'code') => number;
    windowWidth?: number;
}

export default function ClearanceTypesGridView({
    clearanceTypes,
    isBulkMode,
    selectedTypes,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onToggleDiscountable,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    getPurposeOptionsCount: getPurposeCount,
    getTruncationLength,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: ClearanceTypesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <CheckCircle className="h-3 w-3" /> : 
            <XCircle className="h-3 w-3" />;
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    const getDiscountableIcon = (isDiscountable: boolean) => {
        return isDiscountable ? 
            <Unlock className="h-3 w-3" /> : 
            <Lock className="h-3 w-3" />;
    };

    const getDiscountableColor = (isDiscountable: boolean): string => {
        return isDiscountable 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (typeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(typeId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);

    const emptyState = (
        <EmptyState
            title="No clearance types found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a clearance type.'}
            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = route('admin.clearance-types.create')}
            createLabel="Create Clearance Type"
        />
    );

    // Early return for empty state
    if (clearanceTypes.length === 0) {
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
            {clearanceTypes.map((type) => {
                const nameLength = getTruncationLength('name');
                const descLength = getTruncationLength('description');
                const codeLength = getTruncationLength('code');
                const isSelected = selectedSet.has(type.id);
                const isExpanded = expandedId === type.id;
                
                return (
                    <Card 
                        key={type.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(type.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        type.is_active 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        <FileText className={`h-5 w-5 ${
                                            type.is_active 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate" title={type.name}>
                                            {truncateText(type.name, nameLength)}
                                        </div>
                                        <code className="text-xs text-gray-500 dark:text-gray-400 truncate block" title={type.code}>
                                            {truncateText(type.code, codeLength)}
                                        </code>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(type.id)}
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
                                                <Link href={route('admin.clearance-types.show', type.id)} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.clearance-types.edit', type.id)} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Type
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.clearances.create', { type: type.id })} className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Issue Clearance
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(type.code, 'Clearance Type Code');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(type.name, 'Clearance Type Name');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.clearance-types.print', type.id)} className="flex items-center">
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Print Details
                                                </Link>
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(type.id);
                                                    }}>
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
                                            
                                            {onDuplicate && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDuplicate(type);
                                                }}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate Type
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {onToggleStatus && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(type);
                                                }}>
                                                    {type.is_active ? (
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
                                            
                                            {onToggleDiscountable && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleDiscountable(type);
                                                }}>
                                                    {type.is_discountable ? (
                                                        <>
                                                            <Lock className="h-4 w-4 mr-2" />
                                                            Mark Non-Discountable
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock className="h-4 w-4 mr-2" />
                                                            Mark Discountable
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(type);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Type
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(type.is_active)}`}
                                >
                                    {getStatusIcon(type.is_active)}
                                    <span className="ml-1">{type.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>
                                
                                <Badge 
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 ${getDiscountableColor(type.is_discountable)}`}
                                >
                                    {getDiscountableIcon(type.is_discountable)}
                                    <span className="ml-1">{type.is_discountable ? 'Discountable' : 'Non-Discountable'}</span>
                                </Badge>
                            </div>

                            {/* Description */}
                            {type.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" title={type.description}>
                                    {truncateText(type.description, descLength)}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <CreditCard className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {type.formatted_fee}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Timer className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        <span>{type.processing_days} days processing</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                        <span>{type.validity_days} days validity</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {type.clearances_count || 0} issued
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Badges */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {type.requires_payment && (
                                    <Badge variant="outline" className="text-xs">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Paid
                                    </Badge>
                                )}
                                {type.requires_approval && (
                                    <Badge variant="outline" className="text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Approval
                                    </Badge>
                                )}
                                {type.is_online_only && (
                                    <Badge variant="outline" className="text-xs">
                                        <Globe className="h-3 w-3 mr-1" />
                                        Online
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {type.document_types_count || 0} docs
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    {getPurposeCount(type)} purposes
                                </Badge>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(type.id, e)}
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
                                    {/* Additional Info */}
                                    {type.remarks && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {type.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(type.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(type.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <Link
                                            href={route('admin.clearances.create', { type: type.id })}
                                            className="flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1">
                                                <FileSpreadsheet className="h-3 w-3" />
                                                Issue Clearance
                                            </button>
                                        </Link>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('admin.clearance-types.show', type.id)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(type.id, e)}
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