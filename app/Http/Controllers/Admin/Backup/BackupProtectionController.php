<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Support\Facades\Log;

class BackupProtectionController extends BaseBackupController
{
    public function toggleProtection($filename)
    {
        Log::info('BackupProtectionController@toggleProtection - User toggling backup protection', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        return redirect()->route('backup.index')
            ->with('success', 'Backup protection toggled successfully');
    }

    public function protect($filename)
    {
        Log::info('BackupProtectionController@protect - User protecting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        return redirect()->route('backup.index')
            ->with('success', 'Backup protected successfully');
    }

    public function unprotect($filename)
    {
        Log::info('BackupProtectionController@unprotect - User unprotecting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        return redirect()->route('backup.index')
            ->with('success', 'Backup unprotected successfully');
    }
}