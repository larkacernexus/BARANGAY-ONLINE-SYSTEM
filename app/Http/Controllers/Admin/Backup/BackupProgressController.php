<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BackupProgressController extends BaseBackupController
{
    public function progress(Request $request)
    {
        $backupDir = $this->getBackupPath();
        $files = File::files($backupDir);
        
        usort($files, fn($a, $b) => $b->getMTime() - $a->getMTime());
        
        $latestBackup = count($files) > 0 ? $files[0] : null;
        
        if ($latestBackup && (time() - $latestBackup->getMTime()) < 60) {
            return response()->json([
                'status' => 'processing',
                'progress' => 50,
                'message' => 'Backup in progress...',
            ]);
        }
        
        return response()->json([
            'status' => 'idle',
            'progress' => 0,
            'message' => 'No backup in progress',
        ]);
    }
}