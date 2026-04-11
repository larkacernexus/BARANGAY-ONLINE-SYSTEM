import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
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
    UserCheck,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Clock
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
    // ✅ FIXED: Use discountType relationship instead of direct fields
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
}

// Helper function to get status color
const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
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
    can
}: PrivilegesGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    const isCompactView = isMobile;

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // ✅ FIXED: Get discount type name from discountType relationship
    const getDiscountTypeName = (privilege: Privilege) => {
        return privilege?.discountType?.name || 'N/A';
    };

    // ✅ FIXED: Get discount percentage from discountType relationship
    const getDiscountPercentage = (privilege: Privilege) => {
        return privilege?.discountType?.percentage || 0;
    };

    // ✅ FIXED: Get requires verification from discountType relationship
    const getRequiresVerification = (privilege: Privilege) => {
        return privilege?.discountType?.requires_verification || false;
    };

    // ✅ FIXED: Get requires ID number from discountType relationship
    const getRequiresIdNumber = (privilege: Privilege) => {
        return privilege?.discountType?.requires_id_number || false;
    };

    // ✅ FIXED: Get validity years from discountType relationship
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
        navigator.clipboard.writeText(text).then(() => {
            // Toast would be handled by parent
        }).catch(() => {
            // Toast would be handled by parent
        });
    };

    const toggleCardExpansion = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleCardClick = (privilegeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(privilegeId);
    };

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

    return (
        <GridLayout
            isEmpty={privileges.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {privileges.map((privilege) => {
                const isSelected = selectedPrivileges.includes(privilege.id);
                const isExpanded = expandedCards.has(privilege.id);
                
                const nameLength = isCompactView ? 20 : 30;
                const descriptionLength = isCompactView ? 60 : 120;
                
                return (
                    <Card 
                        key={privilege.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(privilege.id, e)}
                    >
                        {/* Bulk selection checkbox */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(privilege.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(privilege.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}

                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with icon and status */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex-shrink-0">
                                        <Award className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`Privilege Code: ${privilege.code}`}
                                        onClick={(e) => handleCopyToClipboard(privilege.code, 'Privilege Code', e)}
                                    >
                                        {privilege.code}
                                    </span>
                                </div>
                                
                                {/* Status badge */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(privilege.is_active)}`}
                                    >
                                        {privilege.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Title/Name - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                                title={privilege.name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/admin/privileges/${privilege.id}`;
                                }}
                            >
                                {truncateText(privilege.name, nameLength)}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* ✅ FIXED: Discount Info using discountType relationship */}
                                <div className="flex items-center gap-1.5">
                                    <Percent className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {getDiscountTypeName(privilege)} • {getDiscountPercentage(privilege)}% off
                                    </span>
                                </div>
                                
                                {/* ✅ FIXED: Requirements badges using discountType relationship */}
                                <div className="flex flex-wrap gap-1">
                                    {getRequiresVerification(privilege) && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                            <Shield className="h-2 w-2 mr-0.5" />
                                            Verify
                                        </Badge>
                                    )}
                                    {getRequiresIdNumber(privilege) && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            <IdCard className="h-2 w-2 mr-0.5" />
                                            ID Req
                                        </Badge>
                                    )}
                                </div>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {privilege.residents_count || 0} assignments 
                                        {privilege.active_residents_count ? ` (${privilege.active_residents_count} active)` : ''}
                                    </span>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {formatDate(privilege.created_at)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => toggleCardExpansion(privilege.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Description */}
                                    {privilege.description && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Description:</p>
                                            <p className="line-clamp-3 italic text-gray-600 dark:text-gray-400">
                                                "{truncateText(privilege.description, descriptionLength)}"
                                            </p>
                                        </div>
                                    )}

                                    {/* ✅ FIXED: Validity Period using discountType relationship */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {getValidityYears(privilege) ? `${getValidityYears(privilege)} year(s)` : 'Lifetime'}
                                        </span>
                                    </div>

                                    {/* ✅ FIXED: Requirements Details using discountType relationship */}
                                    <div className="space-y-1 text-xs">
                                        <p className="font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5">
                                            <li className={getRequiresVerification(privilege) ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}>
                                                Verification {getRequiresVerification(privilege) ? 'required' : 'not required'}
                                            </li>
                                            <li className={getRequiresIdNumber(privilege) ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}>
                                                ID Number {getRequiresIdNumber(privilege) ? 'required' : 'not required'}
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatDateTime(privilege.updated_at)}
                                        </span>
                                    </div>

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/admin/privileges/${privilege.id}`;
                                            }}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(privilege.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {/* Footer Actions */}
                        <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-0.5">
                                    {/* View Details */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/admin/privileges/${privilege.id}`;
                                                }}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Edit */}
                                    {can.edit && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/admin/privileges/${privilege.id}/edit`;
                                                    }}
                                                >
                                                    <Edit className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Edit</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {/* Assign */}
                                    {can.assign && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/admin/privileges/${privilege.id}/assign`;
                                                    }}
                                                >
                                                    <Users className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Assign</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {/* Toggle Status */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} ${
                                                    privilege.is_active 
                                                        ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950' 
                                                        : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(privilege);
                                                }}
                                            >
                                                {privilege.is_active ? (
                                                    <XCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                ) : (
                                                    <CheckCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">{privilege.is_active ? 'Deactivate' : 'Activate'}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Duplicate */}
                                    {can.edit && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDuplicate(privilege);
                                                    }}
                                                >
                                                    <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Duplicate</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {/* Copy Code */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => handleCopyToClipboard(privilege.code, 'Privilege Code', e)}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Copy Code</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                {/* Delete button */}
                                {can.delete && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(privilege);
                                                }}
                                            >
                                                <Trash2 className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </GridLayout>
    );
}