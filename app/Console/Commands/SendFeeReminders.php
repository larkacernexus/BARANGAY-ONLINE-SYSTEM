<?php
// app/Console/Commands/SendFeeReminders.php

namespace App\Console\Commands;

use App\Models\Fee;
use App\Models\User;
use App\Notifications\FeeDueReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendFeeReminders extends Command
{
    protected $signature = 'fees:send-reminders 
                            {--days=3 : Number of days before due date to send reminders}
                            {--dry-run : Run the command without actually sending notifications}';

    protected $description = 'Send reminders for fees that are due soon';

    public function handle()
    {
        $daysBeforeDue = $this->option('days');
        $dryRun = $this->option('dry-run');
        
        $this->info("Checking for fees due within {$daysBeforeDue} days...");
        
        $dueDate = now()->addDays($daysBeforeDue);
        $today = now()->startOfDay();
        
        $fees = Fee::with('user')
            ->whereDate('due_date', '<=', $dueDate)
            ->whereDate('due_date', '>=', $today)
            ->where('status', '!=', 'paid')
            ->get();
        
        $this->info("Found {$fees->count()} fees due soon.");
        
        if ($dryRun) {
            $this->warn("DRY RUN: No notifications will be sent.");
            $this->table(
                ['ID', 'Fee Name', 'User', 'Due Date', 'Days Left'],
                $fees->map(function ($fee) {
                    $daysLeft = now()->diffInDays($fee->due_date, false);
                    return [
                        $fee->id,
                        $fee->name,
                        $fee->user?->name ?? 'No user',
                        $fee->due_date->format('Y-m-d'),
                        $daysLeft
                    ];
                })
            );
            return 0;
        }
        
        $bar = $this->output->createProgressBar($fees->count());
        $bar->start();
        
        $sentCount = 0;
        $errorCount = 0;
        
        foreach ($fees as $fee) {
            try {
                if ($fee->user) {
                    $daysUntilDue = now()->diffInDays($fee->due_date, false);
                    $fee->user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));
                    $sentCount++;
                    
                    Log::info('Fee reminder sent', [
                        'fee_id' => $fee->id,
                        'user_id' => $fee->user->id,
                        'due_date' => $fee->due_date,
                        'days_until_due' => $daysUntilDue
                    ]);
                }
            } catch (\Exception $e) {
                $errorCount++;
                Log::error('Failed to send fee reminder', [
                    'fee_id' => $fee->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        $this->info("Reminders sent: {$sentCount}");
        
        if ($errorCount > 0) {
            $this->error("Failed to send: {$errorCount}");
        }
        
        return 0;
    }
}