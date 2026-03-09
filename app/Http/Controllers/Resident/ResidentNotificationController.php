<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Notifications\DatabaseNotification;

class ResidentNotificationController extends Controller
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
            
            // Get counts by type
            $typeCounts = $this->getNotificationTypeCounts($user);
            
            Log::info('ResidentNotificationController@index: Loading notifications page', [
                'user_id' => $user->id,
                'total_notifications' => $notifications->total(),
                'unread_count' => $unreadCount
            ]);

            // Determine which layout to use based on user role
            $layout = $user->isAdministrator() ? 'admin' : 'portal';
            
            return Inertia::render('resident/Notifications/Index', [
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
                'typeCounts' => $typeCounts,
                'layout' => $layout
            ]);

        } catch (\Exception $e) {
            Log::error('ResidentNotificationController@index: Failed', [
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
                Log::warning('ResidentNotificationController@getRecent: No authenticated user');
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
            
            Log::info('ResidentNotificationController@getRecent: Success', [
                'user_id' => $user->id,
                'notification_count' => $notifications->count(),
                'unread_count' => $unreadCount
            ]);
            
            return response()->json([
                'notifications' => $notifications,
                'unreadCount' => $unreadCount
            ]);

        } catch (\Exception $e) {
            Log::error('ResidentNotificationController@getRecent: Failed', [
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
            
            Log::info('ResidentNotificationController@unreadCount', [
                'user_id' => $user?->id,
                'count' => $count
            ]);
            
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('ResidentNotificationController@unreadCount: Failed', [
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
            
            return response()->json([
                'success' => true,
                'read_at' => $notification->fresh()->read_at,
                'notification' => $this->formatNotification($notification->fresh())
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
            
            return response()->json([
                'success' => true,
                'marked_count' => $count
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
            
            return response()->json([
                'success' => true,
                'message' => 'Notification deleted'
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
     * Format notification using DATA field, NOT notifiable relationship
     * 
     * @param mixed $notification
     * @return array
     */
    private function formatNotification($notification)
    {
        $data = $notification->data;
        
        // Extract common fields from notification data
        $type = $data['type'] ?? $this->getNotificationTypeFromClass($notification->type);
        $action = $data['action'] ?? null;
        $residentName = $data['resident_name'] ?? $data['payer_name'] ?? null;
        $residentId = $data['resident_id'] ?? $data['payer_id'] ?? null;
        $householdId = $data['household_id'] ?? null;
        $referenceNumber = $data['reference_number'] ?? null;
        $clearanceType = $data['clearance_type'] ?? null;
        $clearanceId = $data['clearance_id'] ?? null;
        $purpose = $data['purpose'] ?? null;
        $feeAmount = $data['fee_amount'] ?? $data['amount'] ?? null;
        $status = $data['status'] ?? null;
        $message = $data['message'] ?? 'New notification received';
        
        // Get the URL - priority: link, action_url, url
        $url = $data['link'] ?? $data['action_url'] ?? $data['url'] ?? '#';
        
        // Get formatted amount
        $formattedAmount = $data['formatted_amount'] ?? null;
        if (!$formattedAmount && $feeAmount) {
            $formattedAmount = '₱' . number_format((float)$feeAmount, 2);
        }
        
        // Get fee code and type
        $feeCode = $data['fee_code'] ?? null;
        $feeType = $data['fee_type'] ?? null;
        
        // Create title based on notification type
        $title = $data['title'] ?? $this->generateTitle($type, $action, $residentName, $clearanceType);
        
        // Check if this is a fee notification
        $isFeeNotification = $notification->type === 'App\Notifications\FeeCreatedNotification' || 
                             $notification->type === 'App\Notifications\FeeDueReminderNotification' ||
                             $type === 'fee_created' || $type === 'fee_reminder';
        
        // Check if this is a clearance notification
        $isClearanceNotification = $notification->type === 'App\Notifications\ClearancePaymentNotification' ||
                                    $type === 'clearance_payment' || $clearanceId !== null;
        
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'data' => $data,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            'created_at_diff' => $notification->created_at->diffForHumans(),
            'is_fee_notification' => $isFeeNotification,
            'is_clearance_notification' => $isClearanceNotification,
            'message' => $message,
            'title' => $title,
            
            // ALL FROM NOTIFICATION DATA - NOT NOTIFIABLE!
            'resident_name' => $residentName,
            'resident_id' => $residentId,
            'household_id' => $householdId,
            'reference_number' => $referenceNumber,
            'clearance_type' => $clearanceType,
            'clearance_id' => $clearanceId,
            'purpose' => $purpose,
            'fee_amount' => $feeAmount,
            'status' => $status,
            'url' => $url,
            
            // Add both link and action_url for frontend compatibility
            'link' => $url,
            'action_url' => $url,
            
            // Formatting
            'formatted_amount' => $formattedAmount,
            'fee_code' => $feeCode,
            'fee_type' => $feeType,
            
            // Type info
            'notification_type' => $type,
            'action' => $action,
            
            // Target roles (if any)
            'target_roles' => $data['target_roles'] ?? [],
        ];
    }

    /**
     * Generate a title based on notification data
     */
    private function generateTitle($type, $action, $residentName, $clearanceType)
    {
        if ($type === 'fee_created') {
            return $residentName ? "Fee for {$residentName}" : 'New Fee Created';
        }
        
        if ($type === 'fee_reminder') {
            return 'Fee Payment Reminder';
        }
        
        if ($type === 'receipt') {
            return 'Payment Receipt Generated';
        }
        
        if ($type === 'payment') {
            return $action ? 'Payment ' . ucfirst($action) : 'Payment Update';
        }
        
        if ($type === 'clearance_payment') {
            return $clearanceType ? "{$clearanceType} Payment Update" : 'Clearance Payment Update';
        }
        
        if ($residentName) {
            return "Request from {$residentName}";
        }
        
        return 'New Notification';
    }

    /**
     * Get notification type from class name
     */
    private function getNotificationTypeFromClass($className)
    {
        $parts = explode('\\', $className);
        $class = end($parts);
        
        return strtolower(str_replace('Notification', '', $class));
    }

    /**
     * Get counts by notification type
     */
    private function getNotificationTypeCounts($user)
    {
        $notifications = $user->notifications()->get();
        
        $counts = [
            'fee' => 0,
            'payment' => 0,
            'clearance' => 0,
            'report' => 0,
            'announcement' => 0,
            'household' => 0,
            'member' => 0,
        ];
        
        foreach ($notifications as $notification) {
            $data = $notification->data;
            $type = $data['type'] ?? $this->getNotificationTypeFromClass($notification->type);
            
            switch (true) {
                case str_contains($type, 'fee'):
                case $notification->type === 'App\Notifications\FeeCreatedNotification':
                case $notification->type === 'App\Notifications\FeeDueReminderNotification':
                    $counts['fee']++;
                    break;
                case str_contains($type, 'payment'):
                case $notification->type === 'App\Notifications\PaymentProcessedNotification':
                case $notification->type === 'App\Notifications\PaymentReceiptNotification':
                    $counts['payment']++;
                    break;
                case str_contains($type, 'clearance'):
                case $notification->type === 'App\Notifications\ClearancePaymentNotification':
                    $counts['clearance']++;
                    break;
                case str_contains($type, 'report'):
                    $counts['report']++;
                    break;
                case str_contains($type, 'announcement'):
                    $counts['announcement']++;
                    break;
                case str_contains($type, 'household'):
                    $counts['household']++;
                    break;
                case str_contains($type, 'member'):
                    $counts['member']++;
                    break;
            }
        }
        
        return $counts;
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
            
            return response()->json([
                'success' => true,
                'message' => "{$count} notifications deleted",
                'deleted_count' => $count
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
}