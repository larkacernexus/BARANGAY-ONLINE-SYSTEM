// components/admin/document-types/DocumentTypesGridView.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
} from 'lucide-react';
import { route } from 'ziggy-js';

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
}: DocumentTypesGridViewProps) {
    const getCategoryName = (categoryId: number) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-gray-50 dark:bg-gray-950">
            {documentTypes.map((documentType) => {
                const isSelected = selectedDocumentTypes.includes(
                    documentType.id,
                );
                const categoryName = getCategoryName(
                    documentType.document_category_id,
                );

                return (
                    <Card
                        key={documentType.id}
                        className={`overflow-hidden border transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-900 ${
                            isSelected
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-900/30'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (
                                isBulkMode &&
                                e.target instanceof HTMLElement &&
                                !e.target.closest('a') &&
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content') &&
                                !e.target.closest('input[type="checkbox"]')
                            ) {
                                onItemSelect(documentType.id);
                            }
                        }}
                    >
                        <div className="p-4">
                            {/* Header with selection checkbox and actions */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                onItemSelect(documentType.id)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <Badge
                                        variant={
                                            documentType.is_required
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className={`flex items-center gap-1 ${
                                            documentType.is_required
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {documentType.is_required ? (
                                            <>
                                                <CheckCircle className="h-3 w-3" />
                                                Required
                                            </>
                                        ) : (
                                            <>
                                                <Layers className="h-3 w-3" />
                                                Optional
                                            </>
                                        )}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                                            <Link
                                                href={route(
                                                    'admin.document-types.show',
                                                    documentType.id,
                                                )}
                                                className="flex cursor-pointer items-center"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800">
                                            <Link
                                                href={route(
                                                    'admin.document-types.edit',
                                                    documentType.id,
                                                )}
                                                className="flex cursor-pointer items-center"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Document Type</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(
                                                    documentType.code || '',
                                                    'Code',
                                                );
                                            }}
                                            className="flex cursor-pointer items-center text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Code</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(
                                                    documentType.name || '',
                                                    'Name',
                                                );
                                            }}
                                            className="flex cursor-pointer items-center text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Name</span>
                                        </DropdownMenuItem>

                                        {onToggleStatus && (
                                            <>
                                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleStatus(
                                                            documentType,
                                                        );
                                                    }}
                                                    className={`flex cursor-pointer items-center ${
                                                        documentType.is_active
                                                            ? 'text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-900/20'
                                                            : 'text-green-600 dark:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20'
                                                    }`}
                                                >
                                                    {documentType.is_active ? (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            <span>Deactivate</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            <span>Activate</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                                        <DropdownMenuItem
                                            className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 flex cursor-pointer items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(documentType);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Document Type</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Document Type Code and Name */}
                            <div className="mb-3">
                                <div className="mb-1 font-mono text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {documentType.code || 'N/A'}
                                </div>
                                <h3
                                    className="truncate font-semibold text-gray-900 dark:text-gray-100"
                                    title={documentType.name}
                                >
                                    {documentType.name || 'Unnamed'}
                                </h3>
                            </div>

                            {/* Description */}
                            {documentType.description && (
                                <p
                                    className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
                                    title={documentType.description}
                                >
                                    {documentType.description}
                                </p>
                            )}

                            {/* Category */}
                            <div className="mb-3">
                                <Badge
                                    variant="outline"
                                    className="mb-2 flex items-center gap-1 dark:border-gray-700 dark:text-gray-300"
                                >
                                    <Folder className="h-3 w-3" />
                                    {categoryName}
                                </Badge>
                            </div>

                            {/* File Specifications */}
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Max:{' '}
                                        {getFileSizeMB(
                                            documentType.max_file_size,
                                        )}{' '}
                                        MB
                                    </span>
                                </div>
                                {documentType.accepted_formats &&
                                    documentType.accepted_formats.length >
                                        0 && (
                                        <div className="flex items-center gap-2">
                                            <FileType className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {formatFileFormats(
                                                    documentType.accepted_formats,
                                                )}
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {/* Badges */}
                            <div className="mb-4 flex flex-wrap gap-1">
                                <Badge
                                    variant={
                                        documentType.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className={`text-xs ${
                                        documentType.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {documentType.is_active
                                        ? 'Active'
                                        : 'Inactive'}
                                </Badge>
                                <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                    Sort: {documentType.sort_order}
                                </Badge>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Updated:{' '}
                                    {formatDate(documentType.updated_at)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                            <FileText className="h-3 w-3 mr-1" />
                                            View Reqs
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                        <p>View clearance requirements</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}