<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationPreferenceController extends Controller
{
    /**
     * Display notification preferences page
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            Log::info('========== NOTIFICATION PREFERENCES INDEX ==========');
            Log::info('User accessing preferences:', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'timestamp' => now()->toDateTimeString()
            ]);
            
            // Get preferences - now directly from user model (no notifications table)
            Log::info('Getting notification preferences for user: ' . $user->id);
            $preferences = $user->getNotificationPreferences();
            
            Log::info('Preferences retrieved:', ['preferences' => $preferences]);
            
            // Get notification stats - now ONLY real notifications
            $totalNotifications = $user->notifications()->count();
            $unreadNotifications = $user->unreadNotifications()->count();
            
            Log::info('Notification stats:', [
                'total_notifications' => $totalNotifications,
                'unread_notifications' => $unreadNotifications
            ]);
            
            // Get channel info
            $channels = [
                'email' => $user->email,
                'phone' => $user->resident?->contact_number ?? $user->contact_number,
            ];
            
            return Inertia::render('residentsettings/notification-preferences', [
                'preferences' => $preferences,
                'stats' => [
                    'total' => $totalNotifications,
                    'unread' => $unreadNotifications,
                ],
                'channels' => $channels,
            ]);
            
        } catch (\Exception $e) {
            Log::error('ERROR IN NOTIFICATION PREFERENCES INDEX:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            // Return default preferences on error
            return Inertia::render('residentsettings/notification-preferences', [
                'preferences' => [
                    'clearance' => true,
                    'fees' => true,
                    'household' => true,
                    'announcements' => true,
                    'reports' => true,
                    'email' => true,
                    'sms' => false,
                    'quiet_hours' => false,
                ],
                'stats' => [
                    'total' => 0,
                    'unread' => 0,
                ],
                'channels' => [
                    'email' => Auth::user()->email ?? '',
                    'phone' => null,
                ],
                'error' => 'Failed to load preferences. Using defaults.'
            ]);
        }
    }

    /**
     * Update notification preferences
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            
            Log::info('========== NOTIFICATION PREFERENCES UPDATE ==========');
            Log::info('User updating preferences:', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'timestamp' => now()->toDateTimeString()
            ]);
            
            // Validate the request
            $validated = $request->validate([
                'clearance' => 'sometimes|boolean',
                'fees' => 'sometimes|boolean',
                'household' => 'sometimes|boolean',
                'announcements' => 'sometimes|boolean',
                'reports' => 'sometimes|boolean',
                'email' => 'sometimes|boolean',
                'sms' => 'sometimes|boolean',
                'quiet_hours' => 'sometimes|boolean',
            ]);
            
            Log::info('Validated data:', $validated);
            
            // Merge with defaults for any missing keys
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
            
            $preferencesToSave = array_merge($defaults, $validated);
            
            Log::info('Saving preferences:', $preferencesToSave);
            
            // Save directly to user's JSON column
            $user->notification_preferences = $preferencesToSave;
            $user->save();
            
            Log::info('Preferences saved successfully to users table');
            
            return back()->with([
                'success' => 'Notification preferences saved successfully.',
                'preferences' => $preferencesToSave,
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors()]);
            
            return back()->withErrors($e->errors())->with([
                'error' => 'Please check your input and try again.'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error saving preferences:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            return back()->with([
                'error' => 'Failed to save preferences: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Reset to default preferences
     */
    public function reset()
    {
        try {
            $user = Auth::user();
            
            Log::info('========== NOTIFICATION PREFERENCES RESET ==========');
            Log::info('User resetting preferences:', ['user_id' => $user->id]);
            
            // Default preferences
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
            
            // Save defaults directly to user
            $user->notification_preferences = $defaults;
            $user->save();
            
            Log::info('Preferences reset to defaults');
            
            return back()->with([
                'success' => 'Preferences reset to defaults.',
                'preferences' => $defaults,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error resetting preferences:', [
                'message' => $e->getMessage()
            ]);
            
            return back()->with([
                'error' => 'Failed to reset preferences.'
            ]);
        }
    }
}