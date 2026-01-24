import { useState, useEffect, useMemo, useRef } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClearanceTabs } from '@/components/residentui/ClearanceTabs';

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
    Plus,
    Check,
    X,
    Square,
    Grid,
    List,
    MoreVertical,
    Copy,
    FileText,
    Printer,
    Download,
    Share2,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    BarChart,
    Loader2,
    Calendar,
    Clock,
    DollarSign,
    FileCheck,
    User,
    XCircle,
    CheckCircle,
    Zap,
    Mail,
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
    pending_payment: { 
        label: 'Pending Payment', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-800 dark:text-orange-300',
        icon: DollarSign
    },
    processing: { 
        label: 'Processing', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-800 dark:text-blue-300',
        icon: Loader2
    },
    approved: { 
        label: 'Approved', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-800 dark:text-green-300',
        icon: CheckCircle
    },
    issued: { 
        label: 'Issued', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        textColor: 'text-purple-800 dark:text-purple-300',
        icon: FileCheck
    },
    rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-800 dark:text-red-300',
        icon: XCircle
    },
    cancelled: { 
        label: 'Cancelled', 
        color: 'bg-gray-100 dark:bg-gray-800', 
        textColor: 'text-gray-800 dark:text-gray-300',
        icon: XCircle
    },
};

// Urgency configuration
const URGENCY_CONFIG = {
    normal: { 
        label: 'Normal', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500'
    },
    rush: { 
        label: 'Rush', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500'
    },
    express: { 
        label: 'Express', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500'
    },
};

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number | string;
    processing_days: number;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
}

interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    reference_number: string;
    clearance_number?: string;
    status: string;
    purpose: string;
    specific_purpose?: string;
    urgency: 'normal' | 'rush' | 'express';
    needed_date: string;
    additional_requirements?: string;
    fee_amount: number | string;
    issue_date?: string;
    valid_until?: string;
    remarks?: string;
    issuing_officer_name?: string;
    created_at: string;
    updated_at: string;
    resident?: Resident;
    clearance_type?: ClearanceType;
    formatted_created_at: string;
    formatted_needed_date: string;
    formatted_issue_date?: string;
    formatted_fee: string;
    is_urgent: boolean;
    days_until_needed: number;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    head_resident_id?: number;
}

interface PageProps extends Record<string, any> {
    clearances?: {
        data: ClearanceRequest[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: {
        total_clearances: number;
        pending_clearances: number;
        pending_payment_clearances: number;
        processing_clearances: number;
        approved_clearances: number;
        issued_clearances: number;
        rejected_clearances: number;
        cancelled_clearances: number;
        total_fees: number;
        total_paid: number;
        total_balance: number;
        current_year_total: number;
        current_year_issued: number;
    };
    availableYears?: number[];
    availableClearanceTypes?: ClearanceType[];
    householdResidents?: Resident[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: Household;
    filters?: {
        search?: string;
        status?: string;
        clearance_type?: string;
        year?: string;
        resident?: string;
        urgency?: string;
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

// Inline MobileClearanceCard Component
const MobileClearanceCard = ({ 
    clearance,
    selectMode,
    selectedClearances,
    toggleSelectClearance,
    getClearanceTypeDisplay,
    getUrgencyBadge,
    formatDate,
    formatCurrency,
    currentResident,
    copyReferenceNumber
}: any) => (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {selectMode && (
                        <button
                            onClick={() => toggleSelectClearance(clearance.id)}
                            className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                selectedClearances.includes(clearance.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            {selectedClearances.includes(clearance.id) && (
                                <Check className="h-3 w-3 text-white" />
                            )}
                        </button>
                    )}
                    
                    <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => copyReferenceNumber(clearance.reference_number)}
                                className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                title="Copy reference number"
                            >
                                #{clearance.reference_number}
                            </button>
                            {clearance.clearance_number && (
                                <Badge variant="outline" size="sm" className="h-5 text-xs">
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    #{clearance.clearance_number}
                                </Badge>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {getClearanceTypeDisplay(clearance.clearance_type)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {clearance.purpose}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        {getUrgencyBadge(clearance.urgency)}
                        <StatusBadge status={clearance.status} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Requested By</p>
                        <p className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {clearance.resident?.first_name} {clearance.resident?.last_name}
                            {clearance.resident_id === currentResident?.id && ' (You)'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Requested</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(clearance.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                        href={`/my-clearances/${clearance.id}`} 
                        className="flex-1"
                    >
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                    <div className="flex gap-1 ml-2">
                        {clearance.status === 'issued' && clearance.clearance_number && (
                            <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => toast.info('Download functionality would be implemented here')}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                        {clearance.status === 'pending_payment' && (
                            <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => toast.info('Payment functionality would open here')}
                            >
                                <DollarSign className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Inline DesktopGridViewCard Component
const DesktopGridViewCard = ({ 
    clearance,
    selectMode,
    selectedClearances,
    toggleSelectClearance,
    getClearanceTypeDisplay,
    getUrgencyBadge,
    formatDate,
    formatCurrency,
    currentResident,
    copyReferenceNumber
}: any) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="p-4">
            <div className="space-y-3">
                {/* Header with selection checkbox */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        {selectMode && (
                            <button
                                onClick={() => toggleSelectClearance(clearance.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedClearances.includes(clearance.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedClearances.includes(clearance.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => copyReferenceNumber(clearance.reference_number)}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                    title="Copy reference number"
                                >
                                    #{clearance.reference_number}
                                </button>
                                {clearance.clearance_number && (
                                    <Badge variant="outline" size="sm" className="h-5 text-xs">
                                        <FileCheck className="h-3 w-3 mr-1" />
                                        #{clearance.clearance_number}
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {getClearanceTypeDisplay(clearance.clearance_type)}
                            </h4>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        {getUrgencyBadge(clearance.urgency)}
                        <StatusBadge status={clearance.status} />
                    </div>
                </div>

                {/* Purpose */}
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Purpose</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {clearance.purpose}
                    </p>
                    {clearance.specific_purpose && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {clearance.specific_purpose}
                        </p>
                    )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Requested By</p>
                        <p className="font-medium">
                            {clearance.resident?.first_name} {clearance.resident?.last_name}
                            {clearance.resident_id === currentResident?.id && (
                                <Badge variant="outline" size="sm" className="ml-2 text-xs">You</Badge>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Date Requested</p>
                        <p className="font-medium">{formatDate(clearance.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Needed By</p>
                        <p className="font-medium">{formatDate(clearance.needed_date)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Fee</p>
                        <p className="font-bold">{formatCurrency(clearance.fee_amount)}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link href={`/my-clearances/${clearance.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                    {clearance.status === 'pending_payment' && (
                        <Link href={`/resident/payments/create?clearance_id=${clearance.id}`} className="flex-1">
                            <Button size="sm" variant="default" className="w-full">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Pay Now
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Inline CollapsibleStats Component
const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    statusFilter, 
    stats, 
    clearances, 
    getStatusCount, 
    formatCurrency 
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
                                        {stats.total_clearances}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                    <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Issued
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {getStatusCount('issued')}
                                    </p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                    <FileCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                        Processing
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {getStatusCount('processing')}
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                    <Loader2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                        Pending Payment
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {getStatusCount('pending_payment')}
                                    </p>
                                </div>
                                <div className="p-2 bg-orange-100 dark:orange-800/30 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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
const DesktopStats = ({ 
    statusFilter, 
    stats, 
    clearances, 
    getStatusCount, 
    formatCurrency 
}: any) => (
    <div className="hidden md:grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Total Clearances
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {stats.total_clearances}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Issued
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {getStatusCount('issued')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round((getStatusCount('issued') / (stats.total_clearances || 1)) * 100)}% of total
                        </p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                        <FileCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Processing
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {getStatusCount('processing')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round((getStatusCount('processing') / (stats.total_clearances || 1)) * 100)}% of total
                        </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                        <Loader2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            Pending Payment
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {getStatusCount('pending_payment')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Fees: {formatCurrency(stats.total_balance)}
                        </p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                        <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
    clearanceTypeFilter,
    handleClearanceTypeChange,
    residentFilter,
    handleResidentChange,
    urgencyFilter,
    handleUrgencyChange,
    yearFilter,
    handleYearChange,
    loading,
    availableClearanceTypes,
    householdResidents,
    currentResident,
    availableYears,
    printClearances,
    exportToCSV,
    isExporting,
    getCurrentTabClearances,
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
                        placeholder="Search by reference number, purpose, clearance type..."
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
                        <Select value={clearanceTypeFilter} onValueChange={handleClearanceTypeChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Clearance Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {availableClearanceTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={residentFilter} onValueChange={handleResidentChange}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Resident" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Household Members</SelectItem>
                                {Array.isArray(householdResidents) && householdResidents.map(resident => (
                                    <SelectItem key={resident?.id || Math.random()} value={resident?.id?.toString() || ''}>
                                        {resident?.first_name || ''} {resident?.last_name || ''}
                                        {resident?.id === currentResident?.id && ' (You)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={urgencyFilter} onValueChange={handleUrgencyChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Urgency</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="rush">Rush</SelectItem>
                                <SelectItem value="express">Express</SelectItem>
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


export default function MyClearances() {
    const page = usePage<PageProps>();
    const pageProps = page.props;
    
    const clearances = pageProps.clearances || {
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
        total_clearances: 0,
        pending_clearances: 0,
        pending_payment_clearances: 0,
        processing_clearances: 0,
        approved_clearances: 0,
        issued_clearances: 0,
        rejected_clearances: 0,
        cancelled_clearances: 0,
        total_fees: 0,
        total_paid: 0,
        total_balance: 0,
        current_year_total: 0,
        current_year_issued: 0,
    };
    
    const availableYears = pageProps.availableYears || [];
    const availableClearanceTypes = pageProps.availableClearanceTypes || [];
    const householdResidents = pageProps.householdResidents || [];
    const currentResident = pageProps.currentResident || { id: 0, first_name: '', last_name: '' };
    const household = pageProps.household || { id: 0, household_number: '', head_of_family: '' };
    const filters = pageProps.filters || {};
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [clearanceTypeFilter, setClearanceTypeFilter] = useState(filters.clearance_type || 'all');
    const [residentFilter, setResidentFilter] = useState(filters.resident || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.urgency || 'all');
    const [yearFilter, setYearFilter] = useState(filters.year || 'all');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
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
            setClearanceTypeFilter(filters.clearance_type || 'all');
            setResidentFilter(filters.resident || 'all');
            setUrgencyFilter(filters.urgency || 'all');
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
        
        router.get('/my-clearances', cleanFilters, {
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
    
    const handleClearanceTypeChange = (type: string) => {
        setClearanceTypeFilter(type);
        updateFilters({ 
            clearance_type: type === 'all' ? '' : type,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleResidentChange = (resident: string) => {
        setResidentFilter(resident);
        updateFilters({ 
            resident: resident === 'all' ? '' : resident,
            page: '1'
        });
        if (isMobile) setShowFilters(false);
    };
    
    const handleUrgencyChange = (urgency: string) => {
        setUrgencyFilter(urgency);
        updateFilters({ 
            urgency: urgency === 'all' ? '' : urgency,
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
        setClearanceTypeFilter('all');
        setResidentFilter('all');
        setUrgencyFilter('all');
        setYearFilter('all');
        
        router.get('/my-clearances', {}, {
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
    const toggleSelectClearance = (id: number) => {
        setSelectedClearances(prev =>
            prev.includes(id)
                ? prev.filter(clearanceId => clearanceId !== id)
                : [...prev, id]
        );
    };
    
    const selectAllClearances = () => {
        const currentClearances = getCurrentTabClearances();
        if (selectedClearances.length === currentClearances.length && currentClearances.length > 0) {
            setSelectedClearances([]);
        } else {
            setSelectedClearances(currentClearances.map(c => c.id));
        }
    };
    
    const toggleSelectMode = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedClearances([]);
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
    
    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return '₱0.00';
        return `₱${num.toFixed(2)}`;
    };
    
    const getClearanceTypeDisplay = (clearanceType: ClearanceType | undefined) => {
        if (!clearanceType) return 'Clearance';
        return clearanceType.name;
    };
    
    const getUrgencyBadge = (urgency: string) => {
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
            <Badge variant="outline" className={`${config.color} ${config.textColor} border-0`}>
                <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
                <span>{config.label}</span>
            </Badge>
        );
    };
    
    // Get status count from global stats
    const getStatusCount = (status: string) => {
        switch(status) {
            case 'all': 
                return stats.total_clearances || 0;
            case 'pending': 
                return stats.pending_clearances || 0;
            case 'pending_payment': 
                return stats.pending_payment_clearances || 0;
            case 'processing': 
                return stats.processing_clearances || 0;
            case 'approved': 
                return stats.approved_clearances || 0;
            case 'issued': 
                return stats.issued_clearances || 0;
            case 'rejected': 
                return stats.rejected_clearances || 0;
            case 'cancelled': 
                return stats.cancelled_clearances || 0;
            default: 
                return 0;
        }
    };
    
    // Get current tab clearances
    const getCurrentTabClearances = () => {
        return clearances.data;
    };
    
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) => 
            key !== 'page' && value && value !== '' && value !== 'all'
        );
    }, [filters]);
    
    // Print function
    const printClearances = () => {
        const currentClearances = getCurrentTabClearances();
        if (currentClearances.length === 0) {
            toast.error('No clearance requests to print');
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
                <title>My Clearance Requests Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-header { margin-bottom: 30px; }
                    .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
                    .clearance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .clearance-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
                    .clearance-table td { padding: 10px; border: 1px solid #ddd; }
                    .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
                    .badge-pending { background-color: #fef3c7; color: #92400e; }
                    .badge-pending_payment { background-color: #fed7aa; color: #9a3412; }
                    .badge-processing { background-color: #dbeafe; color: #1e40af; }
                    .badge-approved { background-color: #d1fae5; color: #065f46; }
                    .badge-issued { background-color: #e9d5ff; color: #6b21a8; }
                    .badge-rejected { background-color: #fee2e2; color: #991b1b; }
                    .badge-cancelled { background-color: #f3f4f6; color: #374151; }
                    .badge-normal { background-color: #dbeafe; color: #1e40af; }
                    .badge-rush { background-color: #fed7aa; color: #9a3412; }
                    .badge-express { background-color: #fee2e2; color: #991b1b; }
                    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>My Clearance Requests Report</h1>
                    <div class="print-info">
                        <div>
                            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Total Requests:</strong> ${currentClearances.length}</p>
                            <p><strong>Status:</strong> ${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</p>
                        </div>
                        <div>
                            <p><strong>Household:</strong> ${household?.household_number || 'N/A'}</p>
                            <p><strong>Head of Family:</strong> ${household?.head_of_family || 'N/A'}</p>
                            <p><strong>Total Fees:</strong> ${formatCurrency(stats.total_fees)}</p>
                        </div>
                    </div>
                </div>
                
                <table class="clearance-table">
                    <thead>
                        <tr>
                            <th>Reference No.</th>
                            <th>Type</th>
                            <th>Purpose</th>
                            <th>Date Requested</th>
                            <th>Urgency</th>
                            <th>Status</th>
                            <th>Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentClearances.map(clearance => `
                            <tr>
                                <td>${clearance.reference_number}</td>
                                <td>${getClearanceTypeDisplay(clearance.clearance_type)}</td>
                                <td>${clearance.purpose}</td>
                                <td>${formatDate(clearance.created_at)}</td>
                                <td><span class="badge badge-${clearance.urgency}">${clearance.urgency.toUpperCase()}</span></td>
                                <td><span class="badge badge-${clearance.status}">${clearance.status.replace('_', ' ').toUpperCase()}</span></td>
                                <td>${formatCurrency(clearance.fee_amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated from Barangay Management System</p>
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
        const currentClearances = getCurrentTabClearances();
        if (currentClearances.length === 0) {
            toast.error('No clearance requests to export');
            return;
        }
        
        setIsExporting(true);
        
        const headers = ['Reference No.', 'Clearance Number', 'Type', 'Purpose', 'Specific Purpose', 'Status', 'Urgency', 'Fee', 'Date Requested', 'Needed Date', 'Issue Date', 'Valid Until'];
        
        const csvData = currentClearances.map(clearance => [
            clearance.reference_number,
            clearance.clearance_number || 'N/A',
            getClearanceTypeDisplay(clearance.clearance_type),
            `"${clearance.purpose.replace(/"/g, '""')}"`,
            `"${(clearance.specific_purpose || '').replace(/"/g, '""')}"`,
            clearance.status.replace('_', ' ').toUpperCase(),
            clearance.urgency.toUpperCase(),
            formatCurrency(clearance.fee_amount),
            formatDate(clearance.created_at),
            formatDate(clearance.needed_date),
            clearance.issue_date ? formatDate(clearance.issue_date) : 'Not issued',
            clearance.valid_until ? formatDate(clearance.valid_until) : 'N/A'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `clearance_requests_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        toast.success('CSV file downloaded successfully');
    };
    
    const shareClearances = async () => {
        const currentClearances = getCurrentTabClearances();
        if (currentClearances.length === 0) {
            toast.error('No clearance requests to share');
            return;
        }

        const summary = `My Clearance Requests Summary:\n\n` +
            `Household: ${household?.household_number || 'N/A'}\n` +
            `Head of Family: ${household?.head_of_family || 'N/A'}\n\n` +
            `Total Requests: ${currentClearances.length}\n` +
            `Pending: ${currentClearances.filter(c => c.status === 'pending').length}\n` +
            `Pending Payment: ${currentClearances.filter(c => c.status === 'pending_payment').length}\n` +
            `Processing: ${currentClearances.filter(c => c.status === 'processing').length}\n` +
            `Approved: ${currentClearances.filter(c => c.status === 'approved').length}\n` +
            `Issued: ${currentClearances.filter(c => c.status === 'issued').length}\n` +
            `Rejected: ${currentClearances.filter(c => c.status === 'rejected').length}\n` +
            `Cancelled: ${currentClearances.filter(c => c.status === 'cancelled').length}\n\n` +
            `Total Fees: ${formatCurrency(stats.total_fees)}\n` +
            `Total Paid: ${formatCurrency(stats.total_paid)}\n` +
            `Balance Due: ${formatCurrency(stats.total_balance)}\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n` +
            `View online: ${window.location.origin}/my-clearances`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My Clearance Requests Report',
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
    
    const copyReferenceNumber = (refNumber: string) => {
        navigator.clipboard.writeText(refNumber).then(() => {
            toast.success(`Copied: ${refNumber}`);
        }).catch(() => {
            toast.error('Failed to copy');
        });
    };
    
    const renderTabContent = () => {
        const currentClearances = getCurrentTabClearances();
        const tabHasData = currentClearances.length > 0;
        
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
                                        {selectedClearances.length} request{selectedClearances.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllClearances}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {selectedClearances.length === currentClearances.length && currentClearances.length > 0
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                    {selectedClearances.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${selectedClearances.length} selected clearance requests?`)) {
                                                    toast.success(`Deleted ${selectedClearances.length} clearance requests`);
                                                    setSelectedClearances([]);
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
                                            setSelectedClearances([]);
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
                    
                    {/* Clearances List Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Clearance Requests
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tabHasData 
                                    ? `Showing ${currentClearances.length} request${currentClearances.length !== 1 ? 's' : ''}`
                                    : `No ${statusFilter === 'all' ? 'clearance requests' : statusFilter.replace('_', ' ')} found`
                                }
                                {selectMode && selectedClearances.length > 0 && ` • ${selectedClearances.length} selected`}
                                {(clearanceTypeFilter !== 'all' || residentFilter !== 'all' || urgencyFilter !== 'all' || yearFilter !== 'all' || search) && ' (filtered)'}
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
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {(() => {
                                    const Icon = statusFilter === 'all' ? FileText : 
                                               statusFilter === 'pending' ? Clock :
                                               statusFilter === 'pending_payment' ? DollarSign :
                                               statusFilter === 'processing' ? Loader2 :
                                               statusFilter === 'approved' ? CheckCircle :
                                               statusFilter === 'issued' ? FileCheck :
                                               statusFilter === 'rejected' || statusFilter === 'cancelled' ? XCircle : FileText;
                                    return <Icon className="h-8 w-8 text-gray-400" />;
                                })()}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                No {statusFilter === 'all' ? 'clearance requests' : statusFilter.replace('_', ' ')} found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters 
                                    ? 'Try adjusting your filters'
                                    : statusFilter === 'all' 
                                        ? 'You have no clearance requests'
                                        : `You have no ${statusFilter.replace('_', ' ')} clearance requests`}
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
                                            {currentClearances.map((clearance) => (
                                                <MobileClearanceCard 
                                                    key={clearance.id} 
                                                    clearance={clearance}
                                                    selectMode={selectMode}
                                                    selectedClearances={selectedClearances}
                                                    toggleSelectClearance={toggleSelectClearance}
                                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                                    getUrgencyBadge={getUrgencyBadge}
                                                    formatDate={formatDate}
                                                    formatCurrency={formatCurrency}
                                                    currentResident={currentResident}
                                                    copyReferenceNumber={copyReferenceNumber}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Desktop Grid View */}
                                    {!isMobile && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentClearances.map((clearance) => (
                                                <DesktopGridViewCard 
                                                    key={clearance.id} 
                                                    clearance={clearance}
                                                    selectMode={selectMode}
                                                    selectedClearances={selectedClearances}
                                                    toggleSelectClearance={toggleSelectClearance}
                                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                                    getUrgencyBadge={getUrgencyBadge}
                                                    formatDate={formatDate}
                                                    formatCurrency={formatCurrency}
                                                    currentResident={currentResident}
                                                    copyReferenceNumber={copyReferenceNumber}
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
                                                            checked={selectedClearances.length === currentClearances.length && currentClearances.length > 0}
                                                            onChange={selectAllClearances}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead>Reference Details</TableHead>
                                                <TableHead>Type & Purpose</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead>Urgency</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Fee</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentClearances.map((clearance) => (
                                                <TableRow key={clearance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    {selectMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedClearances.includes(clearance.id)}
                                                                onChange={() => toggleSelectClearance(clearance.id)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <button
                                                                    onClick={() => copyReferenceNumber(clearance.reference_number)}
                                                                    className="font-mono text-sm font-medium hover:text-blue-600 transition-colors"
                                                                    title="Copy reference number"
                                                                >
                                                                    #{clearance.reference_number}
                                                                </button>
                                                                {clearance.clearance_number && (
                                                                    <Badge variant="outline" size="sm" className="text-xs">
                                                                        <FileCheck className="h-3 w-3 mr-1" />
                                                                        #{clearance.clearance_number}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Requested by: {clearance.resident?.first_name} {clearance.resident?.last_name}
                                                                {clearance.resident_id === currentResident?.id && ' (You)'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-700 dark:text-gray-300">
                                                                {getClearanceTypeDisplay(clearance.clearance_type)}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                {clearance.purpose}
                                                            </p>
                                                            {clearance.specific_purpose && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {clearance.specific_purpose}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Requested</p>
                                                                <p className="text-sm">{formatDate(clearance.created_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Needed By</p>
                                                                <p className="text-sm">{formatDate(clearance.needed_date)}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getUrgencyBadge(clearance.urgency)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={clearance.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold">{formatCurrency(clearance.fee_amount)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/my-clearances/${clearance.id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {clearance.status === 'pending_payment' && (
                                                                <Link href={`/resident/payments/create?clearance_id=${clearance.id}`}>
                                                                    <Button size="sm" variant="default" className="h-8 px-3 text-xs">
                                                                        Pay
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {clearance.status === 'issued' && clearance.clearance_number && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => toast.info('Download functionality would be implemented here')}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => copyReferenceNumber(clearance.reference_number)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Copy Reference No.
                                                                    </DropdownMenuItem>
                                                                    {clearance.clearance_number && (
                                                                        <DropdownMenuItem onClick={() => {
                                                                            navigator.clipboard.writeText(clearance.clearance_number!);
                                                                            toast.success(`Copied: ${clearance.clearance_number}`);
                                                                        }}>
                                                                            <Copy className="h-4 w-4 mr-2" />
                                                                            Copy Clearance No.
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => {
                                                                        const reportWindow = window.open('', '_blank');
                                                                        if (reportWindow) {
                                                                            reportWindow.document.write(`
                                                                                <h1>Clearance Request Details: ${clearance.reference_number}</h1>
                                                                                <p><strong>Type:</strong> ${getClearanceTypeDisplay(clearance.clearance_type)}</p>
                                                                                <p><strong>Purpose:</strong> ${clearance.purpose}</p>
                                                                                <p><strong>Fee:</strong> ${formatCurrency(clearance.fee_amount)}</p>
                                                                                <p><strong>Status:</strong> ${clearance.status}</p>
                                                                            `);
                                                                        }
                                                                    }}>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Report
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
                            {clearances.last_page > 1 && (
                                <div className="mt-4 md:mt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page {clearances.current_page} of {clearances.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (clearances.current_page - 1).toString() })}
                                                disabled={clearances.current_page <= 1 || loading}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateFilters({ page: (clearances.current_page + 1).toString() })}
                                                disabled={clearances.current_page >= clearances.last_page || loading}
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
                    { title: 'My Clearances', href: '/my-clearances' }
                ]}
            >
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Clearances</h1>
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
            <Head title="My Clearances" />
            
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Clearances', href: '/my-clearances' }
                ]}
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">My Clearances</h1>
                                <p className="text-xs text-gray-500">
                                    {stats.total_clearances} request{stats.total_clearances !== 1 ? 's' : ''} total
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
                                    My Clearances
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Manage and track your clearance requests
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
                                        <DropdownMenuItem onClick={printClearances}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print List
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={shareClearances}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Copy Summary
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            const body = `
Hello,

Here's a summary of my clearance requests:

Total Requests: ${getCurrentTabClearances().length}
- Pending: ${getCurrentTabClearances().filter(c => c.status === 'pending').length}
- Pending Payment: ${getCurrentTabClearances().filter(c => c.status === 'pending_payment').length}
- Processing: ${getCurrentTabClearances().filter(c => c.status === 'processing').length}
- Approved: ${getCurrentTabClearances().filter(c => c.status === 'approved').length}
- Issued: ${getCurrentTabClearances().filter(c => c.status === 'issued').length}
- Rejected: ${getCurrentTabClearances().filter(c => c.status === 'rejected').length}
- Cancelled: ${getCurrentTabClearances().filter(c => c.status === 'cancelled').length}

Total Fees: ${formatCurrency(stats.total_fees)}
Total Paid: ${formatCurrency(stats.total_paid)}
Balance Due: ${formatCurrency(stats.total_balance)}

This summary was generated from the Barangay Management System.

Best regards,
${currentResident?.first_name} ${currentResident?.last_name}
                                            `.trim();
                                            const subject = `My Clearance Requests Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        }}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Summary
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button onClick={printClearances} variant="outline" size="sm">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                
                                <Link href="/my-clearances/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Request</span>
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
                            clearances={clearances}
                            getStatusCount={getStatusCount}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    {!isMobile && (
                        <DesktopStats 
                            statusFilter={statusFilter}
                            stats={stats}
                            clearances={clearances}
                            getStatusCount={getStatusCount}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    
                    {/* Filters */}
                    {(showFilters || !isMobile) && (
                        <FiltersSection
                            search={search}
                            setSearch={setSearch}
                            handleSearchSubmit={handleSearchSubmit}
                            handleSearchClear={handleSearchClear}
                            clearanceTypeFilter={clearanceTypeFilter}
                            handleClearanceTypeChange={handleClearanceTypeChange}
                            residentFilter={residentFilter}
                            handleResidentChange={handleResidentChange}
                            urgencyFilter={urgencyFilter}
                            handleUrgencyChange={handleUrgencyChange}
                            yearFilter={yearFilter}
                            handleYearChange={handleYearChange}
                            loading={loading}
                            availableClearanceTypes={availableClearanceTypes}
                            householdResidents={householdResidents}
                            currentResident={currentResident}
                            availableYears={availableYears}
                            printClearances={printClearances}
                            exportToCSV={exportToCSV}
                            isExporting={isExporting}
                            getCurrentTabClearances={getCurrentTabClearances}
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
                                Clearance Requests
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    Page {clearances.current_page} of {clearances.last_page}
                                </div>
                            </div>
                        </div>
                        
               <ClearanceTabs 
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
                        <Link href="/my-clearances/create">
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