// components/admin/fees/FeesTableView.tsx - COMPLETE REVISED FILE

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
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    CheckCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Fee, Filters } from '@/types/admin/fees/fees';

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
    formatCurrency: (amount: number | string | undefined) => string;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isLoading?: boolean;
}

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const isOverdue = (dueDate: string | null | undefined, status?: string): boolean => {
    if (!dueDate) return false;
    if (status === 'paid' || status === 'cancelled' || status === 'refunded') return false;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        return today > due;
    } catch {
        return false;
    }
};

const getDaysOverdue = (dueDate: string | null | undefined): number => {
    if (!dueDate) return 0;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    } catch {
        return 0;
    }
};

const getPayerIcon = (payerType?: string) => {
    switch (payerType?.toLowerCase()) {
        case 'resident': return <User className="h-4 w-4" />;
        case 'household': return <Home className="h-4 w-4" />;
        case 'business': return <Building className="h-4 w-4" />;
        default: return <User className="h-4 w-4" />;
    }
};

const getSortIcon = (column: string, currentSortBy?: string, currentSortOrder?: 'asc' | 'desc') => {
    if (currentSortBy !== column) return null;
    return currentSortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
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
    statuses,
    categories: _categories,
    formatCurrency,
    getStatusColor,
    getStatusIcon,
    getCategoryColor,
    getCategoryLabel,
    sortBy = 'created_at',
    sortOrder = 'desc',
    isLoading = false
}: FeesTableViewProps) {

    const handleViewClick = (fee: Fee) => {
        if (onViewDetails) {
            onViewDetails(fee);
        } else {
            window.location.href = route('admin.fees.show', fee.id);
        }
    };

    const handleEditClick = (fee: Fee) => {
        if (onEdit) {
            onEdit(fee);
        } else {
            window.location.href = route('admin.fees.edit', fee.id);
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

    const canEdit = (status: string) => {
        return status === 'pending' || status === 'issued' || status === 'partial' || status === 'partially_paid';
    };

    const canDelete = (status: string) => {
        return status === 'pending';
    };

    const canRecordPayment = (status: string, balance?: number) => {
        return (status === 'issued' || status === 'partial' || status === 'partially_paid' || status === 'pending') && (balance ?? 0) > 0;
    };

    if (!fees || fees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">No fees found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <Checkbox
                                            checked={isSelectAll && fees.length > 0}
                                            onCheckedChange={onSelectAllOnPage}
                                            disabled={isLoading}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => !isLoading && onSort('fee_code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Fee Details
                                        {getSortIcon('fee_code', sortBy, sortOrder)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => !isLoading && onSort('payer_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Payer Information
                                        {getSortIcon('payer_name', sortBy, sortOrder)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => !isLoading && onSort('due_date')}
                                >
                                    <div className="flex items-center gap-1">
                                        Dates
                                        {getSortIcon('due_date', sortBy, sortOrder)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => !isLoading && onSort('total_amount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Amount
                                        {getSortIcon('total_amount', sortBy, sortOrder)}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => !isLoading && onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status', sortBy, sortOrder)}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {fees.map((fee) => {
                                const isSelected = selectedFees.includes(fee.id);
                                const isFeeOverdue = isOverdue(fee.due_date, fee.status);
                                const daysOverdue = getDaysOverdue(fee.due_date);
                                
                                const totalAmount = Number(fee.total_amount ?? fee.amount ?? 0);
                                const amountPaid = Number(fee.amount_paid ?? fee.paid_amount ?? 0);
                                const balance = Number(fee.balance ?? (totalAmount - amountPaid));
                                const hasBalance = balance > 0;
                                const hasPaid = amountPaid > 0;
                                
                                return (
                                    <TableRow 
                                        key={fee.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        } ${isFeeOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                        onClick={(e) => {
                                            if (isBulkMode && !isLoading) {
                                                const target = e.target as HTMLElement;
                                                if (!target.closest('a') && 
                                                    !target.closest('button') &&
                                                    !target.closest('[role="menuitem"]') &&
                                                    !target.closest('input[type="checkbox"]')) {
                                                    onItemSelect(fee.id);
                                                }
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => onItemSelect(fee.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={isLoading}
                                                    className="border-gray-300 dark:border-gray-600"
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {fee.fee_code || fee.code || 'N/A'}
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
                                                {fee.certificate_number && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        Cert: {fee.certificate_number}
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
                                                        {fee.contact_number || fee.resident?.contact_number || fee.resident?.phone || 'No contact'}
                                                    </div>
                                                    {fee.purok && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                                            Purok {fee.purok}
                                                        </div>
                                                    )}
                                                    {fee.address && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px] truncate">
                                                            {fee.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-sm dark:text-gray-300">
                                                        Issued: {formatDate(fee.created_at || fee.issue_date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className={`text-sm ${isFeeOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-gray-300'}`}>
                                                        Due: {formatDate(fee.due_date)}
                                                        {isFeeOverdue && daysOverdue > 0 && (
                                                            <span className="ml-1 text-xs">
                                                                ({daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue)
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
                                                {!hasPaid && !hasBalance && fee.status === 'paid' && (
                                                    <div className="text-sm text-green-600 dark:text-green-400">
                                                        Fully Paid
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant="outline" 
                                                className={`flex items-center gap-1 w-fit ${getStatusColor(fee.status)}`}
                                            >
                                                {getStatusIcon(fee.status)}
                                                {statuses[fee.status] || fee.status}
                                            </Badge>
                                            {fee.or_number && (
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    OR#: {fee.or_number}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isLoading}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                    <DropdownMenuItem onClick={() => handleViewClick(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    
                                                    {canEdit(fee.status) && (
                                                        <DropdownMenuItem onClick={() => handleEditClick(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Fee
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    
                                                    <DropdownMenuItem onClick={() => handleCopyFeeCode(fee)} className="dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy Fee Code
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/fees/${fee.id}/print`} className="dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Print Invoice
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    {canRecordPayment(fee.status, balance) && (
                                                        <DropdownMenuItem asChild>
                                                            <Link 
                                                                href={route('admin.payments.create', { 
                                                                    fee_id: fee.id,
                                                                    payer_type: fee.payer_type || fee.type || 'resident',
                                                                    payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
                                                                    payer_name: fee.payer_name || fee.resident?.full_name,
                                                                    contact_number: fee.contact_number || fee.resident?.contact_number || fee.resident?.phone,
                                                                    address: fee.address,
                                                                    purok: fee.purok,
                                                                    fee_code: fee.fee_code || fee.code,
                                                                    balance: balance,
                                                                    total_amount: totalAmount
                                                                })}
                                                                className="flex items-center dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                                                            >
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Record Payment
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                            <DropdownMenuItem onClick={() => onItemSelect(fee.id)} className="dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer">
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
                                                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
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