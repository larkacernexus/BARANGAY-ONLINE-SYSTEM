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
import { CommunityReport } from '@/admin-utils/communityReportTypes';
import { 
    formatDate, 
    getTimeAgo, 
    truncateText,
    getStatusIcon,
    getPriorityIcon,
} from '@/admin-utils/communityReportHelpers';
import { useState } from 'react';

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
    windowWidth: number;
    isMobile?: boolean;
}

// Helper function for phone number formatting
const formatPhoneNumber = (phone: string) => {
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
        // Don't do anything if we're in bulk mode - let the checkbox handle it
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        
        // Toggle expansion when clicking the card (both mobile and desktop)
        e.stopPropagation();
        toggleCardExpansion(reportId);
    };

    // Get grid columns based on screen size
    const getGridColumns = () => {
        if (windowWidth < 640) return "grid-cols-1";
        if (windowWidth < 1024) return "grid-cols-2";
        return "grid-cols-3";
    };

    // Status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'pending': return 'bg-red-100 text-red-800 border-red-200';
            case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    // Priority color
    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Urgency color
    const getUrgencyColor = (urgency: string) => {
        switch (urgency?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No reports found</h3>
                <p className="text-sm text-gray-500 px-4">
                    {isMobile ? "No reports available" : "Try changing filters"}
                </p>
            </div>
        );
    }

    return (
        <div className={`grid ${getGridColumns()} gap-3 p-3`}>
            {reports.map((report) => {
                const isSelected = selectedReports.includes(report.id);
                const isExpanded = expandedCards.has(report.id);
                
                // Mobile-optimized truncation
                const titleLength = isCompactView ? 25 : 40;
                const locationLength = isCompactView ? 15 : 25;
                const userNameLength = isCompactView ? 12 : 20;
                
                return (
                    <Card 
                        key={report.id} 
                        className={`overflow-hidden border relative transition-all duration-200 ${
                            isSelected ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 
                            'hover:border-gray-300 hover:shadow-sm'
                        } ${isCompactView ? 'min-h-0' : ''} ${isExpanded ? 'shadow-md' : ''} cursor-pointer`}
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
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white shadow-sm h-4 w-4"
                                />
                            </div>
                        )}
                        
                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''}`}>
                            {/* Header row with Report ID and Status */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <FileText className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                    <span 
                                        className="font-medium text-xs text-blue-600 truncate hover:text-blue-800 cursor-help"
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
                                className="font-semibold text-sm mb-1.5 line-clamp-2 hover:text-gray-900"
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
                                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span 
                                        className="text-xs text-gray-600 truncate"
                                        title={report.location}
                                    >
                                        {truncateText(report.location, locationLength)}
                                    </span>
                                </div>
                                
                                {/* Date */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <span 
                                            className="text-xs text-gray-600"
                                            title={`Incident: ${formatDate(report.incident_date)}`}
                                        >
                                            {formatDate(report.incident_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        <span 
                                            className="text-xs text-gray-600"
                                            title={`Created: ${getTimeAgo(report.created_at)} ago`}
                                        >
                                            {getTimeAgo(report.created_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Reporter - compact */}
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-blue-400 flex-shrink-0" />
                                    <span 
                                        className="text-xs text-gray-600 truncate"
                                        title={report.is_anonymous ? 'Anonymous report' : `Reporter: ${report.user?.name || 'Unknown'}`}
                                    >
                                        {report.is_anonymous 
                                            ? 'Anonymous' 
                                            : truncateText(report.user?.name || 'Unknown', userNameLength)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Expand/Collapse indicator area - placed after the primary info */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                    <div className="text-xs text-gray-500">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => toggleCardExpansion(report.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            
                            {/* EXPANDED DETAILS SECTION - Only shows when explicitly expanded */}
                            {isExpanded && (
                                <div className="border-t pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Category and Type */}
                                    {(report.category || report.report_type) && (
                                        <div className="flex flex-wrap gap-1">
                                            {report.category && (
                                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                                    {getDisplayName(report.category)}
                                                </Badge>
                                            )}
                                            {report.report_type && (
                                                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                                                    {getDisplayName(report.report_type)}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Assigned to */}
                                    {report.assigned_to && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <User className="h-3 w-3 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-600">Assigned to:</span>
                                            <span className="font-medium truncate" title={report.assigned_to.name}>
                                                {report.assigned_to.name}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Special flags - now with more details */}
                                    <div className="flex flex-wrap gap-1">
                                        {report.safety_concern && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 border-red-200">
                                                <ShieldAlert className="h-2.5 w-2.5 mr-1" />
                                                Safety Concern
                                            </Badge>
                                        )}
                                        {report.urgency_level && (
                                            <Badge 
                                                variant="outline" 
                                                className={`text-[10px] px-2 py-0.5 ${getUrgencyColor(report.urgency_level)}`}
                                            >
                                                <Zap className="h-2.5 w-2.5 mr-1" />
                                                {report.urgency_level.charAt(0).toUpperCase() + report.urgency_level.slice(1)} Urgency
                                            </Badge>
                                        )}
                                        {report.recurring_issue && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200">
                                                <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                                Recurring Issue
                                            </Badge>
                                        )}
                                        {report.environmental_impact && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                                🌿 Environmental
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Contact info for non-anonymous */}
                                    {!report.is_anonymous && (
                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            {report.user?.phone && (
                                                <div 
                                                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(report.user!.phone!, 'Phone Number');
                                                    }}
                                                    title="Click to copy phone number"
                                                >
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{formatPhoneNumber(report.user.phone)}</span>
                                                </div>
                                            )}
                                            
                                            {/* Purok info */}
                                            {report.user?.purok && (
                                                <div className="flex items-center gap-1.5">
                                                    <Home className="h-3 w-3 flex-shrink-0" />
                                                    <span>Purok {report.user.purok}</span>
                                                </div>
                                            )}
                                            
                                            {/* Email if available */}
                                            {report.user?.email && (
                                                <div 
                                                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCopyToClipboard(report.user!.email!, 'Email');
                                                    }}
                                                    title="Click to copy email"
                                                >
                                                    <MessageSquare className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{report.user.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Description snippet */}
                                    {report.description && (
                                        <div className="text-xs text-gray-600">
                                            <p className="font-medium mb-1">Description:</p>
                                            <p className="line-clamp-3 italic">
                                                "{truncateText(report.description, 120)}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Evidence count */}
                                    {report.evidences && report.evidences.length > 0 && (
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="font-medium">📎</span>
                                            <span>{report.evidences.length} evidence file(s)</span>
                                        </div>
                                    )}
                                    
                                    {/* Collapse button for expanded view */}
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 hover:text-blue-800"
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
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => toggleCardExpansion(report.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        
                        {/* Footer with actions - always visible but compact */}
                        <CardFooter className={`px-3 py-2 border-t bg-gray-50/50 ${isCompactView ? 'py-1.5' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-0.5">
                                    {/* View Details */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(report);
                                                }}
                                            >
                                                <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">View Details</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Copy Report ID */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyToClipboard(report.report_number, 'Report ID');
                                                }}
                                            >
                                                <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Copy ID</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                    {/* Mark as Resolved (if applicable) */}
                                    {report.status !== 'resolved' && report.status !== 'rejected' && onMarkResolved && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-green-600 hover:text-green-700 hover:bg-green-50`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMarkResolved(report);
                                                    }}
                                                >
                                                    <CheckCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
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
                                            className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 hover:text-red-700 hover:bg-red-50`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(report);
                                            }}
                                        >
                                            {isCompactView ? (
                                                <span className="text-xs font-medium">✕</span>
                                            ) : (
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
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