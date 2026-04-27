// resources/js/Pages/Admin/Fees/components/fee-header.tsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Tag,
    FileText,
    Copy,
    Check,
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    AlertCircle,
    FileCheck,
    Receipt,
    DollarSign,
} from 'lucide-react';
import { Fee, Permissions } from '@/types/admin/fees/fees';
import { formatCurrency } from '@/types/admin/fees/fees';

// ========== TYPES ==========
interface FeeHeaderProps {
    fee: Fee;
    permissions: Permissions;
    onEdit: () => void;
    onDelete: () => void;
    onCopyReference: () => void;
}

// ========== HELPER FUNCTIONS ==========
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'pending':
        case 'partially_paid':
            return 'secondary';
        case 'paid':
            return 'default';
        case 'overdue':
            return 'destructive';
        case 'cancelled':
        case 'refunded':
            return 'outline';
        default:
            return 'secondary';
    }
};

const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
        case 'pending':
            return <Clock className="h-3 w-3" />;
        case 'partially_paid':
            return <Clock className="h-3 w-3" />;
        case 'paid':
            return <CheckCircle className="h-3 w-3" />;
        case 'issued':
            return <FileCheck className="h-3 w-3" />;
        case 'overdue':
            return <AlertCircle className="h-3 w-3" />;
        case 'cancelled':
        case 'refunded':
            return <XCircle className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'partially_paid': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        'issued': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'paid': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'overdue': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'cancelled': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        'refunded': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

const getStatusDisplay = (status: string): string => {
    const displayMap: Record<string, string> = {
        'pending': 'Pending',
        'partially_paid': 'Partially Paid',
        'paid': 'Paid',
        'issued': 'Issued',
        'overdue': 'Overdue',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded',
    };
    return displayMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const getGradientByStatus = (status: string): string => {
    switch (status) {
        case 'paid':
            return 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
        case 'issued':
            return 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
        case 'pending':
        case 'partially_paid':
            return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
        case 'overdue':
            return 'from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700';
        case 'cancelled':
        case 'refunded':
            return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
        default:
            return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
    }
};

export const FeeHeader: React.FC<FeeHeaderProps> = ({ 
    fee, 
    permissions, 
    onEdit, 
    onDelete, 
    onCopyReference 
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyReference = () => {
        onCopyReference();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if fee can be deleted
    const canDelete = permissions.can_delete && 
        ['pending', 'partially_paid', 'issued'].includes(fee.status);

    // Get status display text
    const statusDisplay = (fee as any).status_display || getStatusDisplay(fee.status);

    // Format amount for display
    const formattedAmount = formatCurrency(fee.total_amount || fee.amount);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/fees">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Fees
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getGradientByStatus(fee.status)}`}>
                        <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            Fee Details
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Status Badge */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge 
                                            variant={getStatusVariant(fee.status)} 
                                            className={`${getStatusColor(fee.status)} flex items-center gap-1`}
                                        >
                                            {getStatusIcon(fee.status)}
                                            <span className="ml-1">{statusDisplay}</span>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Current status: {statusDisplay}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            
                            {/* Fee Code with Copy */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 rounded-full cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                            onClick={handleCopyReference}
                                        >
                                            <Tag className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {fee.fee_code}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1 text-green-600" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy fee code</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Certificate Number */}
                            {fee.certificate_number && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-default">
                                                <FileText className="h-3 w-3" />
                                                <span className="text-sm font-mono">
                                                    {fee.certificate_number}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Certificate Number</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* OR Number */}
                            {fee.or_number && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 rounded-full cursor-default">
                                                <Receipt className="h-3 w-3" />
                                                <span className="text-sm font-mono">
                                                    OR# {fee.or_number}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Official Receipt Number</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* Amount Badge */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <DollarSign className="h-3 w-3" />
                                            <span className="text-sm font-medium">
                                                {formattedAmount}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Total Amount</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Copy Code Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyReference}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy Code'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy fee code to clipboard</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Edit Button - Only if user can edit */}
                {permissions.can_edit && (
                    <Button
                        onClick={onEdit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}

                {/* 3-Dots Menu - Only show if there are actions available */}
                {(canDelete) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                            <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            {canDelete && (
                                <DropdownMenuItem 
                                    onClick={onDelete} 
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Fee
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};