// resources/js/components/admin/community-reports/CommunityReportsGridView.tsx

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Eye,
    Copy,
    FileText,
    User,
    MapPin,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Zap,
    ShieldAlert,
    Home,
    Phone,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    ExternalLink,
    MessageSquare
} from 'lucide-react';
import { 
    formatDate, 
    getTimeAgo, 
    truncateText,
    getStatusIcon,
    getPriorityIcon,
} from '@/admin-utils/communityReportHelpers';
import { useState } from 'react';

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
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    windowWidth: number;
    isMobile?: boolean;
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

export default function CommunityReportsGridView({
    reports,
    isBulkMode,
    selectedReports,
    onItemSelect,
    onDelete,
    onViewDetails,
    onCopyToClipboard,
    onMarkResolved,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    windowWidth,
    isMobile = false
}: CommunityReportsGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    const isCompactView = isMobile || windowWidth < 768;
    
    // Toggle card expansion
    const toggleCardExpansion = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle card click
    const handleCardClick = (reportId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(reportId);
    };

    // Get grid columns based on screen size
    const getGridColumns = (): string => {
        if (windowWidth < 640) return "grid-cols-1";
        if (windowWidth < 768) return "grid-cols-2";
        if (windowWidth < 1024) return "grid-cols-3";
        if (windowWidth < 1280) return "grid-cols-4";
        return "grid-cols-4";
    };

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

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white dark:bg-gray-900">
                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">No reports found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                    {isMobile ? "No reports available" : "Try changing filters"}
                </p>
            </div>
        );
    }

    return (
        <div className={`grid ${getGridColumns()} gap-3 p-3 bg-gray-50 dark:bg-gray-950`}>
            {reports.map((report) => {
                const isSelected = selectedReports.includes(report.id);
                const isExpanded = expandedCards.has(report.id);
                
                // Mobile-optimized truncation
                const titleLength = isCompactView ? 25 : 40;
                const locationLength = isCompactView ? 15 : 25;
                const userNameLength = isCompactView ? 12 : 20;
                
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
                        key={report.id} 
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${isCompactView ? 'min-h-0' : ''} ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(report.id, e)}
                    >
                        {/* Bulk selection checkbox - top left */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(report.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(report.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}
                        
                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with Report ID and Status */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`Click to copy: ${report.report_number}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopyToClipboard(report.report_number, 'Report ID');
                                        }}
                                    >
                                        {report.report_number}
                                    </span>
                                </div>
                                
                                {/* Status and Priority badges - compact */}
                                <div className="flex gap-1 flex-shrink-0">
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(report.status)}`}
                                        title={safeStatuses[report.status] || report.status}
                                    >
                                        {getStatusIcon(report.status)}
                                        <span className="ml-0.5 hidden xs:inline">
                                            {safeStatuses[report.status]?.substring(0, 3) || 'N/A'}
                                        </span>
                                    </Badge>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getPriorityColor(report.priority)}`}
                                        title={safePriorities[report.priority] || report.priority}
                                    >
                                        {getPriorityIcon(report.priority)}
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Title - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                                title={report.title}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(report);
                                }}
                            >
                                {truncateText(report.title, titleLength)}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* Location */}
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span 
                                        className="text-xs text-gray-700 dark:text-gray-300 truncate"
                                        title={report.location}
                                    >
                                        {truncateText(report.location, locationLength)}
                                    </span>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span 
                                            className="text-xs text-gray-700 dark:text-gray-300"
                                            title={`Incident: ${formatDate(report.incident_date)}`}
                                        >
                                            {formatDate(report.incident_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span 
                                            className="text-xs text-gray-700 dark:text-gray-300"
                                            title={`Created: ${getTimeAgo(report.created_at)} ago`}
                                        >
                                            {getTimeAgo(report.created_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Reporter - compact */}
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    <span 
                                        className="text-xs text-gray-700 dark:text-gray-300 truncate"
                                        title={report.is_anonymous ? 'Anonymous report' : `Reporter: ${userName}`}
                                    >
                                        {report.is_anonymous 
                                            ? 'Anonymous' 
                                            : truncateText(userName, userNameLength)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Expand/Collapse indicator area */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => toggleCardExpansion(report.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            
                            {/* EXPANDED DETAILS SECTION */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Category and Type */}
                                    {(reportCategory || reportTypeName) && (
                                        <div className="flex flex-wrap gap-1">
                                            {reportCategory && (
                                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                    {getDisplayName(reportCategory)}
                                                </Badge>
                                            )}
                                            {reportTypeName && (
                                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                                    {getDisplayName(reportTypeName)}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Assigned to */}
                                    {assignedToName && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <User className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                                            <span className="font-medium text-gray-900 dark:text-white truncate" title={assignedToName}>
                                                {assignedToName}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Special flags */}
                                    <div className="flex flex-wrap gap-1">
                                        {report.safety_concern && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                                                <ShieldAlert className="h-2.5 w-2.5 mr-1" />
                                                Safety Concern
                                            </Badge>
                                        )}
                                        {report.urgency_level && (
                                            <Badge 
                                                variant="outline" 
                                                className={`text-[10px] px-2 py-0.5 ${getUrgencyColor(report.urgency_level)} border-gray-200 dark:border-gray-700`}
                                            >
                                                <Zap className="h-2.5 w-2.5 mr-1" />
                                                {report.urgency_level.charAt(0).toUpperCase() + report.urgency_level.slice(1)} Urgency
                                            </Badge>
                                        )}
                                        {report.recurring_issue && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                                <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                                Recurring Issue
                                            </Badge>
                                        )}
                                        {report.environmental_impact && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                                🌿 Environmental
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Contact info for non-anonymous */}
                                    {!report.is_anonymous && (
                                        <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                                            {userPhone && (
                                                <div 
                                                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(userPhone!, 'Phone Number');
                                                    }}
                                                    title="Click to copy phone number"
                                                >
                                                    <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{formatPhoneNumber(userPhone)}</span>
                                                </div>
                                            )}
                                            
                                            {userPurok && (
                                                <div className="flex items-center gap-1.5">
                                                    <Home className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                    <span>Purok {userPurok}</span>
                                                </div>
                                            )}
                                            
                                            {userEmail && (
                                                <div 
                                                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(userEmail!, 'Email');
                                                    }}
                                                    title="Click to copy email"
                                                >
                                                    <MessageSquare className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{userEmail}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Description snippet */}
                                    {report.description && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Description:</p>
                                            <p className="line-clamp-3 italic text-gray-600 dark:text-gray-400">
                                                "{truncateText(report.description, 120)}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Evidence count */}
                                    {hasEvidence && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <span className="font-medium">📎</span>
                                            <span>{report.evidences!.length} evidence file(s)</span>
                                        </div>
                                    )}
                                    
                                    {/* Collapse button for expanded view */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(report);
                                            }}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(report.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        
                        {/* Footer with actions */}
                        <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-0.5">
                                    {/* View Details */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(report);
                                                }}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Copy Report ID */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(report.report_number, 'Report ID');
                                                }}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                            <p className="text-xs">Copy ID</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Mark as Resolved */}
                                    {report.status !== 'resolved' && report.status !== 'rejected' && onMarkResolved && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMarkResolved(report);
                                                    }}
                                                >
                                                    <CheckCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                                <p className="text-xs">Mark Resolved</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                
                                {/* Delete button */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(report);
                                            }}
                                        >
                                            <AlertTriangle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                        <p className="text-xs">Delete Report</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}