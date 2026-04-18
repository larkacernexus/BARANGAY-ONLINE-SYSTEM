// components/admin/fees/FeesGridView.tsx - COMPLETE REVISED FILE

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
    CheckCircle,
    AlertCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Phone,
    MapPin,
    Hash,
    MoreVertical,
    Square,
    CheckSquare,
    Printer
} from 'lucide-react';
import { Fee } from '@/types/admin/fees/fees';

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
    formatCurrency: (amount: number | string | undefined) => string;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
    statuses?: Record<string, string>;
    categories?: Record<string, string>;
    windowWidth?: number;
    isMobile?: boolean;
    isLoading?: boolean;
}

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
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
        return !isNaN(due.getTime()) && today > due;
    } catch {
        return false;
    }
};

const getDaysOverdue = (dueDate: string | null | undefined): number => {
    if (!dueDate) return 0;
    try {
        const due = new Date(dueDate);
        const today = new Date();
        if (isNaN(due.getTime())) return 0;
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
        case 'resident': return <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
        case 'household': return <Home className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
        case 'business': return <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
        default: return <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
    }
};

const getStatusColorClass = (status: string, isFeeOverdue: boolean): string => {
    if (isFeeOverdue) {
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    }
    
    const colors: Record<string, string> = {
        paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        overdue: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        issued: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        partial: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        partially_paid: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        refunded: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

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
    getCategoryColor,
    getCategoryLabel,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile = false,
    isLoading = false
}: FeesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 1024) return 2;
        if (windowWidth < 1800) return 3;
        return 4;
    }, [windowWidth]);
    
    const nameLength = useMemo(() => {
        if (gridCols >= 4) return 25;
        if (gridCols === 3) return 22;
        if (gridCols === 2) return 20;
        return 18;
    }, [gridCols]);

    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;
        setExpandedId(prev => prev === id ? null : id);
    }, [isLoading]);

    const handleCardClick = (feeId: number, e: React.MouseEvent) => {
        if (isBulkMode || isLoading) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setExpandedId(prev => prev === feeId ? null : feeId);
    };

    const handleViewClick = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isLoading) return;
        if (onViewDetails) {
            onViewDetails(fee);
        } else {
            router.get(route('admin.fees.show', fee.id));
        }
    };

    const handleEditClick = (fee: Fee, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isLoading) return;
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
        if (isLoading) return;
        const totalAmount = Number(fee.total_amount ?? fee.amount ?? 0);
        const amountPaid = Number(fee.amount_paid ?? fee.paid_amount ?? 0);
        const balance = Number(fee.balance ?? (totalAmount - amountPaid));
        
        router.get(route('admin.payments.create', { 
            fee_id: fee.id,
            payer_type: fee.payer_type || fee.type || 'resident',
            payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
            payer_name: fee.payer_name || fee.resident?.full_name,
            contact_number: fee.contact_number || fee.resident?.contact_number || fee.resident?.phone,
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
    
    const selectedSet = useMemo(() => new Set(selectedFees), [selectedFees]);

    const canEdit = (status: string) => {
        return status === 'pending' || status === 'issued' || status === 'partial' || status === 'partially_paid';
    };

    const canDelete = (status: string) => {
        return status === 'pending';
    };

    const canRecordPayment = (status: string, balance?: number) => {
        return (status === 'issued' || status === 'partial' || status === 'partially_paid' || status === 'pending') && (balance ?? 0) > 0;
    };

    if (fees.length === 0) {
        return (
            <EmptyState
                title="No fees found"
                description={hasActiveFilters 
                    ? 'Try changing your filters or search criteria.'
                    : 'Get started by creating a fee assessment.'}
                icon={<DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                action={hasActiveFilters ? {
                    label: "Clear Filters",
                    onClick: onClearFilters
                } : undefined}
            />
        );
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
                const isFeeOverdue = isOverdue(fee.due_date, fee.status);
                const daysOverdue = getDaysOverdue(fee.due_date);
                
                const totalAmount = Number(fee.total_amount ?? fee.amount ?? 0);
                const amountPaid = Number(fee.amount_paid ?? fee.paid_amount ?? 0);
                const balance = Number(fee.balance ?? (totalAmount - amountPaid));
                const hasBalance = balance > 0;
                
                return (
                    <Card 
                        key={fee.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isFeeOverdue ? 'border-l-4 border-l-red-500 dark:border-l-red-600' : ''} ${isExpanded ? 'shadow-lg' : ''} ${
                            isLoading ? 'cursor-default' : 'cursor-pointer'
                        }`}
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
                                            {fee.fee_code || fee.code || 'N/A'}
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
                                            disabled={isLoading}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={isLoading}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                            <DropdownMenuItem onClick={(e) => handleViewClick(fee, e)} className="cursor-pointer">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            {canEdit(fee.status) && (
                                                <DropdownMenuItem onClick={(e) => handleEditClick(fee, e)} className="cursor-pointer">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Fee
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => handleCopyFeeCode(fee, e)} className="cursor-pointer">
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Fee Code
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => handlePrint(fee, e)} className="cursor-pointer">
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Invoice
                                            </DropdownMenuItem>
                                            
                                            {canRecordPayment(fee.status, balance) && (
                                                <DropdownMenuItem onClick={(e) => handlePaymentClick(fee, e)} className="cursor-pointer">
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Record Payment
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(fee.id);
                                                    }} className="cursor-pointer">
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
                                            
                                            {canDelete(fee.status) && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(fee);
                                                        }}
                                                        className="text-red-600 dark:text-red-400 cursor-pointer"
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
                                     fee.status === 'partially_paid' ? 'Partial' :
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
                            
                            {/* Primary Info */}
                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    {getPayerIcon(fee.payer_type || fee.type)}
                                    <span className="truncate" title={fee.payer_name || fee.resident?.full_name || 'N/A'}>
                                        {truncateText(fee.payer_name || fee.resident?.full_name || 'N/A', nameLength)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>Due: {formatDate(fee.due_date)}</span>
                                </div>
                                
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
                                        disabled={isLoading}
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
                                    {fee.fee_type?.category && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <Badge variant="outline" className={getCategoryColor(fee.fee_type.category)}>
                                                {getCategoryLabel(fee.fee_type.category)}
                                            </Badge>
                                        </div>
                                    )}

                                    {(fee.contact_number || fee.resident?.contact_number || fee.resident?.phone) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {fee.contact_number || fee.resident?.contact_number || fee.resident?.phone}
                                            </span>
                                        </div>
                                    )}

                                    {(fee.address || fee.resident?.address) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                            <span className="text-gray-900 dark:text-white truncate">
                                                {fee.address || fee.resident?.address}
                                            </span>
                                        </div>
                                    )}

                                    {(fee.purok || fee.resident?.purok) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Home className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {fee.purok || fee.resident?.purok}
                                            </span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 font-medium">
                                                {formatCurrency(totalAmount)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                                            <span className="text-green-600 dark:text-green-400 ml-1 font-medium">
                                                {formatCurrency(amountPaid)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                                            <span className="text-red-600 dark:text-red-400 ml-1 font-medium">
                                                {formatCurrency(balance)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 capitalize">
                                                {fee.status || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">
                                                {formatDateTime(fee.created_at)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">
                                                {formatDateTime(fee.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {fee.or_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">OR#:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.or_number}</span>
                                        </div>
                                    )}

                                    {canRecordPayment(fee.status, balance) && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePaymentClick(fee, e);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Record Payment
                                        </Button>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => handleViewClick(fee, e)}
                                            disabled={isLoading}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(fee.id, e)}
                                            disabled={isLoading}
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