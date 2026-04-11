import { useState, useEffect, useCallback } from 'react';
import { SelectionMode } from '@/types/admin/backup/backup';

export const useBackupSelection = () => {
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);

  const handleSelectAllOnPage = useCallback((pageIds: string[]) => {
    setSelectedBackups(prev => {
      const allSelected = pageIds.every(id => prev.includes(id));
      
      if (allSelected) {
        // Deselect all on page
        return prev.filter(id => !pageIds.includes(id));
      } else {
        // Select all on page
        const newSelected = [...new Set([...prev, ...pageIds])];
        return newSelected;
      }
    });
    
    setIsSelectAll(prev => !prev);
    setSelectionMode('page');
  }, []);

  const handleSelectAllFiltered = useCallback((filteredIds: string[]) => {
    setSelectedBackups(prev => {
      const allSelected = filteredIds.every(id => prev.includes(id));
      
      if (allSelected) {
        // Deselect all filtered
        return prev.filter(id => !filteredIds.includes(id));
      } else {
        // Select all filtered
        const newSelected = [...new Set([...prev, ...filteredIds])];
        return newSelected;
      }
    });
    
    setSelectionMode('filtered');
  }, []);

  const handleItemSelect = useCallback((id: string) => {
    setSelectedBackups(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBackups([]);
    setIsSelectAll(false);
  }, []);

  const toggleBulkMode = useCallback(() => {
    setIsBulkMode(prev => {
      if (prev) {
        // Turning off bulk mode
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  // Reset selection when bulk mode is turned off
  useEffect(() => {
    if (!isBulkMode) {
      clearSelection();
    }
  }, [isBulkMode, clearSelection]);

  // Update isSelectAll based on current page selection
  const updateSelectAll = useCallback((pageIds: string[]) => {
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedBackups.includes(id));
    setIsSelectAll(allSelected);
  }, [selectedBackups]);

  return {
    // State
    selectedBackups,
    isBulkMode,
    showBulkActions,
    isSelectAll,
    selectionMode,
    showSelectionOptions,
    
    // Setters - Keep both the direct setter and toggle function
    setSelectedBackups,
    setIsBulkMode, // Keep the original setter
    toggleBulkMode, // Export toggle function separately
    setShowBulkActions,
    setIsSelectAll,
    setSelectionMode,
    setShowSelectionOptions,
    
    // Actions
    handleSelectAllOnPage,
    handleSelectAllFiltered,
    handleItemSelect,
    clearSelection,
    updateSelectAll,
  };
};