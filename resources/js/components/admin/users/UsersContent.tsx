// components/admin/users/UsersContent.tsx
import { EmptyState } from '@/components/adminui/empty-state';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import { Pagination } from '@/components/adminui/pagination';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UsersContentProps, ViewMode } from '@/types/admin/users/user-types';
import { ArrowUpDown, Grid3X3, List, Rows3, UserIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import UsersBulkActions from './UsersBulkActions';
import UsersGridView from './UsersGridView';
import UsersTable from './UsersTable';

// Dynamic per-page options
const getDynamicPerPageOptions = (totalItems: number) => {
    const options: { value: string; label: string }[] = [];
    options.push({ value: '15', label: '15 per page' });
    if (totalItems > 15) options.push({ value: '30', label: '30 per page' });
    if (totalItems > 30) options.push({ value: '50', label: '50 per page' });
    if (totalItems > 50) options.push({ value: '100', label: '100 per page' });
    if (totalItems > 100) options.push({ value: '500', label: '500 per page' });
    if (totalItems > 0 && totalItems <= 550)
        options.push({ value: 'all', label: `Show All (${totalItems})` });
    return options;
};

interface ExtendedUsersContentProps extends UsersContentProps {
    perPage?: string;
    onPerPageChange?: (value: string) => void;
}

export default function UsersContent({
    users,
    selectedUsers,
    selectedUsersData,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    viewMode,
    setViewMode,
    isMobile,
    hasActiveFilters,
    handleClearFilters,
    handleSelectAllOnPage,
    handleItemSelect,
    handlePageChange,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkRoleDialog,
    roles,
    sortBy: sortByProp = 'name',
    sortOrder: sortOrderProp = 'asc',
    onSort,
    onClearSelection,
    onBulkOperation,
    onCopySelectedData,
    isLoading = false,
    canEdit = true,
    canDelete = true,
    onUserClick,
    onUserEdit,
    onUserDelete,
    onUserStatusChange,
    onUserImpersonate,
    sortBy: externalSortBy,
    sortOrder: externalSortOrder,
    onSortChange,
    getCurrentSortValue,
    perPage = '15',
    onPerPageChange = () => {},
}: ExtendedUsersContentProps & {
    sortByProp?: string;
    sortOrderProp?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}) {
    const sortBy = externalSortBy || sortByProp;
    const sortOrder = externalSortOrder || sortOrderProp;
    const handleSortChange =
        onSortChange ||
        ((value: string) => {
            const [newSortBy] = value.split('-');
            // Only call onSort if it's defined
            if (onSort) {
                onSort(newSortBy);
            }
        });
    const getCurrentValue =
        getCurrentSortValue || (() => `${sortBy}-${sortOrder}`);

    const perPageOptions = getDynamicPerPageOptions(users.total);
    const handlePerPageChange = (value: string) => onPerPageChange(value);

    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode && onClearSelection) {
            onClearSelection();
        }
    };

    useEffect(() => {
        if (isMobile && viewMode === 'table') setViewMode('grid');
    }, [isMobile, viewMode, setViewMode]);
    const handleViewModeChange = (mode: ViewMode) => setViewMode(mode);

    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => onBulkOperation?.('export'),
                tooltip: 'Export selected users',
            },
            {
                label: 'Activate',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Activate selected users',
            },
            {
                label: 'Deactivate',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Deactivate selected users',
            },
        ],
        secondary: [
            {
                label: 'Change Role',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => setShowBulkRoleDialog?.(true),
                tooltip: 'Change role for selected users',
            },
            {
                label: 'Copy Data',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => onCopySelectedData?.(),
                tooltip: 'Copy selected users data',
            },
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <UserIcon className="mr-1.5 h-3.5 w-3.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected users',
                variant: 'destructive' as const,
            },
        ],
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };
    
    const handleToggleStatus = (user: any) => {
        if (onUserStatusChange) {
            onUserStatusChange(
                user,
                user.status === 'active' ? 'inactive' : 'active',
            );
        }
    };
    
    const handleDelete = (user: any) => {
        if (
            confirm(`Are you sure you want to delete ${user.email}?`) &&
            onUserDelete
        ) {
            onUserDelete(user);
        }
    };

    return (
        <>
            {isBulkMode && selectedUsers.length > 0 && (
                <UsersBulkActions
                    selectedUsers={selectedUsers}
                    selectedUsersData={selectedUsersData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkStatusDialog={setShowBulkStatusDialog}
                    setShowBulkRoleDialog={setShowBulkRoleDialog}
                    setIsBulkMode={setIsBulkMode}
                    bulkActions={bulkActions}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={handleSelectAllOnPage}
                />
            )}
            {viewMode === 'grid' &&
                users.data.length > 0 &&
                selectedUsers.length < users.data.length &&
                isBulkMode && (
                    <SelectAllFloat
                        isSelectAll={isSelectAll}
                        onSelectAll={handleSelectAllOnPage}
                        selectedCount={selectedUsers.length}
                        totalCount={users.data.length}
                        position="bottom-right"
                    />
                )}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 p-4 pb-3 sm:p-6 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base font-semibold sm:text-lg md:text-xl dark:text-gray-100">
                                User Accounts
                                {selectedUsers.length > 0 && isBulkMode && (
                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-normal text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {selectedUsers.length} selected
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' : ''}`}
                                        onClick={() =>
                                            handleViewModeChange('table')
                                        }
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Table view</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-200' : ''}`}
                                        onClick={() =>
                                            handleViewModeChange('grid')
                                        }
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Grid view</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isMobile && users.total > 0 && (
                            <div className="flex items-center gap-2">
                                <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={perPage}
                                    onValueChange={handlePerPageChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-8 w-[140px] text-xs">
                                        <SelectValue placeholder="15 per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={getCurrentValue()}
                                    onValueChange={handleSortChange}
                                >
                                    <SelectTrigger className="h-8 w-[180px] text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">
                                            Name (A to Z)
                                        </SelectItem>
                                        <SelectItem value="name-desc">
                                            Name (Z to A)
                                        </SelectItem>
                                        <SelectItem value="email-asc">
                                            Email (A to Z)
                                        </SelectItem>
                                        <SelectItem value="email-desc">
                                            Email (Z to A)
                                        </SelectItem>
                                        <SelectItem value="role-asc">
                                            Role (A to Z)
                                        </SelectItem>
                                        <SelectItem value="role-desc">
                                            Role (Z to A)
                                        </SelectItem>
                                        <SelectItem value="status-asc">
                                            Status (Inactive to Active)
                                        </SelectItem>
                                        <SelectItem value="status-desc">
                                            Status (Active to Inactive)
                                        </SelectItem>
                                        <SelectItem value="created_at-asc">
                                            Created (Oldest first)
                                        </SelectItem>
                                        <SelectItem value="created_at-desc">
                                            Created (Newest first)
                                        </SelectItem>
                                        <SelectItem value="last_login_at-asc">
                                            Last Login (Oldest first)
                                        </SelectItem>
                                        <SelectItem value="last_login_at-desc">
                                            Last Login (Newest first)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {viewMode === 'grid' &&
                            isBulkMode &&
                            users.data.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all-grid"
                                        checked={isSelectAll}
                                        onCheckedChange={handleSelectAllOnPage}
                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 dark:border-gray-600"
                                    />
                                    <Label
                                        htmlFor="select-all-grid"
                                        className="cursor-pointer text-xs font-medium whitespace-nowrap sm:text-sm dark:text-gray-300"
                                    >
                                        {isSelectAll
                                            ? 'Deselect Page'
                                            : 'Select Page'}
                                    </Label>
                                </div>
                            )}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="bulk-mode"
                                                checked={isBulkMode}
                                                onCheckedChange={
                                                    handleBulkModeToggle
                                                }
                                                className="h-5 w-9 data-[state=checked]:bg-blue-600"
                                            />
                                            <Label
                                                htmlFor="bulk-mode"
                                                className="cursor-pointer text-xs font-medium whitespace-nowrap sm:text-sm dark:text-gray-300"
                                            >
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Toggle bulk selection mode</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        <div className="hidden text-xs text-gray-500 sm:block sm:text-sm dark:text-gray-400">
                            Page {users.current_page} of {users.last_page}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {users.data.length === 0 ? (
                        <div className="py-12 sm:py-16 dark:bg-gray-900">
                            <EmptyState
                                title="No users found"
                                description={
                                    hasActiveFilters
                                        ? 'No users match your current filters.'
                                        : 'No users have been created yet.'
                                }
                                icon={
                                    <UserIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                                }
                                hasFilters={hasActiveFilters}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    ) : (
                        <>
                            {viewMode === 'table' ? (
                                <UsersTable
                                    users={users.data}
                                    isBulkMode={isBulkMode}
                                    selectedUsers={selectedUsers}
                                    isSelectAll={isSelectAll}
                                    onItemSelect={handleItemSelect}
                                    onSelectAll={handleSelectAllOnPage}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={onSort || (() => {})}
                                    onUserEdit={onUserEdit}
                                    onUserDelete={handleDelete}
                                    onUserStatusChange={handleToggleStatus}
                                    onCopyToClipboard={handleCopyToClipboard}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            ) : (
                                <UsersGridView
                                    users={users.data}
                                    isBulkMode={isBulkMode}
                                    selectedUsers={selectedUsers}
                                    onItemSelect={handleItemSelect}
                                    isMobile={isMobile}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={handleClearFilters}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                                    onCopyToClipboard={handleCopyToClipboard}
                                    onUserClick={onUserClick}
                                    onUserEdit={onUserEdit}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            )}
                            {viewMode === 'grid' &&
                                isBulkMode &&
                                selectedUsers.length > 0 && (
                                    <GridSelectionSummary
                                        selectedCount={selectedUsers.length}
                                        totalCount={users.data.length}
                                        isSelectAll={isSelectAll}
                                        onSelectAll={handleSelectAllOnPage}
                                        onClearSelection={onClearSelection}
                                        className="mx-4 mt-4"
                                    />
                                )}
                            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                    {isMobile && users.total > 0 && (
                                        <div className="flex w-full items-center gap-2">
                                            <Rows3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Select
                                                value={perPage}
                                                onValueChange={
                                                    handlePerPageChange
                                                }
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="h-8 w-full text-xs">
                                                    <SelectValue placeholder="15 per page" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {perPageOptions.map((o) => (
                                                        <SelectItem
                                                            key={o.value}
                                                            value={o.value}
                                                        >
                                                            {o.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="w-full">
                                        <Pagination
                                            currentPage={users.current_page}
                                            totalPages={users.last_page}
                                            totalItems={users.total}
                                            itemsPerPage={users.per_page}
                                            onPageChange={handlePageChange}
                                            showCount={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}