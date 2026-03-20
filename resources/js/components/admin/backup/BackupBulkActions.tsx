import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PackageCheck,
  PackageX,
  ClipboardCopy,
  DownloadCloud,
  History,
  Lock,
  Unlock,
  MoreVertical,
  X,
  Loader2,
  AlertTriangle,
  DatabaseBackup,
  HardDriveIcon,
  ShieldCheck,
  ServerCog,
  FileLock,
  Download,
  Printer,
  Trash2
} from 'lucide-react';
import type { SelectionMode, SelectionStats } from '@/types/backup';
import { formatBytes } from '@/admin-utils/formatters';

interface BackupBulkActionsProps {
  selectedBackups: string[];
  selectionMode: SelectionMode;
  selectionStats: SelectionStats;
  isPerformingBulkAction: boolean;
  isSelectAll: boolean;
  isMobile: boolean;
  totalItems: number;
  onClearSelection: () => void;
  onSelectAllOnPage: () => void;
  onSelectAllFiltered: () => void;
  onSelectAll: () => void;
  onBulkOperation: (operation: string) => void;
  onCopySelectedData: () => void;
  setShowBulkDeleteDialog: (show: boolean) => void;
}

export default function BackupBulkActions({
  selectedBackups,
  selectionMode,
  selectionStats,
  isPerformingBulkAction,
  isSelectAll,
  isMobile,
  totalItems,
  onClearSelection,
  onSelectAllOnPage,
  onSelectAllFiltered,
  onSelectAll,
  onBulkOperation,
  onCopySelectedData,
  setShowBulkDeleteDialog
}: BackupBulkActionsProps) {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const bulkActionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (bulkActionRef.current && !bulkActionRef.current.contains(e.target as Node)) {
      setShowBulkActions(false);
    }
  };

  // Add event listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bulkActions = [
    {
      label: 'Export as CSV',
      icon: <Download className="h-3.5 w-3.5 mr-2" />,
      onClick: () => onBulkOperation('export'),
      variant: 'ghost' as const
    },
    {
      label: 'Print',
      icon: <Printer className="h-3.5 w-3.5 mr-2" />,
      onClick: () => onBulkOperation('print'),
      variant: 'ghost' as const
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-3.5 w-3.5 mr-2" />,
      onClick: () => setShowBulkDeleteDialog(true),
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border dark:border-gray-700">
            <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-sm">
              {selectedBackups.length} selected
            </span>
            <Badge variant="outline" className="ml-1 h-5 text-xs dark:border-gray-600">
              {selectionMode === 'page' ? 'Page' : 
                selectionMode === 'filtered' ? 'Filtered' : 'All'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <PackageX className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopySelectedData}
                  className="h-7"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Copy selected data as CSV
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation('download')}
                  className="h-8 dark:border-gray-700"
                  disabled={isPerformingBulkAction}
                >
                  <DownloadCloud className="h-3.5 w-3.5 mr-1" />
                  Download All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Download selected backups
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation('restore')}
                  className="h-8 dark:border-gray-700"
                  disabled={isPerformingBulkAction}
                >
                  <History className="h-3.5 w-3.5 mr-1" />
                  Restore
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Restore selected backups
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation(selectionStats.protectedCount > 0 ? 'unprotect' : 'protect')}
                  className="h-8 dark:border-gray-700"
                  disabled={isPerformingBulkAction}
                >
                  {selectionStats.protectedCount > 0 ? (
                    <>
                      <Unlock className="h-3.5 w-3.5 mr-1" />
                      Unprotect
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      Protect
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectionStats.protectedCount > 0 ? 'Remove protection' : 'Add protection'}
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="relative">
            <Button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPerformingBulkAction}
            >
              {isPerformingBulkAction ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <MoreVertical className="h-3.5 w-3.5 mr-1" />
                  More
                </>
              )}
            </Button>
            
            {showBulkActions && (
              <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border rounded-md shadow-lg dark:border-gray-700">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                    BULK ACTIONS
                  </div>
                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant}
                      className={`w-full justify-start h-8 text-sm dark:hover:bg-gray-700 ${action.className || ''}`}
                      onClick={action.onClick}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            className="h-8 dark:border-gray-700"
            onClick={() => onBulkOperation('exit')}
            disabled={isPerformingBulkAction}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Exit
          </Button>
        </div>
      </div>
      
      {/* Enhanced stats of selected items */}
      {selectedBackups.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <DatabaseBackup className="h-3.5 w-3.5 text-blue-500" />
              <span>
                {selectionStats.total} backups
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HardDriveIcon className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Total: {selectionStats.formattedSize}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>
                {selectionStats.protectedCount} protected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span>
                Largest: {formatBytes(selectionStats.largestSize)}
              </span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <DatabaseBackup className="h-3 w-3 text-blue-500" />
              <span>{selectionStats.fullCount} full system</span>
            </div>
            <div className="flex items-center gap-1">
              <ServerCog className="h-3 w-3 text-green-500" />
              <span>{selectionStats.databaseCount} database</span>
            </div>
            <div className="flex items-center gap-1">
              <FileLock className="h-3 w-3 text-purple-500" />
              <span>{selectionStats.filesCount} files only</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}