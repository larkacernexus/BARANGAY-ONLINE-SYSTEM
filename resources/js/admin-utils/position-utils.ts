import { Position, PositionFilters } from '@/types/position';

export const positionUtils = {
    filterPositions: ({
        positions,
        search,
        filters
    }: {
        positions: Position[];
        search: string;
        filters: PositionFilters;
    }): Position[] => {
        let result = [...positions];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(position => 
                position.name.toLowerCase().includes(searchLower) ||
                position.code.toLowerCase().includes(searchLower) ||
                position.description?.toLowerCase().includes(searchLower) ||
                position.committee?.name.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
            const isActive = filters.status === 'active';
            result = result.filter(position => position.is_active === isActive);
        }
        
        // Account requirement filter
        if (filters.requires_account && filters.requires_account !== 'all') {
            const requiresAccount = filters.requires_account === 'yes';
            result = result.filter(position => position.requires_account === requiresAccount);
        }
        
        // Sorting
        const sortBy = filters.sort_by || 'order';
        const sortOrder = filters.sort_order || 'asc';
        
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'order':
                    aValue = a.order;
                    bValue = b.order;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'status':
                    aValue = a.is_active ? 1 : 0;
                    bValue = b.is_active ? 1 : 0;
                    break;
                case 'officials_count':
                    aValue = a.officials_count || 0;
                    bValue = b.officials_count || 0;
                    break;
                default:
                    aValue = a.order;
                    bValue = b.order;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
        
        return result;
    },

    getSelectionStats: (selectedPositions: Position[]) => {
        const totalOfficials = selectedPositions.reduce((sum, p) => sum + (p.officials_count || 0), 0);
        const avgOfficials = selectedPositions.length > 0 ? totalOfficials / selectedPositions.length : 0;
        
        return {
            total: selectedPositions.length,
            active: selectedPositions.filter(p => p.is_active).length,
            inactive: selectedPositions.filter(p => !p.is_active).length,
            requiresAccount: selectedPositions.filter(p => p.requires_account).length,
            hasCommittee: selectedPositions.filter(p => p.committee).length,
            hasOfficials: selectedPositions.filter(p => (p.officials_count || 0) > 0).length,
            totalOfficials: totalOfficials,
            avgOfficials: avgOfficials,
            isKagawad: selectedPositions.filter(p => 
                p.name.toLowerCase().includes('kagawad') || 
                p.code.toLowerCase().includes('kagawad')
            ).length,
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

    getStatusBadgeVariant: (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    },

    getAccountBadgeVariant: (requiresAccount: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return requiresAccount ? 'default' : 'outline';
    },

    isKagawad: (name: string, code: string): boolean => {
        return name.toLowerCase().includes('kagawad') || code.toLowerCase().includes('kagawad');
    }
};