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
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Award,
    Eye,
    Edit,
    Users,
    Copy,
    Trash2,
    Percent,
    Shield,
    IdCard,
    CheckCircle,
    XCircle,
    Calendar,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Clock,
    MoreVertical,
    Square,
    CheckSquare
} from 'lucide-react';

interface DiscountType {
    id: number;
    name: string;
    code: string;
    percentage?: number;
    requires_verification?: boolean;
    requires_id_number?: boolean;
    validity_days?: number;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    created_at: string;
    updated_at: string;
    residents_count?: number;
    active_residents_count?: number;
    discountType?: DiscountType | null;
}

interface PrivilegesGridViewProps {
    privileges: Privilege[];
    isBulkMode: boolean;
    selectedPrivileges: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (privilege: Privilege) => void;
    onToggleStatus: (privilege: Privilege) => void;
    onDuplicate: (privilege: Privilege) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    discountTypes: DiscountType[];
    can: {
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
    windowWidth?: number;
}

// Helper function to get status color
const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

// Truncate text helper
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export default function PrivilegesGridView({
    privileges,
    isBulkMode,
    selectedPrivileges,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleStatus,
    onDuplicate,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    discountTypes,
    can,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: PrivilegesGridViewProps) {
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
    }, [windowWidth]);

    // Get discount type name from discountType relationship
    const getDiscountTypeName = (privilege: Privilege) => {
        return privilege?.discountType?.name || 'N/A';
    };

    // Get discount percentage from discountType relationship
    const getDiscountPercentage = (privilege: Privilege) => {
        return privilege?.discountType?.percentage || 0;
    };

    // Get requires verification from discountType relationship
    const getRequiresVerification = (privilege: Privilege) => {
        return privilege?.discountType?.requires_verification || false;
    };

    // Get requires ID number from discountType relationship
    const getRequiresIdNumber = (privilege: Privilege) => {
        return privilege?.discountType?.requires_id_number || false;
    };

    // Get validity years from discountType relationship
    const getValidityYears = (privilege: Privilege) => {
        const days = privilege?.discountType?.validity_days;
        return days ? Math.floor(days / 365) : null;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyToClipboard = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleCardClick = (privilegeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(privilegeId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedPrivileges), [selectedPrivileges]);

    const emptyState = (
        <EmptyState
            title="No privileges found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a privilege.'}
            icon={<Award className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/privileges/create'}
            createLabel="Create Privilege"
        />
    );

    // Early return for empty state
    if (privileges.length === 0) {
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
            {privileges.map((privilege) => {
                const isSelected = selectedSet.has(privilege.id);
                const isExpanded = expandedId === privilege.id;
                
                const nameLength = isCompactView ? 20 : 30;
                const descriptionLength = isCompactView ? 60 : 120;
                
                return (
                    <Card 
                        key={privilege.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${!privilege.is_active ? 'opacity-60' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(privilege.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(privilege.name, nameLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {privilege.code}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(privilege.id)}
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
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/admin/privileges/${privilege.id}`;
                                            }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            {can.edit && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/admin/privileges/${privilege.id}/edit`;
                                                }}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Privilege
                                                </DropdownMenuItem>
                                            )}

                                            {can.assign && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/admin/privileges/${privilege.id}/assign`;
                                                }}>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Assign to Residents
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStatus(privilege);
                                            }}>
                                                {privilege.is_active ? (
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
                                            
                                            {can.edit && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDuplicate(privilege);
                                                }}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuItem onClick={(e) => handleCopyToClipboard(privilege.code, 'Privilege Code', e)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(privilege.id);
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
                                            
                                            {can.delete && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(privilege);
                                                        }}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Privilege
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(privilege.is_active)}`}
                                >
                                    {privilege.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                {getRequiresVerification(privilege) && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Verification
                                    </Badge>
                                )}
                                
                                {getRequiresIdNumber(privilege) && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                                        <IdCard className="h-3 w-3 mr-1" />
                                        ID Required
                                    </Badge>
                                )}
                            </div>

                            {/* Primary Info - always visible */}
                            <div className="space-y-2 mb-2">
                                {/* Discount Info */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Percent className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        {getDiscountTypeName(privilege)} • {getDiscountPercentage(privilege)}% off
                                    </span>
                                </div>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        {privilege.residents_count || 0} assignments 
                                        {privilege.active_residents_count ? ` (${privilege.active_residents_count} active)` : ''}
                                    </span>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{formatDate(privilege.created_at)}</span>
                                </div>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(privilege.id, e)}
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
                                    {privilege.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400 italic">
                                                "{truncateText(privilege.description, descriptionLength)}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Validity Period */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {getValidityYears(privilege) ? `${getValidityYears(privilege)} year(s)` : 'Lifetime'}
                                        </span>
                                    </div>

                                    {/* Requirements Details */}
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements:</p>
                                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 pl-2">
                                            <li className="flex items-center gap-2">
                                                {getRequiresVerification(privilege) ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-gray-400" />
                                                )}
                                                Verification {getRequiresVerification(privilege) ? 'required' : 'not required'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                {getRequiresIdNumber(privilege) ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-gray-400" />
                                                )}
                                                ID Number {getRequiresIdNumber(privilege) ? 'required' : 'not required'}
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatDateTime(privilege.updated_at)}
                                        </span>
                                    </div>

                                    {/* View full details link and collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/admin/privileges/${privilege.id}`;
                                            }}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(privilege.id, e)}
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