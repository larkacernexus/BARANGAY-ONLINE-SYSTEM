// resources/js/components/admin/community-reports/CommunityReportsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link, router } from '@inertiajs/react';
import {
    Eye,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    MapPin,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Zap,
    ShieldAlert,
    Phone,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    ExternalLink,
    MessageSquare,
    User,
    Home,
    FileText,
    CheckSquare,
    Square,
} from 'lucide-react';
import { 
    formatDate, 
    getTimeAgo, 
    truncateText,
    getStatusIcon,
    getPriorityIcon,
} from '@/admin-utils/communityReportHelpers';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

// Import types from the correct path
import type { CommunityReport } from '@/types/admin/reports/community-report';

interface CommunityReportsGridViewProps {
    reports: CommunityReport[];
    isBulkMode: boolean;
    selectedReports: number[];
    onItemSelect: (id: number) => void;
    onDelete: (report: CommunityReport) => void;
    onViewDetails: (report: CommunityReport) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onMarkResolved?: (report: CommunityReport) => void;
    onPrintReport?: (report: CommunityReport) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    windowWidth: number;
    isMobile?: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

// Helper function for phone number formatting
const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `+63 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    }
    if (cleaned.length === 10) {
        return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
    return phone;
};

// Helper function to get display name from object or string
const getDisplayName = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
        return item.name || item.title || item.label || item.id || '';
    }
    return String(item);
};

// Shared Report Card Component
const ReportCard = memo(({ 
    report, 
    isBulkMode, 
    isSelected, 
    isExpanded,
    onItemSelect,
    onDelete,
    onViewDetails,
    onCopyToClipboard,
    onMarkResolved,
    onPrintReport,
    onToggleExpand,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    truncateLengths,
    isMobile = false
}: {
    report: CommunityReport;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (report: CommunityReport) => void;
    onViewDetails: (report: CommunityReport) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onMarkResolved?: (report: CommunityReport) => void;
    onPrintReport?: (report: CommunityReport) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    truncateLengths: { title: number; location: number; userName: number };
    isMobile?: boolean;
}) => {
    // Status color
    const getStatusColor = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'resolved': 
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'in_progress': 
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'assigned': 
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'under_review': 
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'pending': 
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'rejected': 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };
    
    // Priority color
    const getPriorityColor = (priority: string): string => {
        switch (priority?.toLowerCase()) {
            case 'critical': 
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'high': 
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'medium': 
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'low': 
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    // Urgency color
    const getUrgencyColor = (urgency: string): string => {
        switch (urgency?.toLowerCase()) {
            case 'high': 
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': 
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low': 
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: 
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const handleCardClick = useCallback((e: React.MouseEvent) => {
        if (isBulkMode) return;
        onToggleExpand(report.id, e);
    }, [isBulkMode, report.id, onToggleExpand]);

    const handleCopyReportNumber = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyToClipboard(report.report_number, 'Report ID');
    }, [onCopyToClipboard, report.report_number]);

    const handleViewDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onViewDetails(report);
    }, [onViewDetails, report]);

    const handleMarkResolved = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkResolved?.(report);
    }, [onMarkResolved, report]);

    const handlePrint = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onPrintReport?.(report);
    }, [onPrintReport, report]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(report);
    }, [onDelete, report]);

    const handleCopyContact = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = report.user?.phone || report.reporter_contact;
        if (phone) {
            onCopyToClipboard(phone, 'Phone Number');
        }
    }, [onCopyToClipboard, report]);

    const handleCopyEmail = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const email = report.user?.email;
        if (email) {
            onCopyToClipboard(email, 'Email');
        }
    }, [onCopyToClipboard, report]);

    // Safe access to user properties
    const userName = report.user?.name || report.reporter_name || 'Unknown';
    const userPhone = report.user?.phone || report.reporter_contact;
    const userPurok = report.user?.purok;
    const userEmail = report.user?.email;
    const assignedToName = report.assigned_user?.name || report.assigned_to_name;
    const hasEvidence = report.evidences && report.evidences.length > 0;
    const reportCategory = (report.report_type as any)?.category || report.category;
    const reportTypeName = (report.report_type as any)?.name;

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer group`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {report.report_number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(report.created_at)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(report.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleViewDetails}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                
                                {onPrintReport && (
                                    <DropdownMenuItem onClick={handlePrint}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Print Report
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem onClick={handleCopyReportNumber}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Report #
                                </DropdownMenuItem>
                                
                                {userName && !report.is_anonymous && (
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyToClipboard(userName, 'Reporter Name');
                                    }}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Reporter
                                    </DropdownMenuItem>
                                )}
                                
                                {userPhone && !report.is_anonymous && (
                                    <DropdownMenuItem onClick={handleCopyContact}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Copy Contact
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {onMarkResolved && report.status !== 'resolved' && report.status !== 'rejected' && (
                                    <DropdownMenuItem onClick={handleMarkResolved}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark Resolved
                                    </DropdownMenuItem>
                                )}
                                
                                {isBulkMode && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onItemSelect(report.id);
                                        }}>
                                            {isSelected ? (
                                                <>
                                                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                    <span className="text-green-600">Deselect</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Select for Bulk
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getStatusColor(report.status)}`}
                    >
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{safeStatuses[report.status] || report.status}</span>
                    </Badge>
                    
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getPriorityColor(report.priority)}`}
                    >
                        {getPriorityIcon(report.priority)}
                        <span className="ml-1">{safePriorities[report.priority] || report.priority}</span>
                    </Badge>
                </div>

                {/* Title */}
                <h3 
                    className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white"
                    title={report.title}
                >
                    {truncateText(report.title, truncateLengths.title)}
                </h3>

                {/* Always visible info */}
                <div className="space-y-2 mb-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span 
                            className="truncate"
                            title={report.location}
                        >
                            {truncateText(report.location, truncateLengths.location)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDate(report.incident_date)}</span>
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                        <span>{getTimeAgo(report.created_at)} ago</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                            {report.is_anonymous ? 'Anonymous' : truncateText(userName, truncateLengths.userName)}
                        </span>
                    </div>
                </div>

                {/* Expand/Collapse indicator */}
                {!isBulkMode && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isExpanded ? 'Hide details' : 'Click to view details'}
                        </div>
                        <button
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={(e) => onToggleExpand(report.id, e)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50 duration-200">
                        {/* Category and Type */}
                        {(reportCategory || reportTypeName) && (
                            <div className="flex flex-wrap gap-1">
                                {reportCategory && (
                                    <Badge variant="secondary" className="text-xs">
                                        {getDisplayName(reportCategory)}
                                    </Badge>
                                )}
                                {reportTypeName && (
                                    <Badge variant="outline" className="text-xs">
                                        {getDisplayName(reportTypeName)}
                                    </Badge>
                                )}
                            </div>
                        )}
                        
                        {/* Assigned to */}
                        {assignedToName && (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                    {assignedToName}
                                </span>
                            </div>
                        )}
                        
                        {/* Special flags */}
                        <div className="flex flex-wrap gap-1">
                            {report.safety_concern && (
                                <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950/30">
                                    <ShieldAlert className="h-3 w-3 mr-1" />
                                    Safety Concern
                                </Badge>
                            )}
                            {report.urgency_level && (
                                <Badge variant="outline" className={`text-xs ${getUrgencyColor(report.urgency_level)}`}>
                                    <Zap className="h-3 w-3 mr-1" />
                                    {report.urgency_level} Urgency
                                </Badge>
                            )}
                            {report.recurring_issue && (
                                <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/30">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Recurring
                                </Badge>
                            )}
                            {report.environmental_impact && (
                                <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/30">
                                    🌿 Environmental
                                </Badge>
                            )}
                        </div>
                        
                        {/* Contact info for non-anonymous */}
                        {!report.is_anonymous && (
                            <div className="space-y-1.5">
                                {userPhone && (
                                    <div 
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"
                                        onClick={handleCopyContact}
                                    >
                                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span>{formatPhoneNumber(userPhone)}</span>
                                    </div>
                                )}
                                
                                {userPurok && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span>Purok {userPurok}</span>
                                    </div>
                                )}
                                
                                {userEmail && (
                                    <div 
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"
                                        onClick={handleCopyEmail}
                                    >
                                        <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{userEmail}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Description snippet */}
                        {report.description && (
                            <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 italic">
                                    "{truncateText(report.description, 120)}"
                                </p>
                            </div>
                        )}
                        
                        {/* Evidence count */}
                        {hasEvidence && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">📎</span>
                                <span>{report.evidences!.length} evidence file(s)</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                onClick={handleViewDetails}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View full details
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => onToggleExpand(report.id, e)}
                            >
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

ReportCard.displayName = 'ReportCard';

// Empty State Component
const EmptyStateComponent = ({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
    <EmptyState
        title="No reports found"
        description={hasActiveFilters 
            ? 'Try changing your filters or search criteria.'
            : 'No community reports have been filed yet.'}
        icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
        hasFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
    />
);

// Main Grid View Component
export default function CommunityReportsGridView({
    reports,
    isBulkMode,
    selectedReports,
    onItemSelect,
    onDelete,
    onViewDetails,
    onCopyToClipboard,
    onMarkResolved,
    onPrintReport,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    windowWidth,
    isMobile = false,
    hasActiveFilters,
    onClearFilters
}: CommunityReportsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns based on actual available width and scaling
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 900) return 2;
        if (windowWidth < 1280) return 3;
        if (windowWidth < 1600) return 3;
        return 4;
    }, [windowWidth, devicePixelRatio]);
    
    // Adjust text truncation based on grid columns
    const getTruncateLengths = useMemo(() => {
        if (gridCols >= 4) return { title: 40, location: 25, userName: 20 };
        if (gridCols === 3) return { title: 35, location: 20, userName: 18 };
        if (gridCols === 2) return { title: 30, location: 18, userName: 15 };
        return { title: 25, location: 15, userName: 12 };
    }, [gridCols]);

    const truncateLengths = getTruncateLengths;
    
    // Memoized handlers
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedReports), [selectedReports]);

    // Early return for empty state
    if (reports.length === 0) {
        return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {reports.map((report) => (
                <ReportCard
                    key={report.id}
                    report={report}
                    isBulkMode={isBulkMode}
                    isSelected={selectedSet.has(report.id)}
                    isExpanded={expandedId === report.id}
                    onItemSelect={onItemSelect}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                    onCopyToClipboard={onCopyToClipboard}
                    onMarkResolved={onMarkResolved}
                    onPrintReport={onPrintReport}
                    onToggleExpand={handleToggleExpand}
                    safeStatuses={safeStatuses}
                    safePriorities={safePriorities}
                    safeUrgencies={safeUrgencies}
                    truncateLengths={truncateLengths}
                    isMobile={isMobile}
                />
            ))}
        </GridLayout>
    );
}