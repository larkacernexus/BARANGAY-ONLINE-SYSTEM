// resources/js/admin-utils/announcement-utils.ts

import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { Announcement, AnnouncementFilters, SelectionStats } from '@/types/admin/announcements/announcement.types';

export const announcementUtils = {
    truncateText: (text: string, maxLength: number = 50): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatDate: (dateString: string | null) => {
        if (!dateString) return 'No date';
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid Date';
        }
    },

    formatDateTime: (dateString: string | null) => {
        if (!dateString) return 'No date';
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid Date';
        }
    },

    getTypeIcon: (type: string) => {
        switch (type) {
            case 'important': return '🔴';
            case 'event': return '📅';
            case 'maintenance': return '🔧';
            case 'other': return '🏷️';
            default: return '📢';
        }
    },

    getTypeColor: (type: string): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800 border-red-200';
            case 'event': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    },

    getPriorityIcon: (priority: number) => {
        switch (priority) {
            case 4: return '🔴';
            case 3: return '🟠';
            case 2: return '🟡';
            case 1: return '🔵';
            default: return '⚪';
        }
    },

    getPriorityColor: (priority: number): string => {
        switch (priority) {
            case 4: return 'bg-red-50 text-red-700 border-red-200';
            case 3: return 'bg-orange-50 text-orange-700 border-orange-200';
            case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 1: return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    },

    getStatusBadgeVariant: (isActive: boolean, isCurrentlyActive: boolean) => {
        if (!isActive) return 'secondary';
        if (isCurrentlyActive) return 'default';
        return 'outline';
    },

    filterAnnouncements: ({ announcements, search, filters }: { 
        announcements: Announcement[], 
        search: string, 
        filters: AnnouncementFilters 
    }) => {
        let result = [...announcements];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(announcement => 
                announcement.title.toLowerCase().includes(searchLower) ||
                announcement.content.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (filters.type && filters.type !== 'all') {
            result = result.filter(announcement => announcement.type === filters.type);
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            switch (filters.status) {
                case 'active':
                    result = result.filter(announcement => 
                        announcement.is_active && 
                        announcement.start_date && 
                        announcement.end_date &&
                        new Date(announcement.start_date) <= new Date() && 
                        new Date(announcement.end_date) >= new Date()
                    );
                    break;
                case 'inactive':
                    result = result.filter(announcement => !announcement.is_active);
                    break;
                case 'currently_active':
                    result = result.filter(announcement => 
                        announcement.is_currently_active &&
                        announcement.start_date &&
                        announcement.end_date &&
                        new Date(announcement.start_date) <= new Date() && 
                        new Date(announcement.end_date) >= new Date()
                    );
                    break;
                case 'expired':
                    result = result.filter(announcement => 
                        announcement.end_date && 
                        isBefore(parseISO(announcement.end_date), new Date())
                    );
                    break;
                case 'upcoming':
                    result = result.filter(announcement => 
                        announcement.start_date && 
                        isAfter(parseISO(announcement.start_date), new Date())
                    );
                    break;
            }
        }

        // Date range filter
        if (filters.from_date) {
            const fromDate = new Date(filters.from_date);
            result = result.filter(announcement => {
                const createdDate = parseISO(announcement.created_at);
                return createdDate >= fromDate;
            });
        }

        if (filters.to_date) {
            const toDate = new Date(filters.to_date);
            result = result.filter(announcement => {
                const createdDate = parseISO(announcement.created_at);
                return createdDate <= toDate;
            });
        }

        // Sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order || 'desc';
        
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'priority':
                    aValue = a.priority;
                    bValue = b.priority;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'start_date':
                    aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
                    bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
                    break;
                case 'end_date':
                    aValue = a.end_date ? new Date(a.end_date).getTime() : 0;
                    bValue = b.end_date ? new Date(b.end_date).getTime() : 0;
                    break;
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    },

    getSelectionStats: (announcements: Announcement[]): SelectionStats => {
        const now = new Date();
        
        // Count types
        const types: Record<string, number> = {};
        const priorities: Record<string, number> = {};
        
        announcements.forEach(announcement => {
            // Count types
            const type = announcement.type || 'other';
            types[type] = (types[type] || 0) + 1;
            
            // Count priorities
            const priority = announcement.priority?.toString() || 'normal';
            priorities[priority] = (priorities[priority] || 0) + 1;
        });
        
        return {
            total: announcements.length,
            active: announcements.filter(a => a.is_active === true).length,
            inactive: announcements.filter(a => a.is_active === false).length,
            expired: announcements.filter(a => 
                a.end_date && isBefore(parseISO(a.end_date), now)
            ).length,
            upcoming: announcements.filter(a => 
                a.start_date && isAfter(parseISO(a.start_date), now)
            ).length,
            types,
            priorities
        };
    },

    // Helper function to safely check if announcement is currently active
    isCurrentlyActive: (announcement: Announcement): boolean => {
        if (!announcement.is_active) return false;
        if (!announcement.start_date || !announcement.end_date) return false;
        
        const now = new Date();
        const startDate = new Date(announcement.start_date);
        const endDate = new Date(announcement.end_date);
        
        return startDate <= now && endDate >= now;
    },

    // Helper function to get announcement status
    getAnnouncementStatus: (announcement: Announcement): string => {
        if (!announcement.is_active) return 'inactive';
        if (!announcement.start_date || !announcement.end_date) return 'unknown';
        
        const now = new Date();
        const startDate = new Date(announcement.start_date);
        const endDate = new Date(announcement.end_date);
        
        if (startDate > now) return 'upcoming';
        if (endDate < now) return 'expired';
        return 'active';
    }
};