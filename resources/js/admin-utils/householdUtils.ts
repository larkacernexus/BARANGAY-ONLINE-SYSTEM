// resources/js/admin-utils/householdUtils.ts
import { Household, Purok } from '@/types';

export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (!address) return 'N/A';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

export const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export const getPurokName = (household: any, puroks: any[]): string => {
    if (household.purok && typeof household.purok === 'object') {
        return household.purok.name;
    }
    if (household.purok_id) {
        const purok = puroks.find(p => p.id === household.purok_id);
        return purok ? purok.name : 'Unknown';
    }
    return 'No Purok';
};

export const getPurok = (household: any, puroks: any[]): any => {
    if (household.purok && typeof household.purok === 'object') {
        return household.purok;
    }
    if (household.purok_id) {
        return puroks.find(p => p.id === household.purok_id) || null;
    }
    return null;
};

export const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        default: return 'outline';
    }
};

export const filterHouseholds = (
    households: Household[], 
    search: string, 
    filters: {
        status: string;
        purok_id: string;
        sort_by: string;
        sort_order: string;
    }, 
    puroks: Purok[]
): Household[] => {
    let result = [...households];

    // Search filter
    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(household => 
            household.household_number?.toLowerCase().includes(searchLower) ||
            household.head_of_family?.toLowerCase().includes(searchLower) ||
            household.address?.toLowerCase().includes(searchLower) ||
            (household.contact_number && household.contact_number.toLowerCase().includes(searchLower))
        );
    }

    // Status filter
    if (filters.status !== 'all') {
        result = result.filter(household => household.status === filters.status);
    }

    // Purok filter
    if (filters.purok_id !== 'all') {
        const purokId = parseInt(filters.purok_id);
        if (!isNaN(purokId)) {
            result = result.filter(household => {
                const householdPurok = getPurok(household, puroks);
                return householdPurok && householdPurok.id === purokId;
            });
        }
    }

    // Sorting
    result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sort_by) {
            case 'household_number':
                const aNum = parseInt(a.household_number?.replace(/\D/g, '') || '0');
                const bNum = parseInt(b.household_number?.replace(/\D/g, '') || '0');
                aValue = isNaN(aNum) ? a.household_number?.toLowerCase() || '' : aNum;
                bValue = isNaN(bNum) ? b.household_number?.toLowerCase() || '' : bNum;
                break;
            case 'head_of_family':
                aValue = a.head_of_family?.toLowerCase() || '';
                bValue = b.head_of_family?.toLowerCase() || '';
                break;
            case 'member_count':
                aValue = a.member_count || 0;
                bValue = b.member_count || 0;
                break;
            case 'created_at':
                aValue = new Date(a.created_at || '').getTime();
                bValue = new Date(b.created_at || '').getTime();
                break;
            case 'purok':
                aValue = getPurokName(a, puroks).toLowerCase();
                bValue = getPurokName(b, puroks).toLowerCase();
                break;
            case 'status':
                aValue = a.status?.toLowerCase() || '';
                bValue = b.status?.toLowerCase() || '';
                break;
            default:
                aValue = a.household_number?.toLowerCase() || '';
                bValue = b.household_number?.toLowerCase() || '';
        }

        if (filters.sort_order === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

    return result;
};

export const getSelectionStats = (selectedHouseholds: Household[]) => {
    if (selectedHouseholds.length === 0) {
        return {
            total: 0,
            active: 0,
            inactive: 0,
            totalMembers: 0,
            avgMembers: 0,
            hasContacts: 0
        };
    }
    
    const selectedData = selectedHouseholds;
    
    const avgMembers = selectedData.length > 0 
        ? selectedData.reduce((sum, h) => sum + (h.member_count || 0), 0) / selectedData.length
        : 0;
    
    return {
        total: selectedData.length,
        active: selectedData.filter(h => h.status === 'active').length,
        inactive: selectedData.filter(h => h.status === 'inactive').length,
        totalMembers: selectedData.reduce((sum, h) => sum + (h.member_count || 0), 0),
        avgMembers: Math.round(avgMembers * 10) / 10,
        hasContacts: selectedData.filter(h => h.contact_number).length,
    };
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

export const formatForClipboard = (households: Household[], puroks: Purok[]): string => {
    if (households.length === 0) return '';
    
    const headers = [
        'Household Number',
        'Head of Family',
        'Address',
        'Contact Number',
        'Purok',
        'Member Count',
        'Status',
        'Created Date'
    ];
    
    const rows = households.map(household => [
        `"${household.household_number || ''}"`,
        `"${household.head_of_family || ''}"`,
        `"${household.address || ''}"`,
        `"${household.contact_number || ''}"`,
        `"${getPurokName(household, puroks)}"`,
        household.member_count?.toString() || '0',
        household.status || '',
        formatDate(household.created_at || '')
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};