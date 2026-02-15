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

// Format file formats
export const formatFileFormats = (formats?: string[]): string => {
    if (!formats || formats.length === 0) return 'All formats';
    return formats.join(', ');
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
        let aValue, bValue;
        
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
        hasFormats: selectedItems.filter(item => 
            item.accepted_formats && item.accepted_formats.length > 0
        ).length,
        totalFileSizeMB: selectedItems.reduce((sum, item) => 
            sum + getFileSizeMB(item.max_file_size), 0
        ),
        maxFileSizeMB: Math.max(...selectedItems.map(item => getFileSizeMB(item.max_file_size))),
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
        formatFileFormats(item.accepted_formats)
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

// Safe number conversion
export const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};