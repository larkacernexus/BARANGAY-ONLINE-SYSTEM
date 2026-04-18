// import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// import { Head, router, usePage } from '@inertiajs/react';
// import { toast } from 'sonner';
// import debounce from 'lodash/debounce';
// import AppLayout from '@/layouts/admin-app-layout';
// import { TooltipProvider } from '@/components/ui/tooltip';
// import { Button } from '@/components/ui/button';
// import { KeyRound } from 'lucide-react';

// // Import custom components
// import PrivilegesHeader from '@/components/admin/privileges/PrivilegesHeader';
// import PrivilegesStats from '@/components/admin/privileges/PrivilegesStats';
// import PrivilegesFilters from '@/components/admin/privileges/PrivilegesFilters';
// import PrivilegesContent from '@/components/admin/privileges/PrivilegesContent';
// import PrivilegesDialogs from '@/components/admin/privileges/PrivilegesDialogs';

// // Import types
// import { 
//     Privilege, 
//     PrivilegeFilters, 
//     PrivilegeStats, 
//     PaginationData,
//     SelectionStats,
//     SelectionMode,
//     BulkOperation,
//     DiscountType
// } from '@/types/admin/privileges/privilege.types';
// import { privilegeUtils } from '@/types/admin/privileges/privilege.types';

// interface PrivilegesPageProps {
//     privileges: PaginationData;
//     filters: PrivilegeFilters;
//     discountTypes: DiscountType[];
//     can: {
//         create: boolean;
//         edit: boolean;
//         delete: boolean;
//         assign: boolean;
//     };
//     stats?: PrivilegeStats;
// }

// const defaultStats: PrivilegeStats = {
//     total: 0,
//     active: 0,
//     totalAssignments: 0,
//     activeAssignments: 0
// };

// export default function PrivilegesIndex({ 
//     privileges, 
//     filters, 
//     discountTypes,
//     can,
//     stats: globalStats = defaultStats
// }: PrivilegesPageProps) {
//     const { flash } = usePage().props as any;
    
//     // State management
//     const [search, setSearch] = useState(filters.search || '');
//     const [filtersState, setFiltersState] = useState<PrivilegeFilters>({
//         status: filters.status || 'all',
//         discount_type: filters.discount_type || 'all',
//         requires_verification: filters.requires_verification || 'all',
//         requires_id_number: filters.requires_id_number || 'all',
//         sort_by: filters.sort_by || 'name',
//         sort_order: filters.sort_order || 'asc'
//     });
//     const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(15);
//     const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
//     const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
//     // Bulk selection states
//     const [selectedPrivileges, setSelectedPrivileges] = useState<number[]>([]);
//     const [isBulkMode, setIsBulkMode] = useState(false);
//     const [isSelectAll, setIsSelectAll] = useState(false);
//     const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
//     const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
//     const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
//     const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
//     const [bulkEditValue, setBulkEditValue] = useState<string>('');

//     const searchInputRef = useRef<HTMLInputElement>(null);

//     // Debounced search function
//     const debouncedSearch = useCallback(
//         debounce((value: string) => {
//             const params = {
//                 ...filtersState,
//                 search: value || undefined,
//                 status: filtersState.status === 'all' ? undefined : filtersState.status,
//                 discount_type: filtersState.discount_type === 'all' ? undefined : filtersState.discount_type,
//                 requires_verification: filtersState.requires_verification === 'all' ? undefined : filtersState.requires_verification,
//                 requires_id_number: filtersState.requires_id_number === 'all' ? undefined : filtersState.requires_id_number,
//             };
            
//             Object.keys(params).forEach(key => {
//                 const k = key as keyof typeof params;
//                 if (params[k] === undefined || params[k] === '') {
//                     delete params[k];
//                 }
//             });
            
//             router.get('/admin/privileges', params, {
//                 preserveState: true,
//                 replace: true,
//                 preserveScroll: true,
//             });
//         }, 300),
//         [filtersState]
//     );

//     // Cleanup debounce on unmount
//     useEffect(() => {
//         return () => {
//             debouncedSearch.cancel();
//         };
//     }, [debouncedSearch]);

//     // Handle window resize
//     useEffect(() => {
//         if (typeof window === 'undefined') return;

//         const handleResize = () => {
//             const width = window.innerWidth;
//             setWindowWidth(width);
//             setIsMobile(width < 768);
//             if (width < 768 && viewMode === 'table') {
//                 setViewMode('grid');
//             }
//         };

//         window.addEventListener('resize', handleResize);
//         handleResize();
//         return () => window.removeEventListener('resize', handleResize);
//     }, [viewMode]);

//     // Auto switch to grid view on mobile
//     useEffect(() => {
//         if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
//             setViewMode('grid');
//         }
//     }, []);

//     // Flash messages
//     useEffect(() => {
//         if (flash?.success) {
//             toast.success(flash.success);
//         }
//         if (flash?.error) {
//             toast.error(flash.error);
//         }
//     }, [flash]);

//     // Filter privileges
//     const filteredPrivileges = useMemo(() => {
//         return privilegeUtils.filterPrivileges({
//             privileges: privileges.data,
//             search,
//             filters: filtersState
//         });
//     }, [privileges.data, search, filtersState]);

//     // Calculate filtered stats
//     const filteredStats = useMemo(() => {
//         return {
//             total: filteredPrivileges.length,
//             active: filteredPrivileges.filter(p => p.is_active).length,
//             totalAssignments: filteredPrivileges.reduce((sum, p) => sum + (p.residents_count || 0), 0),
//             activeAssignments: filteredPrivileges.reduce((sum, p) => sum + (p.active_residents_count || 0), 0)
//         };
//     }, [filteredPrivileges]);

//     // Pagination
//     const totalItems = filteredPrivileges.length;
//     const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
//     const paginatedPrivileges = filteredPrivileges.slice(startIndex, endIndex);

//     // Reset to first page when filters change
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [search, filtersState]);

//     // Reset selection when exiting bulk mode
//     useEffect(() => {
//         if (!isBulkMode) {
//             setSelectedPrivileges([]);
//             setIsSelectAll(false);
//         }
//     }, [isBulkMode]);

//     // Keyboard shortcuts
//     useEffect(() => {
//         if (isMobile) return;
        
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
//                 e.preventDefault();
//                 if (e.shiftKey) {
//                     handleSelectAllFiltered();
//                 } else {
//                     handleSelectAllOnPage();
//                 }
//             }
//             if (e.key === 'Escape') {
//                 if (isBulkMode) {
//                     if (selectedPrivileges.length > 0) {
//                         setSelectedPrivileges([]);
//                     } else {
//                         setIsBulkMode(false);
//                     }
//                 }
//             }
//             if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
//                 e.preventDefault();
//                 setIsBulkMode(!isBulkMode);
//             }
//             if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
//                 e.preventDefault();
//                 searchInputRef.current?.focus();
//             }
//             if (e.key === 'Delete' && isBulkMode && selectedPrivileges.length > 0) {
//                 e.preventDefault();
//                 setShowBulkDeleteDialog(true);
//             }
//         };

//         document.addEventListener('keydown', handleKeyDown);
//         return () => document.removeEventListener('keydown', handleKeyDown);
//     }, [isBulkMode, selectedPrivileges, isMobile]);

//     // Selection handlers
//     const handleSelectAllOnPage = () => {
//         const pageIds = paginatedPrivileges.map(privilege => privilege.id);
//         if (isSelectAll) {
//             setSelectedPrivileges(prev => prev.filter(id => !pageIds.includes(id)));
//         } else {
//             const newSelected = [...new Set([...selectedPrivileges, ...pageIds])];
//             setSelectedPrivileges(newSelected);
//         }
//         setIsSelectAll(!isSelectAll);
//         setSelectionMode('page');
//     };

//     const handleSelectAllFiltered = () => {
//         const allIds = filteredPrivileges.map(privilege => privilege.id);
//         if (selectedPrivileges.length === allIds.length && allIds.every(id => selectedPrivileges.includes(id))) {
//             setSelectedPrivileges(prev => prev.filter(id => !allIds.includes(id)));
//         } else {
//             const newSelected = [...new Set([...selectedPrivileges, ...allIds])];
//             setSelectedPrivileges(newSelected);
//             setSelectionMode('filtered');
//         }
//     };

//     const handleSelectAll = () => {
//         if (confirm(`This will select ALL ${privileges.total || 0} privileges. This action may take a moment.`)) {
//             const allIds = privileges.data.map(p => p.id);
//             setSelectedPrivileges(allIds);
//             setSelectionMode('all');
//         }
//     };

//     const handleItemSelect = (id: number) => {
//         setSelectedPrivileges(prev => {
//             if (prev.includes(id)) {
//                 return prev.filter(itemId => itemId !== id);
//             } else {
//                 return [...prev, id];
//             }
//         });
//     };

//     // Check if all items on current page are selected
//     useEffect(() => {
//         const allPageIds = paginatedPrivileges.map(privilege => privilege.id);
//         const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedPrivileges.includes(id));
//         setIsSelectAll(allSelected);
//     }, [selectedPrivileges, paginatedPrivileges]);

//     // Get selected privileges data
//     const selectedPrivilegesData = useMemo(() => {
//         return filteredPrivileges.filter(privilege => selectedPrivileges.includes(privilege.id));
//     }, [selectedPrivileges, filteredPrivileges]);

//     // Calculate selection stats
//     const selectionStats = useMemo((): SelectionStats => {
//         return privilegeUtils.getSelectionStats(selectedPrivilegesData);
//     }, [selectedPrivilegesData]);

//     // Bulk operations
//     const handleBulkOperation = async (operation: BulkOperation) => {
//         if (selectedPrivileges.length === 0) {
//             toast.error('Please select at least one privilege');
//             return;
//         }

//         setIsPerformingBulkAction(true);

//         try {
//             switch (operation) {
//                 case 'delete':
//                     setShowBulkDeleteDialog(true);
//                     break;

//                 case 'update_status':
//                     setShowBulkStatusDialog(true);
//                     break;

//                 case 'export':
//                 case 'export_csv':
//                     privilegeUtils.exportToCSV(selectedPrivilegesData);
//                     toast.success(`${selectedPrivileges.length} privileges exported successfully`);
//                     setSelectedPrivileges([]);
//                     break;

//                 case 'print':
//                     selectedPrivileges.forEach(id => {
//                         window.open(`/admin/privileges/${id}/print`, '_blank');
//                     });
//                     toast.success(`${selectedPrivileges.length} privilege(s) opened for printing`);
//                     setSelectedPrivileges([]);
//                     break;

//                 case 'copy_data':
//                     handleCopySelectedData();
//                     break;

//                 default:
//                     toast.info('Functionality to be implemented');
//                     break;
//             }
//         } catch (error) {
//             console.error('Bulk operation error:', error);
//             toast.error('An error occurred during the bulk operation.');
//         } finally {
//             setIsPerformingBulkAction(false);
//         }
//     };

//     const handleBulkStatusUpdate = async () => {
//         if (!bulkEditValue) {
//             toast.error('Please select a status');
//             return;
//         }
        
//         setIsPerformingBulkAction(true);

//         try {
//             await router.post('/admin/privileges/bulk-action', {
//                 action: 'update_status',
//                 privilege_ids: selectedPrivileges,
//                 status: bulkEditValue === 'active' ? 1 : 0
//             }, {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     setSelectedPrivileges([]);
//                     setBulkEditValue('');
//                     setShowBulkStatusDialog(false);
//                     toast.success(`${selectedPrivileges.length} privilege statuses updated successfully`);
//                 },
//                 onError: () => {
//                     toast.error('Failed to update privilege status');
//                 }
//             });
//         } catch (error) {
//             console.error('Bulk status update error:', error);
//             toast.error('An error occurred during the operation.');
//         } finally {
//             setIsPerformingBulkAction(false);
//         }
//     };

//     const handleBulkDelete = async () => {
//         setIsPerformingBulkAction(true);

//         try {
//             await router.post('/admin/privileges/bulk-action', {
//                 action: 'delete',
//                 privilege_ids: selectedPrivileges,
//             }, {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     setSelectedPrivileges([]);
//                     setShowBulkDeleteDialog(false);
//                     toast.success(`${selectedPrivileges.length} privileges deleted successfully`);
//                 },
//                 onError: () => {
//                     toast.error('Failed to delete privileges');
//                 }
//             });
//         } catch (error) {
//             console.error('Bulk delete error:', error);
//             toast.error('An error occurred during the operation.');
//         } finally {
//             setIsPerformingBulkAction(false);
//         }
//     };

//     // Individual privilege operations
//     const handleDelete = (privilege: Privilege) => {
//         if (confirm(`Are you sure you want to delete privilege "${privilege.name || 'Untitled'}"?`)) {
//             router.delete(`/admin/privileges/${privilege.id}`, {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     setSelectedPrivileges(selectedPrivileges.filter(id => id !== privilege.id));
//                     toast.success('Privilege deleted successfully');
//                 },
//                 onError: () => {
//                     toast.error('Failed to delete privilege');
//                 }
//             });
//         }
//     };

//     const handleToggleStatus = (privilege: Privilege) => {
//         router.post(`/admin/privileges/${privilege.id}/toggle-status`, {}, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success(`Privilege ${privilege.is_active ? 'deactivated' : 'activated'} successfully`);
//             },
//             onError: () => {
//                 toast.error('Failed to toggle privilege status');
//             }
//         });
//     };

//     const handleDuplicate = (privilege: Privilege) => {
//         router.post(`/admin/privileges/${privilege.id}/duplicate`, {}, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success('Privilege duplicated successfully');
//             },
//             onError: () => {
//                 toast.error('Failed to duplicate privilege');
//             }
//         });
//     };

//     const handleSort = (column: string) => {
//         const newOrder = filtersState.sort_by === column && filtersState.sort_order === 'asc' ? 'desc' : 'asc';
        
//         setFiltersState(prev => ({
//             ...prev,
//             sort_by: column,
//             sort_order: newOrder
//         }));
        
//         const params = {
//             ...filtersState,
//             sort_by: column,
//             sort_order: newOrder,
//             search: search
//         };
        
//         Object.keys(params).forEach(key => {
//             const k = key as keyof typeof params;
//             if (!params[k] || params[k] === 'all') {
//                 delete params[k];
//             }
//         });
        
//         router.get('/admin/privileges', params, {
//             preserveState: true,
//             replace: true,
//             preserveScroll: true,
//         });
//     };

//     const handleClearFilters = () => {
//         setSearch('');
//         setFiltersState({
//             status: 'all',
//             discount_type: 'all',
//             requires_verification: 'all',
//             requires_id_number: 'all',
//             sort_by: 'name',
//             sort_order: 'asc'
//         });
        
//         router.get('/admin/privileges', {
//             search: '',
//             status: 'all',
//             discount_type: 'all',
//             requires_verification: 'all',
//             requires_id_number: 'all',
//             sort_by: 'name',
//             sort_order: 'asc'
//         }, {
//             preserveState: true,
//             replace: true,
//             preserveScroll: true,
//         });
//     };

//     const handleClearSelection = () => {
//         setSelectedPrivileges([]);
//         setIsSelectAll(false);
//     };

//     const handleCopySelectedData = () => {
//         if (selectedPrivilegesData.length === 0) {
//             toast.error('No data to copy');
//             return;
//         }
        
//         const data = selectedPrivilegesData.map(privilege => ({
//             'Name': privilege.name,
//             'Code': privilege.code,
//             'Discount %': privilege.default_discount_percentage,
//             'Type': privilege.discount_type?.name || 'N/A',
//             'Status': privilege.is_active ? 'Active' : 'Inactive',
//             'Assignments': privilege.residents_count || 0,
//             'Active': privilege.active_residents_count || 0,
//         }));
        
//         const csvData = [
//             Object.keys(data[0]).join(','),
//             ...data.map(row => Object.values(row).join(','))
//         ].join('\n');
        
//         navigator.clipboard.writeText(csvData).then(() => {
//             toast.success(`${selectedPrivilegesData.length} records copied to clipboard`);
//         }).catch(() => {
//             toast.error('Failed to copy to clipboard');
//         });
//     };

//     const updateFilter = (key: keyof PrivilegeFilters, value: string) => {
//         setFiltersState(prev => ({ ...prev, [key]: value }));
        
//         const params = {
//             ...filtersState,
//             [key]: value,
//             search: search
//         };
        
//         Object.keys(params).forEach(key => {
//             const k = key as keyof typeof params;
//             if (!params[k] || params[k] === 'all') {
//                 delete params[k];
//             }
//         });
        
//         router.get('/admin/privileges', params, {
//             preserveState: true,
//             replace: true,
//             preserveScroll: true,
//         });
//     };

//     const hasActiveFilters = Boolean(
//         search || 
//         filtersState.status !== 'all' ||
//         filtersState.discount_type !== 'all' ||
//         filtersState.requires_verification !== 'all' ||
//         filtersState.requires_id_number !== 'all'
//     );

//     return (
//         <AppLayout
//             title="Privilege Management"
//             breadcrumbs={[
//                 { title: 'Dashboard', href: '/admin/dashboard' },
//                 { title: 'Privileges', href: '/admin/privileges' }
//             ]}
//         >
//             <TooltipProvider>
//                 <div className="space-y-4 sm:space-y-6">
//                     <PrivilegesHeader 
//                         isBulkMode={isBulkMode}
//                         setIsBulkMode={setIsBulkMode}
//                         isMobile={isMobile}
//                         canCreate={can?.create || false}
//                     />

//                     <PrivilegesStats 
//                         globalStats={globalStats}
//                         filteredStats={filteredStats}
//                         isLoading={isPerformingBulkAction}
//                     />

//                     <PrivilegesFilters
//                         search={search}
//                         setSearch={setSearch}
//                         onSearchChange={(value) => {
//                             setSearch(value);
//                             debouncedSearch(value);
//                         }}
//                         filtersState={filtersState}
//                         updateFilter={updateFilter}
//                         showAdvancedFilters={showAdvancedFilters}
//                         setShowAdvancedFilters={setShowAdvancedFilters}
//                         handleClearFilters={handleClearFilters}
//                         hasActiveFilters={hasActiveFilters}
//                         isMobile={isMobile}
//                         totalItems={totalItems}
//                         startIndex={startIndex}
//                         endIndex={endIndex}
//                         searchInputRef={searchInputRef}
//                         isLoading={isPerformingBulkAction}
//                         discountTypes={discountTypes}
//                     />

//                     <PrivilegesContent
//                         privileges={paginatedPrivileges}
//                         isBulkMode={isBulkMode}
//                         setIsBulkMode={setIsBulkMode}
//                         isSelectAll={isSelectAll}
//                         selectedPrivileges={selectedPrivileges}
//                         viewMode={viewMode}
//                         setViewMode={setViewMode}
//                         isMobile={isMobile}
//                         hasActiveFilters={hasActiveFilters}
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         totalItems={totalItems}
//                         itemsPerPage={itemsPerPage}
//                         onPageChange={setCurrentPage}
//                         onSelectAllOnPage={handleSelectAllOnPage}
//                         onSelectAllFiltered={handleSelectAllFiltered}
//                         onSelectAll={handleSelectAll}
//                         onItemSelect={handleItemSelect}
//                         onClearFilters={handleClearFilters}
//                         onClearSelection={handleClearSelection}
//                         onDelete={handleDelete}
//                         onToggleStatus={handleToggleStatus}
//                         onDuplicate={handleDuplicate}
//                         onSort={handleSort}
//                         onBulkOperation={handleBulkOperation}
//                         onCopySelectedData={handleCopySelectedData}
//                         setShowBulkDeleteDialog={setShowBulkDeleteDialog}
//                         setShowBulkStatusDialog={setShowBulkStatusDialog}
//                         filtersState={filtersState}
//                         isPerformingBulkAction={isPerformingBulkAction}
//                         selectionMode={selectionMode}
//                         selectionStats={selectionStats}
//                         discountTypes={discountTypes}
//                         can={can}
//                     />

//                     {/* Keyboard Shortcuts Help */}
//                     {isBulkMode && !isMobile && (
//                         <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <KeyRound className="h-4 w-4 text-gray-500" />
//                                     <span className="text-sm font-medium">Keyboard Shortcuts</span>
//                                 </div>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => setIsBulkMode(false)}
//                                     className="h-7 text-xs"
//                                     disabled={isPerformingBulkAction}
//                                 >
//                                     Exit Bulk Mode
//                                 </Button>
//                             </div>
//                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
//                                 <div className="flex items-center gap-1">
//                                     <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
//                                     <span>Select page</span>
//                                 </div>
//                                 <div className="flex items-center gap-1">
//                                     <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
//                                     <span>Select filtered</span>
//                                 </div>
//                                 <div className="flex items-center gap-1">
//                                     <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
//                                     <span>Delete selected</span>
//                                 </div>
//                                 <div className="flex items-center gap-1">
//                                     <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
//                                     <span>Exit/clear</span>
//                                 </div>
//                                 <div className="flex items-center gap-1">
//                                     <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
//                                     <span>Focus search</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </TooltipProvider>

//             <PrivilegesDialogs
//                 showBulkDeleteDialog={showBulkDeleteDialog}
//                 setShowBulkDeleteDialog={setShowBulkDeleteDialog}
//                 showBulkStatusDialog={showBulkStatusDialog}
//                 setShowBulkStatusDialog={setShowBulkStatusDialog}
//                 isPerformingBulkAction={isPerformingBulkAction}
//                 selectedPrivileges={selectedPrivileges}
//                 handleBulkOperation={handleBulkDelete}
//                 handleBulkStatusUpdate={handleBulkStatusUpdate}
//                 selectionStats={selectionStats}
//                 bulkEditValue={bulkEditValue}
//                 setBulkEditValue={setBulkEditValue}
//             />
//         </AppLayout>
//     );
// }