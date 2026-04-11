import { useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { 
  BackupFile, 
  BackupProgress, 
  BulkOperation,
  SelectionStats 
} from '@/types/admin/backup/backup';
import { 
  simulateBackupProgress,
  calculateSelectionStats
} from '@/admin-utils/backupUtils';
import { formatBytes } from '@/admin-utils/formatters';

export const useBackupOperations = () => {
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkRestoreDialog, setShowBulkRestoreDialog] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'database' | 'files'>('full');
  const [backupDescription, setBackupDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateBackup = useCallback(async () => {
    if (!backupType) {
      toast.error('Please select a backup type');
      return;
    }

    setCreatingBackup(true);
    
    // Clear any existing interval first
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }

    // Start progress simulation up to 90%
    const simulationInterval = simulateBackupProgress(setBackupProgress, () => {
      // This callback is called when simulation reaches 90%
    });

    setProgressInterval(simulationInterval);
    
    // Make actual API call
    router.post(
      route('backup.create'),
      {
        type: backupType,
        description: backupDescription,
      },
      {
        onSuccess: () => {
          // When backend succeeds, complete the progress
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }
          
          setBackupProgress({
            percentage: 100,
            status: 'completed',
            message: 'Backup created successfully!',
            currentStep: 'Complete'
          });
          
          // Short delay to show completion
          setTimeout(() => {
            setBackupProgress(null);
            setBackupDescription('');
            setShowCreateDialog(false);
            setCreatingBackup(false);
            
            // Reload data
            router.reload({ only: ['backups', 'diskSpace', 'lastBackup', 'stats', 'flash'] });
          }, 1500);
        },
        onError: (errors) => {
          // When backend fails
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }
          
          setBackupProgress({
            percentage: 100,
            status: 'failed',
            message: errors?.message || 'Failed to create backup. Please check the logs.'
          });
          
          setCreatingBackup(false);
        },
      }
    );
  }, [backupType, backupDescription, progressInterval]);

  const handleDownloadBackup = useCallback((backup: BackupFile) => {
      const filename = backup.filename || backup.name;
      
      if (!filename) {
          toast.error('Cannot download backup: filename is missing');
          return;
      }
      
      const link = document.createElement('a');
      link.href = route('backup.download', { filename });
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }, []);

  // Already accepts BackupFile - good
  const handleDeleteBackup = useCallback((backup: BackupFile) => {
    const filename = backup.filename || backup.name;
    if (confirm(`Are you sure you want to delete backup "${filename}"? This action cannot be undone.`)) {
      router.delete(
        route('backup.destroy', { filename }),
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Backup deleted successfully');
          },
          onError: (errors: any) => {
            toast.error('Failed to delete backup: ' + (errors.message || 'Unknown error'));
          },
        }
      );
    }
  }, []);

  const handleBulkOperation = useCallback(async (
    operation: BulkOperation, 
    selectedIds: string[],
    selectedBackupsData: BackupFile[]
  ) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one backup');
      return;
    }

    setIsPerformingBulkAction(true);

    try {
      switch (operation) {
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} selected backup(s)? This action cannot be undone.`)) {
            await Promise.all(
              selectedBackupsData.map(backup => 
                router.delete(
                  route('backup.destroy', { filename: backup.filename }),
                  { preserveScroll: true }
                )
              )
            );
            setShowBulkDeleteDialog(false);
            toast.success(`${selectedIds.length} backup(s) deleted successfully`);
            router.reload();
          }
          break;

        case 'download':
          // Download backups one by one
          selectedBackupsData.forEach((backup, index) => {
            setTimeout(() => {
              handleDownloadBackup(backup); // Now passing BackupFile directly
            }, index * 500);
          });
          toast.success(`Downloading ${selectedIds.length} backup(s)`);
          break;

        case 'export':
          if (selectedBackupsData.length === 0) {
            toast.error('No data to export');
            break;
          }
          
          const exportData = selectedBackupsData.map(backup => ({
            'Filename': backup.filename,
            'Type': backup.type,
            'Size': backup.size,
            'Size (bytes)': backup.size_bytes,
            'Created': backup.modified,
            'Protected': backup.is_protected ? 'Yes' : 'No',
            'Description': backup.description || '',
            'Download URL': backup.download_url,
          }));
          
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
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backups-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success('Data exported successfully');
          break;

        case 'protect':
          await Promise.all(
            selectedBackupsData.map(backup => 
              router.post(
                route('backup.protect', { filename: backup.filename }),
                {},
                { preserveScroll: true }
              )
            )
          );
          toast.success(`${selectedIds.length} backup(s) protected`);
          router.reload();
          break;

        case 'unprotect':
          await Promise.all(
            selectedBackupsData.map(backup => 
              router.post(
                route('backup.unprotect', { filename: backup.filename }),
                {},
                { preserveScroll: true }
              )
            )
          );
          toast.success(`${selectedIds.length} backup(s) unprotected`);
          router.reload();
          break;

        default:
          toast.info(`${operation} functionality to be implemented`);
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast.error('An error occurred during the bulk operation.');
    } finally {
      setIsPerformingBulkAction(false);
    }
  }, [handleDownloadBackup]);

  const handleCopySelectedData = useCallback((selectedBackupsData: BackupFile[]) => {
    if (selectedBackupsData.length === 0) {
      toast.error('No data to copy');
      return;
    }
    
    const data = selectedBackupsData.map(backup => ({
      'Filename': backup.filename,
      'Type': backup.type,
      'Size': backup.size,
      'Created': backup.modified,
      'Protected': backup.is_protected ? 'Yes' : 'No',
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      toast.success('Data copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  }, []);

  // Updated to accept BackupFile
  const toggleProtection = useCallback((backup: BackupFile) => {
    const filename = backup.filename || backup.name;
    router.post(
      route('backup.toggle-protection', { filename }),
      {},
      {
        onSuccess: () => {
          toast.success('Protection status updated');
          router.reload({ only: ['backups'] });
        },
        onError: () => {
          toast.error('Failed to update protection status');
        }
      }
    );
  }, []);

  // Cleanup progress interval
  const cleanupProgress = useCallback(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setBackupProgress(null);
  }, [progressInterval]);

  return {
    // States
    creatingBackup,
    backupProgress,
    isPerformingBulkAction,
    showCreateDialog,
    showBulkDeleteDialog,
    showBulkRestoreDialog,
    backupType,
    backupDescription,
    copied,
    
    // Setters
    setCreatingBackup,
    setBackupProgress,
    setShowCreateDialog,
    setShowBulkDeleteDialog,
    setShowBulkRestoreDialog,
    setBackupType,
    setBackupDescription,
    setCopied,
    
    // Operations - all accept BackupFile
    handleCreateBackup,
    handleDownloadBackup,  // Now accepts BackupFile
    handleDeleteBackup,     // Accepts BackupFile
    handleBulkOperation,
    handleCopySelectedData,
    toggleProtection,       // Now accepts BackupFile
    cleanupProgress,
    
    // Progress management
    progressInterval,
    setProgressInterval,
  };
};