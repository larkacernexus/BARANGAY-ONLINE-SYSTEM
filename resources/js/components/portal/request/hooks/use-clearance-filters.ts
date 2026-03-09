import { useState, useEffect, useRef } from 'react';
import type { ClearanceType } from '@/components/portal/request/types';

export function useClearanceFilters(clearanceTypes: ClearanceType[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTypes, setFilteredTypes] = useState<ClearanceType[]>(clearanceTypes);
    const [showSearch, setShowSearch] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [visibleCount, setVisibleCount] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const typeListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTypes(clearanceTypes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = clearanceTypes.filter(type => 
                type.name.toLowerCase().includes(query) ||
                type.description.toLowerCase().includes(query) ||
                type.purpose_options?.some(opt => opt.toLowerCase().includes(query)) ||
                type.category?.toLowerCase().includes(query)
            );
            setFilteredTypes(filtered);
        }
        setVisibleCount(10);
    }, [searchQuery, clearanceTypes]);

    const categories = ['all', ...new Set(clearanceTypes.map(t => t.category || 'Other').filter(Boolean))];

    const getFilteredByCategory = () => {
        if (categoryFilter === 'all') return filteredTypes;
        return filteredTypes.filter(t => (t.category || 'Other') === categoryFilter);
    };

    const categorizedTypes = getFilteredByCategory();
    const hasMore = categorizedTypes.length > visibleCount;

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + 10, categorizedTypes.length));
    };

    return {
        searchQuery,
        setSearchQuery,
        filteredTypes,
        showSearch,
        setShowSearch,
        viewMode,
        setViewMode,
        visibleCount,
        setVisibleCount,
        categoryFilter,
        setCategoryFilter,
        categorizedTypes,
        hasMore,
        loadMore,
        categories,
        typeListRef,
        searchInputRef
    };
}