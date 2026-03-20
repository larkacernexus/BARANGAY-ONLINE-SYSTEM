import { StatCard } from '@/components/adminui/stats-grid';
import { Progress } from '@/components/ui/progress';
import { 
  DatabaseBackup, 
  HardDriveIcon, 
  Clock, 
  ShieldCheck,
  Lock 
} from 'lucide-react';
import { formatDate, formatBytes, getDiskHealthColor } from '@/admin-utils/formatters';
import { DiskSpaceInfo, Stats } from '@/types/backup';

interface BackupStatsProps {
  diskSpace: DiskSpaceInfo;
  lastBackup: string | null;
  stats: Stats;
}

export default function BackupStats({ diskSpace, lastBackup, stats }: BackupStatsProps) {
  // Safe stats with fallbacks
  const safeStats = {
    total: stats?.total || 0,
    full: stats?.full || 0,
    database: stats?.database || 0,
    files: stats?.files || 0,
    total_size_bytes: stats?.total_size_bytes || 0,
    recent: stats?.recent || 0,
    protected: stats?.protected || 0
  };

  const safeDiskSpace = {
    used_percentage: diskSpace?.used_percentage || 0,
    used: diskSpace?.used || '0 B',
    total: diskSpace?.total || '0 B',
    free: diskSpace?.free || '0 B'
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Backups"
        value={safeStats.total.toLocaleString()}
        icon={<DatabaseBackup className="h-4 w-4 text-blue-500" />}
        description={`${safeStats.full} full • ${safeStats.database} DB • ${safeStats.files} files`}
        footer={`Total size: ${formatBytes(safeStats.total_size_bytes)}`}
      />
      
      <StatCard
        title="Storage Usage"
        value={`${safeDiskSpace.used_percentage}%`}
        valueClassName={getDiskHealthColor(safeDiskSpace.used_percentage)}
        icon={<HardDriveIcon className="h-4 w-4 text-green-500" />}
        description={`${safeDiskSpace.used} of ${safeDiskSpace.total} used`}
        progress={safeDiskSpace.used_percentage}
        footer={`${safeDiskSpace.free} free`}
      />
      
      <StatCard
        title="Last Backup"
        value={lastBackup ? formatDate(lastBackup) : 'Never'}
        icon={<Clock className="h-4 w-4 text-purple-500" />}
        description={lastBackup ? 'Most recent backup' : 'No backups created yet'}
        footer={lastBackup ? `${safeStats.recent} recent backup${safeStats.recent !== 1 ? 's' : ''}` : undefined}
        footerClassName="text-green-600 dark:text-green-400"
      />
      
      <StatCard
        title="Data Protection"
        value={safeStats.protected > 0 ? 'Protected' : 'Unprotected'}
        valueClassName={safeStats.protected > 0 ? 'text-green-600' : 'text-amber-600'}
        icon={<ShieldCheck className="h-4 w-4 text-amber-500" />}
        description={`${safeStats.protected} protected backup${safeStats.protected !== 1 ? 's' : ''}`}
        footer={safeStats.protected > 0 ? (
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Safe from accidental deletion
          </div>
        ) : undefined}
        footerClassName="text-green-600 dark:text-green-400"
      />
    </div>
  );
}