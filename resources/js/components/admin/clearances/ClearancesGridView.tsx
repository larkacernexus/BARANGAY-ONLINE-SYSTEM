// components/admin/clearances/ClearancesGridView.tsx

import React, { useCallback, useMemo, memo, useState, useEffect } from 'react';
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
    ChevronDown, ChevronUp, Hash, FileCheck, Square, CheckSquare
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
    windowWidth?: number;
    isMobile?: boolean;
}

// Helper functions
const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
        'pending': <Clock className="h-3 w-3" />,
        'pending_payment': <DollarSign className="h-3 w-3" />,
        'processing': <RefreshCw className="h-3 w-3" />,
        'approved': <CheckCircle className="h-3 w-3" />,
        'issued': <CheckCircle className="h-3 w-3" />,
        'rejected': <XCircle className="h-3 w-3" />,
        'cancelled': <XCircle className="h-3 w-3" />,
        'expired': <AlertCircle className="h-3 w-3" />
    };
    return icons[status] || <Clock className="h-3 w-3" />;
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        'pending_payment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'processing': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'approved': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'issued': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'rejected': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'cancelled': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'expired': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'pending_payment': 'Awaiting Payment',
        'processing': 'Processing',
        'approved': 'Approved',
        'issued': 'Issued',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled',
        'expired': 'Expired'
    };
    return statusMap[status] || status;
};

const getUrgencyColor = (urgency: string): string => {
    const colors: Record<string, string> = {
        'normal': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'rush': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'express': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    };
    return colors[urgency] || colors.normal;
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
        case 'household': return <Home className="h-3.5 w-3.5" />;
        case 'business': return <Building className="h-3.5 w-3.5" />;
        default: return <User className="h-3.5 w-3.5" />;
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
    truncateLengths,
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
    truncateLengths: { purpose: number; name: number };
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
            } ${isExpanded ? 'shadow-lg' : ''} ${isPriority ? 'border-l-4 border-l-amber-500' : ''} cursor-pointer`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {clearance.reference_number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {clearance.clearance_number ? `#${clearance.clearance_number}` : formatDate(clearance.created_at)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(clearance.id)}
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
                                <DropdownMenuItem onClick={(e) => onViewDetails(clearance.id, e)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                
                                {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/clearances/${clearance.id}/edit`} className="flex items-center">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Request
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={handleCopyReference}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Reference
                                </DropdownMenuItem>
                                
                                {clearance.status === 'issued' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/clearances/${clearance.id}/print`} className="flex items-center">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print Clearance
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                {clearance.status === 'pending_payment' && (
                                    <DropdownMenuItem onClick={handlePaymentClick}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Record Payment
                                    </DropdownMenuItem>
                                )}
                                
                                {isBulkMode && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onItemSelect(clearance.id);
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
                                
                                {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-red-600 dark:text-red-400"
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

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getStatusColor(clearance.status)}`}
                    >
                        {getStatusIcon(clearance.status)}
                        <span className="ml-1">{getStatusDisplay(clearance.status)}</span>
                    </Badge>
                    
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getUrgencyColor(clearance.urgency)}`}
                    >
                        {getUrgencyIcon(clearance.urgency)}
                        <span className="ml-1">{getUrgencyDisplay(clearance.urgency)}</span>
                    </Badge>
                    
                    {clearance.clearance_type?.name && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                            <FileCheck className="h-3 w-3 mr-1" />
                            {truncateText(clearance.clearance_type.name, 15)}
                        </Badge>
                    )}
                </div>

                {/* Payer Info */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {getPayerIcon(anyClearance.payer_type)}
                    <span className="truncate" title={payerName}>
                        {truncateText(payerName, truncateLengths.name)}
                    </span>
                </div>

                {/* Purpose */}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                    {truncateText(clearance.purpose, truncateLengths.purpose)}
                </p>

                {/* Fee & Date */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Receipt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                            ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(clearance.created_at)}</span>
                    </div>
                </div>

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
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
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
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "{truncateText(anyClearance.remarks, 100)}"
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            {clearance.status === 'pending_payment' && (
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handlePaymentClick}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Record Payment
                                </Button>
                            )}
                            
                            {clearance.status === 'issued' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    asChild
                                >
                                    <Link href={`/admin/clearances/${clearance.id}/print`}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* View full details link */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                onClick={(e) => onViewDetails(clearance.id, e)}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                View full details
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => onToggleExpand(clearance.id, e)}
                            >
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
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
    handleRecordPayment,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    isMobile = false
}: ClearancesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth]);
    
    // Adjust text truncation based on grid columns
    const getTruncateLengths = useMemo(() => {
        if (gridCols >= 4) return { purpose: 60, name: 25 };
        if (gridCols === 3) return { purpose: 50, name: 22 };
        if (gridCols === 2) return { purpose: 45, name: 20 };
        return { purpose: 40, name: 18 };
    }, [gridCols]);

    const truncateLengths = getTruncateLengths;
    
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

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
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
                    truncateLengths={truncateLengths}
                    isMobile={isMobile}
                />
            ))}
        </GridLayout>
    );
}