import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ReportTabs } from '@/components/residentui/ReportTabs';

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
    MessageSquare,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    ThumbsUp,
    Shield,
    BarChart,
    ChevronRight,
    ChevronLeft,
    Download,
    Printer,
    FileText,
    Share2,
    Copy,
    Calendar,
    Mail,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    X,
    Check,
    Square,
    Grid,
    List,
    Filter,
    User,
    MapPin,
    FileCheck,
    Loader2,
    Zap,
    FileImage,
    Paperclip,
    Flag,
    AlertTriangle,
    Bell,
    TrendingUp
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
import { format } from 'date-fns';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Status configuration
const STATUS_CONFIG = {
    pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        textColor: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock
    },
    under_review: { 
        label: 'Under Review', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Loader2
    },
    in_progress: { 
        label: 'In Progress', 
        color: 'bg-indigo-100 dark:bg-indigo-900/30', 
        textColor: 'text-indigo-800 dark:text-indigo-300',
        icon: TrendingUp
    },
    resolved: { 
        label: 'Resolved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: XCircle
    },
};

// Priority/Urgency configuration
const URGENCY_CONFIG = {
    low: { 
        label: 'Low', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500'
    },
    medium: { 
        label: 'Medium', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        dot: 'bg-orange-500'
    },
    high: { 
        label: 'High', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500'
    },
};

interface ReportEvidence {
    id: number;
    report_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_by: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    file_url: string;
    is_image: boolean;
    is_video: boolean;
    is_pdf: boolean;
    formatted_size: string;
}

interface ReportType {
    id: number;
    name: string;
    category: string;
    description: string;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    priority_level: number;
    is_active: boolean;
}

interface CommunityReport {
    id: number;
    report_number: string;
    report_type_id: number;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    incident_time: string | null;
    urgency: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
    is_anonymous: boolean;
    reporter_name: string | null;
    reporter_contact: string | null;
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    report_type: ReportType;
    evidences_count: number;
    evidences?: ReportEvidence[];
    formatted_created_at: string;
    formatted_incident_date: string;
    formatted_resolved_date?: string;
    days_since_created: number;
}

interface Stats {
    total: number;
    resolved: number;
    pending: number;
}

interface FilterOptions {
    reportTypes: ReportType[];
    categories: string[];
    statuses: string[];
    priorities: string[];
}

interface PageProps extends Record<string, any> {
    reports?: {
        data: CommunityReport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: Stats;
    filterOptions?: FilterOptions;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    filters?: {
        search?: string;
        status?: string;
        category?: string;
        type?: string;
        priority?: string;
        page?: string;
    };
    error?: string;
}

// Inline StatusBadge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusKey = status as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[statusKey];
    
    if (!config) {
        return (
            <Badge className="bg-gray-100 text-gray-800 border-0 px-2 py-1 flex items-center gap-1">
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    }
    
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} ${config.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
};

// Inline UrgencyBadge Component
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const urgencyKey = urgency as keyof typeof URGENCY_CONFIG;
    const config = URGENCY_CONFIG[urgencyKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700">
                {urgency}
            </Badge>
        );
    }
    
    return (
        <Badge variant="outline" className={`${config.color} ${config.textColor} border-0 flex items-center`}>
            <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
            <span>{config.label}</span>
        </Badge>
    );
};

// Inline MobileReportCard Component
const MobileReportCard = ({ 
    report,
    selectMode,
    selectedReports,
    toggleSelectReport,
    formatDate,
    copyReportNumber,
    currentResident
}: any) => (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {selectMode && (
                        <button
                            onClick={() => toggleSelectReport(report.id)}
                            className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                selectedReports.includes(report.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {selectedReports.includes(report.id) && (
                                <Check className="h-3 w-3 text-white" />
                            )}
                        </button>
                    )}
                    
                    <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => copyReportNumber(report.report_number)}
                                className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                title="Copy report number"
                            >
                                #{report.report_number}
                            </button>
                            {report.is_anonymous && (
                                <Badge variant="outline" size="sm" className="h-5 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Anonymous
                                </Badge>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {report.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {report.location}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <UrgencyBadge urgency={report.urgency} />
                        <StatusBadge status={report.status} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium capitalize flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {report.report_type.category}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.created_at)}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Type</p>
                    <p className="font-medium text-sm">
                        {report.report_type.name}
                    </p>
                </div>

                {/* Evidence count */}
                <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">
                        {report.evidences_count || 0} evidence file{(report.evidences_count || 0) !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                        href={`/community-reports/${report.id}`} 
                        className="flex-1"
                    >
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

// Inline DesktopGridViewCard Component
const DesktopGridViewCard = ({ 
    report,
    selectMode,
    selectedReports,
    toggleSelectReport,
    formatDate,
    copyReportNumber,
    currentResident
}: any) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header with selection checkbox */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        {selectMode && (
                            <button
                                onClick={() => toggleSelectReport(report.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedReports.includes(report.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedReports.includes(report.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => copyReportNumber(report.report_number)}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                    title="Copy report number"
                                >
                                    #{report.report_number}
                                </button>
                                {report.is_anonymous && (
                                    <Badge variant="outline" size="sm" className="h-5 text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Anonymous
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {report.title}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <UrgencyBadge urgency={report.urgency} />
                        <StatusBadge status={report.status} />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Flag className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {report.report_type.category} • {report.report_type.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                            {report.evidences_count || 0} evidence file{(report.evidences_count || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Description preview */}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {report.description}
                    </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Incident Date</p>
                        <p className="font-medium">{formatDate(report.incident_date)}</p>
                        {report.incident_time && (
                            <p className="text-xs text-gray-500">{report.incident_time}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium">{formatDate(report.created_at)}</p>
                    </div>
                    {report.resolved_at && (
                        <div className="col-span-2">
                            <p className="text-gray-500 dark:text-gray-400">Resolved Date</p>
                            <p className="font-medium text-green-600">{formatDate(report.resolved_at)}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link href={`/community-reports/${report.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

// Inline CollapsibleStats Component
const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    stats
}: any) => (
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
                                        Total Reports
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                    <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                        Resolved
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.resolved}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                        Pending
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        In Progress
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.total - stats.resolved - stats.pending}
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
    </div>
);

// Inline DesktopStats Component
const DesktopStats = ({ stats }: any) => (
    <div className="hidden md:grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Total Reports
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.total}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <Flag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Resolved
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.resolved}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolved rate
                        </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            Pending
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.pending}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Awaiting review
                        </p>
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Active
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.total - stats.resolved - stats.pending}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Under review/in progress
                        </p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

// Inline FiltersSection Component
const FiltersSection = ({ 
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    statusFilter,
    handleStatusChange,
    urgencyFilter,
    handleUrgencyChange,
    typeFilter,
    handleTypeChange,
    categoryFilter,
    handleCategoryChange,
    loading,
    filterOptions,
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
                        placeholder="Search by report number, title, description..."
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
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={urgencyFilter} onValueChange={handleUrgencyChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Urgency</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>

                        {filterOptions?.categories && filterOptions.categories.length > 0 && (
                            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {filterOptions.categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {filterOptions?.reportTypes && filterOptions.reportTypes.length > 0 && (
                            <Select value={typeFilter} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue placeholder="Report Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {filterOptions.reportTypes.map(type => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-gray-500"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                        
                        {isMobile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(false)}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function CommunityReports() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const reports = pageProps.reports || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        links: [],
    };
    
    const stats = pageProps.stats || {
        total: 0,
        resolved: 0,
        pending: 0,
    };
    
    const filterOptions = pageProps.filterOptions || {
        reportTypes: [],
        categories: [],
        statuses: [],
        priorities: [],
    };
    
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.priority || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [selectMode, setSelectMode] = useState(false);
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
            setStatusFilter(filters.status || 'all');
            setUrgencyFilter(filters.priority || 'all');
            setTypeFilter(filters.type || 'all');
            setCategoryFilter(filters.category || 'all');
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
        
        router.get('/community-reports', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };
    
    const handleTabChange = (tab: string) => {
        setStatusFilter(tab);
        
        if (tab === 'all') {
            updateFilters({ 
                status: '',
                page: '1'
            });
        } else {
            updateFilters({ 
                status: tab,
                page: '1'
            });
        }
        
        if (isMobile) setShowFilters(false);
    };
    
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        updateFilters({ 
            status: status === 'all' ? '' : status,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleUrgencyChange = (urgency: string) => {
        setUrgencyFilter(urgency);
        updateFilters({ 
            priority: urgency === 'all' ? '' : urgency,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleTypeChange = (type: string) => {
        setTypeFilter(type);
        updateFilters({ 
            type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleCategoryChange = (category: string) => {
        setCategoryFilter(category);
        updateFilters({ 
            category: category === 'all' ? '' : category,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setUrgencyFilter('all');
        setTypeFilter('all');
        setCategoryFilter('all');
        
        router.get('/community-reports', {}, {
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
    
    // Selection mode functions
    const toggleSelectReport = (id: number) => {
        setSelectedReports(prev =>
            prev.includes(id)
                ? prev.filter(reportId => reportId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllReports = () => {
        const currentReports = getCurrentTabReports();
        if (selectedReports.length === currentReports.length && currentReports.length > 0) {
            setSelectedReports([]);
        } else {
            setSelectedReports(currentReports.map(r => r.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedReports([]);
        } else {
            setSelectMode(true);
        }
    };
    
    // Utility functions
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isMobile) {
                return format(date, 'MMM dd');
            }
            return format(date, 'MMM dd, yyyy');
        } catch (error) {
            return 'N/A';
        }
    };
    
    // Get status count from global stats
    const getStatusCount = (status: string) => {
        switch(status) {
            case 'all': 
                return stats.total || 0;
            case 'pending': 
                return stats.pending || 0;
            case 'resolved': 
                return stats.resolved || 0;
            default: 
                return 0;
        }
    };
    
    // Get current tab reports
    const getCurrentTabReports = () => {
        return reports.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Print function
    const printReports = () => {
        const currentReports = getCurrentTabReports();
        if (currentReports.length === 0) {
            toast.error('No reports to print');
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
                <title>Community Reports</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .report-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .report-table td { padding: 10px; border: 1px solid #ddd; }
                    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .badge-pending { background-color: #fef3c7; color: #92400e; }
                    .badge-under_review { background-color: #dbeafe; color: #1e40af; }
                    .badge-in_progress { background-color: #e0e7ff; color: #3730a3; }
                    .badge-resolved { background-color: #d1fae5; color: #065f46; }
                    .badge-rejected { background-color: #fee2e2; color: #991b1b; }
                    .badge-high { background-color: #fee2e2; color: #991b1b; }
                    .badge-medium { background-color: #fef3c7; color: #92400e; }
                    .badge-low { background-color: #d1fae5; color: #065f46; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Community Reports</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Total Reports:</strong> ${currentReports.length}</p>
                            <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p><strong>Resident:</strong> ${currentResident?.first_name || ''} ${currentResident?.last_name || ''}</p>
                            <p><strong>Date Range:</strong> All Time</p>
                        </div>
                    </div>
                </div>
                
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Report No.</th>
                            <th>Type</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date Filed</th>
                            <th>Evidence Files</th>
                            <th>Urgency</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentReports.map(report => `
                            <tr>
                                <td>${report.report_number}</td>
                                <td>${report.report_type.name}</td>
                                <td>${report.title}</td>
                                <td>${report.report_type.category}</td>
                                <td>${formatDate(report.created_at)}</td>
                                <td>${report.evidences_count || 0}</td>
                                <td><span class="badge badge-${report.urgency}">${report.urgency.toUpperCase()}</span></td>
                                <td><span class="badge badge-${report.status}">${report.status.replace('_', ' ').toUpperCase()}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Community Report System</p>
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
    
    // Export to CSV
    const exportToCSV = () => {
        const currentReports = getCurrentTabReports();
        if (currentReports.length === 0) {
            toast.error('No reports to export');
            return;
        }
        
        const headers = ['Report No.', 'Type', 'Category', 'Title', 'Description', 'Location', 'Incident Date', 'Incident Time', 'Evidence Files', 'Urgency', 'Status', 'Date Filed', 'Resolved At', 'Anonymous'];
        
        const csvData = currentReports.map(report => [
            report.report_number,
            report.report_type.name,
            report.report_type.category,
            `"${report.title.replace(/"/g, '""')}"`,
            `"${report.description.replace(/"/g, '""')}"`,
            `"${report.location.replace(/"/g, '""')}"`,
            formatDate(report.incident_date),
            report.incident_time || 'N/A',
            report.evidences_count || 0,
            report.urgency.toUpperCase(),
            report.status.replace('_', ' ').toUpperCase(),
            formatDate(report.created_at),
            report.resolved_at ? formatDate(report.resolved_at) : 'Not resolved',
            report.is_anonymous ? 'Yes' : 'No'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `community_reports_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('CSV file downloaded successfully');
    };
    
    const shareReports = async () => {
        const currentReports = getCurrentTabReports();
        if (currentReports.length === 0) {
            toast.error('No reports to share');
            return;
        }

        const summary = `Community Reports Summary:\n\n` +
            `Resident: ${currentResident?.first_name || ''} ${currentResident?.last_name || ''}\n\n` +
            `Total Reports: ${currentReports.length}\n` +
            `Pending: ${currentReports.filter(r => r.status === 'pending').length}\n` +
            `Under Review: ${currentReports.filter(r => r.status === 'under_review').length}\n` +
            `In Progress: ${currentReports.filter(r => r.status === 'in_progress').length}\n` +
            `Resolved: ${currentReports.filter(r => r.status === 'resolved').length}\n` +
            `Rejected: ${currentReports.filter(r => r.status === 'rejected').length}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/community-reports`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Community Reports Summary',
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
    
    const copyReportNumber = (reportNumber: string) => {
        navigator.clipboard.writeText(reportNumber).then(() => {
            toast.success(`Copied: ${reportNumber}`);
        }).catch(() => {
            toast.error('Failed to copy');
        });
    };
    
    const renderTabContent = () => {
        const currentReports = getCurrentTabReports();
        const tabHasData = currentReports.length > 0;
        
        return (
            <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 md:p-6">
                    {/* Selection Mode Banner */}
                    {selectMode && tabHasData && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="gap-1">
                                        <Square className="h-3 w-3" />
                                        Selection Mode
                                    </Badge>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllReports}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedReports.length === currentReports.length && currentReports.length > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectMode(false);
                                            setSelectedReports([]);
                                        }}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Reports List Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')} Reports
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${reports.from}-${reports.to} of ${reports.total} report${reports.total !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'reports' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedReports.length > 0 && ` • ${selectedReports.length} selected`}
                                {(typeFilter !== 'all' || urgencyFilter !== 'all' || categoryFilter !== 'all' || search) && ' (filtered)'}
                                {selectMode && ' • Selection Mode'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                {!selectMode && tabHasData && (
                                    <>
                                        <div className="hidden md:flex gap-2">
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectMode}
                                                className="gap-2"
                                            >
                                                <Square className="h-4 w-4" />
                                                Select
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {!tabHasData ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                {(() => {
                                    const Icon = statusFilter === 'all' ? AlertCircle : 
                                               statusFilter === 'pending' ? Clock :
                                               statusFilter === 'under_review' ? Loader2 :
                                               statusFilter === 'in_progress' ? TrendingUp :
                                               statusFilter === 'resolved' ? CheckCircle :
                                               statusFilter === 'rejected' ? XCircle : AlertCircle;
                                    return <Icon className="h-8 w-8 text-gray-400" />;
                                })()}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No {statusFilter === 'all' ? 'reports' : statusFilter.replace('_', ' ')} found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters'
                                    : statusFilter === 'all' 
                                        ? 'You have no submitted reports'
                                        : `You have no ${statusFilter.replace('_', ' ')} reports`}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={handleClearFilters} size="sm">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Mobile View Mode Toggle */}
                            {isMobile && tabHasData && !selectMode && (
                                <div className="mb-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="flex-1"
                                        >
                                            <Grid className="h-4 w-4 mr-2" />
                                            Grid View
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="flex-1"
                                        >
                                            <List className="h-4 w-4 mr-2" />
                                            List View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleSelectMode}
                                            className="flex-1"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Grid View (Mobile & Desktop) */}
                            {viewMode === 'grid' && (
                                <>
                                    {/* Mobile Grid View */}
                                    {isMobile && (
                                        <div className="pb-4">
                                            {currentReports.map((report) => (
                                                <MobileReportCard 
                                                    key={report.id} 
                                                    report={report}
                                                    selectMode={selectMode}
                                                    selectedReports={selectedReports}
                                                    toggleSelectReport={toggleSelectReport}
                                                    formatDate={formatDate}
                                                    copyReportNumber={copyReportNumber}
                                                    currentResident={currentResident}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Grid View */}
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentReports.map((report) => (
                                                <DesktopGridViewCard 
                                                    key={report.id} 
                                                    report={report}
                                                    selectMode={selectMode}
                                                    selectedReports={selectedReports}
                                                    toggleSelectReport={toggleSelectReport}
                                                    formatDate={formatDate}
                                                    copyReportNumber={copyReportNumber}
                                                    currentResident={currentResident}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* List/Table View (Mobile & Desktop) */}
                            {viewMode === 'list' && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {selectMode && (
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedReports.length === currentReports.length && currentReports.length > 0}
                                                            onChange={selectAllReports}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Report Details</TableHead>
                                                <TableHead>Type & Category</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Evidence</TableHead>
                                                <TableHead>Urgency</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentReports.map((report) => (
                                                <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedReports.includes(report.id)}
                                                                onChange={() => toggleSelectReport(report.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <button
                                                                    onClick={() => copyReportNumber(report.report_number)}
                                                                    className="font-mono text-sm font-medium hover:text-blue-600 transition-colors"
                                                                    title="Copy report number"
                                                                >
                                                                    #{report.report_number}
                                                                </button>
                                                                {report.is_anonymous && (
                                                                    <Badge variant="outline" size="sm" className="text-xs">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        Anonymous
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {report.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Location: {report.location}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                {report.report_type.category}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {report.report_type.name}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Filed</p>
                                                                <p className="text-sm">{formatDate(report.created_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Incident</p>
                                                                <p className="text-sm">{formatDate(report.incident_date)}</p>
                                                                {report.incident_time && (
                                                                    <p className="text-xs text-gray-500">{report.incident_time}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Paperclip className="h-3 w-3 text-gray-400" />
                                                            <span className="text-sm">{report.evidences_count || 0}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <UrgencyBadge urgency={report.urgency} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={report.status} />
                                                        {report.resolved_at && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Resolved: {formatDate(report.resolved_at)}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/community-reports/${report.id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => copyReportNumber(report.report_number)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Report No.
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        const reportWindow = window.open('', '_blank');
                                                                        if (reportWindow) {
                                                                            reportWindow.document.write(`
                                                                                <h1>Report Details: ${report.report_number}</h1>
                                                                                <p><strong>Title:</strong> ${report.title}</p>
                                                                                <p><strong>Type:</strong> ${report.report_type.name}</p>
                                                                                <p><strong>Category:</strong> ${report.report_type.category}</p>
                                                                                <p><strong>Status:</strong> ${report.status}</p>
                                                                                <p><strong>Urgency:</strong> ${report.urgency}</p>
                                                                                <p><strong>Evidence Files:</strong> ${report.evidences_count}</p>
                                                                            `);
                                                                        }
                                                                    }}>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Report
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {reports.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page {reports.current_page} of {reports.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (reports.current_page - 1).toString() })}
                                                disabled={reports.current_page <= 1 || loading}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (reports.current_page + 1).toString() })}
                                                disabled={reports.current_page >= reports.last_page || loading}
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
                </CardContent>
            </Card>
        );
    };
    
    if (pageProps.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'Community Reports', href: '/community-reports' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Community Reports</h1>
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
            <Head title="Community Reports" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'Community Reports', href: '/community-reports' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">Community Reports</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total} report{stats.total !== 1 ? 's' : ''} total
                                    {currentResident && (
                                        <span className="block">
                                            Resident: {currentResident.first_name} {currentResident.last_name}
                                        </span>
                                    )}
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
                                    Community Reports
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Submit and track community issues, incidents, and concerns
                                    {currentResident && (
                                        <span className="block text-xs mt-1">
                                            Resident: {currentResident.first_name} {currentResident.last_name}
                                        </span>
                                    )}
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
                                        <DropdownMenuItem onClick={printReports}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={shareReports}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={printReports} variant="outline" size="sm">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <Link href="/community-reports/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Report</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    
                    {/* Stats */}
                    {showStats && (
                        <CollapsibleStats 
                            showStats={showStats}
                            setShowStats={setShowStats}
                            stats={stats}
                        />
                    )}
                    {!isMobile && (
                        <DesktopStats 
                            stats={stats}
                        />
                    )}
                    
                    {/* Filters */}
                    {(showFilters || !isMobile) && (
                        <FiltersSection
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            statusFilter={statusFilter}
                            handleStatusChange={handleStatusChange}
                            urgencyFilter={urgencyFilter}
                            handleUrgencyChange={handleUrgencyChange}
                            typeFilter={typeFilter}
                            handleTypeChange={handleTypeChange}
                            categoryFilter={categoryFilter}
                            handleCategoryChange={handleCategoryChange}
                            loading={loading}
                            filterOptions={filterOptions}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            isMobile={isMobile}
                            setShowFilters={setShowFilters}
                        />
                    )}
                    
                    {/* Custom Tabs Section */}
                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Report Records
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {reports.current_page} of {reports.last_page}
                                </div>
                            </div>
                        </div>
                        
                        {/* USING EXTERNAL COMPONENT */}
                        <ReportTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCount}
                        />
                        
                        {/* Tab Content */}
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
                
                {/* Mobile FAB */}
                {isMobile && (
                    <div className="fixed bottom-24 right-6 z-50 safe-bottom">
                        <Link href="/community-reports/create">
                            <Button 
                                size="lg" 
                                className="rounded-full h-14 w-14 shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Mobile Footer */}
                <div className="md:hidden">
                    <ResidentMobileFooter />
                </div>
                
                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-sm">Loading...</p>
                        </div>
                    </div>
                )}
            </ResidentLayout>
        </>
    );
}