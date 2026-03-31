// resources/js/admin-utils/householdUtils.ts

import { Household, Purok, SelectionStats } from '@/types/admin/households/household.types';

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

export const getPurokName = (household: Household, puroks: Purok[]): string => {
    if (household.purok_name) {
        return household.purok_name;
    }
    if (household.purok_id) {
        const purok = puroks.find(p => p.id === household.purok_id);
        return purok ? purok.name : 'Unknown';
    }
    return 'No Purok';
};

export const getPurok = (household: Household, puroks: Purok[]): Purok | null => {
    if (household.purok_id) {
        return puroks.find(p => p.id === household.purok_id) || null;
    }
    return null;
};

export const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'archived': return 'outline';
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
        from_date?: string;
        to_date?: string;
        min_members?: string;
        max_members?: string;
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

    // Date range filter
    if (filters.from_date) {
        const fromDate = new Date(filters.from_date);
        result = result.filter(household => new Date(household.created_at) >= fromDate);
    }

    if (filters.to_date) {
        const toDate = new Date(filters.to_date);
        result = result.filter(household => new Date(household.created_at) <= toDate);
    }

    // Member count filter
    if (filters.min_members && !isNaN(parseInt(filters.min_members))) {
        const minMembers = parseInt(filters.min_members);
        result = result.filter(household => (household.member_count || 0) >= minMembers);
    }

    if (filters.max_members && !isNaN(parseInt(filters.max_members))) {
        const maxMembers = parseInt(filters.max_members);
        result = result.filter(household => (household.member_count || 0) <= maxMembers);
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

export const getSelectionStats = (selectedHouseholds: Household[]): SelectionStats => {
    if (selectedHouseholds.length === 0) {
        return {
            total: 0,
            active: 0,
            inactive: 0,
            archived: 0,
            totalMembers: 0,
            byPurok: {},
            byStatus: {}
        };
    }
    
    const total = selectedHouseholds.length;
    const totalMembers = selectedHouseholds.reduce((sum, h) => sum + (h.member_count || 0), 0);
    const active = selectedHouseholds.filter(h => h.status === 'active').length;
    const inactive = selectedHouseholds.filter(h => h.status === 'inactive').length;
    const archived = selectedHouseholds.filter(h => h.status === 'archived').length;
    
    // Count by purok
    const byPurok: Record<string, number> = {};
    selectedHouseholds.forEach(h => {
        const purokName = h.purok_name || `Purok ${h.purok_id}`;
        byPurok[purokName] = (byPurok[purokName] || 0) + 1;
    });
    
    // Count by status
    const byStatus: Record<string, number> = {
        active,
        inactive,
        archived
    };
    
    return {
        total,
        totalMembers,
        active,
        inactive,
        archived,
        byPurok,
        byStatus
    };
};

export const formatDate = (dateString: string | null | undefined): string => {
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

export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
        formatDate(household.created_at)
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

export const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const getMemberAgeGroup = (age: number): string => {
    if (age < 0) return 'Unknown';
    if (age < 1) return 'Infant';
    if (age < 5) return 'Toddler';
    if (age < 13) return 'Child';
    if (age < 20) return 'Teen';
    if (age < 60) return 'Adult';
    return 'Senior';
};