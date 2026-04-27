// import { useState, useEffect, useCallback } from 'react';
// import { router } from '@inertiajs/react';

// interface Filters {
//     search?: string;
//     status?: string;
//     sort_by?: string;
//     sort_order?: string;
// }

// export function useCommitteesFilters(initialFilters: Filters) {
//     const [search, setSearch] = useState(initialFilters.search || '');
//     const [status, setStatus] = useState(initialFilters.status || 'all');
//     const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'order');
//     const [sortOrder, setSortOrder] = useState(initialFilters.sort_order || 'asc');
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
//     const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//     const [windowWidth, setWindowWidth] = useState<number>(1024);
//     const [isMobile, setIsMobile] = useState(false);

//     // Track window resize
//     useEffect(() => {
//         if (typeof window === 'undefined') return;

//         const handleResize = () => {
//             const width = window.innerWidth;
//             setWindowWidth(width);
//             setIsMobile(width < 768);
//             if (width < 768 && viewMode === 'table') {
//                 setViewMode('grid');
//             }
//         };

//         window.addEventListener('resize', handleResize);
//         handleResize();
//         return () => window.removeEventListener('resize', handleResize);
//     }, [viewMode]);

//     const handleSort = useCallback((column: string) => {
//         const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
//         setSortBy(column);
//         setSortOrder(newSortOrder);
        
//         router.get('/committees', {
//             search,
//             status,
//             sort_by: column,
//             sort_order: newSortOrder,
//         }, {
//             preserveState: true,
//             preserveScroll: true,
//         });
//     }, [search, status, sortBy, sortOrder]);

//     const handleFilterChange = useCallback((key: string, value: string) => {
//         const updates: Record<string, string> = { search, status, sort_by: sortBy, sort_order: sortOrder };
//         updates[key] = value;
        
//         if (key === 'search') setSearch(value);
//         if (key === 'status') setStatus(value);
        
//         router.get('/committees', updates, {
//             preserveState: true,
//             preserveScroll: true,
//         });
//     }, [search, status, sortBy, sortOrder]);

//     const handleResetFilters = useCallback(() => {
//         setSearch('');
//         setStatus('all');
//         setSortBy('order');
//         setSortOrder('asc');
//         router.get('/committees');
//     }, []);

//     const hasActiveFilters = search || status !== 'all' || sortBy !== 'order' || sortOrder !== 'asc';

//     return {
//         search,
//         status,
//         sortBy,
//         sortOrder,
//         viewMode,
//         showAdvancedFilters,
//         windowWidth,
//         isMobile,
//         handleSort,
//         handleFilterChange,
//         handleResetFilters,
//         hasActiveFilters,
//         setViewMode,
//         setShowAdvancedFilters
//     };
// }