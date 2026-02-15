// admin-utils/officialsUtils.ts
import { Official } from '@/types/officials';

export interface FilterState {
    search: string;
    status: string;
    position: string;
    committee: string;
    type: string;
    sort_by: string;
    sort_order: string;
}

export type BulkOperation = 
    'export' | 'delete' | 'activate' | 'deactivate' | 
    'make_current' | 'make_former' | 'print' | 'export_csv' | 
    'generate_report' | 'message_officials';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    current: number;
    former: number;
    regular: number;
    exOfficio: number;
    withCommittee: number;
    withoutCommittee: number;
    hasContact: number;
    noContact: number;
    active: number;
    inactive: number;
}

export interface OfficialStats {
    total: number;
    active: number;
    current: number;
    former: number;
    regular: number;
    ex_officio: number;
    by_position: Record<string, number>;
    by_committee: Record<string, number>;
    by_status: Record<string, number>;
}

// Filter officials
export const filterOfficials = (
    officials: Official[],
    search: string,
    filters: FilterState,
    positions: Record<string, { name: string; order: number }>,
    committees: Record<string, string>
): Official[] => {
    let result = [...officials];
    
    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(official => {
            const resident = official.resident;
            return (
                resident?.full_name.toLowerCase().includes(searchLower) ||
                official.full_position.toLowerCase().includes(searchLower) ||
                official.committee?.toLowerCase().includes(searchLower) ||
                official.responsibilities?.toLowerCase().includes(searchLower) ||
                resident?.contact_number?.includes(search) ||
                official.contact_number?.includes(search)
            );
        });
    }
    
    // Status filter
    if (filters.status !== 'all') {
        if (filters.status === 'current') {
            result = result.filter(official => official.is_current);
        } else {
            result = result.filter(official => official.status === filters.status);
        }
    }
    
    // Position filter
    if (filters.position !== 'all') {
        result = result.filter(official => official.position === filters.position);
    }
    
    // Committee filter
    if (filters.committee !== 'all') {
        result = result.filter(official => official.committee === filters.committee);
    }
    
    // Type filter
    if (filters.type !== 'all') {
        const isRegular = filters.type === 'regular';
        result = result.filter(official => official.is_regular === isRegular);
    }
    
    // Sorting
    result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sort_by) {
            case 'order':
                aValue = a.order;
                bValue = b.order;
                break;
            case 'position':
                aValue = positions[a.position]?.order || 0;
                bValue = positions[b.position]?.order || 0;
                break;
            case 'name':
                aValue = a.resident?.full_name || '';
                bValue = b.resident?.full_name || '';
                break;
            case 'committee':
                aValue = committees[a.committee || ''] || '';
                bValue = committees[b.committee || ''] || '';
                break;
            case 'term_start':
                aValue = new Date(a.term_start).getTime();
                bValue = new Date(b.term_start).getTime();
                break;
            case 'status':
                aValue = a.is_current ? 0 : 1;
                bValue = b.is_current ? 0 : 1;
                break;
            default:
                aValue = a.order;
                bValue = b.order;
        }

        if (filters.sort_order === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });
    
    return result;
};

// Calculate selection stats
export const getSelectionStats = (selectedOfficials: Official[]): SelectionStats => {
    const currentOfficials = selectedOfficials.filter(o => o.is_current).length;
    const formerOfficials = selectedOfficials.filter(o => !o.is_current).length;
    const regularOfficials = selectedOfficials.filter(o => o.is_regular).length;
    const exOfficioOfficials = selectedOfficials.filter(o => !o.is_regular).length;
    
    return {
        total: selectedOfficials.length,
        current: currentOfficials,
        former: formerOfficials,
        regular: regularOfficials,
        exOfficio: exOfficioOfficials,
        withCommittee: selectedOfficials.filter(o => o.committee).length,
        withoutCommittee: selectedOfficials.filter(o => !o.committee).length,
        hasContact: selectedOfficials.filter(o => o.contact_number || o.resident?.contact_number).length,
        noContact: selectedOfficials.filter(o => !o.contact_number && !o.resident?.contact_number).length,
        active: selectedOfficials.filter(o => o.status === 'active').length,
        inactive: selectedOfficials.filter(o => o.status === 'inactive').length,
    };
};

// Format for clipboard/export
export const formatForClipboard = (officials: Official[]): string => {
    const data = officials.map(official => ({
        'ID': official.id,
        'Full Name': official.resident?.full_name || '',
        'Position': official.full_position,
        'Committee': official.committee || '',
        'Contact Number': official.contact_number || official.resident?.contact_number || '',
        'Email': official.email || '',
        'Term Start': official.term_start,
        'Term End': official.term_end,
        'Status': official.status,
        'Is Current': official.is_current ? 'Yes' : 'No',
        'Type': official.is_regular ? 'Regular' : 'Ex-Officio',
        'Created At': official.created_at,
    }));
    
    const headers = Object.keys(data[0]);
    return [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header as keyof typeof row];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');
};

// Format date
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

// Truncate text with responsive length
export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Get responsive truncation length
export const getTruncationLength = (
    type: 'name' | 'position' | 'committee' | 'term' = 'name',
    windowWidth: number
): number => {
    if (windowWidth < 640) { // Mobile
        switch(type) {
            case 'name': return 12;
            case 'position': return 10;
            case 'committee': return 8;
            case 'term': return 10;
            default: return 12;
        }
    }
    if (windowWidth < 768) { // Tablet
        switch(type) {
            case 'name': return 15;
            case 'position': return 12;
            case 'committee': return 10;
            case 'term': return 12;
            default: return 15;
        }
    }
    if (windowWidth < 1024) { // Small desktop
        switch(type) {
            case 'name': return 20;
            case 'position': return 15;
            case 'committee': return 12;
            case 'term': return 15;
            default: return 20;
        }
    }
    // Large desktop
    switch(type) {
        case 'name': return 25;
        case 'position': return 20;
        case 'committee': return 15;
        case 'term': return 18;
        default: return 25;
    }
};

// Get status badge variant
export const getStatusBadgeVariant = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
        return { className: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Current' };
    }
    switch (status) {
        case 'active':
            return { className: 'bg-blue-100 text-blue-800 hover:bg-blue-200', text: 'Active' };
        case 'inactive':
            return { className: 'bg-gray-100 text-gray-800 hover:bg-gray-200', text: 'Inactive' };
        case 'former':
            return { className: 'bg-amber-100 text-amber-800 hover:bg-amber-200', text: 'Former' };
        default:
            return { className: '', text: status };
    }
};

// Get position badge variant
export const getPositionBadgeVariant = (position: string) => {
    switch (position) {
        case 'captain':
            return { className: 'bg-red-100 text-red-800 hover:bg-red-200', text: 'Captain' };
        case 'kagawad':
            return { className: 'bg-blue-100 text-blue-800 hover:bg-blue-200', text: 'Kagawad' };
        case 'secretary':
            return { className: 'bg-purple-100 text-purple-800 hover:bg-purple-200', text: 'Secretary' };
        case 'treasurer':
            return { className: 'bg-green-100 text-green-800 hover:bg-green-200', text: 'Treasurer' };
        case 'sk_chairman':
            return { className: 'bg-pink-100 text-pink-800 hover:bg-pink-200', text: 'SK Chairman' };
        default:
            return { className: 'bg-gray-100 text-gray-800 hover:bg-gray-200', text: position };
    }
};

// Get stats card color
export const getStatsCardColor = (index: number): string => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'teal'];
    return colors[index % colors.length];
};

// Get color class
export const getColorClass = (color: string): string => {
    switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'orange': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'indigo': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
        case 'pink': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
        case 'teal': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
        default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
};