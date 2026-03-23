import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
} from 'lucide-react';

// Reusable Components
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';

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
    getResidentName,
    copyToClipboard,
    getCsrfToken
} from '@/components/residentui/records/record-utils';
import { ModernRecordCard } from '@/components/residentui/records/modern-record-card';
import { ModernRecordGridCard } from '@/components/residentui/records/modern-record-grid-card';
import { ModernRecordFilters } from '@/components/residentui/records/modern-record-filters';
import { ModernRecordTable } from '@/components/residentui/records/modern-record-table';
import { PasswordModal } from '@/components/residentui/records/password-modal';
import { StorageCard } from '@/components/residentui/records/storage-card';

// Mobile responsive components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the new mobile sidebar component
import { MobileSidebar } from '@/components/residentui/records/mobile-sidebar';

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
    filters,
    householdResidents,
    currentResident,
    household,
    error 
}: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.category || 'all');
    const [residentFilter, setResidentFilter] = useState(filters.resident || 'all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Password modal state
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [actionType, setActionType] = useState<'view' | 'download' | null>(null);
    
    // Selection state
    const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
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

    // Create a resident map for quick lookups
    const residentMap = useMemo(() => {
        const map = new Map<number, string>();
        
        // Add from householdResidents
        householdResidents?.forEach(resident => {
            const name = resident.full_name || `${resident.first_name} ${resident.last_name}`;
            if (name.trim()) {
                map.set(resident.id, name);
            }
        });
        
        // Add from documents that have resident data
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

    // Custom getResidentName function that uses the map and householdResidents
    const customGetResidentName = useCallback((residentId?: number, doc?: Document): string => {
        // Try from document resident object first
        if (doc?.resident) {
            if (doc.resident.full_name) {
                return doc.resident.full_name;
            }
            if (doc.resident.first_name || doc.resident.last_name) {
                const firstName = doc.resident.first_name || '';
                const lastName = doc.resident.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName) return fullName;
            }
        }
        
        // Try from resident map
        if (residentId && residentMap.has(residentId)) {
            return residentMap.get(residentId)!;
        }
        
        // Try from householdResidents list directly
        if (residentId && householdResidents) {
            const resident = householdResidents.find(r => r.id === residentId);
            if (resident) {
                return resident.full_name || `${resident.first_name} ${resident.last_name}`;
            }
        }
        
        // Debug logging
        if (residentId) {
            console.warn(`Resident not found for ID: ${residentId}`, { 
                residentId, 
                householdResidentsCount: householdResidents?.length || 0,
                hasDocumentResident: !!doc?.resident
            });
        }
        
        return 'Unknown Resident';
    }, [residentMap, householdResidents]);

    // Set mounted to true after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Debug: Log document data
    useEffect(() => {
        if (initialDocuments.data?.length > 0) {
            console.log('Documents loaded:', initialDocuments.data.length);
            console.log('Sample document:', initialDocuments.data[0]);
            console.log('Household residents:', householdResidents);
            
            // Check each document's resident data
            initialDocuments.data.forEach(doc => {
                if (!doc.resident) {
                    console.warn(`Document ${doc.id} (${doc.name}) has no resident data. resident_id: ${doc.resident_id}`);
                } else if (!doc.resident.full_name && (!doc.resident.first_name || !doc.resident.last_name)) {
                    console.warn(`Document ${doc.id} has incomplete resident data:`, doc.resident);
                }
            });
        }
    }, [initialDocuments.data, householdResidents]);

    // Check if mobile on mount and resize
    useEffect(() => {
        if (!mounted) return;
        
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [mounted]);
    
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
        
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(doc => 
                doc.name?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.reference_number?.toLowerCase().includes(searchLower) ||
                doc.file_name?.toLowerCase().includes(searchLower)
            );
        }
        
        if (activeTab !== 'all') {
            const categoryId = parseInt(activeTab);
            result = result.filter(doc => 
                doc.document_category_id === categoryId || 
                doc.category?.id === categoryId
            );
        }
        
        if (residentFilter !== 'all') {
            const residentId = parseInt(residentFilter);
            result = result.filter(doc => doc.resident_id === residentId);
        }
        
        // Reset to page 1 when filters change
        if (search || activeTab !== 'all' || residentFilter !== 'all') {
            setCurrentPage(1);
        }
        
        setFilteredDocuments(result);
        
    }, [allDocuments, search, activeTab, residentFilter, isModalMode]); 
    
    // Process categories with memoization
    const { processedCategories, allCategories, currentCategory } = useMemo(() => {
        const sortedCategories = [...categories].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });
        
        const processed = sortedCategories.map(cat => ({
            id: cat.id.toString(),
            slug: cat.slug,
            name: cat.name,
            iconName: cat.icon,
            count: cat.count || 0,
            color: COLOR_MAP[cat.color] || 'text-gray-600 dark:text-gray-400',
            bgColor: BG_COLOR_MAP[cat.color] || 'bg-gray-50 dark:bg-gray-900',
            ...cat
        }));
        
        const totalDocumentsCount = storageStats?.document_count || 0;
        
        const allCategory = {
            id: 'all',
            slug: 'all',
            name: 'All Documents',
            iconName: 'folder-open',
            count: totalDocumentsCount,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
        
        const allCats = [allCategory, ...processed];
        const currentCat = allCats.find(c => c.id === activeTab);
        
        return {
            processedCategories: processed,
            allCategories: allCats,
            currentCategory: currentCat
        };
    }, [categories, storageStats?.document_count, activeTab]);

    const handleTabChange = (categoryId: string) => {
        setActiveTab(categoryId);
        setIsMobileMenuOpen(false);
        if (mounted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        updateFilters({ category: categoryId === 'all' ? '' : categoryId });
    };

    const handleResidentChange = (value: string) => {
        setResidentFilter(value);
        updateFilters({ resident: value === 'all' ? '' : value });
    };

    const clearFilters = () => {
        setSearch('');
        setActiveTab('all');
        setResidentFilter('all');
        
        updateFilters({ search: '', category: '', resident: '' });
        
        setActionStatus({
            type: 'success',
            message: 'All filters cleared'
        });
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
    };

    const updateFilters = (newFilters: Record<string, string>) => {
        setLoading(true);
        
        const currentFilters = {
            ...filters,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'all') {
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/my-records', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: search.trim() });
    };

    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ search: '' });
    };

    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            value && value !== '' && value !== 'all'
        );
    }, [filters]);

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

    const handleDocumentAction = (doc: Document, action: 'view' | 'download', e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log(`Document action: ${action} for document:`, doc.id);
        
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

    // Selection mode functions
    const toggleSelectRecord = (id: number) => {
        setSelectedRecords(prev =>
            prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
        );
    };

    const selectAllRecords = () => {
        if (selectedRecords.length === paginatedDocuments.length && paginatedDocuments.length > 0) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(paginatedDocuments.map(d => d.id));
        }
    };

    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedRecords([]);
        } else {
            setSelectMode(true);
        }
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedRecords.length} selected documents?`)) {
            toast.success(`Deleted ${selectedRecords.length} documents`);
            setSelectedRecords([]);
            setSelectMode(false);
        }
    };
    
    // Don't render until after hydration to prevent mismatch
    if (!mounted) {
        return (
            <ResidentLayout
                title="My Records"
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
                title="My Records"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Records', href: '#' }
                ]}
            >
                <Head title="My Records" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                            <Button 
                                onClick={() => window.location.href = '/portal/dashboard'}
                                className="bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            title="My Records"
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
            
            <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                {/* Header with Mobile Menu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-0">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        {/* Mobile Sidebar */}
                        <div className="sm:hidden">
                            <MobileSidebar
                                isOpen={isMobileMenuOpen}
                                onOpenChange={setIsMobileMenuOpen}
                                allCategories={allCategories}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                residentFilter={residentFilter}
                                onResidentChange={handleResidentChange}
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                householdResidents={householdResidents}
                                onClearFilters={clearFilters}
                                getIconComponent={getIconComponent}
                                hasActiveFilters={hasActiveFilters}
                                search={search}
                                onSearchChange={setSearch}
                                onSearchSubmit={handleSearchSubmit}
                                onSearchClear={handleSearchClear}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate dark:text-white">My Records</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                Household: {household?.household_number || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                        {/* Mobile View Toggle */}
                        <div className="sm:hidden">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                type="button"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="h-9 w-9 p-0 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {viewMode === 'grid' ? (
                                    <GridIcon className="h-4 w-4" />
                                ) : (
                                    <ListIcon className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => router.visit('/portal/my-records/export')} 
                            className="hidden sm:inline-flex dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                        <Link href="/portal/my-records/create" className="flex-1 sm:flex-none">
                            <Button size="sm" type="button" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600">
                                <PlusIcon className="h-4 w-4 mr-2" />
                                <span>Upload</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Desktop Filters */}
                {!isMobile && (
                    <ModernRecordFilters
                        search={search}
                        setSearch={setSearch}
                        handleSearchSubmit={handleSearchSubmit}
                        handleSearchClear={handleSearchClear}
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        residentFilter={residentFilter}
                        handleResidentChange={handleResidentChange}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        loading={loading}
                        allCategories={allCategories}
                        householdResidents={householdResidents}
                        hasActiveFilters={hasActiveFilters}
                        handleClearFilters={clearFilters}
                        getIconComponent={getIconComponent}
                    />
                )}

                {/* Active filters indicator - Desktop only */}
                {hasActiveFilters && !isMobile && (
                    <div className="px-4 sm:px-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                            
                            {search && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                                    <span className="truncate max-w-[120px]">Search: "{search}"</span>
                                    <button 
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="ml-1"
                                    >
                                        <XIcon className="h-3 w-3 flex-shrink-0" />
                                    </button>
                                </Badge>
                            )}
                            
                            {activeTab !== 'all' && currentCategory && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                                    <span className="truncate max-w-[100px]">{currentCategory.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleTabChange('all')}
                                        className="ml-1"
                                    >
                                        <XIcon className="h-3 w-3 flex-shrink-0" />
                                    </button>
                                </Badge>
                            )}
                            
                            {residentFilter !== 'all' && householdResidents && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                                    <span className="truncate max-w-[100px]">
                                        {customGetResidentName(parseInt(residentFilter))}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => handleResidentChange('all')}
                                        className="ml-1"
                                    >
                                        <XIcon className="h-3 w-3 flex-shrink-0" />
                                    </button>
                                </Badge>
                            )}
                            
                            <Button 
                                variant="ghost" 
                                size="sm"
                                type="button"
                                onClick={clearFilters}
                                className="text-sm h-8 px-3 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                <div className="px-4 sm:px-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium dark:text-white">{filteredDocuments.length}</span> document{filteredDocuments.length !== 1 ? 's' : ''} found
                            {currentCategory && currentCategory.id !== 'all' && (
                                <span> in <span className="font-medium dark:text-white">{currentCategory.name}</span></span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {from} to {to} of {filteredDocuments.length}
                        </div>
                    </div>
                </div>

                {/* Selection Mode Banner */}
                {selectMode && paginatedDocuments.length > 0 && (
                    <div className="px-4 sm:px-0">
                        <ModernSelectionBanner
                            selectedCount={selectedRecords.length}
                            totalCount={paginatedDocuments.length}
                            onSelectAll={selectAllRecords}
                            onDeselectAll={() => setSelectedRecords([])}
                            onCancel={toggleSelectMode}
                            onDelete={handleDeleteSelected}
                            deleteLabel="Delete Selected"
                        />
                    </div>
                )}

                {/* Documents Grid/List */}
                <div className="px-4 sm:px-0">
                    {paginatedDocuments.length > 0 ? (
                        <>
                            {/* GRID VIEW */}
                            {viewMode === 'grid' ? (
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {paginatedDocuments.map((doc) => (
                                        <ModernRecordGridCard
                                            key={doc.id}
                                            document={doc}
                                            categories={categories}
                                            onView={(doc) => handleDocumentAction(doc, 'view')}
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')}
                                            onDelete={handleDelete}
                                            getResidentName={(doc) => customGetResidentName(doc.resident_id, doc)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                /* LIST VIEW */
                                <>
                                    {/* Mobile List View */}
                                    {isMobile && (
                                        <div className="space-y-3">
                                            {paginatedDocuments.map((doc) => (
                                                <ModernRecordCard
                                                    key={doc.id}
                                                    document={doc}
                                                    categories={categories}
                                                    onView={(doc) => handleDocumentAction(doc, 'view')}
                                                    onDownload={(doc) => handleDocumentAction(doc, 'download')}
                                                    onDelete={handleDelete}
                                                    getResidentName={(doc) => customGetResidentName(doc.resident_id, doc)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Table View */}
                                    {!isMobile && (
                                        <ModernRecordTable
                                            records={paginatedDocuments}
                                            categories={categories}
                                            onView={(doc) => handleDocumentAction(doc, 'view')}
                                            onDownload={(doc) => handleDocumentAction(doc, 'download')}
                                            onDelete={handleDelete}
                                            onCopyReference={handleCopyReference}
                                            getResidentName={(doc) => customGetResidentName(doc.resident_id, doc)}
                                        />
                                    )}
                                </>
                            )}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                                    <ModernPagination
                                        currentPage={currentPage}
                                        lastPage={totalPages}
                                        onPageChange={handlePageChange}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <ModernEmptyState
                            status={activeTab === 'all' ? 'all' : 'filtered'}
                            hasFilters={hasActiveFilters}
                            onClearFilters={clearFilters}
                            icon={FolderIcon}
                            title={search 
                                ? `No documents match your search "${search}"` 
                                : activeTab !== 'all' 
                                    ? `No documents found in ${currentCategory?.name || 'this category'}`
                                    : 'No documents found'}
                            message={search || activeTab !== 'all' || residentFilter !== 'all'
                                ? 'Try adjusting your filters or clear them to see all documents'
                                : 'Upload your first document to get started'}
                            actionLabel="Upload Document"
                            onAction={() => router.visit('/portal/my-records/create')}
                        />
                    )}
                </div>

                {/* Storage Usage */}
                <div className="px-4 sm:px-0">
                    <StorageCard stats={storageStats} />
                </div>
            </div>

            {/* Loading Overlay */}
            <ModernLoadingOverlay loading={loading} message="Loading documents..." />
        </ResidentLayout>
    );
}