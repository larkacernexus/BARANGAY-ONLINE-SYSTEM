<?php

namespace App\Console\Commands;

use App\Models\Fee;
use App\Notifications\FeePaymentReminderNotification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    protected $signature = 'notifications:send-payment-reminders 
                            {--days-before=3 : Days before due date to send reminder}
                            {--overdue-only : Send only overdue notifications}
                            {--due-today : Send only due today notifications}';
    
    protected $description = 'Send automated payment reminders for upcoming and overdue fees';

    public function handle()
    {
        $daysBefore = $this->option('days-before');
        $overdueOnly = $this->option('overdue-only');
        $dueTodayOnly = $this->option('due-today');
        
        $query = Fee::where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled')
            ->with('resident.user', 'feeType');
        
        if ($overdueOnly) {
            $query->where('due_date', '<', now());
            $this->info('Sending overdue notifications...');
        } elseif ($dueTodayOnly) {
            $query->whereDate('due_date', now()->toDateString());
            $this->info('Sending due today notifications...');
        } else {
            // Send reminders for fees due in X days
            $query->whereBetween('due_date', [now(), now()->addDays($daysBefore)]);
            $this->info("Sending reminders for fees due in {$daysBefore} days...");
        }
        
        $fees = $query->get();
        $bar = $this->output->createProgressBar($fees->count());
        $sentCount = 0;
        
        foreach ($fees as $fee) {
            try {
                if ($fee->due_date->isPast()) {
                    $type = 'overdue';
                } elseif ($fee->due_date->isToday()) {
                    $type = 'due_today';
                } else {
                    $type = 'reminder';
                }
                
                // Send to fee record
                $fee->notify(new FeePaymentReminderNotification($fee, $type));
                
                // Send to resident user if exists
                if ($fee->resident && $fee->resident->user) {
                    $fee->resident->user->notify(new FeePaymentReminderNotification($fee, $type));
                }
                
                $sentCount++;
                $bar->advance();
                
            } catch (\Exception $e) {
                $this->error("Error sending notification for Fee ID {$fee->id}: " . $e->getMessage());
            }
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Sent {$sentCount} notifications out of {$fees->count()} fees");
        
        return Command::SUCCESS;
    }
}