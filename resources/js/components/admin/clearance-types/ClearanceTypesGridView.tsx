// components/admin/clearance-types/ClearanceTypesGridView.tsx

import { Card } from '@/components/ui/card';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    Unlock
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Import types and utilities
import { 
    ClearanceType, 
    getStatusBadgeVariant,
    getPurposeOptionsCount,
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
    getTruncationLength
}: ClearanceTypesGridViewProps) {
    
    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" /> : 
            <XCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    };

    const getDiscountableIcon = (isDiscountable: boolean) => {
        return isDiscountable ? 
            <Unlock className="h-3 w-3 text-green-500" /> : 
            <Lock className="h-3 w-3 text-gray-500" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-950">
            {clearanceTypes.map((type) => {
                const nameLength = getTruncationLength('name');
                const descLength = getTruncationLength('description');
                const codeLength = getTruncationLength('code');
                const isSelected = selectedTypes.includes(type.id);
                
                return (
                    <Card 
                        key={type.id}
                        className={`overflow-hidden hover:shadow-md transition-all duration-200 border bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content') &&
                                !e.target.closest('input[type="checkbox"]')) {
                                onItemSelect(type.id);
                            }
                        }}
                    >
                        <div className="p-4">
                            {/* Header with selection checkbox and actions */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(type.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <Badge 
                                        variant={getStatusBadgeVariant(type.is_active)}
                                        className={`flex items-center gap-1 ${
                                            type.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {getStatusIcon(type.is_active)}
                                        {type.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge 
                                        variant="outline"
                                        className={`flex items-center gap-1 text-xs ${
                                            type.is_discountable 
                                                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400' 
                                                : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {getDiscountableIcon(type.is_discountable)}
                                        {type.is_discountable ? 'Disc.' : 'Non-Disc.'}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.clearance-types.show', type.id)} className="flex items-center cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.clearance-types.edit', type.id)} className="flex items-center cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Type</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.clearances.create', { type: type.id })} className="flex items-center cursor-pointer">
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span>Issue Clearance</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(type.code, 'Clearance Type Code');
                                            }}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Code</span>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(type.name, 'Clearance Type Name');
                                            }}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Name</span>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.clearance-types.print', type.id)} className="flex items-center cursor-pointer">
                                                <Printer className="mr-2 h-4 w-4" />
                                                <span>Print Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {isBulkMode && (
                                            <>
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(type.id);
                                                    }}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <CheckSquare className="mr-2 h-4 w-4" />
                                                            <span>Deselect</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Square className="mr-2 h-4 w-4" />
                                                            <span>Select</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}
                                        
                                        {onDuplicate && (
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDuplicate(type);
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Duplicate Type</span>
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {onToggleStatus && (
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(type);
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                {type.is_active ? (
                                                    <>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        <span>Deactivate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span>Activate</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {onToggleDiscountable && (
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleDiscountable(type);
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                {type.is_discountable ? (
                                                    <>
                                                        <Lock className="mr-2 h-4 w-4" />
                                                        <span>Mark Non-Discountable</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="mr-2 h-4 w-4" />
                                                        <span>Mark Discountable</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(type);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Type</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Type Name and Code */}
                            <div className="mb-3">
                                <h3 
                                    className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1"
                                    title={type.name}
                                >
                                    {truncateText(type.name, nameLength)}
                                </h3>
                                <code 
                                    className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 truncate block"
                                    title={type.code}
                                >
                                    {truncateText(type.code, codeLength)}
                                </code>
                            </div>

                            {/* Description */}
                            <p 
                                className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
                                title={type.description}
                            >
                                {truncateText(type.description, descLength)}
                            </p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {type.formatted_fee}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {type.processing_days} days
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {type.validity_days} days
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {type.clearances_count || 0} issued
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {type.requires_payment && (
                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Paid
                                    </Badge>
                                )}
                                {type.requires_approval && (
                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Approval
                                    </Badge>
                                )}
                                {type.is_online_only && (
                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                        <Globe className="h-3 w-3 mr-1" />
                                        Online
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {type.document_types_count || 0} docs
                                </Badge>
                                <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                    <Copy className="h-3 w-3 mr-1" />
                                    {getPurposeCount(type)} purposes
                                </Badge>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Updated: {formatDate(type.updated_at)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={route('admin.clearances.create', { type: type.id })}>
                                            <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                                <FileSpreadsheet className="h-3 w-3 mr-1" />
                                                Issue
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                        <p>Issue new clearance</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}