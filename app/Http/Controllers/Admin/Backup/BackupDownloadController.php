<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupDownloadController extends BaseBackupController
{
    public function download($filename)
    {
        Log::info('BackupDownloadController@download - User downloading backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        $filePath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($filePath)) {
            Log::error('BackupDownloadController@download - Backup file not found', [
                'filename' => $filename,
                'file_path' => $filePath,
            ]);
            abort(404, 'Backup file not found');
        }
        
        if (!$this->isValidZipFile($filePath)) {
            Log::error('BackupDownloadController@download - Invalid ZIP file', [
                'filename' => $filename,
                'file_size' => File::size($filePath),
            ]);
            abort(400, 'Invalid backup file. The file may be corrupted.');
        }
        
        activity()
            ->causedBy(auth()->user())
            ->withProperties(['filename' => $filename])
            ->log('Downloaded backup');
        
        $fileSize = File::size($filePath);
        Log::info('BackupDownloadController@download - Backup download started', [
            'filename' => $filename,
            'file_size' => $fileSize,
            'file_size_human' => $this->formatBytes($fileSize),
        ]);
        
        $headers = [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => $fileSize,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];
        
        return response()->download($filePath, $filename, $headers);
    }
}