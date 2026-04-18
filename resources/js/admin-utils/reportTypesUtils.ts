// utils/reportTypesUtils.ts
import { ReportType, FilterState, SelectionStats } from '@/types/admin/report-types/report-types';

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const getPriorityDetails = (priorityLevel: number) => {
    const priorityMap: Record<number, { label: string; color: string; icon: string }> = {
        1: { label: 'Critical', color: '#DC2626', icon: 'alert-triangle' },
        2: { label: 'High', color: '#F97316', icon: 'alert-circle' },
        3: { label: 'Medium', color: '#EAB308', icon: 'clock' },
        4: { label: 'Low', color: '#10B981', icon: 'info' },
    };
    
    return priorityMap[priorityLevel] || { label: 'Unknown', color: '#6B7280', icon: 'help-circle' };
};

export const getPriorityLabel = (priorityLevel: number): string => {
    return getPriorityDetails(priorityLevel).label;
};

export const getPriorityColor = (priorityLevel: number): string => {
    return getPriorityDetails(priorityLevel).color;
};

export const getPriorityIcon = (priorityLevel: number): string => {
    return getPriorityDetails(priorityLevel).icon;
};

export const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export const getSelectionStats = (selectedReportTypes: ReportType[]): SelectionStats => {
    const stats: SelectionStats = {
        total: selectedReportTypes.length,
        active: selectedReportTypes.filter(rt => rt.is_active).length,
        inactive: selectedReportTypes.filter(rt => !rt.is_active).length,
        critical: selectedReportTypes.filter(rt => rt.priority_level === 1).length,
        high: selectedReportTypes.filter(rt => rt.priority_level === 2).length,
        medium: selectedReportTypes.filter(rt => rt.priority_level === 3).length,
        low: selectedReportTypes.filter(rt => rt.priority_level === 4).length,
        requiresImmediateAction: selectedReportTypes.filter(rt => rt.requires_immediate_action).length,
        requiresEvidence: selectedReportTypes.filter(rt => rt.requires_evidence).length,
        allowsAnonymous: selectedReportTypes.filter(rt => rt.allows_anonymous).length,
        totalResolutionDays: selectedReportTypes.reduce((sum, rt) => sum + (rt.resolution_days || 0), 0)
    };
    
    return stats;
};

export const filterReportTypes = (
    reportTypes: ReportType[],
    search: string,
    filters: FilterState,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
): ReportType[] => {
    let filtered = [...reportTypes];

    // Apply search filter
    if (search.trim()) {
        const query = search.toLowerCase();
        filtered = filtered.filter(reportType =>
            reportType.code?.toLowerCase().includes(query) ||
            reportType.name?.toLowerCase().includes(query) ||
            reportType.description?.toLowerCase().includes(query)
        );
    }

    // Apply status filter
    if (filters.status !== 'all') {
        filtered = filtered.filter(reportType => 
            filters.status === 'active' ? reportType.is_active : !reportType.is_active
        );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
        const priorityLevel = parseInt(filters.priority);
        filtered = filtered.filter(reportType => reportType.priority_level === priorityLevel);
    }

    // Apply requires action filter
    if (filters.requires_action !== 'all') {
        const requiresAction = filters.requires_action === 'yes';
        filtered = filtered.filter(reportType => reportType.requires_immediate_action === requiresAction);
    }

    // Apply sorting
    filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof ReportType];
        let bValue: any = b[sortBy as keyof ReportType];

        if (sortBy === 'priority_level') {
            aValue = a.priority_level;
            bValue = b.priority_level;
        } else if (sortBy === 'resolution_days') {
            aValue = a.resolution_days || 0;
            bValue = b.resolution_days || 0;
        } else if (sortBy === 'created_at') {
            aValue = new Date(a.created_at || '').getTime();
            bValue = new Date(b.created_at || '').getTime();
        } else if (sortBy === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
        } else if (sortBy === 'code') {
            aValue = a.code || '';
            bValue = b.code || '';
        }

        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
};

export const formatForClipboard = (reportTypes: ReportType[]): string => {
    const data = reportTypes.map(reportType => ({
        Code: reportType.code,
        Name: reportType.name,
        Priority: getPriorityLabel(reportType.priority_level),
        'Resolution Days': reportType.resolution_days,
        Status: reportType.is_active ? 'Active' : 'Inactive',
        'Urgent Action': reportType.requires_immediate_action ? 'Yes' : 'No',
        'Evidence Required': reportType.requires_evidence ? 'Yes' : 'No',
        'Anonymous Allowed': reportType.allows_anonymous ? 'Yes' : 'No',
    }));
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
};