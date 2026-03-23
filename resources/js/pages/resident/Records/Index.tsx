import { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import icons
import { 
  FileText as FileTextIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  User as UserIcon,
  Heart as HeartIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Award as AwardIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  File as FileIcon,
  Calendar as CalendarIcon,
  Shield as ShieldIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  FileDigit as FileDigitIcon,
  Type as TypeIcon,
  X as XIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Loader2 as LoaderIcon,
  Lock as LockIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  ExternalLink as ExternalLinkIcon,
  Plus as PlusIcon,
  Grid as GridIcon,
  List as ListIcon,
  Users as UsersIcon,
  Filter as FilterIcon,
  MoreVertical as MoreVerticalIcon,
  Trash2 as TrashIcon,
  Info as InfoIcon,
  Clock as ClockIcon,
  HardDrive,
  Database
} from 'lucide-react';

// Reusable UI Components
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { MobileHeader } from '@/components/residentui/modern/mobile-header';
import { DesktopHeader } from '@/components/residentui/modern/desktop-header';
import { ErrorState } from '@/components/residentui/modern/error-state';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernSelect } from '@/components/residentui/modern-select';
import { CustomTabs } from '@/components/residentui/CustomTabs';

// Record-specific components
import {
    ICON_MAP,
    COLOR_MAP,
    BG_COLOR_MAP,
    FILE_TYPE_CONFIG,
    getRecordStatsCards
} from '@/components/residentui/records/constants';
import {
    formatDate,
    getFileIcon,
    getFileColor,
    getIconComponent,
    isDocumentExpired,
    getResidentName as getResidentNameUtil,
    copyToClipboard,
    getCsrfToken,
    getDocumentStatus
} from '@/components/residentui/records/record-utils';
import { ModernRecordGridView } from '@/components/residentui/records/modern-record-grid-view';
import { ModernRecordListView } from '@/components/residentui/records/modern-record-list-view';
import { ModernRecordFilters } from '@/components/residentui/records/modern-record-filters';
import { PasswordModal } from '@/components/residentui/records/password-modal';
import { StorageCard } from '@/components/residentui/records/storage-card';

// Hooks
import { useFilters } from '@/components/residentui/hooks/use-filters';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { useSelection } from '@/components/residentui/hooks/use-selection';

interface Document {
    id: number;
    name: string;
    description?: string;
    document_category_id: number;
    category?: {
        id: number;
        name: string;
        slug: string;
        icon: string;
        color: string;
    };
    file_extension: string;
    file_size_human: string;
    file_size: number;
    file_name: string;
    file_path: string;
    mime_type: string;
    created_at: string;
    updated_at: string;
    reference_number?: string;
    resident_id: number;
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    };
    document_type_id?: number;
    document_type?: {
        id: number;
        name: string;
        code: string;
    };
    issue_date?: string;
    expiry_date?: string;
    status?: string;
    is_public?: boolean;
    requires_password?: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    is_active: boolean;
    order?: number;
    count?: number;
}

interface PageProps {
    documents: {
        data: Document[];
        total: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        per_page: number;
    };
    categories: Category[];
    storageStats?: {
        used: string;
        limit: string;
        available: string;
        percentage: number;
        document_count?: number;
    };
    filters: {
        category?: string;
        search?: string;
        resident?: string;
    };
    householdResidents?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    }>;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: {
        id: number;
        household_number: string;
        head_of_family: string;
        head_resident_id?: number;
    };
    error?: string;
}

// Action Status Alert Component
const ActionStatusAlert = ({ type, message }: { type: 'success' | 'error' | 'info' | null; message: string }) => {
    if (!type) return null;

    return (
        <div className="fixed top-16 sm:top-4 right-4 z-50 max-w-xs sm:max-w-sm animate-in slide-in-from-top duration-300">
            <Alert 
                variant={type === 'error' ? 'destructive' : 'default'} 
                className={cn(
                    "shadow-lg border",
                    type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                        : type === 'info'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        : ''
                )}
            >
                <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
                    {type === 'success' ? (
                        <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    ) : type === 'error' ? (
                        <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    ) : (
                        <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="truncate">{message}</span>
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default function MyRecords({ 
    documents: initialDocuments, 
    categories, 
    storageStats,
    filters: initialFilters,
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
    const [categoryFilter, setCategoryFilter] = useState('all');
    
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
    
    // CLIENT-SIDE FILTERING STATE
    const [allDocuments, setAllDocuments] = useState<Document[]>(initialDocuments.data || []);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(initialDocuments.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalMode, setIsModalMode] = useState(false);
    
    // Use our custom hooks
    const { filters, updateFilters, loading, hasActiveFilters, clearFilters } = useFilters({
        initialFilters: initialFilters || {},
        route: '/portal/my-records'
    });
    
    const { selectedItems, selectMode, toggleSelect, selectAll, clearSelection, toggleSelectMode, setSelectMode } = useSelection(
        filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        (doc) => doc.id
    );
    
    const [isExporting, setIsExporting] = useState(false);

    // Convert selectedItems to number[] for components that expect number[]
    const selectedRecordIds = useMemo(() => 
        selectedItems.filter((id): id is number => typeof id === 'number'), 
        [selectedItems]
    );

    // Create a resident map for quick lookups
    const residentMap = useMemo(() => {
        const map = new Map<number, string>();
        
        householdResidents?.forEach(resident => {
            const name = resident.full_name || `${resident.first_name} ${resident.last_name}`.trim();
            if (name) {
                map.set(resident.id, name);
            }
        });
        
        initialDocuments.data?.forEach(doc => {
            if (doc.resident && doc.resident.id) {
                const name = doc.resident.full_name || 
                            `${doc.resident.first_name || ''} ${doc.resident.last_name || ''}`.trim();
                if (name && !map.has(doc.resident.id)) {
                    map.set(doc.resident.id, name);
                }
            }
        });
        
        return map;
    }, [householdResidents, initialDocuments.data]);

    // Enhanced custom getResidentName function
    const customGetResidentName = useCallback((residentId?: number, doc?: Document): string => {
        if (doc?.resident) {
            if (doc.resident.full_name && doc.resident.full_name.trim()) {
                return doc.resident.full_name.trim();
            }
            if (doc.resident.first_name || doc.resident.last_name) {
                const firstName = doc.resident.first_name || '';
                const lastName = doc.resident.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName) return fullName;
            }
        }
        
        if (residentId && residentMap.has(residentId)) {
            return residentMap.get(residentId)!;
        }
        
        if (residentId && householdResidents) {
            const resident = householdResidents.find(r => r.id === residentId);
            if (resident) {
                const name = resident.full_name || `${resident.first_name} ${resident.last_name}`.trim();
                if (name) return name;
            }
        }
        
        return 'Unknown Resident';
    }, [residentMap, householdResidents]);

    // Process categories for tabs
    const { allCategories, currentCategory } = useMemo(() => {
        const sortedCategories = [...categories].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });
        
        const processed = sortedCategories.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            count: cat.count || 0,
            icon: cat.icon,
            color: cat.color
        }));
        
        const totalDocumentsCount = storageStats?.document_count || 0;
        
        const allCategory = {
            id: 'all',
            name: 'All Documents',
            count: totalDocumentsCount,
            icon: 'folder-open',
            color: 'blue'
        };
        
        const allCats = [allCategory, ...processed];
        const currentCat = allCats.find(c => c.id === (filters.category || 'all'));
        
        return {
            allCategories: allCats,
            currentCategory: currentCat
        };
    }, [categories, storageStats?.document_count, filters.category]);

    // Set mounted to true after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize all documents on first load
    useEffect(() => {
        setAllDocuments(initialDocuments.data || []);
        setFilteredDocuments(initialDocuments.data || []);
    }, [initialDocuments.data]);
    
    // CLIENT-SIDE FILTERING LOGIC
    useEffect(() => {
        if (isModalMode) return;
        
        if (allDocuments.length === 0) {
            setFilteredDocuments([]);
            return;
        }
        
        let result = [...allDocuments];
        
        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(doc => 
                doc.name?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.reference_number?.toLowerCase().includes(searchLower) ||
                doc.file_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            const categoryId = parseInt(filters.category);
            result = result.filter(doc => 
                doc.document_category_id === categoryId || 
                doc.category?.id === categoryId
            );
        }
        
        // Apply resident filter
        if (filters.resident && filters.resident !== 'all') {
            const residentId = parseInt(filters.resident);
            result = result.filter(doc => doc.resident_id === residentId);
        }
        
        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'name') {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            } else if (sortBy === 'size') {
                const sizeA = a.file_size || 0;
                const sizeB = b.file_size || 0;
                return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
            }
            return 0;
        });
        
        setCurrentPage(1);
        setFilteredDocuments(result);
        
    }, [allDocuments, filters.search, filters.category, filters.resident, isModalMode, sortBy, sortOrder]);

    const handleTabChange = (categoryId: string) => {
        setCategoryFilter(categoryId);
        updateFilters({ category: categoryId === 'all' ? '' : categoryId });
        if (mounted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleResidentChange = (value: string) => {
        updateFilters({ resident: value === 'all' ? '' : value });
        if (isMobile) setShowMobileFilters(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: filters.search?.trim() || '' });
    };

    const handleSearchClear = () => {
        updateFilters({ search: '' });
    };

    const handleDocumentAction = (doc: Document, action: 'view' | 'download', e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setIsModalMode(true);
        setSelectedDocument(doc);
        setActionType(action);
        
        if (doc.requires_password) {
            setPasswordModalOpen(true);
            setPassword('');
            setPasswordError('');
        } else {
            if (action === 'view') {
                router.visit(`/portal/my-records/${doc.id}`);
            } else if (action === 'download') {
                triggerDirectDownload(doc);
            }
        }
    };

    const triggerDirectDownload = (doc: Document) => {
        setActionStatus({
            type: 'success',
            message: `Starting download for "${doc.name}"...`
        });
        
        const csrfToken = getCsrfToken();
        
        if (!csrfToken) {
            setActionStatus({
                type: 'error',
                message: 'Session expired. Please refresh the page.'
            });
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
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
    };

    const verifyPasswordAndPerformAction = async () => {
        if (!selectedDocument || !actionType) return;
        
        setVerifyingPassword(true);
        setPasswordError('');
        
        try {
            router.post(`/portal/my-records/${selectedDocument.id}/verify-password`, {
                password: password
            }, {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    if (page.props?.success || (typeof page.props === 'object' && page.props.success === true)) {
                        const redirectUrl = page.props?.redirect_url || `/portal/my-records/${selectedDocument.id}`;
                        
                        setPasswordModalOpen(false);
                        setPassword('');
                        setPasswordError('');
                        
                        setActionStatus({
                            type: 'success',
                            message: 'Password verified! Redirecting...'
                        });
                        
                        setIsModalMode(false);
                        
                        setTimeout(() => {
                            router.visit(redirectUrl);
                        }, 1000);
                        
                    } else {
                        const errors = page.props?.errors || {};
                        if (errors.password) {
                            setPasswordError(errors.password);
                        } else if (page.props?.message) {
                            setPasswordError(page.props.message);
                        } else {
                            setPasswordError('Incorrect password.');
                        }
                    }
                },
                onError: (errors: any) => {
                    if (typeof errors === 'string') {
                        setPasswordError(errors);
                    } else if (errors?.password) {
                        setPasswordError(errors.password);
                    } else if (errors?.message) {
                        setPasswordError(errors.message);
                    } else {
                        setPasswordError('Incorrect password or verification failed.');
                    }
                },
                onFinish: () => {
                    setVerifyingPassword(false);
                }
            });
            
        } catch (error) {
            console.error('Verification failed:', error);
            setPasswordError('Network error. Please try again.');
            setVerifyingPassword(false);
        }
    };

    const handleDelete = (doc: Document, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
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

    const handleCopyReference = (ref: string) => {
        copyToClipboard(ref, `Copied: ${ref}`);
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedItems.length} selected documents?`)) {
            toast.success(`Deleted ${selectedItems.length} documents`);
            clearSelection();
        }
    };

    const handlePrintRecords = () => {
        toast.info('Print feature coming soon');
    };

    const handleExportCSV = () => {
        toast.info('Export feature coming soon');
    };

    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    const from = filteredDocuments.length > 0 ? startIndex + 1 : 0;
    const to = Math.min(endIndex, filteredDocuments.length);
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (mounted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    // Get category counts for tabs
    const getCategoryCount = (categoryId: string) => {
        if (categoryId === 'all') {
            return filteredDocuments.length;
        }
        const category = allCategories.find(c => c.id === categoryId);
        return category?.count || 0;
    };
    
    // Don't render until after hydration to prevent mismatch
    if (!mounted) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '#' }
                ]}
            >
                <Head title="My Records" />
                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-center">
                        <LoaderIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    </div>
                </div>
            </ResidentLayout>
        );
    }
    
    if (error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '#' }
                ]}
            >
                <Head title="My Records" />
                <div className="space-y-6">
                    <DesktopHeader title="My Records" description="View and manage your household documents" />
                    <ErrorState 
                        message={error} 
                        onGoHome={() => window.location.href = '/portal/dashboard'} 
                    />
                </div>
            </ResidentLayout>
        );
    }

    const tabHasData = paginatedDocuments.length > 0;

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Records', href: '#' }
            ]}
        >
            <Head title="My Records" />
            
            {/* Action Status Alert */}
            <ActionStatusAlert type={actionStatus.type} message={actionStatus.message} />
            
            {/* Password Verification Modal */}
            <PasswordModal
                isOpen={passwordModalOpen}
                onClose={() => {
                    setPasswordModalOpen(false);
                    setIsModalMode(false);
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
                {/* Mobile Header */}
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
                        actions={
                            <ActionButtons
                                onPrint={handlePrintRecords}
                                onExport={handleExportCSV}
                                isExporting={isExporting}
                            />
                        }
                    />
                )}
                
                {/* Stats Section */}
                {showStats && storageStats && (
                    <div className="animate-slide-down">
                        <ModernStatsCards 
                            cards={[
                                {
                                    title: 'Total Documents',
                                    value: storageStats.document_count?.toString() || '0',
                                    icon: FileIcon,
                                    iconColor: 'text-blue-600 dark:text-blue-400',
                                    iconBgColor: 'bg-blue-100 dark:bg-blue-900/20',
                                    trend: { value: 0, positive: true }
                                },
                                {
                                    title: 'Storage Used',
                                    value: storageStats.used,
                                    icon: HardDrive,
                                    iconColor: 'text-green-600 dark:text-green-400',
                                    iconBgColor: 'bg-green-100 dark:bg-green-900/20',
                                    trend: { 
                                        value: storageStats.percentage, 
                                        positive: storageStats.percentage < 80 
                                    }
                                },
                                {
                                    title: 'Available',
                                    value: storageStats.available,
                                    icon: Database,
                                    iconColor: 'text-purple-600 dark:text-purple-400',
                                    iconBgColor: 'bg-purple-100 dark:bg-purple-900/20',
                                    trend: { 
                                        value: 100 - storageStats.percentage, 
                                        positive: (100 - storageStats.percentage) > 20 
                                    }
                                }
                            ]} 
                            loading={loading} 
                        />
                    </div>
                )}
                
                {/* Desktop Filters */}
                {!isMobile && (
                    <ModernRecordFilters
                        search={filters.search || ''}
                        setSearch={(value) => updateFilters({ search: value, page: '1' })}
                        handleSearchSubmit={handleSearchSubmit}
                        handleSearchClear={handleSearchClear}
                        activeTab={filters.category || 'all'}
                        handleTabChange={handleTabChange}
                        residentFilter={filters.resident || 'all'}
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
                            const summary = `Records Summary:\nTotal: ${filteredDocuments.length}\nCategories: ${allCategories.length}`;
                            navigator.clipboard.writeText(summary);
                            toast.success('Summary copied');
                        }}
                    />
                )}
                
                <div className="mt-4">
                    {/* Custom Tabs */}
                    <CustomTabs 
                        statusFilter={filters.category || 'all'}
                        handleTabChange={handleTabChange}
                        getStatusCount={getCategoryCount}
                    />
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                        <CardContent className="p-4 md:p-6">
                            {/* Selection Mode Banner */}
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
                            
                            {/* Header with Sort and View Toggle */}
                            <ModernCardHeader
                                title={`${currentCategory?.name || 'All'} Documents`}
                                description={tabHasData 
                                    ? `Showing ${paginatedDocuments.length} document${paginatedDocuments.length !== 1 ? 's' : ''}`
                                    : `No documents found`
                                }
                                action={
                                    <div className="flex items-center gap-2">
                                        <SortDropdown
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={(by, order) => {
                                                setSortBy(by as any);
                                                setSortOrder(order);
                                            }}
                                            options={[
                                                { value: 'date', label: 'Date', icon: CalendarIcon },
                                                { value: 'name', label: 'Name', icon: FileTextIcon },
                                                { value: 'size', label: 'Size', icon: HardDrive }
                                            ]}
                                        />
                                        {!selectMode && tabHasData && (
                                            <ViewToggle
                                                viewMode={viewMode}
                                                onViewChange={setViewMode}
                                                disabled={isMobile}
                                            />
                                        )}
                                        {tabHasData && (
                                            <SelectModeButton
                                                isActive={selectMode}
                                                onToggle={toggleSelectMode}
                                            />
                                        )}
                                    </div>
                                }
                            />
                            
                            {/* Content */}
                            {!tabHasData ? (
                                <ModernEmptyState 
                                    status={filters.category === 'all' ? 'all' : 'filtered'}
                                    hasFilters={hasActiveFilters}
                                    onClearFilters={clearFilters}
                                    icon={FolderIcon}
                                    title={filters.search 
                                        ? `No documents match your search "${filters.search}"` 
                                        : filters.category !== 'all' && filters.category !== undefined
                                            ? `No documents found in ${currentCategory?.name || 'this category'}`
                                            : 'No documents found'}
                                    message={filters.search || (filters.category !== 'all' && filters.category !== undefined) || filters.resident !== 'all'
                                        ? 'Try adjusting your filters or clear them to see all documents'
                                        : 'Upload your first document to get started'}
                                    actionLabel="Upload Document"
                                    onAction={() => router.visit('/portal/my-records/create')}
                                />
                            ) : viewMode === 'grid' ? (
                                <ModernRecordGridView
                                    records={paginatedDocuments}
                                    selectMode={selectMode}
                                    selectedRecords={selectedRecordIds}
                                    onSelectRecord={toggleSelect}
                                    getResidentName={customGetResidentName}
                                    onView={(doc) => handleDocumentAction(doc, 'view')}
                                    onDownload={(doc) => handleDocumentAction(doc, 'download')}
                                    onDelete={handleDelete}
                                    onCopyReference={handleCopyReference}
                                    isMobile={isMobile}
                                />
                            ) : (
                                <ModernRecordListView
                                    records={paginatedDocuments}
                                    selectMode={selectMode}
                                    selectedRecords={selectedRecordIds}
                                    onSelectRecord={toggleSelect}
                                    onSelectAll={selectAll}
                                    getResidentName={customGetResidentName}
                                    onView={(doc) => handleDocumentAction(doc, 'view')}
                                    onDownload={(doc) => handleDocumentAction(doc, 'download')}
                                    onDelete={handleDelete}
                                    onCopyReference={handleCopyReference}
                                    onPrint={handlePrintRecords}
                                />
                            )}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={currentPage}
                                        lastPage={totalPages}
                                        onPageChange={handlePageChange}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Storage Card */}
                <div className="px-4 sm:px-0">
                    <StorageCard stats={storageStats} />
                </div>
            </div>
            
            {/* Mobile Filter Modal */}
            <ModernFilterModal
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                title="Filter Records"
                description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                search={filters.search || ''}
                onSearchChange={(value) => updateFilters({ search: value, page: '1' })}
                onSearchSubmit={handleSearchSubmit}
                onSearchClear={handleSearchClear}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            >
                {/* Category Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                    </label>
                    <ModernSelect
                        value={filters.category || 'all'}
                        onValueChange={handleTabChange}
                        placeholder="All categories"
                        options={allCategories.map(cat => ({
                            value: cat.id,
                            label: cat.name
                        }))}
                        disabled={loading}
                        icon={FolderIcon}
                    />
                </div>

                {/* Resident Filter */}
                {householdResidents && householdResidents.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Resident
                        </label>
                        <ModernSelect
                            value={filters.resident || 'all'}
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
            
            {/* Loading Overlay */}
            <ModernLoadingOverlay loading={loading} message="Loading documents..." />
        </ResidentLayout>
    );
}