// components/admin/forms/FormsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
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
import { useState, useMemo, useCallback, useEffect } from 'react';
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
    formatFileSize?: (bytes: number) => string;
    categories?: string[];
    agencies?: string[];
    windowWidth?: number;
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

// Status color classes
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

// Truncate text helper
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    formatFileSize = formUtils.formatFileSize,
    categories = [],
    agencies = [],
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: FormsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    const isCompactView = isMobile;
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth]);

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (formId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(formId, e);
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
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedForms), [selectedForms]);

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

    // Early return for empty state
    if (forms.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {forms.map(form => {
                const isSelected = selectedSet.has(form.id);
                const isExpanded = expandedId === form.id;
                const isActive = form.is_active;
                
                // Truncation lengths based on view
                const titleLength = isCompactView ? 25 : 35;
                const agencyLength = isCompactView ? 20 : 30;
                const filenameLength = isCompactView ? 20 : 25;
                
                return (
                    <Card 
                        key={form.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${!isActive ? 'opacity-60' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(form.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        {getFileIcon(form.file_type)}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(form.title || 'Untitled', titleLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: #{form.id}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(form.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={(e) => handleViewDetails(form.id, e)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => handleEdit(form.id, e)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Form
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onDownload(form);
                                            }}>
                                                <DownloadIcon className="h-4 w-4 mr-2" />
                                                Download File
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStatus(form);
                                            }}>
                                                {isActive ? (
                                                    <>
                                                        <PauseCircle className="h-4 w-4 mr-2" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayCircle className="h-4 w-4 mr-2" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(form.id.toString());
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Form ID
                                            </DropdownMenuItem>

                                            {form.file_name && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(form.file_name);
                                                }}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Copy Filename
                                                </DropdownMenuItem>
                                            )}

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(form.id);
                                                    }}>
                                                        {isSelected ? (
                                                            <>
                                                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4 mr-2" />
                                                                Select for Bulk
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(form);
                                                }}
                                                className="text-red-600 dark:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Form
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(isActive)}`}
                                >
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge variant="outline" className={`text-xs px-2 py-0.5 ${formUtils.getCategoryColor(form.category || 'Other')}`}>
                                    {form.category || 'Uncategorized'}
                                </Badge>
                                
                                {form.download_count > 0 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        <DownloadIcon className="h-3 w-3 mr-1" />
                                        {form.download_count.toLocaleString()}
                                    </Badge>
                                )}
                            </div>

                            {/* Always visible info */}
                            <div className="space-y-2 mb-2">
                                {/* Agency */}
                                {form.issuing_agency && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span 
                                            className="truncate"
                                            title={form.issuing_agency}
                                        >
                                            {truncateText(form.issuing_agency, agencyLength)}
                                        </span>
                                    </div>
                                )}

                                {/* File Info */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">
                                        {truncateText(form.file_name || 'No file', filenameLength)}
                                        {form.file_size && ` (${formatFileSize(form.file_size)})`}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{formatDate(form.created_at)}</span>
                                </div>
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(form.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
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
                                            <div className="space-y-1 text-gray-600 dark:text-gray-400 pl-2">
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
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => handleViewDetails(form.id, e)}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(form.id, e)}
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