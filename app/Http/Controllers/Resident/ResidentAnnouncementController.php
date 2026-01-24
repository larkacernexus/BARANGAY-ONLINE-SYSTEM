<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ResidentAnnouncementController extends Controller
{
    /**
     * Display a listing of announcements for residents
     */
         public function index(Request $request)
    {
        // Start with all active announcements
        $query = Announcement::where('is_active', true);
        
        // Filter by type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        // Filter by priority if provided
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'active':
                    $query->where(function ($q) {
                        $q->where(function ($sub) {
                            $sub->whereNull('start_date')
                                ->orWhere('start_date', '<=', now());
                        })
                        ->where(function ($sub) {
                            $sub->whereNull('end_date')
                                ->orWhere('end_date', '>=', now());
                        });
                    });
                    break;
                    
                case 'upcoming':
                    $query->where('start_date', '>', now());
                    break;
                    
                case 'expired':
                    $query->where('end_date', '<', now());
                    break;
            }
        }
        
        // Search if provided
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('content', 'like', '%' . $search . '%');
            });
        }
        
        // Order by priority (urgent first) and then by creation date (newest first)
        $announcements = $query->orderBy('priority', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->paginate(12)
                              ->withQueryString();
        
        // Transform announcements to include status for display
        $announcements->getCollection()->transform(function ($announcement) {
            $announcement->status = $announcement->getStatusAttribute();
            return $announcement;
        });
        
        return Inertia::render('resident/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'type', 'priority', 'status']) ?: [
                'search' => '',
                'type' => 'all',
                'priority' => 'all',
                'status' => 'all',
            ],
            'types' => Announcement::getTypes() ?: [],
            'priorityOptions' => Announcement::getPriorityOptions() ?: [],
            'statusOptions' => Announcement::getStatusOptions() ?: [],
        ]);
    }

    /**
     * Display the specified announcement
     */
    public function show(Announcement $announcement)
    {
        // Check if announcement is active and accessible
        if (!$announcement->is_active) {
            abort(404, 'This announcement is no longer available.');
        }

        $announcementData = [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'content' => $announcement->content,
            'type' => $announcement->type,
            'type_label' => $this->getTypeLabel($announcement->type),
            'priority' => $announcement->priority,
            'priority_label' => $this->getPriorityLabel($announcement->priority),
            'start_date' => $announcement->start_date ? $announcement->start_date->toISOString() : null,
            'end_date' => $announcement->end_date ? $announcement->end_date->toISOString() : null,
            'start_time' => $announcement->start_time,
            'end_time' => $announcement->end_time,
            'created_at' => $announcement->created_at->toISOString(),
            'updated_at' => $announcement->updated_at->toISOString(),
            'is_currently_active' => $announcement->isCurrentlyActive(),
            'days_remaining' => $announcement->end_date ? 
                now()->diffInDays($announcement->end_date, false) : null,
            'author' => $announcement->author ?? 'Barangay Official',
            'has_read' => true,
        ];

        // Get related announcements (same type, active)
        $relatedAnnouncements = Announcement::where('is_active', true)
            ->where('type', $announcement->type)
            ->where('id', '!=', $announcement->id)
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($related) {
                return [
                    'id' => $related->id,
                    'title' => $related->title,
                    'excerpt' => $this->getExcerpt($related->content, 80),
                    'type_label' => $this->getTypeLabel($related->type),
                    'priority_label' => $this->getPriorityLabel($related->priority),
                    'created_at' => $related->created_at->toISOString(),
                ];
            });

        // Get resident info
        $user = Auth::user();
        $resident = $user->resident;

        return Inertia::render('resident/Announcements/Show', [
            'announcement' => $announcementData,
            'relatedAnnouncements' => $relatedAnnouncements,
            'resident' => $resident ? [
                'full_name' => $resident->full_name,
                'household_number' => $resident->household ? $resident->household->household_number : null,
                'purok' => $resident->purok ? $resident->purok->name : null,
            ] : null,
        ]);
    }

    /**
     * Get excerpt from content
     */
    private function getExcerpt($content, $length = 150)
    {
        $excerpt = strip_tags($content);
        if (strlen($excerpt) > $length) {
            $excerpt = substr($excerpt, 0, $length) . '...';
        }
        return $excerpt;
    }

    /**
     * Get type label
     */
    private function getTypeLabel($type)
    {
        $types = [
            'general' => 'General',
            'important' => 'Important',
            'event' => 'Event',
            'maintenance' => 'Maintenance',
            'other' => 'Other',
        ];
        
        return $types[$type] ?? ucfirst($type);
    }

    /**
     * Get priority label
     */
    private function getPriorityLabel($priority)
    {
        $priorities = [
            0 => 'Low',
            1 => 'Normal',
            2 => 'Medium',
            3 => 'High',
            4 => 'Urgent',
        ];
        
        return $priorities[$priority] ?? 'Normal';
    }

    /**
     * Get all types for filter
     */
    private function getTypes()
    {
        return [
            ['value' => 'general', 'label' => 'General'],
            ['value' => 'important', 'label' => 'Important'],
            ['value' => 'event', 'label' => 'Event'],
            ['value' => 'maintenance', 'label' => 'Maintenance'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }

    /**
     * Get all priorities for filter
     */
    private function getPriorities()
    {
        return [
            ['value' => 0, 'label' => 'Low'],
            ['value' => 1, 'label' => 'Normal'],
            ['value' => 2, 'label' => 'Medium'],
            ['value' => 3, 'label' => 'High'],
            ['value' => 4, 'label' => 'Urgent'],
        ];
    }
}