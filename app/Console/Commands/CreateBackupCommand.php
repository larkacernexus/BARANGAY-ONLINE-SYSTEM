<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\BackupController;

class CreateBackupCommand extends Command
{
    protected $signature = 'backup:create 
                            {type=full : Backup type}
                            {--compress : Compress backup}
                            {--name= : Custom backup name}
                            {--tables=* : Tables to backup (comma separated)}';
    
    protected $description = 'Create a system backup';
    
    public function handle()
    {
        $type = $this->argument('type');
        $compress = $this->option('compress');
        $name = $this->option('name');
        $tables = $this->option('tables');
        
        $this->info("Creating {$type} backup...");
        
        try {
            $controller = new BackupController();
            
            // Convert reflection method to call private methods
            $method = match($type) {
                'full' => 'createFullBackup',
                'database' => fn() => $controller->createDatabaseBackup([], $compress, 'database', $name),
                'files' => fn() => $controller->backupUploadedFilesOnly($compress, $name),
                'residents' => fn() => $controller->createResidentsBackup($compress, $name),
                'officials' => fn() => $controller->createOfficialsBackup($compress, $name),
                'financial' => fn() => $controller->createFinancialBackup($compress, $name),
                'documents' => fn() => $controller->createDocumentsBackup($compress, $name),
                default => fn() => $controller->createCustomBackup($tables, true, $compress, $name),
            };
            
            $backupFile = $method();
            
            $this->info("✓ Backup created successfully: {$backupFile}");
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error("✗ Backup failed: " . $e->getMessage());
            Log::error('Backup command failed: ' . $e->getMessage());
            return 1;
        }
    }
}