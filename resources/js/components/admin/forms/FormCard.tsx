import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    FileText, Building, Calendar, User, DownloadIcon, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle, CheckCircle, XCircle,
    ChevronDown, ChevronUp, ExternalLink, Copy, Lock, Unlock
} from 'lucide-react';
import { Form } from '@/types';
import { useState } from 'react';

interface FormCardProps {
    form: Form;
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    truncateText: (text: string, maxLength: number) => string;
    formatFileSize: (bytes: number) => string;
    getCategoryColor: (category: string) => string;
    formatDateTime: (dateString: string) => string;
}

// Helper function to get file icon based on mime type
const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    
    if (mimeType.includes('pdf')) {
        return <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />;
    } else if (mimeType.includes('image')) {
        return <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
        return <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
    
    return <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
};

// Status color classes matching community reports pattern
const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

export function FormCard({
    form,
    isSelected,
    isBulkMode,
    isMobile,
    onSelect,
    onDelete,
    onToggleStatus,
    onDownload,
    truncateText,
    formatFileSize,
    getCategoryColor,
    formatDateTime
}: FormCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isCompactView = isMobile;
    const isActive = form.is_active;
    
    // Truncation lengths based on view
    const titleLength = isCompactView ? 25 : 40;
    const descriptionLength = isCompactView ? 60 : 120;

    // Handle card click
    const handleCardClick = (e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
            } ${!isActive ? 'opacity-60' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
            onClick={handleCardClick}
        >
            {/* Bulk selection checkbox */}
            {isBulkMode && (
                <div 
                    className="absolute top-2 left-2 z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(form.id);
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(form.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                    />
                </div>
            )}

            <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                {/* Header row with icon and status */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                            {getFileIcon(form.mime_type)}
                        </div>
                        <span 
                            className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                            title={`Form ID: ${form.id}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(form.id.toString());
                            }}
                        >
                            Form #{form.id}
                        </span>
                    </div>
                    
                    {/* Status badge */}
                    <div className="flex gap-1 flex-shrink-0">
                        <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(isActive)}`}
                        >
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
                
                {/* Title - always visible */}
                <h3 
                    className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                    title={form.title}
                >
                    {truncateText(form.title || 'Untitled', titleLength)}
                </h3>
                
                {/* Primary Info - always visible */}
                <div className="space-y-1.5 mb-2">
                    {/* Category */}
                    <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <Badge 
                            className={`text-[10px] px-1.5 py-0 h-4 border ${getCategoryColor(form.category || 'Other')}`}
                        >
                            {form.category || 'Uncategorized'}
                        </Badge>
                    </div>
                    
                    {/* Agency */}
                    {form.issuing_agency && (
                        <div className="flex items-center gap-1.5">
                            <Building className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                {truncateText(form.issuing_agency, 25)}
                            </span>
                        </div>
                    )}
                    
                    {/* File size and name */}
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {truncateText(form.file_name || 'No file', 20)} 
                            {form.file_size && ` (${formatFileSize(form.file_size)})`}
                        </span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                {formatDateTime(form.created_at)}
                            </span>
                        </div>
                        {form.download_count > 0 && (
                            <div className="flex items-center gap-1">
                                <DownloadIcon className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {form.download_count} downloads
                                </span>
                            </div>
                        )}
                    </div>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                        {/* Description */}
                        {form.description && (
                            <div className="text-xs text-gray-700 dark:text-gray-300">
                                <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Description:</p>
                                <p className="line-clamp-3 italic text-gray-600 dark:text-gray-400">
                                    "{truncateText(form.description, descriptionLength)}"
                                </p>
                            </div>
                        )}

                        {/* Created by */}
                        {form.created_by?.name && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <User className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">Uploaded by:</span>
                                <span className="text-gray-900 dark:text-white truncate">
                                    {form.created_by.name}
                                </span>
                            </div>
                        )}

                        {/* Collapse button */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="link"
                                size="sm"
                                className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = route('admin.forms.show', form.id);
                                }}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View full details
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = route('admin.forms.show', form.id);
                                    }}
                                >
                                    <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">View Details</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Download */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(form);
                                    }}
                                >
                                    <DownloadIcon className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">Download</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = route('admin.forms.edit', form.id);
                                    }}
                                >
                                    <Edit className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">Edit</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Toggle Status */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} ${
                                        isActive 
                                            ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950' 
                                            : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleStatus(form);
                                    }}
                                >
                                    {isActive ? (
                                        <PauseCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    ) : (
                                        <PlayCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">{isActive ? 'Deactivate' : 'Activate'}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Copy ID */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(form.id.toString());
                                    }}
                                >
                                    <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">Copy ID</p>
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
                                    onDelete(form);
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
}