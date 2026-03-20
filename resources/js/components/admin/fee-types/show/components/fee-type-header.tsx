// resources/js/Pages/Admin/FeeTypes/components/fee-type-header.tsx
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
    ChevronLeft,
    Copy,
    Check,
    Printer,
    Edit,
    XCircle,
    CheckCircle,
    Award,
    Tag,
    Hash,
    DollarSign,
    RefreshCw,
    Trash2,
    MoreVertical,
    Download,
    Sparkles,
    FileText,
    Users,
    Clock,
    AlertCircle
} from 'lucide-react';
import { route } from 'ziggy-js';
import { FeeType } from '../types';

interface Props {
    feeType: FeeType;
    isNew: boolean;
    onCopyLink: () => void;
    onToggleStatus: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onPrint?: () => void;
    onExport?: () => void;
    togglingStatus: boolean;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
    /** * Fixed: Updated return type from 'string' to literal badge variants 
     * to satisfy TypeScript's strict type checking for the Badge component.
     */
    getStatusVariant: (isActive: boolean) => "default" | "secondary" | "destructive" | "outline" | null | undefined;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
}

const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

const getFeeTypeGradient = (): string => {
    return 'from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700';
};

export const FeeTypeHeader = ({
    feeType,
    isNew,
    onCopyLink,
    onToggleStatus,
    onDuplicate,
    onDelete,
    onPrint,
    onExport,
    togglingStatus,
    getStatusIcon,
    getStatusVariant,
    getCategoryColor,
    getCategoryLabel
}: Props) => {
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

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.fee-types.index')}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Fee Types
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getFeeTypeGradient()}`}>
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {feeType.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(feeType.is_active)}>
                                    {getStatusIcon(feeType.is_active)}
                                    <span className="ml-1">{feeType.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>

                                {/* New Badge */}
                                {isNew && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        New
                                    </Badge>
                                )}

                                {/* Fee Code with Copy */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {feeType.code}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy fee code</TooltipContent>
                                </Tooltip>

                                {/* Category Badge */}
                                <Badge variant="outline" className={getCategoryColor(feeType.category)}>
                                    <Tag className="h-3 w-3 mr-1" />
                                    {getCategoryLabel(feeType.category)}
                                </Badge>

                                {/* Amount Badge */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <DollarSign className="h-3 w-3" />
                                            <span className="text-sm font-medium">
                                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(feeType.amount)}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Amount</TooltipContent>
                                </Tooltip>

                                {/* Stats Badges - Replace with actual data */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <FileText className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Fee collections</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                            <Clock className="h-3 w-3" />
                                            <span className="text-sm">Monthly</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Billing frequency</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    <Link href={route('admin.fee-types.edit', feeType.id)}>
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
                            
                            {onExport && (
                                <DropdownMenuItem 
                                    onClick={onExport}
                                    className="dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                                onClick={onDuplicate}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onToggleStatus}
                                disabled={togglingStatus}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {togglingStatus ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : feeType.is_active ? (
                                    <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {feeType.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onDelete}
                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
};