// components/admin/payments/PaymentsGridView.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { useState } from 'react';
// prettier-ignore
import { Receipt, User, Users, Phone, DollarSign, CreditCard, CheckCircle, Clock, XCircle, FileText, Calendar, Eye, Printer, Copy, Trash2, ChevronDown, ChevronUp, ExternalLink, MapPin, Home, Building, Hash, Info, MoreVertical, Square, CheckSquare } from 'lucide-react';
import { Payment } from '@/types/admin/payments/payments';

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

// Status color classes matching community reports pattern
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Format date helper
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

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

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
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    // Toggle card expansion
    const toggleCardExpansion = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle card click
    const handleCardClick = (paymentId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(paymentId);
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />;
            case 'pending': 
                return <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />;
            case 'cancelled':
                return <XCircle className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
            default: 
                return null;
        }
    };
    
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': 
                return <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
            case 'bank':
                return <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
            case 'check':
                return <Receipt className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />;
            default: 
                return <CreditCard className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
        }
    };
    
    const getPayerIcon = (payerType: string) => {
        switch (payerType) {
            case 'resident': 
                return <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
            case 'household':
                return <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
            case 'business':
                return <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
            default: 
                return <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
        }
    };
    
    const getPayerLabel = (payerType: string) => {
        switch (payerType) {
            case 'resident': return 'Resident';
            case 'household': return 'Household';
            case 'business': return 'Business';
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
                const isExpanded = expandedCards.has(payment.id);
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                const isCompactView = isMobile;
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 30;
                
                return (
                    <Card 
                        key={payment.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(payment.id, e)}
                    >
                        {/* Bulk selection checkbox */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(payment.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(payment.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}

                        {/* Dropdown Menu - 3 dots */}
                        <div className="absolute top-2 right-2 z-20">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(payment);
                                    }}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onPrintReceipt(payment);
                                    }}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print Receipt
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyToClipboard(payment.or_number, 'OR Number');
                                    }}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy OR Number
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyToClipboard(payment.payer_name, 'Payer Name');
                                    }}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Payer Name
                                    </DropdownMenuItem>

                                    {payment.contact_number && (
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyToClipboard(payment.contact_number!, 'Contact Number');
                                        }}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Contact
                                        </DropdownMenuItem>
                                    )}
                                    
                                    {isBulkMode && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onItemSelect(payment.id);
                                            }}>
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
                                    
                                    <DropdownMenuSeparator />
                                    
                                    {payment.status !== 'completed' && (
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(payment);
                                            }}
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Payment
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with icon and OR number */}
                            <div className="flex items-start justify-between mb-2 pr-6">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                                        <Receipt className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`OR Number: ${payment.or_number}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyToClipboard(payment.or_number, 'OR Number');
                                        }}
                                    >
                                        {payment.or_number}
                                    </span>
                                </div>
                                
                                {/* Status badge */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(payment.status)} flex items-center gap-0.5`}
                                    >
                                        {getStatusIcon(payment.status)}
                                        <span>{payment.status === 'completed' ? 'Completed' : 
                                               payment.status === 'pending' ? 'Pending' :
                                               payment.status === 'cancelled' ? 'Cancelled' : payment.status}</span>
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Payer Name - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 pr-6"
                                title={payment.payer_name}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(payment);
                                }}
                            >
                                {payment.payer_name.substring(0, nameLength)}
                                {payment.payer_name.length > nameLength ? '...' : ''}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* Payer Type */}
                                <div className="flex items-center gap-1.5">
                                    {getPayerIcon(payment.payer_type)}
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {getPayerLabel(payment.payer_type)}
                                    </span>
                                </div>
                                
                                {/* Amount Paid */}
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(payment.amount_paid || 0)}
                                    </span>
                                </div>
                                
                                {/* Date and Method */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {payment.formatted_date || formatDate(payment.payment_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {getMethodIcon(payment.payment_method)}
                                        <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                            {payment.payment_method}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Discount/Surcharge/Penalty summary */}
                                {(payment.discount > 0 || payment.surcharge > 0 || payment.penalty > 0) && (
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 pt-1">
                                        {payment.discount > 0 && <div>Discount: -{formatCurrency(payment.discount)}</div>}
                                        {payment.surcharge > 0 && <div>Surcharge: +{formatCurrency(payment.surcharge)}</div>}
                                        {payment.penalty > 0 && <div>Penalty: +{formatCurrency(payment.penalty)}</div>}
                                    </div>
                                )}
                            </div>
                            
                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => toggleCardExpansion(payment.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Contact Information */}
                                    {payment.contact_number && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">{payment.contact_number}</span>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {payment.address && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{payment.address}</span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    {payment.purok && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Home className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                                            <span className="text-gray-900 dark:text-white">{payment.purok}</span>
                                        </div>
                                    )}

                                    {/* Payment Items Summary */}
                                    {payment.items && payment.items.length > 0 && (
                                        <div className="space-y-1 pt-1">
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Payment Items:</div>
                                            <div className="space-y-1 pl-2">
                                                {payment.items.slice(0, 2).map((item) => (
                                                    <div key={item.id} className="text-xs text-gray-600 dark:text-gray-400">
                                                        • {item.fee_name}: {formatCurrency(item.total_amount)}
                                                    </div>
                                                ))}
                                                {payment.items.length > 2 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                                        + {payment.items.length - 2} more item(s)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatCurrency(payment.subtotal || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                            <span className="text-green-600 dark:text-green-400 ml-1">-{formatCurrency(payment.discount || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Surcharge:</span>
                                            <span className="text-amber-600 dark:text-amber-400 ml-1">+{formatCurrency(payment.surcharge || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Penalty:</span>
                                            <span className="text-red-600 dark:text-red-400 ml-1">+{formatCurrency(payment.penalty || 0)}</span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Paid:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(payment.amount_paid || 0)}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Payment Date:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(payment.payment_date)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Recorded:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(payment.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Reference Number */}
                                    {payment.reference_number && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Hash className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{payment.reference_number}</span>
                                        </div>
                                    )}

                                    {/* Period Covered */}
                                    {payment.period_covered && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Period:</span>
                                            <span className="text-gray-900 dark:text-white">{payment.period_covered}</span>
                                        </div>
                                    )}

                                    {/* Recorder */}
                                    {payment.recorder?.name && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <User className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Recorded by:</span>
                                            <span className="text-gray-900 dark:text-white">{payment.recorder.name}</span>
                                        </div>
                                    )}

                                    {/* Notes if available */}
                                    {payment.notes && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Notes:</p>
                                            <p className="text-gray-600 dark:text-gray-400 italic">
                                                "{payment.notes}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Remarks if available */}
                                    {payment.remarks && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Remarks:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {payment.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(payment);
                                            }}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(payment.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {/* Footer Actions */}
                        <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-0.5">
                                    {/* View Details */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(payment);
                                                }}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Print Receipt */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPrintReceipt(payment);
                                                }}
                                            >
                                                <Printer className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Print Receipt</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Copy OR Number */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(payment.or_number, 'OR Number');
                                                }}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Copy OR</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Copy Contact if available */}
                                    {payment.contact_number && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(payment.contact_number!, 'Contact Number');
                                                    }}
                                                >
                                                    <Phone className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Copy Contact</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                {/* Delete button - only for non-completed payments */}
                                {payment.status !== 'completed' && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(payment);
                                                }}
                                            >
                                                <Trash2 className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </GridLayout>
    );
}