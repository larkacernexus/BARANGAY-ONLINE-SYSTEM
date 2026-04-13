// components/admin/report-types/ReportTypesGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
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
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    MoreVertical,
    Copy,
    Clipboard,
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
    XCircle,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useMemo, useCallback, useEffect } from 'react';

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
    windowWidth?: number;
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
    formatDate,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: ReportTypesGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);
    
    const getPriorityColor = (priorityLevel: number): string => {
        switch(priorityLevel) {
            case 1: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 2: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 4: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (typeId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(typeId, e);
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedReportTypes), [selectedReportTypes]);

    const emptyState = (
        <EmptyState
            title="No report types found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a report type.'}
            icon={<FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = route('admin.report-types.create')}
            createLabel="Create Report Type"
        />
    );

    // Early return for empty state
    if (reportTypes.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {reportTypes.map((reportType) => {
                const priorityDetails = getPriorityDetails(reportType.priority_level);
                const isSelected = selectedSet.has(reportType.id);
                const isExpanded = expandedId === reportType.id;
                
                return (
                    <Card 
                        key={reportType.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(reportType.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        reportType.is_active 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        <FileText className={`h-5 w-5 ${
                                            reportType.is_active 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono font-medium text-sm text-gray-500 dark:text-gray-400">
                                            {reportType.code || 'N/A'}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={reportType.name}>
                                            {reportType.name || 'Unnamed'}
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(reportType.id)}
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
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.report-types.show', reportType.id)} className="flex items-center">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.report-types.edit', reportType.id)} className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Report Type
                                                </Link>
                                            </DropdownMenuItem>

                                            {onDuplicate && (
                                                <DropdownMenuItem onClick={() => onDuplicate(reportType)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={() => onCopyToClipboard(reportType.code || '', 'Report Type Code')}>
                                                <Clipboard className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem asChild>
                                                <Link href={route('admin.community-reports.index', { report_type: reportType.id })} className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Reports
                                                </Link>
                                            </DropdownMenuItem>

                                            {onToggleStatus && (
                                                <DropdownMenuItem onClick={() => onToggleStatus(reportType)}>
                                                    {reportType.is_active ? (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onItemSelect(reportType.id)}>
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
                                            
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400"
                                                onClick={() => onDelete(reportType)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Report Type
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(reportType.is_active)}`}
                                >
                                    {reportType.is_active ? 
                                        <CheckCircle className="h-3 w-3 mr-1" /> : 
                                        <XCircle className="h-3 w-3 mr-1" />
                                    }
                                    {reportType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getPriorityColor(reportType.priority_level)}`}
                                >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {priorityDetails.label} Priority
                                </Badge>
                            </div>

                            {/* Color Bar */}
                            {reportType.color && (
                                <div 
                                    className="h-1 w-full rounded mb-3"
                                    style={{ backgroundColor: reportType.color }}
                                />
                            )}

                            {/* Description */}
                            {reportType.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2" title={reportType.description}>
                                    {reportType.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {reportType.resolution_days} days
                                        </span>
                                        <span className="text-xs text-gray-500">resolution</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {reportType.requires_immediate_action && (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                            <span className="text-amber-600 dark:text-amber-400 text-xs">
                                                Urgent Action
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Feature Badges */}
                            <div className="flex flex-wrap gap-1 mb-2">
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

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(reportType.id, e)}
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
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Full Description */}
                                    {reportType.description && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description:</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {reportType.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Priority Details */}
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Priority Level:</p>
                                        <Badge className={getPriorityColor(reportType.priority_level)}>
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {priorityDetails.label} (Level {reportType.priority_level})
                                        </Badge>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(reportType.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(reportType.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <Link
                                            href={route('admin.community-reports.index', { report_type: reportType.id })}
                                            className="flex-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                View Associated Reports
                                            </button>
                                        </Link>
                                    </div>

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('admin.report-types.show', reportType.id)}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </Link>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(reportType.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}