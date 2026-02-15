// utils/clearanceTypesUtils.ts
import { ClearanceType, FilterState, SelectionStats } from '@/types/clearance-types';

// Helper function to truncate text
export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Safe number conversion helper
export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Get status badge variant
export const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

// Get purpose options count
export const getPurposeOptionsCount = (type: ClearanceType) => {
    if (!type.purpose_options) return 0;
    return type.purpose_options.split(',').filter(opt => opt.trim() !== '').length;
};

// Format date
export const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// Selection stats calculator
export const getSelectionStats = (selectedTypes: ClearanceType[]): SelectionStats => {
    const totalValue = selectedTypes.reduce((sum, t) => sum + safeNumber(t.fee, 0), 0);
    
    let avgProcessingDays = 0;
    if (selectedTypes.length > 0) {
        const totalProcessingDays = selectedTypes.reduce((sum, t) => sum + safeNumber(t.processing_days, 0), 0);
        avgProcessingDays = totalProcessingDays / selectedTypes.length;
    }
    
    return {
        active: selectedTypes.filter(t => Boolean(t.is_active)).length,
        inactive: selectedTypes.filter(t => !t.is_active).length,
        paid: selectedTypes.filter(t => Boolean(t.requires_payment)).length,
        free: selectedTypes.filter(t => !t.requires_payment).length,
        needsApproval: selectedTypes.filter(t => Boolean(t.requires_approval)).length,
        onlineOnly: selectedTypes.filter(t => Boolean(t.is_online_only)).length,
        totalValue: safeNumber(totalValue, 0),
        avgProcessingDays: safeNumber(avgProcessingDays, 0),
    };
};

// Filter clearance types
export const filterClearanceTypes = (
    types: ClearanceType[],
    search: string,
    filters: FilterState,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
): ClearanceType[] => {
    let filtered = [...types];
    
    // Apply search
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(type =>
            type.name.toLowerCase().includes(searchLower) ||
            type.code.toLowerCase().includes(searchLower) ||
            type.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        filtered = filtered.filter(type => type.is_active === isActive);
    }
    
    // Apply payment filter
    if (filters.requires_payment !== 'all') {
        const requiresPayment = filters.requires_payment === 'yes';
        filtered = filtered.filter(type => type.requires_payment === requiresPayment);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'fee':
                aValue = a.fee;
                bValue = b.fee;
                break;
            case 'clearances_count':
                aValue = a.clearances_count || 0;
                bValue = b.clearances_count || 0;
                break;
            default:
                aValue = a[sortBy as keyof ClearanceType] as any;
                bValue = b[sortBy as keyof ClearanceType] as any;
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    return filtered;
};

// Format for clipboard
export const formatForClipboard = (types: ClearanceType[]): string => {
    const data = types.map(type => ({
        Name: type.name,
        Code: type.code,
        Fee: type.formatted_fee,
        Status: type.is_active ? 'Active' : 'Inactive',
        Processing: `${type.processing_days} days`,
        Issued: type.clearances_count || 0
    }));
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
};

// Get responsive truncation length
export const getTruncationLength = (
    type: 'name' | 'description' | 'code',
    windowWidth: number
): number => {
    if (windowWidth < 640) {
        switch(type) {
            case 'name': return 20;
            case 'description': return 25;
            case 'code': return 10;
            default: return 20;
        }
    }
    if (windowWidth < 768) {
        switch(type) {
            case 'name': return 25;
            case 'description': return 30;
            case 'code': return 12;
            default: return 25;
        }
    }
    if (windowWidth < 1024) {
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'code': return 15;
            default: return 30;
        }
    }
    switch(type) {
        case 'name': return 35;
        case 'description': return 40;
        case 'code': return 18;
        default: return 35;
    }
};