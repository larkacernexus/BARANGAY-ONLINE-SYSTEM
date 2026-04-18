// hooks/useCommunityReportsManagement.ts

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    CommunityReport, 
    Filters, 
    Stats, 
    BulkOperation 
} from '@/types/admin/reports/communityReportTypes';
import { 
    formatDate, 
    formatDateTime 
} from '@/admin-utils/communityReportHelpers';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// Helper for parsing boolean values from URL/filters
const parseBoolean = (value: any): boolean => {
    if (value === true || value === 'true' || value === '1' || value === 1) return true;
    return false;
};

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
    filters: initialFilters,
    statuses: rawStatuses,
    priorities: rawPriorities,
    urgencies: rawUrgencies,
    report_types: rawReportTypes,
    categories: rawCategories,
    puroks: rawPuroks,
    staff: rawStaff,
    stats: rawStats
}: UseCommunityReportsManagementProps) {
    
    // SAFE initialization with proper fallbacks
    const safeReports = useMemo(() => {
        if (rawReports && typeof rawReports === 'object' && !Array.isArray(rawReports)) {
            const data = Array.isArray(rawReports.data) ? rawReports.data : [];
            return {
                data,
                total: rawReports.total || data.length || 0,
                current_page: rawReports.current_page || 1,
                per_page: rawReports.per_page || 15,
                last_page: rawReports.last_page || 1,
                from: rawReports.from || 0,
                to: rawReports.to || data.length,
                links: rawReports.links || [],
            };
        }
        return {
            data: [],
            total: 0,
            current_page: 1,
            per_page: 15,
            last_page: 1,
            from: 0,
            to: 0,
            links: [],
        };
    }, [rawReports]);

    // ============================================
    // SERVER-SIDE FILTER STATES
    // ============================================
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(initialFilters.priority || 'all');
    const [urgencyFilter, setUrgencyFilter] = useState(initialFilters.urgency || 'all');
    const [reportTypeFilter, setReportTypeFilter] = useState(initialFilters.report_type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(initialFilters.category || 'all');
    const [impactFilter, setImpactFilter] = useState(initialFilters.impact_level || 'all');
    const [purokFilter, setPurokFilter] = useState(initialFilters.purok || 'all');
    const [assignedFilter, setAssignedFilter] = useState(initialFilters.assigned_to || 'all');
    const [sourceFilter, setSourceFilter] = useState(initialFilters.source || 'all');
    const [fromDateFilter, setFromDateFilter] = useState(initialFilters.from_date || '');
    const [toDateFilter, setToDateFilter] = useState(initialFilters.to_date || '');
    const [hasEvidencesFilter, setHasEvidencesFilter] = useState(parseBoolean(initialFilters.has_evidences));
    const [safetyConcernFilter, setSafetyConcernFilter] = useState(parseBoolean(initialFilters.safety_concern));
    const [environmentalFilter, setEnvironmentalFilter] = useState(parseBoolean(initialFilters.environmental_impact));
    const [recurringFilter, setRecurringFilter] = useState(parseBoolean(initialFilters.recurring_issue));
    const [anonymousFilter, setAnonymousFilter] = useState(parseBoolean(initialFilters.is_anonymous));
    const [affectedPeopleFilter, setAffectedPeopleFilter] = useState(initialFilters.affected_people || 'all');
    
    // Sorting states (client-side for current page only)
    const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'desc'
    );
    
    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    
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
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedReport, setExpandedReport] = useState<number | null>(null);
    
    // Refs
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    // Debounce filters
    const debouncedSearch = useDebounce(search, 300);
    const debouncedFromDate = useDebounce(fromDateFilter, 500);
    const debouncedToDate = useDebounce(toDateFilter, 500);

    // Safe data with defaults
    const safeStatuses = useMemo(() => {
        if (rawStatuses && Object.keys(rawStatuses).length > 0) return rawStatuses;
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
        if (rawPriorities && Object.keys(rawPriorities).length > 0) return rawPriorities;
        return { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
    }, [rawPriorities]);

    const safeUrgencies = useMemo(() => {
        if (rawUrgencies && Object.keys(rawUrgencies).length > 0) return rawUrgencies;
        return { high: 'High', medium: 'Medium', low: 'Low' };
    }, [rawUrgencies]);

    const safeReportTypes = useMemo(() => Array.isArray(rawReportTypes) ? rawReportTypes : [], [rawReportTypes]);
    const safeCategories = useMemo(() => Array.isArray(rawCategories) ? rawCategories : [], [rawCategories]);
    const safePuroks = useMemo(() => Array.isArray(rawPuroks) ? rawPuroks : [], [rawPuroks]);
    const safeStaff = useMemo(() => Array.isArray(rawStaff) ? rawStaff : [], [rawStaff]);

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

    // ============================================
    // GET CURRENT FILTERS FOR SERVER REQUEST
    // ============================================
    const getCurrentFilters = useCallback((): Record<string, any> => {
        const filters: Record<string, any> = {};
        
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (priorityFilter !== 'all') filters.priority = priorityFilter;
        if (urgencyFilter !== 'all') filters.urgency = urgencyFilter;
        if (reportTypeFilter !== 'all') filters.report_type = reportTypeFilter;
        if (categoryFilter !== 'all') filters.category = categoryFilter;
        if (impactFilter !== 'all') filters.impact_level = impactFilter;
        if (purokFilter !== 'all') filters.purok = purokFilter;
        if (assignedFilter !== 'all') filters.assigned_to = assignedFilter;
        if (sourceFilter !== 'all') filters.source = sourceFilter;
        if (debouncedFromDate) filters.from_date = debouncedFromDate;
        if (debouncedToDate) filters.to_date = debouncedToDate;
        if (hasEvidencesFilter) filters.has_evidences = 'true';
        if (safetyConcernFilter) filters.safety_concern = 'true';
        if (environmentalFilter) filters.environmental_impact = 'true';
        if (recurringFilter) filters.recurring_issue = 'true';
        if (anonymousFilter) filters.is_anonymous = 'true';
        if (affectedPeopleFilter !== 'all') filters.affected_people = affectedPeopleFilter;
        
        return filters;
    }, [
        debouncedSearch, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter,
        categoryFilter, impactFilter, purokFilter, assignedFilter, sourceFilter,
        debouncedFromDate, debouncedToDate, hasEvidencesFilter, safetyConcernFilter,
        environmentalFilter, recurringFilter, anonymousFilter, affectedPeopleFilter
    ]);

    // ============================================
    // RELOAD DATA FROM SERVER
    // ============================================
    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters: Record<string, any> = { ...getCurrentFilters(), page };
            
            Object.keys(filters).forEach(key => {
                if (filters[key] === 'all') {
                    delete filters[key];
                }
            });
        
        router.get('/admin/community-reports', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedReports([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load reports');
            }
        });
    }, [getCurrentFilters]);

    // ============================================
    // SERVER-SIDE FILTERING EFFECT
    // ============================================
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter,
        categoryFilter, impactFilter, purokFilter, assignedFilter, sourceFilter,
        debouncedFromDate, debouncedToDate, hasEvidencesFilter, safetyConcernFilter,
        environmentalFilter, recurringFilter, anonymousFilter, affectedPeopleFilter
    ]);

    // ============================================
    // CURRENT PAGE DATA (from server)
    // ============================================
    const currentReports = useMemo(() => safeReports.data, [safeReports.data]);
    
    // ============================================
    // CLIENT-SIDE SORTING (for current page only)
    // ============================================
    const sortedReports = useMemo(() => {
        const sorted = [...currentReports];
        
        sorted.sort((a, b) => {
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
        
        return sorted;
    }, [currentReports, sortBy, sortOrder]);

    // ============================================
    // PAGINATION DATA
    // ============================================
    const paginationData = useMemo(() => ({
        current_page: safeReports.current_page,
        last_page: safeReports.last_page,
        total: safeReports.total,
        from: safeReports.from,
        to: safeReports.to,
        per_page: safeReports.per_page,
        path: typeof window !== 'undefined' ? window.location.pathname : '/admin/community-reports',
        links: safeReports.links || [],
    }), [safeReports]);

    const totalItems = paginationData.total;
    const totalPages = paginationData.last_page;
    const startIndex = paginationData.from;
    const endIndex = paginationData.to;

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setWindowWidth(window.innerWidth);
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

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedReports([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = sortedReports.map(report => report.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedReports.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReports, sortedReports]);

    // ============================================
    // SELECTION HANDLERS
    // ============================================
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = sortedReports.map(report => report.id);
        if (isSelectAll) {
            setSelectedReports(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedReports(prev => [...new Set([...prev, ...pageIds])]);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [sortedReports, isSelectAll]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedReports(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    }, []);

    // Get selected reports data
    const selectedReportsData = useMemo(() => {
        return sortedReports.filter(report => selectedReports.includes(report.id));
    }, [selectedReports, sortedReports]);

    // Selection stats
    const selectionStats = useMemo(() => {
        if (!selectedReportsData.length) {
            return { 
                total: 0, pending: 0, under_review: 0, assigned: 0, in_progress: 0, 
                resolved: 0, rejected: 0, critical: 0, high_priority: 0, medium_priority: 0, 
                low_priority: 0, high_urgency: 0, anonymous: 0, withEvidence: 0, 
                assignedCount: 0, safetyConcern: 0, environmentalImpact: 0, 
                recurringIssue: 0, communityImpact: 0, totalEstimatedAffected: 0 
            };
        }
        return {
            total: selectedReportsData.length,
            pending: selectedReportsData.filter(c => c.status === 'pending').length,
            under_review: selectedReportsData.filter(c => c.status === 'under_review').length,
            assigned: selectedReportsData.filter(c => c.status === 'assigned').length,
            in_progress: selectedReportsData.filter(c => c.status === 'in_progress').length,
            resolved: selectedReportsData.filter(c => c.status === 'resolved').length,
            rejected: selectedReportsData.filter(c => c.status === 'rejected').length,
            critical: selectedReportsData.filter(c => c.priority === 'critical').length,
            high_priority: selectedReportsData.filter(c => c.priority === 'high').length,
            medium_priority: selectedReportsData.filter(c => c.priority === 'medium').length,
            low_priority: selectedReportsData.filter(c => c.priority === 'low').length,
            high_urgency: selectedReportsData.filter(c => c.urgency_level === 'high').length,
            anonymous: selectedReportsData.filter(c => c.is_anonymous).length,
            withEvidence: selectedReportsData.filter(c => c.evidences?.length > 0).length,
            assignedCount: selectedReportsData.filter(c => c.assigned_to).length,
            safetyConcern: selectedReportsData.filter(c => c.safety_concern).length,
            environmentalImpact: selectedReportsData.filter(c => c.environmental_impact).length,
            recurringIssue: selectedReportsData.filter(c => c.recurring_issue).length,
            communityImpact: selectedReportsData.filter(c => c.affected_people === 'community' || c.affected_people === 'multiple').length,
            totalEstimatedAffected: selectedReportsData.reduce((sum, c) => sum + (c.estimated_affected_count || 0), 0),
        };
    }, [selectedReportsData]);

    // ============================================
    // PAGE CHANGE HANDLER
    // ============================================
    const handlePageChange = useCallback((page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reloadData]);

    // ============================================
    // SORT HANDLER (client-side only)
    // ============================================
    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    }, [sortBy]);

    // ============================================
    // BULK OPERATIONS
    // ============================================
    const handleBulkOperation = useCallback(async (operation: BulkOperation | string, customData?: any) => {
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
                        'Assigned To': report.assigned_to?.name || 'Unassigned',
                        'Created At': formatDateTime(report.created_at),
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => headers.map(h => {
                            const v = row[h as keyof typeof row];
                            return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
                        }).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `community-reports-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success(`Exported ${selectedReports.length} reports`);
                    break;

                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'update_status':
                    setShowBulkStatusDialog(true);
                    break;

                case 'update_priority':
                    setShowBulkPriorityDialog(true);
                    break;

                case 'assign_to':
                    setShowBulkAssignDialog(true);
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred');
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReports, selectedReportsData, safeStatuses, safePriorities, safeUrgencies]);

    // ============================================
    // BULK ACTION CONFIRMATION HANDLERS
    // ============================================
    const handleBulkStatusUpdate = useCallback(async (status: string) => {
        setIsPerformingBulkAction(true);
        
        try {
            await router.post('/admin/community-reports/bulk-action', {
                action: 'update_status',
                report_ids: selectedReports,
                status: status
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    setSelectedReports([]);
                    setShowBulkStatusDialog(false);
                    toast.success(`Status updated for ${selectedReports.length} reports`);
                },
                onError: () => toast.error('Failed to update status')
            });
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReports, paginationData.current_page, reloadData]);

    const handleBulkPriorityUpdate = useCallback(async (priority: string) => {
        setIsPerformingBulkAction(true);
        
        try {
            await router.post('/admin/community-reports/bulk-action', {
                action: 'update_priority',
                report_ids: selectedReports,
                priority: priority
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    setSelectedReports([]);
                    setShowBulkPriorityDialog(false);
                    toast.success(`Priority updated for ${selectedReports.length} reports`);
                },
                onError: () => toast.error('Failed to update priority')
            });
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReports, paginationData.current_page, reloadData]);

    const handleBulkAssign = useCallback(async (assignedTo: string) => {
        setIsPerformingBulkAction(true);
        
        try {
            await router.post('/admin/community-reports/bulk-action', {
                action: 'assign_to',
                report_ids: selectedReports,
                assigned_to: assignedTo
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    setSelectedReports([]);
                    setShowBulkAssignDialog(false);
                    toast.success(`Assigned ${selectedReports.length} reports`);
                },
                onError: () => toast.error('Failed to assign reports')
            });
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReports, paginationData.current_page, reloadData]);

    const handleBulkDelete = useCallback(async () => {
        setIsPerformingBulkAction(true);
        
        try {
            await router.post('/admin/community-reports/bulk-action', {
                action: 'delete',
                report_ids: selectedReports
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    setSelectedReports([]);
                    setShowBulkDeleteDialog(false);
                    toast.success(`${selectedReports.length} reports deleted`);
                },
                onError: () => toast.error('Failed to delete reports')
            });
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedReports, paginationData.current_page, reloadData]);

    // ============================================
    // OTHER HANDLERS
    // ============================================
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
    }, []);

    const handleDelete = useCallback((report: CommunityReport) => {
        if (confirm(`Delete report ${report.report_number}?`)) {
            router.delete(`/admin/community-reports/${report.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadData(paginationData.current_page);
                    setSelectedReports(prev => prev.filter(id => id !== report.id));
                    toast.success('Report deleted');
                },
                onError: () => toast.error('Failed to delete report')
            });
        }
    }, [paginationData.current_page, reloadData]);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied`);
        }).catch(() => toast.error('Failed to copy'));
    }, []);

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
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => toast.error('Failed to copy'));
    }, [selectedReportsData, safeStatuses, safePriorities]);

    const toggleReportExpansion = useCallback((reportId: number) => {
        setExpandedReport(prev => prev === reportId ? null : reportId);
    }, []);

    const handleExport = useCallback(() => {
        handleBulkOperation('export');
    }, [handleBulkOperation]);

    const hasActiveFilters = useMemo(() => {
        return Boolean(search || 
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
            affectedPeopleFilter !== 'all');
    }, [
        search, statusFilter, priorityFilter, urgencyFilter, reportTypeFilter,
        categoryFilter, impactFilter, purokFilter, assignedFilter, sourceFilter,
        fromDateFilter, toDateFilter, hasEvidencesFilter, safetyConcernFilter,
        environmentalFilter, recurringFilter, anonymousFilter, affectedPeopleFilter
    ]);

    // Placeholder handlers for compatibility
    const handleSelectAllFiltered = useCallback(() => {
        toast.info('Select all filtered is handled server-side');
    }, []);
    
    const handleSelectAll = useCallback(() => {
        toast.info(`Total ${safeReports.total} reports available`);
    }, [safeReports.total]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                handleSelectAllOnPage();
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    selectedReports.length > 0 ? setSelectedReports([]) : setIsBulkMode(false);
                }
                setShowBulkActions(false);
                setShowSelectionOptions(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
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
    }, [isBulkMode, selectedReports, handleSelectAllOnPage]);

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
        currentPage: paginationData.current_page,
        setCurrentPage: handlePageChange,
        itemsPerPage: safeReports.per_page,
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
        isLoading,
        
        // Refs
        bulkActionRef,
        selectionRef,
        searchInputRef,
        
        // Computed values
        filteredReports: sortedReports,
        paginatedReports: sortedReports,
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
        handleBulkStatusUpdate,
        handleBulkPriorityUpdate,
        handleBulkAssign,
        handleBulkDelete,
        handleCopySelectedData,
        handleCopyToClipboard,
        handleClearFilters,
        handleSort,
        handleDelete,
        toggleReportExpansion,
        handleExport,
        reloadData,
    };
}