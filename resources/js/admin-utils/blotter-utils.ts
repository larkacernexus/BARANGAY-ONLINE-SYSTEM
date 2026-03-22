// resources/js/admin-utils/blotter-utils.ts

import { Blotter, BlotterFilters } from '@/components/admin/blotters/blotter';
import { BLOTTER_INCIDENT_TYPES } from '@/data/blotterIncidentTypes';

interface FilterBlottersParams {
    blotters: Blotter[];
    search: string;
    filters: BlotterFilters;
}

export const blotterUtils = {
    /**
     * Filter blotters based on search and filters
     */
    filterBlotters: ({ blotters, search, filters }: FilterBlottersParams): Blotter[] => {
        let result = [...blotters];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(blotter => {
                const blotterNumber = blotter.blotter_number.toLowerCase();
                const incidentType = blotter.incident_type.toLowerCase();
                const location = blotter.location.toLowerCase();
                const reporterName = blotter.reporter_name.toLowerCase();
                const respondentName = blotter.respondent_name?.toLowerCase() || '';
                const description = blotter.incident_description?.toLowerCase() || '';

                return blotterNumber.includes(searchLower) ||
                    incidentType.includes(searchLower) ||
                    location.includes(searchLower) ||
                    reporterName.includes(searchLower) ||
                    respondentName.includes(searchLower) ||
                    description.includes(searchLower);
            });
        }

        // Status filter
        if (filters.status !== 'all') {
            result = result.filter(blotter => blotter.status === filters.status);
        }

        // Priority filter
        if (filters.priority !== 'all') {
            result = result.filter(blotter => blotter.priority === filters.priority);
        }

        // Incident type filter
        if (filters.incident_type !== 'all') {
            result = result.filter(blotter => blotter.incident_type === filters.incident_type);
        }

        // Barangay filter
        if (filters.barangay !== 'all') {
            result = result.filter(blotter => blotter.barangay === filters.barangay);
        }

        // Date range filter
        if (filters.date_from) {
            const fromDate = new Date(filters.date_from);
            fromDate.setHours(0, 0, 0, 0);
            result = result.filter(blotter => new Date(blotter.incident_datetime) >= fromDate);
        }
        if (filters.date_to) {
            const toDate = new Date(filters.date_to);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(blotter => new Date(blotter.incident_datetime) <= toDate);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sort_by) {
                case 'blotter_number':
                    aValue = a.blotter_number;
                    bValue = b.blotter_number;
                    break;
                case 'incident_type':
                    aValue = a.incident_type;
                    bValue = b.incident_type;
                    break;
                case 'incident_datetime':
                    aValue = new Date(a.incident_datetime).getTime();
                    bValue = new Date(b.incident_datetime).getTime();
                    break;
                case 'reporter_name':
                    aValue = a.reporter_name;
                    bValue = b.reporter_name;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
                    aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
                    bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
                    break;
                default:
                    aValue = a.incident_datetime;
                    bValue = b.incident_datetime;
            }

            if (filters.sort_order === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    },

    /**
     * Get statistics for selected blotters
     */
    getSelectionStats: (selectedBlotters: Blotter[]) => {
        if (selectedBlotters.length === 0) {
            return {
                total: 0,
                pending: 0,
                investigating: 0,
                resolved: 0,
                archived: 0,
                urgent: 0,
                high: 0,
                medium: 0,
                low: 0,
            };
        }
        
        return {
            total: selectedBlotters.length,
            pending: selectedBlotters.filter(b => b.status === 'pending').length,
            investigating: selectedBlotters.filter(b => b.status === 'investigating').length,
            resolved: selectedBlotters.filter(b => b.status === 'resolved').length,
            archived: selectedBlotters.filter(b => b.status === 'archived').length,
            urgent: selectedBlotters.filter(b => b.priority === 'urgent').length,
            high: selectedBlotters.filter(b => b.priority === 'high').length,
            medium: selectedBlotters.filter(b => b.priority === 'medium').length,
            low: selectedBlotters.filter(b => b.priority === 'low').length,
        };
    },

    /**
     * Get incident type details from code
     */
    getIncidentTypeDetails: (code: string) => {
        return BLOTTER_INCIDENT_TYPES.find(type => type.code === code);
    },

    /**
     * Format priority level to readable text
     */
    formatPriority: (priority: string): string => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    },

    /**
     * Get priority level number (1-4) from string
     */
    getPriorityNumber: (priority: string): number => {
        const priorities: Record<string, number> = {
            urgent: 1,
            high: 2,
            medium: 3,
            low: 4
        };
        return priorities[priority] || 3;
    },

    /**
     * Check if a blotter is overdue
     */
    isOverdue: (blotter: Blotter): boolean => {
        if (blotter.status === 'resolved' || blotter.status === 'archived') {
            return false;
        }
        
        const incidentDate = new Date(blotter.incident_datetime);
        const now = new Date();
        const daysSinceIncident = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Get resolution days from incident type
        const incidentType = blotterUtils.getIncidentTypeDetails(blotter.incident_type);
        const resolutionDays = incidentType?.resolution_days || 30;
        
        return daysSinceIncident > resolutionDays;
    },

    /**
     * Format date for display
     */
    formatDate: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format datetime for display
     */
    formatDateTime: (dateTimeString: string): string => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get status badge class
     */
    getStatusBadgeClass: (status: string): string => {
        const classes: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'investigating': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    },

    /**
     * Get priority badge class
     */
    getPriorityBadgeClass: (priority: string): string => {
        const classes: Record<string, string> = {
            'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return classes[priority.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    },

    /**
     * Get status icon component name
     */
    getStatusIcon: (status: string): string => {
        const icons: Record<string, string> = {
            'pending': 'Clock',
            'investigating': 'AlertCircle',
            'resolved': 'CheckCircle',
            'archived': 'Archive'
        };
        return icons[status.toLowerCase()] || 'FileText';
    },

    /**
     * Get priority icon component name
     */
    getPriorityIcon: (priority: string): string => {
        const icons: Record<string, string> = {
            'urgent': 'AlertCircle',
            'high': 'AlertCircle',
            'medium': 'Clock',
            'low': 'CheckCircle'
        };
        return icons[priority.toLowerCase()] || 'Info';
    },

    /**
     * Get truncation length based on screen width
     */
    getTruncationLength: (type: 'number' | 'type' | 'location' | 'reporter' | 'respondent' = 'type'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'number': return 12;
                case 'type': return 15;
                case 'location': return 20;
                case 'reporter': return 12;
                case 'respondent': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'number': return 15;
                case 'type': return 20;
                case 'location': return 25;
                case 'reporter': return 15;
                case 'respondent': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'number': return 18;
                case 'type': return 25;
                case 'location': return 30;
                case 'reporter': return 18;
                case 'respondent': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'number': return 20;
            case 'type': return 30;
            case 'location': return 35;
            case 'reporter': return 20;
            case 'respondent': return 20;
            default: return 30;
        }
    },

    /**
     * Truncate text to specified length
     */
    truncateText: (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Default export for convenience
export default blotterUtils;