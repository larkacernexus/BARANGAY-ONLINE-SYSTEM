// components/admin/forms/FormsGridView.tsx

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
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    FileText, Building, Calendar, User, DownloadIcon, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle,
    ChevronDown, ChevronUp, ExternalLink, Copy, MoreVertical,
    Square, CheckSquare, QrCode
} from 'lucide-react';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Form } from '@/types/admin/forms/forms.types';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { formUtils } from '@/admin-utils/form-utils';

interface FormsGridViewProps {
    forms: Form[];
    isBulkMode: boolean;
    selectedForms: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    // Add missing props
    formatFileSize?: (bytes: number) => string;
    categories?: string[];
    agencies?: string[];
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

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export default function FormsGridView({
    forms,
    isBulkMode,
    selectedForms,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleStatus,
    onDownload,
    hasActiveFilters,
    onClearFilters,
    formatFileSize = formUtils.formatFileSize, // Default to formUtils if not provided
    categories = [],
    agencies = []
}: FormsGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    const isCompactView = isMobile;

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
    const handleCardClick = (formId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(formId);
    };

    // Handle view details
    const handleViewDetails = (formId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(route('admin.forms.show', formId));
    };

    // Handle edit
    const handleEdit = (formId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(route('admin.forms.edit', formId));
    };

    const emptyState = (
        <EmptyState
            title="No forms found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by uploading a form.'}
            icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/forms/create')}
            createLabel="Upload Form"
        />
    );

    return (
        <GridLayout
            isEmpty={forms.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {forms.map(form => {
                const isSelected = selectedForms.includes(form.id);
                const isExpanded = expandedCards.has(form.id);
                const isActive = form.is_active;
                
                // Truncation lengths based on view
                const titleLength = isCompactView ? 25 : 40;
                const descriptionLength = isCompactView ? 60 : 120;
                
                return (
                    <Card 
                        key={form.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${!isActive ? 'opacity-60' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(form.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header with Icon and DropdownMenu */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {/* Icon */}
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                                        {getFileIcon(form.file_type)}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1">
                                            {formUtils.truncateText(form.title || 'Untitled', titleLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            #{form.id}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(form.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleViewDetails(form.id, e);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>View Details</span>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleEdit(form.id, e);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>Edit Form</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onDownload(form);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <DownloadIcon className="h-4 w-4" />
                                                <span>Download File</span>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onToggleStatus(form);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                {isActive ? (
                                                    <>
                                                        <PauseCircle className="h-4 w-4" />
                                                        <span>Deactivate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayCircle className="h-4 w-4" />
                                                        <span>Activate</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(form.id.toString());
                                                }}
                                                className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Copy className="h-4 w-4" />
                                                <span>Copy Form ID</span>
                                            </DropdownMenuItem>

                                            {form.file_name && (
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigator.clipboard.writeText(form.file_name);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span>Copy Filename</span>
                                                </DropdownMenuItem>
                                            )}

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onItemSelect(form.id);
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <CheckSquare className="h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4" />
                                                                <span>Select for Bulk</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onDelete(form);
                                                }}
                                                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete Form</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 border ${getStatusColor(isActive)}`}
                                >
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge variant="outline" className={`text-xs px-2 py-0.5 ${formUtils.getCategoryColor(form.category || 'Other')}`}>
                                    {form.category || 'Uncategorized'}
                                </Badge>
                                
                                {form.download_count > 0 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        <DownloadIcon className="h-3 w-3 mr-1" />
                                        {form.download_count.toLocaleString()} downloads
                                    </Badge>
                                )}
                            </div>

                            {/* Always visible info */}
                            <div className="space-y-2 mb-2">
                                {/* Agency */}
                                {form.issuing_agency && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span 
                                            className="truncate"
                                            title={form.issuing_agency}
                                        >
                                            {formUtils.truncateText(form.issuing_agency, 30)}
                                        </span>
                                    </div>
                                )}

                                {/* File Info */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {formUtils.truncateText(form.file_name || 'No file', 25)}
                                        {form.file_size && ` (${formatFileSize(form.file_size)})`}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{formatDate(form.created_at)}</span>
                                </div>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => toggleCardExpansion(form.id, e)}
                                    >
                                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Full Description */}
                                    {form.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {form.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Form Details */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Form ID:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">#{form.id}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Version:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{form.version || '1.0'}</span>
                                        </div>
                                    </div>

                                    {/* File Details */}
                                    {form.file_name && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">File Details:</p>
                                            <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                                <div>Name: {form.file_name}</div>
                                                {form.file_size && <div>Size: {formatFileSize(form.file_size)}</div>}
                                                {form.file_type && <div>Type: {form.file_type}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(form.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(form.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* View full details link and collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                                            onClick={(e) => handleViewDetails(form.id, e)}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => toggleCardExpansion(form.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}