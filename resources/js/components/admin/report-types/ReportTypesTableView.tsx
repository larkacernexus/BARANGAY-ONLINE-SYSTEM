// components/admin/report-types/ReportTypesTableView.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Copy,
    Eye,
    Edit,
    Trash2,
    Square,
    CheckSquare,
    Clipboard,
    AlertTriangle,
    Clock,
    User,
    Shield,
    Zap,
    FileText
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

interface FilterState {
    search: string;
    status: string;
    priority: string;
    requires_action: string;
}

interface ReportTypesTableViewProps {
    reportTypes: ReportType[];
    isBulkMode: boolean;
    selectedReportTypes: number[];
    filtersState: FilterState;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (reportType: ReportType) => void;
    onToggleStatus?: (reportType: ReportType) => void;
    onDuplicate?: (reportType: ReportType) => void;
    onViewPhoto: (reportType: ReportType) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    getPriorityDetails: (priorityLevel: number) => {
        label: string;
        color: string;
        icon: string;
    };
    formatDate: (dateString: string) => string;
}

export default function ReportTypesTableView({
    reportTypes,
    isBulkMode,
    selectedReportTypes,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onDuplicate,
    onViewPhoto,
    onCopyToClipboard,
    onSelectAllOnPage,
    isSelectAll,
    getPriorityDetails,
    formatDate
}: ReportTypesTableViewProps) {
    
    // Get sort icon
    const getSortIcon = (field: string) => {
        // This is a simplified version - in a real app you'd track sort state
        return null;
    };

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
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && reportTypes.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code
                                        {getSortIcon('code')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('priority_level')}
                                >
                                    <div className="flex items-center gap-1">
                                        Priority
                                        {getSortIcon('priority_level')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => onSort('resolution_days')}
                                >
                                    <div className="flex items-center gap-1">
                                        Resolution Time
                                        {getSortIcon('resolution_days')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    Features
                                </TableHead>
                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                    Status
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {reportTypes.map((reportType) => {
                                const priorityDetails = getPriorityDetails(reportType.priority_level);
                                const isSelected = selectedReportTypes.includes(reportType.id);
                                
                                return (
                                    <TableRow 
                                        key={reportType.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
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
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(reportType.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-mono font-medium">{reportType.code || 'N/A'}</div>
                                            {reportType.color && (
                                                <div 
                                                    className="h-2 w-8 rounded mt-1"
                                                    style={{ backgroundColor: reportType.color }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="font-medium">{reportType.name || 'Unnamed'}</div>
                                            {reportType.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {reportType.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge 
                                                variant={getPriorityBadgeVariant(reportType.priority_level)}
                                                className="flex items-center gap-1"
                                                style={{ backgroundColor: priorityDetails.color }}
                                            >
                                                <AlertTriangle className="h-3 w-3" />
                                                {priorityDetails.label}
                                            </Badge>
                                            {reportType.requires_immediate_action && (
                                                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                    <Zap className="h-3 w-3" />
                                                    Urgent Action Required
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{reportType.resolution_days}</span>
                                                <span className="text-sm text-gray-500">days</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Expected resolution
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {reportType.requires_evidence && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Evidence Required
                                                    </Badge>
                                                )}
                                                {reportType.allows_anonymous && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <User className="h-3 w-3 mr-1" />
                                                        Anonymous Allowed
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge variant={reportType.is_active ? "default" : "secondary"}>
                                                {reportType.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.report-types.show', reportType.id)} className="flex items-center cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.report-types.edit', reportType.id)} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit Report Type</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {onDuplicate && (
                                                        <DropdownMenuItem 
                                                            onClick={() => onDuplicate(reportType)}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            <span>Duplicate</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => onCopyToClipboard(reportType.code || '', 'Report Type Code')}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Clipboard className="mr-2 h-4 w-4" />
                                                        <span>Copy Code</span>
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuItem asChild>
                                                    <Link href={route('admin.community-reports.index', { report_type: reportType.id })}
                                                        className="flex items-center cursor-pointer">
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            <span>View Reports</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {isBulkMode && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => onItemSelect(reportType.id)}
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
                                                    
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => onDelete(reportType)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Report Type</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}