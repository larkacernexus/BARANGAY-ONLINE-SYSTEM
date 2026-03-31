// components/admin/committees/hooks/useCommitteesBulkActions.ts
import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Committee, BulkOperation } from '@/types/admin/committees/committees';

interface UseCommitteesBulkActionsProps {
    selectedIds: number[];
    selectedCommitteesData: Committee[];
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useCommitteesBulkActions({
    selectedIds,
    selectedCommitteesData,
    onSuccess,
    onError
}: UseCommitteesBulkActionsProps) {
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBulkOperation = useCallback(async (
        operation: BulkOperation,
        customData?: any
    ) => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one committee');
            return;
        }

        setIsPerformingBulkAction(true);
        setError(null);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    await handleExport();
                    break;

                case 'print':
                    await handlePrint();
                    break;

                case 'delete':
                    await handleDelete();
                    break;

                case 'activate':
                    await handleStatusUpdate('activate');
                    break;

                case 'deactivate':
                    await handleStatusUpdate('deactivate');
                    break;

                case 'generate_report':
                    await handleGenerateReport();
                    break;

                default:
                    toast.error('Operation not supported');
            }

            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            toast.error(`Failed: ${errorMessage}`);
            onError?.(err as Error);
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedIds, selectedCommitteesData, onSuccess, onError]);

    const handleExport = useCallback(async () => {
        const exportData = selectedCommitteesData.map(committee => ({
            'ID': committee.id,
            'Code': committee.code,
            'Name': committee.name,
            'Description': committee.description || '',
            'Display Order': committee.order,
            'Positions Count': committee.positions_count || 0,
            'Status': committee.is_active ? 'Active' : 'Inactive',
            'Created At': committee.created_at,
            'Updated At': committee.updated_at,
        }));
        
        // Convert to CSV
        const headers = Object.keys(exportData[0]);
        const csv = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    const value = row[header as keyof typeof row];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `committees-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Exported ${selectedIds.length} committee(s) successfully`);
    }, [selectedCommitteesData, selectedIds.length]);

    const handlePrint = useCallback(async () => {
        selectedIds.forEach(id => {
            window.open(`/committees/${id}/print`, '_blank');
        });
        toast.success(`${selectedIds.length} committee(s) opened for printing`);
    }, [selectedIds]);

    const handleDelete = useCallback(async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected committee(s)? This action cannot be undone.`)) {
            return;
        }

        await router.post('/committees/bulk-delete', {
            ids: selectedIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${selectedIds.length} committee(s) deleted successfully`);
            },
            onError: () => {
                toast.error('Failed to delete committees');
            },
        });
    }, [selectedIds]);

    const handleStatusUpdate = useCallback(async (statusAction: 'activate' | 'deactivate') => {
        const endpoint = statusAction === 'activate' 
            ? '/committees/bulk-activate' 
            : '/committees/bulk-deactivate';
        
        const actionText = statusAction === 'activate' ? 'activate' : 'deactivate';

        await router.post(endpoint, {
            ids: selectedIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${selectedIds.length} committee(s) ${actionText}d successfully`);
            },
            onError: () => {
                toast.error(`Failed to ${actionText} committees`);
            },
        });
    }, [selectedIds]);

    const handleGenerateReport = useCallback(async () => {
        const idsParam = selectedIds.join(',');
        window.open(`/committees/report?ids=${idsParam}`, '_blank');
        toast.success(`Generating report for ${selectedIds.length} committee(s)`);
    }, [selectedIds]);

    const handleCopySelectedData = useCallback(() => {
        if (selectedCommitteesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedCommitteesData.map(committee => ({
            Code: committee.code,
            Name: committee.name,
            Description: committee.description || '',
            Order: committee.order,
            Positions: committee.positions_count || 0,
            Status: committee.is_active ? 'Active' : 'Inactive',
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedCommitteesData]);

    const handleExportAll = useCallback((filters: any) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                queryParams.append(key, value as string);
            }
        });
        window.location.href = `/committees/export?${queryParams.toString()}`;
    }, []);

    const getSelectionStats = useCallback(() => {
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

    return {
        isPerformingBulkAction,
        error,
        handleBulkOperation,
        handleCopySelectedData,
        handleExportAll,
        getSelectionStats,
        clearError: () => setError(null),
    };
}

// Export a hook factory for easier usage
export function createCommitteesBulkActionsHook() {
    return function useCommitteesBulkActionsHook(
        selectedIds: number[],
        selectedCommitteesData: Committee[]
    ) {
        return useCommitteesBulkActions({
            selectedIds,
            selectedCommitteesData
        });
    };
}

// Utility functions for common bulk operations
export const bulkOperations = {
    // Confirmation messages
    getDeleteConfirmation: (count: number) => 
        `Are you sure you want to delete ${count} selected committee(s)? This action cannot be undone.`,
    
    getActivateConfirmation: (count: number) =>
        `Activate ${count} selected committee(s)?`,
    
    getDeactivateConfirmation: (count: number) =>
        `Deactivate ${count} selected committee(s)?`,
    
    // Success messages
    getDeleteSuccess: (count: number) =>
        `${count} committee(s) deleted successfully`,
    
    getActivateSuccess: (count: number) =>
        `${count} committee(s) activated successfully`,
    
    getDeactivateSuccess: (count: number) =>
        `${count} committee(s) deactivated successfully`,
    
    // Error messages
    getDeleteError: () => 'Failed to delete committees',
    
    getActivateError: () => 'Failed to activate committees',
    
    getDeactivateError: () => 'Failed to deactivate committees',
    
    // Status check helpers
    canActivate: (committees: Committee[]) =>
        committees.some(c => !c.is_active),
    
    canDeactivate: (committees: Committee[]) =>
        committees.some(c => c.is_active),
    
    hasPositions: (committees: Committee[]) =>
        committees.some(c => (c.positions_count || 0) > 0),
    
    // Selection helpers
    getSelectedIdsString: (ids: number[]) =>
        ids.join(','),
    
    getSelectionSummary: (committees: Committee[]) => {
        const total = committees.length;
        const active = committees.filter(c => c.is_active).length;
        const totalPositions = committees.reduce((sum, c) => sum + (c.positions_count || 0), 0);
        
        return {
            total,
            active,
            inactive: total - active,
            totalPositions,
            hasPositions: committees.filter(c => (c.positions_count || 0) > 0).length
        };
    }
};