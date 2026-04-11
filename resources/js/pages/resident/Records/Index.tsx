// pages/resident/MyRecords.tsx (Fixed Order Version - with Mobile List View)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FolderIcon, UserIcon, HardDrive, CalendarIcon, FileTextIcon, AlertCircleIcon } from 'lucide-react';

// Reusable Components
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernSelect } from '@/components/residentui/modern-select';
import { MobileHeader } from '@/components/portal/records/index/MobileHeader';
import { DesktopHeader } from '@/components/portal/records/index/DesktopHeader';
import { ActionStatusAlert } from '@/components/portal/records/index/ActionStatusAlert';
import { PasswordModal } from '@/components/portal/records/index/PasswordModal';
import { StorageCard } from '@/components/portal/records/index/StorageCard';
import { ModernRecordGridView } from '@/components/residentui/records/modern-record-grid-view';
import { ModernRecordListView } from '@/components/residentui/records/modern-record-list-view';
import { ModernRecordMobileListView } from '@/components/residentui/records/modern-record-mobile-list-view'; // New import
import { ModernRecordFilters } from '@/components/residentui/records/modern-record-filters';
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { CategoryTabs, CATEGORY_TABS_CONFIG } from '@/components/portal/records/index/category-tabs';

// Hooks
import { useMobile } from '@/components/residentui/hooks/use-mobile';

// Types and Utils
import type { 
    Document, 
    DocumentCategory, 
    StorageStats, 
    Resident, 
    Household 
} from '@/types/portal/records/records';
import { getRecordStatsCards } from '@/components/residentui/records/constants';
import { copyToClipboard, getCsrfToken } from '@/components/residentui/records/record-utils';

// Error State Component
const ErrorState = ({ message, onGoHome }: { message: string; onGoHome: () => void }) => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 inline-block">
                <AlertCircleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Error Loading Records
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {message}
            </p>
            <Button onClick={onGoHome} variant="outline">
                Return to Dashboard
            </Button>
        </div>
    </div>
);

interface PageProps {
    documents: {
        data: Document[];
        total: number;
    };
    categories: DocumentCategory[];
    storageStats?: StorageStats;
    householdResidents?: Resident[];
    currentResident?: Resident;
    household?: Household;
    error?: string;
}

export default function MyRecords({ 
    documents: initialDocuments, 
    categories, 
    storageStats,
    householdResidents,
    currentResident,
    household,
    error 
}: PageProps) {
    const isMobile = useMobile();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [allDocuments] = useState<Document[]>(initialDocuments.data || []);
    
    // Client-side filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [residentFilter, setResidentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const itemsPerPage = 10;
    
    // Password modal state
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [actionType, setActionType] = useState<'view' | 'download' | null>(null);
    
    // Action feedback state
    const [actionStatus, setActionStatus] = useState<{
        type: 'success' | 'error' | 'info' | null;
        message: string;
    }>({ type: null, message: '' });
    
    const [isExporting, setIsExporting] = useState(false);
    
    // Selection state
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    
    // Set mounted after hydration
    useEffect(() => { setMounted(true); }, []);
    
    // Filter documents client-side
    const filteredDocuments = useMemo(() => {
        let result = [...allDocuments];
        
        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            result = result.filter(doc => 
                doc.name?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.reference_number?.toLowerCase().includes(searchLower) ||
                doc.file_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Category filter
        if (categoryFilter !== 'all') {
            const categoryId = parseInt(categoryFilter);
            result = result.filter(doc => 
                doc.document_category_id === categoryId || doc.category?.id === categoryId
            );
        }
        
        // Resident filter
        if (residentFilter !== 'all') {
            const residentId = parseInt(residentFilter);
            result = result.filter(doc => doc.resident_id === residentId);
        }
        
        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortBy === 'name') {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            }
            if (sortBy === 'size') {
                const sizeA = a.file_size || 0;
                const sizeB = b.file_size || 0;
                return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
            }
            return 0;
        });
        
        return result;
    }, [allDocuments, searchQuery, categoryFilter, residentFilter, sortBy, sortOrder]);
    
    // Process categories for tabs
    const { allCategories, currentCategory, tabCounts } = useMemo(() => {
        const sortedCategories = [...categories].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
            return a.name.localeCompare(b.name);
        });
        
        const processed = sortedCategories.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            count: cat.document_count || 0,
            icon: cat.icon,
            color: cat.color
        }));
        
        const allCategory = { 
            id: 'all', 
            name: 'All Documents', 
            count: filteredDocuments.length, 
            icon: 'folder-open', 
            color: 'blue' 
        };
        const allCats = [allCategory, ...processed];
        const currentCat = allCats.find(c => c.id === categoryFilter);
        
        // Calculate tab counts
        const counts: Record<string, number> = {
            all: filteredDocuments.length,
        };
        processed.forEach(cat => {
            counts[cat.id] = filteredDocuments.filter(doc => 
                doc.document_category_id?.toString() === cat.id || doc.category?.id?.toString() === cat.id
            ).length;
        });
        
        return { allCategories: allCats, currentCategory: currentCat, tabCounts: counts };
    }, [categories, categoryFilter, filteredDocuments]);
    
    // Resident map
    const residentMap = useMemo(() => {
        const map = new Map<number, string>();
        householdResidents?.forEach(resident => {
            const name = resident.full_name || `${resident.first_name} ${resident.last_name}`.trim();
            if (name) map.set(resident.id, name);
        });
        allDocuments?.forEach(doc => {
            if (doc.resident && doc.resident.id) {
                const name = doc.resident.full_name || `${doc.resident.first_name || ''} ${doc.resident.last_name || ''}`.trim();
                if (name && !map.has(doc.resident.id)) map.set(doc.resident.id, name);
            }
        });
        return map;
    }, [householdResidents, allDocuments]);
    
    const customGetResidentName = useCallback((residentId?: number, doc?: Document): string => {
        if (doc?.resident?.full_name) return doc.resident.full_name;
        if (doc?.resident?.first_name || doc?.resident?.last_name) {
            return `${doc.resident.first_name || ''} ${doc.resident.last_name || ''}`.trim();
        }
        if (residentId && residentMap.has(residentId)) return residentMap.get(residentId)!;
        if (residentId && householdResidents) {
            const resident = householdResidents.find(r => r.id === residentId);
            if (resident) return resident.full_name || `${resident.first_name} ${resident.last_name}`.trim();
        }
        return 'Unknown Resident';
    }, [residentMap, householdResidents]);
    
    const toggleSelect = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };
    
    const selectAll = () => {
        setSelectedItems(paginatedDocuments.map(doc => doc.id));
    };
    
    const clearSelection = () => {
        setSelectedItems([]);
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            clearSelection();
        } else {
            setSelectMode(true);
        }
    };
    
    // Pagination
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    const tabHasData = paginatedDocuments.length > 0;
    
    // Reset to first page when filters change
    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1);
        
        switch (filterType) {
            case 'search':
                setSearchQuery(value);
                break;
            case 'category':
                setCategoryFilter(value);
                break;
            case 'resident':
                setResidentFilter(value);
                break;
        }
        
        clearSelection();
        setSelectMode(false);
    };
    
    const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || residentFilter !== 'all';
    
    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setResidentFilter('all');
        setCurrentPage(1);
        
        if (isMobile) setShowMobileFilters(false);
        clearSelection();
        setSelectMode(false);
    };
    
    const handleTabChange = (categoryId: string) => {
        handleFilterChange('category', categoryId);
        if (mounted) window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleResidentChange = (value: string) => {
        handleFilterChange('resident', value);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', searchQuery.trim());
    };
    
    const handleSearchClear = () => handleFilterChange('search', '');
    
    const triggerDirectDownload = (doc: Document) => {
        setActionStatus({ type: 'success', message: `Starting download for "${doc.name}"...` });
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            setActionStatus({ type: 'error', message: 'Session expired. Please refresh the page.' });
            return;
        }
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/portal/my-records/${doc.id}/download`;
        form.style.display = 'none';
        
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = csrfToken;
        form.appendChild(tokenInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setTimeout(() => setActionStatus({ type: null, message: '' }), 3000);
    };
    
    const handleDocumentAction = (doc: Document, action: 'view' | 'download', e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setSelectedDocument(doc);
        setActionType(action);
        
        if (doc.requires_password) {
            setPasswordModalOpen(true);
            setPassword('');
            setPasswordError('');
        } else {
            if (action === 'view') {
                window.location.href = `/portal/my-records/${doc.id}`;
            } else if (action === 'download') {
                triggerDirectDownload(doc);
            }
        }
    };
    
    const verifyPasswordAndPerformAction = async () => {
        if (!selectedDocument || !actionType) return;
        setVerifyingPassword(true);
        setPasswordError('');
        
        try {
            const response = await fetch(`/portal/my-records/${selectedDocument.id}/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken() || '',
                },
                body: JSON.stringify({ password }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setPasswordModalOpen(false);
                setPassword('');
                setActionStatus({ type: 'success', message: 'Password verified! Redirecting...' });
                setTimeout(() => {
                    window.location.href = data.redirect_url || `/portal/my-records/${selectedDocument.id}`;
                }, 1000);
            } else {
                setPasswordError(data.message || 'Incorrect password.');
            }
        } catch (error) {
            setPasswordError('Network error. Please try again.');
        } finally {
            setVerifyingPassword(false);
        }
    };
    
    const handleDelete = (doc: Document, e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (confirm('Are you sure you want to delete this document?')) {
            const csrfToken = getCsrfToken() || '';
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/portal/my-records/${doc.id}`;
            form.style.display = 'none';
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            form.appendChild(methodInput);
            
            if (csrfToken) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = '_token';
                tokenInput.value = csrfToken;
                form.appendChild(tokenInput);
            }
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        }
    };
    
    const handleCopyReference = (ref: string) => copyToClipboard(ref, `Copied: ${ref}`);
    
    const handleDeleteSelected = () => {
        if (confirm(`Delete ${selectedItems.length} selected documents?`)) {
            toast.success(`Deleted ${selectedItems.length} documents`);
            clearSelection();
        }
    };
    
    const handlePrintRecords = () => toast.info('Print feature coming soon');
    const handleExportCSV = () => toast.info('Export feature coming soon');
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (mounted) window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    if (!mounted) {
        return (
            <ResidentLayout breadcrumbs={[{ title: 'Dashboard', href: '/portal/dashboard' }, { title: 'My Records', href: '#' }]}>
                <Head title="My Records" />
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                </div>
            </ResidentLayout>
        );
    }
    
    if (error) {
        return (
            <ResidentLayout breadcrumbs={[{ title: 'Dashboard', href: '/portal/dashboard' }, { title: 'My Records', href: '#' }]}>
                <Head title="My Records" />
                <DesktopHeader title="My Records" description="View and manage your household documents" />
                <ErrorState message={error} onGoHome={() => window.location.href = '/portal/dashboard'} />
            </ResidentLayout>
        );
    }
    
    return (
        <ResidentLayout breadcrumbs={[{ title: 'Dashboard', href: '/portal/dashboard' }, { title: 'My Records', href: '#' }]}>
            <Head title="My Records" />
            
            <ActionStatusAlert type={actionStatus.type} message={actionStatus.message} />
            
            <PasswordModal
                isOpen={passwordModalOpen}
                onClose={() => { 
                    setPasswordModalOpen(false); 
                    setPassword(''); 
                    setPasswordError(''); 
                    setSelectedDocument(null); 
                    setActionType(null); 
                }}
                document={selectedDocument}
                password={password}
                setPassword={setPassword}
                passwordError={passwordError}
                verifying={verifyingPassword}
                onVerify={verifyPasswordAndPerformAction}
            />
            
            <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                {isMobile ? (
                    <MobileHeader
                        title="My Records"
                        subtitle={`Household: ${household?.household_number || 'N/A'}`}
                        showStats={showStats}
                        onToggleStats={() => setShowStats(!showStats)}
                        onOpenFilters={() => setShowMobileFilters(true)}
                        hasActiveFilters={hasActiveFilters}
                    />
                ) : (
                    <DesktopHeader
                        title="My Records"
                        description={`Household: ${household?.household_number || 'N/A'}`}
                        actions={<ActionButtons onPrint={handlePrintRecords} onExport={handleExportCSV} isExporting={isExporting} />}
                    />
                )}
                
                {showStats && storageStats && (
                    <div className="animate-slide-down">
                        <ModernStatsCards cards={getRecordStatsCards(storageStats)} loading={loading} />
                    </div>
                )}
                
                {!isMobile && (
                    <ModernRecordFilters
                        search={searchQuery}
                        setSearch={(value) => handleFilterChange('search', value)}
                        handleSearchSubmit={handleSearchSubmit}
                        handleSearchClear={handleSearchClear}
                        activeTab={categoryFilter}
                        handleTabChange={handleTabChange}
                        residentFilter={residentFilter}
                        handleResidentChange={handleResidentChange}
                        loading={loading}
                        allCategories={allCategories}
                        householdResidents={householdResidents || []}
                        printRecords={handlePrintRecords}
                        exportToCSV={handleExportCSV}
                        isExporting={isExporting}
                        hasActiveFilters={hasActiveFilters}
                        handleClearFilters={clearFilters}
                        onCopySummary={() => { 
                            navigator.clipboard.writeText(`Records Summary:\nTotal: ${filteredDocuments.length}`); 
                            toast.success('Summary copied'); 
                        }}
                    />
                )}
                
                <div className="mt-4">
                    <CategoryTabs
                        categoryFilter={categoryFilter}
                        handleTabChange={handleTabChange}
                        tabCounts={tabCounts}
                        categories={allCategories}
                    />
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                        <CardContent className="p-4 md:p-6">
                            {selectMode && tabHasData && (
                                <ModernSelectionBanner
                                    selectedCount={selectedItems.length}
                                    totalCount={paginatedDocuments.length}
                                    onSelectAll={selectAll}
                                    onDeselectAll={clearSelection}
                                    onCancel={toggleSelectMode}
                                    onDelete={handleDeleteSelected}
                                    deleteLabel="Delete Selected"
                                />
                            )}
                            
                            <ModernCardHeader
                                title={`${currentCategory?.name || 'All'} Documents`}
                                description={tabHasData 
                                    ? `Showing ${paginatedDocuments.length} of ${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 's' : ''}`
                                    : 'No documents found'
                                }
                                action={
                                    <div className="flex items-center gap-2">
                                        <SortDropdown 
                                            sortBy={sortBy} 
                                            sortOrder={sortOrder} 
                                            onSort={(by, order) => { 
                                                setSortBy(by as 'date' | 'name' | 'size'); 
                                                setSortOrder(order); 
                                                setCurrentPage(1);
                                            }} 
                                            options={[
                                                { value: 'date', label: 'Date', icon: CalendarIcon }, 
                                                { value: 'name', label: 'Name', icon: FileTextIcon }, 
                                                { value: 'size', label: 'Size', icon: HardDrive }
                                            ]} 
                                        />
                                        {!selectMode && tabHasData && (
                                            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} disabled={false} />
                                        )}
                                        {tabHasData && (
                                            <SelectModeButton isActive={selectMode} onToggle={toggleSelectMode} />
                                        )}
                                    </div>
                                }
                            />
                            
                            {!tabHasData ? (
                                <ModernEmptyState 
                                    status={categoryFilter === 'all' ? 'all' : 'filtered'} 
                                    hasFilters={hasActiveFilters} 
                                    onClearFilters={clearFilters} 
                                    icon={FolderIcon} 
                                    title={searchQuery ? `No documents match "${searchQuery}"` : 'No documents found'} 
                                    message="Upload your first document to get started" 
                                    actionLabel="Upload Document" 
                                    onAction={() => window.location.href = '/portal/my-records/create'} 
                                />
                            ) : (
                                // Mobile-specific rendering
                                isMobile ? (
                                    viewMode === 'grid' ? (
                                        <ModernRecordGridView 
                                            records={paginatedDocuments} 
                                            selectMode={selectMode} 
                                            selectedRecords={selectedItems} 
                                            onSelectRecord={toggleSelect} 
                                            getResidentName={customGetResidentName} 
                                            onView={(doc) => handleDocumentAction(doc, 'view')} 
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')} 
                                            onDelete={handleDelete} 
                                            onCopyReference={handleCopyReference} 
                                            isMobile={true} 
                                        />
                                    ) : (
                                        <ModernRecordMobileListView 
                                            records={paginatedDocuments} 
                                            selectMode={selectMode} 
                                            selectedRecords={selectedItems} 
                                            onSelectRecord={toggleSelect} 
                                            getResidentName={customGetResidentName} 
                                            onView={(doc) => handleDocumentAction(doc, 'view')} 
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')} 
                                            onDelete={handleDelete} 
                                            onCopyReference={handleCopyReference} 
                                        />
                                    )
                                ) : (
                                    // Desktop rendering
                                    viewMode === 'grid' ? (
                                        <ModernRecordGridView 
                                            records={paginatedDocuments} 
                                            selectMode={selectMode} 
                                            selectedRecords={selectedItems} 
                                            onSelectRecord={toggleSelect} 
                                            getResidentName={customGetResidentName} 
                                            onView={(doc) => handleDocumentAction(doc, 'view')} 
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')} 
                                            onDelete={handleDelete} 
                                            onCopyReference={handleCopyReference} 
                                            isMobile={false} 
                                        />
                                    ) : (
                                        <ModernRecordListView 
                                            records={paginatedDocuments} 
                                            selectMode={selectMode} 
                                            selectedRecords={selectedItems} 
                                            onSelectRecord={toggleSelect} 
                                            onSelectAll={selectAll} 
                                            getResidentName={customGetResidentName} 
                                            onView={(doc) => handleDocumentAction(doc, 'view')} 
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')} 
                                            onDelete={handleDelete} 
                                            onCopyReference={handleCopyReference} 
                                            onPrint={handlePrintRecords} 
                                        />
                                    )
                                )
                            )}
                            
                            {totalPages > 1 && (
                                <ModernPagination 
                                    currentPage={currentPage} 
                                    lastPage={totalPages} 
                                    onPageChange={handlePageChange} 
                                    loading={loading} 
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                <StorageCard stats={storageStats} />
            </div>
            
            <ModernFilterModal 
                isOpen={showMobileFilters} 
                onClose={() => setShowMobileFilters(false)} 
                title="Filter Records" 
                description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'} 
                search={searchQuery} 
                onSearchChange={(value) => setSearchQuery(value)} 
                onSearchSubmit={(e) => { 
                    e.preventDefault(); 
                    handleFilterChange('search', searchQuery);
                    setShowMobileFilters(false);
                }} 
                onSearchClear={handleSearchClear} 
                loading={loading} 
                hasActiveFilters={hasActiveFilters} 
                onClearFilters={clearFilters}
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <ModernSelect 
                        value={categoryFilter} 
                        onValueChange={(value) => handleFilterChange('category', value)} 
                        placeholder="All categories" 
                        options={allCategories.map(cat => ({ value: cat.id, label: cat.name }))} 
                        disabled={loading} 
                        icon={FolderIcon} 
                    />
                </div>
                {householdResidents && householdResidents.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resident</label>
                        <ModernSelect 
                            value={residentFilter} 
                            onValueChange={handleResidentChange} 
                            placeholder="All residents" 
                            options={[
                                { value: 'all', label: 'All residents' }, 
                                ...householdResidents.map(resident => ({ 
                                    value: resident.id.toString(), 
                                    label: resident.full_name || `${resident.first_name} ${resident.last_name}`.trim() 
                                }))
                            ]} 
                            disabled={loading} 
                            icon={UserIcon} 
                        />
                    </div>
                )}
            </ModernFilterModal>
            
            <ModernLoadingOverlay loading={loading} message="Loading documents..." />
        </ResidentLayout>
    );
}