<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupDestroyController extends BaseBackupController
{
    public function destroy($filename)
    {
        Log::info('BackupDestroyController@destroy - User deleting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        $filePath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($filePath)) {
            Log->error('BackupDestroyController@destroy - Backup file not found', [
                'filename' => $filename,
                'file_path' => $filePath,
            ]);
            abort(404, 'Backup file not found');
        }
        
        $fileSize = File::size($filePath);
        File::delete($filePath);
        
        activity()
            ->causedBy(auth()->user())
            ->withProperties(['filename' => $filename])
            ->log('Deleted backup');

        Log::info('BackupDestroyController@destroy - Backup deleted successfully', [
            'filename' => $filename,
            'file_size' => $fileSize,
            'file_size_human' => $this->formatBytes($fileSize),
        ]);

        return redirect()->route('backup.index')
            ->with('success', 'Backup deleted successfully');
    }
}