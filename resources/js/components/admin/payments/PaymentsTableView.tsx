import React, { useCallback, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MoreVertical,
    Eye,
    Printer,
    Copy,
    Trash2,
    CheckSquare,
    Square,
    Receipt,
    User,
    Users,
    Phone,
    DollarSign,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    ChevronDown,
    ChevronUp,
    Building2,
    Landmark
} from 'lucide-react';
import { Payment, Filters } from '@/types/admin/payments/payments';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

interface StatusOption {
    value: string;
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface PayerTypeOption {
    value: string;
    label: string;
    icon?: React.ReactNode; // Make icon optional
}

interface PaymentsTableViewProps {
    payments: Payment[];
    isBulkMode: boolean;
    selectedPayments: number[];
    filtersState: Filters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (payment: Payment) => void;
    onViewDetails: (payment: Payment) => void;
    onPrintReceipt: (payment: Payment) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    expandedPayments: Set<number>;
    togglePaymentExpanded: (id: number) => void;
    paymentMethods?: PaymentMethod[];
    statusOptions?: StatusOption[];
    payerTypeOptions?: PayerTypeOption[];
    isLoading: boolean;
    windowWidth: number;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    completed: {
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default',
        label: 'Completed'
    },
    pending: {
        icon: <Clock className="h-4 w-4" />,
        variant: 'secondary',
        label: 'Pending'
    },
    cancelled: {
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive',
        label: 'Cancelled'
    }
};

const DEFAULT_PAYER_ICONS: Record<string, React.ReactNode> = {
    resident: <User className="h-4 w-4 text-blue-500" />,
    household: <Users className="h-4 w-4 text-green-500" />,
    business: <Building2 className="h-4 w-4 text-purple-500" />
};

const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
    cash: <DollarSign className="h-4 w-4 text-green-500" />,
    gcash: <CreditCard className="h-4 w-4 text-blue-500" />,
    maya: <CreditCard className="h-4 w-4 text-blue-500" />,
    online: <CreditCard className="h-4 w-4 text-blue-500" />,
    bank: <Landmark className="h-4 w-4 text-purple-500" />,
    check: <FileText className="h-4 w-4 text-orange-500" />
};

const TRUNCATION_CONFIG = {
    mobile: { name: 15, address: 20, contact: 10, description: 15 },
    tablet: { name: 20, address: 25, contact: 12, description: 20 },
    smallDesktop: { name: 25, address: 30, contact: 15, description: 25 },
    largeDesktop: { name: 30, address: 35, contact: 15, description: 30 }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
};

const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'description', windowWidth: number): number => {
    let size: keyof typeof TRUNCATION_CONFIG;
    
    if (windowWidth < 640) size = 'mobile';
    else if (windowWidth < 768) size = 'tablet';
    else if (windowWidth < 1024) size = 'smallDesktop';
    else size = 'largeDesktop';
    
    return TRUNCATION_CONFIG[size][type];
};

// ✅ Safe helper to get payer type with fallback
const getSafePayerType = (payerType: string | undefined): string => {
    return payerType || 'resident';
};

// ✅ Safe helper to get contact number with fallback
const getSafeContactNumber = (contactNumber: string | undefined): string => {
    return contactNumber || '';
};

// ============================================
// COMPONENT
// ============================================

export default function PaymentsTableView({
    payments,
    isBulkMode,
    selectedPayments,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewDetails,
    onPrintReceipt,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    expandedPayments,
    togglePaymentExpanded,
    paymentMethods = [],
    payerTypeOptions = [],
    isLoading,
    windowWidth
}: PaymentsTableViewProps) {
    
    // Memoized truncation values
    const truncationLengths = useMemo(() => ({
        name: getTruncationLength('name', windowWidth),
        contact: getTruncationLength('contact', windowWidth),
        address: getTruncationLength('address', windowWidth),
        description: getTruncationLength('description', windowWidth)
    }), [windowWidth]);
    
    // Handle row click for bulk selection
    const handleRowClick = useCallback((e: React.MouseEvent, paymentId: number) => {
        if (!isBulkMode) return;
        
        const target = e.target as HTMLElement;
        const isClickableElement = target.closest('a') || 
                                   target.closest('button') || 
                                   target.closest('.dropdown-menu-content') ||
                                   target.closest('input[type="checkbox"]');
        
        if (!isClickableElement) {
            onItemSelect(paymentId);
        }
    }, [isBulkMode, onItemSelect]);
    
    // Handle text selection on double click
    const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNodeContents(e.currentTarget);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, []);
    
    // Get status badge configuration
    const getStatusConfig = useCallback((status: string) => {
        return STATUS_CONFIG[status] || {
            icon: null,
            variant: 'outline' as const,
            label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'
        };
    }, []);
    
    // Get payment method display
    const getPaymentMethodDisplay = useCallback((method: string) => {
        const methodConfig = paymentMethods.find(m => m.value === method);
        return {
            icon: PAYMENT_METHOD_ICONS[method] || PAYMENT_METHOD_ICONS.online,
            label: methodConfig?.label || method
        };
    }, [paymentMethods]);
    
    // ✅ Fixed: Get payer icon - first check payerTypeOptions, then fallback to defaults
    const getPayerIcon = useCallback((payerType: string | undefined) => {
        const safeType = getSafePayerType(payerType);
        
        // Try to get icon from payerTypeOptions first
        const option = payerTypeOptions.find(opt => opt.value === safeType);
        if (option?.icon) {
            return option.icon;
        }
        
        // Fallback to default icons
        return DEFAULT_PAYER_ICONS[safeType] || <User className="h-4 w-4 text-gray-500" />;
    }, [payerTypeOptions]);
    
    // ✅ Fixed: Get payer type display label
    const getPayerTypeLabel = useCallback((payerType: string | undefined): string => {
        const safeType = getSafePayerType(payerType);
        
        // Try to get label from payerTypeOptions first
        const option = payerTypeOptions.find(opt => opt.value === safeType);
        if (option?.label) {
            return option.label;
        }
        
        // Fallback to default labels
        switch (safeType) {
            case 'resident': return 'Resident';
            case 'household': return 'Household';
            case 'business': return 'Business';
            default: return 'Resident';
        }
    }, [payerTypeOptions]);
    
    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-500">Loading payments...</p>
                </div>
            </div>
        );
    }
    
    // Empty state
    if (payments.length === 0) {
        return (
            <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                    {hasActiveFilters 
                        ? 'Try adjusting your filters to see more results'
                        : 'No payment records available'}
                </p>
                {hasActiveFilters && (
                    <Button onClick={onClearFilters} variant="outline" className="mt-4">
                        Clear Filters
                    </Button>
                )}
            </div>
        );
    }
    
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
                                                checked={isSelectAll && payments.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                aria-label="Select all payments on page"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[50px]">
                                    <span className="sr-only">Expand</span>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('or_number')}
                                >
                                    OR Number
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('payer_name')}
                                >
                                    Payer Details
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('total_amount')}
                                >
                                    Amount
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('payment_date')}
                                >
                                    Date
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('payment_method')}
                                >
                                    Method
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => onSort('status')}
                                >
                                    Status
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map((payment) => {
                                const isSelected = selectedPayments.includes(payment.id);
                                const statusConfig = getStatusConfig(payment.status);
                                const methodDisplay = getPaymentMethodDisplay(payment.payment_method);
                                const isExpanded = expandedPayments.has(payment.id);
                                const safeContactNumber = getSafeContactNumber(payment.contact_number);
                                const payerTypeLabel = getPayerTypeLabel(payment.payer_type);
                                
                                return (
                                    <React.Fragment key={payment.id}>
                                        <TableRow 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                            }`}
                                            onClick={(e) => handleRowClick(e, payment.id)}
                                        >
                                            {isBulkMode && (
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => onItemSelect(payment.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            aria-label={`Select payment ${payment.or_number}`}
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                            
                                            <TableCell className="px-4 py-3">
                                                {payment.items && payment.items.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => togglePaymentExpanded(payment.id)}
                                                        className="h-8 w-8 p-0"
                                                        disabled={isBulkMode}
                                                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <div 
                                                    className="flex items-center gap-2 cursor-text select-text"
                                                    onDoubleClick={handleDoubleClick}
                                                    title={`OR Number: ${payment.or_number}\nReference: ${payment.reference_number || 'N/A'}`}
                                                >
                                                    <Receipt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate">
                                                            {truncateText(payment.or_number, truncationLengths.name)}
                                                        </div>
                                                        {payment.reference_number && (
                                                            <div className="text-xs text-gray-500 truncate">
                                                                Ref: {truncateText(payment.reference_number, truncationLengths.contact)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <div 
                                                    className="flex items-center gap-2 cursor-text select-text"
                                                    onDoubleClick={handleDoubleClick}
                                                    title={`${payment.payer_name}\n${safeContactNumber || ''}\n${payment.address || ''}`}
                                                >
                                                    {getPayerIcon(payment.payer_type)}
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate">
                                                            {truncateText(payment.payer_name, truncationLengths.name)}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                                            {safeContactNumber && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                                                                    <span>{truncateText(safeContactNumber, truncationLengths.contact)}</span>
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500">
                                                                {payerTypeLabel}
                                                                {payment.household_number && ` • #${truncateText(payment.household_number, 8)}`}
                                                                {payment.purok && ` • Purok ${payment.purok}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <div>
                                                    <div className="font-bold">{formatCurrency(payment.amount_paid || 0)}</div>
                                                    {(payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0) && (
                                                        <div className="text-xs text-gray-500 space-y-0.5">
                                                            {payment.discount > 0 && <div>Discount: {formatCurrency(payment.discount)}</div>}
                                                            {payment.surcharge > 0 && <div>Surcharge: {formatCurrency(payment.surcharge)}</div>}
                                                            {payment.penalty > 0 && <div>Penalty: {formatCurrency(payment.penalty)}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <div>
                                                    <div>{payment.formatted_date || formatDate(payment.payment_date)}</div>
                                                    {payment.period_covered && (
                                                        <div className="text-xs text-gray-500 truncate" title={payment.period_covered}>
                                                            {truncateText(payment.period_covered, truncationLengths.contact)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {methodDisplay.icon}
                                                    <span className="truncate">{methodDisplay.label}</span>
                                                </div>
                                                {payment.purpose && (
                                                    <div className="text-xs text-gray-500 mt-1 truncate" title={payment.purpose}>
                                                        {truncateText(payment.purpose, truncationLengths.description)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3">
                                                <Badge 
                                                    variant={statusConfig.variant} 
                                                    className="truncate max-w-full flex items-center gap-1"
                                                    title={statusConfig.label}
                                                >
                                                    {statusConfig.icon}
                                                    <span>{statusConfig.label}</span>
                                                </Badge>
                                                {payment.recorder?.name && (
                                                    <div className="text-xs text-gray-500 mt-1 truncate" title={payment.recorder.name}>
                                                        by {truncateText(payment.recorder.name, truncationLengths.name)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            onClick={(e) => e.stopPropagation()}
                                                            aria-label="Open payment actions menu"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem 
                                                            onClick={() => onViewDetails(payment)}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => onPrintReceipt(payment)}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Receipt</span>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuSeparator />
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => onCopyToClipboard(payment.or_number, 'OR Number')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy OR Number</span>
                                                        </DropdownMenuItem>
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => onCopyToClipboard(payment.payer_name, 'Payer Name')}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Copy Payer Name</span>
                                                        </DropdownMenuItem>

                                                        {safeContactNumber && (
                                                            <DropdownMenuItem 
                                                                onClick={() => onCopyToClipboard(safeContactNumber, 'Contact Number')}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Copy Contact</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        
                                                        {isBulkMode && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onClick={() => onItemSelect(payment.id)}
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
                                                        
                                                        {payment.status !== 'completed' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onClick={() => onDelete(payment)}
                                                                    className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    <span>Delete Payment</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Expanded Row for Payment Items */}
                                        {isExpanded && payment.items && payment.items.length > 0 && (
                                            <TableRow className="bg-gray-50 dark:bg-gray-900/20">
                                                <TableCell colSpan={isBulkMode ? 9 : 8} className="p-0">
                                                    <div className="p-4 pl-12 border-t">
                                                        <h4 className="font-medium mb-3">Payment Items</h4>
                                                        <div className="rounded-md border overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="min-w-[150px]">Fee Name</TableHead>
                                                                        <TableHead className="min-w-[150px]">Description</TableHead>
                                                                        <TableHead className="min-w-[100px]">Base Amount</TableHead>
                                                                        <TableHead className="min-w-[100px]">Surcharge</TableHead>
                                                                        <TableHead className="min-w-[100px]">Penalty</TableHead>
                                                                        <TableHead className="min-w-[100px] text-right">Total</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {payment.items.map((item) => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell className="font-medium">
                                                                                <div>
                                                                                    <div>{truncateText(item.fee_name, truncationLengths.name)}</div>
                                                                                    <div className="text-xs text-gray-500">{item.fee_code}</div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-gray-600">
                                                                                {item.description ? truncateText(item.description, truncationLengths.description) : '-'}
                                                                            </TableCell>
                                                                            <TableCell>{formatCurrency(item.base_amount)}</TableCell>
                                                                            <TableCell>
                                                                                {item.surcharge > 0 ? (
                                                                                    <span className="text-amber-600">{formatCurrency(item.surcharge)}</span>
                                                                                ) : '-'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.penalty > 0 ? (
                                                                                    <span className="text-red-600">{formatCurrency(item.penalty)}</span>
                                                                                ) : '-'}
                                                                            </TableCell>
                                                                            <TableCell className="text-right font-bold">
                                                                                {formatCurrency(item.total_amount)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        {payment.remarks && (
                                                            <div className="mt-3">
                                                                <h4 className="font-medium mb-1">Remarks</h4>
                                                                <p className="text-sm text-gray-600 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                                                    {payment.remarks}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}