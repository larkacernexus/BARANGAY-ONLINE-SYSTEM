import { useState, useMemo, useCallback } from 'react';
import { BackupFile, Filters } from '@/types/backup';
import { filterBackups } from '@/admin-utils/backupUtils';

export const useBackupFilters = (initialBackups: BackupFile[], initialFilters?: Filters) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [typeFilter, setTypeFilter] = useState(initialFilters?.type || 'all');
  const [fromDateFilter, setFromDateFilter] = useState(initialFilters?.from_date || '');
  const [toDateFilter, setToDateFilter] = useState(initialFilters?.to_date || '');
  const [sizeFilter, setSizeFilter] = useState(initialFilters?.size || 'all');
  const [sortBy, setSortBy] = useState('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredBackups = useMemo(() => {
    return filterBackups(initialBackups, {
      search,
      type: typeFilter,
      size: sizeFilter,
      fromDate: fromDateFilter,
      toDate: toDateFilter,
      sortBy,
      sortOrder
    });
  }, [initialBackups, search, typeFilter, sizeFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

  const handleSort = useCallback((column: string) => {
    setSortBy(column);
    setSortOrder(prev => sortBy === column && prev === 'asc' ? 'desc' : 'asc');
  }, [sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('all');
    setSizeFilter('all');
    setFromDateFilter('');
    setToDateFilter('');
    setSortBy('modified');
    setSortOrder('desc');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return search || typeFilter !== 'all' || sizeFilter !== 'all' || fromDateFilter || toDateFilter;
  }, [search, typeFilter, sizeFilter, fromDateFilter, toDateFilter]);

  return {
    // State
    search,
    typeFilter,
    fromDateFilter,
    toDateFilter,
    sizeFilter,
    sortBy,
    sortOrder,
    showAdvancedFilters,
    
    // Setters
    setSearch,
    setTypeFilter,
    setFromDateFilter,
    setToDateFilter,
    setSizeFilter,
    setSortBy,
    setSortOrder,
    setShowAdvancedFilters,
    
    // Computed
    filteredBackups,
    hasActiveFilters,
    
    // Actions
    handleSort,
    handleClearFilters,
  };
};