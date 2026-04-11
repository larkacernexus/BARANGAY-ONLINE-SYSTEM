// components/residentui/fees/modern-fee-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Printer, 
    MoreHorizontal, 
    Receipt, 
    ChevronRight,
    ChevronDown,
    Calendar,
    User,
    Hash,
    CreditCard,
    Copy,
    Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Fee, getFeeTypeName as GetFeeTypeName } from '@/types/portal/fees/my-fees';

interface ModernFeeMobileListViewProps {
    fees: Fee[];
    selectMode?: boolean;
    selectedFees?: number[];
    onSelectFee?: (fee: Fee) => void;
    getResidentName: (residentId?: number) => string;
    getCategoryDisplay: (fee: Fee) => { label: string; color: string };
    formatDate: (date: string) => string;
    formatCurrency: (amount: number) => string;
    formatFeeAmount: (amount: number) => string;
    getFeeStatusLabel: (status?: string) => string;
    getFeeStatusColor: (status?: string) => string;
    onPrintFee: (fee: Fee) => void;
    onCopyFeeCode: (code: string) => void;
}

// Helper to safely get fee type name
const getFeeTypeName = (fee: Fee): string => {
    if (!fee.fee_type) {
        return fee.fee_type_name || 'Fee';
    }
    
    if (typeof fee.fee_type === 'object' && fee.fee_type !== null && 'name' in fee.fee_type) {
        return fee.fee_type.name;
    }
    
    if (typeof fee.fee_type === 'string') {
        return fee.fee_type;
    }
    
    return fee.fee_type_name || 'Fee';
};

export function ModernFeeMobileListView({
    fees,
    selectMode = false,
    selectedFees = [],
    onSelectFee,
    getResidentName,
    getCategoryDisplay,
    formatDate,
    formatCurrency,
    formatFeeAmount,
    getFeeStatusLabel,
    getFeeStatusColor,
    onPrintFee,
    onCopyFeeCode,
}: ModernFeeMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) {
            toast.error(`No ${label} to copy`);
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {fees.map((fee) => {
                const isSelected = selectedFees.includes(fee.id);
                const isExpanded = expandedId === fee.id;
                const categoryDisplay = getCategoryDisplay(fee);
                const statusColor = getFeeStatusColor(fee.status);
                const statusLabel = getFeeStatusLabel(fee.status);
                const residentName = getResidentName(fee.resident_id);
                const feeTypeName = getFeeTypeName(fee);
                const amount = fee.amount ?? 0;
                const feeCode = fee.fee_code ?? 'N/A';

                return (
                    <div
                        key={fee.id}
                        className={cn(
                            "relative transition-colors",
                            isSelected && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                    >
                        {/* Main Row */}
                        <div 
                            className={cn(
                                "py-3 transition-colors cursor-pointer",
                                "active:bg-gray-50 dark:active:bg-gray-800/50"
                            )}
                            onClick={() => selectMode && onSelectFee?.(fee)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectFee?.(fee);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={(e) => toggleExpand(fee.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Fee Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        categoryDisplay.color
                                    )}>
                                        <Receipt className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {feeTypeName}
                                        </h3>
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white ml-2">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (fee.fee_code) {
                                                    onCopyFeeCode(fee.fee_code);
                                                }
                                            }}
                                            className={cn(
                                                "font-mono",
                                                fee.fee_code ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                            )}
                                        >
                                            {feeCode}
                                        </button>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate max-w-[100px]">{residentName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                statusColor
                                            )}
                                        >
                                            {statusLabel}
                                        </Badge>
                                        {fee.created_at && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(fee.created_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    {!selectMode && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPrintFee(fee);
                                                }}
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    {fee.fee_code && (
                                                        <DropdownMenuItem onClick={() => onCopyFeeCode(fee.fee_code!)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Fee Code
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onPrintFee(fee)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Receipt
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        {isExpanded && !selectMode && (
                            <div className="px-3 pb-3 pl-14 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="pt-3 space-y-2">
                                    {/* Fee Details */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Receipt className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Fee Type:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {feeTypeName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fee Code */}
                                    {fee.fee_code && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">Fee Code:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {fee.fee_code}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(fee.fee_code!, 'Fee code', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Resident */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Resident:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {residentName}
                                        </span>
                                    </div>

                                    {/* Category */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Building className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                        <Badge 
                                            variant="secondary" 
                                            className="text-[10px] px-1.5 py-0"
                                            style={{ backgroundColor: categoryDisplay.color + '20', color: categoryDisplay.color }}
                                        >
                                            {categoryDisplay.label}
                                        </Badge>
                                    </div>

                                    {/* Amount Details */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    {fee.created_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Issued:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(fee.created_at)}
                                            </span>
                                        </div>
                                    )}

                                    {fee.due_date && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(fee.due_date)}
                                            </span>
                                        </div>
                                    )}

                                    {fee.paid_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatDate(fee.paid_at)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Description if available */}
                                    {fee.description && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {fee.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Remarks if available */}
                                    {fee.remarks && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remarks:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {fee.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPrintFee(fee);
                                            }}
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-1" />
                                            Print Receipt
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}