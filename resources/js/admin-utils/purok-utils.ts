import { Purok, PurokFilters } from '@/types/admin/puroks/purok';

export const purokUtils = {
    filterPuroks: ({
        puroks,
        search,
        filters
    }: {
        puroks: Purok[];
        search: string;
        filters: PurokFilters;
    }): Purok[] => {
        let result = [...puroks];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(purok => 
                purok.name.toLowerCase().includes(searchLower) ||
                purok.leader_name.toLowerCase().includes(searchLower) ||
                purok.description.toLowerCase().includes(searchLower) ||
                purok.leader_contact.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
            result = result.filter(purok => purok.status === filters.status);
        }
        
        // Sorting
        const sortBy = filters.sort_by || 'name';
        const sortOrder = filters.sort_order || 'asc';
        
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'total_households':
                    aValue = a.total_households;
                    bValue = b.total_households;
                    break;
                case 'total_residents':
                    aValue = a.total_residents;
                    bValue = b.total_residents;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
        
        return result;
    },

    getSelectionStats: (selectedPuroks: Purok[]) => {
        const totalHouseholds = selectedPuroks.reduce((sum, p) => sum + p.total_households, 0);
        const totalResidents = selectedPuroks.reduce((sum, p) => sum + p.total_residents, 0);
        const avgHouseholds = selectedPuroks.length > 0 ? totalHouseholds / selectedPuroks.length : 0;
        const avgResidents = selectedPuroks.length > 0 ? totalResidents / selectedPuroks.length : 0;
        
        return {
            total: selectedPuroks.length,
            active: selectedPuroks.filter(p => p.status === 'active').length,
            inactive: selectedPuroks.filter(p => p.status === 'inactive').length,
            totalHouseholds: totalHouseholds,
            totalResidents: totalResidents,
            avgHouseholds: avgHouseholds,
            avgResidents: avgResidents,
            hasLeaders: selectedPuroks.filter(p => p.leader_name).length,
            hasMaps: selectedPuroks.filter(p => p.google_maps_url).length,
        };
    },

    formatDate: (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    truncateText: (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatContactNumber: (contact: string): string => {
        if (!contact) return 'Not assigned';
        if (contact.length <= 12) return contact;
        return purokUtils.truncateText(contact, 12);
    },

    getStatusBadgeVariant: (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    }
};