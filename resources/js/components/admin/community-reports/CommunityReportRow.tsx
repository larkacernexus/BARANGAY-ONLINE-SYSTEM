import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { CommunityReport } from '@/admin-utils/communityReportTypes';
import { 
    FileText, 
    MapPin, 
    MoreVertical, 
    ChevronUp, 
    ChevronDown,
    Eye,
    Printer,
    Trash2,
    Clipboard,
    Link as LinkIcon,
    CheckSquare,
    Square,
    CheckCircle,
    User,
    Phone,
    Home,
    Mail,
    UserX,
    Shield,
    UserCheck,
    AlertTriangle,
    AlertCircle,
    Clock,
    X,
    Zap,
    Info,
    Globe,
    Users as UsersIcon,
    ShieldAlert,
    AlertOctagon,
    RefreshCw,
} from 'lucide-react';
import { 
    getStatusBadgeVariant, 
    getStatusIcon, 
    getPriorityBadgeVariant, 
    getPriorityIcon,
    getUrgencyIcon,
    getImpactIcon,
    getAffectedPeopleIcon,
    truncateText,
    formatDate,
    getTimeAgo,
    formatDateTime
} from '@/admin-utils/communityReportHelpers';

interface CommunityReportRowProps {
    report: CommunityReport;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    windowWidth: number;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    onItemSelect: (id: number) => void;
    onDelete: (report: CommunityReport) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onToggleExpand: (id: number) => void;
    onMarkResolved?: (report: CommunityReport) => void;
}

export default function CommunityReportRow({
    report,
    isBulkMode,
    isSelected,
    isExpanded,
    windowWidth,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    onItemSelect,
    onDelete,
    onCopyToClipboard,
    onToggleExpand,
    onMarkResolved
}: CommunityReportRowProps) {
    
    const hasEvidence = report.evidences && report.evidences.length > 0;
    const titleLength = 50; // You can make this dynamic based on windowWidth
    const descriptionLength = 45;
    const locationLength = 30;
    const userNameLength = 25;
    
    return (
        <>
            <TableRow 
                className={`hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                } ${isExpanded ? 'bg-gray-50' : ''}`}
                onClick={(e) => {
                    if (isBulkMode && e.target instanceof HTMLElement && 
                        !e.target.closest('a') && 
                        !e.target.closest('button') &&
                        !e.target.closest('.dropdown-menu-content') &&
                        !e.target.closest('input[type="checkbox"]')) {
                        onItemSelect(report.id);
                    }
                }}
            >
                {isBulkMode && (
                    <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(report.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div 
                        className="flex items-center gap-2 cursor-text select-text"
                        onDoubleClick={(e) => {
                            const selection = window.getSelection();
                            if (selection) {
                                const range = document.createRange();
                                range.selectNodeContents(e.currentTarget);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }}
                        title={`Double-click to select all\nReport ID: ${report.report_number}`}
                    >
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div 
                            className="font-mono text-sm font-medium text-blue-600 truncate"
                            data-full-text={report.report_number}
                        >
                            {truncateText(report.report_number, 12)}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {report.report_type?.name}
                        {report.report_type?.category && ` • ${report.report_type.category}`}
                    </div>
                    {hasEvidence && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Evidence
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div 
                        className="cursor-text select-text"
                        onDoubleClick={(e) => {
                            const selection = window.getSelection();
                            if (selection) {
                                const range = document.createRange();
                                range.selectNodeContents(e.currentTarget);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }}
                        title={`Double-click to select all\nTitle: ${report.title}\nDescription: ${report.description}`}
                    >
                        <div 
                            className="font-medium mb-1 truncate"
                            data-full-text={report.title}
                        >
                            {truncateText(report.title, titleLength)}
                        </div>
                        <div 
                            className="text-sm text-gray-600 mb-2 truncate"
                            data-full-text={report.description}
                        >
                            {truncateText(report.description, descriptionLength)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <div 
                                className="truncate"
                                data-full-text={report.location}
                            >
                                {truncateText(report.location, locationLength)}
                            </div>
                        </div>
                    </div>
                    {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {report.tags.slice(0, 3).map((tag, index) => (
                                <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs"
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {report.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{report.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {report.safety_concern && (
                            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                Safety Concern
                            </Badge>
                        )}
                        {report.environmental_impact && (
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                <AlertOctagon className="h-3 w-3 mr-1" />
                                Environmental
                            </Badge>
                        )}
                        {report.recurring_issue && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Recurring
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="space-y-2">
                        <Badge 
                            variant={getPriorityBadgeVariant(report.priority)} 
                            className="flex items-center gap-1 w-fit"
                        >
                            {getPriorityIcon(report.priority)}
                            {safePriorities[report.priority] || report.priority || 'N/A'}
                        </Badge>
                        <Badge 
                            variant={getStatusBadgeVariant(report.status)} 
                            className="flex items-center gap-1 w-fit"
                        >
                            {getStatusIcon(report.status)}
                            {safeStatuses[report.status] || report.status || 'N/A'}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                {getUrgencyIcon(report.urgency_level)}
                                {safeUrgencies[report.urgency_level] || report.urgency_level || 'N/A'}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                {getImpactIcon(report.impact_level)}
                                {report.impact_level ? report.impact_level.replace('_', ' ').toUpperCase() : 'N/A'}
                            </Badge>
                        </div>
                        {report.estimated_affected_count && (
                            <Badge variant="outline" className="w-fit">
                                {getAffectedPeopleIcon(report.affected_people)}
                                <span className="ml-1">{report.estimated_affected_count} affected</span>
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="space-y-1 text-sm">
                        <div>
                            <span className="text-gray-600">Incident:</span>{' '}
                            <span className="font-medium">{formatDate(report.incident_date)}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Reported:</span>{' '}
                            <span className="font-medium">{getTimeAgo(report.created_at)}</span>
                        </div>
                        {report.resolved_at && (
                            <div className="text-xs text-green-600">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                Resolved: {formatDateTime(report.resolved_at)}
                            </div>
                        )}
                        {report.recurring_issue && (
                            <div className="text-xs text-yellow-600">
                                <RefreshCw className="h-3 w-3 inline mr-1" />
                                Recurring Issue
                            </div>
                        )}
                        {report.duration_hours && (
                            <div className="text-xs text-blue-600">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Duration: {report.duration_hours} hours
                            </div>
                        )}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="space-y-2">
                        {report.is_anonymous ? (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-600">
                                    Anonymous Reporter
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Protected
                                </Badge>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div 
                                    className="font-medium truncate"
                                    title={report.user?.name}
                                >
                                    {truncateText(report.user?.name || 'Unknown Reporter', userNameLength)}
                                </div>
                                <div className="text-sm text-gray-500 space-y-1">
                                    {report.user?.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {report.user.phone}
                                        </div>
                                    )}
                                    {report.user?.purok && (
                                        <div className="flex items-center gap-1">
                                            <Home className="h-3 w-3" />
                                            Purok {report.user.purok}
                                        </div>
                                    )}
                                    {report.user?.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {truncateText(report.user.email, 20)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {report.assigned_to && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border">
                                <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <div className="font-medium text-sm">
                                        {report.assigned_to.name}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!report.assigned_to && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                                <UserX className="h-3 w-3 mr-1" />
                                Unassigned
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-right sticky right-0 bg-white">
                    <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggleExpand(report.id)}
                                    className="h-8 w-8 p-0"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isExpanded ? 'Collapse details' : 'Expand details'}
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/community-reports/${report.id}`} className="flex items-center cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View Details</span>
                                    </Link>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                    onClick={() => onCopyToClipboard(report.report_number, 'Report ID')}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Clipboard className="mr-2 h-4 w-4" />
                                    <span>Copy Report ID</span>
                                </DropdownMenuItem>
                                
                                {report.user?.phone && !report.is_anonymous && (
                                    <DropdownMenuItem 
                                        onClick={() => onCopyToClipboard(report.user!.phone!, 'Phone Number')}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <Clipboard className="mr-2 h-4 w-4" />
                                        <span>Copy Contact</span>
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                    onClick={() => {
                                        const url = `${window.location.origin}/admin/community-reports/${report.id}`;
                                        onCopyToClipboard(url, 'Report URL');
                                    }}
                                    className="flex items-center cursor-pointer"
                                >
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/community-reports/${report.id}/print`} className="flex items-center cursor-pointer">
                                        <Printer className="mr-2 h-4 w-4" />
                                        <span>Print Details</span>
                                    </Link>
                                </DropdownMenuItem>

                                {isBulkMode && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => onItemSelect(report.id)}
                                            className="flex items-center cursor-pointer"
                                        >
                                            {isSelected ? (
                                                <>
                                                    <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                    <span className="text-green-600">Deselect</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Square className="mr-2 h-4 w-4" />
                                                    <span>Select for Bulk</span>
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {report.status !== 'resolved' && report.status !== 'rejected' && onMarkResolved && (
                                    <DropdownMenuItem 
                                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                        onClick={() => onMarkResolved(report)}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        <span>Mark as Resolved</span>
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                    onClick={() => onDelete(report)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Report</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TableCell>
            </TableRow>
        </>
    );
}