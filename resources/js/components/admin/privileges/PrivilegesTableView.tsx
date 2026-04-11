// resources/js/components/admin/privileges/PrivilegesTableView.tsx

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { 
    Award,
    MoreVertical,
    Eye,
    Edit,
    Users,
    Copy,
    Printer,
    Trash2,
    CheckSquare,
    Square,
    Shield,
    IdCard,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { 
    Privilege, 
    PrivilegeFilters, 
    DiscountType,
    SelectionStats
} from '@/types/admin/privileges/privilege.types';

interface PrivilegesTableViewProps {
    privileges: Privilege[];
    isBulkMode: boolean;
    selectedPrivileges: number[];
    isMobile: boolean;
    filtersState: PrivilegeFilters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (privilege: Privilege) => void;
    onToggleStatus: (privilege: Privilege) => void;
    onDuplicate: (privilege: Privilege) => void;
    selectionStats: SelectionStats;
    getSortIcon: (column: string) => React.ReactNode;
    discountTypes: DiscountType[];
    can: {
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export default function PrivilegesTableView({
    privileges,
    isBulkMode,
    selectedPrivileges,
    isMobile,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    selectionStats,
    getSortIcon,
    discountTypes,
    can,
    sortBy = 'name',
    sortOrder = 'asc'
}: PrivilegesTableViewProps) {
    const getTruncationLength = (type: 'name' | 'description' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            return type === 'name' ? 15 : 20;
        }
        if (width < 768) {
            return type === 'name' ? 20 : 25;
        }
        if (width < 1024) {
            return type === 'name' ? 25 : 30;
        }
        return type === 'name' ? 30 : 35;
    };

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
            </Badge>
        ) : (
            <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Inactive
            </Badge>
        );
    };

    // ✅ FIXED: Get requirement icons from discountType relationship
    const getRequirementIcons = (privilege: Privilege) => {
        const discountType = privilege.discountType;
        return (
            <div className="flex gap-1">
                {discountType?.requires_verification && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Shield className="h-3.5 w-3.5 text-purple-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Requires Verification</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                {discountType?.requires_id_number && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <IdCard className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Requires ID Number</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        );
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label}: ${text}`);
        }).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    };

    // ✅ FIXED: Get discount type name from discountType relationship
    const getDiscountTypeName = (privilege: Privilege) => {
        return privilege?.discountType?.name || 'N/A';
    };

    // ✅ FIXED: Get discount percentage from discountType relationship
    const getDiscountPercentage = (privilege: Privilege) => {
        return privilege?.discountType?.percentage || 0;
    };

    // ✅ FIXED: Get validity from discountType relationship
    const getValidity = (privilege: Privilege) => {
        const days = privilege?.discountType?.validity_days;
        if (days) {
            const years = Math.floor(days / 365);
            return `${years} year(s)`;
        }
        return 'Lifetime';
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
                                                checked={selectedPrivileges.length === privileges.length && privileges.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedPrivileges.length === privileges.length) {
                                                        privileges.forEach(p => onItemSelect(p.id));
                                                    } else {
                                                        privileges.forEach(p => {
                                                            if (!selectedPrivileges.includes(p.id)) {
                                                                onItemSelect(p.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Privilege Name
                                        <span className="ml-1">{getSortIcon('name')}</span>
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code
                                        <span className="ml-1">{getSortIcon('code')}</span>
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('discount_type')}
                                >
                                    <div className="flex items-center gap-1">
                                        Discount Type
                                        <span className="ml-1">{getSortIcon('discount_type')}</span>
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('discount_percentage')}
                                >
                                    <div className="flex items-center gap-1">
                                        Discount %
                                        <span className="ml-1">{getSortIcon('discount_percentage')}</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Requirements
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <span className="ml-1">{getSortIcon('status')}</span>
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('residents_count')}
                                >
                                    <div className="flex items-center gap-1">
                                        Assignments
                                        <span className="ml-1">{getSortIcon('residents_count')}</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Validity
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {privileges.map((privilege) => {
                                const nameLength = getTruncationLength('name');
                                const descLength = getTruncationLength('description');
                                const isSelected = selectedPrivileges.includes(privilege.id);
                                
                                return (
                                    <TableRow 
                                        key={privilege.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        }`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(privilege.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(privilege.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {truncateText(privilege.name, nameLength)}
                                                    </div>
                                                    {privilege.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                            {truncateText(privilege.description, descLength)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge variant="outline" className="font-mono">
                                                {privilege.code}
                                            </Badge>
                                        </TableCell>
                                        {/* ✅ FIXED: Discount Type from relationship */}
                                        <TableCell className="px-4 py-3">
                                            {getDiscountTypeName(privilege)}
                                        </TableCell>
                                        {/* ✅ FIXED: Discount % from relationship */}
                                        <TableCell className="px-4 py-3">
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                                                {getDiscountPercentage(privilege)}%
                                            </Badge>
                                        </TableCell>
                                        {/* ✅ FIXED: Requirements from relationship */}
                                        <TableCell className="px-4 py-3">
                                            {getRequirementIcons(privilege)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {getStatusBadge(privilege.is_active)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium">
                                                    {privilege.active_residents_count ?? 0} active
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {privilege.residents_count ?? 0} total
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* ✅ FIXED: Validity from relationship */}
                                        <TableCell className="px-4 py-3">
                                            {privilege?.discountType?.validity_days ? (
                                                <Badge variant="outline">
                                                    {getValidity(privilege)}
                                                </Badge>
                                            ) : (
                                                <div className="text-xs text-gray-400">Lifetime</div>
                                            )}
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
                                                        <Link href={`/admin/privileges/${privilege.id}`} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    {can.edit && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/privileges/${privilege.id}/edit`} className="flex items-center cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit Privilege</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {can.assign && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/privileges/${privilege.id}/assign`} className="flex items-center cursor-pointer">
                                                                <Users className="mr-2 h-4 w-4" />
                                                                <span>Assign to Residents</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/privileges/${privilege.id}/assignments`} className="flex items-center cursor-pointer">
                                                            <Users className="mr-2 h-4 w-4" />
                                                            <span>View Assignments</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => onToggleStatus(privilege)}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        {privilege.is_active ? (
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
                                                    
                                                    {can.edit && (
                                                        <DropdownMenuItem 
                                                            onClick={() => onDuplicate(privilege)}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Duplicate</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(privilege.name, 'Privilege Name')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Name</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => handleCopyToClipboard(privilege.code, 'Privilege Code')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Code</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/privileges/${privilege.id}/print`} className="flex items-center cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(privilege.id)}
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
                                                    
                                                    {can.delete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                                onClick={() => onDelete(privilege)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete Privilege</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
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