import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
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
    Info
} from 'lucide-react';
import { Fee } from '@/types/fees.types';
import { format, isAfter } from 'date-fns';

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
    statuses?: Record<string, string>;
    categories?: Record<string, string>;
}

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
};

const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
};

const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return isAfter(today, due);
};

const getPayerIcon = (payerType: string) => {
    switch (payerType) {
        case 'resident': return <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
        case 'household': return <Home className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
        case 'business': return <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
        default: return <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
    }
};

// Status color classes matching community reports pattern
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
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default: 
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
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
    statuses = {},
    categories = {}
}: FeesGridViewProps) {
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
    const handleCardClick = (feeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(feeId);
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
        if (onCopyToClipboard) {
            onCopyToClipboard(fee.fee_code, 'Fee Code');
        } else {
            navigator.clipboard.writeText(fee.fee_code);
        }
    };

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

    return (
        <GridLayout
            isEmpty={fees.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {fees.map((fee) => {
                const isSelected = selectedFees.includes(fee.id);
                const isExpanded = expandedCards.has(fee.id);
                const isFeeOverdue = isOverdue(fee.due_date) && fee.status !== 'paid';
                const isMobile = window.innerWidth < 768;
                const isCompactView = isMobile;
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 30;
                
                return (
                    <Card 
                        key={fee.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${isFeeOverdue ? 'border-l-4 border-l-red-500 dark:border-l-red-600' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(fee.id, e)}
                    >
                        {/* Bulk selection checkbox */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(fee.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(fee.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}

                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with icon and fee code */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                                        <DollarSign className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`Fee Code: ${fee.fee_code}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyFeeCode(fee, e);
                                        }}
                                    >
                                        {fee.fee_code}
                                    </span>
                                </div>
                                
                                {/* Status badge */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColorClass(fee.status, isFeeOverdue)}`}
                                    >
                                        {isFeeOverdue ? 'Overdue' : 
                                         fee.status === 'paid' ? 'Paid' :
                                         fee.status === 'pending' ? 'Pending' :
                                         fee.status === 'partial' ? 'Partial' : fee.status}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Fee Type/Payer Name - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                                title={fee.fee_type?.name || 'Fee Assessment'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewClick(fee, e);
                                }}
                            >
                                {fee.fee_type?.name || 'Fee Assessment'}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* Payer Info */}
                                <div className="flex items-center gap-1.5">
                                    {getPayerIcon(fee.payer_type)}
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        {fee.payer_name.substring(0, nameLength)}
                                        {fee.payer_name.length > nameLength ? '...' : ''}
                                    </span>
                                </div>
                                
                                {/* Payer Type */}
                                <div className="flex items-center gap-1.5">
                                    <Info className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                        {fee.payer_type || 'Resident'}
                                    </span>
                                </div>
                                
                                {/* Dates */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {formatDate(fee.issue_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className={`h-3 w-3 ${isFeeOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} flex-shrink-0`} />
                                        <span className={`text-xs ${isFeeOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {formatDate(fee.due_date)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Amount Summary */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(fee.total_amount)}
                                    </span>
                                </div>
                                
                                {fee.balance > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Balance:</span>
                                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                            {formatCurrency(fee.balance)}
                                        </span>
                                    </div>
                                )}
                                
                                {fee.amount_paid > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Paid:</span>
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                            {formatCurrency(fee.amount_paid)}
                                        </span>
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
                                        onClick={(e) => toggleCardExpansion(fee.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Contact Information */}
                                    {fee.contact_number && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.contact_number}</span>
                                        </div>
                                    )}

                                    {/* Address */}
                                    {fee.address && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                            <span className="text-gray-900 dark:text-white truncate">{fee.address}</span>
                                        </div>
                                    )}

                                    {/* Purok */}
                                    {fee.purok && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Home className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Purok:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.purok}</span>
                                        </div>
                                    )}

                                    {/* Fee Type Details */}
                                    {fee.fee_type && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Hash className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <span className="text-gray-900 dark:text-white">{fee.fee_type.category || 'General'}</span>
                                        </div>
                                    )}

                                    {/* Payment Details */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 font-medium">{formatCurrency(fee.total_amount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                                            <span className="text-green-600 dark:text-green-400 ml-1 font-medium">{formatCurrency(fee.amount_paid)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                                            <span className="text-red-600 dark:text-red-400 ml-1 font-medium">{formatCurrency(fee.balance)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className="text-gray-900 dark:text-white ml-1 capitalize">{fee.status}</span>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(fee.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{formatDateTime(fee.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Payment button for unpaid fees */}
                                    {fee.status !== 'paid' && fee.balance > 0 && (
                                        <div className="pt-1">
                                            <Button
                                                size="sm"
                                                className="w-full h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.get(route('admin.payments.create', { 
                                                        fee_id: fee.id,
                                                        payer_type: fee.payer_type,
                                                        payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
                                                        payer_name: fee.payer_name,
                                                        contact_number: fee.contact_number,
                                                        address: fee.address,
                                                        purok: fee.purok,
                                                        fee_code: fee.fee_code,
                                                        balance: fee.balance
                                                    }));
                                                }}
                                            >
                                                <CreditCard className="h-3 w-3 mr-1" />
                                                Process Payment
                                            </Button>
                                        </div>
                                    )}

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => handleViewClick(fee, e)}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(fee.id, e)}
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
                                                onClick={(e) => handleViewClick(fee, e)}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Edit */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => handleEditClick(fee, e)}
                                            >
                                                <Edit className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Edit</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Pay - for unpaid fees */}
                                    {fee.status !== 'paid' && fee.balance > 0 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(route('admin.payments.create', { 
                                                            fee_id: fee.id,
                                                            payer_type: fee.payer_type,
                                                            payer_id: fee.payer_type === 'resident' ? fee.resident_id : fee.household_id,
                                                            payer_name: fee.payer_name,
                                                            contact_number: fee.contact_number,
                                                            address: fee.address,
                                                            purok: fee.purok,
                                                            fee_code: fee.fee_code,
                                                            balance: fee.balance
                                                        }));
                                                    }}
                                                >
                                                    <CreditCard className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Process Payment</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {/* Print Invoice */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/admin/fees/${fee.id}/print`;
                                                }}
                                            >
                                                <Receipt className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Print Invoice</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Copy Fee Code */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => handleCopyFeeCode(fee, e)}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Copy Code</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                {/* Delete button */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(fee);
                                            }}
                                        >
                                            <Trash2 className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                        <p className="text-xs">Delete</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </GridLayout>
    );
}