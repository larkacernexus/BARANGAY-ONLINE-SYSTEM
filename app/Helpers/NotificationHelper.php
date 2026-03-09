<?php
// app/Helpers/NotificationHelper.php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\DatabaseNotification;

class NotificationHelper
{
    /**
     * Get notifications for a user formatted for display
     * Uses notification DATA, not notifiable relationship!
     */
    public static function getForUser($user, $limit = 10)
    {
        if (!$user) {
            return collect([]);
        }
        
        try {
            $notifications = DatabaseNotification::where(function($query) use ($user) {
                // User-specific notifications (where notifiable_id = user->id)
                $query->where('notifiable_type', get_class($user))
                      ->where('notifiable_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($notification) use ($user) {
                return self::formatNotification($notification, $user);
            });
            
            return $notifications;
            
        } catch (\Exception $e) {
            Log::error('NotificationHelper::getForUser failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);
            return collect([]);
        }
    }
    
    /**
     * Get unread count for user
     */
    public static function getUnreadCount($user)
    {
        if (!$user) {
            return 0;
        }
        
        try {
            return DatabaseNotification::where('notifiable_type', get_class($user))
                ->where('notifiable_id', $user->id)
                ->whereNull('read_at')
                ->count();
        } catch (\Exception $e) {
            Log::error('NotificationHelper::getUnreadCount failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);
            return 0;
        }
    }
    
    /**
     * Format notification using DATA field - NOT notifiable relationship!
     */
    public static function formatNotification($notification, $user = null)
    {
        $data = $notification->data ?? [];
        
        // Check if this is an announcement notification
        $isAnnouncement = isset($data['type']) && $data['type'] === 'announcement';
        
        if ($isAnnouncement) {
            return self::formatAnnouncementNotification($notification, $data);
        }
        
        // EXTRACT EVERYTHING FROM NOTIFICATION DATA for other notification types
        $residentName = $data['resident_name'] ?? null;
        $residentId = $data['resident_id'] ?? null;
        $householdId = $data['household_id'] ?? null;
        $referenceNumber = $data['reference_number'] ?? null;
        $clearanceType = $data['clearance_type'] ?? null;
        $clearanceId = $data['clearance_id'] ?? null;
        $purpose = $data['purpose'] ?? null;
        $feeAmount = $data['fee_amount'] ?? null;
        $status = $data['status'] ?? null;
        $message = $data['message'] ?? 'New notification received';
        $url = $data['url'] ?? '#';
        $targetRoles = $data['target_roles'] ?? [];
        $action = $data['action'] ?? null;
        
        // Create title based on notification type and data
        $title = 'New Notification';
        
        if ($residentName && $clearanceType) {
            $title = "{$clearanceType} Request from {$residentName}";
        } elseif ($residentName) {
            $title = "Request from {$residentName}";
        } elseif (isset($data['fee_type']) && $data['fee_type']) {
            $title = "New {$data['fee_type']} Fee";
        } elseif ($referenceNumber) {
            $title = "Clearance #{$referenceNumber}";
        }
        
        // Add amount to message if available
        if (isset($data['formatted_amount']) && $data['formatted_amount']) {
            $message .= ' - ' . $data['formatted_amount'];
        } elseif ($feeAmount) {
            $message .= ' - ₱' . number_format($feeAmount, 2);
        }
        
        // Create notification object with properties
        $notification->resident_name = $residentName;
        $notification->resident_id = $residentId;
        $notification->household_id = $householdId;
        $notification->reference_number = $referenceNumber;
        $notification->clearance_type = $clearanceType;
        $notification->clearance_id = $clearanceId;
        $notification->purpose = $purpose;
        $notification->fee_amount = $feeAmount;
        $notification->status = $status;
        $notification->message = $message;
        $notification->title = $title;
        $notification->url = $url;
        $notification->target_roles = $targetRoles;
        $notification->action = $action;
        $notification->created_at_diff = $notification->created_at->diffForHumans();
        $notification->is_fee_notification = $notification->type === 'App\Notifications\FeeCreatedNotification';
        $notification->is_clearance_notification = $notification->type === 'App\Notifications\ClearanceRequestNotification';
        $notification->is_announcement = false;
        
        return $notification;
    }
    
    /**
     * Format announcement notification specifically
     */
    private static function formatAnnouncementNotification($notification, $data)
    {
        // Extract announcement-specific data
        $title = $data['title'] ?? 'Announcement';
        $message = $data['message'] ?? $data['content'] ?? 'New announcement';
        $priority = $data['priority'] ?? 'normal';
        $priorityLabel = $data['priority_label'] ?? ucfirst($priority);
        $priorityColor = $data['priority_color'] ?? '#6c757d';
        $typeLabel = $data['type_label'] ?? 'Announcement';
        $typeIcon = $data['type_icon'] ?? 'fa-bullhorn';
        $typeColor = $data['type_color'] ?? '#0d6efd';
        
        // Get audience info
        $audienceSummary = $data['audience_summary'] ?? 'All residents';
        $estimatedReach = $data['estimated_reach'] ?? 0;
        
        // Get schedule info
        $formattedDateRange = $data['formatted_date_range'] ?? null;
        $timeRange = $data['time_range'] ?? null;
        
        // Get creator info
        $createdBy = $data['created_by'] ?? 'System';
        $formattedCreated = $data['formatted_created'] ?? $notification->created_at->format('M d, Y g:i A');
        
        // Get status
        $status = $data['status'] ?? 'published';
        $statusLabel = $data['status_label'] ?? ucfirst($status);
        $statusColor = $data['status_color'] ?? '#28a745';
        $isActive = $data['is_active'] ?? true;
        $isCurrentlyActive = $data['is_currently_active'] ?? true;
        
        // Get URL
        $url = $data['url'] ?? '#';
        
        // Build a rich message with all details
        $richMessage = $message;
        
        // Add priority emoji/indicator to title
        $titleWithPriority = $title;
        if ($priority === 'urgent') {
            $titleWithPriority = '🔴 ' . $title;
        } elseif ($priority === 'high') {
            $titleWithPriority = '🟠 ' . $title;
        } elseif ($priority === 'medium') {
            $titleWithPriority = '🟡 ' . $title;
        }
        
        // Add audience and schedule summary if available
        $details = [];
        if ($audienceSummary) {
            $details[] = $audienceSummary;
        }
        if ($formattedDateRange) {
            $details[] = $formattedDateRange;
        }
        if ($timeRange) {
            $details[] = $timeRange;
        }
        
        if (!empty($details)) {
            $richMessage .= ' • ' . implode(' • ', $details);
        }
        
        // Set notification properties
        $notification->title = $titleWithPriority;
        $notification->message = $richMessage;
        $notification->url = $url;
        $notification->type_label = $typeLabel;
        $notification->type_icon = $typeIcon;
        $notification->type_color = $typeColor;
        $notification->priority = $priority;
        $notification->priority_label = $priorityLabel;
        $notification->priority_color = $priorityColor;
        $notification->audience_summary = $audienceSummary;
        $notification->estimated_reach = $estimatedReach;
        $notification->formatted_date_range = $formattedDateRange;
        $notification->time_range = $timeRange;
        $notification->created_by = $createdBy;
        $notification->formatted_created = $formattedCreated;
        $notification->status = $status;
        $notification->status_label = $statusLabel;
        $notification->status_color = $statusColor;
        $notification->is_active = $isActive;
        $notification->is_currently_active = $isCurrentlyActive;
        $notification->created_at_diff = $notification->created_at->diffForHumans();
        $notification->is_announcement = true;
        $notification->is_fee_notification = false;
        $notification->is_clearance_notification = false;
        
        return $notification;
    }
    
    /**
     * Mark notification as read
     */
    public static function markAsRead($notificationId, $userId)
    {
        try {
            $notification = DatabaseNotification::where('id', $notificationId)
                ->where('notifiable_type', 'App\Models\User')
                ->where('notifiable_id', $userId)
                ->first();
                
            if ($notification) {
                $notification->markAsRead();
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('NotificationHelper::markAsRead failed', [
                'error' => $e->getMessage(),
                'notification_id' => $notificationId,
                'user_id' => $userId
            ]);
            return false;
        }
    }
}