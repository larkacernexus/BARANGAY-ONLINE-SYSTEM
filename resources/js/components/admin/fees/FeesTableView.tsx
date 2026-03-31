// components/admin/fees/FeesTableView.tsx

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Copy,
    Printer,
    CreditCard,
    CheckSquare,
    Square,
    User,
    Home,
    Building,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Fee, Filters } from '@/types/admin/fees/fees';
import { format, isAfter } from 'date-fns';

interface FeesTableViewProps {
    fees: Fee[];
    isBulkMode: boolean;
    selectedFees: number[];
    filtersState: Filters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    onDelete: (fee: Fee) => void;
    onEdit?: (fee: Fee) => void;
    onViewDetails?: (fee: Fee) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    statuses: Record<string, string>;
    categories: Record<string, string>;
    // Additional props passed from parent
    formatCurrency: (amount: number) => string;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
}

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
        return 'Invalid date';
    }
};

const isOverdue = (dueDate: string | null | undefined): boolean => {
    if (!dueDate) return false;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        return isAfter(today, due);
    } catch {
        return false;
    }
};

const getDaysOverdue = (dueDate: string | null | undefined): number => {
    if (!dueDate) return 0;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    } catch {
        return 0;
    }
};

const getPayerIcon = (payerType?: string) => {
    switch (payerType) {
        case 'resident': return <User className="h-4 w-4" />;
        case 'household': return <Home className="h-4 w-4" />;
        case 'business': return <Building className="h-4 w-4" />;
        default: return <User className="h-4 w-4" />;
    }
};

const getSortIcon = (column: string, filtersState: Filters) => {
    if (filtersState.sort_by !== column) return null;
    return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
};

export default function FeesTableView({
    fees,
    isBulkMode,
    selectedFees,
    filtersState,
    onItemSelect,
    onSort,
    onDelete,
    onEdit,
    onViewDetails,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    hasActiveFilters,
    onClearFilters,
    statuses,
    categories,
    formatCurrency,
    getStatusColor,
    getStatusIcon,
    getCategoryColor,
    getCategoryLabel
}: FeesTableViewProps) {

    const handleViewClick = (fee: Fee) => {
        if (onViewDetails) {
            onViewDetails(fee);
        } else {
            router.get(route('admin.fees.show', fee.id));
        }
    };

    const handleEditClick = (fee: Fee) => {
        if (onEdit) {
            onEdit(fee);
        } else {
            router.get(route('admin.fees.edit', fee.id));
        }
    };

    const handleCopyFeeCode = (fee: Fee) => {
        const feeCode = fee.fee_code || fee.code || 'N/A';
        if (onCopyToClipboard) {
            onCopyToClipboard(feeCode, 'Fee Code');
        } else {
            navigator.clipboard.writeText(feeCode);
        }
    };

    // Check if fee can be edited
    const canEdit = (status: string) => {
        return status === 'pending' || status === 'issued';
    };

    // Check if fee can be deleted
    const canDelete = (status: string) => {
        return status === 'pending';
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
                                            <input
                                                type="checkbox"
                                                checked={isSelectAll && fees.length > 0}
                                                onChange={onSelectAllOnPage}
                                                className="rounded border-gray-300 dark:border-gray-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('fee_code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Fee Details
                                        {getSortIcon('fee_code', filtersState)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('payer_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Payer Information
                                        {getSortIcon('payer_name', filtersState)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('due_date')}
                                >
                                    <div className="flex items-center gap-1">
                                        Dates
                                        {getSortIcon('due_date', filtersState)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('total_amount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Amount
                                        {getSortIcon('total_amount', filtersState)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status', filtersState)}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {fees.map((fee) => {
                                const isSelected = selectedFees.includes(fee.id);
                                const isFeeOverdue = isOverdue(fee.due_date) && fee.status !== 'paid';
                                const daysOverdue = getDaysOverdue(fee.due_date);
                                
                                // Safe amount calculations
                                const totalAmount = fee.total_amount ?? fee.amount ?? 0;
                                const amountPaid = fee.amount_paid ?? fee.paid_amount ?? 0;
                                const balance = fee.balance ?? (totalAmount - amountPaid);
                                const hasBalance = balance > 0;
                                const hasPaid = amountPaid > 0;
                                
                                return (
                                    <TableRow 
                                        key={fee.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        } ${isFeeOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                        onClick={(e) => {
                                            if (isBulkMode && e.target instanceof HTMLElement && 
                                                !e.target.closest('a') && 
                                                !e.target.closest('button') &&
                                                !e.target.closest('.dropdown-menu-content') &&
                                                !e.target.closest('input[type="checkbox"]')) {
                                                onItemSelect(fee.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onItemSelect(fee.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="rounded border-gray-300 dark:border-gray-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {fee.fee_code || fee.code}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {fee.fee_type?.name || 'Unknown Fee Type'}
                                                </div>
                                                {fee.fee_type?.category && (
                                                    <div className="mt-1">
                                                        <Badge variant="outline" className={getCategoryColor(fee.fee_type.category)}>
                                                            {getCategoryLabel(fee.fee_type.category)}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                    {getPayerIcon(fee.payer_type || fee.type)}
                                                </div>
                                                <div>
                                                    <div className="font-medium dark:text-gray-200">
                                                        {fee.payer_name || fee.resident?.full_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {fee.contact_number || fee.resident?.phone || 'No contact'}
                                                    </div>
                                                    {fee.purok && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                                            Purok {fee.purok}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm dark:text-gray-300">
                                                        Issued: {formatDate(fee.created_at || fee.issue_date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className={`text-sm ${isFeeOverdue ? 'text-red-600 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                        Due: {formatDate(fee.due_date)}
                                                        {isFeeOverdue && (
                                                            <span className="ml-1 text-xs">
                                                                ({daysOverdue} days)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="font-bold text-lg dark:text-gray-200">
                                                    {formatCurrency(totalAmount)}
                                                </div>
                                                {hasPaid && (
                                                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Paid: {formatCurrency(amountPaid)}
                                                    </div>
                                                )}
                                                {hasBalance && (
                                                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                        Balance: {formatCurrency(balance)}
                                                    </div>
                                                )}
                                                {!hasPaid && !hasBalance && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        No payments yet
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant="outline" 
                                                className={`flex items-center gap-1 ${getStatusColor(fee.status)}`}
                                            >
                                                {getStatusIcon(fee.status)}
                                                {statuses[fee.status] || fee.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                    <DropdownMenuItem onClick={() => handleViewClick(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    
                                                    {canEdit(fee.status) && (
                                                        <DropdownMenuItem onClick={() => handleEditClick(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Fee
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    
                                                    <DropdownMenuItem onClick={() => handleCopyFeeCode(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800">
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy Fee Code
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/fees/${fee.id}/print`} className="dark:text-gray-300 dark:hover:bg-gray-800">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Print Invoice
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    {fee.status !== 'paid' && hasBalance && (
                                                        <DropdownMenuItem asChild>
                                                            <Link 
                                                                href={route('admin.payments.create', { 
                                                                    fee_id: fee.id,
                                                                    payer_type: fee.payer_type || fee.type || 'resident',
                                                                    payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
                                                                    payer_name: fee.payer_name || fee.resident?.full_name,
                                                                    contact_number: fee.contact_number || fee.resident?.phone,
                                                                    address: fee.address,
                                                                    purok: fee.purok,
                                                                    fee_code: fee.fee_code || fee.code,
                                                                    balance: balance
                                                                })}
                                                                className="flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                                            >
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Pay Fee
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            <DropdownMenuItem onClick={() => onItemSelect(fee.id)} className="dark:text-gray-300 dark:hover:bg-gray-800">
                                                                {isSelected ? (
                                                                    <>
                                                                        <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600">Deselect</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Square className="mr-2 h-4 w-4" />
                                                                        Select for Bulk
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    
                                                    {canDelete(fee.status) && (
                                                        <>
                                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            <DropdownMenuItem 
                                                                onClick={() => onDelete(fee)}
                                                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Fee
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