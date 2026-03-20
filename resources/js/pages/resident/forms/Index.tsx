import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// Icons
import {
    AlertCircle,
    Search,
    Eye,
    Download,
    MoreVertical,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    BarChart,
    Calendar,
    FileText,
    Building,
    Tag,
    Grid,
    List,
    Loader2,
    CheckCircle,
    XCircle,
    X,
    Share2,
    Printer,
    Mail,
    FilterX,
    FolderOpen,
    Users,
    Shield,
    Building2,
    AlertTriangle,
    Plus,
    Clock,
    Copy,
    FileCheck,
    ArrowUpDown,
    Info,
} from 'lucide-react';

// Reusable Components
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Form-specific components
import { ModernFormCard } from '@/components/residentui/forms/modern-form-card';
import { ModernFormGridCard } from '@/components/residentui/forms/modern-form-grid-card';
import { ModernFormTable } from '@/components/residentui/forms/modern-form-table';
import { ModernFormFilters } from '@/components/residentui/forms/modern-form-filters';

// Types
interface Form {
    id: number;
    title: string;
    description: string;
    category: string;
    issuing_agency: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_type: string;
    download_count: number;
    view_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PaginationData {
    current_page: number;
    data: Form[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface Stats {
    total: number;
    active: number;
    downloads: number;
    categories_count: number;
    agencies_count: number;
    popular_categories: Array<{category: string; count: number}>;
    popular_agencies: Array<{agency: string; count: number}>;
}

interface PageProps extends Record<string, any> {
    forms: PaginationData;
    filters: {
        search?: string;
        category?: string;
        agency?: string;
        sort_by?: string;
        sort_order?: string;
    };
    categories: string[];
    agencies: string[];
    stats: Stats;
    error?: string;
}

// Constants
const FORM_TABS = [
    { value: 'all', label: 'All Forms', icon: FileText },
    { value: 'popular', label: 'Most Downloaded', icon: Download },
    { value: 'recent', label: 'Recently Added', icon: Clock },
];

const SORT_OPTIONS = [
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'download_count', label: 'Most Downloaded' },
    { value: 'category', label: 'Category' },
    { value: 'issuing_agency', label: 'Agency' },
];

// Helper functions
const formatDate = (dateString: string, shortFormat: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        if (shortFormat) {
            return format(date, 'MMM d, yyyy');
        }
        return format(date, 'MMMM d, yyyy');
    } catch (error) {
        return 'N/A';
    }
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
        return 'N/A';
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
        'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
        'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
        'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
};

const getAgencyIcon = (agency: string) => {
    if (!agency) return Building;
    if (agency.includes('Mayor')) return Building2;
    if (agency.includes('DSWD')) return Users;
    if (agency.includes('PNP') || agency.includes('Police')) return Shield;
    if (agency.includes('Health')) return AlertTriangle;
    return Building;
};

const getFileTypeIcon = (fileType: string) => {
    if (!fileType) return FileText;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('doc')) return FileText;
    if (fileType.includes('excel') || fileType.includes('sheet')) return BarChart;
    return FileText;
};

const getFileTypeColor = (fileType: string): string => {
    if (!fileType) return 'text-gray-500';
    if (fileType.includes('pdf')) return 'text-red-500';
    if (fileType.includes('word') || fileType.includes('doc')) return 'text-blue-500';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'text-green-500';
    return 'text-gray-500';
};

const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const copyToClipboard = async (text: string, message: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(message);
    } catch (err) {
        toast.error('Failed to copy to clipboard');
    }
};

const printFormsList = (forms: Form[], filter: string, stats: Stats) => {
    if (forms.length === 0) {
        toast.error('No forms to print');
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
    }

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Forms Catalog Report</title>
            <style>
                body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 40px; }
                h1 { color: #111; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
                .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
                .stat-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
                .stat-label { color: #666; font-size: 12px; margin-bottom: 4px; }
                .stat-value { font-size: 24px; font-weight: 600; color: #111; }
                table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
                th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 500; color: #374151; }
                td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                .category-badge { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                @media print {
                    body { margin: 0.5in; }
                }
            </style>
        </head>
        <body>
            <h1>Forms Catalog Report</h1>
            <p class="subtitle">Generated on ${formatDateTime(new Date().toISOString())} • Filter: ${filter}</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Forms</div>
                    <div class="stat-value">${stats.total.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Downloads</div>
                    <div class="stat-value">${stats.downloads.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Categories</div>
                    <div class="stat-value">${stats.categories_count}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Agencies</div>
                    <div class="stat-value">${stats.agencies_count}</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Agency</th>
                        <th>Downloads</th>
                        <th>File Size</th>
                        <th>Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${forms.map(form => `
                        <tr>
                            <td>${form.title}</td>
                            <td><span class="category-badge">${form.category}</span></td>
                            <td>${form.issuing_agency}</td>
                            <td>${form.download_count.toLocaleString()}</td>
                            <td>${formatFileSize(form.file_size)}</td>
                            <td>${formatDate(form.created_at, true)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated from Barangay Forms Portal • Page 1 of 1</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};

const exportFormsToCSV = async (forms: Form[], filter: string, setIsExporting: (value: boolean) => void) => {
    if (forms.length === 0) {
        toast.error('No forms to export');
        return;
    }

    setIsExporting(true);
    
    try {
        const headers = ['Title', 'Description', 'Category', 'Issuing Agency', 'File Name', 'File Type', 'File Size', 'Downloads', 'Upload Date'];
        
        const csvData = forms.map(form => [
            `"${form.title.replace(/"/g, '""')}"`,
            `"${(form.description || '').replace(/"/g, '""')}"`,
            form.category,
            form.issuing_agency,
            form.file_name,
            form.file_type,
            formatFileSize(form.file_size),
            form.download_count.toString(),
            formatDate(form.created_at, true)
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `forms_catalog_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`${forms.length} forms exported successfully`);
    } catch (error) {
        toast.error('Failed to export forms');
        console.error(error);
    } finally {
        setIsExporting(false);
    }
};

// FIXED: Updated to use string for trend instead of object
const getFormStatsCards = (stats: Stats, formatNumber: (num: number) => string) => {
    return [
        {
            title: 'Total Forms',
            value: formatNumber(stats.total),
            icon: FileText,
            color: 'blue',
            trend: `${stats.active} active`, // Changed from object to string
            trendPositive: true
        },
        {
            title: 'Total Downloads',
            value: formatNumber(stats.downloads),
            icon: Download,
            color: 'purple',
        },
        {
            title: 'Categories',
            value: stats.categories_count.toString(),
            icon: Tag,
            color: 'green',
            subtitle: stats.popular_categories?.[0]?.category || 'Various'
        },
        {
            title: 'Agencies',
            value: stats.agencies_count.toString(),
            icon: Building,
            color: 'amber',
            subtitle: stats.popular_agencies?.[0]?.agency || 'Various'
        }
    ];
};

const getStatusCount = (stats: Stats, status: string): number => {
    switch (status) {
        case 'all':
            return stats.total;
        case 'popular':
            return stats.total;
        case 'recent':
            return stats.total;
        default:
            return 0;
    }
};

// CollapsibleStats Component (Mobile)
const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    stats,
    formatNumber
}: any) => (
    <div className="md:hidden">
        <Button 
            variant="outline" 
            className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700"
            onClick={() => setShowStats(!showStats)}
        >
            <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
            </div>
            {showStats ? (
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            )}
        </Button>
        
        {showStats && (
            <div className="mt-2 animate-slide-down">
                <ModernStatsCards 
                    cards={getFormStatsCards(stats, formatNumber)} 
                    loading={false}
                    gridCols="grid-cols-2"
                />
            </div>
        )}
    </div>
);

// DesktopStats Component
const DesktopStats = ({ 
    stats,
    formatNumber
}: any) => (
    <div className="hidden md:block">
        <ModernStatsCards 
            cards={getFormStatsCards(stats, formatNumber)} 
            loading={false}
        />
    </div>
);

export default function FormsIndex() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const forms = pageProps.forms || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    };
    
    const stats = pageProps.stats || {
        total: 0,
        active: 0,
        downloads: 0,
        categories_count: 0,
        agencies_count: 0,
        popular_categories: [],
        popular_agencies: [],
    };
    
    const categories = pageProps.categories || [];
    const agencies = pageProps.agencies || [];
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [agencyFilter, setAgencyFilter] = useState(filters.agency || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedForms, setSelectedForms] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('all');
    
    const hasInitialized = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('grid');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Initialize filters from props
    useEffect(() => {
        if (!hasInitialized.current) {
            setSearch(filters.search || '');
            setCategoryFilter(filters.category || 'all');
            setAgencyFilter(filters.agency || 'all');
            setSortBy(filters.sort_by || 'created_at');
            setSortOrder(filters.sort_order || 'desc');
            hasInitialized.current = true;
        }
    }, [filters]);
    
    // Search debounce
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (search === '' && !filters.search) return;
        if (search === filters.search) return;
        
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            updateFilters({ 
                search: search.trim(),
                page: '1'
            });
        }, 800);
        
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [search]);
    
    const updateFilters = (newFilters: Record<string, string>) => {
        setLoading(true);
        
        const updatedFilters = {
            ...filters,
            ...newFilters,
        };
        
        const cleanFilters: Record<string, string> = {};
        
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === 'page' && value === '1') return;
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value;
            }
        });
        
        router.get('/portal/forms', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        
        let sortField = 'created_at';
        let sortDir = 'desc';
        
        if (tab === 'popular') {
            sortField = 'download_count';
            sortDir = 'desc';
        } else if (tab === 'recent') {
            sortField = 'created_at';
            sortDir = 'desc';
        }
        
        setSortBy(sortField);
        setSortOrder(sortDir);
        
        updateFilters({ 
            sort_by: sortField,
            sort_order: sortDir,
            page: '1'
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        updateFilters({ 
            category: category === 'all' ? '' : category,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleAgencyChange = (agency: string) => {
        setAgencyFilter(agency);
        updateFilters({ 
            agency: agency === 'all' ? '' : agency,
            page: '1'
        });
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        updateFilters({ 
            sort_by: sort,
            page: '1'
        });
    };
    
    const handleSortOrderToggle = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        updateFilters({ 
            sort_order: newOrder,
            page: '1'
        });
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setAgencyFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
        setActiveTab('all');
        
        router.get('/portal/forms', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        updateFilters({ 
            search: search.trim(),
            page: '1'
        });
    };
    
    const handleSearchClear = () => {
        setSearch('');
        updateFilters({ 
            search: '',
            page: '1'
        });
    };
    
    // Selection mode functions
    const toggleSelectForm = (id: number) => {
        setSelectedForms(prev =>
            prev.includes(id)
                ? prev.filter(formId => formId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllForms = () => {
        const currentForms = forms.data;
        if (selectedForms.length === currentForms.length && currentForms.length > 0) {
            setSelectedForms([]);
        } else {
            setSelectedForms(currentForms.map(f => f.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedForms([]);
        } else {
            setSelectMode(true);
        }
    };
    
    const handleDownloadSelected = () => {
        toast.info(`Download functionality for ${selectedForms.length} forms would be implemented here`);
    };
    
    const handleViewDetails = (id: number) => {
        router.visit(`/portal/forms/${id}`);
    };
    
    const handleDownloadForm = (form: Form) => {
        window.location.href = `/portal/forms/${form.id}/download`;
    };
    
    const handleCopyLink = (form: Form) => {
        const url = `${window.location.origin}/portal/forms/${form.id}`;
        copyToClipboard(url, `Link copied to clipboard`);
    };
    
    const handleCopyTitle = (title: string) => {
        copyToClipboard(title, `Title copied to clipboard`);
    };
    
    const handleGenerateReport = (form: Form) => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <h1>Form Details: ${form.title}</h1>
                <p><strong>Category:</strong> ${form.category}</p>
                <p><strong>Agency:</strong> ${form.issuing_agency}</p>
                <p><strong>Description:</strong> ${form.description}</p>
                <p><strong>Downloads:</strong> ${form.download_count.toLocaleString()}</p>
                <p><strong>File Size:</strong> ${formatFileSize(form.file_size)}</p>
                <p><strong>File Type:</strong> ${form.file_type}</p>
                <p><strong>Uploaded:</strong> ${formatDateTime(form.created_at)}</p>
            `);
        }
    };
    
    const handleReportIssue = (form: Form) => {
        toast.info('Report issue feature would open a form');
    };
    
    const getCurrentForms = () => {
        return forms.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    const handlePrint = () => {
        printFormsList(forms.data, activeTab, stats);
    };
    
    const handleExport = () => {
        exportFormsToCSV(forms.data, activeTab, setIsExporting);
    };
    
    const handleCopySummary = async () => {
        const summary = `Forms Catalog Summary:\n\n` +
            `Total Forms: ${stats.total}\n` +
            `Active Forms: ${stats.active}\n` +
            `Total Downloads: ${stats.downloads.toLocaleString()}\n` +
            `Categories: ${stats.categories_count}\n` +
            `Agencies: ${stats.agencies_count}\n\n` +
            `Popular Categories:\n` +
            (stats.popular_categories?.slice(0, 3).map(c => `• ${c.category}: ${c.count} forms`).join('\n') || 'No data') + '\n\n' +
            `Active Agencies:\n` +
            (stats.popular_agencies?.slice(0, 3).map(a => `• ${a.agency}: ${a.count} forms`).join('\n') || 'No data') + '\n\n' +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/portal/forms`;
        
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };
    
    const handleEmailSummary = () => {
        const body = `
Hello,

Here's a summary of available forms:

Total Forms: ${stats.total}
Active Forms: ${stats.active}
Total Downloads: ${stats.downloads.toLocaleString()}
Categories: ${stats.categories_count}
Agencies: ${stats.agencies_count}

Most Popular Categories:
${stats.popular_categories?.slice(0, 3).map(c => `• ${c.category}: ${c.count} forms`).join('\n') || 'No data'}

Most Active Agencies:
${stats.popular_agencies?.slice(0, 3).map(a => `• ${a.agency}: ${a.count} forms`).join('\n') || 'No data'}

Browse all forms at: ${window.location.origin}/portal/forms

This summary was generated from the Barangay Forms Portal.

Best regards,
Forms Catalog System
        `.trim();
        
        const subject = `Forms Catalog Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    
    const handlePageChange = (page: number) => {
        updateFilters({ page: page.toString() });
    };
    
    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };
    
    const renderTabContent = () => {
        const currentForms = getCurrentForms();
        const tabHasData = currentForms.length > 0;
        
        const displayTab = activeTab === 'all' ? 'All' : 
                          activeTab === 'popular' ? 'Most Downloaded' : 'Recently Added';
        
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardContent className="p-4 md:p-6">
                    <ModernSelectionBanner
                        selectMode={selectMode}
                        selectedCount={selectedForms.length}
                        totalCount={currentForms.length}
                        onSelectAll={selectAllForms}
                        onDeselectAll={() => setSelectedForms([])}
                        onCancel={() => {
                            setSelectMode(false);
                            setSelectedForms([]);
                        }}
                        onDelete={handleDownloadSelected}
                        deleteLabel="Download Selected"
                    />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {displayTab} Forms
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentForms.length} form${currentForms.length !== 1 ? 's' : ''}`
                                    : `No forms found`
                                }
                                {selectMode && selectedForms.length > 0 && ` • ${selectedForms.length} selected`}
                                {(categoryFilter !== 'all' || agencyFilter !== 'all' || search) && ' (filtered)'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                                        <ArrowUpDown className="h-4 w-4" />
                                        Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {SORT_OPTIONS.map(option => (
                                        <DropdownMenuItem 
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className={sortBy === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''}
                                        >
                                            {option.value === 'title' && <FileText className="h-4 w-4 mr-2" />}
                                            {option.value === 'created_at' && <Calendar className="h-4 w-4 mr-2" />}
                                            {option.value === 'download_count' && <Download className="h-4 w-4 mr-2" />}
                                            {option.value === 'category' && <Tag className="h-4 w-4 mr-2" />}
                                            {option.value === 'issuing_agency' && <Building className="h-4 w-4 mr-2" />}
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSortOrderToggle}>
                                        {sortOrder === 'asc' ? (
                                            <ChevronUp className="h-4 w-4 mr-2" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                        )}
                                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* View Toggle */}
                            {!selectMode && tabHasData && (
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={cn(
                                            "h-8 w-8 p-0",
                                            viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm"
                                        )}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={cn(
                                            "h-8 w-8 p-0",
                                            viewMode === 'list' && "bg-white dark:bg-gray-700 shadow-sm"
                                        )}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Select Mode Toggle */}
                            {tabHasData && (
                                <Button
                                    variant={selectMode ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={toggleSelectMode}
                                    className="gap-2 rounded-xl"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {selectMode ? 'Cancel' : 'Select'}
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {!tabHasData ? (
                        <ModernEmptyState
                            status={activeTab}
                            hasFilters={hasActiveFilters}
                            onClearFilters={handleClearFilters}
                            icon={activeTab === 'all' ? FileText : 
                                  activeTab === 'popular' ? Download :
                                  activeTab === 'recent' ? Clock : FileText}
                            title={`No ${activeTab === 'all' ? '' : activeTab} forms found`}
                            message={hasActiveFilters 
                                ? 'Try adjusting your filters or search criteria' 
                                : 'There are currently no forms available in this category'}
                        />
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <>
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentForms.map((form) => (
                                                <ModernFormCard
                                                    key={form.id}
                                                    form={form}
                                                    selectMode={selectMode}
                                                    selectedForms={selectedForms}
                                                    toggleSelectForm={toggleSelectForm}
                                                    formatDate={(date) => formatDate(date, true)}
                                                    formatFileSize={formatFileSize}
                                                    getCategoryColor={getCategoryColor}
                                                    getAgencyIcon={getAgencyIcon}
                                                    getFileTypeIcon={getFileTypeIcon}
                                                    getFileTypeColor={getFileTypeColor}
                                                    truncateText={truncateText}
                                                    onCopyLink={handleCopyLink}
                                                    onCopyTitle={handleCopyTitle}
                                                    onViewDetails={handleViewDetails}
                                                    onDownload={handleDownloadForm}
                                                    onGenerateReport={handleGenerateReport}
                                                    onReportIssue={handleReportIssue}
                                                    isMobile={isMobile}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentForms.map((form) => (
                                                <ModernFormGridCard
                                                    key={form.id}
                                                    form={form}
                                                    selectMode={selectMode}
                                                    selectedForms={selectedForms}
                                                    toggleSelectForm={toggleSelectForm}
                                                    formatDate={(date) => formatDate(date, true)}
                                                    formatFileSize={formatFileSize}
                                                    getCategoryColor={getCategoryColor}
                                                    getAgencyIcon={getAgencyIcon}
                                                    getFileTypeIcon={getFileTypeIcon}
                                                    getFileTypeColor={getFileTypeColor}
                                                    truncateText={truncateText}
                                                    onCopyLink={handleCopyLink}
                                                    onCopyTitle={handleCopyTitle}
                                                    onViewDetails={handleViewDetails}
                                                    onDownload={handleDownloadForm}
                                                    onGenerateReport={handleGenerateReport}
                                                    onReportIssue={handleReportIssue}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {viewMode === 'list' && !isMobile && (
                                <ModernFormTable
                                    forms={currentForms}
                                    selectMode={selectMode}
                                    selectedForms={selectedForms}
                                    toggleSelectForm={toggleSelectForm}
                                    selectAllForms={selectAllForms}
                                    formatDate={formatDateTime}
                                    formatFileSize={formatFileSize}
                                    getCategoryColor={getCategoryColor}
                                    getAgencyIcon={getAgencyIcon}
                                    getFileTypeIcon={getFileTypeIcon}
                                    getFileTypeColor={getFileTypeColor}
                                    truncateText={truncateText}
                                    onCopyLink={handleCopyLink}
                                    onCopyTitle={handleCopyTitle}
                                    onViewDetails={handleViewDetails}
                                    onDownload={handleDownloadForm}
                                    onGenerateReport={handleGenerateReport}
                                    onReportIssue={handleReportIssue}
                                />
                            )}
                            
                            {forms.last_page > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={forms.current_page}
                                        lastPage={forms.last_page}
                                        onPageChange={handlePageChange}
                                        loading={loading}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' }
                ]}
            >
                <Head title="Forms Catalog" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {pageProps.error}
                            </p>
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
        <>
            <Head title="Forms Catalog" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'Forms Catalog', href: '/portal/forms' }
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
                            <div>
                                <h1 className="text-xl font-bold">Forms Catalog</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total} form{stats.total !== 1 ? 's' : ''} available
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8 px-2 rounded-lg"
                                >
                                    {showStats ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMobileFilters(true)}
                                    className="h-8 px-2 rounded-lg relative"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                    Forms Catalog
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Browse and download official forms from various agencies
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="gap-2 rounded-xl"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="gap-2 rounded-xl"
                                >
                                    <Download className="h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats Section */}
                    {showStats && (
                        <div className="animate-slide-down">
                            <CollapsibleStats
                                showStats={showStats}
                                setShowStats={setShowStats}
                                stats={stats}
                                formatNumber={formatNumber}
                            />
                            <DesktopStats
                                stats={stats}
                                formatNumber={formatNumber}
                            />
                        </div>
                    )}
                    
                    {/* Mobile Filter Modal */}
                    <ModernFilterModal
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        title="Filter Forms"
                        description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchClear={handleSearchClear}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                    >
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>
                            <ModernSelect
                                value={categoryFilter}
                                onValueChange={handleCategoryChange}
                                placeholder="All categories"
                                options={categories.map(category => ({
                                    value: category,
                                    label: category
                                }))}
                                disabled={loading}
                                icon={Tag}
                            />
                        </div>

                        {/* Agency Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Issuing Agency
                            </label>
                            <ModernSelect
                                value={agencyFilter}
                                onValueChange={handleAgencyChange}
                                placeholder="All agencies"
                                options={agencies.map(agency => ({
                                    value: agency,
                                    label: agency
                                }))}
                                disabled={loading}
                                icon={Building}
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort By
                            </label>
                            <ModernSelect
                                value={sortBy}
                                onValueChange={handleSortChange}
                                placeholder="Sort by"
                                options={SORT_OPTIONS}
                                disabled={loading}
                                icon={ArrowUpDown}
                            />
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort Order
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={sortOrder === 'asc' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setSortOrder('asc');
                                        updateFilters({ sort_order: 'asc', page: '1' });
                                    }}
                                    className="rounded-lg"
                                >
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Ascending
                                </Button>
                                <Button
                                    variant={sortOrder === 'desc' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setSortOrder('desc');
                                        updateFilters({ sort_order: 'desc', page: '1' });
                                    }}
                                    className="rounded-lg"
                                >
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Descending
                                </Button>
                            </div>
                        </div>
                    </ModernFilterModal>
                    
                    {/* Desktop Filters */}
                    {!isMobile && (
                        <ModernFormFilters
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={handleCategoryChange}
                            agencyFilter={agencyFilter}
                            handleAgencyChange={handleAgencyChange}
                            sortBy={sortBy}
                            handleSortChange={handleSortChange}
                            sortOrder={sortOrder}
                            handleSortOrderToggle={handleSortOrderToggle}
                            loading={loading}
                            categories={categories}
                            agencies={agencies}
                            sortOptions={SORT_OPTIONS}
                            printForms={handlePrint}
                            exportToCSV={handleExport}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            onCopySummary={handleCopySummary}
                            onEmailSummary={handleEmailSummary}
                        />
                    )}
                    
                    {/* Custom Tabs Section */}
                    <div className="mt-4">
                        <CustomTabs
                            key="form-tabs"
                            statusFilter={activeTab}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status)}
                            tabsConfig={FORM_TABS}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Loading Overlay */}
                <ModernLoadingOverlay loading={loading} message="Loading forms..." />
            </ResidentLayout>
        </>
    );
}