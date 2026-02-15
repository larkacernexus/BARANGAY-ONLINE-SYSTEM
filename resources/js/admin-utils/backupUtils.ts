import { BackupFile, BackupProgress, SelectionStats } from '@/types/backup';
import { formatBytes } from './formatters';
import { 
  Clock4, 
  RefreshCw, 
  FileArchive, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  DatabaseBackup,
  ServerCog,
  FileLock,
  Save,
  Lock,
  Unlock
} from 'lucide-react';

export const PROGRESS_MESSAGES = {
  pending: 'Initializing backup process...',
  processing: 'Preparing backup data...',
  compressing: 'Compressing files...',
  finalizing: 'Finalizing backup...',
  completed: 'Backup completed successfully!',
  failed: 'Backup failed. Please try again.'
};

export const PROGRESS_ICONS = {
  pending: Clock4,
  processing: RefreshCw,
  compressing: FileArchive,
  finalizing: ShieldCheck,
  completed: CheckCircle,
  failed: XCircle
};

export const PROGRESS_COLORS = {
  pending: 'bg-gray-500',
  processing: 'bg-blue-500',
  compressing: 'bg-purple-500',
  finalizing: 'bg-amber-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'full': return DatabaseBackup;
    case 'database': return ServerCog;
    case 'files': return FileLock;
    default: return Save;
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'full': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'database': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'files': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'full': return 'Full System';
    case 'database': return 'Database Only';
    case 'files': return 'Files Only';
    default: return 'Unknown';
  }
};

export const getProtectionIcon = (isProtected?: boolean) => {
  return isProtected ? Lock : Unlock;
};

export const getProtectionBadge = (isProtected?: boolean) => {
  if (!isProtected) return null;
  
  return {
    text: 'Protected',
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    icon: Lock
  };
};

export const calculateSelectionStats = (selectedBackups: BackupFile[]): SelectionStats => {
  if (selectedBackups.length === 0) {
    return {
      total: 0,
      totalSize: 0,
      formattedSize: '0 B',
      fullCount: 0,
      databaseCount: 0,
      filesCount: 0,
      protectedCount: 0,
      largestSize: 0,
      smallestSize: 0
    };
  }
  
  const totalSize = selectedBackups.reduce((sum, backup) => sum + backup.size_bytes, 0);
  const sizes = selectedBackups.map(b => b.size_bytes);
  
  return {
    total: selectedBackups.length,
    totalSize,
    formattedSize: formatBytes(totalSize),
    fullCount: selectedBackups.filter(b => b.type === 'full').length,
    databaseCount: selectedBackups.filter(b => b.type === 'database').length,
    filesCount: selectedBackups.filter(b => b.type === 'files').length,
    protectedCount: selectedBackups.filter(b => b.is_protected).length,
    largestSize: Math.max(...sizes),
    smallestSize: Math.min(...sizes)
  };
};

export const filterBackups = (
  backups: BackupFile[],
  filters: {
    search: string;
    type: string;
    size: string;
    fromDate: string;
    toDate: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }
): BackupFile[] => {
  let result = [...backups];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(backup => 
      backup.filename.toLowerCase().includes(searchLower) ||
      (backup.description && backup.description.toLowerCase().includes(searchLower))
    );
  }

  // Type filter
  if (filters.type !== 'all') {
    result = result.filter(backup => backup.type === filters.type);
  }

  // Size filter
  if (filters.size !== 'all') {
    const sizeRanges: Record<string, { min: number; max: number }> = {
      'small': { min: 0, max: 10 * 1024 * 1024 },
      'medium': { min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
      'large': { min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024 },
      'xlarge': { min: 1024 * 1024 * 1024, max: Infinity },
    };
    
    if (sizeRanges[filters.size]) {
      const { min, max } = sizeRanges[filters.size];
      result = result.filter(backup => backup.size_bytes >= min && backup.size_bytes < max);
    }
  }

  // Date range filter
  if (filters.fromDate) {
    const fromDate = new Date(filters.fromDate);
    result = result.filter(backup => {
      try {
        const modifiedDate = new Date(backup.modified);
        return modifiedDate >= fromDate;
      } catch {
        return true;
      }
    });
  }

  if (filters.toDate) {
    const toDate = new Date(filters.toDate);
    result = result.filter(backup => {
      try {
        const modifiedDate = new Date(backup.modified);
        return modifiedDate <= toDate;
      } catch {
        return true;
      }
    });
  }

  // Sorting
  result.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (filters.sortBy) {
      case 'filename':
        aValue = a.filename.toLowerCase();
        bValue = b.filename.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'size':
        aValue = a.size_bytes;
        bValue = b.size_bytes;
        break;
      case 'modified':
        aValue = new Date(a.modified).getTime();
        bValue = new Date(b.modified).getTime();
        break;
      default:
        aValue = new Date(a.modified).getTime();
        bValue = new Date(b.modified).getTime();
    }

    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return result;
};

export const simulateBackupProgress = (
  setProgress: (progress: BackupProgress) => void,
  onComplete: () => void
): NodeJS.Timeout => {
  let progress = 0;
  
  setProgress({
    percentage: 0,
    status: 'pending',
    message: PROGRESS_MESSAGES.pending
  });

  const interval = setInterval(() => {
    progress += Math.random() * 8;
    
    if (progress < 20) {
      setProgress({
        percentage: Math.min(progress, 90),
        status: 'processing',
        message: 'Initializing backup process...',
        currentStep: 'Initialization',
        estimatedTimeRemaining: '2-3 minutes remaining'
      });
    } else if (progress < 50) {
      setProgress({
        percentage: Math.min(progress, 90),
        status: 'processing',
        message: 'Preparing database export...',
        currentStep: 'Database export',
        estimatedTimeRemaining: '1-2 minutes remaining'
      });
    } else if (progress < 80) {
      setProgress({
        percentage: Math.min(progress, 90),
        status: 'compressing',
        message: 'Compressing backup files...',
        currentStep: 'Compression',
        estimatedTimeRemaining: '30-60 seconds remaining'
      });
    } else if (progress < 90) {
      setProgress({
        percentage: Math.min(progress, 90),
        status: 'finalizing',
        message: 'Finalizing backup package...',
        currentStep: 'Finalization',
        estimatedTimeRemaining: '10-20 seconds remaining'
      });
    }
  }, 500);

  return interval;
};