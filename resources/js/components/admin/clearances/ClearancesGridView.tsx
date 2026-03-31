// components/admin/clearances/ClearancesGridView.tsx

import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    FileText, User, Clock, DollarSign, RefreshCw, 
    CheckCircle, XCircle, AlertCircle, Zap, AlertTriangle,
    Eye, Edit, Printer, Trash2, Copy, MoreVertical,
    CreditCard, Home, Building, Calendar
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { ClearanceRequest, ClearanceType, Resident } from '@/types/admin/clearances/clearance-types';
import { JSX } from 'react';

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

const getResidentName = (resident?: Resident): string => {
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
        return getResidentName(clearance.resident);
    }
    
    if (anyClearance.payer_type === 'household') {
        if (anyClearance.household?.head_name) return anyClearance.household.head_name;
        if (anyClearance.household?.household_number) return `Household ${anyClearance.household.household_number}`;
    }
    
    if (anyClearance.payer_type === 'business') {
        if (anyClearance.business?.business_name) return anyClearance.business.business_name;
    }
    
    return getResidentName(clearance.resident) || 'N/A';
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

    const handlePaymentClick = (clearance: ClearanceRequest, e: React.MouseEvent) => {
        e.stopPropagation();
        handleRecordPayment(clearance);
    };

    const handleCopyReference = (reference: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(reference);
        toast.success('Reference number copied to clipboard');
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {clearances.map((clearance: ClearanceRequest) => {
                const anyClearance = clearance as any;
                const isSelected = selectedClearances.includes(clearance.id);
                const isPriority = clearance.urgency === 'express' || clearance.urgency === 'rush';
                
                return (
                    <Card 
                        key={clearance.id}
                        className={`overflow-hidden hover:shadow-md transition-all duration-200 border bg-white dark:bg-gray-900 cursor-pointer ${
                            isSelected 
                                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        } ${isPriority ? 'border-l-4 border-l-amber-500' : ''}`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content') &&
                                !e.target.closest('input[type="checkbox"]')) {
                                onItemSelect(clearance.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with checkbox and menu */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(clearance.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <Badge 
                                        variant={getStatusVariant(clearance.status)}
                                        className="flex items-center gap-1"
                                    >
                                        {getStatusIcon(clearance.status)}
                                        <span>{getStatusDisplay(clearance.status)}</span>
                                    </Badge>
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/clearances/${clearance.id}`} className="flex items-center cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/clearances/${clearance.id}/edit`} className="flex items-center cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit Request</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {clearance.status === 'pending_payment' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={(e) => handlePaymentClick(clearance, e)}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4 text-green-600" />
                                                    <span className="text-green-600 font-medium">Record Payment</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            onClick={(e) => handleCopyReference(clearance.reference_number, e)}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Reference</span>
                                        </DropdownMenuItem>
                                        
                                        {clearance.status === 'issued' && (
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/clearances/${clearance.id}/print`} className="flex items-center cursor-pointer">
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    <span>Print Clearance</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(clearance);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Cancel Request</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Reference Number */}
                            <div className="mb-2">
                                <div className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {clearance.reference_number}
                                </div>
                                {clearance.clearance_number && (
                                    <div className="text-xs text-gray-500 truncate">
                                        #{clearance.clearance_number}
                                    </div>
                                )}
                            </div>

                            {/* Payer Info */}
                            <div className="flex items-center gap-2 mb-3">
                                {getPayerIcon(anyClearance.payer_type)}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {getPayerName(clearance)}
                                    </div>
                                    {anyClearance.payer_type && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {anyClearance.payer_type.charAt(0).toUpperCase() + anyClearance.payer_type.slice(1)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Purpose & Type */}
                            <div className="mb-3">
                                <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
                                    {clearance.purpose}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {clearance.clearance_type?.name || 'N/A'}
                                </Badge>
                            </div>

                            {/* Fee & Urgency */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
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
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar className="h-3 w-3" />
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
                        </CardContent>

                        {/* Footer Actions */}
                        <CardFooter className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between w-full gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    asChild
                                >
                                    <Link href={`/admin/clearances/${clearance.id}`}>
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Link>
                                </Button>
                                
                                {clearance.status === 'pending_payment' && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                                        onClick={(e) => handlePaymentClick(clearance, e)}
                                    >
                                        <CreditCard className="h-3 w-3 mr-1" />
                                        Pay
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
                                
                                {clearance.status === 'processing' && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1 text-xs"
                                        disabled
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                        Processing
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}