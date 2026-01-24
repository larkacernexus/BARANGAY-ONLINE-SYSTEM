import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

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

// Define a proper type for icon components
type IconComponent = React.ComponentType<{ className?: string }>;

// Update icon mapping to match your Laravel backend icon names
const iconMap: Record<string, IconComponent> = {
  'user': UserIcon,
  'heart': HeartIcon,
  'file-text': FileTextIcon,
  'graduation-cap': GraduationCapIcon,
  'briefcase': BriefcaseIcon,
  'award': AwardIcon,
  'shield': ShieldIcon,
  'folder': FolderIcon,
  'folder-open': FolderOpenIcon,
  'file': FileIcon,
  'calendar': CalendarIcon,
  'image': ImageIcon,
  'file-digit': FileDigitIcon,
  'type': TypeIcon,
};

// Color mappings for Tailwind
const colorMap: Record<string, string> = {
  'blue': 'text-blue-600',
  'red': 'text-red-600',
  'green': 'text-green-600',
  'yellow': 'text-yellow-600',
  'purple': 'text-purple-600',
  'pink': 'text-pink-600',
  'indigo': 'text-indigo-600',
  'gray': 'text-gray-600'
};

const bgColorMap: Record<string, string> = {
  'blue': 'bg-blue-50',
  'red': 'bg-red-50',
  'green': 'bg-green-50',
  'yellow': 'bg-yellow-50',
  'purple': 'bg-purple-50',
  'pink': 'bg-pink-50',
  'indigo': 'bg-indigo-50',
  'gray': 'bg-gray-50'
};

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

export default function MyRecords({ 
    documents, 
    categories, 
    storageStats,
    filters,
    householdResidents,
    currentResident,
    household,
    error 
}: PageProps) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [residentFilter, setResidentFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list for mobile
    
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
    const [allDocuments, setAllDocuments] = useState<Document[]>(documents.data || []);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Reduced for mobile
    
    // State to track if we're in modal mode to prevent filtering interference
    const [isModalMode, setIsModalMode] = useState(false);

    // Initialize all documents on first load
    useEffect(() => {
        setAllDocuments(documents.data || []);
        setFilteredDocuments(documents.data || []);
    }, [documents.data]);
    
    // CLIENT-SIDE FILTERING LOGIC
    useEffect(() => {
        // Skip filtering if we're in modal mode
        if (isModalMode) {
            return;
        }
        
        if (allDocuments.length === 0) {
            setFilteredDocuments([]);
            return;
        }
        
        let result = [...allDocuments];
        
        // Apply search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter(doc => 
                doc.name?.toLowerCase().includes(searchLower) ||
                doc.description?.toLowerCase().includes(searchLower) ||
                doc.reference_number?.toLowerCase().includes(searchLower) ||
                doc.file_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply category filter
        if (activeTab !== 'all') {
            const categoryId = parseInt(activeTab);
            result = result.filter(doc => 
                doc.document_category_id === categoryId || 
                doc.category?.id === categoryId
            );
        }
        
        // Apply resident filter
        if (residentFilter !== 'all') {
            const residentId = parseInt(residentFilter);
            result = result.filter(doc => doc.resident_id === residentId);
        }
        
        // Reset to page 1 when filters change
        if (debouncedSearch || activeTab !== 'all' || residentFilter !== 'all') {
            setCurrentPage(1);
        }
        
        setFilteredDocuments(result);
        
    }, [allDocuments, debouncedSearch, activeTab, residentFilter, isModalMode]);
    
    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);
    
    // Process categories with memoization
    const { processedCategories, allCategories } = useMemo(() => {
        // Sort categories by order if available, otherwise by name
        const sortedCategories = [...categories].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            return a.name.localeCompare(b.name);
        });
        
        const processed = sortedCategories.map(cat => {
            return {
                id: cat.id.toString(),
                slug: cat.slug,
                name: cat.name,
                iconName: cat.icon,
                count: cat.count || 0,
                color: colorMap[cat.color] || 'text-gray-600',
                bgColor: bgColorMap[cat.color] || 'bg-gray-50',
                ...cat
            };
        });
        
        // Use storageStats.document_count for "All Documents"
        const totalDocumentsCount = storageStats?.document_count || 0;
        
        const allCategory = {
            id: 'all',
            slug: 'all',
            name: 'All Documents',
            iconName: 'folder-open',
            count: totalDocumentsCount,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        };
        
        return {
            processedCategories: processed,
            allCategories: [allCategory, ...processed]
        };
    }, [categories, storageStats?.document_count]);
    
    // Helper function to get icon component by name
    const getIconComponent = (iconName: string): IconComponent => {
        const normalizedName = iconName.toLowerCase();
        return iconMap[normalizedName] || FileIcon;
    };

    // Handle tab change - CLIENT SIDE ONLY
    const handleTabChange = (categoryId: string) => {
        setActiveTab(categoryId);
        setIsMobileMenuOpen(false);
        
        // Scroll to top when tab changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle resident filter change - CLIENT SIDE ONLY
    const handleResidentChange = (value: string) => {
        setResidentFilter(value);
    };

    // Clear all filters - CLIENT SIDE ONLY
    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setActiveTab('all');
        setResidentFilter('all');
        
        // Show success message
        setActionStatus({
            type: 'success',
            message: 'All filters cleared'
        });
        
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
    };

    // Get file icon based on file extension
    const getFileIcon = (extension: string, mimeType?: string) => {
        const ext = extension?.toLowerCase() || '';
        
        if (mimeType?.startsWith('image/')) {
            return ImageIcon;
        }
        
        switch (ext) {
            case 'pdf':
                return FileTextIcon;
            case 'doc':
            case 'docx':
                return TypeIcon;
            case 'xls':
            case 'xlsx':
            case 'csv':
                return FileDigitIcon;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return ImageIcon;
            default:
                return FileIcon;
        }
    };

    // Get color based on file type
    const getFileColor = (extension: string) => {
        const ext = extension?.toLowerCase() || '';
        
        switch (ext) {
            case 'pdf':
                return 'text-red-500';
            case 'doc':
            case 'docx':
                return 'text-blue-500';
            case 'xls':
            case 'xlsx':
            case 'csv':
                return 'text-green-500';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return 'text-purple-500';
            default:
                return 'text-gray-500';
        }
    };

    // Get resident name by ID
    const getResidentName = (residentId: number) => {
        const resident = householdResidents?.find(r => r.id === residentId);
        return resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown Resident';
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format date with time for mobile
    const formatDateMobile = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    const from = filteredDocuments.length > 0 ? startIndex + 1 : 0;
    const to = Math.min(endIndex, filteredDocuments.length);
    
    // Handle pagination - CLIENT SIDE ONLY
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle document actions - FIXED: No new tabs, only modal or same-tab navigation
    const handleDocumentAction = (doc: Document, action: 'view' | 'download') => {
        // Set modal mode to prevent filtering interference
        setIsModalMode(true);
        
        setSelectedDocument(doc);
        setActionType(action);
        
        if (doc.requires_password) {
            // Open password modal for password-protected documents
            setPasswordModalOpen(true);
            setPassword('');
            setPasswordError('');
        } else {
            // For non-password protected documents
            if (action === 'view') {
                // Navigate to show page in SAME tab
                router.visit(`/my-records/${doc.id}`);
            } else if (action === 'download') {
                // Trigger direct download
                triggerDirectDownload(doc);
            }
        }
    };

    // Trigger direct download (for non-password protected documents)
    const triggerDirectDownload = (doc: Document) => {
        // Show download starting message
        setActionStatus({
            type: 'success',
            message: `Starting download for "${doc.name}"...`
        });
        
        // Get CSRF token from meta tag
        const getCsrfToken = () => {
            const metaToken = document.querySelector('meta[name="csrf-token"]');
            return metaToken ? metaToken.getAttribute('content') : null;
        };
        
        const csrfToken = getCsrfToken();
        
        if (!csrfToken) {
            setActionStatus({
                type: 'error',
                message: 'Session expired. Please refresh the page.'
            });
            return;
        }
        
        // Create a temporary form to trigger download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/my-records/${doc.id}/download`;
        form.style.display = 'none';
        
        // Add CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = csrfToken;
        form.appendChild(tokenInput);
        
        // Add to body and submit
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Clear message after 3 seconds
        setTimeout(() => {
            setActionStatus({ type: null, message: '' });
        }, 3000);
    };

    // Verify password and redirect to show page
    const verifyPasswordAndPerformAction = async () => {
        if (!selectedDocument || !actionType) return;
        
        setVerifyingPassword(true);
        setPasswordError('');
        
        try {
            // Use Inertia's router.post() which handles CSRF automatically
            router.post(`/my-records/${selectedDocument.id}/verify-password`, {
                password: password
            }, {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    // Check if the response contains success status
                    if (page.props?.success || (typeof page.props === 'object' && page.props.success === true)) {
                        // Get redirect URL from response or construct it
                        const redirectUrl = page.props?.redirect_url || `/my-records/${selectedDocument.id}`;
                        
                        // Close password modal
                        setPasswordModalOpen(false);
                        setPassword('');
                        setPasswordError('');
                        
                        // Show success message
                        setActionStatus({
                            type: 'success',
                            message: 'Password verified! Redirecting...'
                        });
                        
                        // Reset modal mode
                        setIsModalMode(false);
                        
                        // Navigate to show page in SAME tab after a short delay
                        setTimeout(() => {
                            router.visit(redirectUrl);
                        }, 1000);
                        
                    } else {
                        // Handle server-side validation errors
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

    // Check if document is expired
    const isDocumentExpired = (doc: Document) => {
        if (!doc.expiry_date) return false;
        return new Date(doc.expiry_date) < new Date();
    };

    // Default storage stats if not provided
    const defaultStorageStats = {
        used: '0 MB',
        limit: '100 MB',
        available: '100 MB',
        percentage: 0,
        document_count: 0
    };
    
    const safeStorageStats = storageStats || defaultStorageStats;
    
    // Get current category for display
    const currentCategory = allCategories.find(c => c.id === activeTab);
    
    // If there's an error, show error message
    if (error) {
        return (
            <ResidentLayout
                title="My Records"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Records', href: '#' }
                ]}
            >
                <div className="py-12 text-center">
                    <ShieldIcon className="h-12 w-12 mx-auto text-red-400" />
                    <h3 className="mt-4 text-lg font-semibold">Error</h3>
                    <p className="text-gray-500 mt-2">
                        {error}
                    </p>
                    <Button 
                        className="mt-4"
                        onClick={() => window.location.href = '/resident/dashboard'}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            title="My Records"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Records', href: '#' }
            ]}
        >
            <Head title="My Records" />
            
            {/* Action Status Alert */}
            {actionStatus.type && (
                <div className="fixed top-16 sm:top-4 right-4 z-50 max-w-xs sm:max-w-sm animate-in slide-in-from-top duration-300">
                    <Alert variant={actionStatus.type === 'error' ? 'destructive' : actionStatus.type === 'success' ? 'default' : 'default'} className="shadow-lg">
                        <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
                            {actionStatus.type === 'success' ? (
                                <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            ) : actionStatus.type === 'error' ? (
                                <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            ) : (
                                <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            )}
                            <span className="truncate">{actionStatus.message}</span>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            
            {/* Password Verification Modal */}
            <Dialog open={passwordModalOpen} onOpenChange={(open) => {
                setPasswordModalOpen(open);
                if (!open) {
                    // Reset modal mode when modal closes
                    setIsModalMode(false);
                    setPassword('');
                    setPasswordError('');
                    setSelectedDocument(null);
                    setActionType(null);
                }
            }}>
                <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <LockIcon className="h-5 w-5 flex-shrink-0" />
                            Enter Document Password
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            This document is password protected. Please enter the password to access it.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        {selectedDocument && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium text-sm truncate">{selectedDocument.name}</div>
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                    {selectedDocument.file_name}
                                </div>
                                <div className="text-xs text-blue-500 mt-1">
                                    You will be redirected to the document details page
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !verifyingPassword) {
                                        verifyPasswordAndPerformAction();
                                    }
                                }}
                                disabled={verifyingPassword}
                                className="text-sm sm:text-base"
                            />
                            {passwordError && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
                                    <AlertDescription className="text-sm">
                                        {passwordError}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setPasswordModalOpen(false);
                                setPassword('');
                                setPasswordError('');
                                setSelectedDocument(null);
                                setActionType(null);
                                // Reset modal mode when modal closes
                                setIsModalMode(false);
                            }}
                            disabled={verifyingPassword}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={verifyPasswordAndPerformAction}
                            disabled={verifyingPassword || !password.trim()}
                            className="w-full sm:w-auto"
                        >
                            {verifyingPassword ? (
                                <>
                                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                    Verify & Continue
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                {/* Header with Mobile Menu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-0">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="sm:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" type="button" className="h-10 w-10">
                                        <MenuIcon className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full max-w-[280px]">
                                    <SheetHeader className="pb-4 border-b">
                                        <SheetTitle className="text-lg">Document Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4 overflow-y-auto h-[calc(100vh-100px)]">
                                        {/* Category Filter in Sidebar */}
                                        <div className="mb-6">
                                            <h3 className="font-medium text-sm mb-3 text-gray-700">Categories</h3>
                                            <div className="space-y-2">
                                                {allCategories.map((category) => {
                                                    const IconComponent = getIconComponent(category.iconName);
                                                    return (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                                                                activeTab === category.id 
                                                                    ? 'bg-blue-50 border border-blue-200' 
                                                                    : 'hover:bg-gray-50'
                                                            }`}
                                                            onClick={() => {
                                                                handleTabChange(category.id);
                                                                setIsMobileMenuOpen(false);
                                                            }}
                                                        >
                                                            <div className={`p-2 rounded-full ${category.bgColor} flex-shrink-0`}>
                                                                <IconComponent className={`h-5 w-5 ${category.color}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm truncate">{category.name}</div>
                                                                <div className="text-xs text-gray-500">{category.count} documents</div>
                                                            </div>
                                                            {activeTab === category.id && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* Resident Filter in Sidebar */}
                                        {householdResidents && householdResidents.length > 1 && (
                                            <div className="mb-6">
                                                <h3 className="font-medium text-sm mb-3 text-gray-700">Residents</h3>
                                                <Select 
                                                    value={residentFilter} 
                                                    onValueChange={(value) => {
                                                        handleResidentChange(value);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="All Residents" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Residents</SelectItem>
                                                        {householdResidents.map(resident => (
                                                            <SelectItem key={resident.id} value={resident.id.toString()}>
                                                                {resident.first_name} {resident.last_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        
                                        {/* View Mode in Sidebar */}
                                        <div className="mb-6">
                                            <h3 className="font-medium text-sm mb-3 text-gray-700">View Mode</h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setViewMode('grid');
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <GridIcon className="h-4 w-4 mr-1" />
                                                    Grid
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setViewMode('list');
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <ListIcon className="h-4 w-4 mr-1" />
                                                    List
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {/* Clear Filters Button in Sidebar */}
                                        <div className="pt-4 border-t">
                                            <Button 
                                                variant="outline" 
                                                type="button"
                                                className="w-full"
                                                onClick={() => {
                                                    clearFilters();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <XIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                                Clear All Filters
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">My Records</h1>
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
                                className="h-9 w-9 p-0"
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
                            onClick={() => router.visit('/my-records/export')} 
                            className="hidden sm:inline-flex"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                        <Link href="/my-records/create" className="flex-1 sm:flex-none">
                            <Button size="sm" type="button" className="w-full sm:w-auto">
                                <PlusIcon className="h-4 w-4 mr-2 sm:mr-2" />
                                <span className="hidden sm:inline">Upload</span>
                                <span className="sm:hidden">Upload</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 sm:px-0">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 flex-shrink-0" />
                        <Input 
                            placeholder="Search documents..." 
                            className="pl-10 text-sm sm:text-base w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Filter Controls */}
                <div className="hidden sm:block space-y-4">
                    {/* Desktop Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {allCategories.map((category) => {
                            const IconComponent = getIconComponent(category.iconName);
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                                        activeTab === category.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleTabChange(category.id)}
                                >
                                    <IconComponent className={`h-4 w-4 ${activeTab === category.id ? 'text-white' : 'text-gray-500'}`} />
                                    {category.name}
                                    <span className={`text-xs ${activeTab === category.id ? 'text-white' : 'text-gray-500'}`}>
                                        ({category.count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Desktop Resident Filter */}
                    {householdResidents && householdResidents.length > 1 && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Filter by resident:</span>
                            </div>
                            <Select 
                                value={residentFilter} 
                                onValueChange={handleResidentChange}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Residents" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Residents</SelectItem>
                                    {householdResidents.map(resident => (
                                        <SelectItem key={resident.id} value={resident.id.toString()}>
                                            {resident.first_name} {resident.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Desktop View Toggle */}
                <div className="hidden sm:flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">View:</span>
                        <div className="flex items-center gap-1 border rounded-md p-1">
                            <Button
                                type="button"
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <GridIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Active filters indicator */}
                {(activeTab !== 'all' || residentFilter !== 'all' || search) && (
                    <div className="px-4 sm:px-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">Active filters:</span>
                            
                            {search && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5">
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
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5">
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
                                <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5">
                                    <span className="truncate max-w-[100px]">
                                        {getResidentName(parseInt(residentFilter))}
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
                                className="text-sm h-8 px-3"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                <div className="px-4 sm:px-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{filteredDocuments.length}</span> document{filteredDocuments.length !== 1 ? 's' : ''} found
                            {currentCategory && currentCategory.id !== 'all' && (
                                <span> in <span className="font-medium">{currentCategory.name}</span></span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {from} to {to} of {filteredDocuments.length}
                        </div>
                    </div>
                </div>

                {/* Documents Grid/List */}
                <div className="px-4 sm:px-0">
                    {paginatedDocuments.length > 0 ? (
                        <>
                            {/* GRID VIEW */}
                            {viewMode === 'grid' ? (
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {paginatedDocuments.map((doc) => {
                                        const category = doc.category || categories.find(c => c.id === doc.document_category_id);
                                        const DocIconComponent = category ? getIconComponent(category.icon) : FileIcon;
                                        const FileIconComponent = getFileIcon(doc.file_extension, doc.mime_type);
                                        const fileColor = getFileColor(doc.file_extension);
                                        const categoryColor = category ? (colorMap[category.color] || 'text-gray-600') : 'text-gray-600';
                                        const isExpired = isDocumentExpired(doc);
                                        
                                        return (
                                            <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
                                                            <DocIconComponent className={`h-5 w-5 ${categoryColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm sm:text-base line-clamp-2 break-words">{doc.name}</div>
                                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                                Belongs to: {getResidentName(doc.resident_id)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        <FileIconComponent className={`h-3 w-3 mr-1 ${fileColor}`} />
                                                        {doc.file_extension?.toUpperCase() || 'FILE'}
                                                    </Badge>
                                                    {doc.requires_password && (
                                                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                                                            <LockIcon className="h-3 w-3 mr-1" />
                                                            Protected
                                                        </Badge>
                                                    )}
                                                    {isExpired && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Expired
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                {doc.description && (
                                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                        {doc.description}
                                                    </p>
                                                )}
                                                
                                                {doc.reference_number && (
                                                    <div className="text-xs text-gray-500 mb-2 truncate">
                                                        Ref: {doc.reference_number}
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-1 text-xs text-gray-500 mb-3">
                                                    {doc.issue_date && (
                                                        <div className="truncate">
                                                            Issued: {formatDate(doc.issue_date)}
                                                        </div>
                                                    )}
                                                    {doc.expiry_date && (
                                                        <div className={`truncate ${isExpired ? 'text-red-600 font-semibold' : ''}`}>
                                                            Expires: {formatDate(doc.expiry_date)}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{formatDateMobile(doc.created_at)}</span>
                                                    </div>
                                                    <div className="truncate">{doc.file_size_human}</div>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    {/* View Button */}
                                                    <Button
                                                        size="sm"
                                                        variant={doc.requires_password ? "outline" : "default"}
                                                        className={`flex-1 ${doc.requires_password ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : ''}`}
                                                        onClick={() => handleDocumentAction(doc, 'view')}
                                                        disabled={isExpired}
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-2" />
                                                        {doc.requires_password ? 'Unlock' : 'View'}
                                                    </Button>
                                                    
                                                    {/* Download Button */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleDocumentAction(doc, 'download')}
                                                        disabled={isExpired}
                                                    >
                                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* LIST VIEW - Better for mobile */
                                <div className="space-y-3">
                                    {paginatedDocuments.map((doc) => {
                                        const category = doc.category || categories.find(c => c.id === doc.document_category_id);
                                        const DocIconComponent = category ? getIconComponent(category.icon) : FileIcon;
                                        const FileIconComponent = getFileIcon(doc.file_extension, doc.mime_type);
                                        const fileColor = getFileColor(doc.file_extension);
                                        const categoryColor = category ? (colorMap[category.color] || 'text-gray-600') : 'text-gray-600';
                                        const isExpired = isDocumentExpired(doc);
                                        
                                        return (
                                            <div key={doc.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
                                                        <DocIconComponent className={`h-4 w-4 ${categoryColor}`} />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm truncate">{doc.name}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <UserIcon className="h-3 w-3" />
                                                                        <span className="truncate">{getResidentName(doc.resident_id)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <FileIconComponent className={`h-3 w-3 ${fileColor}`} />
                                                                        <span>{doc.file_extension?.toUpperCase()}</span>
                                                                    </div>
                                                                    {doc.requires_password && (
                                                                        <LockIcon className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                                                    )}
                                                                    {isExpired && (
                                                                        <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                                                                            Expired
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVerticalIcon className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40">
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDocumentAction(doc, 'view')}
                                                                        disabled={isExpired}
                                                                    >
                                                                        <EyeIcon className="h-4 w-4 mr-2" />
                                                                        {doc.requires_password ? 'Unlock & View' : 'View'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDocumentAction(doc, 'download')}
                                                                        disabled={isExpired}
                                                                    >
                                                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                                                        Download
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (confirm('Are you sure you want to delete this document?')) {
                                                                                const getCsrfToken = () => {
                                                                                    const metaToken = document.querySelector('meta[name="csrf-token"]');
                                                                                    return metaToken ? metaToken.getAttribute('content') : null;
                                                                                };
                                                                                
                                                                                const csrfToken = getCsrfToken() || '';
                                                                                
                                                                                const form = document.createElement('form');
                                                                                form.method = 'POST';
                                                                                form.action = `/my-records/${doc.id}`;
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
                                                                        }}
                                                                    >
                                                                        <TrashIcon className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        
                                                        {doc.description && (
                                                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                                                {doc.description}
                                                            </p>
                                                        )}
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon className="h-3 w-3" />
                                                                    {formatDateMobile(doc.created_at)}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <ClockIcon className="h-3 w-3" />
                                                                    {doc.file_size_human}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex gap-1">
                                                                {/* Quick View Button */}
                                                                <Button
                                                                    size="sm"
                                                                    variant={doc.requires_password ? "outline" : "default"}
                                                                    className="h-7 px-2 text-xs"
                                                                    onClick={() => handleDocumentAction(doc, 'view')}
                                                                    disabled={isExpired}
                                                                >
                                                                    {doc.requires_password ? 'Unlock' : 'View'}
                                                                </Button>
                                                                
                                                                {/* Quick Download Button */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2 text-xs"
                                                                    onClick={() => handleDocumentAction(doc, 'download')}
                                                                    disabled={isExpired}
                                                                >
                                                                    <DownloadIcon className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500 text-center sm:text-left">
                                            Showing {from} to {to} of {filteredDocuments.length} documents
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="h-8 w-8 p-0 flex-shrink-0"
                                            >
                                                <ChevronLeftIcon className="h-4 w-4" />
                                            </Button>
                                            <div className="text-sm text-gray-700">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                type="button"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="h-8 w-8 p-0 flex-shrink-0"
                                            >
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-gray-50">
                            <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filteredDocuments.length > 0 ? 'No documents match your filters' : 'No documents found'}
                            </h3>
                            <p className="text-gray-500 text-sm sm:text-base mb-6">
                                {debouncedSearch 
                                    ? `No documents match your search "${debouncedSearch}".` 
                                    : activeTab !== 'all' 
                                        ? `No documents found in ${currentCategory?.name || 'this category'}.`
                                        : 'You don\'t have any documents yet.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Link href="/my-records/create">
                                    <Button size="sm" type="button">
                                        <UploadIcon className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </Link>
                                {(debouncedSearch || activeTab !== 'all' || residentFilter !== 'all') && (
                                    <Button variant="outline" size="sm" type="button" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Storage Usage */}
                <div className="px-4 sm:px-0">
                    <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Storage Usage</h3>
                            <span className="text-sm text-gray-500">{safeStorageStats.document_count || 0} documents</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Used Storage</div>
                                    <div className="text-lg font-bold truncate">{safeStorageStats.used} / {safeStorageStats.limit}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-500">Available</div>
                                    <div className="text-lg font-bold text-green-600 truncate">{safeStorageStats.available}</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        safeStorageStats.percentage > 90 ? 'bg-red-600' :
                                        safeStorageStats.percentage > 75 ? 'bg-yellow-600' :
                                        'bg-blue-600'
                                    }`}
                                    style={{ width: `${Math.min(safeStorageStats.percentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{safeStorageStats.percentage}% used</span>
                                <Link href="/resident/subscription">
                                    <Button variant="link" type="button" className="p-0 h-auto text-sm">
                                        {safeStorageStats.percentage > 90 ? 'Storage Almost Full - ' : ''}
                                        Upgrade
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}