import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    Zap,
    Loader2,
    CheckCircle,
    XCircle,
    X,
    Share2,
    Printer,
    Mail,
    FilterX,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    PlayCircle,
    PauseCircle,
    Target,
    Plus,
    FileType,
    FolderOpen,
    Users,
    Shield,
    Building2,
    AlertTriangle,
} from 'lucide-react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';
import { route } from 'ziggy-js';

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

// Helper functions
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy');
    } catch (error) {
        return 'N/A';
    }
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM dd, yyyy HH:mm');
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
};

const getAgencyIcon = (agency: string) => {
    if (!agency) return <Building className="h-4 w-4" />;
    if (agency.includes('Mayor')) return <Building2 className="h-4 w-4" />;
    if (agency.includes('DSWD')) return <Users className="h-4 w-4" />;
    if (agency.includes('PNP') || agency.includes('Police')) return <Shield className="h-4 w-4" />;
    if (agency.includes('Health')) return <AlertTriangle className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
};

const getFileTypeIcon = (fileType: string) => {
    if (!fileType) return <FileType className="h-4 w-4 text-gray-500" />;
    if (fileType.includes('pdf')) return <FileType className="h-4 w-4 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <BarChart className="h-4 w-4 text-green-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
};

const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Inline MobileFormCard Component
const MobileFormCard = ({ 
    form,
    formatDate,
    formatFileSize,
    getCategoryColor,
    getAgencyIcon,
    getFileTypeIcon,
    truncateText
}: any) => (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {getFileTypeIcon(form.file_type)}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {truncateText(form.title, 40)}
                            </h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {truncateText(form.description, 80)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Category</p>
                        <Badge variant="outline" className={getCategoryColor(form.category)}>
                            {form.category}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Agency</p>
                        <div className="flex items-center gap-2">
                            {getAgencyIcon(form.issuing_agency)}
                            <span className="truncate">{form.issuing_agency}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Downloads</p>
                        <p className="font-medium flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {form.download_count}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">File Size</p>
                        <p className="font-medium">{formatFileSize(form.file_size)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                        href={route('resident.forms.show', form.id)}
                        className="flex-1"
                    >
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                    <div className="flex gap-1 ml-2">
                        <Button 
                            size="sm" 
                            variant="default"
                            asChild
                        >
                            <Link href={`/forms/${form.id}/download`}>
                                <Download className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Inline DesktopGridViewCard Component
const DesktopGridViewCard = ({ 
    form,
    formatDate,
    formatFileSize,
    getCategoryColor,
    getAgencyIcon,
    getFileTypeIcon,
    truncateText
}: any) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow h-full">
        <div className="p-4 h-full flex flex-col">
            <div className="space-y-3 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {getFileTypeIcon(form.file_type)}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate" title={form.title}>
                                {truncateText(form.title, 60)}
                            </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3" title={form.description}>
                            {truncateText(form.description, 120)}
                        </p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={getCategoryColor(form.category)}>
                        {form.category}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        {getAgencyIcon(form.issuing_agency)}
                        <span className="truncate max-w-[100px]" title={form.issuing_agency}>
                            {truncateText(form.issuing_agency, 15)}
                        </span>
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Downloads</p>
                            <p className="font-bold">{form.download_count.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">File Size</p>
                        <p className="font-bold">{formatFileSize(form.file_size)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">File Type</p>
                        <p className="font-medium">{form.file_type}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Uploaded</p>
                        <p className="font-medium">{formatDate(form.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 mt-4 border-t border-gray-100 dark:border-gray-700">
                <Link href={route('resident.forms.show', form.id)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                </Link>
                <Button 
                    size="sm" 
                    variant="default" 
                    asChild
                    className="flex-1"
                >
                    <Link href={`/forms/${form.id}/download`}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Link>
                </Button>
            </div>
        </div>
    </div>
);

// Inline StatsSection Component
const StatsSection = ({ 
    stats,
    isMobile,
    showStats,
    setShowStats
}: any) => {
    if (isMobile) {
        return (
            <div className="md:hidden">
                <Button 
                    variant="outline" 
                    className="w-full justify-between bg-white dark:bg-gray-800"
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
                    <div className="mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                Total Forms
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                                {stats.total.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                                Downloads
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                                {stats.downloads.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                            <Download className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                                Categories
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                                {stats.categories_count}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                            <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                                Agencies
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                                {stats.agencies_count}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                                            <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hidden md:grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Total Forms
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                Total Downloads
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats.downloads.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                            <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                Categories
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats.categories_count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.popular_categories?.[0]?.category || 'Various'} category is most popular
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                            <FolderOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                Issuing Agencies
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats.agencies_count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.popular_agencies?.[0]?.agency || 'Various'} agency is most active
                            </p>
                        </div>
                        <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                            <Building className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Inline FiltersSection Component
const FiltersSection = ({ 
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    categoryFilter,
    handleCategoryChange,
    agencyFilter,
    handleAgencyChange,
    sortBy,
    handleSortChange,
    sortOrder,
    handleSortOrderToggle,
    loading,
    categories,
    agencies,
    hasActiveFilters,
    handleClearFilters,
    isMobile,
    setShowFilters
}: any) => (
    <Card>
        <CardContent className="p-4">
            <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search forms by title, description, category, or agency..."
                        className="pl-10 pr-10 bg-white dark:bg-gray-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={handleSearchClear}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={agencyFilter} onValueChange={handleAgencyChange}>
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Issuing Agency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agencies</SelectItem>
                                {agencies.map(agency => (
                                    <SelectItem key={agency} value={agency}>
                                        {agency}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">Title (A-Z)</SelectItem>
                                <SelectItem value="created_at">Newest First</SelectItem>
                                <SelectItem value="download_count">Most Downloaded</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="issuing_agency">Agency</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0"
                            onClick={handleSortOrderToggle}
                        >
                            {sortOrder === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-red-600 hover:text-red-700"
                            >
                                <FilterX className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                        
                        {isMobile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(false)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
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
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
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
        
        router.get('/forms', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        updateFilters({ 
            category: category === 'all' ? '' : category,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleAgencyChange = (agency: string) => {
        setAgencyFilter(agency);
        updateFilters({ 
            agency: agency === 'all' ? '' : agency,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
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
        
        router.get('/forms', {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
        
        if (isMobile) setShowFilters(false);
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
    
    // Utility functions
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Export functions
    const printForms = () => {
        if (forms.data.length === 0) {
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
                <title>Available Forms Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .forms-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .forms-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .forms-table td { padding: 10px; border: 1px solid #ddd; }
                    .category-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Available Forms Report</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Total Forms:</strong> ${forms.data.length}</p>
                            <p><strong>Total Downloads:</strong> ${stats.downloads.toLocaleString()}</p>
                        </div>
                        <div>
                            <p><strong>Categories:</strong> ${stats.categories_count}</p>
                            <p><strong>Agencies:</strong> ${stats.agencies_count}</p>
                        </div>
                    </div>
                </div>
                
                <table class="forms-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Issuing Agency</th>
                            <th>Downloads</th>
                            <th>File Size</th>
                            <th>Uploaded</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${forms.data.map(form => `
                            <tr>
                                <td>${form.title}</td>
                                <td><span class="category-badge">${form.category}</span></td>
                                <td>${form.issuing_agency}</td>
                                <td>${form.download_count.toLocaleString()}</td>
                                <td>${formatFileSize(form.file_size)}</td>
                                <td>${formatDate(form.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Forms Portal</p>
                    <p>Page 1 of 1</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    
    const exportToCSV = () => {
        if (forms.data.length === 0) {
            toast.error('No forms to export');
            return;
        }
        
        const headers = ['Title', 'Description', 'Category', 'Issuing Agency', 'File Name', 'File Type', 'File Size', 'Downloads', 'Upload Date'];
        
        const csvData = forms.data.map(form => [
            `"${form.title.replace(/"/g, '""')}"`,
            `"${(form.description || '').replace(/"/g, '""')}"`,
            form.category,
            form.issuing_agency,
            form.file_name,
            form.file_type,
            formatFileSize(form.file_size),
            form.download_count.toString(),
            formatDate(form.created_at)
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
        
        toast.success('CSV file downloaded successfully');
    };
    
    const shareForms = async () => {
        if (forms.data.length === 0) {
            toast.error('No forms to share');
            return;
        }

        const summary = `Available Forms Catalog:\n\n` +
            `Total Forms: ${forms.data.length}\n` +
            `Total Downloads: ${stats.downloads.toLocaleString()}\n` +
            `Categories: ${stats.categories_count}\n` +
            `Agencies: ${stats.agencies_count}\n\n` +
            `Most Popular Categories:\n` +
            (stats.popular_categories?.slice(0, 3).map(c => `• ${c.category}: ${c.count} forms`).join('\n') || 'No data') + '\n\n' +
            `Most Active Agencies:\n` +
            (stats.popular_agencies?.slice(0, 3).map(a => `• ${a.agency}: ${a.count} forms`).join('\n') || 'No data') + '\n\n' +
            `Browse all forms at: ${window.location.origin}/forms`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Available Forms Catalog',
                    text: summary,
                });
                toast.success('Shared successfully');
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(summary);
                toast.success('Summary copied to clipboard');
            } else {
                toast.error('Sharing not supported on this device');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                toast.error('Failed to share');
            }
        }
    };
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'Forms Catalog', href: '/forms' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Forms Catalog</h1>
                    </div>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
                            <h3 className="mt-4 text-lg font-semibold">Error</h3>
                            <p className="text-gray-500 mt-2">
                                {pageProps.error}
                            </p>
                            <Button 
                                className="mt-4"
                                onClick={() => window.location.href = '/dashboard'}
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
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'Forms Catalog', href: '/forms' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">Forms Catalog</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total.toLocaleString()} forms available
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8 px-2"
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
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-8 px-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={exportToCSV}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={printForms}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={shareForms}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            const body = `
Hello,

Here's a summary of available forms:

Total Forms: ${stats.total}
Total Downloads: ${stats.downloads.toLocaleString()}
Categories: ${stats.categories_count}
Agencies: ${stats.agencies_count}

Most Popular Categories:
${stats.popular_categories?.slice(0, 3).map(c => `• ${c.category}: ${c.count} forms`).join('\n') || 'No data'}

Most Active Agencies:
${stats.popular_agencies?.slice(0, 3).map(a => `• ${a.agency}: ${a.count} forms`).join('\n') || 'No data'}

Browse all forms at: ${window.location.origin}/forms

This summary was generated from the Barangay Forms Portal.

Best regards,
Forms Catalog System
                                            `.trim();
                                            const subject = `Forms Catalog Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        }}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="gap-2"
                                    >
                                        <Grid className="h-4 w-4" />
                                        Grid
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="gap-2"
                                    >
                                        <List className="h-4 w-4" />
                                        List
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats */}
                    <StatsSection 
                        stats={stats}
                        isMobile={isMobile}
                        showStats={showStats}
                        setShowStats={setShowStats}
                    />
                    
                    {/* Filters */}
                    {(showFilters || !isMobile) && (
                        <FiltersSection
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
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            isMobile={isMobile}
                            setShowFilters={setShowFilters}
                        />
                    )}
                    
                    {/* Forms List Header */}
                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Available Forms
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {forms.total > 0 
                                        ? `Showing ${forms.from} to ${forms.to} of ${forms.total} forms`
                                        : 'No forms found'}
                                    {hasActiveFilters && ' (filtered)'}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {forms.current_page} of {forms.last_page}
                                </div>
                                
                                {/* Mobile View Mode Toggle */}
                                {isMobile && forms.total > 0 && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="flex-1"
                                        >
                                            <Grid className="h-4 w-4 mr-2" />
                                            Grid
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="flex-1"
                                        >
                                            <List className="h-4 w-4 mr-2" />
                                            List
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {forms.total === 0 ? (
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="py-12 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        No forms found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        {hasActiveFilters 
                                            ? 'Try adjusting your filters or search criteria'
                                            : 'There are currently no forms available'}
                                    </p>
                                    {hasActiveFilters && (
                                        <Button variant="outline" onClick={handleClearFilters} size="sm">
                                            Clear Filters
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Grid View (Mobile & Desktop) */}
                                {viewMode === 'grid' && (
                                    <>
                                        {/* Mobile Grid View */}
                                        {isMobile && (
                                            <div className="pb-4">
                                                {forms.data.map((form) => (
                                                    <MobileFormCard 
                                                        key={form.id} 
                                                        form={form}
                                                        formatDate={formatDate}
                                                        formatFileSize={formatFileSize}
                                                        getCategoryColor={getCategoryColor}
                                                        getAgencyIcon={getAgencyIcon}
                                                        getFileTypeIcon={getFileTypeIcon}
                                                        truncateText={truncateText}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Desktop Grid View */}
                                        {!isMobile && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {forms.data.map((form) => (
                                                    <DesktopGridViewCard 
                                                        key={form.id} 
                                                        form={form}
                                                        formatDate={formatDate}
                                                        formatFileSize={formatFileSize}
                                                        getCategoryColor={getCategoryColor}
                                                        getAgencyIcon={getAgencyIcon}
                                                        getFileTypeIcon={getFileTypeIcon}
                                                        truncateText={truncateText}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {/* List/Table View (Desktop) */}
                                {viewMode === 'list' && !isMobile && (
                                    <Card className="border border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Form Details</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead>Agency</TableHead>
                                                            <TableHead>Downloads</TableHead>
                                                            <TableHead>File Info</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {forms.data.map((form) => (
                                                            <TableRow key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            {getFileTypeIcon(form.file_type)}
                                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                                {truncateText(form.title, 60)}
                                                                            </h4>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                            {truncateText(form.description, 100)}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                            Uploaded: {formatDateTime(form.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={getCategoryColor(form.category)}>
                                                                        {form.category}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        {getAgencyIcon(form.issuing_agency)}
                                                                        <span className="truncate max-w-[120px]" title={form.issuing_agency}>
                                                                            {form.issuing_agency}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="space-y-1">
                                                                        <div className="text-sm font-medium">
                                                                            {form.download_count.toLocaleString()}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            downloads
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            {getFileTypeIcon(form.file_type)}
                                                                            <span className="text-sm truncate max-w-[120px]" title={form.file_name}>
                                                                                {truncateText(form.file_name, 20)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {formatFileSize(form.file_size)} • {form.file_type}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex justify-end gap-1">
                                                                        <Link href={`/forms/${form.id}`}>
                                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="default"
                                                                            asChild
                                                                        >
                                                                            <Link href={`/forms/${form.id}/download`}>
                                                                                <Download className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {/* Pagination */}
                                {forms.last_page > 1 && (
                                    <div className="mt-4 md:mt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Page {forms.current_page} of {forms.last_page}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateFilters({ page: (forms.current_page - 1).toString() })}
                                                    disabled={forms.current_page <= 1 || loading}
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateFilters({ page: (forms.current_page + 1).toString() })}
                                                    disabled={forms.current_page >= forms.last_page || loading}
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                
                {/* Mobile Footer */}
                <div className="md:hidden">
                    <ResidentMobileFooter />
                </div>
                
                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-sm">Loading forms...</p>
                        </div>
                    </div>
                )}
            </ResidentLayout>
        </>
    );
}