// components/admin/forms/FormsTableView.tsx

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, DownloadIcon, Eye, Edit, Trash2, MoreVertical, FileText, Building, CheckCircle, XCircle, PlayCircle, PauseCircle, CheckSquare, Copy, Square } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, Filters } from '@/types/admin/forms/forms.types';
import { formUtils } from '@/admin-utils/form-utils';
import { useState, useEffect, MouseEvent } from 'react';

interface FormsTableViewProps {
    forms: Form[];
    isBulkMode: boolean;
    selectedForms: number[];
    isMobile: boolean;
    filtersState?: Filters;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    // Add missing props
    formatFileSize?: (bytes: number) => string;
    categories?: string[];
    agencies?: string[];
}

export default function FormsTableView({
    forms,
    isBulkMode,
    selectedForms,
    isMobile,
    filtersState = {
        sort_by: 'created_at',
        sort_order: 'desc',
        category: 'all',
        agency: 'all',
        status: 'all',
        from_date: '',
        to_date: ''
    },
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDownload,
    onSelectAllOnPage,
    isSelectAll,
    formatFileSize = formUtils.formatFileSize, // Default to formUtils if not provided
    categories = [],
    agencies = []
}: FormsTableViewProps) {
    // Add local state for window width to prevent hydration issues
    const [windowWidth, setWindowWidth] = useState<number>(0);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const getSortIcon = (column: string) => {
        if (!filtersState || filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const getTruncationLength = (type: string): number => {
        if (isMobile) {
            switch (type) {
                case 'title': return 25;
                case 'description': return 40;
                case 'agency': return 15;
                default: return 20;
            }
        }
        return 50;
    };

    const handleViewDetails = (id: number, e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = route('admin.forms.show', id);
    };

    const handleEdit = (id: number, e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = route('admin.forms.edit', id);
    };

    const renderTableRow = (form: Form) => {
        const titleLength = getTruncationLength('title');
        const descLength = getTruncationLength('description');
        const agencyLength = getTruncationLength('agency');
        const isSelected = selectedForms.includes(form.id);
        
        return (
            <TableRow 
                key={form.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                } ${!form.is_active ? 'opacity-60' : ''}`}
                onClick={(e) => {
                    if (isBulkMode && e.target instanceof HTMLElement && 
                        !e.target.closest('a') && 
                        !e.target.closest('button') &&
                        !e.target.closest('[role="menu"]') &&
                        !e.target.closest('input[type="checkbox"]')) {
                        onItemSelect(form.id);
                    }
                }}
            >
                {isBulkMode && (
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(form.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {formUtils.truncateText(form.title || 'Untitled', titleLength)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {formUtils.truncateText(form.description || '', descLength)}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {formUtils.formatDateTime(form.created_at)}
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <Badge 
                        className={formUtils.getCategoryColor(form.category || 'Other')}
                    >
                        {form.category || 'Uncategorized'}
                    </Badge>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div className="truncate dark:text-gray-300" title={form.issuing_agency || 'Unknown'}>
                            {formUtils.truncateText(form.issuing_agency || 'Unknown', agencyLength)}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="text-gray-900 dark:text-white">
                        {(form.download_count || 0).toLocaleString()}
                    </div>
                </TableCell>
                {!isMobile && (
                    <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <div className="text-sm truncate dark:text-gray-300" title={form.file_name || 'Unknown'}>
                                    {formUtils.truncateText(form.file_name || 'Unknown', 20)}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(form.file_size || 0)}
                            </div>
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <Badge 
                        variant={form.is_active ? "default" : "secondary"}
                        className="flex items-center gap-1"
                    >
                        {form.is_active ? (
                            <CheckCircle className="h-3 w-3" />
                        ) : (
                            <XCircle className="h-3 w-3" />
                        )}
                        {form.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button 
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
                                {form.is_active ? (
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
                </TableCell>
            </TableRow>
        );
    };

    const calculateColumnSpan = () => {
        let baseCols = isMobile ? 5 : 6;
        if (isBulkMode) baseCols += 1;
        return baseCols + 1; // +1 for actions column
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-center w-10 sm:w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && forms.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] sm:min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('title')}
                                >
                                    <div className="flex items-center gap-1">
                                        Form Details
                                        {getSortIcon('title')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('category')}
                                >
                                    <div className="flex items-center gap-1">
                                        Category
                                        {getSortIcon('category')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('agency')}
                                >
                                    <div className="flex items-center gap-1">
                                        Agency
                                        {getSortIcon('agency')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('downloads')}
                                >
                                    <div className="flex items-center gap-1">
                                        Downloads
                                        {getSortIcon('downloads')}
                                    </div>
                                </TableHead>
                                {!isMobile && (
                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                        File Info
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[60px] sm:min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {forms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={calculateColumnSpan()} className="text-center py-8">
                                        <EmptyState
                                            title="No forms found"
                                            description={hasActiveFilters 
                                                ? 'Try changing your filters or search criteria.'
                                                : 'Get started by uploading a form.'}
                                            icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                                            hasFilters={hasActiveFilters}
                                            onClearFilters={onClearFilters}
                                            onCreateNew={() => window.location.href = '/forms/create'}
                                            createLabel="Upload Form"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                forms.map(form => renderTableRow(form))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}