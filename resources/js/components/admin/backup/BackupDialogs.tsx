import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Loader2,
  X,
  RotateCcw,
  CheckCircle,
  Clock,
  DatabaseBackup,
  ServerCog,
  FileLock,
  ShieldCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { BackupProgress, SelectionStats } from '@/types/admin/backup/backup';
import { PROGRESS_ICONS, PROGRESS_COLORS, PROGRESS_MESSAGES } from '@/admin-utils/backupUtils';

interface BackupDialogsProps {
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
  showBulkDeleteDialog: boolean;
  setShowBulkDeleteDialog: (show: boolean) => void;
  showBulkRestoreDialog: boolean;
  setShowBulkRestoreDialog: (show: boolean) => void;
  backupType: 'full' | 'database' | 'files';
  setBackupType: (type: 'full' | 'database' | 'files') => void;
  backupDescription: string;
  setBackupDescription: (description: string) => void;
  backupProgress: BackupProgress | null;
  creatingBackup: boolean;
  selectedBackupsCount: number;
  selectionStats: SelectionStats;
  onCreateBackup: () => void;
  onBulkDelete: () => void;
  onBulkRestore: () => void;
  isPerformingBulkAction: boolean;
  setBackupProgress?: (progress: BackupProgress | null) => void; // Added this prop
}

export default function BackupDialogs({
  showCreateDialog,
  setShowCreateDialog,
  showBulkDeleteDialog,
  setShowBulkDeleteDialog,
  showBulkRestoreDialog,
  setShowBulkRestoreDialog,
  backupType,
  setBackupType,
  backupDescription,
  setBackupDescription,
  backupProgress,
  creatingBackup,
  selectedBackupsCount,
  selectionStats,
  onCreateBackup,
  onBulkDelete,
  onBulkRestore,
  isPerformingBulkAction,
  setBackupProgress
}: BackupDialogsProps) {
  const ProgressIcon = backupProgress ? PROGRESS_ICONS[backupProgress.status] : null;

  return (
    <>
      {/* Create Backup Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={(open) => {
        if (!open && creatingBackup) {
          if (confirm('Backup is in progress. Are you sure you want to cancel?')) {
            setShowCreateDialog(false);
          }
        } else {
          setShowCreateDialog(open);
        }
      }}>
        <AlertDialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">
              {backupProgress ? 'Backup in Progress' : 'Create New Backup'}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              {backupProgress ? backupProgress.message : 'Create a backup of your system data. This will be downloaded as a ZIP file.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {backupProgress ? (
            <div className="space-y-4 py-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium dark:text-gray-300">Progress</span>
                  <span className="font-bold dark:text-gray-200">{backupProgress.percentage.toFixed(0)}%</span>
                </div>
                <Progress value={backupProgress.percentage} className="h-2 dark:bg-gray-700" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className={`p-3 rounded-lg flex items-start gap-3 ${
                backupProgress.status === 'failed' 
                  ? 'bg-red-50 dark:bg-red-900/20' 
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className={`p-1 rounded-full ${
                  backupProgress.status === 'failed' 
                    ? 'bg-red-100 dark:bg-red-800/30' 
                    : 'bg-blue-100 dark:bg-blue-800/30'
                }`}>
                  {ProgressIcon && <ProgressIcon className={`h-5 w-5 ${
                    backupProgress.status === 'failed' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className={`font-medium ${
                      backupProgress.status === 'failed' 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {backupProgress.currentStep || backupProgress.status.charAt(0).toUpperCase() + backupProgress.status.slice(1)}
                    </span>
                    <Badge variant="outline" className={`
                      ${backupProgress.status === 'pending' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' : ''}
                      ${backupProgress.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      ${backupProgress.status === 'compressing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                      ${backupProgress.status === 'finalizing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${backupProgress.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${backupProgress.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                    `}>
                      {backupProgress.status}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {backupProgress.message}
                  </p>
                  {backupProgress.estimatedTimeRemaining && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {backupProgress.estimatedTimeRemaining}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed Steps */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium dark:text-gray-300">Backup Steps</h4>
                <div className="space-y-2">
                  {[
                    { step: 'Database Export', completed: backupProgress.percentage >= 20 },
                    { step: 'File Collection', completed: backupProgress.percentage >= 40 },
                    { step: 'Data Compression', completed: backupProgress.percentage >= 60 },
                    { step: 'Integrity Check', completed: backupProgress.percentage >= 80 },
                    { step: 'Final Packaging', completed: backupProgress.percentage >= 100 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center
                        ${item.completed 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }
                      `}>
                        {item.completed ? <CheckCircle className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                      </div>
                      <span className={`text-sm ${
                        item.completed 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-gray-700">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                  <div className="font-medium capitalize dark:text-gray-300">{backupType}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Started</div>
                  <div className="font-medium dark:text-gray-300">{format(new Date(), 'HH:mm:ss')}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="backup-type" className="dark:text-gray-300">Backup Type</Label>
                <Select 
                  value={backupType} 
                  onValueChange={(value: string) => setBackupType(value as any)}
                >
                  <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Select backup type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectItem value="full" className="dark:text-gray-300 dark:focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <DatabaseBackup className="h-4 w-4 dark:text-gray-400" />
                        <span>Full System Backup</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="database" className="dark:text-gray-300 dark:focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <ServerCog className="h-4 w-4 dark:text-gray-400" />
                        <span>Database Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="files" className="dark:text-gray-300 dark:focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <FileLock className="h-4 w-4 dark:text-gray-400" />
                        <span>Files Only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="E.g.: 'Pre-update backup' or 'Weekly backup'"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  rows={2}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:placeholder-gray-500"
                />
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium">What's included:</p>
                    {backupType === 'full' && (
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Complete database dump (SQL + JSON)</li>
                        <li>All uploaded files and documents</li>
                        <li>System configuration files</li>
                        <li>Backup manifest with system info</li>
                      </ul>
                    )}
                    {backupType === 'database' && (
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Complete database dump (SQL + JSON)</li>
                        <li>All residents, households, users data</li>
                        <li>Database structure and records</li>
                      </ul>
                    )}
                    {backupType === 'files' && (
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>All uploaded files and documents</li>
                        <li>Citizen photos and attachments</li>
                        <li>Generated reports and forms</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="dark:border-gray-700">
            {backupProgress ? (
              backupProgress.status === 'completed' ? (
                <AlertDialogAction
                  onClick={() => {
                    setShowCreateDialog(false);
                    setBackupDescription('');
                    if (setBackupProgress) setBackupProgress(null);
                  }}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Done
                </AlertDialogAction>
              ) : backupProgress.status === 'failed' ? (
                <>
                  <AlertDialogCancel
                    onClick={() => {
                      setShowCreateDialog(false);
                      if (setBackupProgress) setBackupProgress(null);
                    }}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Close
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCreateBackup}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retry
                  </AlertDialogAction>
                </>
              ) : (
                <AlertDialogCancel 
                  disabled={creatingBackup}
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel the backup?')) {
                      setShowCreateDialog(false);
                      if (setBackupProgress) setBackupProgress(null);
                    }
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel Backup
                </AlertDialogCancel>
              )
            ) : (
              <>
                <AlertDialogCancel 
                  disabled={creatingBackup}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCreateBackup}
                  disabled={creatingBackup}
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  {creatingBackup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Backup
                    </>
                  )}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Delete Selected Backups</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Are you sure you want to delete {selectedBackupsCount} selected backup{selectedBackupsCount !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectionStats.protectedCount > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Warning: {selectionStats.protectedCount} selected backup(s) are protected
                and will require confirmation to delete.
              </p>
            </div>
          )}
          <AlertDialogFooter className="dark:border-gray-700">
            <AlertDialogCancel 
              disabled={isPerformingBulkAction}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              disabled={isPerformingBulkAction}
            >
              {isPerformingBulkAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Selected'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Confirmation Dialog */}
      <AlertDialog open={showBulkRestoreDialog} onOpenChange={setShowBulkRestoreDialog}>
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Restore Selected Backups</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Are you sure you want to restore {selectedBackupsCount} selected backup{selectedBackupsCount !== 1 ? 's' : ''}?
              This will overwrite current data and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Critical: This action will overwrite existing system data.
              Make sure you have a current backup before proceeding.
            </p>
          </div>
          <AlertDialogFooter className="dark:border-gray-700">
            <AlertDialogCancel 
              disabled={isPerformingBulkAction}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkRestore}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              disabled={isPerformingBulkAction}
            >
              {isPerformingBulkAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Restore Selected'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}