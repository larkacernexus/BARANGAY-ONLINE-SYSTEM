// components/admin/backup/BackupHeader.tsx

import { Button } from '@/components/ui/button';
import { Target, List, Save } from 'lucide-react';

interface BackupHeaderProps {
    isBulkMode: boolean;
    onToggleBulkMode: () => void;
    onCreateBackup: () => void;
    totalBackups?: number;
}

export default function BackupHeader({
    isBulkMode,
    onToggleBulkMode,
    onCreateBackup,
    totalBackups
}: BackupHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Backup Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage system backups and protect your barangay data
                    {totalBackups !== undefined && (
                        <span className="ml-2 text-xs text-gray-400">
                            ({totalBackups} total)
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={onToggleBulkMode}
                    className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
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
                <Button onClick={onCreateBackup}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Backup
                </Button>
            </div>
        </div>
    );
}