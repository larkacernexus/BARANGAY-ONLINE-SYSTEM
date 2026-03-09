<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Display the notifications page
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return redirect()->route('login');
            }
            
            $notifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->paginate(20)
                ->through(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            $unreadCount = $user->unreadNotifications()->count();
            
            Log::info('AdminNotificationController@index: Loading notifications page', [
                'user_id' => $user->id,
                'total_notifications' => $notifications->total(),
                'unread_count' => $unreadCount
            ]);
            
            return Inertia::render('admin/Notifications/Index', [
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
                'layout' => 'admin'
            ]);

        } catch (\Exception $e) {
            Log::error('AdminNotificationController@index: Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load notifications');
        }
    }

    /**
     * Get recent notifications for the dropdown
     */
    public function getRecent()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                Log::warning('AdminNotificationController@getRecent: No authenticated user');
                return response()->json([
                    'notifications' => [],
                    'unreadCount' => 0
                ]);
            }

            $notifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            $unreadCount = $user->unreadNotifications()->count();
            
            Log::info('AdminNotificationController@getRecent: Success', [
                'user_id' => $user->id,
                'notification_count' => $notifications->count(),
                'unread_count' => $unreadCount
            ]);
            
            return response()->json([
                'notifications' => $notifications,
                'unreadCount' => $unreadCount
            ]);

        } catch (\Exception $e) {
            Log::error('AdminNotificationController@getRecent: Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'notifications' => [],
                'unreadCount' => 0
            ], 500);
        }
    }

    /**
     * Get unread count only
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();
            $count = $user ? $user->unreadNotifications()->count() : 0;
            
            Log::info('AdminNotificationController@unreadCount', [
                'user_id' => $user?->id,
                'count' => $count
            ]);
            
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('AdminNotificationController@unreadCount: Failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['count' => 0], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            
            Log::info('Marking notification as read', [
                'user_id' => $user?->id,
                'notification_id' => $id
            ]);
            
            $notification = $user->notifications()->findOrFail($id);
            $notification->markAsRead();
            
            // Get updated counts
            $unreadCount = $user->unreadNotifications()->count();
            $recentNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            return response()->json([
                'success' => true,
                'read_at' => $notification->fresh()->read_at,
                'notification' => $this->formatNotification($notification->fresh()),
                'unreadCount' => $unreadCount,
                'notifications' => $recentNotifications
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read', [
                'error' => $e->getMessage(),
                'notification_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            
            Log::info('Marking all notifications as read', [
                'user_id' => $user?->id
            ]);
            
            $count = $user->unreadNotifications()->count();
            $user->unreadNotifications->markAsRead();
            
            // Get updated notifications
            $recentNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            return response()->json([
                'success' => true,
                'marked_count' => $count,
                'unreadCount' => 0,
                'notifications' => $recentNotifications
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to mark all as read', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all as read'
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            Log::info('Deleting notification', [
                'user_id' => $user?->id,
                'notification_id' => $id
            ]);
            
            $notification = DatabaseNotification::findOrFail($id);
            
            // Ensure the notification belongs to the authenticated user
            if ($notification->notifiable_id !== $user->id || $notification->notifiable_type !== get_class($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $notification->delete();
            
            // Get updated notifications
            $recentNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            return response()->json([
                'success' => true,
                'message' => 'Notification deleted',
                'notifications' => $recentNotifications,
                'unreadCount' => $user->unreadNotifications()->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete notification', [
                'error' => $e->getMessage(),
                'notification_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification'
            ], 500);
        }
    }

    /**
     * Bulk delete notifications
     */
    public function bulkDestroy(Request $request)
    {
        try {
            $user = Auth::user();
            $ids = $request->input('ids', []);
            
            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No notifications selected'
                ], 400);
            }
            
            $count = DatabaseNotification::where('notifiable_id', $user->id)
                ->where('notifiable_type', get_class($user))
                ->whereIn('id', $ids)
                ->delete();
            
            Log::info('Bulk deleted notifications', [
                'user_id' => $user->id,
                'count' => $count
            ]);
            
            // Get updated notifications
            $recentNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return $this->formatNotification($notification);
                });
            
            return response()->json([
                'success' => true,
                'message' => "{$count} notifications deleted",
                'deleted_count' => $count,
                'notifications' => $recentNotifications,
                'unreadCount' => $user->unreadNotifications()->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to bulk delete notifications', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notifications'
            ], 500);
        }
    }

    /**
     * Format notification
     */
    private function formatNotification($notification)
    {
        $data = $notification->data;
        
        // Extract data
        $residentName = $data['resident_name'] ?? null;
        $message = $data['message'] ?? 'New notification received';
        $url = $data['url'] ?? '#';
        
        // Create title based on notification type
        $title = 'New Notification';
        if ($residentName && isset($data['type'])) {
            $title = "{$data['type']} from {$residentName}";
        } elseif ($residentName) {
            $title = "Request from {$residentName}";
        } elseif (isset($data['title'])) {
            $title = $data['title'];
        }
        
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'data' => $data,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'created_at_diff' => $notification->created_at->diffForHumans(),
            'is_fee_notification' => str_contains($notification->type, 'Fee'),
            'is_clearance_notification' => str_contains($notification->type, 'Clearance'),
            'message' => $message,
            'title' => $title,
            'resident_name' => $residentName,
            'formatted_amount' => $data['formatted_amount'] ?? null,
            'url' => $url,
            'link' => $url,
            'notification_type' => $this->getNotificationType($notification->type),
        ];
    }

    /**
     * Get notification type from class name
     */
    private function getNotificationType($type)
    {
        if (str_contains($type, 'Fee')) return 'fee';
        if (str_contains($type, 'Payment')) return 'payment';
        if (str_contains($type, 'Clearance')) return 'clearance';
        if (str_contains($type, 'Report')) return 'report';
        return 'system';
    }
}