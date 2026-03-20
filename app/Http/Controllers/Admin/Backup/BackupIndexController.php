<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BackupIndexController extends BaseBackupController
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $this->cleanupFailedBackups();

        Log::info('BackupIndexController@index - User accessed backup page', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filters' => $request->only(['search', 'type', 'from_date', 'to_date', 'size']),
        ]);
        
        try {
            $backups = $this->getBackupFiles();
            $filters = $request->only(['search', 'type', 'from_date', 'to_date', 'size']);
            $diskSpace = $this->getDiskSpaceInfo();
            
            Log::info('BackupIndexController@index - Successfully retrieved backup data', [
                'backup_count' => count($backups),
                'disk_space_used_percentage' => $diskSpace['used_percentage'] ?? 0,
            ]);
            
            return Inertia::render('admin/Backup/Index', [
                'backups' => [
                    'current_page' => 1,
                    'data' => $backups,
                    'from' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'to' => count($backups),
                    'total' => count($backups),
                ],
                'diskSpace' => $diskSpace,
                'lastBackup' => $this->getLastBackupDate(),
                'stats' => $this->getBackupStats($backups),
                'filters' => $filters,
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('BackupIndexController@index - Failed to load backup page', [
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
            ]);
            
            return $this->errorResponse($e->getMessage());
        }
    }

    private function errorResponse($errorMessage = 'Unknown error')
    {
        return Inertia::render('admin/Backup/Index', [
            'backups' => [
                'current_page' => 1,
                'data' => [],
                'from' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'to' => 0,
                'total' => 0,
            ],
            'diskSpace' => [
                'total' => '0 GB',
                'free' => '0 GB',
                'used' => '0 GB',
                'used_percentage' => 0,
                'total_bytes' => 0,
                'free_bytes' => 0,
                'used_bytes' => 0,
            ],
            'lastBackup' => null,
            'stats' => [
                'total' => 0, 'full' => 0, 'database' => 0, 'files' => 0,
                'recent' => 0, 'protected' => 0, 'total_size_bytes' => 0,
            ],
            'filters' => [],
            'flash' => ['error' => 'Failed to load backup page: ' . $errorMessage],
        ]);
    }
}