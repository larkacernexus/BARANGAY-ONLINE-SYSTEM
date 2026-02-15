<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Backup;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CleanupBackupsCommand extends Command
{
    protected $signature = 'backup:cleanup';
    protected $description = 'Clean up expired backups';
    
    public function handle()
    {
        $expiredBackups = Backup::expired()->get();
        $deletedCount = 0;
        $errorCount = 0;
        
        $this->info("Found {$expiredBackups->count()} expired backups");
        
        foreach ($expiredBackups as $backup) {
            try {
                // Delete file
                if (Storage::disk('backups')->exists($backup->filename)) {
                    Storage::disk('backups')->delete($backup->filename);
                }
                
                // Delete record
                $backup->delete();
                $deletedCount++;
                
                $this->line("Deleted: {$backup->filename}");
                
            } catch (\Exception $e) {
                Log::error("Failed to delete backup {$backup->id}: " . $e->getMessage());
                $errorCount++;
                $this->error("Failed: {$backup->filename}");
            }
        }
        
        // Also cleanup old files not in database
        $this->cleanupOrphanedFiles();
        
        $this->info("\nCleanup completed:");
        $this->info("✓ Deleted: {$deletedCount} backups");
        $this->info("✗ Errors: {$errorCount}");
        
        return 0;
    }
    
    private function cleanupOrphanedFiles()
    {
        $files = Storage::disk('backups')->files();
        $backupFilenames = Backup::pluck('filename')->toArray();
        
        foreach ($files as $file) {
            if (!in_array($file, $backupFilenames)) {
                $fileAge = time() - Storage::disk('backups')->lastModified($file);
                
                // Delete files older than 7 days not in database
                if ($fileAge > 604800) { // 7 days in seconds
                    Storage::disk('backups')->delete($file);
                    $this->line("Deleted orphaned file: {$file}");
                }
            }
        }
    }
}