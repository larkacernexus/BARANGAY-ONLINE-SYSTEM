// components/admin/fee-types/FeeTypesGridView.tsx

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
    MoreVertical,
    Copy,
    Clipboard,
    Eye,
    Edit,
    Trash2,
    DollarSign,
    Calendar,
    Users,
    Clock,
    CreditCard,
    Tag,
    AlertCircle,
    CheckCircle,
    XCircle,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo, useCallback, useEffect } from 'react';

// Import shared types
import { FeeType, CategoryDetails } from '@/types/admin/fee-types/fee.types';

interface FeeTypesGridViewProps {
    feeTypes: FeeType[];
    isBulkMode: boolean;
    selectedFeeTypes: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (feeType: FeeType) => void;
    onToggleStatus?: (feeType: FeeType) => void;
    onDuplicate?: (feeType: FeeType) => void;
    onViewPhoto: (feeType: FeeType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    getCategoryDetails: (feeType: FeeType) => CategoryDetails;
    formatCurrency: (amount: any) => string;
    formatDate: (dateString: string) => string;
    windowWidth?: number;
}

export default function FeeTypesGridView({
    feeTypes,
    isBulkMode,
    selectedFeeTypes,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    getCategoryDetails,
    formatCurrency,
    formatDate,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: FeeTypesGridViewProps) {
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
    
    const getStatusColor = (isActive: boolean): string => {
        return isActive 
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
    const selectedSet = useMemo(() => new Set(selectedFeeTypes), [selectedFeeTypes]);

    const emptyState = (
        <EmptyState
            title="No fee types found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a fee type.'}
            icon={<DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = route('admin.fee-types.create')}
            createLabel="Create Fee Type"
        />
    );

    // Early return for empty state
    if (feeTypes.length === 0) {
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
            {feeTypes.map((feeType) => {
                const categoryDetails = getCategoryDetails(feeType);
                const isSelected = selectedSet.has(feeType.id);
                const isExpanded = expandedId === feeType.id;
                
                return (
                    <Card 
                        key={feeType.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(feeType.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        feeType.is_active 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        <DollarSign className={`h-5 w-5 ${
                                            feeType.is_active 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono font-medium text-sm text-gray-500 dark:text-gray-400">
                                            {feeType.code || 'N/A'}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={feeType.name}>
                                            {feeType.name || 'Unnamed'}
                                        </h3>
                                        {feeType.short_name && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {feeType.short_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(feeType.id)}
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
                                                <Link href={route('admin.fee-types.show', feeType.id)} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.fee-types.edit', feeType.id)} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Fee Type
                                                </Link>
                                            </DropdownMenuItem>

                                            {onDuplicate && (
                                                <DropdownMenuItem onClick={() => onDuplicate(feeType)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(feeType.code || '', 'Fee Type Code')}>
                                                <Clipboard className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.fees.index', { fee_type: feeType.id })} className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                    View Fees
                                                </Link>
                                            </DropdownMenuItem>

                                            {onToggleStatus && (
                                                <DropdownMenuItem onClick={() => onToggleStatus(feeType)}>
                                                    {feeType.is_active ? (
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

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(feeType.id)}>
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
                                                onClick={() => onDelete(feeType)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Fee Type
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(feeType.is_active)}`}
                                >
                                    {feeType.is_active ? 
                                        <CheckCircle className="h-3 w-3 mr-1" /> : 
                                        <XCircle className="h-3 w-3 mr-1" />
                                    }
                                    {feeType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            {/* Description */}
                            {feeType.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" title={feeType.description}>
                                    {feeType.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <CreditCard className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(feeType.base_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Tag className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        <span>{categoryDetails.name}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                        <span className="capitalize">
                                            {(feeType.frequency || 'one_time').replace('_', ' ')}
                                        </span>
                                    </div>
                                    {feeType.validity_days && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                            <span>{feeType.validity_days} days</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="outline" className={`text-xs ${categoryDetails.bgColor} ${categoryDetails.textColor} ${categoryDetails.borderColor}`}>
                                    {categoryDetails.icon}
                                    <span className="ml-1">{categoryDetails.name}</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                    {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                </Badge>
                                {feeType.is_mandatory && (
                                    <Badge variant="outline" className="text-xs text-red-600 border-red-200 dark:text-red-400 dark:border-red-800">
                                        Mandatory
                                    </Badge>
                                )}
                                {feeType.auto_generate && (
                                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                                        Auto-gen
                                    </Badge>
                                )}
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(feeType.id, e)}
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
                                    {feeType.remarks && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {feeType.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(feeType.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(feeType.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <Link
                                            href={route('admin.fees.index', { fee_type: feeType.id })}
                                            className="flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                View Associated Fees
                                            </button>
                                        </Link>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('admin.fee-types.show', feeType.id)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(feeType.id, e)}
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