<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserLoginLog;
use Carbon\Carbon;

class CleanupLoginLogs extends Command
{
    protected $signature = 'login-logs:cleanup {--days=90 : Delete logs older than this many days}';
    protected $description = 'Clean up old user login logs';

    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $count = UserLoginLog::where('login_at', '<', $cutoffDate)->delete();
        
        $this->info("Deleted {$count} login logs older than {$days} days.");
        
        return Command::SUCCESS;
    }
}