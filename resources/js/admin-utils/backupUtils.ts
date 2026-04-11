// resources/js/admin-utils/backupUtils.ts
import { BackupFile, BackupProgress, SelectionStats } from '@/types/admin/backup/backup';
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
  Unlock,
  Database,
  FileText,
  Archive
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================
// Formatting Utilities
// ============================================

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return 'Unknown date';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getTruncationLength = (type: 'filename' | 'description' | 'type' = 'filename'): number => {
  if (typeof window === 'undefined') return 30;
  
  const width = window.innerWidth;
  if (width < 640) { // Mobile
    switch(type) {
      case 'filename': return 20;
      case 'description': return 25;
      case 'type': return 10;
      default: return 20;
    }
  }
  if (width < 768) { // Tablet
    switch(type) {
      case 'filename': return 25;
      case 'description': return 30;
      case 'type': return 12;
      default: return 25;
    }
  }
  if (width < 1024) { // Small desktop
    switch(type) {
      case 'filename': return 30;
      case 'description': return 35;
      case 'type': return 15;
      default: return 30;
    }
  }
  // Large desktop
  switch(type) {
    case 'filename': return 40;
    case 'description': return 45;
    case 'type': return 20;
    default: return 40;
  }
};

// ============================================
// Progress Constants and Utilities
// ============================================

export const PROGRESS_MESSAGES: Record<string, string> = {
  pending: 'Initializing backup process...',
  processing: 'Preparing backup data...',
  compressing: 'Compressing files...',
  finalizing: 'Finalizing backup...',
  completed: 'Backup completed successfully!',
  failed: 'Backup failed. Please try again.'
};

export const PROGRESS_ICONS: Record<string, LucideIcon> = {
  pending: Clock4,
  processing: RefreshCw,
  compressing: FileArchive,
  finalizing: ShieldCheck,
  completed: CheckCircle,
  failed: XCircle
};

export const PROGRESS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  processing: 'bg-blue-500',
  compressing: 'bg-purple-500',
  finalizing: 'bg-amber-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};

// ============================================
// Backup Type Utilities (Return Icon Components, not JSX)
// ============================================

export const getTypeIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'full': return DatabaseBackup;
    case 'database': return ServerCog;
    case 'files': return FileLock;
    default: return Save;
  }
};

// Return icon component type, not JSX
export const getFileIconComponent = (type: string): LucideIcon => {
  switch (type) {
    case 'database': return Database;
    case 'files': return FileText;
    case 'full': return Archive;
    default: return FileText;
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'full': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'database': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'files': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
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

export const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'full': return 'default';
    case 'database': return 'secondary';
    case 'files': return 'outline';
    default: return 'outline';
  }
};

// ============================================
// Protection Utilities
// ============================================

export const getProtectionIcon = (isProtected?: boolean): LucideIcon => {
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

export const getProtectionColor = (isProtected?: boolean): string => {
  return isProtected ? 'text-amber-500' : 'text-gray-400';
};

// ============================================
// Status Utilities
// ============================================

export const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed': return 'default';
    case 'processing': return 'secondary';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
};

export const getStatusIcon = (status: string): LucideIcon => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'failed': return XCircle;
    case 'processing': return RefreshCw;
    default: return Clock4;
  }
};

// ============================================
// Selection Statistics
// ============================================

export const calculateSelectionStats = (selectedBackups: BackupFile[]): SelectionStats => {
  if (!selectedBackups || selectedBackups.length === 0) {
    return {
      total: 0,
      totalSize: 0,
      formattedSize: '0 B',
      fullCount: 0,
      databaseCount: 0,
      filesCount: 0,
      protectedCount: 0,
      largestSize: 0,
      smallestSize: 0,
      oldestDate: null,
      newestDate: null,
      types: {}
    };
  }
  
  const totalSize = selectedBackups.reduce((sum, backup) => sum + (backup.size_bytes || 0), 0);
  const sizes = selectedBackups.map(b => b.size_bytes || 0).filter(s => s > 0);
  const dates = selectedBackups.map(b => {
    try {
      return new Date(b.modified || b.created_at || '').getTime();
    } catch {
      return 0;
    }
  }).filter(d => d > 0);
  
  // Count by type
  const types: Record<string, number> = {};
  selectedBackups.forEach(backup => {
    const type = backup.type || 'unknown';
    types[type] = (types[type] || 0) + 1;
  });

  return {
    total: selectedBackups.length,
    totalSize,
    formattedSize: formatBytes(totalSize),
    fullCount: selectedBackups.filter(b => b.type === 'full').length,
    databaseCount: selectedBackups.filter(b => b.type === 'database').length,
    filesCount: selectedBackups.filter(b => b.type === 'files').length,
    protectedCount: selectedBackups.filter(b => b.is_protected).length,
    largestSize: sizes.length > 0 ? Math.max(...sizes) : 0,
    smallestSize: sizes.length > 0 ? Math.min(...sizes) : 0,
    oldestDate: dates.length > 0 ? new Date(Math.min(...dates)) : null,
    newestDate: dates.length > 0 ? new Date(Math.max(...dates)) : null,
    types
  };
};

// ============================================
// Filter Utilities
// ============================================

export interface FilterOptions {
  search: string;
  type: string;
  size: string;
  fromDate: string;
  toDate: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const filterBackups = (
  backups: BackupFile[],
  filters: FilterOptions
): BackupFile[] => {
  if (!backups || backups.length === 0) return [];
  
  let result = [...backups];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(backup => 
      (backup.filename && backup.filename.toLowerCase().includes(searchLower)) ||
      (backup.description && backup.description.toLowerCase().includes(searchLower)) ||
      (backup.name && backup.name.toLowerCase().includes(searchLower))
    );
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    result = result.filter(backup => backup.type === filters.type);
  }

  // Size filter
  if (filters.size && filters.size !== 'all') {
    const sizeRanges: Record<string, { min: number; max: number }> = {
      'small': { min: 0, max: 10 * 1024 * 1024 },
      'medium': { min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
      'large': { min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024 },
      'xlarge': { min: 1024 * 1024 * 1024, max: Infinity },
    };
    
    if (sizeRanges[filters.size]) {
      const { min, max } = sizeRanges[filters.size];
      result = result.filter(backup => 
        backup.size_bytes !== undefined && 
        backup.size_bytes >= min && 
        backup.size_bytes < max
      );
    }
  }

  // Date range filter
  if (filters.fromDate) {
    const fromDate = new Date(filters.fromDate).getTime();
    result = result.filter(backup => {
      try {
        const backupDate = new Date(backup.modified || backup.created_at || '').getTime();
        return !isNaN(backupDate) && backupDate >= fromDate;
      } catch {
        return true;
      }
    });
  }

  if (filters.toDate) {
    const toDate = new Date(filters.toDate).getTime();
    result = result.filter(backup => {
      try {
        const backupDate = new Date(backup.modified || backup.created_at || '').getTime();
        return !isNaN(backupDate) && backupDate <= toDate;
      } catch {
        return true;
      }
    });
  }

  // Sorting
  if (filters.sortBy) {
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'filename':
        case 'name':
          aValue = (a.filename || a.name || '').toLowerCase();
          bValue = (b.filename || b.name || '').toLowerCase();
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'size':
        case 'size_bytes':
          aValue = a.size_bytes || 0;
          bValue = b.size_bytes || 0;
          break;
        case 'modified':
        case 'created_at':
          aValue = new Date(a.modified || a.created_at || 0).getTime();
          bValue = new Date(b.modified || b.created_at || 0).getTime();
          break;
        default:
          aValue = new Date(a.modified || a.created_at || 0).getTime();
          bValue = new Date(b.modified || b.created_at || 0).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  return result;
};

export const hasActiveFilters = (filters: FilterOptions): boolean => {
  return !!(
    filters.search ||
    (filters.type && filters.type !== 'all') ||
    (filters.size && filters.size !== 'all') ||
    filters.fromDate ||
    filters.toDate ||
    (filters.sortBy && filters.sortBy !== 'modified')
  );
};

// ============================================
// Export Utilities
// ============================================

export const formatForExport = (backups: BackupFile[]): string => {
  if (!backups || backups.length === 0) return '';
  
  const headers = ['Filename', 'Type', 'Size', 'Modified', 'Protected', 'Description'];
  const rows = backups.map(backup => [
    backup.filename || backup.name || 'N/A',
    backup.type || 'unknown',
    formatBytes(backup.size_bytes || 0),
    formatDate(backup.modified || backup.created_at || '', true),
    backup.is_protected ? 'Yes' : 'No',
    backup.description || ''
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

// ============================================
// Simulation Utilities
// ============================================

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
    } else {
      clearInterval(interval);
      setProgress({
        percentage: 100,
        status: 'completed',
        message: PROGRESS_MESSAGES.completed
      });
      onComplete();
    }
  }, 500);

  return interval;
};

// ============================================
// Sort Utilities
// ============================================

export const getSortIcon = (sortOrder: 'asc' | 'desc'): string => {
  return sortOrder === 'asc' ? '↑' : '↓';
};

export const handleSort = (
  column: string,
  currentSortBy: string,
  currentSortOrder: 'asc' | 'desc',
  onSortChange: (column: string) => void,
  onSortOrderChange?: (order: 'asc' | 'desc') => void
) => {
  if (currentSortBy === column) {
    const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    if (onSortOrderChange) {
      onSortOrderChange(newOrder);
    } else {
      onSortChange(newOrder);
    }
  } else {
    onSortChange(column);
  }
};

// ============================================
// Default Export
// ============================================

const backupUtils = {
  formatBytes,
  formatDate,
  formatTimeAgo,
  truncateText,
  getTruncationLength,
  getTypeIcon,
  getFileIconComponent,
  getTypeColor,
  getTypeLabel,
  getTypeBadgeVariant,
  getProtectionIcon,
  getProtectionBadge,
  getProtectionColor,
  getStatusBadgeVariant,
  getStatusIcon,
  calculateSelectionStats,
  filterBackups,
  hasActiveFilters,
  formatForExport,
  simulateBackupProgress,
  getSortIcon,
  handleSort,
  PROGRESS_MESSAGES,
  PROGRESS_ICONS,
  PROGRESS_COLORS
};

export default backupUtils;