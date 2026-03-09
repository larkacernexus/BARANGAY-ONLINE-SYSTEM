<?php
// app/Notifications/NewAnnouncementNotification.php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewAnnouncementNotification extends Notification
{
    use Queueable;

    protected $announcement;
    protected $action;

    public function __construct(Announcement $announcement, string $action = 'created')
    {
        $this->announcement = $announcement;
        $this->action = $action;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $creatorName = $this->announcement->creator?->full_name ?? 'System';
        $priorityColor = Announcement::getPriorityColor($this->announcement->priority);
        $typeIcon = Announcement::getTypeIcon($this->announcement->type);
        
        // Determine the correct URL based on user role
        $url = $this->getNotificationUrl($notifiable);
        
        return [
            // Base notification fields
            'type' => 'announcement',
            'action' => $this->action,
            'announcement_id' => $this->announcement->id,
            
            // Core announcement data
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
            'priority' => $this->announcement->priority,
            'priority_label' => $this->announcement->priority_label,
            'priority_color' => $priorityColor,
            'announcement_type' => $this->announcement->type,
            'type_label' => $this->announcement->type_label,
            'type_icon' => $typeIcon,
            'type_color' => Announcement::getTypeColor($this->announcement->type),
            
            // Audience info
            'audience_type' => $this->announcement->audience_type,
            'audience_summary' => $this->announcement->audience_summary,
            'estimated_reach' => $this->announcement->estimated_reach,
            
            // Schedule info
            'start_date' => $this->announcement->start_date?->toDateTimeString(),
            'end_date' => $this->announcement->end_date?->toDateTimeString(),
            'start_time' => $this->announcement->start_time?->format('H:i'),
            'end_time' => $this->announcement->end_time?->format('H:i'),
            'time_range' => $this->announcement->time_range,
            'formatted_date_range' => $this->announcement->formatted_date_range,
            
            // Status info
            'is_active' => $this->announcement->is_active,
            'status' => $this->announcement->status,
            'status_label' => $this->announcement->status_label,
            'status_color' => $this->announcement->status_color,
            'is_currently_active' => $this->announcement->isCurrentlyActive(),
            
            // Creator info
            'created_by' => $creatorName,
            'created_by_id' => $this->announcement->created_by,
            'created_at' => $this->announcement->created_at->toDateTimeString(),
            'formatted_created' => $this->announcement->created_at->format('M d, Y g:i A'),
            
            // Notification message
            'message' => $this->generateMessage(),
            
            // Target roles for filtering
            'target_roles' => $this->announcement->target_roles ?? [],
            
            // URL for navigation - FIXED to match your route structure
            'url' => $url,
            'link' => $url,
            
            // Role context
            'user_role' => $this->getUserRole($notifiable),
            'is_admin_route' => $this->isAdminUser($notifiable),
        ];
    }

    /**
     * FIXED: Get URL based on your actual route structure
     * Now uses /portal/announcements/{id} and /admin/announcements/{id}
     */
    private function getNotificationUrl($notifiable): string
    {
        // Check if user is admin/staff
        if ($this->isAdminUser($notifiable)) {
            // Admin route without /show/
            return '/admin/announcements/' . $this->announcement->id;
        }
        
        // For regular users - clean URL without /show/
        return '/portal/announcements/' . $this->announcement->id;
    }

    /**
     * Check if user is admin/staff
     */
    private function isAdminUser($user): bool
    {
        if (!$user || !$user->role) {
            return false;
        }
        
        $adminRoles = ['admin', 'super_admin', 'staff', 'secretary', 'treasurer', 'captain', 'kagawad'];
        return in_array($user->role->name, $adminRoles);
    }

    /**
     * Get user role name
     */
    private function getUserRole($user): ?string
    {
        return $user->role?->name;
    }

    private function generateMessage(): string
    {
        $title = $this->announcement->title;
        $type = $this->announcement->type_label;
        
        $prefix = match($this->announcement->priority) {
            Announcement::PRIORITY_URGENT => '🔴 URGENT: ',
            Announcement::PRIORITY_HIGH => '🟠 IMPORTANT: ',
            default => ''
        };
        
        switch($this->action) {
            case 'created':
                return "{$prefix}New {$type} announcement: \"{$title}\"";
            case 'updated':
                return "{$prefix}Announcement updated: \"{$title}\"";
            case 'published':
                return "{$prefix}New announcement published: \"{$title}\"";
            case 'reminder':
                return "{$prefix}Reminder: \"{$title}\"";
            default:
                return "{$prefix}Announcement: \"{$title}\"";
        }
    }
}