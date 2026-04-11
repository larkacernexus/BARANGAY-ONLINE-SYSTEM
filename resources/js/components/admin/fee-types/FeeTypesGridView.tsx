// components/admin/fee-types/FeeTypesGridView.tsx
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
    Square
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

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
    formatDate
}: FeeTypesGridViewProps) {
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-950">
            {feeTypes.map((feeType) => {
                const categoryDetails = getCategoryDetails(feeType);
                const isSelected = selectedFeeTypes.includes(feeType.id);
                
                return (
                    <Card 
                        key={feeType.id}
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
                                onItemSelect(feeType.id);
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
                                            onCheckedChange={() => onItemSelect(feeType.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <Badge 
                                        variant={feeType.is_active ? "default" : "secondary"}
                                        className={`flex items-center gap-1 ${
                                            feeType.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {feeType.is_active ? 
                                            <CheckCircle className="h-3 w-3" /> : 
                                            <XCircle className="h-3 w-3" />
                                        }
                                        {feeType.is_active ? 'Active' : 'Inactive'}
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
                                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.fee-types.show', feeType.id)} className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100">
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.fee-types.edit', feeType.id)} className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100">
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Fee Type</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {onDuplicate && (
                                            <DropdownMenuItem 
                                                onClick={() => onDuplicate(feeType)}
                                                className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Duplicate</span>
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                                        
                                        <DropdownMenuItem 
                                            onClick={() => onCopyToClipboard(feeType.code || '', 'Fee Type Code')}
                                            className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100"
                                        >
                                            <Clipboard className="mr-2 h-4 w-4" />
                                            <span>Copy Code</span>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('admin.fees.index', { fee_type: feeType.id })} className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100">
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                <span>View Fees</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {isBulkMode && (
                                            <>
                                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                <DropdownMenuItem 
                                                    onClick={() => onItemSelect(feeType.id)}
                                                    className="flex items-center cursor-pointer dark:text-gray-300 dark:hover:text-gray-100"
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <CheckSquare className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                                                            <span className="text-green-600 dark:text-green-400">Deselect</span>
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
                                        
                                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                                        
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-900/20"
                                            onClick={() => onDelete(feeType)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Fee Type</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Fee Type Code and Name */}
                            <div className="mb-3">
                                <div className="font-mono font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {feeType.code || 'N/A'}
                                </div>
                                <h3 
                                    className="font-semibold text-gray-900 dark:text-gray-100 truncate"
                                    title={feeType.name}
                                >
                                    {feeType.name || 'Unnamed'}
                                </h3>
                                {feeType.short_name && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {feeType.short_name}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {feeType.description && (
                                <p 
                                    className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
                                    title={feeType.description}
                                >
                                    {feeType.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(feeType.base_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {categoryDetails.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-500 dark:text-green-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                            {(feeType.frequency || 'one_time').replace('_', ' ')}
                                        </span>
                                    </div>
                                    {feeType.validity_days && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {feeType.validity_days} days
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                <Badge variant="outline" className={`${categoryDetails.bgColor} ${categoryDetails.textColor} ${categoryDetails.borderColor}`}>
                                    <span className="flex items-center gap-1">
                                        {categoryDetails.icon}
                                        {categoryDetails.name}
                                    </span>
                                </Badge>
                                <Badge variant="secondary" className="capitalize text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                </Badge>
                                {feeType.is_mandatory && (
                                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs dark:text-red-400 dark:border-red-800">
                                        Mandatory
                                    </Badge>
                                )}
                                {feeType.auto_generate && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs dark:text-blue-400 dark:border-blue-800">
                                        Auto-gen
                                    </Badge>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Updated: {formatDate(feeType.updated_at)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={route('admin.fees.index', { fee_type: feeType.id })}>
                                            <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                View Fees
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                        <p>View associated fees</p>
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