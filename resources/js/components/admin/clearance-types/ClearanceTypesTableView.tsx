// components/admin/clearance-types/ClearanceTypesTableView.tsx

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
    ArrowUpDown,
    CheckCircle,
    Clock,
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
    Square,
    CheckSquare,
    Lock,
    Unlock,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Import types and utilities
import { 
    ClearanceType, 
    FilterState, 
    getStatusBadgeVariant, 
    getDiscountableBadgeVariant,
    truncateText
} from '@/types/admin/clearance-types/clearance-types';

interface ClearanceTypesTableViewProps {
    clearanceTypes: ClearanceType[];
    isBulkMode: boolean;
    selectedTypes: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (type: ClearanceType) => void;
    onToggleStatus?: (type: ClearanceType) => void;
    onToggleDiscountable?: (type: ClearanceType) => void;
    onDuplicate?: (type: ClearanceType) => void;
    onViewPhoto: (type: ClearanceType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    getPurposeOptionsCount: (type: ClearanceType) => number;
    getTruncationLength: (type: 'name' | 'description' | 'code') => number;
}

export default function ClearanceTypesTableView({
    clearanceTypes,
    isBulkMode,
    selectedTypes,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onToggleDiscountable,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    getPurposeOptionsCount: getPurposeCount,
    getTruncationLength
}: ClearanceTypesTableViewProps) {
    
    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <XCircle className="h-4 w-4 text-gray-500" />;
    };

    const getDiscountableIcon = (isDiscountable: boolean) => {
        return isDiscountable ? 
            <Unlock className="h-3 w-3 text-green-500" /> : 
            <Lock className="h-3 w-3 text-gray-500" />;
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && clearanceTypes.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                    <div className="flex items-center gap-1">
                                        Name & Details
                                        <button
                                            onClick={() => onSort('name')}
                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                            title="Sort by name"
                                        >
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    <div className="flex items-center gap-1">
                                        Fee
                                        <button
                                            onClick={() => onSort('fee')}
                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                            title="Sort by fee"
                                        >
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    <div className="flex items-center gap-1">
                                        Discountable
                                        <button
                                            onClick={() => onSort('is_discountable')}
                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                            title="Sort by discountable"
                                        >
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Processing
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Validity
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    <div className="flex items-center gap-1">
                                        Issued
                                        <button
                                            onClick={() => onSort('clearances_count')}
                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                            title="Sort by issued count"
                                        >
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {clearanceTypes.map((type) => {
                                const nameLength = getTruncationLength('name');
                                const descLength = getTruncationLength('description');
                                const codeLength = getTruncationLength('code');
                                const isSelected = selectedTypes.includes(type.id);
                                
                                return (
                                    <TableRow 
                                        key={type.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
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
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(type.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3">
                                            <div 
                                                className="space-y-1 cursor-text select-text"
                                                onDoubleClick={(e) => {
                                                    const selection = window.getSelection();
                                                    if (selection) {
                                                        const range = document.createRange();
                                                        range.selectNodeContents(e.currentTarget);
                                                        selection.removeAllRanges();
                                                        selection.addRange(range);
                                                    }
                                                }}
                                                title={`Double-click to select all\nName: ${type.name}\nCode: ${type.code}\nDescription: ${type.description}`}
                                            >
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div 
                                                        className="font-medium text-gray-900 dark:text-white truncate"
                                                        data-full-text={type.name}
                                                    >
                                                        {truncateText(type.name, nameLength)}
                                                    </div>
                                                    <Badge 
                                                        variant={getStatusBadgeVariant(type.is_active)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {getStatusIcon(type.is_active)}
                                                        {type.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <Badge 
                                                        variant={getDiscountableBadgeVariant(type.is_discountable)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {getDiscountableIcon(type.is_discountable)}
                                                        {type.is_discountable ? 'Discountable' : 'Non-Discountable'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                                    <code 
                                                        className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-600 dark:text-gray-400 truncate"
                                                        data-full-text={type.code}
                                                    >
                                                        {truncateText(type.code, codeLength)}
                                                    </code>
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
                                                </div>
                                                <div 
                                                    className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1"
                                                    data-full-text={type.description}
                                                >
                                                    {truncateText(type.description, descLength)}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        <span>{type.document_types_count || 0} docs</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Copy className="h-3 w-3" />
                                                        <span>{getPurposeCount(type)} purposes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white" title={type.formatted_fee}>
                                                {type.formatted_fee}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs">
                                                {type.is_discountable ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span>{type.processing_days} day{type.processing_days !== 1 ? 's' : ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span>{type.validity_days} day{type.validity_days !== 1 ? 's' : ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium">{type.clearances_count || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="sr-only">Open menu</span>
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