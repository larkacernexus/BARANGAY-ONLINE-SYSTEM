import { format, parseISO } from 'date-fns';

export const formUtils = {
    truncateText: (text: string, maxLength: number = 50): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatDate: (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid Date';
        }
    },

    formatDateTime: (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid Date';
        }
    },

    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return 'N/A';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getCategoryColor: (category: string): string => {
        if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
        const colors: Record<string, string> = {
            'Social Services': 'bg-purple-100 text-purple-800 border-purple-200',
            'Permits & Licenses': 'bg-blue-100 text-blue-800 border-blue-200',
            'Health & Medical': 'bg-red-100 text-red-800 border-red-200',
            'Education': 'bg-green-100 text-green-800 border-green-200',
            'Legal & Police': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Employment': 'bg-amber-100 text-amber-800 border-amber-200',
            'Housing': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'Other': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[category] || colors['Other'];
    },

    filterForms: ({ forms, search, filters }: { forms: Form[], search: string, filters: Filters }) => {
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

    getSelectionStats: (forms: Form[]) => {
        const activeCount = forms.filter(f => f.is_active).length;
        const totalDownloads = forms.reduce((sum, form) => sum + (form.download_count || 0), 0);
        const totalSize = forms.reduce((sum, form) => sum + (form.file_size || 0), 0);
        
        // Count by category
        const categoryCounts: Record<string, number> = {};
        forms.forEach(form => {
            const category = form.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        return {
            total: forms.length,
            activeCount,
            totalDownloads,
            totalSize: formUtils.formatFileSize(totalSize),
            categoryCounts,
        };
    }
};