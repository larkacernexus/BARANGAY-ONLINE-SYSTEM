import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    User,
    Home,
    Building,
    Calendar,
    Clock,
    DollarSign,
    CreditCard,
    Eye,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    AlertCircle,
    Receipt,
    Copy
} from 'lucide-react';
import { Fee } from '@/types/fees.types';
import { format, isAfter } from 'date-fns';

interface FeesGridViewProps {
    fees: Fee[];
    isBulkMode: boolean;
    selectedFees: number[];
    onItemSelect: (id: number) => void;
    onDelete: (fee: Fee) => void;
    onEdit?: (fee: Fee) => void;
    onViewDetails?: (fee: Fee) => void;
    onCopyToClipboard?: (text: string, label: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    formatCurrency: (amount: number) => string;
    getStatusColor: (status: string) => string;
    statuses?: Record<string, string>;
    categories?: Record<string, string>;
}

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
};

const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return isAfter(today, due);
};

const getPayerIcon = (payerType: string) => {
    switch (payerType) {
        case 'resident': return <User className="h-5 w-5 text-blue-600" />;
        case 'household': return <Home className="h-5 w-5 text-green-600" />;
        case 'business': return <Building className="h-5 w-5 text-purple-600" />;
        default: return <User className="h-5 w-5 text-gray-600" />;
    }
};

const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    
    switch (status) {
        case 'paid': 
            return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Paid</Badge>;
        case 'pending': 
            return <Badge variant="secondary" className="text-xs">Pending</Badge>;
        case 'partial': 
            return <Badge variant="outline" className="text-xs">Partial</Badge>;
        default: 
            return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
};

export default function FeesGridView({
    fees,
    isBulkMode,
    selectedFees,
    onItemSelect,
    onDelete,
    onEdit,
    onViewDetails,
    onCopyToClipboard,
    hasActiveFilters,
    onClearFilters,
    formatCurrency,
    getStatusColor,
    statuses = {},
    categories = {}
}: FeesGridViewProps) {
    
    const emptyState = (
        <EmptyState
            title="No fees found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a fee assessment.'}
            icon={<DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/fees/create'}
            createLabel="Create Fee"
        />
    );

    const handleViewClick = (fee: Fee) => {
        if (onViewDetails) {
            onViewDetails(fee);
        } else {
            router.get(route('fees.show', fee.id));
        }
    };

    const handleEditClick = (fee: Fee) => {
        if (onEdit) {
            onEdit(fee);
        } else {
            router.get(route('fees.edit', fee.id));
        }
    };

    const handleCopyFeeCode = (fee: Fee) => {
        if (onCopyToClipboard) {
            onCopyToClipboard(fee.fee_code, 'Fee Code');
        } else {
            navigator.clipboard.writeText(fee.fee_code);
        }
    };

    return (
        <GridLayout
            isEmpty={fees.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {fees.map((fee) => {
                const isSelected = selectedFees.includes(fee.id);
                const isFeeOverdue = isOverdue(fee.due_date) && fee.status !== 'paid';
                
                return (
                    <Card 
                        key={fee.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        } ${isFeeOverdue ? 'border-red-300' : ''}`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(fee.id);
                            }
                        }}
                    >
                        <div className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        {getPayerIcon(fee.payer_type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {fee.fee_code}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {fee.fee_type?.name || 'Fee Assessment'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(fee.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    {/* USE ACTIONDROPDOWN - THREE DOTS MENU */}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            onClick={() => handleViewClick(fee)}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            onClick={() => handleEditClick(fee)}
                                        >
                                            Edit Fee
                                        </ActionDropdownItem>

                                        <ActionDropdownSeparator />

                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => handleCopyFeeCode(fee)}
                                        >
                                            Copy Fee Code
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<FileText className="h-4 w-4" />}
                                            href={`/fees/${fee.id}/print`}
                                        >
                                            Print Invoice
                                        </ActionDropdownItem>
                                        
                                        {fee.status !== 'paid' && fee.balance > 0 && (
                                            <ActionDropdownItem
                                                icon={<CreditCard className="h-4 w-4" />}
                                                href={route('payments.create', { 
                                                    fee_id: fee.id,
                                                    payer_type: fee.payer_type,
                                                    payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
                                                    payer_name: fee.payer_name,
                                                    contact_number: fee.contact_number,
                                                    address: fee.address,
                                                    purok: fee.purok,
                                                    fee_code: fee.fee_code,
                                                    balance: fee.balance
                                                })}
                                            >
                                                Pay Fee
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(fee)}
                                            dangerous
                                        >
                                            Delete Fee
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Payer Info */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Payer</div>
                                    <div className="truncate text-gray-900">
                                        {fee.payer_name}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="font-medium">Issued</span>
                                        </div>
                                        <div>{formatDate(fee.issue_date)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Clock className={`h-3.5 w-3.5 ${isFeeOverdue ? 'text-red-500' : ''}`} />
                                            <span className={`font-medium ${isFeeOverdue ? 'text-red-600' : ''}`}>
                                                Due
                                            </span>
                                        </div>
                                        <div className={isFeeOverdue ? 'text-red-600 font-medium' : ''}>
                                            {formatDate(fee.due_date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium text-gray-700">Total</div>
                                        <div className="font-bold text-lg">
                                            {formatCurrency(fee.total_amount)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-green-600">
                                            <div className="font-medium">Paid</div>
                                            <div>{formatCurrency(fee.amount_paid || 0)}</div>
                                        </div>
                                        <div className="text-red-600">
                                            <div className="font-medium">Balance</div>
                                            <div>{formatCurrency(fee.balance || fee.total_amount)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="pt-2 border-t">
                                    <div className="flex justify-center">
                                        {getStatusBadge(fee.status, isFeeOverdue)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </GridLayout>
    );
}