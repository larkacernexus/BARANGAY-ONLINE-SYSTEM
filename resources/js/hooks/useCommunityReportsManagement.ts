import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    CommunityReport, 
    PaginationData, 
    Filters, 
    Stats, 
    BulkOperation 
} from '@/types/communityReportTypes';
import { 
    formatDate, 
    formatDateTime, 
    getTruncationLength 
} from '@/admin-utils/communityReportHelpers';

interface UseCommunityReportsManagementProps {
    reports: any;
    filters: Filters;
    statuses?: Record<string, string>;
    priorities?: Record<string, string>;
    urgencies?: Record<string, string>;
    report_types?: Array<{id: number, name: string, category: string}>;
    categories?: string[];
    puroks?: string[];
    staff?: Array<{id: number, name: string}>;
    stats: Stats;
}

export function useCommunityReportsManagement({
    reports: rawReports,
    filters,
    statuses: rawStatuses,
    priorities: rawPriorities,
    urgencies: rawUrgencies,
    report_types: rawReportTypes,
    categories: rawCategories,
    puroks: rawPuroks,
    staff: rawStaff,
    stats: rawStats
}: UseCommunityReportsManagementProps) {
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(filters.urgency || 'all');
    const [reportTypeFilter, setReportTypeFilter] = useState(filters.report_type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [impactFilter, setImpactFilter] = useState(filters.impact_level || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok || 'all');
    const [assignedFilter, setAssignedFilter] = useState(filters.assigned_to || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters.source || 'all');
    const [fromDateFilter, setFromDateFilter] = useState(filters.from_date || '');
    const [toDateFilter, setToDateFilter] = useState(filters.to_date || '');
    const [hasEvidencesFilter, setHasEvidencesFilter] = useState(filters.has_evidences || false);
    const [safetyConcernFilter, setSafetyConcernFilter] = useState(filters.safety_concern || false);
    const [environmentalFilter, setEnvironmentalFilter] = useState(filters.environmental_impact || false);
    const [recurringFilter, setRecurringFilter] = useState(filters.recurring_issue || false);
    const [anonymousFilter, setAnonymousFilter] = useState(filters.is_anonymous || false);
    const [affectedPeopleFilter, setAffectedPeopleFilter] = useState(filters.affected_people || 'all');
    
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPriorityDialog, setShowBulkPriorityDialog] = useState(false);
    const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedReport, setExpandedReport] = useState<number | null>(null);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // SAFE initialization with proper fallbacks
    const safeReports = useMemo(() => {
        if (Array.isArray(rawReports)) {
            return {
                data: rawReports,
                total: rawReports.length,
                current_page: 1,
                per_page: 10,
                last_page: 1,
                from: 1,
                to: rawReports.length,
            };
        }
        
        if (rawReports && typeof rawReports === 'object') {
            const data = Array.isArray(rawReports.data) 
                ? rawReports.data 
                : [];
            
            return {
                data,
                total: rawReports.total || data.length || 0,
                current_page: rawReports.current_page || 1,
                per_page: rawReports.per_page || 10,
                last_page: rawReports.last_page || 1,
                from: rawReports.from || 0,
                to: rawReports.to || data.length,
            };
        }
        
        return {
            data: [],
            total: 0,
            current_page: 1,
            per_page: 10,
            last_page: 1,
            from: 0,
            to: 0,
        };
    }, [rawReports]);

    // SAFE props with defaults
    const safeStatuses = useMemo(() => {
        if (rawStatuses && typeof rawStatuses === 'object' && Object.keys(rawStatuses).length > 0) {
            return rawStatuses;
        }
        return {
            pending: 'Pending',
            under_review: 'Under Review',
            assigned: 'Assigned',
            in_progress: 'In Progress',
            resolved: 'Resolved',
            rejected: 'Rejected'
        };
    }, [rawStatuses]);

    const safePriorities = useMemo(() => {
        if (rawPriorities && typeof rawPriorities === 'object' && Object.keys(rawPriorities).length > 0) {
            return rawPriorities;
        }
        return {
            critical: 'Critical',
            high: 'High',
            medium: 'Medium',
            low: 'Low'
        };
    }, [rawPriorities]);

    const safeUrgencies = useMemo(() => {
        if (rawUrgencies && typeof rawUrgencies === 'object' && Object.keys(rawUrgencies).length > 0) {
            return rawUrgencies;
        }
        return {
            high: 'High',
            medium: 'Medium',
            low: 'Low'
        };
    }, [rawUrgencies]);

    const safeReportTypes = useMemo(() => {
        return Array.isArray(rawReportTypes) ? rawReportTypes : [];
    }, [rawReportTypes]);

    const safeCategories = useMemo(() => {
        return Array.isArray(rawCategories) ? rawCategories : [];
    }, [rawCategories]);

    const safePuroks = useMemo(() => {
        return Array.isArray(rawPuroks) ? rawPuroks : [];
    }, [rawPuroks]);

    const safeStaff = useMemo(() => {
        return Array.isArray(rawStaff) ? rawStaff : [];
    }, [rawStaff]);

    const safeStats = useMemo(() => ({
        total: rawStats?.total || safeReports.total || 0,
        pending: rawStats?.pending || 0,
        under_review: rawStats?.under_review || 0,
        assigned: rawStats?.assigned || 0,
        in_progress: rawStats?.in_progress || 0,
        resolved: rawStats?.resolved || 0,
        rejected: rawStats?.rejected || 0,
        critical_priority: rawStats?.critical_priority || 0,
        high_priority: rawStats?.high_priority || 0,
        medium_priority: rawStats?.medium_priority || 0,
        low_priority: rawStats?.low_priority || 0,
        high_urgency: rawStats?.high_urgency || 0,
        today: rawStats?.today || 0,
        this_week: rawStats?.this_week || 0,
        this_month: rawStats?.this_month || 0,
        anonymous: rawStats?.anonymous || 0,
        with_evidences: rawStats?.with_evidences || 0,
        safety_concerns: rawStats?.safety_concerns || 0,
        environmental_issues: rawStats?.environmental_issues || 0,
        recurring_issues: rawStats?.recurring_issues || 0,
        community_impact_count: rawStats?.community_impact_count || 0,
        individual_impact_count: rawStats?.individual_impact_count || 0,
        average_resolution_time: rawStats?.average_resolution_time || '0 days',
    }), [rawStats, safeReports.total]);

    // Filter reports client-side
    const filteredReports = useMemo(() => {
        let result = [...safeReports.data];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(report => 
                report.report_number?.toLowerCase().includes(searchLower) ||
                report.title?.toLowerCase().includes(searchLower) ||
                report.description?.toLowerCase().includes(searchLower) ||
                report.detailed_description?.toLowerCase().includes(searchLower) ||
                report.location?.toLowerCase().includes(searchLower) ||
                report.report_type?.name?.toLowerCase().includes(searchLower) ||
                report.report_type?.category?.toLowerCase().includes(searchLower) ||
                report.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
                report.resolution_notes?.toLowerCase().includes(searchLower) ||
                (!report.is_anonymous && report.user?.name?.toLowerCase().includes(searchLower)) ||
                (!report.is_anonymous && report.user?.email?.toLowerCase().includes(searchLower)) ||
                (!report.is_anonymous && report.user?.phone?.includes(search)) ||
                report.reporter_name?.toLowerCase().includes(searchLower) ||
                report.reporter_contact?.includes(search)
            );
        }

        // Apply all other filters...
        if (statusFilter !== 'all') result = result.filter(report => report.status === statusFilter);
        if (priorityFilter !== 'all') result = result.filter(report => report.priority === priorityFilter);
        if (urgencyFilter !== 'all') result = result.filter(report => report.urgency_level === urgencyFilter);
        if (reportTypeFilter !== 'all') result = result.filter(report => report.report_type_id.toString() === reportTypeFilter);
        if (categoryFilter !== 'all') result = result.filter(report => report.report_type?.category === categoryFilter);
        if (impactFilter !== 'all') result = result.filter(report => report.impact_level === impactFilter);
        if (purokFilter !== 'all') result = result.filter(report => !report.is_anonymous && report.user?.purok === purokFilter);
        if (assignedFilter !== 'all') {
            if (assignedFilter === 'unassigned') {
                result = result.filter(report => !report.assigned_to);
            } else {
                const assignedId = parseInt(assignedFilter);
                result = result.filter(report => report.assigned_to?.id === assignedId);
            }
        }
        if (sourceFilter !== 'all') result = result.filter(report => report.source === sourceFilter);
        if (fromDateFilter) {
            try {
                const fromDate = new Date(fromDateFilter);
                result = result.filter(report => new Date(report.incident_date) >= fromDate);
            } catch {}
        }
        if (toDateFilter) {
            try {
                const toDate = new Date(toDateFilter);
                result = result.filter(report => new Date(report.incident_date) <= toDate);
            } catch {}
        }
        if (hasEvidencesFilter) result = result.filter(report => (report.evidences && report.evidences.length > 0));
        if (safetyConcernFilter) result = result.filter(report => report.safety_concern === true);
        if (environmentalFilter) result = result.filter(report => report.environmental_impact === true);
        if (recurringFilter) result = result.filter(report => report.recurring_issue === true);
        if (anonymousFilter) result = result.filter(report => report.is_anonymous === true);
        if (affectedPeopleFilter !== 'all') result = result.filter(report => report.affected_people === affectedPeopleFilter);

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            try {
                switch (sortBy) {
                    case 'report_number':
                        aValue = a.report_number?.toLowerCase() || '';
                        bValue = b.report_number?.toLowerCase() || '';
                        break;
                    case 'title':
                        aValue = a.title?.toLowerCase() || '';
                        bValue = b.title?.toLowerCase() || '';
                        break;
                    case 'incident_date':
                        aValue = new Date(a.incident_date).getTime();
                        bValue = new Date(b.incident_date).getTime();
                        break;
                    case 'created_at':
                        aValue = new Date(a.created_at).getTime();
                        bValue = new Date(b.created_at).getTime();
                        break;
                    case 'updated_at':
                        aValue = new Date(a.updated_at).getTime();
                        bValue = new Date(b.updated_at).getTime();
                        break;
                    case 'status':
                        aValue = a.status || '';
                        bValue = b.status || '';
                        break;
                    case 'priority':
                        const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
                        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
                        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
                        break;
                    case 'urgency':
                        const urgencyOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                        aValue = urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] || 0;
                        bValue = urgencyOrder[b.urgency_level as keyof typeof urgencyOrder] || 0;
                        break;
                    case 'impact_level':
                        const impactOrder: Record<string, number> = { severe: 4, major: 3, moderate: 2, minor: 1 };
                        aValue = impactOrder[a.impact_level as keyof typeof impactOrder] || 0;
                        bValue = impactOrder[b.impact_level as keyof typeof impactOrder] || 0;
                        break;
                    case 'estimated_affected_count':
                        aValue = a.estimated_affected_count || 0;
                        bValue = b.estimated_affected_count || 0;
                        break;
                    default:
                        aValue = new Date(a.created_at).getTime();
                        bValue = new Date(b.created_at).getTime();
                }
            } catch {
                aValue = 0;
                bValue = 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [
        safeReports.data, search, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter, 
        categoryFilter, impactFilter, purokFilter, assignedFilter, sourceFilter,
        fromDateFilter, toDateFilter, hasEvidencesFilter, safetyConcernFilter, environmentalFilter,
        recurringFilter, anonymousFilter, affectedPeopleFilter, sortBy, sortOrder
    ]);

    // Calculate pagination
    const totalItems = filteredReports.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        search, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter, categoryFilter, 
        impactFilter, purokFilter, assignedFilter, sourceFilter,
        fromDateFilter, toDateFilter, hasEvidencesFilter, safetyConcernFilter, environmentalFilter,
        recurringFilter, anonymousFilter, affectedPeopleFilter, sortBy, sortOrder
    ]);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedReports.length > 0) {
                        setSelectedReports([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Delete' && isBulkMode && selectedReports.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedReports, showBulkActions, showSelectionOptions, expandedReport]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedReports([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedReports.map(report => report.id);
        const allSelected = allPageIds.every(id => selectedReports.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReports, paginatedReports]);

    // Get selected reports data
    const selectedReportsData = useMemo(() => {
        return filteredReports.filter(report => selectedReports.includes(report.id));
    }, [selectedReports, filteredReports]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedReportsData;
        const evidenceCount = selectedData.filter(report => 
            (report.evidences && report.evidences.length > 0)
        ).length;
        
        const communityImpactCount = selectedData.filter(report => 
            report.affected_people === 'community' || report.affected_people === 'multiple'
        ).length;
        
        return {
            total: selectedData.length,
            pending: selectedData.filter(c => c.status === 'pending').length,
            under_review: selectedData.filter(c => c.status === 'under_review').length,
            assigned: selectedData.filter(c => c.status === 'assigned').length,
            in_progress: selectedData.filter(c => c.status === 'in_progress').length,
            resolved: selectedData.filter(c => c.status === 'resolved').length,
            rejected: selectedData.filter(c => c.status === 'rejected').length,
            critical: selectedData.filter(c => c.priority === 'critical').length,
            high_priority: selectedData.filter(c => c.priority === 'high').length,
            medium_priority: selectedData.filter(c => c.priority === 'medium').length,
            low_priority: selectedData.filter(c => c.priority === 'low').length,
            high_urgency: selectedData.filter(c => c.urgency_level === 'high').length,
            anonymous: selectedData.filter(c => c.is_anonymous).length,
            withEvidence: evidenceCount,
            assignedCount: selectedData.filter(c => c.assigned_to).length,
            safetyConcern: selectedData.filter(c => c.safety_concern).length,
            environmentalImpact: selectedData.filter(c => c.environmental_impact).length,
            recurringIssue: selectedData.filter(c => c.recurring_issue).length,
            communityImpact: communityImpactCount,
            totalEstimatedAffected: selectedData.reduce((sum, c) => sum + (c.estimated_affected_count || 0), 0),
        };
    }, [selectedReportsData]);

    // Handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedReports.map(report => report.id);
        if (isSelectAll) {
            setSelectedReports(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReports, ...pageIds])];
            setSelectedReports(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedReports, isSelectAll, selectedReports]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredReports.map(report => report.id);
        if (selectedReports.length === allIds.length && allIds.every(id => selectedReports.includes(id))) {
            setSelectedReports(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReports, ...allIds])];
            setSelectedReports(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredReports, selectedReports]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${safeReports.total} reports. This action may take a moment.`)) {
            const pageIds = paginatedReports.map(report => report.id);
            setSelectedReports(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    }, [safeReports.total, paginatedReports]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedReports(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedReports.length === 0) {
            toast.error('Please select at least one report');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'print':
                    const exportData = selectedReportsData.map(report => ({
                        'Report ID': report.report_number || 'N/A',
                        'Title': report.title || 'N/A',
                        'Type': report.report_type?.name || 'N/A',
                        'Category': report.report_type?.category || 'N/A',
                        'Location': report.location || 'N/A',
                        'Incident Date': formatDate(report.incident_date),
                        'Priority': safePriorities[report.priority] || report.priority || 'N/A',
                        'Urgency': safeUrgencies[report.urgency_level] || report.urgency_level || 'N/A',
                        'Status': safeStatuses[report.status] || report.status || 'N/A',
                        'Impact Level': report.impact_level ? report.impact_level.replace('_', ' ').toUpperCase() : 'N/A',
                        'Anonymous': report.is_anonymous ? 'Yes' : 'No',
                        'Resident Name': report.is_anonymous ? 'Anonymous' : report.user?.name || 'N/A',
                        'Purok': report.is_anonymous ? 'N/A' : report.user?.purok || 'N/A',
                        'Contact': report.is_anonymous ? 'N/A' : report.user?.phone || report.user?.email || 'N/A',
                        'Assigned To': report.assigned_to?.name || 'Unassigned',
                        'Created At': formatDateTime(report.created_at),
                        'Updated At': formatDateTime(report.updated_at),
                        'Resolution Date': report.resolved_at ? formatDateTime(report.resolved_at) : 'N/A',
                        'Safety Concern': report.safety_concern ? 'Yes' : 'No',
                        'Environmental Impact': report.environmental_impact ? 'Yes' : 'No',
                        'Recurring Issue': report.recurring_issue ? 'Yes' : 'No',
                        'Affected People': report.affected_people || 'N/A',
                        'Estimated Affected Count': report.estimated_affected_count || 'N/A',
                        'Evidence Files': report.evidences ? report.evidences.length : 0,
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') 
                                    ? `"${value}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `community-reports-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`Exported ${selectedReports.length} reports successfully`);
                    break;

                case 'delete':
                    await router.post('/admin/community-reports/bulk-action', {
                        action: 'delete',
                        report_ids: selectedReports,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedReports.length} report(s) deleted successfully`);
                            setSelectedReports([]);
                            setShowBulkDeleteDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to delete reports');
                            console.error('Delete errors:', errors);
                        }
                    });
                    break;

                case 'update_status':
                    await router.post('/admin/community-reports/bulk-action', {
                        action: 'update_status',
                        report_ids: selectedReports,
                        status: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedReports.length} report(s) status updated`);
                            setShowBulkStatusDialog(false);
                            setBulkEditValue('');
                            setSelectedReports([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update status');
                            console.error('Status update errors:', errors);
                        }
                    });
                    break;

                case 'update_priority':
                    await router.post('/admin/community-reports/bulk-action', {
                        action: 'update_priority',
                        report_ids: selectedReports,
                        priority: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedReports.length} report(s) priority updated`);
                            setShowBulkPriorityDialog(false);
                            setBulkEditValue('');
                            setSelectedReports([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update priority');
                            console.error('Priority update errors:', errors);
                        }
                    });
                    break;

                case 'assign_to':
                    await router.post('/admin/community-reports/bulk-action', {
                        action: 'assign_to',
                        report_ids: selectedReports,
                        assigned_to: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedReports.length} report(s) assigned successfully`);
                            setShowBulkAssignDialog(false);
                            setBulkEditValue('');
                            setSelectedReports([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to assign reports');
                            console.error('Assignment errors:', errors);
                        }
                    });
                    break;

                default:
                    toast.error('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleCopySelectedData = useCallback(() => {
        if (selectedReportsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedReportsData.map(report => ({
            'Report ID': report.report_number || 'N/A',
            'Title': report.title || 'N/A',
            'Type': report.report_type?.name || 'N/A',
            'Status': safeStatuses[report.status] || report.status || 'N/A',
            'Priority': safePriorities[report.priority] || report.priority || 'N/A',
            'Urgency': safeUrgencies[report.urgency_level] || report.urgency_level || 'N/A',
            'Incident Date': formatDate(report.incident_date),
            'Resident': report.is_anonymous ? 'Anonymous' : report.user?.name || 'N/A',
            'Assigned To': report.assigned_to?.name || 'Unassigned',
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            setCopied(true);
            toast.success('Selected data copied to clipboard as CSV');
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedReportsData, safeStatuses, safePriorities, safeUrgencies]);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, []);

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setUrgencyFilter('all');
        setReportTypeFilter('all');
        setCategoryFilter('all');
        setImpactFilter('all');
        setPurokFilter('all');
        setAssignedFilter('all');
        setSourceFilter('all');
        setFromDateFilter('');
        setToDateFilter('');
        setHasEvidencesFilter(false);
        setSafetyConcernFilter(false);
        setEnvironmentalFilter(false);
        setRecurringFilter(false);
        setAnonymousFilter(false);
        setAffectedPeopleFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
    }, []);

    const handleDelete = useCallback((report: CommunityReport) => {
        if (confirm(`Are you sure you want to delete report ${report.report_number}? This action cannot be undone.`)) {
            router.delete(`/admin/community-reports/${report.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedReports(selectedReports.filter(id => id !== report.id));
                    toast.success('Report deleted successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to delete report');
                }
            });
        }
    }, [selectedReports]);

    const toggleReportExpansion = useCallback((reportId: number) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    }, [expandedReport]);

    const handleExport = useCallback(() => {
        // Export logic here
        toast.info('Export functionality to be implemented');
    }, []);

    const hasActiveFilters = useMemo(() => {
        return search || 
            statusFilter !== 'all' || 
            priorityFilter !== 'all' || 
            urgencyFilter !== 'all' ||
            reportTypeFilter !== 'all' ||
            categoryFilter !== 'all' ||
            impactFilter !== 'all' ||
            purokFilter !== 'all' ||
            assignedFilter !== 'all' ||
            sourceFilter !== 'all' ||
            fromDateFilter ||
            toDateFilter ||
            hasEvidencesFilter ||
            safetyConcernFilter ||
            environmentalFilter ||
            recurringFilter ||
            anonymousFilter ||
            affectedPeopleFilter !== 'all';
    }, [
        search, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter,
        categoryFilter, impactFilter, purokFilter, assignedFilter, sourceFilter,
        fromDateFilter, toDateFilter, hasEvidencesFilter, safetyConcernFilter,
        environmentalFilter, recurringFilter, anonymousFilter, affectedPeopleFilter
    ]);

    return {
        // State
        search, setSearch,
        statusFilter, setStatusFilter,
        priorityFilter, setPriorityFilter,
        urgencyFilter, setUrgencyFilter,
        reportTypeFilter, setReportTypeFilter,
        categoryFilter, setCategoryFilter,
        impactFilter, setImpactFilter,
        purokFilter, setPurokFilter,
        assignedFilter, setAssignedFilter,
        sourceFilter, setSourceFilter,
        fromDateFilter, setFromDateFilter,
        toDateFilter, setToDateFilter,
        hasEvidencesFilter, setHasEvidencesFilter,
        safetyConcernFilter, setSafetyConcernFilter,
        environmentalFilter, setEnvironmentalFilter,
        recurringFilter, setRecurringFilter,
        anonymousFilter, setAnonymousFilter,
        affectedPeopleFilter, setAffectedPeopleFilter,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        showAdvancedFilters, setShowAdvancedFilters,
        currentPage, setCurrentPage,
        itemsPerPage,
        windowWidth,
        selectedReports, setSelectedReports,
        isBulkMode, setIsBulkMode,
        showBulkActions, setShowBulkActions,
        isSelectAll, setIsSelectAll,
        showBulkDeleteDialog, setShowBulkDeleteDialog,
        showBulkStatusDialog, setShowBulkStatusDialog,
        showBulkPriorityDialog, setShowBulkPriorityDialog,
        showBulkAssignDialog, setShowBulkAssignDialog,
        isPerformingBulkAction, setIsPerformingBulkAction,
        viewMode, setViewMode,
        bulkEditValue, setBulkEditValue,
        selectionMode, setSelectionMode,
        showSelectionOptions, setShowSelectionOptions,
        copied, setCopied,
        expandedReport, setExpandedReport,
        
        // Refs
        bulkActionRef,
        selectionRef,
        searchInputRef,
        
        // Computed values
        filteredReports,
        paginatedReports,
        safeStats,
        safeStatuses,
        safePriorities,
        safeUrgencies,
        safeReportTypes,
        safeCategories,
        safePuroks,
        safeStaff,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        hasActiveFilters,
        selectionStats,
        
        // Handlers
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleCopySelectedData,
        handleCopyToClipboard,
        handleClearFilters,
        handleSort,
        handleDelete,
        toggleReportExpansion,
        handleExport
    };
}