<?php

namespace App\Traits;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait HasNotificationPreferences
{
    public function getNotificationPreferences(): array
    {
        $defaults = [
            'clearance' => true,
            'fees' => true,
            'household' => true,
            'announcements' => true,
            'reports' => true,
            'email' => true,
            'sms' => false,
            'quiet_hours' => false,
        ];
        
        // Direct DB query to avoid any Eloquent issues
        $prefNotification = DB::table('notifications')
            ->where('notifiable_id', $this->id)
            ->where('notifiable_type', get_class($this))
            ->where('type', 'user_notification_preferences')
            ->latest()
            ->first();
        
        if ($prefNotification && $prefNotification->data) {
            $data = json_decode($prefNotification->data, true);
            Log::info('Found existing preferences:', $data ?? []);
            return array_merge($defaults, $data ?? []);
        }
        
        Log::info('No preferences found, using defaults');
        return $defaults;
    }
    
    public function setNotificationPreferences(array $preferences): void
    {
        Log::info('Saving preferences for user: ' . $this->id, $preferences);
        
        // Delete old preference notification using DB
        DB::table('notifications')
            ->where('notifiable_id', $this->id)
            ->where('notifiable_type', get_class($this))
            ->where('type', 'user_notification_preferences')
            ->delete();
        
        // Generate UUID
        $uuid = (string) Str::uuid();
        
        // Insert with EXPLICIT UUID
        DB::table('notifications')->insert([
            'id' => $uuid,
            'type' => 'user_notification_preferences',
            'notifiable_id' => $this->id,
            'notifiable_type' => get_class($this),
            'data' => json_encode($preferences),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        Log::info('Created preference notification with ID: ' . $uuid);
    }
}