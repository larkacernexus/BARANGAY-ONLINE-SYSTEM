import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <DatabaseBackup className="h-4 w-4" />
            Total Backups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {stats.full} full • {stats.database} DB • {stats.files} files
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Total size: {formatBytes(stats.total_size_bytes)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <HardDriveIcon className="h-4 w-4" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${getDiskHealthColor(diskSpace.used_percentage)}`}>
            {diskSpace.used_percentage}%
          </div>
          <Progress value={diskSpace.used_percentage} className="h-2 mt-2" />
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {diskSpace.used} of {diskSpace.total} used
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {diskSpace.free} free
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {lastBackup ? formatDate(lastBackup) : 'Never'}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {lastBackup ? 'Most recent backup' : 'No backups created yet'}
          </div>
          {lastBackup && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {stats.recent} recent backup{stats.recent !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${stats.protected > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
            {stats.protected > 0 ? 'Protected' : 'Unprotected'}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {stats.protected} protected backup{stats.protected !== 1 ? 's' : ''}
          </div>
          {stats.protected > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Safe from accidental deletion
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}