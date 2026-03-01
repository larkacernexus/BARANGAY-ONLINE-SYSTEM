import AppLayout from '@/layouts/admin-app-layout';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Custom hooks
import { useBackupOperations } from '@/hooks/useBackupOperations';
import { useBackupFilters } from '@/hooks/useBackupFilters';
import { useBackupSelection } from '@/hooks/useBackupSelection';

// Components
import BackupHeader from '@/components/admin/backup/BackupHeader';
import BackupStats from '@/components/admin/backup/BackupStats';
import BackupFilters from '@/components/admin/backup/BackupFilters';
import BackupBulkActions from '@/components/admin/backup/BackupBulkActions';
import BackupTable from '@/components/admin/backup/BackupTable';
import BackupGrid from '@/components/admin/backup/BackupGrid';
import BackupDialogs from '@/components/admin/backup/BackupDialogs';
import KeyboardShortcuts from '@/components/admin/backup/KeyboardShortcuts';

// Utils
import { calculateSelectionStats } from '@/admin-utils/backupUtils';

// Types
import type { PageProps, BackupFile, BulkOperationType } from '@/types/backup';
import { TooltipProvider } from '@/components/ui/tooltip';

const ITEMS_PER_PAGE = 15;
const MOBILE_BREAKPOINT = 768;

export default function BackupIndex() {
  const { props } = usePage<PageProps>();
  
  // Destructure props with safe defaults
  const { 
    backups = { 
      data: [], 
      total: 0, 
      current_page: 1, 
      last_page: 1, 
      from: 0, 
      to: 0, 
      per_page: ITEMS_PER_PAGE 
    },
    diskSpace = { 
      used_percentage: 0, 
      total: '0 GB', 
      used: '0 GB', 
      free: '0 GB',
      total_bytes: 0,
      free_bytes: 0,
      used_bytes: 0
    },
    lastBackup = null,
    stats = { 
      total: 0, 
      full: 0, 
      database: 0, 
      files: 0, 
      recent: 0, 
      protected: 0, 
      total_size_bytes: 0 
    },
    filters = {},
    flash = {},
    auth = { user: null }
  } = props;
  
  // State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Custom hooks
  const backupOperations = useBackupOperations();
  const backupFilters = useBackupFilters(backups.data, filters);
  const backupSelection = useBackupSelection();
  
  const selectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Window resize handler with throttling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        setWindowWidth(width);
        const mobile = width < MOBILE_BREAKPOINT;
        setIsMobile(mobile);
        
        // Auto-switch to grid on mobile for better UX
        if (mobile && viewMode === 'table') {
          setViewMode('grid');
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    // Initialize on mount
    handleResize();
    setIsInitialized(true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [viewMode]);

  // Flash messages
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  // Keyboard shortcuts with useCallback for stability
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input or textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Ctrl/Cmd + A to select all on current page
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && backupSelection.isBulkMode) {
      e.preventDefault();
      if (e.shiftKey) {
        handleSelectAllFiltered();
      } else {
        handleSelectAllOnPage();
      }
    }
    // Escape to exit bulk mode or clear selection
    if (e.key === 'Escape') {
      if (backupSelection.isBulkMode) {
        if (backupSelection.selectedBackups.length > 0) {
          backupSelection.clearSelection();
          toast.info('Selection cleared');
        } else {
          backupSelection.setIsBulkMode(false);
          toast.info('Bulk mode disabled');
        }
      }
      if (backupSelection.showBulkActions) backupSelection.setShowBulkActions(false);
      if (backupSelection.showSelectionOptions) backupSelection.setShowSelectionOptions(false);
    }
    // Ctrl/Cmd + Shift + B to toggle bulk mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
      e.preventDefault();
      const newBulkMode = !backupSelection.isBulkMode;
      backupSelection.setIsBulkMode(newBulkMode);
      toast.info(newBulkMode ? 'Bulk mode enabled' : 'Bulk mode disabled');
    }
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    // Delete key to open delete dialog
    if (e.key === 'Delete' && backupSelection.isBulkMode && backupSelection.selectedBackups.length > 0) {
      e.preventDefault();
      backupOperations.setShowBulkDeleteDialog(true);
    }
  }, [
    backupSelection.isBulkMode, 
    backupSelection.selectedBackups, 
    backupSelection.showBulkActions, 
    backupSelection.showSelectionOptions,
    backupSelection.setIsBulkMode,
    backupSelection.clearSelection,
    backupSelection.setShowBulkActions,
    backupSelection.setShowSelectionOptions
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Calculate pagination
  const totalItems = backupFilters.filteredBackups.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedBackups = backupFilters.filteredBackups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    backupFilters.search,
    backupFilters.typeFilter,
    backupFilters.sizeFilter,
    backupFilters.fromDateFilter,
    backupFilters.toDateFilter,
    backupFilters.sortBy,
    backupFilters.sortOrder
  ]);

  // Update select all state
  useEffect(() => {
    const pageIds = paginatedBackups.map(b => b.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => 
      backupSelection.selectedBackups.includes(id)
    );
    backupSelection.setIsSelectAll(allSelected);
  }, [backupSelection.selectedBackups, paginatedBackups]);

  // Selection handlers
  const handleSelectAllOnPage = useCallback(() => {
    const pageIds = paginatedBackups.map(b => b.id);
    backupSelection.handleSelectAllOnPage(pageIds);
  }, [paginatedBackups, backupSelection.handleSelectAllOnPage]);

  const handleSelectAllFiltered = useCallback(() => {
    const filteredIds = backupFilters.filteredBackups.map(b => b.id);
    backupSelection.handleSelectAllFiltered(filteredIds);
  }, [backupFilters.filteredBackups, backupSelection.handleSelectAllFiltered]);

  const handleSelectAll = useCallback(() => {
    if (!backups.total || backups.total === 0) {
      toast.error('No backup data available');
      return;
    }
    
    if (confirm(`This will select ALL ${backups.total} backups. This action may take a moment.`)) {
      const allIds = backups.data.map(b => b.id);
      backupSelection.setSelectedBackups(allIds);
      backupSelection.setSelectionMode('all');
      toast.success(`Selected all ${backups.total} backups`);
    }
  }, [backups.total, backups.data, backupSelection.setSelectedBackups, backupSelection.setSelectionMode]);

  // Get selected backups data
  const selectedBackupsData = useCallback(() => {
    return backups.data.filter(backup => 
      backupSelection.selectedBackups.includes(backup.id)
    );
  }, [backups.data, backupSelection.selectedBackups]);

  // Calculate selection stats
  const selectionStats = calculateSelectionStats(selectedBackupsData());

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll to top on page change for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  // Handle create backup
  const handleCreateBackupClick = useCallback(() => {
    backupOperations.setShowCreateDialog(true);
  }, [backupOperations.setShowCreateDialog]);

  // Handle export
  const handleExport = useCallback(() => {
    backupOperations.handleBulkOperation('export', backupSelection.selectedBackups, selectedBackupsData());
  }, [backupOperations.handleBulkOperation, backupSelection.selectedBackups, selectedBackupsData]);

  // Handle bulk operations
  const handleBulkOperation = useCallback((operation: BulkOperationType) => {
    backupOperations.handleBulkOperation(
      operation, 
      backupSelection.selectedBackups,
      selectedBackupsData()
    );
  }, [backupOperations.handleBulkOperation, backupSelection.selectedBackups, selectedBackupsData]);

  // Handle copy selected data
  const handleCopySelectedData = useCallback(() => {
    backupOperations.handleCopySelectedData(selectedBackupsData());
  }, [backupOperations.handleCopySelectedData, selectedBackupsData]);

  // Handle sort for grid view (if needed)
  const handleSort = useCallback((column: string) => {
    backupFilters.handleSort(column);
  }, [backupFilters.handleSort]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <AppLayout
        title="Backup Management"
        breadcrumbs={[
          { title: 'Dashboard', href: route('admin.dashboard') },
          { title: 'Backups', href: route('admin.backup.index') }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading backups...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Backup Management"
      breadcrumbs={[
        { title: 'Dashboard', href: route('admin.dashboard') },
        { title: 'Backups', href: route('admin.backup.index') }
      ]}
    >
      <TooltipProvider>
        <div className="space-y-6">
          {/* Flash Messages */}
          {flash?.success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg dark:bg-green-900/20 dark:border-green-700">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-green-800 font-medium dark:text-green-300">Success</p>
                  <p className="text-green-700 text-sm mt-1 dark:text-green-400">{flash.success}</p>
                </div>
              </div>
            </div>
          )}

          {flash?.error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg dark:bg-red-900/20 dark:border-red-700">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <p className="text-red-800 font-medium dark:text-red-300">Error</p>
                  <p className="text-red-700 text-sm mt-1 dark:text-red-400">{flash.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <BackupHeader
            isBulkMode={backupSelection.isBulkMode}
            onToggleBulkMode={backupSelection.setIsBulkMode}
            onCreateBackup={handleCreateBackupClick}
            totalBackups={totalItems}
          />

          {/* Stats Cards */}
          <BackupStats
            diskSpace={diskSpace}
            lastBackup={lastBackup}
            stats={stats}
          />

          {/* Search and Filters */}
          <BackupFilters
            search={backupFilters.search}
            onSearchChange={backupFilters.setSearch}
            typeFilter={backupFilters.typeFilter}
            onTypeFilterChange={backupFilters.setTypeFilter}
            sizeFilter={backupFilters.sizeFilter}
            onSizeFilterChange={backupFilters.setSizeFilter}
            sortBy={backupFilters.sortBy}
            onSortChange={backupFilters.setSortBy}
            sortOrder={backupFilters.sortOrder}
            onSortOrderToggle={() => backupFilters.setSortOrder(
              prev => prev === 'asc' ? 'desc' : 'asc'
            )}
            showAdvancedFilters={backupFilters.showAdvancedFilters}
            onToggleAdvancedFilters={() => backupFilters.setShowAdvancedFilters(!backupFilters.showAdvancedFilters)}
            hasActiveFilters={backupFilters.hasActiveFilters}
            onClearFilters={backupFilters.handleClearFilters}
            onExport={handleExport}
            isBulkMode={backupSelection.isBulkMode}
            selectedCount={backupSelection.selectedBackups.length}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            searchInputRef={searchInputRef}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={isMobile}
          />

          {/* Enhanced Bulk Actions Bar */}
          {backupSelection.isBulkMode && backupSelection.selectedBackups.length > 0 && (
            <BackupBulkActions
              selectedBackups={backupSelection.selectedBackups}
              selectionMode={backupSelection.selectionMode}
              selectionStats={selectionStats}
              isPerformingBulkAction={backupOperations.isPerformingBulkAction}
              isSelectAll={backupSelection.isSelectAll}
              isMobile={isMobile}
              totalItems={totalItems}
              onClearSelection={backupSelection.clearSelection}
              onSelectAllOnPage={handleSelectAllOnPage}
              onSelectAllFiltered={handleSelectAllFiltered}
              onSelectAll={handleSelectAll}
              onBulkOperation={handleBulkOperation}
              onCopySelectedData={handleCopySelectedData}
              setShowBulkDeleteDialog={backupOperations.setShowBulkDeleteDialog}
            />
          )}

          {/* Backups Table/Grid */}
          {viewMode === 'table' ? (
            <BackupTable
              backups={paginatedBackups}
              isBulkMode={backupSelection.isBulkMode}
              selectedBackups={backupSelection.selectedBackups}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isMobile={isMobile}
              filtersState={{
                type: backupFilters.typeFilter,
                size: backupFilters.sizeFilter,
                sort_by: backupFilters.sortBy,
                sort_order: backupFilters.sortOrder
              }}
              onItemSelect={backupSelection.handleItemSelect}
              onSort={handleSort}
              onDelete={backupOperations.handleDeleteBackup}
              onDownload={backupOperations.handleDownloadBackup}
              onToggleProtection={backupOperations.toggleProtection}
              onSelectAllOnPage={handleSelectAllOnPage}
              onSelectAllFiltered={handleSelectAllFiltered}
              onSelectAll={handleSelectAll}
              onClearSelection={backupSelection.clearSelection}
              isSelectAll={backupSelection.isSelectAll}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              hasActiveFilters={backupFilters.hasActiveFilters}
              onClearFilters={backupFilters.handleClearFilters}
              onCreateBackup={handleCreateBackupClick}
              filteredBackups={backupFilters.filteredBackups}
              setIsBulkMode={backupSelection.setIsBulkMode}
              showSelectionOptions={backupSelection.showSelectionOptions}
              setShowSelectionOptions={backupSelection.setShowSelectionOptions}
              selectionRef={selectionRef}
            />
          ) : (
            <BackupGrid
              backups={paginatedBackups}
              isBulkMode={backupSelection.isBulkMode}
              selectedBackups={backupSelection.selectedBackups}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isMobile={isMobile}
              filtersState={{
                type: backupFilters.typeFilter,
                size: backupFilters.sizeFilter,
                sort_by: backupFilters.sortBy,
                sort_order: backupFilters.sortOrder
              }}
              onItemSelect={backupSelection.handleItemSelect}
              onSort={handleSort}
              onDelete={backupOperations.handleDeleteBackup}
              onDownload={backupOperations.handleDownloadBackup}
              onToggleProtection={backupOperations.toggleProtection}
              onSelectAllOnPage={handleSelectAllOnPage}
              onSelectAllFiltered={handleSelectAllFiltered}
              onSelectAll={handleSelectAll}
              onClearSelection={backupSelection.clearSelection}
              isSelectAll={backupSelection.isSelectAll}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              hasActiveFilters={backupFilters.hasActiveFilters}
              onClearFilters={backupFilters.handleClearFilters}
              onCreateBackup={handleCreateBackupClick}
              filteredBackups={backupFilters.filteredBackups}
              setIsBulkMode={backupSelection.setIsBulkMode}
              showSelectionOptions={backupSelection.showSelectionOptions}
              setShowSelectionOptions={backupSelection.setShowSelectionOptions}
              selectionRef={selectionRef}
            />
          )}

          {/* Empty State with helpful guidance */}
          {paginatedBackups.length === 0 && totalItems === 0 && !backupFilters.hasActiveFilters && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <DatabaseBackup className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No backups yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Create your first backup to get started. Backups help protect your data from accidental loss.
              </p>
              <Button 
                onClick={handleCreateBackupClick}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Create First Backup
              </Button>
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          {backupSelection.isBulkMode && (
            <KeyboardShortcuts
              onExitBulkMode={() => backupSelection.setIsBulkMode(false)}
              isPerformingBulkAction={backupOperations.isPerformingBulkAction}
              selectedCount={backupSelection.selectedBackups.length}
            />
          )}
        </div>
      </TooltipProvider>

      {/* Dialogs */}
      <BackupDialogs
        showCreateDialog={backupOperations.showCreateDialog}
        setShowCreateDialog={backupOperations.setShowCreateDialog}
        showBulkDeleteDialog={backupOperations.showBulkDeleteDialog}
        setShowBulkDeleteDialog={backupOperations.setShowBulkDeleteDialog}
        showBulkRestoreDialog={backupOperations.showBulkRestoreDialog}
        setShowBulkRestoreDialog={backupOperations.setShowBulkRestoreDialog}
        backupType={backupOperations.backupType}
        setBackupType={backupOperations.setBackupType}
        backupDescription={backupOperations.backupDescription}
        setBackupDescription={backupOperations.setBackupDescription}
        backupProgress={backupOperations.backupProgress}
        creatingBackup={backupOperations.creatingBackup}
        selectedBackupsCount={backupSelection.selectedBackups.length}
        selectionStats={selectionStats}
        onCreateBackup={backupOperations.handleCreateBackup}
        onBulkDelete={() => handleBulkOperation('delete')}
        onBulkRestore={() => handleBulkOperation('restore')}
        isPerformingBulkAction={backupOperations.isPerformingBulkAction}
      />
    </AppLayout>
  );
}