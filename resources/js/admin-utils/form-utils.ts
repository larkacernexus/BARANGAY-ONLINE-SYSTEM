// admin-utils/formUtils.ts

import { format, parseISO } from 'date-fns';
import { Form, Filters, SelectionStats, FormFormData } from '@/types/admin/forms/forms.types';

export const formUtils = {
    truncateText: (text: string, maxLength: number = 50): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatDate: (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
            return format(date, 'MMM dd, yyyy');
        } catch {
            return 'Invalid Date';
        }
    },

    formatDateTime: (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
            return format(date, 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid Date';
        }
    },

    formatFileSize: (bytes: number | null | undefined): string => {
        if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getCategoryColor: (category: string): string => {
        if (!category) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        const colors: Record<string, string> = {
            'Social Services': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
            'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'Health & Medical': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'Education': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
            'Employment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
            'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        };
        return colors[category] || colors['Other'];
    },

    getCategoryLabel: (category: string): string => {
        if (!category) return 'Uncategorized';
        const labels: Record<string, string> = {
            'Social Services': 'Social Services',
            'Permits & Licenses': 'Permits & Licenses',
            'Health & Medical': 'Health & Medical',
            'Education': 'Education',
            'Legal & Police': 'Legal & Police',
            'Employment': 'Employment',
            'Housing': 'Housing',
            'Other': 'Other'
        };
        return labels[category] || category;
    },

    getAgencyColor: (agency: string): string => {
        if (!agency) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        const colors: Record<string, string> = {
            'Barangay': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'Municipal': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'City': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
            'Provincial': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            'National': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        };
        return colors[agency] || colors['Other'];
    },

    getAgencyLabel: (agency: string): string => {
        const labels: Record<string, string> = {
            'Barangay': 'Barangay',
            'Municipal': 'Municipal',
            'City': 'City',
            'Provincial': 'Provincial',
            'National': 'National',
            'Other': 'Other'
        };
        return labels[agency] || agency;
    },

    getStatusColor: (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    },

    getStatusLabel: (isActive: boolean): string => {
        return isActive ? 'Active' : 'Inactive';
    },

    getFileTypeIcon: (fileType: string): string => {
        if (!fileType) return 'file';
        const icons: Record<string, string> = {
            'application/pdf': 'file-pdf',
            'application/msword': 'file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
            'application/vnd.ms-excel': 'file-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
            'image/jpeg': 'file-image',
            'image/png': 'file-image',
        };
        return icons[fileType] || 'file';
    },

    getFileTypeColor: (fileType: string): string => {
        if (!fileType) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        const colors: Record<string, string> = {
            'application/pdf': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'application/msword': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'application/vnd.ms-excel': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'image/jpeg': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'image/png': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return colors[fileType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    },

    getFileTypeLabel: (fileType: string): string => {
        const labels: Record<string, string> = {
            'application/pdf': 'PDF',
            'application/msword': 'Word Document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
            'application/vnd.ms-excel': 'Excel Spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
            'image/jpeg': 'JPEG Image',
            'image/png': 'PNG Image'
        };
        return labels[fileType] || fileType.split('/').pop()?.toUpperCase() || 'Unknown';
    },

    filterForms: ({ forms, search, filters }: { forms: Form[], search: string, filters: Filters }): Form[] => {
        if (!forms || forms.length === 0) return [];
        
        let result = [...forms];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(form => 
                (form.title?.toLowerCase().includes(searchLower) || false) ||
                (form.description?.toLowerCase().includes(searchLower) || false) ||
                (form.category?.toLowerCase().includes(searchLower) || false) ||
                (form.issuing_agency?.toLowerCase().includes(searchLower) || false)
            );
        }

        // Category filter
        if (filters.category && filters.category !== 'all') {
            result = result.filter(form => form.category === filters.category);
        }

        // Agency filter
        if (filters.agency && filters.agency !== 'all') {
            result = result.filter(form => form.issuing_agency === filters.agency);
        }

        // Status filter
        if (filters.status && filters.status !== 'all') {
            if (filters.status === 'active') {
                result = result.filter(form => form.is_active);
            } else if (filters.status === 'inactive') {
                result = result.filter(form => !form.is_active);
            }
        }

        // Featured filter
        if (filters.is_featured !== undefined && filters.is_featured !== null && filters.is_featured !== 'all') {
            const isFeatured = typeof filters.is_featured === 'boolean' 
                ? filters.is_featured 
                : String(filters.is_featured) === 'true';
            result = result.filter(form => form.is_featured === isFeatured);
        }

        // Date range filter
        if (filters.from_date) {
            const fromDate = new Date(filters.from_date);
            result = result.filter(form => new Date(form.created_at) >= fromDate);
        }

        if (filters.to_date) {
            const toDate = new Date(filters.to_date);
            result = result.filter(form => new Date(form.created_at) <= toDate);
        }

        // File type filter
        if (filters.file_type && filters.file_type !== 'all') {
            result = result.filter(form => form.file_type === filters.file_type);
        }

        // Size range filter - Handle both number and string values
        if (filters.min_size !== undefined && filters.min_size !== null) {
            const minSize = typeof filters.min_size === 'number' 
                ? filters.min_size * 1024 
                : Number(filters.min_size) * 1024;
            if (!isNaN(minSize)) {
                result = result.filter(form => (form.file_size || 0) >= minSize);
            }
        }

        if (filters.max_size !== undefined && filters.max_size !== null) {
            const maxSize = typeof filters.max_size === 'number' 
                ? filters.max_size * 1024 
                : Number(filters.max_size) * 1024;
            if (!isNaN(maxSize)) {
                result = result.filter(form => (form.file_size || 0) <= maxSize);
            }
        }

        // Sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order || 'desc';
        
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'agency':
                    aValue = a.issuing_agency || '';
                    bValue = b.issuing_agency || '';
                    break;
                case 'downloads':
                    aValue = a.download_count || 0;
                    bValue = b.download_count || 0;
                    break;
                case 'file_size':
                    aValue = a.file_size || 0;
                    bValue = b.file_size || 0;
                    break;
                case 'status':
                    aValue = a.is_active ? 1 : 0;
                    bValue = b.is_active ? 1 : 0;
                    break;
                default:
                    try {
                        aValue = new Date(a.created_at).getTime();
                    } catch {
                        aValue = 0;
                    }
                    try {
                        bValue = new Date(b.created_at).getTime();
                    } catch {
                        bValue = 0;
                    }
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    },

    getSelectionStats: (forms: Form[]): SelectionStats => {
        if (!forms || forms.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                featured: 0,
                totalDownloads: 0,
                totalSize: 0,
                byCategory: {},
                byAgency: {},
                byStatus: {},
                byFileType: {}
            };
        }

        const activeCount = forms.filter(f => f.is_active).length;
        const inactiveCount = forms.length - activeCount;
        const featuredCount = forms.filter(f => f.is_featured).length;
        const totalDownloads = forms.reduce((sum, form) => sum + (form.download_count || 0), 0);
        const totalSize = forms.reduce((sum, form) => sum + (form.file_size || 0), 0);
        
        // Count by category
        const categoryCounts: Record<string, number> = {};
        forms.forEach(form => {
            const category = form.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Count by agency
        const agencyCounts: Record<string, number> = {};
        forms.forEach(form => {
            const agency = form.issuing_agency || 'Unknown';
            agencyCounts[agency] = (agencyCounts[agency] || 0) + 1;
        });
        
        // Count by status
        const statusCounts: Record<string, number> = {
            active: activeCount,
            inactive: inactiveCount
        };
        
        // Count by file type
        const fileTypeCounts: Record<string, number> = {};
        forms.forEach(form => {
            const fileType = form.file_type || 'Unknown';
            fileTypeCounts[fileType] = (fileTypeCounts[fileType] || 0) + 1;
        });
        
        return {
            total: forms.length,
            active: activeCount,
            inactive: inactiveCount,
            featured: featuredCount,
            totalDownloads: totalDownloads,
            totalSize: totalSize,
            byCategory: categoryCounts,
            byAgency: agencyCounts,
            byStatus: statusCounts,
            byFileType: fileTypeCounts
        };
    },

    validateForm: (formData: FormFormData): Record<string, string> => {
        const errors: Record<string, string> = {};
        
        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            errors.title = 'Title must be at least 3 characters';
        } else if (formData.title.length > 255) {
            errors.title = 'Title must be less than 255 characters';
        }
        
        if (!formData.category) {
            errors.category = 'Category is required';
        }
        
        if (!formData.issuing_agency) {
            errors.issuing_agency = 'Issuing agency is required';
        }
        
        if (formData.file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (formData.file.size > maxSize) {
                errors.file = 'File size must be less than 10MB';
            }
            
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png'
            ];
            if (!allowedTypes.includes(formData.file.type)) {
                errors.file = 'File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG';
            }
        }
        
        return errors;
    },

    sortForms: (forms: Form[], sortBy: string, sortOrder: 'asc' | 'desc'): Form[] => {
        if (!forms || forms.length === 0) return [];
        
        return [...forms].sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'agency':
                    aValue = a.issuing_agency || '';
                    bValue = b.issuing_agency || '';
                    break;
                case 'downloads':
                    aValue = a.download_count || 0;
                    bValue = b.download_count || 0;
                    break;
                case 'file_size':
                    aValue = a.file_size || 0;
                    bValue = b.file_size || 0;
                    break;
                case 'status':
                    aValue = a.is_active ? 1 : 0;
                    bValue = b.is_active ? 1 : 0;
                    break;
                default:
                    try {
                        aValue = new Date(a.created_at).getTime();
                    } catch {
                        aValue = 0;
                    }
                    try {
                        bValue = new Date(b.created_at).getTime();
                    } catch {
                        bValue = 0;
                    }
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    },

    searchForms: (forms: Form[], searchTerm: string): Form[] => {
        if (!searchTerm || searchTerm.trim() === '') return forms;
        
        const searchLower = searchTerm.toLowerCase();
        return forms.filter(form => 
            (form.title?.toLowerCase().includes(searchLower) || false) ||
            (form.description?.toLowerCase().includes(searchLower) || false) ||
            (form.category?.toLowerCase().includes(searchLower) || false) ||
            (form.issuing_agency?.toLowerCase().includes(searchLower) || false)
        );
    }
};

export default formUtils;