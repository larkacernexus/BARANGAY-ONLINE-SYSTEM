<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Backup;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\BackupAlert;

class BackupMonitorCommand extends Command
{
    protected $signature = 'backup:monitor';
    protected $description = 'Monitor backup health and send alerts';
    
    public function handle()
    {
        $this->info("Monitoring backup system...");
        
        $issues = [];
        
        // Check disk space
        $diskFree = disk_free_space(storage_path('app/backups'));
        $diskTotal = disk_total_space(storage_path('app/backups'));
        $diskPercent = ($diskTotal - $diskFree) / $diskTotal * 100;
        
        if ($diskPercent > 90) {
            $issues[] = "Disk space critically low: " . round($diskPercent, 2) . "% used";
        }
        
        // Check recent failed backups
        $recentFailures = Backup::where('status', 'failed')
            ->where('created_at', '>', now()->subDay())
            ->count();
            
        if ($recentFailures > 0) {
            $issues[] = "{$recentFailures} backup(s) failed in last 24 hours";
        }
        
        // Check backup frequency
        $lastBackup = Backup::completed()->latest()->first();
        if ($lastBackup && $lastBackup->created_at < now()->subDays(2)) {
            $issues[] = "No backup created in last 2 days";
        }
        
        // Send alert if issues found
        if (!empty($issues)) {
            $this->sendAlert($issues);
            $this->error("Issues found: " . implode(', ', $issues));
        } else {
            $this->info("✓ All systems normal");
        }
        
        return 0;
    }
    
    private function sendAlert(array $issues)
    {
        try {
            $adminEmail = config('backup.admin_email', config('mail.from.address'));
            
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new BackupAlert($issues));
                $this->info("Alert sent to {$adminEmail}");
            }
        } catch (\Exception $e) {
            Log::error('Failed to send backup alert: ' . $e->getMessage());
        }
    }
}