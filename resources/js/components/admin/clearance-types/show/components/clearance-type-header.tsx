// components/admin/clearance-types/show/components/clearance-type-header.tsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Copy,
    Check,
    Printer,
    Download,
    Edit,
    MoreVertical,
    Tag,
    Trash2,
    Sparkles,
    DollarSign,
    Clock,
    FileText,
    Hash
} from 'lucide-react';

// Import types from central types file
import { ClearanceType, formatCurrency } from '@/types/admin/clearance-types/clearance-types';
import { route } from 'ziggy-js';

interface ClearanceTypeHeaderProps {
    clearanceType: ClearanceType;
    isNew: boolean;
    onCopyLink: () => void;
    onPrint: () => void;
    onExport: () => void;
    onToggleDiscountable: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    getStatusColor: (isActive: boolean) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
    formatCurrency?: (amount: number) => string;
}

const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

const getClearanceTypeGradient = (): string => {
    return 'from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700';
};

export const ClearanceTypeHeader = ({
    clearanceType,
    isNew,
    onCopyLink,
    onPrint,
    onExport,
    onToggleDiscountable,
    onDuplicate,
    onDelete,
    getStatusColor,
    getStatusIcon,
    formatCurrency: formatCurrencyProp
}: ClearanceTypeHeaderProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    // Use the provided formatCurrency or fallback to the imported one
    const formatAmount = formatCurrencyProp || formatCurrency;

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/clearance-types">
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Clearance Types
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getClearanceTypeGradient()}`}>
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {clearanceType.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(clearanceType.is_active)}>
                                    {getStatusIcon(clearanceType.is_active)}
                                    <span className="ml-1">{clearanceType.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>

                                {/* New Badge */}
                                {isNew && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        New
                                    </Badge>
                                )}

                                {/* Clearance Code with Copy */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {clearanceType.code}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy clearance code</TooltipContent>
                                </Tooltip>

                                {/* Discountable Badge */}
                                {clearanceType.is_discountable && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        <Tag className="h-3 w-3 mr-1" />
                                        Discountable
                                    </Badge>
                                )}

                                {/* Amount Badge */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <DollarSign className="h-3 w-3" />
                                            <span className="text-sm font-medium">
                                                {formatAmount(clearanceType.fee)}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Base price</TooltipContent>
                                </Tooltip>

                                {/* Stats Badges */}
                                {clearanceType.clearances_count !== undefined && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                                <FileText className="h-3 w-3" />
                                                <span className="text-sm font-medium">{clearanceType.clearances_count}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Clearances issued</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Processing Days Badge */}
                                {clearanceType.processing_days && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-sm font-medium">{clearanceType.processing_days} days</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Processing time</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    <Link href={route('admin.clearance-types.edit', clearanceType.id)}>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>

                    {/* 3-Dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
                            <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={handleCopyLink}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={handlePrint}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onExport}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onDuplicate}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onToggleDiscountable}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Tag className="h-4 w-4 mr-2" />
                                {clearanceType.is_discountable ? 'Mark Non-Discountable' : 'Mark Discountable'}
                            </DropdownMenuItem>
                            
                            {clearanceType.clearances_count === 0 && (
                                <>
                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
};