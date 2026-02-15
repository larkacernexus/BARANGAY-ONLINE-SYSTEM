// components/admin/payments/PaymentsGridView.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
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
    Calendar,
    Eye,
    Printer,
    Copy,
    Trash2
} from 'lucide-react';
import { Payment } from '@/types/payments.types';

interface PaymentsGridViewProps {
    payments: Payment[];
    isBulkMode: boolean;
    selectedPayments: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (payment: Payment) => void;
    onViewDetails: (payment: Payment) => void;
    onPrintReceipt: (payment: Payment) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    formatCurrency: (amount: number) => string;
}

export default function PaymentsGridView({
    payments,
    isBulkMode,
    selectedPayments,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewDetails,
    onPrintReceipt,
    onCopyToClipboard,
    formatCurrency
}: PaymentsGridViewProps) {
    
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
    
    const getStatusBadgeVariant = (status: string) => {
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
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
            case 'pending': 
                return <Clock className="h-3.5 w-3.5 text-amber-500" />;
            case 'cancelled':
                return <XCircle className="h-3.5 w-3.5 text-gray-500" />;
            default: 
                return null;
        }
    };
    
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': 
                return <DollarSign className="h-3.5 w-3.5 text-green-500" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-3.5 w-3.5 text-blue-500" />;
            case 'bank':
                return <FileText className="h-3.5 w-3.5 text-purple-500" />;
            case 'check':
                return <Receipt className="h-3.5 w-3.5 text-orange-500" />;
            default: 
                return <CreditCard className="h-3.5 w-3.5 text-gray-500" />;
        }
    };
    
    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': 
                return <User className="h-5 w-5 text-blue-600" />;
            case 'household':
                return <Users className="h-5 w-5 text-green-600" />;
            default: 
                return <User className="h-5 w-5 text-gray-600" />;
        }
    };
    
    const getPayerLabel = (payerType: string) => {
        switch (payerType) {
            case 'resident': return 'Resident';
            case 'household': return 'Household';
            default: return 'Payer';
        }
    };

    const emptyState = (
        <EmptyState
            title="No payments found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by recording a payment.'}
            icon={<Receipt className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/payments/create'}
            createLabel="Record Payment"
        />
    );

    return (
        <GridLayout
            isEmpty={payments.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {payments.map((payment) => {
                const isSelected = selectedPayments.includes(payment.id);
                
                return (
                    <Card 
                        key={payment.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(payment.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        {getPayerIcon(payment.payer_type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {payment.payer_name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {getPayerLabel(payment.payer_type)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(payment.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            onClick={() => onViewDetails(payment)}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Printer className="h-4 w-4" />}
                                            onClick={() => onPrintReceipt(payment)}
                                        >
                                            Print Receipt
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(payment.or_number, 'OR Number')}
                                        >
                                            Copy OR Number
                                        </ActionDropdownItem>
                                        
                                        {payment.contact_number && (
                                            <ActionDropdownItem
                                                icon={<Phone className="h-4 w-4" />}
                                                onClick={() => onCopyToClipboard(payment.contact_number!, 'Contact Number')}
                                            >
                                                Copy Contact
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {payment.status !== 'completed' && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => onDelete(payment)}
                                                    dangerous
                                                >
                                                    Delete Payment
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* OR Number */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">OR Number</div>
                                    <div className="flex items-center gap-1 text-gray-900">
                                        <Receipt className="h-3.5 w-3.5" />
                                        {payment.or_number}
                                    </div>
                                </div>

                               {/* Amount */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Amount Paid</div>
                                    <div className="flex items-center gap-1 text-gray-900 font-bold">
                                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                                        {formatCurrency(payment.amount_paid || 0)}
                                    </div>
                                    {payment.discount > 0 || payment.surcharge > 0 || payment.penalty > 0 ? (
                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                            {payment.discount > 0 && (
                                                <div>Discount: -{formatCurrency(payment.discount)}</div>
                                            )}
                                            {payment.surcharge > 0 && (
                                                <div>Surcharge: +{formatCurrency(payment.surcharge)}</div>
                                            )}
                                            {payment.penalty > 0 && (
                                                <div>Penalty: +{formatCurrency(payment.penalty)}</div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Date & Method */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="font-medium">Date</span>
                                        </div>
                                        <div className="text-sm">
                                            {payment.formatted_date || formatDate(payment.payment_date)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            {getMethodIcon(payment.payment_method)}
                                            <span className="font-medium">Method</span>
                                        </div>
                                        <div className="text-sm">
                                            {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="pt-2 border-t">
                                    <div className="flex justify-center">
                                        <Badge 
                                            variant={getStatusBadgeVariant(payment.status)}
                                            className="flex items-center gap-1.5 text-xs"
                                        >
                                            {getStatusIcon(payment.status)}
                                            <span className="capitalize">{payment.status}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}