import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, List, Save } from 'lucide-react';

interface BackupHeaderProps {
  isBulkMode: boolean;
  onToggleBulkMode: () => void;
  onCreateBackup: () => void;
}

export default function BackupHeader({
  isBulkMode,
  onToggleBulkMode,
  onCreateBackup
}: BackupHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Backup Management</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Manage system backups and protect your barangay data
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleBulkMode}
              className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : ''}`}
            >
              {isBulkMode ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Bulk Mode
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Bulk Select
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
            <p className="text-xs text-gray-500">Select multiple backups for batch operations</p>
          </TooltipContent>
        </Tooltip>
        <Button 
          onClick={onCreateBackup}
          className="h-9"
        >
          <Save className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create Backup</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </div>
  );
}