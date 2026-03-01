// admin-utils/documentTypesUtils.ts
import { DocumentType, FilterState, SelectionStats } from '@/types/document-types';

// Format date
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Convert bytes to MB
export const getFileSizeMB = (bytes: number): number => {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
};

// Format file formats - COMPLETELY FIXED
export const formatFileFormats = (formats: any): string => {
    // Handle null, undefined, or empty
    if (formats === null || formats === undefined) {
        return 'All formats';
    }
    
    // If it's already an array
    if (Array.isArray(formats)) {
        return formats.length > 0 ? formats.join(', ') : 'All formats';
    }
    
    // If it's a string
    if (typeof formats === 'string') {
        // Trim the string
        const trimmed = formats.trim();
        
        // Empty string
        if (trimmed === '') {
            return 'All formats';
        }
        
        // Try to parse as JSON (for when it's a JSON string from database)
        let parsedJson = null;
        try {
            parsedJson = JSON.parse(trimmed);
        } catch (error) {
            // Not JSON, continue with string handling
            // We need to use the error parameter to avoid the never type issue
            console.debug('Not a JSON string:', error);
        }
        
        // If we successfully parsed JSON
        if (parsedJson) {
            if (Array.isArray(parsedJson)) {
                return parsedJson.length > 0 ? parsedJson.join(', ') : 'All formats';
            }
            // If parsed but not array, return the parsed value as string
            return String(parsedJson);
        }
        
        // Check if it's a comma-separated string
        if (trimmed.includes(',')) {
            return trimmed; // Return as is
        }
        
        // Single format
        return trimmed;
    }
    
    // If it's an object (like from JSON.parse)
    if (typeof formats === 'object') {
        try {
            // Try to convert object to array
            if (formats) {
                const values = Object.values(formats);
                if (values.length > 0) {
                    return values.join(', ');
                }
            }
        } catch (error) {
            // Fall through to default
            console.debug('Error processing object:', error);
        }
    }
    
    // Default fallback
    return 'All formats';
};

// Ultra simple version that won't have TypeScript issues
export const formatFileFormatsSimple = (formats: any): string => {
    try {
        // If it's null/undefined
        if (formats == null) return 'All formats';
        
        // If it's a string
        if (typeof formats === 'string') {
            // Try to parse JSON if it looks like an array
            if (formats.trim().startsWith('[') && formats.trim().endsWith(']')) {
                const parsed = JSON.parse(formats);
                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                }
            }
            return formats.trim() || 'All formats';
        }
        
        // If it's an array
        if (Array.isArray(formats)) {
            return formats.length > 0 ? formats.join(', ') : 'All formats';
        }
        
        // Default
        return 'All formats';
    } catch {
        // If anything fails, return a safe default
        return 'All formats';
    }
};

// Filter document types
export const filterDocumentTypes = (
    documentTypes: DocumentType[],
    categories: any[],
    search: string,
    filters: FilterState,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
): DocumentType[] => {
    let filtered = [...documentTypes];
    
    // Apply search
    if (search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(type => 
            type.name.toLowerCase().includes(searchLower) ||
            type.code.toLowerCase().includes(searchLower) ||
            (type.description && type.description.toLowerCase().includes(searchLower))
        );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        filtered = filtered.filter(type => type.is_active === isActive);
    }
    
    // Apply category filter
    if (filters.category !== 'all') {
        const categoryId = parseInt(filters.category);
        filtered = filtered.filter(type => type.document_category_id === categoryId);
    }
    
    // Apply required filter
    if (filters.required !== 'all') {
        const isRequired = filters.required === 'required';
        filtered = filtered.filter(type => type.is_required === isRequired);
    }
    
    // Sort
    filtered.sort((a, b) => {
        let aValue: string | number, bValue: string | number;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'code':
                aValue = a.code.toLowerCase();
                bValue = b.code.toLowerCase();
                break;
            case 'category':
                aValue = a.category?.name?.toLowerCase() || '';
                bValue = b.category?.name?.toLowerCase() || '';
                break;
            case 'sort_order':
                aValue = a.sort_order;
                bValue = b.sort_order;
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    return filtered;
};

// Calculate selection stats
export const getSelectionStats = (selectedItems: DocumentType[]): SelectionStats => {
    const stats: SelectionStats = {
        total: selectedItems.length,
        active: selectedItems.filter(item => item.is_active).length,
        inactive: selectedItems.filter(item => !item.is_active).length,
        required: selectedItems.filter(item => item.is_required).length,
        optional: selectedItems.filter(item => !item.is_required).length,
        hasFormats: selectedItems.filter(item => {
            const formats = item.accepted_formats;
            if (Array.isArray(formats)) {
                return formats.length > 0;
            }
            if (typeof formats === 'string') {
                // Try to parse as JSON
                try {
                    const parsed = JSON.parse(formats);
                    return Array.isArray(parsed) && parsed.length > 0;
                } catch {
                    // If parsing fails, check if it's a non-empty string
                    return formats.trim() !== '';
                }
            }
            return false;
        }).length,
        totalFileSizeMB: selectedItems.reduce((sum, item) => 
            sum + getFileSizeMB(item.max_file_size), 0
        ),
        maxFileSizeMB: selectedItems.length > 0 
            ? Math.max(...selectedItems.map(item => getFileSizeMB(item.max_file_size)))
            : 0,
        categories: {}
    };
    
    // Count by category
    selectedItems.forEach(item => {
        const categoryId = item.document_category_id;
        stats.categories[categoryId] = (stats.categories[categoryId] || 0) + 1;
    });
    
    return stats;
};

// Format for clipboard (CSV)
export const formatForClipboard = (items: DocumentType[]): string => {
    const headers = ['ID', 'Code', 'Name', 'Category', 'Required', 'Status', 'Max Size', 'Formats'];
    const rows = items.map(item => [
        item.id.toString(),
        item.code,
        `"${item.name}"`,
        item.category?.name || 'Uncategorized',
        item.is_required ? 'Yes' : 'No',
        item.is_active ? 'Active' : 'Inactive',
        `${getFileSizeMB(item.max_file_size)} MB`,
        // Use the simple formatter
        formatFileFormatsSimple(item.accepted_formats)
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

// Safe number conversion
export const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Helper function to safely get accepted_formats as array
export const getAcceptedFormatsAsArray = (formats: any): string[] => {
    if (Array.isArray(formats)) {
        return formats;
    }
    
    if (typeof formats === 'string') {
        // Try to parse as JSON
        try {
            const parsed = JSON.parse(formats);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // Not JSON
        }
        
        // Check if it's a comma-separated string
        if (formats.includes(',')) {
            return formats.split(',').map(f => f.trim());
        }
        
        // Single format
        if (formats.trim() !== '') {
            return [formats.trim()];
        }
    }
    
    return [];
};