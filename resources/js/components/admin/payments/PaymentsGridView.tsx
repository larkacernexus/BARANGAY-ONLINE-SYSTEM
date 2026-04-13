// components/admin/payments/PaymentsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
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
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { useState, useMemo, useCallback, useEffect } from 'react';
// prettier-ignore
import { Receipt, User, Users, Phone, DollarSign, CreditCard, CheckCircle, Clock, XCircle, FileText, Calendar, Eye, Printer, Copy, Trash2, ChevronDown, ChevronUp, ExternalLink, MapPin, Home, Building, Hash, MoreVertical, Square, CheckSquare } from 'lucide-react';
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
    windowWidth?: number;
    isMobile?: boolean;
}

// Status color classes
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
const formatDate = (dateString: string | null | undefined): string => {
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

const formatDateTime = (dateString: string | null | undefined): string => {
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

// Truncate text helper
const truncateText = (text: string | null | undefined, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    formatCurrency,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile = false
}: PaymentsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    const isCompactView = isMobile;
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth]);
    
    // Adjust text truncation based on grid columns
    const nameLength = useMemo(() => {
        if (gridCols >= 4) return 25;
        if (gridCols === 3) return 22;
        if (gridCols === 2) return 20;
        return 18;
    }, [gridCols]);
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': 
                return <CheckCircle className="h-3 w-3" />;
            case 'pending': 
                return <Clock className="h-3 w-3" />;
            case 'cancelled':
                return <XCircle className="h-3 w-3" />;
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

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (paymentId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(paymentId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedPayments), [selectedPayments]);

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

    // Early return for empty state
    if (payments.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {payments.map((payment) => {
                const isSelected = selectedSet.has(payment.id);
                const isExpanded = expandedId === payment.id;
                
                // Safe accessors with fallbacks
                const payerName = payment.payer_name || 'Unknown';
                const orNumber = payment.or_number || 'N/A';
                const amountPaid = payment.amount_paid || 0;
                const contactNumber = payment.contact_number || null;
                const address = payment.address || null;
                const purok = payment.purok || null;
                const referenceNumber = payment.reference_number || null;
                const periodCovered = payment.period_covered || null;
                const notes = payment.notes || null;
                const remarks = payment.remarks || null;
                
                return (
                    <Card 
                        key={payment.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(payment.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {orNumber}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(payment.payment_date)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(payment.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(payment);
                                            }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onPrintReceipt(payment);
                                            }}>
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Receipt
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(orNumber, 'OR Number');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy OR Number
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(payerName, 'Payer Name');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Payer Name
                                            </DropdownMenuItem>

                                            {contactNumber && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(contactNumber, 'Contact Number');
                                                }}>
                                                    <Phone className="h-4 w-4 mr-2" />
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
                                                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4 mr-2" />
                                                                Select for Bulk
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            {payment.status !== 'completed' && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(payment);
                                                        }}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Payment
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(payment.status)} flex items-center gap-1`}
                                >
                                    {getStatusIcon(payment.status)}
                                    <span>{payment.status === 'completed' ? 'Completed' : 
                                           payment.status === 'pending' ? 'Pending' :
                                           payment.status === 'cancelled' ? 'Cancelled' : payment.status}</span>
                                </Badge>
                            </div>
                            
                            {/* Payer Name */}
                            <h3 
                                className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white"
                                title={payerName}
                            >
                                {truncateText(payerName, nameLength)}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-2 mb-2">
                                {/* Payer Type */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    {getPayerIcon(payment.payer_type)}
                                    <span>{getPayerLabel(payment.payer_type)}</span>
                                </div>
                                
                                {/* Amount Paid */}
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(amountPaid)}
                                    </span>
                                </div>
                                
                                {/* Date and Method */}
                                <div className="flex items-center gap-1.5 flex-wrap text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{payment.formatted_date || formatDate(payment.payment_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {getMethodIcon(payment.payment_method)}
                                        <span className="capitalize">{payment.payment_method}</span>
                                    </div>
                                </div>
                                
                                {/* Discount/Surcharge/Penalty summary */}
                                {(payment.discount > 0 || payment.surcharge > 0 || payment.penalty > 0) && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 pt-1">
                                        {payment.discount > 0 && <div>Discount: -{formatCurrency(payment.discount)}</div>}
                                        {payment.surcharge > 0 && <div>Surcharge: +{formatCurrency(payment.surcharge)}</div>}
                                        {payment.penalty > 0 && <div>Penalty: +{formatCurrency(payment.penalty)}</div>}
                                    </div>
                                )}
                            </div>
                            
                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(payment.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Contact Information */}
                                    {contactNumber && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">{contactNumber}</span>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {address && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{address}</span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    {purok && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                                            <span className="text-gray-900 dark:text-white">{purok}</span>
                                        </div>
                                    )}

                                    {/* Payment Items Summary */}
                                    {payment.items && payment.items.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Items:</div>
                                            <div className="space-y-1 pl-2">
                                                {payment.items.slice(0, 2).map((item) => (
                                                    <div key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
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
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatCurrency(payment.subtotal || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                            <span className="text-green-600 dark:text-green-400 ml-1">-{formatCurrency(payment.discount || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Surcharge:</span>
                                            <span className="text-amber-600 dark:text-amber-400 ml-1">+{formatCurrency(payment.surcharge || 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Penalty:</span>
                                            <span className="text-red-600 dark:text-red-400 ml-1">+{formatCurrency(payment.penalty || 0)}</span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Paid:</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(amountPaid)}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Payment Date:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(payment.payment_date)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Recorded:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(payment.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Reference Number */}
                                    {referenceNumber && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{referenceNumber}</span>
                                        </div>
                                    )}

                                    {/* Period Covered */}
                                    {periodCovered && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Period:</span>
                                            <span className="text-gray-900 dark:text-white">{periodCovered}</span>
                                        </div>
                                    )}

                                    {/* Recorder */}
                                    {payment.recorder?.name && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Recorded by:</span>
                                            <span className="text-gray-900 dark:text-white">{payment.recorder.name}</span>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {notes && (
                                        <div className="text-sm">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Notes:</p>
                                            <p className="text-gray-600 dark:text-gray-400 italic">
                                                "{notes}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Remarks */}
                                    {remarks && (
                                        <div className="text-sm">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Remarks:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(payment);
                                            }}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(payment.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}