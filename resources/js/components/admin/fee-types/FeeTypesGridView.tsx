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
    XCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name: string;
    description?: string;
    base_amount: number | string | null;
    amount_type: string;
    frequency: string;
    validity_days: number | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    document_category_id: number | null;
    document_category?: {
        name: string;
        icon?: string;
        color?: string;
    };
    created_at: string;
    updated_at: string;
}

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
    getCategoryDetails: (feeType: FeeType) => {
        name: string;
        icon: React.ReactNode;
        color: string;
    };
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {feeTypes.map((feeType) => {
                const categoryDetails = getCategoryDetails(feeType);
                const isSelected = selectedFeeTypes.includes(feeType.id);
                
                return (
                    <Card 
                        key={feeType.id}
                        className={`overflow-hidden hover:shadow-md transition-all duration-200 border ${
                            isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/50' : 'border-gray-200'
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
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <Badge 
                                        variant={feeType.is_active ? "default" : "secondary"}
                                        className="flex items-center gap-1"
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
                                            className="h-8 w-8 p-0 hover:bg-gray-100"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('fee-types.show', feeType.id)} className="flex items-center cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('fee-types.edit', feeType.id)} className="flex items-center cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Fee Type</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(feeType.code || '', 'Code');
                                            }}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Code</span>
                                        </DropdownMenuItem>
                                        
                                        {onToggleStatus && (
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(feeType);
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                {feeType.is_active ? (
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
                                        
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(feeType);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Fee Type</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Fee Type Code and Name */}
                            <div className="mb-3">
                                <div className="font-mono font-medium text-sm text-gray-600 mb-1">
                                    {feeType.code || 'N/A'}
                                </div>
                                <h3 
                                    className="font-semibold text-gray-900 truncate"
                                    title={feeType.name}
                                >
                                    {feeType.name || 'Unnamed'}
                                </h3>
                                {feeType.short_name && (
                                    <div className="text-sm text-gray-500">
                                        {feeType.short_name}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {feeType.description && (
                                <p 
                                    className="text-sm text-gray-600 mb-4 line-clamp-2"
                                    title={feeType.description}
                                >
                                    {feeType.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-medium">
                                            {formatCurrency(feeType.base_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs">
                                            {categoryDetails.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-500" />
                                        <span className="text-xs capitalize">
                                            {(feeType.frequency || 'one_time').replace('_', ' ')}
                                        </span>
                                    </div>
                                    {feeType.validity_days && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-purple-500" />
                                            <span className="text-xs">
                                                {feeType.validity_days} days
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                <Badge variant="outline" className={categoryDetails.color}>
                                    <span className="flex items-center gap-1">
                                        {categoryDetails.icon}
                                        {categoryDetails.name}
                                    </span>
                                </Badge>
                                <Badge variant="secondary" className="capitalize text-xs">
                                    {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                </Badge>
                                {feeType.is_mandatory && (
                                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                        Mandatory
                                    </Badge>
                                )}
                                {feeType.auto_generate && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                                        Auto-gen
                                    </Badge>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t">
                                <span className="text-xs text-gray-500">
                                    Updated: {formatDate(feeType.updated_at)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={route('fees.index', { fee_type: feeType.id })}>
                                            <Button size="sm" variant="outline">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                View Fees
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
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