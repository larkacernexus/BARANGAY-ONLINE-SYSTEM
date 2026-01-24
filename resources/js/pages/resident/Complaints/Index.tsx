import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ComplaintTabs } from '@/components/residentui/ComplaintTabs'; // Changed to external component

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
    Zap
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

// Status configuration - MATCHING CLEARANCES PATTERN
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
    resolved: { 
        label: 'Resolved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle
    },
    dismissed: { 
        label: 'Dismissed', 
        color: 'bg-gray-100 dark:bg-gray-800', 
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: XCircle
    },
};

// Priority configuration
const PRIORITY_CONFIG = {
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

interface Complaint {
    id: number;
    complaint_number: string;
    type: string;
    subject: string;
    description: string;
    location: string;
    incident_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    evidence_files: Array<{
        name: string;
        path: string;
        type: string;
        size: number;
    }> | null;
    admin_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    formatted_created_at: string;
    formatted_incident_date: string;
    formatted_resolved_date?: string;
    days_since_created: number;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id?: number;
}

interface PageProps extends Record<string, any> {
    complaints?: {
        data: Complaint[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_complaints: number;
        pending_complaints: number;
        under_review_complaints: number;
        resolved_complaints: number;
        dismissed_complaints: number;
        satisfaction_rate: number;
        average_resolution_time: number;
        current_month_total: number;
        current_month_resolved: number;
        by_type: Record<string, number>;
        by_priority: Record<string, number>;
    };
    availableYears?: number[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: Household;
    filters?: {
        search?: string;
        status?: string;
        priority?: string;
        year?: string;
        type?: string;
        page?: string;
    };
    error?: string;
}

// Inline StatusBadge Component - MATCHING CLEARANCES PATTERN
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

// Inline PriorityBadge Component - MATCHING CLEARANCES PATTERN
const PriorityBadge = ({ priority }: { priority: string }) => {
    const priorityKey = priority as keyof typeof PRIORITY_CONFIG;
    const config = PRIORITY_CONFIG[priorityKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700">
                {priority}
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

// Inline MobileComplaintCard Component - MATCHING CLEARANCES PATTERN
const MobileComplaintCard = ({ 
    complaint,
    selectMode,
    selectedComplaints,
    toggleSelectComplaint,
    getComplaintTypeDisplay,
    formatDate,
    copyComplaintNumber,
    currentResident
}: any) => (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {selectMode && (
                        <button
                            onClick={() => toggleSelectComplaint(complaint.id)}
                            className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                selectedComplaints.includes(complaint.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {selectedComplaints.includes(complaint.id) && (
                                <Check className="h-3 w-3 text-white" />
                            )}
                        </button>
                    )}
                    
                    <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => copyComplaintNumber(complaint.complaint_number)}
                                className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                title="Copy complaint number"
                            >
                                #{complaint.complaint_number}
                            </button>
                            {complaint.is_anonymous && (
                                <Badge variant="outline" size="sm" className="h-5 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Anonymous
                                </Badge>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {complaint.subject}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {complaint.location}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <PriorityBadge priority={complaint.priority} />
                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Type</p>
                        <p className="font-medium capitalize flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {getComplaintTypeDisplay(complaint.type)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(complaint.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                        href={`/my-complaints/${complaint.id}`} 
                        className="flex-1"
                    >
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                    <div className="flex gap-1 ml-2">
                        <Link href={`/my-complaints/${complaint.id}?tab=messages`}>
                            <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </Link>
                        {complaint.status === 'resolved' && (
                            <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => toast.info('Submit feedback for this resolved complaint')}
                            >
                                <ThumbsUp className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Inline DesktopGridViewCard Component - MATCHING CLEARANCES PATTERN
const DesktopGridViewCard = ({ 
    complaint,
    selectMode,
    selectedComplaints,
    toggleSelectComplaint,
    getComplaintTypeDisplay,
    formatDate,
    copyComplaintNumber,
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
                                onClick={() => toggleSelectComplaint(complaint.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedComplaints.includes(complaint.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedComplaints.includes(complaint.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => copyComplaintNumber(complaint.complaint_number)}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                    title="Copy complaint number"
                                >
                                    #{complaint.complaint_number}
                                </button>
                                {complaint.is_anonymous && (
                                    <Badge variant="outline" size="sm" className="h-5 text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Anonymous
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {complaint.subject}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <PriorityBadge priority={complaint.priority} />
                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{complaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {getComplaintTypeDisplay(complaint.type)}
                        </span>
                    </div>
                </div>

                {/* Description preview */}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {complaint.description}
                    </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Incident Date</p>
                        <p className="font-medium">{formatDate(complaint.incident_date)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium">{formatDate(complaint.created_at)}</p>
                    </div>
                    {complaint.resolved_at && (
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Resolved Date</p>
                            <p className="font-medium text-green-600">{formatDate(complaint.resolved_at)}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Evidence</p>
                        <p className="font-medium">
                            {complaint.evidence_files?.length || 0} file{(complaint.evidence_files?.length || 0) !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link href={`/my-complaints/${complaint.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                    <Link href={`/my-complaints/${complaint.id}?tab=messages`} className="flex-1">
                        <Button size="sm" variant="default" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

// Inline CollapsibleStats Component - MATCHING CLEARANCES PATTERN
const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    statusFilter, 
    stats, 
    complaints, 
    getStatusCount
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
                                        Total
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.total_complaints}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                    <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                                        {getStatusCount('resolved')}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Under Review
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {getStatusCount('under_review')}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Satisfaction
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.satisfaction_rate}%
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                    <ThumbsUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
    </div>
);

// Inline DesktopStats Component - MATCHING CLEARANCES PATTERN
const DesktopStats = ({ 
    statusFilter, 
    stats, 
    complaints, 
    getStatusCount
}: any) => (
    <div className="hidden md:grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Total Complaints
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.total_complaints}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                            {getStatusCount('resolved')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round((getStatusCount('resolved') / (stats.total_complaints || 1)) * 100)}% of total
                        </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Under Review
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {getStatusCount('under_review')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Avg: {stats.average_resolution_time} days
                        </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Satisfaction Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.satisfaction_rate}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Based on resolved complaints
                        </p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                        <ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

// Inline FiltersSection Component - MATCHING CLEARANCES PATTERN
const FiltersSection = ({ 
    search,
    setSearch,
    handleSearchSubmit,
    handleSearchClear,
    statusFilter,
    handleStatusChange,
    priorityFilter,
    handlePriorityChange,
    typeFilter,
    handleTypeChange,
    yearFilter,
    handleYearChange,
    loading,
    availableYears,
    printComplaints,
    exportToCSV,
    isExporting,
    getCurrentTabComplaints,
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
                        placeholder="Search by complaint number, subject, description..."
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
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={handlePriorityChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="noise_complaint">Noise Complaint</SelectItem>
                                <SelectItem value="property_dispute">Property Dispute</SelectItem>
                                <SelectItem value="sanitation_issue">Sanitation Issue</SelectItem>
                                <SelectItem value="security_concern">Security Concern</SelectItem>
                                <SelectItem value="neighbor_dispute">Neighbor Dispute</SelectItem>
                                <SelectItem value="public_safety">Public Safety</SelectItem>
                                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={yearFilter} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[120px] h-9">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

export default function MyComplaints() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const complaints = pageProps.complaints || {
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
        total_complaints: 0,
        pending_complaints: 0,
        under_review_complaints: 0,
        resolved_complaints: 0,
        dismissed_complaints: 0,
        satisfaction_rate: 0,
        average_resolution_time: 0,
        current_month_total: 0,
        current_month_resolved: 0,
        by_type: {},
        by_priority: {},
    };
    
    const availableYears = pageProps.availableYears || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const household = pageProps.household || { id: 0, household_number: '', head_of_family: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [yearFilter, setYearFilter] = useState(filters.year || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState(false);
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
            setPriorityFilter(filters.priority || 'all');
            setTypeFilter(filters.type || 'all');
            setYearFilter(filters.year || 'all');
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
        
        router.get('/my-complaints', cleanFilters, {
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
    
    const handlePriorityChange = (priority: string) => {
        setPriorityFilter(priority);
        updateFilters({ 
            priority: priority === 'all' ? '' : priority,
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
    
    const handleYearChange = (year: string) => {
        setYearFilter(year);
        updateFilters({ 
            year: year === 'all' ? '' : year,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setTypeFilter('all');
        setYearFilter('all');
        
        router.get('/my-complaints', {}, {
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
    const toggleSelectComplaint = (id: number) => {
        setSelectedComplaints(prev =>
            prev.includes(id)
                ? prev.filter(complaintId => complaintId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllComplaints = () => {
        const currentComplaints = getCurrentTabComplaints();
        if (selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0) {
            setSelectedComplaints([]);
        } else {
            setSelectedComplaints(currentComplaints.map(c => c.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedComplaints([]);
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
    
    const getComplaintTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = {
            noise_complaint: 'Noise Complaint',
            property_dispute: 'Property Dispute',
            sanitation_issue: 'Sanitation Issue',
            security_concern: 'Security Concern',
            neighbor_dispute: 'Neighbor Dispute',
            public_safety: 'Public Safety',
            infrastructure: 'Infrastructure',
            other: 'Other'
        };
        return typeMap[type] || type.replace('_', ' ');
    };
    
    // Get status count from global stats
    const getStatusCount = (status: string) => {
        switch(status) {
            case 'all': 
                return stats.total_complaints || 0;
            case 'pending': 
                return stats.pending_complaints || 0;
            case 'under_review': 
                return stats.under_review_complaints || 0;
            case 'resolved': 
                return stats.resolved_complaints || 0;
            case 'dismissed': 
                return stats.dismissed_complaints || 0;
            default: 
                return 0;
        }
    };
    
    // Get current tab complaints
    const getCurrentTabComplaints = () => {
        return complaints.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Print function
    const printComplaints = () => {
        const currentComplaints = getCurrentTabComplaints();
        if (currentComplaints.length === 0) {
            toast.error('No complaints to print');
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
                <title>My Complaints Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .complaint-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .complaint-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .complaint-table td { padding: 10px; border: 1px solid #ddd; }
                    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .badge-pending { background-color: #fef3c7; color: #92400e; }
                    .badge-under_review { background-color: #dbeafe; color: #1e40af; }
                    .badge-resolved { background-color: #d1fae5; color: #065f46; }
                    .badge-dismissed { background-color: #f3f4f6; color: #374151; }
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
                    <h1>My Complaints Report</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Total Complaints:</strong> ${currentComplaints.length}</p>
                            <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p><strong>Household:</strong> ${household?.household_number || 'N/A'}</p>
                            <p><strong>Head of Family:</strong> ${household?.head_of_family || 'N/A'}</p>
                            <p><strong>Satisfaction Rate:</strong> ${stats.satisfaction_rate}%</p>
                        </div>
                    </div>
                </div>
                
                <table class="complaint-table">
                    <thead>
                        <tr>
                            <th>Complaint No.</th>
                            <th>Type</th>
                            <th>Subject</th>
                            <th>Date Filed</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentComplaints.map(complaint => `
                            <tr>
                                <td>${complaint.complaint_number}</td>
                                <td>${getComplaintTypeDisplay(complaint.type)}</td>
                                <td>${complaint.subject}</td>
                                <td>${formatDate(complaint.created_at)}</td>
                                <td><span class="badge badge-${complaint.priority}">${complaint.priority.toUpperCase()}</span></td>
                                <td><span class="badge badge-${complaint.status}">${complaint.status.replace('_', ' ').toUpperCase()}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Complaint System</p>
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
        const currentComplaints = getCurrentTabComplaints();
        if (currentComplaints.length === 0) {
            toast.error('No complaints to export');
            return;
        }
        
        setIsExporting(true);
        
        const headers = ['Complaint No.', 'Type', 'Subject', 'Description', 'Location', 'Incident Date', 'Priority', 'Status', 'Date Filed', 'Resolved At', 'Anonymous'];
        
        const csvData = currentComplaints.map(complaint => [
            complaint.complaint_number,
            getComplaintTypeDisplay(complaint.type),
            `"${complaint.subject.replace(/"/g, '""')}"`,
            `"${complaint.description.replace(/"/g, '""')}"`,
            `"${complaint.location.replace(/"/g, '""')}"`,
            formatDate(complaint.incident_date),
            complaint.priority.toUpperCase(),
            complaint.status.replace('_', ' ').toUpperCase(),
            formatDate(complaint.created_at),
            complaint.resolved_at ? formatDate(complaint.resolved_at) : 'Not resolved',
            complaint.is_anonymous ? 'Yes' : 'No'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `complaints_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    };
    
    const shareComplaints = async () => {
        const currentComplaints = getCurrentTabComplaints();
        if (currentComplaints.length === 0) {
            toast.error('No complaints to share');
            return;
        }

        const summary = `My Complaints Summary:\n\n` +
            `Household: ${household?.household_number || 'N/A'}\n` +
            `Head of Family: ${household?.head_of_family || 'N/A'}\n\n` +
            `Total Complaints: ${currentComplaints.length}\n` +
            `Pending: ${currentComplaints.filter(c => c.status === 'pending').length}\n` +
            `Under Review: ${currentComplaints.filter(c => c.status === 'under_review').length}\n` +
            `Resolved: ${currentComplaints.filter(c => c.status === 'resolved').length}\n` +
            `Dismissed: ${currentComplaints.filter(c => c.status === 'dismissed').length}\n\n` +
            `Satisfaction Rate: ${stats.satisfaction_rate}%\n` +
            `Average Resolution Time: ${stats.average_resolution_time} days\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/my-complaints`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My Complaints Report',
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
    
    const copyComplaintNumber = (complaintNumber: string) => {
        navigator.clipboard.writeText(complaintNumber).then(() => {
            toast.success(`Copied: ${complaintNumber}`);
        }).catch(() => {
            toast.error('Failed to copy');
        });
    };
    
    const renderTabContent = () => {
        const currentComplaints = getCurrentTabComplaints();
        const tabHasData = currentComplaints.length > 0;
        
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
                                        {selectedComplaints.length} complaint{selectedComplaints.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllComplaints}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    {selectedComplaints.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${selectedComplaints.length} selected complaints?`)) {
                                                    toast.success(`Deleted ${selectedComplaints.length} complaints`);
                                                    setSelectedComplaints([]);
                                                    setSelectMode(false);
                                                }
                                            }}
                                            className="flex-1 sm:flex-none"
                                        >
                                            Delete Selected
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectMode(false);
                                            setSelectedComplaints([]);
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
                    
                    {/* Complaints List Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')} Complaints
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentComplaints.length} complaint${currentComplaints.length !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'complaints' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedComplaints.length > 0 && ` • ${selectedComplaints.length} selected`}
                                {(typeFilter !== 'all' || priorityFilter !== 'all' || yearFilter !== 'all' || search) && ' (filtered)'}
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
                                               statusFilter === 'resolved' ? CheckCircle :
                                               statusFilter === 'dismissed' ? XCircle : AlertCircle;
                                    return <Icon className="h-8 w-8 text-gray-400" />;
                                })()}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No {statusFilter === 'all' ? 'complaints' : statusFilter.replace('_', ' ')} found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters'
                                    : statusFilter === 'all' 
                                        ? 'You have no filed complaints'
                                        : `You have no ${statusFilter.replace('_', ' ')} complaints`}
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
                                            {currentComplaints.map((complaint) => (
                                                <MobileComplaintCard 
                                                    key={complaint.id} 
                                                    complaint={complaint}
                                                    selectMode={selectMode}
                                                    selectedComplaints={selectedComplaints}
                                                    toggleSelectComplaint={toggleSelectComplaint}
                                                    getComplaintTypeDisplay={getComplaintTypeDisplay}
                                                    formatDate={formatDate}
                                                    copyComplaintNumber={copyComplaintNumber}
                                                    currentResident={currentResident}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Grid View */}
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentComplaints.map((complaint) => (
                                                <DesktopGridViewCard 
                                                    key={complaint.id} 
                                                    complaint={complaint}
                                                    selectMode={selectMode}
                                                    selectedComplaints={selectedComplaints}
                                                    toggleSelectComplaint={toggleSelectComplaint}
                                                    getComplaintTypeDisplay={getComplaintTypeDisplay}
                                                    formatDate={formatDate}
                                                    copyComplaintNumber={copyComplaintNumber}
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
                                                            checked={selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0}
                                                            onChange={selectAllComplaints}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Complaint Details</TableHead>
                                                <TableHead>Type & Subject</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentComplaints.map((complaint) => (
                                                <TableRow key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedComplaints.includes(complaint.id)}
                                                                onChange={() => toggleSelectComplaint(complaint.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <button
                                                                    onClick={() => copyComplaintNumber(complaint.complaint_number)}
                                                                    className="font-mono text-sm font-medium hover:text-blue-600 transition-colors"
                                                                    title="Copy complaint number"
                                                                >
                                                                    #{complaint.complaint_number}
                                                                </button>
                                                                {complaint.is_anonymous && (
                                                                    <Badge variant="outline" size="sm" className="text-xs">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        Anonymous
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Location: {complaint.location}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                {getComplaintTypeDisplay(complaint.type)}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                {complaint.subject}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {complaint.description.substring(0, 50)}...
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Filed</p>
                                                                <p className="text-sm">{formatDate(complaint.created_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Incident</p>
                                                                <p className="text-sm">{formatDate(complaint.incident_date)}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <PriorityBadge priority={complaint.priority} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={complaint.status} />
                                                        {complaint.resolved_at && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Resolved: {formatDate(complaint.resolved_at)}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/my-complaints/${complaint.id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/my-complaints/${complaint.id}?tab=messages`}>
                                                                <Button size="sm" variant="default" className="h-8 w-8 p-0">
                                                                    <MessageSquare className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {complaint.status === 'resolved' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => toast.info('Submit feedback for this resolved complaint')}
                                                                >
                                                                    <ThumbsUp className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => copyComplaintNumber(complaint.complaint_number)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Complaint No.
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        const reportWindow = window.open('', '_blank');
                                                                        if (reportWindow) {
                                                                            reportWindow.document.write(`
                                                                                <h1>Complaint Details: ${complaint.complaint_number}</h1>
                                                                                <p><strong>Subject:</strong> ${complaint.subject}</p>
                                                                                <p><strong>Type:</strong> ${getComplaintTypeDisplay(complaint.type)}</p>
                                                                                <p><strong>Status:</strong> ${complaint.status}</p>
                                                                                <p><strong>Priority:</strong> ${complaint.priority}</p>
                                                                            `);
                                                                        }
                                                                    }}>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Report
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        Schedule Follow-up
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600" onClick={() => toast.info('Report issue feature would open a form')}>
                                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                                        Report Issue
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
                            {complaints.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page {complaints.current_page} of {complaints.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (complaints.current_page - 1).toString() })}
                                                disabled={complaints.current_page <= 1 || loading}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (complaints.current_page + 1).toString() })}
                                                disabled={complaints.current_page >= complaints.last_page || loading}
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
                    { title: 'My Complaints', href: '/my-complaints' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Complaints</h1>
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
            <Head title="My Complaints" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Complaints', href: '/my-complaints' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">My Complaints</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total_complaints} complaint{stats.total_complaints !== 1 ? 's' : ''} total
                                    {household && (
                                        <span className="block">
                                            Household: {household.household_number}
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
                                    My Complaints
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Track and manage your filed complaints
                                    {household && (
                                        <span className="block text-xs mt-1">
                                            Household: {household.household_number} • {household.head_of_family}
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
                                        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            {isExporting ? 'Exporting...' : 'Export as CSV'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={printComplaints}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={shareComplaints}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            const body = `
Hello,

Here's a summary of my complaints:

Total Complaints: ${getCurrentTabComplaints().length}
- Pending: ${getCurrentTabComplaints().filter(c => c.status === 'pending').length}
- Under Review: ${getCurrentTabComplaints().filter(c => c.status === 'under_review').length}
- Resolved: ${getCurrentTabComplaints().filter(c => c.status === 'resolved').length}
- Dismissed: ${getCurrentTabComplaints().filter(c => c.status === 'dismissed').length}

Satisfaction Rate: ${stats.satisfaction_rate}%
Average Resolution Time: ${stats.average_resolution_time} days

This summary was generated from the Barangay Complaint System.

Best regards,
${currentResident?.first_name} ${currentResident?.last_name}
                                            `.trim();
                                            const subject = `My Complaints Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        }}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={printComplaints} variant="outline" size="sm">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <Link href="/my-complaints/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Complaint</span>
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
                            statusFilter={statusFilter}
                            stats={stats}
                            complaints={getCurrentTabComplaints()}
                            getStatusCount={getStatusCount}
                        />
                    )}
                    {!isMobile && (
                        <DesktopStats 
                            statusFilter={statusFilter}
                            stats={stats}
                            complaints={getCurrentTabComplaints()}
                            getStatusCount={getStatusCount}
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
                            priorityFilter={priorityFilter}
                            handlePriorityChange={handlePriorityChange}
                            typeFilter={typeFilter}
                            handleTypeChange={handleTypeChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availableYears={availableYears}
                            printComplaints={printComplaints}
                            exportToCSV={exportToCSV}
                            isExporting={isExporting}
                            getCurrentTabComplaints={getCurrentTabComplaints}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={handleClearFilters}
                            isMobile={isMobile}
                            setShowFilters={setShowFilters}
                        />
                    )}
                    
                    {/* Custom Tabs Section - MATCHING CLEARANCES PATTERN */}
                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Complaint Records
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {complaints.current_page} of {complaints.last_page}
                                </div>
                            </div>
                        </div>
                        
                        {/* USING EXTERNAL COMPONENT LIKE CLEARANCES */}
                        <ComplaintTabs 
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
                        <Link href="/my-complaints/create">
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