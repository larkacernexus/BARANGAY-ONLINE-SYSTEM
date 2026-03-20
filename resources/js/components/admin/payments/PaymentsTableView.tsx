// components/admin/payments/PaymentsTableView.tsx
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
import { Link } from '@inertiajs/react';
import {
    MoreVertical,
    Eye,
    Edit,
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
    ChevronUp
} from 'lucide-react';
import { Payment, Filters } from '@/types/payments.types';

interface PaymentMethod {
    value: string;
    label: string;
    icon: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PayerTypeOption {
    value: string;
    label: string;
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

export default function PaymentsTableView({
    payments,
    isBulkMode,
    selectedPayments,
    filtersState,
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
    statusOptions = [],
    payerTypeOptions = [],
    isLoading,
    windowWidth
}: PaymentsTableViewProps) {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };
    
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };
    
    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
    const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'description' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = windowWidth || window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'address': return 20;
                case 'contact': return 10;
                case 'description': return 15;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'address': return 25;
                case 'contact': return 12;
                case 'description': return 20;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'address': return 30;
                case 'contact': return 15;
                case 'description': return 25;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'description': return 30;
            default: return 30;
        }
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending': 
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            default: 
                return null;
        }
    };
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed': 
                return 'default';
            case 'pending': 
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default: 
                return 'outline';
        }
    };
    
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': 
                return <DollarSign className="h-4 w-4 text-green-500" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-4 w-4 text-blue-500" />;
            case 'bank':
                return <FileText className="h-4 w-4 text-purple-500" />;
            case 'check':
                return <Receipt className="h-4 w-4 text-orange-500" />;
            default: 
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };
    
    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': 
                return <User className="h-4 w-4 text-blue-500" />;
            case 'household':
                return <Users className="h-4 w-4 text-green-500" />;
            default: 
                return <User className="h-4 w-4 text-gray-500" />;
        }
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
                                                checked={isSelectAll && payments.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                                    <div className="flex items-center gap-1">
                                        Actions
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('or_number')}
                                >
                                    OR Number
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('payer_name')}
                                >
                                    Payer Details
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('total_amount')}
                                >
                                    Amount
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('payment_date')}
                                >
                                    Date
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('payment_method')}
                                >
                                    Method
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('status')}
                                >
                                    Status
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    More
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map((payment) => {
                                const isSelected = selectedPayments.includes(payment.id);
                                const nameLength = getTruncationLength('name');
                                const contactLength = getTruncationLength('contact');
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={payment.id} 
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                            }`}
                                            onClick={(e) => {
                                                if (isBulkMode && e.target instanceof HTMLElement && 
                                                    !e.target.closest('a') && 
                                                    !e.target.closest('button') &&
                                                    !e.target.closest('.dropdown-menu-content') &&
                                                    !e.target.closest('input[type="checkbox"]')) {
                                                    onItemSelect(payment.id);
                                                }
                                            }}
                                        >
                                            {isBulkMode && (
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => onItemSelect(payment.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="px-4 py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => togglePaymentExpanded(payment.id)}
                                                    className="h-8 w-8 p-0"
                                                    disabled={isBulkMode}
                                                >
                                                    {expandedPayments.has(payment.id) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div 
                                                    className="flex items-center gap-2 cursor-text select-text"
                                                    onDoubleClick={(e) => {
                                                        const selection = window.getSelection();
                                                        if (selection) {
                                                            const range = document.createRange();
                                                            range.selectNodeContents(e.currentTarget);
                                                            selection.removeAllRanges();
                                                            selection.addRange(range);
                                                        }
                                                    }}
                                                    title={`Double-click to select all\nOR Number: ${payment.or_number}\nReference: ${payment.reference_number || 'N/A'}`}
                                                >
                                                    <Receipt className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate" data-full-text={payment.or_number}>
                                                            {truncateText(payment.or_number, nameLength)}
                                                        </div>
                                                        {payment.reference_number && (
                                                            <div className="text-xs text-gray-500 truncate">
                                                                Ref: {truncateText(payment.reference_number, 12)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div 
                                                    className="flex items-center gap-1 cursor-text select-text"
                                                    onDoubleClick={(e) => {
                                                        const selection = window.getSelection();
                                                        if (selection) {
                                                            const range = document.createRange();
                                                            range.selectNodeContents(e.currentTarget);
                                                            selection.removeAllRanges();
                                                            selection.addRange(range);
                                                        }
                                                    }}
                                                    title={`Double-click to select all\n${payment.payer_name}\n${payment.contact_number || ''}\n${payment.address || ''}`}
                                                >
                                                    {getPayerIcon(payment.payer_type)}
                                                    <div className="min-w-0">
                                                        <div 
                                                            className="font-medium truncate flex items-center gap-1"
                                                            data-full-text={payment.payer_name}
                                                        >
                                                            {truncateText(payment.payer_name, nameLength)}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                                            {payment.contact_number && (
                                                                <div className="flex items-center gap-1 truncate">
                                                                    <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                                                                    <span data-full-text={payment.contact_number}>
                                                                        {truncateText(payment.contact_number, contactLength)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {payment.payer_type === 'resident' ? 'Resident' : 'Household'}
                                                                {payment.household_number && ` • House #${truncateText(payment.household_number, 8)}`}
                                                                {payment.purok && ` • Purok ${payment.purok}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="font-bold">
                                                    <div>{formatCurrency(payment.amount_paid || 0)}</div>
                                                    {payment.surcharge > 0 || payment.penalty > 0 || payment.discount > 0 ? (
                                                        <div className="text-xs text-gray-500">
                                                            {payment.discount > 0 && `Discount: ${formatCurrency(payment.discount || 0)} `}
                                                            {payment.surcharge > 0 && `Surcharge: ${formatCurrency(payment.surcharge || 0)} `}
                                                            {payment.penalty > 0 && `Penalty: ${formatCurrency(payment.penalty || 0)}`}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div>
                                                    <div>{payment.formatted_date || formatDate(payment.payment_date)}</div>
                                                    {payment.period_covered && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            Period: {truncateText(payment.period_covered, 15)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {getMethodIcon(payment.payment_method)}
                                                    <span className="truncate">
                                                        {paymentMethods.find(m => m.value === payment.payment_method)?.label || 
                                                         payment.payment_method}
                                                    </span>
                                                </div>
                                                {payment.purpose && (
                                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                                        {truncateText(payment.purpose, 20)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Badge 
                                                    variant={getStatusVariant(payment.status)} 
                                                    className="truncate max-w-full flex items-center gap-1"
                                                    title={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                >
                                                    {getStatusIcon(payment.status)}
                                                    <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                                                </Badge>
                                                {payment.recorder?.name && (
                                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                                        by {truncateText(payment.recorder.name, 15)}
                                                    </div>
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

                                                        {payment.contact_number && (
                                                            <DropdownMenuItem 
                                                                onClick={() => onCopyToClipboard(payment.contact_number, 'Contact Number')}
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
                                                        
                                                        <DropdownMenuSeparator />
                                                        
                                                        {payment.status !== 'completed' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => onDelete(payment)}
                                                                className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete Payment</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Expanded Row for Payment Items */}
                                        {expandedPayments.has(payment.id) && payment.items && payment.items.length > 0 && (
                                            <TableRow className="bg-gray-50">
                                                <TableCell colSpan={isBulkMode ? 10 : 9} className="p-0">
                                                    <div className="p-4 pl-12 border-t">
                                                        <h4 className="font-medium mb-2">Payment Items</h4>
                                                        <div className="rounded-md border">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Fee Name</TableHead>
                                                                        <TableHead>Description</TableHead>
                                                                        <TableHead>Base Amount</TableHead>
                                                                        <TableHead>Surcharge</TableHead>
                                                                        <TableHead>Penalty</TableHead>
                                                                        <TableHead className="text-right">Total</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {payment.items.map((item) => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell className="font-medium">
                                                                                <div>
                                                                                    <div>{truncateText(item.fee_name, 20)}</div>
                                                                                    <div className="text-xs text-gray-500">{item.fee_code}</div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.description ? truncateText(item.description, 25) : '-'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatCurrency(item.base_amount)}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.surcharge > 0 ? (
                                                                                    <span className="text-amber-600">
                                                                                        {formatCurrency(item.surcharge)}
                                                                                    </span>
                                                                                ) : '-'}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.penalty > 0 ? (
                                                                                    <span className="text-red-600">
                                                                                        {formatCurrency(item.penalty)}
                                                                                    </span>
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
                                                                <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                                                    {truncateText(payment.remarks, 100)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}