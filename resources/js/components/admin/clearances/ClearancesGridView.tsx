// components/admin/clearances/ClearancesGridView.tsx

import React, { useCallback, useMemo, memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    FileText, User, Clock, DollarSign, RefreshCw, 
    CheckCircle, XCircle, AlertCircle, Zap, AlertTriangle,
    Eye, Edit, Printer, Trash2, Copy, MoreVertical,
    CreditCard, Home, Building, Calendar, Receipt,
    ChevronDown, ChevronUp, Hash, FileCheck
} from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance';
import { JSX } from 'react';

// Define a simplified Resident type that matches the actual data structure
interface SimpleResident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    contact_number?: string;
    email?: string;
    address?: any;
    purok?: any;
}

interface ClearancesGridViewProps {
    clearances: ClearanceRequest[];
    isBulkMode: boolean;
    selectedClearances: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (clearance: ClearanceRequest) => void;
    onViewPhoto: (clearance: ClearanceRequest) => void;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
}

// Helper functions
const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
        'pending': <Clock className="h-4 w-4 text-amber-500" />,
        'pending_payment': <DollarSign className="h-4 w-4 text-amber-500" />,
        'processing': <RefreshCw className="h-4 w-4 text-blue-500" />,
        'approved': <CheckCircle className="h-4 w-4 text-green-500" />,
        'issued': <CheckCircle className="h-4 w-4 text-green-500" />,
        'rejected': <XCircle className="h-4 w-4 text-red-500" />,
        'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
        'expired': <AlertCircle className="h-4 w-4 text-gray-500" />
    };
    return icons[status] || <Clock className="h-4 w-4 text-gray-500" />;
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        'pending': 'secondary',
        'pending_payment': 'outline',
        'processing': 'outline',
        'approved': 'outline',
        'issued': 'default',
        'rejected': 'destructive',
        'cancelled': 'outline',
        'expired': 'outline'
    };
    return variants[status] || 'outline';
};

const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
        'pending': 'Pending Review',
        'pending_payment': 'Pending Payment',
        'processing': 'Under Processing',
        'approved': 'Approved',
        'issued': 'Issued',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled',
        'expired': 'Expired'
    };
    return statusMap[status] || status;
};

const getUrgencyVariant = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        'normal': 'outline',
        'rush': 'secondary',
        'express': 'default'
    };
    return variants[urgency] || 'outline';
};

const getUrgencyDisplay = (urgency: string): string => {
    const urgencyMap: Record<string, string> = {
        'normal': 'Normal',
        'rush': 'Rush',
        'express': 'Express'
    };
    return urgencyMap[urgency] || 'Normal';
};

const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'express') return <Zap className="h-3 w-3" />;
    if (urgency === 'rush') return <AlertTriangle className="h-3 w-3" />;
    return null;
};

const getPayerIcon = (payerType?: string) => {
    switch (payerType) {
        case 'household': return <Home className="h-4 w-4 text-gray-500" />;
        case 'business': return <Building className="h-4 w-4 text-gray-500" />;
        default: return <User className="h-4 w-4 text-gray-500" />;
    }
};

const getResidentName = (resident?: SimpleResident): string => {
    if (!resident) return 'N/A';
    if (resident.full_name && typeof resident.full_name === 'string') return resident.full_name;
    if (resident.first_name || resident.last_name) {
        const firstName = typeof resident.first_name === 'string' ? resident.first_name : '';
        const lastName = typeof resident.last_name === 'string' ? resident.last_name : '';
        return `${firstName} ${lastName}`.trim();
    }
    return 'N/A';
};

const getPayerName = (clearance: ClearanceRequest): string => {
    const anyClearance = clearance as any;
    
    if (anyClearance.payer_name && typeof anyClearance.payer_name === 'string') {
        return anyClearance.payer_name;
    }
    
    if (anyClearance.payer_type === 'resident') {
        return getResidentName(clearance.resident as SimpleResident);
    }
    
    if (anyClearance.payer_type === 'household') {
        if (anyClearance.household?.head_name) return anyClearance.household.head_name;
        if (anyClearance.household?.household_number) return `Household ${anyClearance.household.household_number}`;
    }
    
    if (anyClearance.payer_type === 'business') {
        if (anyClearance.business?.business_name) return anyClearance.business.business_name;
    }
    
    return getResidentName(clearance.resident as SimpleResident) || 'N/A';
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Shared Clearance Card Component
const ClearanceCard = memo(({ 
    clearance, 
    isBulkMode, 
    isSelected, 
    isExpanded,
    onItemSelect,
    onDelete,
    onViewPhoto,
    handleRecordPayment,
    onToggleExpand,
    onViewDetails,
    isMobile = false
}: {
    clearance: ClearanceRequest;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (clearance: ClearanceRequest) => void;
    onViewPhoto: (clearance: ClearanceRequest) => void;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    onViewDetails: (id: number, e: React.MouseEvent) => void;
    isMobile?: boolean;
}) => {
    const anyClearance = clearance as any;
    const isPriority = clearance.urgency === 'express' || clearance.urgency === 'rush';
    const payerName = getPayerName(clearance);
    
    // Memoized handlers
    const handleCardClick = useCallback((e: React.MouseEvent) => {
        if (isBulkMode) return;
        onToggleExpand(clearance.id, e);
    }, [isBulkMode, clearance.id, onToggleExpand]);

    const handlePaymentClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleRecordPayment(clearance);
    }, [handleRecordPayment, clearance]);

    const handleCopyReference = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(clearance.reference_number);
        toast.success('Reference number copied to clipboard');
    }, [clearance.reference_number]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(clearance);
    }, [onDelete, clearance]);

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} ${isPriority ? 'border-l-4 border-l-amber-500' : ''} cursor-pointer group`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(clearance.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 flex-shrink-0"
                            />
                        )}
                        <Badge 
                            variant={getStatusVariant(clearance.status)}
                            className="flex items-center gap-1 flex-shrink-0"
                        >
                            {getStatusIcon(clearance.status)}
                            <span>{getStatusDisplay(clearance.status)}</span>
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
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
                                <DropdownMenuItem onClick={(e) => onViewDetails(clearance.id, e)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                
                                {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/clearances/${clearance.id}/edit`} className="flex items-center cursor-pointer">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Request
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                {clearance.status === 'pending_payment' && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={handlePaymentClick}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                                            <span className="text-green-600 font-medium">Record Payment</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={handleCopyReference}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Reference
                                </DropdownMenuItem>
                                
                                {clearance.status === 'issued' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/clearances/${clearance.id}/print`} className="flex items-center cursor-pointer">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print Clearance
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Cancel Request
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Reference Number */}
                <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-100 truncate">
                            {clearance.reference_number}
                        </span>
                    </div>
                    {clearance.clearance_number && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate ml-5">
                            #{clearance.clearance_number}
                        </div>
                    )}
                </div>

                {/* Payer Info */}
                <div className="flex items-start gap-2 mb-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getPayerIcon(anyClearance.payer_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {truncateText(payerName, 25)}
                        </div>
                        {anyClearance.payer_type && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {anyClearance.payer_type.charAt(0).toUpperCase() + anyClearance.payer_type.slice(1)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Purpose & Type */}
                <div className="mb-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1.5">
                        {clearance.purpose}
                    </div>
                    <Badge variant="outline" className="text-xs">
                        <FileCheck className="h-3 w-3 mr-1" />
                        {clearance.clearance_type?.name || 'N/A'}
                    </Badge>
                </div>

                {/* Fee & Urgency */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <Receipt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    </div>
                    <Badge 
                        variant={getUrgencyVariant(clearance.urgency)}
                        className={`flex items-center gap-1 ${isPriority ? 'font-semibold' : ''}`}
                    >
                        {getUrgencyIcon(clearance.urgency)}
                        {getUrgencyDisplay(clearance.urgency)}
                    </Badge>
                </div>

                {/* Date Info */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Created: {formatDate(clearance.created_at)}</span>
                </div>

                {/* Priority Badge */}
                {isPriority && (
                    <div className="mb-2">
                        <Badge 
                            variant={clearance.urgency === 'express' ? "destructive" : "secondary"} 
                            className="text-xs w-full justify-center"
                        >
                            {clearance.urgency === 'express' ? (
                                <>
                                    <Zap className="h-3 w-3 mr-1" />
                                    Express Priority
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Rush Priority
                                </>
                            )}
                        </Badge>
                    </div>
                )}

                {/* Expand/Collapse indicator */}
                {!isBulkMode && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isExpanded ? 'Hide details' : 'Click to view details'}
                        </div>
                        <button
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={(e) => onToggleExpand(clearance.id, e)}
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
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50 duration-200">
                        {/* Additional Info */}
                        {anyClearance.valid_until && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Valid until: {formatDate(anyClearance.valid_until)}
                                </span>
                            </div>
                        )}

                        {anyClearance.processed_by && (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Processed by: {anyClearance.processed_by}
                                </span>
                            </div>
                        )}

                        {anyClearance.remarks && (
                            <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Remarks:</p>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                                    "{truncateText(anyClearance.remarks, 100)}"
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            {clearance.status === 'pending_payment' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={handlePaymentClick}
                                >
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    Record Payment
                                </Button>
                            )}
                            
                            {clearance.status === 'issued' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    asChild
                                >
                                    <Link href={`/admin/clearances/${clearance.id}/print`}>
                                        <Printer className="h-3 w-3 mr-1" />
                                        Print
                                    </Link>
                                </Button>
                            )}
                            
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={(e) => onViewDetails(clearance.id, e)}
                            >
                                <Eye className="h-3 w-3 mr-1" />
                                View Full Details
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

ClearanceCard.displayName = 'ClearanceCard';

// Empty State Component
const EmptyStateComponent = ({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
    <EmptyState
        title="No clearances found"
        description={hasActiveFilters 
            ? 'Try changing your filters or search criteria.'
            : 'Get started by creating a clearance request.'}
        icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
        hasFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
    />
);

// Main Grid View Component
export default function ClearancesGridView({
    clearances,
    isBulkMode,
    selectedClearances,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    handleRecordPayment
}: ClearancesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    
    // Memoized handlers
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleViewDetails = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `/admin/clearances/${id}`;
    }, []);

    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedClearances), [selectedClearances]);

    // Early return for empty state
    if (clearances.length === 0) {
        return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
    }

    // Grid layout configuration
    const gridLayoutProps = {
        isEmpty: false,
        emptyState: null,
        gridCols: { base: 1, sm: 2, lg: 3, xl: 4 } as const,
        gap: { base: '3', sm: '4' } as const,
        padding: "p-4" as const
    };

    return (
        <GridLayout {...gridLayoutProps}>
            {clearances.map((clearance) => (
                <ClearanceCard
                    key={clearance.id}
                    clearance={clearance}
                    isBulkMode={isBulkMode}
                    isSelected={selectedSet.has(clearance.id)}
                    isExpanded={expandedId === clearance.id}
                    onItemSelect={onItemSelect}
                    onDelete={onDelete}
                    onViewPhoto={onViewPhoto}
                    handleRecordPayment={handleRecordPayment}
                    onToggleExpand={handleToggleExpand}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </GridLayout>
    );
}