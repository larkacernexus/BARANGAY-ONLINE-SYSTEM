// resources/js/admin-utils/residentsUtils.ts
import { Resident, FilterState, Purok } from '@/types';
import { toast } from 'sonner';

// Core utilities
export const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

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

export const getPhotoUrl = (photoPath?: string, photoUrl?: string): string | null => {
    if (photoUrl) return photoUrl;
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    
    const cleanPath = photoPath.replace('public/', '');
    
    if (cleanPath.startsWith('storage/')) {
        return `/${cleanPath}`;
    }
    
    if (cleanPath.includes('resident-photos') || cleanPath.includes('resident_photos')) {
        return `/storage/${cleanPath}`;
    }
    
    return `/storage/${cleanPath}`;
};

export const getFullName = (resident: Resident): string => {
    if (resident.full_name) return resident.full_name;

    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

export const getHouseholdInfo = (resident: Resident) => {
    if (!resident.household_memberships || resident.household_memberships.length === 0) {
        return null;
    }
    
    const membership = resident.household_memberships[0];
    
    if (membership.household) {
        return {
            id: membership.household.id,
            household_number: membership.household.household_number,
            head_of_family: membership.household.head_of_family,
            relationship_to_head: membership.relationship_to_head,
            is_head: membership.is_head
        };
    }
    
    return null;
};

export const isHeadOfHousehold = (resident: Resident): boolean => {
    if (!resident.household_memberships || resident.household_memberships.length === 0) {
        return false;
    }
    
    return resident.household_memberships.some(membership => membership.is_head);
};

export const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'default';
        case 'inactive':
        case 'deceased':
            return 'secondary';
        default: return 'outline';
    }
};

export const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'occupation' = 'name'): number => {
    if (typeof window === 'undefined') return 30;
    
    const width = window.innerWidth;
    if (width < 480) {
        switch(type) {
            case 'name': return 15;
            case 'address': return 20;
            case 'contact': return 8;
            case 'occupation': return 12;
            default: return 15;
        }
    }
    if (width < 640) {
        switch(type) {
            case 'name': return 20;
            case 'address': return 25;
            case 'contact': return 10;
            case 'occupation': return 15;
            default: return 20;
        }
    }
    if (width < 768) {
        switch(type) {
            case 'name': return 25;
            case 'address': return 30;
            case 'contact': return 12;
            case 'occupation': return 20;
            default: return 25;
        }
    }
    if (width < 1024) {
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'occupation': return 25;
            default: return 30;
        }
    }
    switch(type) {
        case 'name': return 35;
        case 'address': return 40;
        case 'contact': return 15;
        case 'occupation': return 30;
        default: return 35;
    }
};

// Main filter function
export const filterResidents = (
    residents: Resident[], 
    search: string, 
    filters: FilterState,
    sortBy: string = 'last_name',
    sortOrder: string = 'asc'
): Resident[] => {
    let result = [...residents];

    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(resident => 
            resident.first_name.toLowerCase().includes(searchLower) ||
            resident.last_name.toLowerCase().includes(searchLower) ||
            (resident.middle_name && resident.middle_name.toLowerCase().includes(searchLower)) ||
            (resident.contact_number && resident.contact_number.includes(search)) ||
            resident.address.toLowerCase().includes(searchLower) ||
            (resident.occupation && resident.occupation.toLowerCase().includes(searchLower)) ||
            (resident.educational_attainment && resident.educational_attainment.toLowerCase().includes(searchLower)) ||
            (resident.purok && resident.purok.name.toLowerCase().includes(searchLower)) ||
            (resident.household_memberships && resident.household_memberships.some(membership => 
                membership.household && 
                membership.household.household_number.toLowerCase().includes(searchLower)
            ))
        );
    }

    if (filters.status !== 'all') {
        result = result.filter(resident => resident.status === filters.status);
    }

    if (filters.purok_id !== 'all') {
        const purokId = parseInt(filters.purok_id);
        result = result.filter(resident => resident.purok_id === purokId);
    }

    if (filters.gender !== 'all') {
        result = result.filter(resident => resident.gender === filters.gender);
    }

    if (filters.min_age) {
        const minAge = parseInt(filters.min_age);
        result = result.filter(resident => resident.age >= minAge);
    }
    if (filters.max_age) {
        const maxAge = parseInt(filters.max_age);
        result = result.filter(resident => resident.age <= maxAge);
    }

    if (filters.civil_status !== 'all') {
        result = result.filter(resident => resident.civil_status === filters.civil_status);
    }

    if (filters.is_voter !== 'all') {
        const isVoter = filters.is_voter === '1';
        result = result.filter(resident => resident.is_voter === isVoter);
    }
    
    if (filters.is_head !== 'all') {
        const isHead = filters.is_head === '1';
        result = result.filter(resident => isHeadOfHousehold(resident) === isHead);
    }

    // Sorting
    result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
            case 'last_name':
                aValue = a.last_name.toLowerCase();
                bValue = b.last_name.toLowerCase();
                break;
            case 'first_name':
                aValue = a.first_name.toLowerCase();
                bValue = b.first_name.toLowerCase();
                break;
            case 'age':
                aValue = a.age;
                bValue = b.age;
                break;
            case 'created_at':
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
                break;
            case 'purok_id':
                aValue = a.purok?.name || '';
                bValue = b.purok?.name || '';
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'household':
                const aHousehold = getHouseholdInfo(a);
                const bHousehold = getHouseholdInfo(b);
                aValue = aHousehold?.household_number || '';
                bValue = bHousehold?.household_number || '';
                break;
            default:
                aValue = a.last_name.toLowerCase();
                bValue = b.last_name.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });

    return result;
};

// Selection stats
export const getSelectionStats = (selectedResidents: Resident[]) => {
    if (selectedResidents.length === 0) {
        return {
            total: 0,
            male: 0,
            female: 0,
            voters: 0,
            heads: 0,
            averageAge: 0
        };
    }
    
    const selectedData = selectedResidents;
    const avgAge = selectedData.length > 0 
        ? selectedData.reduce((sum, r) => sum + (r.age || 0), 0) / selectedData.length
        : 0;
    
    return {
        total: selectedData.length,
        male: selectedData.filter(r => r.gender === 'male').length,
        female: selectedData.filter(r => r.gender === 'female').length,
        voters: selectedData.filter(r => r.is_voter === 'yes').length,
        heads: selectedData.filter(r => isHeadOfHousehold(r)).length,
        averageAge: Math.round(avgAge * 10) / 10
    };
};

// Format date
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

// Format data for clipboard (CSV)
export const formatForClipboard = (residents: Resident[]): string => {
    if (residents.length === 0) return '';
    
    const headers = [
        'Full Name',
        'Gender',
        'Age',
        'Birthdate',
        'Contact Number',
        'Address',
        'Purok',
        'Civil Status',
        'Occupation',
        'Educational Attainment',
        'Status',
        'Voter',
        'Head of Household'
    ];
    
    const rows = residents.map(resident => [
        `"${getFullName(resident) || ''}"`,
        `"${resident.gender || 'N/A'}"`,
        resident.age?.toString() || '0',
        `"${formatDate(resident.birth_date || '')}"`,
        `"${resident.contact_number || ''}"`,
        `"${resident.address || ''}"`,
        `"${resident.purok?.name || 'N/A'}"`,
        `"${resident.civil_status || 'N/A'}"`,
        `"${resident.occupation || ''}"`,
        `"${resident.educational_attainment || ''}"`,
        `"${resident.status || 'N/A'}"`,
        resident.is_voter ? 'Yes' : 'No',
        isHeadOfHousehold(resident) ? 'Yes' : 'No'
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};