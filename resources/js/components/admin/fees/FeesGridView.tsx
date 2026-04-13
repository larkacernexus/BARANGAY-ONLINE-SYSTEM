// components/admin/fees/FeesGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
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
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
    Copy,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Phone,
    MapPin,
    Hash,
    Info,
    MoreVertical,
    Square,
    CheckSquare,
    Printer
} from 'lucide-react';
import { Fee } from '@/types/admin/fees/fees';
import { format, isAfter, isValid, parseISO } from 'date-fns';

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
    getStatusIcon: (status: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
    statuses?: Record<string, string>;
    categories?: Record<string, string>;
    windowWidth?: number;
    isMobile?: boolean;
}

// Safe date formatting functions
const safeFormatDate = (dateString: string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string => {
    if (!dateString) return 'N/A';
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        if (!isValid(date)) return 'Invalid date';
        return format(date, formatStr);
    } catch (error) {
        return 'Invalid date';
    }
};

const formatDate = (dateString: string | null | undefined): string => {
    return safeFormatDate(dateString, 'MMM dd, yyyy');
};

const formatDateTime = (dateString: string | null | undefined): string => {
    return safeFormatDate(dateString, 'MMM dd, yyyy h:mm a');
};

const isOverdue = (dueDate: string | null | undefined): boolean => {
    if (!dueDate) return false;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        return isValid(due) && isAfter(today, due);
    } catch {
        return false;
    }
};

const getDaysOverdue = (dueDate: string | null | undefined): number => {
    if (!dueDate) return 0;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        if (!isValid(due)) return 0;
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    } catch {
        return 0;
    }
};

const getPayerIcon = (payerType?: string) => {
    switch (payerType) {
        case 'resident': return <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
        case 'household': return <Home className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
        case 'business': return <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
        default: return <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
    }
};

// Status color classes
const getStatusColorClass = (status: string, isFeeOverdue: boolean) => {
    if (isFeeOverdue) {
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    }
    
    switch (status) {
        case 'paid': 
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'pending': 
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'partial':
        case 'issued':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default: 
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Truncate text helper
const truncateText = (text: string | null | undefined, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    getStatusIcon,
    getCategoryColor,
    getCategoryLabel,
    statuses = {},
    categories = {},
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile = false
}: FeesGridViewProps) {
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

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (feeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(feeId, e);
    };

    const handleViewClick = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (onViewDetails) {
            onViewDetails(fee);
        } else {
            router.get(route('admin.fees.show', fee.id));
        }
    };

    const handleEditClick = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (onEdit) {
            onEdit(fee);
        } else {
            router.get(route('admin.fees.edit', fee.id));
        }
    };

    const handleCopyFeeCode = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const feeCode = fee.fee_code || fee.code || 'N/A';
        if (onCopyToClipboard) {
            onCopyToClipboard(feeCode, 'Fee Code');
        } else {
            navigator.clipboard.writeText(feeCode);
        }
    };

    const handlePaymentClick = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const totalAmount = fee.total_amount ?? fee.amount ?? 0;
        const amountPaid = fee.amount_paid ?? fee.paid_amount ?? 0;
        const balance = fee.balance ?? (totalAmount - amountPaid);
        
        router.get(route('admin.payments.create', { 
            fee_id: fee.id,
            payer_type: fee.payer_type || fee.type || 'resident',
            payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
            payer_name: fee.payer_name || fee.resident?.full_name,
            contact_number: fee.contact_number || fee.resident?.phone,
            address: fee.address,
            purok: fee.purok,
            fee_code: fee.fee_code || fee.code,
            balance: balance
        }));
    };

    const handlePrint = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        window.open(`/admin/fees/${fee.id}/print`, '_blank');
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedFees), [selectedFees]);

    const emptyState = (
        <EmptyState
            title="No fees found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a fee assessment.'}
            icon={<DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/fees/create'}
            createLabel="Create Fee"
        />
    );

    // Early return for empty state
    if (fees.length === 0) {
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
            {fees.map((fee) => {
                const isSelected = selectedSet.has(fee.id);
                const isExpanded = expandedId === fee.id;
                const isFeeOverdue = isOverdue(fee.due_date) && fee.status !== 'paid';
                const daysOverdue = getDaysOverdue(fee.due_date);
                
                // Safe amount calculations
                const totalAmount = fee.total_amount ?? fee.amount ?? 0;
                const amountPaid = fee.amount_paid ?? fee.paid_amount ?? 0;
                const balance = fee.balance ?? (totalAmount - amountPaid);
                const hasBalance = balance > 0;
                const hasPaid = amountPaid > 0;
                
                // Check if fee can be edited
                const canEdit = fee.status === 'pending' || fee.status === 'issued';
                // Check if fee can be deleted
                const canDelete = fee.status === 'pending';
                
                return (
                    <Card 
                        key={fee.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isFeeOverdue ? 'border-l-4 border-l-red-500 dark:border-l-red-600' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(fee.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {fee.fee_code || fee.code}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(fee.created_at || fee.issue_date)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(fee.id)}
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
                                            <DropdownMenuItem onClick={(e) => handleViewClick(fee, e)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            {canEdit && (
                                                <DropdownMenuItem onClick={(e) => handleEditClick(fee, e)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Fee
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => handleCopyFeeCode(fee, e)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Fee Code
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => handlePrint(fee, e)}>
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Invoice
                                            </DropdownMenuItem>
                                            
                                            {fee.status !== 'paid' && hasBalance && (
                                                <DropdownMenuItem onClick={(e) => handlePaymentClick(fee, e)}>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Process Payment
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(fee.id);
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
                                            
                                            {canDelete && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(fee);
                                                        }}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Fee
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColorClass(fee.status, isFeeOverdue)}`}
                                >
                                    {isFeeOverdue ? `Overdue (${daysOverdue}d)` : 
                                     fee.status === 'paid' ? 'Paid' :
                                     fee.status === 'pending' ? 'Pending' :
                                     fee.status === 'partial' ? 'Partial' :
                                     fee.status === 'issued' ? 'Issued' : fee.status}
                                </Badge>
                            </div>
                            
                            {/* Fee Type */}
                            <h3 
                                className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white"
                                title={fee.fee_type?.name || 'Fee Assessment'}
                            >
                                {fee.fee_type?.name || 'Fee Assessment'}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-2 mb-2">
                                {/* Payer Info */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    {getPayerIcon(fee.payer_type || fee.type)}
                                    <span className="truncate" title={fee.payer_name || fee.resident?.full_name || 'N/A'}>
                                        {truncateText(fee.payer_name || fee.resident?.full_name || 'N/A', nameLength)}
                                    </span>
                                </div>
                                
                                {/* Dates */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>Due: {formatDate(fee.due_date)}</span>
                                </div>
                                
                                {/* Amount Summary */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                                
                                {hasBalance && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Balance:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">
                                            {formatCurrency(balance)}
                                        </span>
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
                                        onClick={(e) => handleToggleExpand(fee.id, e)}
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
                                    {/* Fee Type Category */}
                                    {fee.fee_type?.category && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <Badge variant="outline" className={getCategoryColor(fee.fee_type.category)}>
                                                {getCategoryLabel(fee.fee_type.category)}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Contact Information */}
                                    {(fee.contact_number || fee.resident?.phone) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.contact_number || fee.resident?.phone}</span>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {(fee.address || fee.resident?.address) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{fee.address || fee.resident?.address}</span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    {(fee.purok || fee.resident?.purok) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Home className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.purok || fee.resident?.purok}</span>
                                        </div>
                                    )}

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 font-medium">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                                            <span className="text-green-600 dark:text-green-400 ml-1 font-medium">{formatCurrency(amountPaid)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                                            <span className="text-red-600 dark:text-red-400 ml-1 font-medium">{formatCurrency(balance)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 capitalize">{fee.status || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(fee.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(fee.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Payment button for unpaid fees */}
                                    {fee.status !== 'paid' && hasBalance && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePaymentClick(fee, e);
                                            }}
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Process Payment
                                        </Button>
                                    )}

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => handleViewClick(fee, e)}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(fee.id, e)}
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