import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@/layouts/resident-app-layout';
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
    Search,
    Eye,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
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
    MoreVertical,
    ChevronDown,
    ChevronUp,
    X,
    Check,
    Square,
    Grid,
    List,
    Filter,
    MapPin,
    Paperclip,
    AlertCircle,
    Loader2,
    MessageSquare,
    Gavel,
    Scale
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
    under_investigation: { 
        label: 'Under Investigation', 
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

// Incident Type configuration
const INCIDENT_TYPES = {
    complaint: { 
        label: 'Complaint', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: MessageSquare
    },
    blotter: { 
        label: 'Blotter', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        icon: Gavel
    },
};

interface BlotterDetails {
    id: number;
    incident_id: number;
    respondent_name: string;
    hearing_date: string | null;
    created_at: string;
    updated_at: string;
}

interface Incident {
    id: number;
    incident_number?: string;
    title: string;
    description: string;
    type: 'complaint' | 'blotter';
    status: 'pending' | 'under_investigation' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    reported_as_name: string;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    blotter_details?: BlotterDetails;
    formatted_created_at?: string;
    formatted_resolved_date?: string;
    days_since_created?: number;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
}

interface Stats {
    total: number;
    pending: number;
    under_investigation: number;
    resolved: number;
    dismissed: number;
    by_type: Record<string, number>;
}

interface PageProps extends Record<string, any> {
    incidents?: {
        data: Incident[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: Stats;
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
        full_name?: string;
    };
    household?: Household;
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        year?: string;
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

// Inline TypeBadge Component
const TypeBadge = ({ type }: { type: string }) => {
    const typeKey = type as keyof typeof INCIDENT_TYPES;
    const config = INCIDENT_TYPES[typeKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700">
                {type}
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

// Inline MobileIncidentCard Component
const MobileIncidentCard = ({ 
    incident,
    selectMode,
    selectedIncidents,
    toggleSelectIncident,
    formatDate,
    currentResident
}: any) => (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {selectMode && (
                        <button
                            onClick={() => toggleSelectIncident(incident.id)}
                            className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                selectedIncidents.includes(incident.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {selectedIncidents.includes(incident.id) && (
                                <Check className="h-3 w-3 text-white" />
                            )}
                        </button>
                    )}
                    
                    <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                #{incident.id.toString().padStart(6, '0')}
                            </span>
                            {incident.is_anonymous && (
                                <Badge variant="outline" size="sm" className="h-5 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Anonymous
                                </Badge>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {incident.title}
                        </h4>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <TypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(incident.created_at)}
                        </p>
                    </div>
                    {incident.type === 'blotter' && incident.blotter_details && (
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Respondent</p>
                            <p className="font-medium truncate">
                                {incident.blotter_details.respondent_name}
                            </p>
                        </div>
                    )}
                </div>

                {/* Description preview */}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {incident.description}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                        href={`/my-incidents/${incident.id}`} 
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
    incident,
    selectMode,
    selectedIncidents,
    toggleSelectIncident,
    formatDate,
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
                                onClick={() => toggleSelectIncident(incident.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedIncidents.includes(incident.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedIncidents.includes(incident.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                    #{incident.id.toString().padStart(6, '0')}
                                </span>
                                {incident.is_anonymous && (
                                    <Badge variant="outline" size="sm" className="h-5 text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Anonymous
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {incident.title}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <TypeBadge type={incident.type} />
                        <StatusBadge status={incident.status} />
                    </div>
                </div>

                {/* Description preview */}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {incident.description}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">Filed as:</span>
                        <span className="font-medium">{incident.reported_as_name}</span>
                    </div>
                    {incident.type === 'blotter' && incident.blotter_details && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Respondent:</span>
                            <span className="font-medium">{incident.blotter_details.respondent_name}</span>
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Filed</p>
                        <p className="font-medium">{formatDate(incident.created_at)}</p>
                    </div>
                    {incident.resolved_at && (
                        <div className="col-span-2">
                            <p className="text-gray-500 dark:text-gray-400">Resolved Date</p>
                            <p className="font-medium text-green-600">{formatDate(incident.resolved_at)}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link href={`/my-incidents/${incident.id}`} className="flex-1">
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
                                        Total
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.total}
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
                                        {stats.resolved}
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
                                        Under Investigation
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats.under_investigation}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                            Total Incidents
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.total}
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
                            {stats.resolved}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% of total
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
                            Under Investigation
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.under_investigation}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
    </div>
);

// Inline IncidentTabs Component
const IncidentTabs = ({ 
    statusFilter,
    handleTabChange,
    getStatusCount
}: any) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 md:space-x-8 overflow-x-auto py-2">
            {[
                { key: 'all', label: 'All Incidents', icon: BarChart },
                { key: 'pending', label: 'Pending', icon: Clock },
                { key: 'under_investigation', label: 'Under Investigation', icon: Loader2 },
                { key: 'resolved', label: 'Resolved', icon: CheckCircle },
                { key: 'dismissed', label: 'Dismissed', icon: XCircle },
            ].map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex items-center space-x-2 px-2 md:px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            statusFilter === tab.key
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        <Badge variant="secondary" className="ml-2">
                            {getStatusCount(tab.key)}
                        </Badge>
                    </button>
                );
            })}
        </nav>
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
    typeFilter,
    handleTypeChange,
    loading,
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
                        placeholder="Search by incident title, description..."
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
                                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="complaint">Complaint</SelectItem>
                                <SelectItem value="blotter">Blotter</SelectItem>
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

const ResidentIncidentsIndex: React.FC = () => {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const incidents = pageProps.incidents || {
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
        pending: 0,
        under_investigation: 0,
        resolved: 0,
        dismissed: 0,
        by_type: {},
    };
    
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const household = pageProps.household || { id: 0, household_number: '', head_of_family: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIncidents, setSelectedIncidents] = useState<number[]>([]);
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
            setTypeFilter(filters.type || 'all');
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
        
        router.get(route('my.incidents.index'), cleanFilters, {
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
    
    const handleTypeChange = (type: string) => {
        setTypeFilter(type);
        updateFilters({ 
            type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setTypeFilter('all');
        
        router.get(route('my.incidents.index'), {}, {
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
    const toggleSelectIncident = (id: number) => {
        setSelectedIncidents(prev =>
            prev.includes(id)
                ? prev.filter(incidentId => incidentId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllIncidents = () => {
        const currentIncidents = getCurrentTabIncidents();
        if (selectedIncidents.length === currentIncidents.length && currentIncidents.length > 0) {
            setSelectedIncidents([]);
        } else {
            setSelectedIncidents(currentIncidents.map(c => c.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedIncidents([]);
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
            case 'under_investigation': 
                return stats.under_investigation || 0;
            case 'resolved': 
                return stats.resolved || 0;
            case 'dismissed': 
                return stats.dismissed || 0;
            default: 
                return 0;
        }
    };
    
    // Get current tab incidents
    const getCurrentTabIncidents = () => {
        return incidents.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Print function
    const printIncidents = () => {
        const currentIncidents = getCurrentTabIncidents();
        if (currentIncidents.length === 0) {
            toast.error('No incidents to print');
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
                <title>My Incident Reports</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .incident-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .incident-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .incident-table td { padding: 10px; border: 1px solid #ddd; }
                    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .badge-pending { background-color: #fef3c7; color: #92400e; }
                    .badge-under_investigation { background-color: #dbeafe; color: #1e40af; }
                    .badge-resolved { background-color: #d1fae5; color: #065f46; }
                    .badge-dismissed { background-color: #f3f4f6; color: #374151; }
                    .badge-complaint { background-color: #f3e8ff; color: #6b21a8; }
                    .badge-blotter { background-color: #ffedd5; color: #92400e; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>My Incident Reports</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Total Reports:</strong> ${currentIncidents.length}</p>
                            <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p><strong>Household:</strong> ${household?.household_number || 'N/A'}</p>
                            <p><strong>Head of Family:</strong> ${household?.head_of_family || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <table class="incident-table">
                    <thead>
                        <tr>
                            <th>Incident ID</th>
                            <th>Type</th>
                            <th>Title</th>
                            <th>Date Filed</th>
                            <th>Status</th>
                            <th>Filed As</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentIncidents.map(incident => `
                            <tr>
                                <td>#${incident.id.toString().padStart(6, '0')}</td>
                                <td><span class="badge badge-${incident.type}">${incident.type.toUpperCase()}</span></td>
                                <td>${incident.title}</td>
                                <td>${formatDate(incident.created_at)}</td>
                                <td><span class="badge badge-${incident.status}">${incident.status.replace('_', ' ').toUpperCase()}</span></td>
                                <td>${incident.is_anonymous ? 'Anonymous' : incident.reported_as_name}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Incident Reporting System</p>
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
        const currentIncidents = getCurrentTabIncidents();
        if (currentIncidents.length === 0) {
            toast.error('No incidents to export');
            return;
        }
        
        const headers = ['Incident ID', 'Type', 'Title', 'Description', 'Status', 'Filed As', 'Date Filed', 'Resolved At', 'Anonymous'];
        
        const csvData = currentIncidents.map(incident => [
            `#${incident.id.toString().padStart(6, '0')}`,
            incident.type.toUpperCase(),
            `"${incident.title.replace(/"/g, '""')}"`,
            `"${incident.description.replace(/"/g, '""')}"`,
            incident.status.replace('_', ' ').toUpperCase(),
            incident.reported_as_name,
            formatDate(incident.created_at),
            incident.resolved_at ? formatDate(incident.resolved_at) : 'Not resolved',
            incident.is_anonymous ? 'Yes' : 'No'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `incident_reports_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('CSV file downloaded successfully');
    };
    
    const shareIncidents = async () => {
        const currentIncidents = getCurrentTabIncidents();
        if (currentIncidents.length === 0) {
            toast.error('No incidents to share');
            return;
        }

        const summary = `My Incident Reports Summary:\n\n` +
            `Household: ${household?.household_number || 'N/A'}\n` +
            `Head of Family: ${household?.head_of_family || 'N/A'}\n\n` +
            `Total Reports: ${currentIncidents.length}\n` +
            `Complaints: ${currentIncidents.filter(i => i.type === 'complaint').length}\n` +
            `Blotters: ${currentIncidents.filter(i => i.type === 'blotter').length}\n` +
            `Pending: ${currentIncidents.filter(i => i.status === 'pending').length}\n` +
            `Under Investigation: ${currentIncidents.filter(i => i.status === 'under_investigation').length}\n` +
            `Resolved: ${currentIncidents.filter(i => i.status === 'resolved').length}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/my-incidents`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My Incident Reports',
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
    
    const renderTabContent = () => {
        const currentIncidents = getCurrentTabIncidents();
        const tabHasData = currentIncidents.length > 0;
        
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
                                        {selectedIncidents.length} incident{selectedIncidents.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllIncidents}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedIncidents.length === currentIncidents.length && currentIncidents.length > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectMode(false);
                                            setSelectedIncidents([]);
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
                    
                    {/* Incidents List Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')} Incident Reports
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${incidents.from}-${incidents.to} of ${incidents.total} incident${incidents.total !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'incident reports' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedIncidents.length > 0 && ` • ${selectedIncidents.length} selected`}
                                {(typeFilter !== 'all' || search) && ' (filtered)'}
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
                                               statusFilter === 'under_investigation' ? Loader2 :
                                               statusFilter === 'resolved' ? CheckCircle :
                                               statusFilter === 'dismissed' ? XCircle : AlertCircle;
                                    return <Icon className="h-8 w-8 text-gray-400" />;
                                })()}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No {statusFilter === 'all' ? 'incident reports' : statusFilter.replace('_', ' ')} found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters'
                                    : statusFilter === 'all' 
                                        ? 'You have no filed incident reports'
                                        : `You have no ${statusFilter.replace('_', ' ')} incident reports`}
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
                                            {currentIncidents.map((incident) => (
                                                <MobileIncidentCard 
                                                    key={incident.id} 
                                                    incident={incident}
                                                    selectMode={selectMode}
                                                    selectedIncidents={selectedIncidents}
                                                    toggleSelectIncident={toggleSelectIncident}
                                                    formatDate={formatDate}
                                                    currentResident={currentResident}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Grid View */}
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentIncidents.map((incident) => (
                                                <DesktopGridViewCard 
                                                    key={incident.id} 
                                                    incident={incident}
                                                    selectMode={selectMode}
                                                    selectedIncidents={selectedIncidents}
                                                    toggleSelectIncident={toggleSelectIncident}
                                                    formatDate={formatDate}
                                                    currentResident={currentResident}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* List/Table View (Desktop only) */}
                            {viewMode === 'list' && !isMobile && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {selectMode && (
                                                    <TableHead className="w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIncidents.length === currentIncidents.length && currentIncidents.length > 0}
                                                            onChange={selectAllIncidents}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Incident Details</TableHead>
                                                <TableHead>Type & Title</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentIncidents.map((incident) => (
                                                <TableRow key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIncidents.includes(incident.id)}
                                                                onChange={() => toggleSelectIncident(incident.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-sm font-medium">
                                                                    #{incident.id.toString().padStart(6, '0')}
                                                                </span>
                                                                {incident.is_anonymous && (
                                                                    <Badge variant="outline" size="sm" className="text-xs">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        Anonymous
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Filed as: {incident.reported_as_name}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <TypeBadge type={incident.type} />
                                                            </div>
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                {incident.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {incident.description.substring(0, 50)}...
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Filed</p>
                                                                <p className="text-sm">{formatDate(incident.created_at)}</p>
                                                            </div>
                                                            {incident.resolved_at && (
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Resolved</p>
                                                                    <p className="text-sm text-green-600">{formatDate(incident.resolved_at)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={incident.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={route('my.incidents.show', incident.id)}>
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
                                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`#${incident.id.toString().padStart(6, '0')}`)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Incident ID
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        const reportWindow = window.open('', '_blank');
                                                                        if (reportWindow) {
                                                                            reportWindow.document.write(`
                                                                                <h1>Incident Details: #${incident.id.toString().padStart(6, '0')}</h1>
                                                                                <p><strong>Title:</strong> ${incident.title}</p>
                                                                                <p><strong>Type:</strong> ${incident.type}</p>
                                                                                <p><strong>Status:</strong> ${incident.status}</p>
                                                                                <p><strong>Filed as:</strong> ${incident.is_anonymous ? 'Anonymous' : incident.reported_as_name}</p>
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
                            {incidents.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page {incidents.current_page} of {incidents.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (incidents.current_page - 1).toString() })}
                                                disabled={incidents.current_page <= 1 || loading}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (incidents.current_page + 1).toString() })}
                                                disabled={incidents.current_page >= incidents.last_page || loading}
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
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Incident Reports</h1>
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
            </Layout>
        );
    }
    
    return (
        <>
            <Head title="My Incident Reports" />
            
            <Layout>
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">My Incident Reports</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total} incident{stats.total !== 1 ? 's' : ''} total
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
                                    My Incident Reports
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Track and manage your filed incident reports
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
                                        <DropdownMenuItem onClick={exportToCSV}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={printIncidents}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={shareIncidents}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={printIncidents} variant="outline" size="sm">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <Link href={route('my.incidents.create')}>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Incident</span>
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
                            typeFilter={typeFilter}
                            handleTypeChange={handleTypeChange}
                            loading={loading}
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
                                Incident Reports
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {incidents.current_page} of {incidents.last_page}
                                </div>
                            </div>
                        </div>
                        
                        {/* USING EXTERNAL COMPONENT */}
                        <IncidentTabs 
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
                        <Link href={route('my.incidents.create')}>
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
            </Layout>
        </>
    );
};

export default ResidentIncidentsIndex;