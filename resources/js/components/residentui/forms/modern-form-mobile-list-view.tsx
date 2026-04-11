// components/residentui/forms/modern-form-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Eye, 
    Download, 
    MoreHorizontal, 
    FileText, 
    ChevronRight,
    ChevronDown,
    Calendar,
    HardDrive,
    Folder,
    Building2,
    TrendingUp,
    AlertCircle,
    Copy,
    Flag,
    Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Form } from '@/types/portal/forms/form.types';

interface ModernFormMobileListViewProps {
    forms: Form[];
    selectMode?: boolean;
    selectedForms?: number[];
    toggleSelectForm?: (id: number) => void;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatFileSize: (size: number) => string;
    getCategoryColor: (category: string) => string;
    getAgencyIcon: (agency: string) => any;
    getFileTypeIcon: (fileType: string) => any;
    getFileTypeColor: (fileType: string) => string;
    truncateText: (text: string, length: number) => string;
    onCopyLink: (form: Form) => void;
    onCopyTitle: (title: string) => void;
    onViewDetails: (id: number) => void;
    onDownload: (form: Form) => void;
    onGenerateReport: (form: Form) => void;
    onReportIssue: (form: Form) => void;
}

export function ModernFormMobileListView({
    forms,
    selectMode,
    selectedForms = [],
    toggleSelectForm,
    formatDate,
    formatDateTime,
    formatFileSize,
    getCategoryColor,
    getAgencyIcon,
    getFileTypeIcon,
    getFileTypeColor,
    truncateText,
    onCopyLink,
    onCopyTitle,
    onViewDetails,
    onDownload,
    onGenerateReport,
    onReportIssue,
}: ModernFormMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {forms.map((form) => {
                const isSelected = selectedForms.includes(form.id);
                const isExpanded = expandedId === form.id;
                const AgencyIcon = getAgencyIcon(form.issuing_agency);
                const FileTypeIcon = getFileTypeIcon(form.file_type);
                const fileTypeColor = getFileTypeColor(form.file_type);
                const categoryColor = getCategoryColor(form.category);

                return (
                    <div
                        key={form.id}
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
                            onClick={() => selectMode && toggleSelectForm?.(form.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelectForm?.(form.id);
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
                                    onClick={(e) => toggleExpand(form.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* File Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        fileTypeColor
                                    )}>
                                        <FileTypeIcon className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {form.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate max-w-[120px]">{form.issuing_agency}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Download className="h-3 w-3 flex-shrink-0" />
                                            <span className="flex-shrink-0">{form.download_count.toLocaleString()}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <HardDrive className="h-3 w-3 flex-shrink-0" />
                                            <span className="flex-shrink-0">{formatFileSize(form.file_size)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge 
                                            variant="secondary" 
                                            className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800"
                                            style={{ backgroundColor: categoryColor + '20', color: categoryColor }}
                                        >
                                            <Folder className="h-2.5 w-2.5 mr-0.5" />
                                            {form.category}
                                        </Badge>
                                        {form.download_count > 100 && (
                                            <Badge 
                                                variant="outline" 
                                                className="text-[10px] px-1.5 py-0 h-4 border-0 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                            >
                                                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                                                Popular
                                            </Badge>
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
                                                    onViewDetails(form.id);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDownload(form);
                                                }}
                                            >
                                                <Download className="h-4 w-4" />
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
                                                    <DropdownMenuItem onClick={() => onCopyLink(form)}>
                                                        <LinkIcon className="h-4 w-4 mr-2" />
                                                        Copy Link
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onCopyTitle(form.title)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Title
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onGenerateReport(form)}>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Generate Report
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onReportIssue(form)}>
                                                        <Flag className="h-4 w-4 mr-2" />
                                                        Report Issue
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
                                    {/* Agency Details */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Issuing Agency:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {form.issuing_agency}
                                            </span>
                                        </div>
                                        <AgencyIcon className="h-4 w-4 text-gray-400" />
                                    </div>

                                    {/* Category */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Folder className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {form.category}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {formatDateTime(form.created_at)}
                                        </span>
                                    </div>

                                    {form.updated_at && form.updated_at !== form.created_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDateTime(form.updated_at)}
                                            </span>
                                        </div>
                                    )}

                                    {/* File Details */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <HardDrive className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">File:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {form.file_type?.toUpperCase()} • {formatFileSize(form.file_size)}
                                        </span>
                                    </div>

                                    {/* Download Stats */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Download className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {form.download_count.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Description if available */}
                                    {form.description && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {form.description}
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
                                                onViewDetails(form.id);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownload(form);
                                            }}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            Download
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