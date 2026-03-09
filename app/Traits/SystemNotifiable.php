<?php
// app/Traits/SystemNotifiable.php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait SystemNotifiable
{
    /**
     * Send a system-wide notification (single record for all officials)
     */
    public function sendSystemNotification($type, $data, $targetRoles = ['admin', 'captain', 'secretary'], $excludedRoles = ['kagawad'])
    {
        try {
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => $type,
                'notifiable_type' => 'SYSTEM',
                'notifiable_id' => 0,
                'data' => json_encode(array_merge($data, [
                    'target_roles' => $targetRoles,
                    'excluded_roles' => $excludedRoles,
                    'system_wide' => true,
                    'created_at' => now()->toDateTimeString(),
                ])),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('System notification sent', ['type' => $type]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send system notification', [
                'type' => $type,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Send notification to specific user
     */
    public function sendUserNotification($userId, $type, $data)
    {
        try {
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => $type,
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $userId,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('User notification sent', ['user_id' => $userId, 'type' => $type]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send user notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send notification to household members
     */
    public function sendHouseholdNotification($householdId, $type, $data, $excludeUserId = null)
    {
        try {
            // Get all users in this household
            $users = DB::table('users')
                ->where('household_id', $householdId)
                ->when($excludeUserId, function($query, $excludeUserId) {
                    return $query->where('id', '!=', $excludeUserId);
                })
                ->get();

            $notifications = [];
            $now = now();

            foreach ($users as $user) {
                $notifications[] = [
                    'id' => (string) Str::uuid(),
                    'type' => $type,
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode($data),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($notifications)) {
                DB::table('notifications')->insert($notifications);
            }

            Log::info('Household notifications sent', [
                'household_id' => $householdId,
                'count' => count($notifications)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send household notifications', [
                'household_id' => $householdId,
                'error' => $e->getMessage()
            ]);
        }
    }
}