// components/admin/document-types/DocumentTypesGridView.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { DocumentType } from '@/types/admin/document-types/document-types';
import { Link } from '@inertiajs/react';
import {
    CheckCircle,
    Copy,
    Edit,
    Eye,
    FileType,
    Folder,
    HardDrive,
    Layers,
    MoreVertical,
    Trash2,
    XCircle,
    FileText,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    CheckSquare,
    Square,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useMemo, useCallback, useEffect } from 'react';

interface DocumentTypesGridViewProps {
    documentTypes: DocumentType[];
    categories: Array<{ id: number; name: string; slug: string }>;
    isBulkMode: boolean;
    selectedDocumentTypes: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (documentType: DocumentType) => void;
    onToggleStatus?: (documentType: DocumentType) => void;
    onDuplicate?: (documentType: DocumentType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    getFileSizeMB: (bytes: number) => number;
    formatFileFormats: (formats?: string[]) => string;
    formatDate: (dateString: string) => string;
    windowWidth?: number;
}

export default function DocumentTypesGridView({
    documentTypes,
    categories,
    isBulkMode,
    selectedDocumentTypes,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onCopyToClipboard,
    getFileSizeMB,
    formatFileFormats,
    formatDate,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: DocumentTypesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    const getCategoryName = (categoryId: number) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    const getRequiredColor = (isRequired: boolean): string => {
        return isRequired 
            ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (typeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(typeId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedDocumentTypes), [selectedDocumentTypes]);

    const emptyState = (
        <EmptyState
            title="No document types found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a document type.'}
            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = route('admin.document-types.create')}
            createLabel="Create Document Type"
        />
    );

    // Early return for empty state
    if (documentTypes.length === 0) {
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
            {documentTypes.map((documentType) => {
                const isSelected = selectedSet.has(documentType.id);
                const isExpanded = expandedId === documentType.id;
                const categoryName = getCategoryName(documentType.document_category_id);
                
                return (
                    <Card
                        key={documentType.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(documentType.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        documentType.is_active 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        <FileText className={`h-5 w-5 ${
                                            documentType.is_active 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono font-medium text-sm text-gray-500 dark:text-gray-400">
                                            {documentType.code || 'N/A'}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={documentType.name}>
                                            {documentType.name || 'Unnamed'}
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(documentType.id)}
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
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.document-types.show', documentType.id)} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.document-types.edit', documentType.id)} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Document Type
                                                </Link>
                                            </DropdownMenuItem>

                                            {onDuplicate && (
                                                <DropdownMenuItem onClick={() => onDuplicate(documentType)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(documentType.code || '', 'Code');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(documentType.name || '', 'Name');
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Name
                                            </DropdownMenuItem>

                                            {onToggleStatus && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleStatus(documentType);
                                                    }}>
                                                        {documentType.is_active ? (
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
                                                </>
                                            )}

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(documentType.id)}>
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
                                                className="text-red-600 dark:text-red-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(documentType);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Document Type
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(documentType.is_active)}`}
                                >
                                    {documentType.is_active ? 
                                        <CheckCircle className="h-3 w-3 mr-1" /> : 
                                        <XCircle className="h-3 w-3 mr-1" />
                                    }
                                    {documentType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getRequiredColor(documentType.is_required)}`}
                                >
                                    {documentType.is_required ? 
                                        <CheckCircle className="h-3 w-3 mr-1" /> : 
                                        <Layers className="h-3 w-3 mr-1" />
                                    }
                                    {documentType.is_required ? 'Required' : 'Optional'}
                                </Badge>
                            </div>

                            {/* Category */}
                            <div className="mb-3">
                                <Badge variant="outline" className="text-xs">
                                    <Folder className="h-3 w-3 mr-1" />
                                    {categoryName}
                                </Badge>
                            </div>

                            {/* Description */}
                            {documentType.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" title={documentType.description}>
                                    {documentType.description}
                                </p>
                            )}

                            {/* File Specifications */}
                            <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <HardDrive className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                    <span>Max: {getFileSizeMB(documentType.max_file_size)} MB</span>
                                </div>
                                {documentType.accepted_formats && documentType.accepted_formats.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <FileType className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                        <span className="text-xs">{formatFileFormats(documentType.accepted_formats)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Sort Order */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Sort Order: {documentType.sort_order}
                            </div>

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(documentType.id, e)}
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
                                    {documentType.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {documentType.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Info */}
                                    {documentType.remarks && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {documentType.remarks}
                                            </p>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(documentType.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(documentType.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('admin.document-types.show', documentType.id)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(documentType.id, e)}
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