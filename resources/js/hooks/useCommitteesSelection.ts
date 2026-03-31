import { useState, useEffect, useMemo, useCallback } from 'react';
import { Committee } from '@/types/admin/committees/committees';

export function useCommitteesSelection(
    committees: Committee[],
    search: string,
    status: string,
    sortBy: string,
    sortOrder: string
) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

    // Filter committees
    const filteredCommittees = useMemo(() => {
        let result = [...committees];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(committee => 
                committee.name.toLowerCase().includes(searchLower) ||
                committee.code.toLowerCase().includes(searchLower) ||
                committee.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (status !== 'all') {
            const isActive = status === 'active';
            result = result.filter(committee => committee.is_active === isActive);
        }
        
        // Sorting
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
                case 'positions_count':
                    aValue = a.positions_count || 0;
                    bValue = b.positions_count || 0;
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
    }, [committees, search, status, sortBy, sortOrder]);

    // Get selected committees data
    const selectedCommitteesData = useMemo(() => {
        return committees.filter(committee => selectedIds.includes(committee.id));
    }, [selectedIds, committees]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedCommitteesData;
        const totalPositions = selectedData.reduce((sum, c) => sum + (c.positions_count || 0), 0);
        const avgPositions = selectedData.length > 0 ? totalPositions / selectedData.length : 0;
        
        return {
            total: selectedData.length,
            active: selectedData.filter(c => c.is_active).length,
            inactive: selectedData.filter(c => !c.is_active).length,
            hasPositions: selectedData.filter(c => (c.positions_count || 0) > 0).length,
            noPositions: selectedData.filter(c => (c.positions_count || 0) === 0).length,
            totalPositions: totalPositions,
            avgPositions: avgPositions,
        };
    }, [selectedCommitteesData]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = filteredCommittees.map(committee => committee.id);
        if (isSelectAll) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedIds, ...pageIds])];
            setSelectedIds(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [filteredCommittees, isSelectAll, selectedIds]);

    // Handle select/deselect all filtered items
    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredCommittees.map(committee => committee.id);
        if (selectedIds.length === allIds.length && allIds.every(id => selectedIds.includes(id))) {
            setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedIds, ...allIds])];
            setSelectedIds(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredCommittees, selectedIds]);

    // Handle select all items
    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${committees.length} committees. This action may take a moment.`)) {
            const pageIds = filteredCommittees.map(committee => committee.id);
            setSelectedIds(pageIds);
            setSelectionMode('all');
        }
    }, [committees.length, filteredCommittees]);

    // Handle individual item selection
    const handleItemSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = filteredCommittees.map(committee => committee.id);
        const allSelected = allPageIds.every(id => selectedIds.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedIds, filteredCommittees]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedIds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    const toggleBulkMode = useCallback(() => {
        setIsBulkMode(!isBulkMode);
    }, [isBulkMode]);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
        setIsSelectAll(false);
    }, []);

    return {
        selectedIds,
        isBulkMode,
        isSelectAll,
        selectionMode,
        showSelectionOptions,
        showBulkActions,
        showBulkDeleteDialog,
        showBulkStatusDialog,
        isPerformingBulkAction,
        filteredCommittees,
        selectedCommitteesData,
        selectionStats,
        handleItemSelect,
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        toggleBulkMode,
        clearSelection,
        setSelectedIds,
        setIsBulkMode,
        setShowSelectionOptions,
        setShowBulkActions,
        setShowBulkDeleteDialog,
        setShowBulkStatusDialog,
        setIsPerformingBulkAction
    };
}