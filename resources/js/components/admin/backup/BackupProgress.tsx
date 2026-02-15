import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Clock } from 'lucide-react';
import { BackupProgress } from '@/types/backup';
import { PROGRESS_ICONS, PROGRESS_COLORS, PROGRESS_MESSAGES } from '@/utils/backupUtils';

interface BackupProgressProps {
  progress: BackupProgress;
  onClose: () => void;
}

export default function BackupProgressComponent({ progress, onClose }: BackupProgressProps) {
  const ProgressIcon = PROGRESS_ICONS[progress.status];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="w-80 shadow-lg border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-full ${PROGRESS_COLORS[progress.status]}/10`}>
                <div className={`p-1 rounded-full ${PROGRESS_COLORS[progress.status]}`}>
                  <ProgressIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Backup in Progress</h4>
                  <span className="text-xs font-bold">{progress.percentage.toFixed(0)}%</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {progress.message}
                </p>
                <Progress value={progress.percentage} className="h-1.5 mt-2" />
                
                {progress.currentStep && (
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <span className="text-gray-500">Step:</span>
                    <span className="font-medium">{progress.currentStep}</span>
                  </div>
                )}
                
                {progress.estimatedTimeRemaining && (
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className="text-gray-500">{progress.estimatedTimeRemaining}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
              disabled={progress.status === 'processing' || progress.status === 'compressing'}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}