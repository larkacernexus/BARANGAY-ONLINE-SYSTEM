// components/admin/report-types/ReportTypesGridView.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    MoreVertical,
    Copy,
    Eye,
    Edit,
    Trash2,
    AlertTriangle,
    Clock,
    User,
    Shield,
    Zap,
    FileText,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface ReportType {
    id: number;
    name: string;
    code: string;
    description?: string;
    icon?: string;
    color?: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    created_at: string;
    updated_at: string;
}

interface ReportTypesGridViewProps {
    reportTypes: ReportType[];
    isBulkMode: boolean;
    selectedReportTypes: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (reportType: ReportType) => void;
    onToggleStatus?: (reportType: ReportType) => void;
    onDuplicate?: (reportType: ReportType) => void;
    onViewPhoto: (reportType: ReportType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    getPriorityDetails: (priorityLevel: number) => {
        label: string;
        color: string;
        icon: string;
    };
    formatDate: (dateString: string) => string;
}

export default function ReportTypesGridView({
    reportTypes,
    isBulkMode,
    selectedReportTypes,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    getPriorityDetails,
    formatDate
}: ReportTypesGridViewProps) {
    
    const getPriorityBadgeVariant = (priorityLevel: number) => {
        switch(priorityLevel) {
            case 1: return "destructive";
            case 2: return "default";
            case 3: return "secondary";
            case 4: return "outline";
            default: return "outline";
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {reportTypes.map((reportType) => {
                const priorityDetails = getPriorityDetails(reportType.priority_level);
                const isSelected = selectedReportTypes.includes(reportType.id);
                
                return (
                    <Card 
                        key={reportType.id}
                        className={`overflow-hidden hover:shadow-md transition-all duration-200 border ${
                            isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/50' : 'border-gray-200'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content') &&
                                !e.target.closest('input[type="checkbox"]')) {
                                onItemSelect(reportType.id);
                            }
                        }}
                    >
                        <div className="p-4">
                            {/* Header with selection checkbox and actions */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(reportType.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <Badge 
                                        variant={getPriorityBadgeVariant(reportType.priority_level)}
                                        className="flex items-center gap-1"
                                        style={{ backgroundColor: priorityDetails.color }}
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        {priorityDetails.label}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 hover:bg-gray-100"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('report-types.show', reportType.id)} className="flex items-center cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                            <Link href={route('report-types.edit', reportType.id)} className="flex items-center cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Report Type</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyToClipboard(reportType.code || '', 'Code');
                                            }}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy Code</span>
                                        </DropdownMenuItem>
                                        
                                        {onToggleStatus && (
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(reportType);
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                {reportType.is_active ? (
                                                    <>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        <span>Deactivate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span>Activate</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(reportType);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Report Type</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Report Type Code and Name */}
                            <div className="mb-3">
                                <div className="font-mono font-medium text-sm text-gray-600 mb-1">
                                    {reportType.code || 'N/A'}
                                </div>
                                <h3 
                                    className="font-semibold text-gray-900 truncate"
                                    title={reportType.name}
                                >
                                    {reportType.name || 'Unnamed'}
                                </h3>
                                {reportType.color && (
                                    <div 
                                        className="h-1 w-full rounded mt-2"
                                        style={{ backgroundColor: reportType.color }}
                                    />
                                )}
                            </div>

                            {/* Description */}
                            {reportType.description && (
                                <p 
                                    className="text-sm text-gray-600 mb-4 line-clamp-2"
                                    title={reportType.description}
                                >
                                    {reportType.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">
                                            {reportType.resolution_days} days
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reportType.is_active ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-gray-500" />
                                        )}
                                        <span className="text-xs">
                                            {reportType.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {reportType.requires_immediate_action && (
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span className="text-xs text-amber-600">
                                                Urgent Action
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                <Badge 
                                    variant={getPriorityBadgeVariant(reportType.priority_level)}
                                    className="text-xs"
                                    style={{ backgroundColor: priorityDetails.color }}
                                >
                                    {priorityDetails.label} Priority
                                </Badge>
                                {reportType.requires_evidence && (
                                    <Badge variant="outline" className="text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Evidence Required
                                    </Badge>
                                )}
                                {reportType.allows_anonymous && (
                                    <Badge variant="outline" className="text-xs">
                                        <User className="h-3 w-3 mr-1" />
                                        Anonymous
                                    </Badge>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t">
                                <span className="text-xs text-gray-500">
                                    Updated: {formatDate(reportType.updated_at)}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={route('my.complaints.index', { type: reportType.id })}>
                                            <Button size="sm" variant="outline">
                                                <FileText className="h-3 w-3 mr-1" />
                                                View Reports
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View associated reports</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}