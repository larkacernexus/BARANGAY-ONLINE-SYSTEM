<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Artisan command examples
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the login logs cleanup command
Schedule::command('login-logs:cleanup')->daily();

// You can also schedule it at a specific time
// Schedule::command('login-logs:cleanup')->dailyAt('03:00');

// Other scheduling examples:
// Schedule::command('backup:run')->dailyAt('02:00');
// Schedule::command('queue:work --stop-when-empty')->everyMinute();
// Schedule::job(new SomeJob)->daily();