// resources/js/Pages/Admin/Reports/ReportTypes/components/report-type-header.tsx
import React, { useState } from 'react';
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
    Edit,
    Copy,
    Check,
    Printer,
    MoreVertical,
    XCircle,
    CheckCircle,
    Clock,
    Zap,
    Trash2,
    Award,
    Tag,
    Hash,
    Download,
    FileText,
    AlertCircle,
    Sparkles,
    BarChart
} from 'lucide-react';
import { ReportType } from '../types';

interface Props {
    reportType: ReportType;
    isNew: boolean;
    onBack: () => void;
    onCopyLink: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onToggleStatus: () => void;
    onToggleImmediateAction: () => void;
    onDelete: () => void;
    onPrint?: () => void;
    onExport?: () => void;
    getStatusBadge: (isActive: boolean) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
    /**
     * Fixed: Changed from 'string' to literal Badge variants to resolve ts(2322)
     */
    getStatusVariant: (isActive: boolean) => "default" | "secondary" | "destructive" | "outline" | null | undefined;
}

const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

const getImmediateActionBadgeColor = (requiresImmediateAction: boolean): string => {
    return requiresImmediateAction
        ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

export const ReportTypeHeader = ({
    reportType,
    isNew,
    onBack,
    onCopyLink,
    onEdit,
    onDuplicate,
    onToggleStatus,
    onToggleImmediateAction,
    onDelete,
    onPrint,
    onExport,
    getStatusBadge,
    getStatusIcon,
    getStatusVariant
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

    // Create a gradient style based on the report type color
    const gradientStyle = {
        background: `linear-gradient(135deg, ${reportType.color} 0%, ${reportType.color}dd 100%)`
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Report Types
                    </Button>
                    <div className="flex items-center gap-3">
                        <div 
                            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                            style={gradientStyle}
                        >
                            <BarChart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {reportType.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={getStatusBadgeColor(reportType.is_active)}>
                                    {getStatusIcon(reportType.is_active)}
                                    <span className="ml-1">{getStatusBadge(reportType.is_active)}</span>
                                </Badge>

                                {/* New Badge */}
                                {isNew && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        New
                                    </Badge>
                                )}

                                {/* Report Code with Copy */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {reportType.code}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy report code</TooltipContent>
                                </Tooltip>

                                {/* Category Badge */}
                                {reportType.category && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {reportType.category}
                                    </Badge>
                                )}

                                {/* Immediate Action Badge */}
                                <Badge variant="outline" className={getImmediateActionBadgeColor(reportType.requires_immediate_action)}>
                                    {reportType.requires_immediate_action ? (
                                        <Zap className="h-3 w-3 mr-1" />
                                    ) : (
                                        <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {reportType.requires_immediate_action ? 'Immediate Action' : 'Standard'}
                                </Badge>

                                {/* Stats Badge - Reports Count */}
                                {reportType.community_reports_count !== undefined && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                                <FileText className="h-3 w-3" />
                                                <span className="text-sm font-medium">{reportType.community_reports_count}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Reports submitted</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    <Button
                        size="sm"
                        onClick={onEdit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>

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
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {reportType.is_active ? (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onToggleImmediateAction}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {reportType.requires_immediate_action ? (
                                    <>
                                        <Clock className="h-4 w-4 mr-2" />
                                        Remove Immediate Action
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Mark as Immediate Action
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            {reportType.community_reports_count === 0 && (
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