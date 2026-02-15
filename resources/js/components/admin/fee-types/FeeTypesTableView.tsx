// components/admin/fee-types/FeeTypesTableView.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Copy,
    FileText,
    Eye,
    Edit,
    Trash2,
    Square,
    CheckSquare,
    Clipboard,
    DollarSign,
    Tag
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

interface FilterState {
    search: string;
    category: string;
    status: string;
}

interface FeeTypesTableViewProps {
    feeTypes: FeeType[];
    isBulkMode: boolean;
    selectedFeeTypes: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (feeType: FeeType) => void;
    onToggleStatus?: (feeType: FeeType) => void;
    onDuplicate?: (feeType: FeeType) => void;
    onViewPhoto: (feeType: FeeType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    getCategoryDetails: (feeType: FeeType) => {
        name: string;
        icon: React.ReactNode;
        color: string;
    };
    formatCurrency: (amount: any) => string;
    formatDate: (dateString: string) => string;
}

export default function FeeTypesTableView({
    feeTypes,
    isBulkMode,
    selectedFeeTypes,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    getCategoryDetails,
    formatCurrency,
    formatDate
}: FeeTypesTableViewProps) {
    
    // Get sort icon
    const getSortIcon = (field: string) => {
        // This is a simplified version - in a real app you'd track sort state
        return null;
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && feeTypes.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code
                                        {getSortIcon('code')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('category')}
                                >
                                    <div className="flex items-center gap-1">
                                        Category
                                        {getSortIcon('category')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('base_amount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Amount
                                        {getSortIcon('base_amount')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Frequency
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Status
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {feeTypes.map((feeType) => {
                                const categoryDetails = getCategoryDetails(feeType);
                                const isSelected = selectedFeeTypes.includes(feeType.id);
                                
                                return (
                                    <TableRow 
                                        key={feeType.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
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
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(feeType.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-mono font-medium">{feeType.code || 'N/A'}</div>
                                            {feeType.short_name && (
                                                <div className="text-xs text-gray-500">{feeType.short_name}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium">{feeType.name || 'Unnamed'}</div>
                                            {feeType.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {feeType.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge variant="outline" className={categoryDetails.color}>
                                                <span className="flex items-center gap-1">
                                                    {categoryDetails.icon}
                                                    {categoryDetails.name}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium">{formatCurrency(feeType.base_amount)}</div>
                                            <div className="text-xs text-gray-500 capitalize">
                                                {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge variant="secondary" className="capitalize">
                                                {(feeType.frequency || 'one_time').replace('_', ' ')}
                                            </Badge>
                                            {feeType.validity_days && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {feeType.validity_days} days valid
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={feeType.is_active ? "default" : "secondary"}>
                                                    {feeType.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {feeType.is_mandatory && (
                                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                                        Mandatory
                                                    </Badge>
                                                )}
                                                {feeType.auto_generate && (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                        Auto-gen
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="sr-only">Open menu</span>
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

                                                    {onDuplicate && (
                                                        <DropdownMenuItem 
                                                            onClick={() => onDuplicate(feeType)}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Duplicate</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => onCopyToClipboard(feeType.code || '', 'Fee Type Code')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Clipboard className="mr-2 h-4 w-4" />
                                                        <span>Copy Code</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('fees.index', { fee_type: feeType.id })} className="flex items-center cursor-pointer">
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            <span>View Fees</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(feeType.id)}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                {isSelected ? (
                                                                    <>
                                                                        <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600">Deselect</span>
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
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => onDelete(feeType)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Fee Type</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}