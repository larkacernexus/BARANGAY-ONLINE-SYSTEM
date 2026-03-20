// components/admin/document-types/DocumentTypesTableView.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DocumentType } from '@/types/document-types';
import { Link } from '@inertiajs/react';
import {
    CheckCircle,
    CheckSquare,
    Clipboard,
    Copy,
    Edit,
    Eye,
    FileType,
    Folder,
    HardDrive,
    Layers,
    MoreVertical,
    Square,
    Trash2,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface DocumentTypesTableViewProps {
    documentTypes: DocumentType[];
    categories: Array<{ id: number; name: string; slug: string }>;
    isBulkMode: boolean;
    selectedDocumentTypes: number[];
    filtersState: {
        search: string;
        status: string;
        category: string;
        required: string;
    };
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (documentType: DocumentType) => void;
    onToggleStatus?: (documentType: DocumentType) => void;
    onDuplicate?: (documentType: DocumentType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    getFileSizeMB: (bytes: number) => number;
    formatFileFormats: (formats?: string[]) => string;
    formatDate: (dateString: string) => string;
}

export default function DocumentTypesTableView({
    documentTypes,
    categories,
    isBulkMode,
    selectedDocumentTypes,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    getFileSizeMB,
    formatFileFormats,
    formatDate,
}: DocumentTypesTableViewProps) {
    // Get sort icon
    const getSortIcon = (field: string) => {
        // This is a simplified version - in a real app you'd track sort state
        return null;
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    return (
        <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="w-12 px-4 py-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={
                                                    isSelectAll &&
                                                    documentTypes.length > 0
                                                }
                                                onCheckedChange={
                                                    onSelectAllOnPage
                                                }
                                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead
                                    className="min-w-[100px] cursor-pointer px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                                    onClick={() => onSort('code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code
                                        {getSortIcon('code')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="min-w-[160px] cursor-pointer px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="min-w-[120px] cursor-pointer px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                                    onClick={() => onSort('category')}
                                >
                                    <div className="flex items-center gap-1">
                                        Category
                                        {getSortIcon('category')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="min-w-[100px] cursor-pointer px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                                    onClick={() => onSort('is_required')}
                                >
                                    <div className="flex items-center gap-1">
                                        Requirement
                                        {getSortIcon('is_required')}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[120px] px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    File Specifications
                                </TableHead>
                                <TableHead className="min-w-[100px] px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="sticky right-0 min-w-[80px] bg-gray-50 px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-900">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {documentTypes.map((documentType) => {
                                const isSelected =
                                    selectedDocumentTypes.includes(
                                        documentType.id,
                                    );
                                const categoryName = getCategoryName(
                                    documentType.document_category_id,
                                );

                                return (
                                    <TableRow
                                        key={documentType.id}
                                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30 ${
                                            isSelected
                                                ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                                : ''
                                        }`}
                                        onClick={(e) => {
                                            if (
                                                isBulkMode &&
                                                e.target instanceof
                                                    HTMLElement &&
                                                !e.target.closest('a') &&
                                                !e.target.closest('button') &&
                                                !e.target.closest(
                                                    '.dropdown-menu-content',
                                                ) &&
                                                !e.target.closest(
                                                    'input[type="checkbox"]',
                                                )
                                            ) {
                                                onItemSelect(documentType.id);
                                            }
                                        }}
                                    >
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() =>
                                                            onItemSelect(
                                                                documentType.id,
                                                            )
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-mono font-medium">
                                                {documentType.code || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium">
                                                {documentType.name || 'Unnamed'}
                                            </div>
                                            {documentType.description && (
                                                <div className="max-w-xs truncate text-sm text-gray-500">
                                                    {documentType.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1"
                                            >
                                                <Folder className="h-3 w-3" />
                                                {categoryName}
                                            </Badge>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Sort: {documentType.sort_order}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    documentType.is_required
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {documentType.is_required ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Required
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <Layers className="h-3 w-3" />
                                                        Optional
                                                    </div>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">
                                                        {getFileSizeMB(
                                                            documentType.max_file_size,
                                                        )}{' '}
                                                        MB
                                                    </span>
                                                </div>
                                                {documentType.accepted_formats &&
                                                    documentType
                                                        .accepted_formats
                                                        .length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <FileType className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatFileFormats(
                                                                    documentType.accepted_formats,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    documentType.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {documentType.is_active ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </div>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="sticky right-0 bg-white px-4 py-3 text-right dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
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
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
