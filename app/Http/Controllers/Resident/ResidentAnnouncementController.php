<?php
// app/Http/Controllers/Resident/ResidentAnnouncementController.php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementAttachment;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResidentAnnouncementController extends Controller
{
    /**
     * Display a listing of announcements for residents with audience targeting
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Start with announcements visible to this user
        $query = Announcement::query()
            ->with(['attachments' => function($q) {
                $q->select('id', 'announcement_id', 'file_name', 'original_name', 'file_size', 'mime_type', 'created_at');
            }])
            ->where('is_active', true)
            ->visibleToUser($user);
        
        // Filter by type if provided
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        // Filter by priority if provided
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        // Filter by status if provided
        if ($request->filled('status') && $request->status !== 'all') {
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
                    $query->whereNotNull('start_date')
                        ->where('start_date', '>', now());
                    break;
                    
                case 'expired':
                    $query->whereNotNull('end_date')
                        ->where('end_date', '<', now());
                    break;
            }
        }
        
        // Search if provided
        if ($request->filled('search')) {
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
        
        // Transform announcements for frontend
        $announcements->getCollection()->transform(function ($announcement) use ($user) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'excerpt' => Str::limit(strip_tags($announcement->content), 120),
                'type' => $announcement->type,
                'type_label' => $announcement->type_label,
                'priority' => $announcement->priority,
                'priority_label' => $announcement->priority_label,
                'created_at' => $announcement->created_at->toISOString(),
                'updated_at' => $announcement->updated_at->toISOString(),
                'start_date' => $announcement->start_date?->toISOString(),
                'end_date' => $announcement->end_date?->toISOString(),
                'status' => $announcement->status,
                'status_label' => $announcement->status_label,
                'status_color' => $announcement->status_color,
                'is_currently_active' => $announcement->isCurrentlyActive(),
                'audience_summary' => $announcement->audience_summary,
                'is_personalized' => $announcement->audience_type !== 'all',
                'has_attachments' => $announcement->attachments->isNotEmpty(),
                'attachments_count' => $announcement->attachments->count(),
                'attachments' => $announcement->attachments->map(function($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_name' => $attachment->file_name,
                        'original_name' => $attachment->original_name,
                        'file_size' => $attachment->file_size,
                        'formatted_size' => $attachment->formatted_size,
                        'mime_type' => $attachment->mime_type,
                        'is_image' => $attachment->is_image,
                        'created_at' => $attachment->created_at->toISOString(),
                    ];
                }),
                'views_count' => rand(100, 1000), // Replace with actual views count when implemented
            ];
        });
        
        // Get statistics
        $stats = [
            'total' => Announcement::visibleToUser($user)->count(),
            'active' => Announcement::visibleToUser($user)->published()->count(),
            'unread' => 0, // Implement unread count when you add read tracking
            'personalized' => Announcement::visibleToUser($user)
                ->where('audience_type', '!=', 'all')
                ->count(),
            'with_attachments' => Announcement::visibleToUser($user)
                ->published()
                ->has('attachments')
                ->count(),
        ];
        
        // Get featured announcement (highest priority active)
        $featured = Announcement::visibleToUser($user)
            ->with('attachments')
            ->published()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();
            
        $featuredAnnouncement = $featured ? [
            'id' => $featured->id,
            'title' => $featured->title,
            'excerpt' => Str::limit(strip_tags($featured->content), 200),
            'type' => $featured->type,
            'type_label' => $featured->type_label,
            'priority' => $featured->priority,
            'priority_label' => $featured->priority_label,
            'created_at' => $featured->created_at->toISOString(),
            'audience_summary' => $featured->audience_summary,
            'has_attachments' => $featured->attachments->isNotEmpty(),
            'attachments_count' => $featured->attachments->count(),
        ] : null;
        
        return Inertia::render('resident/Announcements/Index', [
            'announcements' => $announcements,
            'featuredAnnouncement' => $featuredAnnouncement,
            'filters' => $request->only(['search', 'type', 'priority', 'status']) ?: [
                'search' => '',
                'type' => 'all',
                'priority' => 'all',
                'status' => 'all',
            ],
            'types' => Announcement::getTypes(),
            'priorityOptions' => Announcement::getPriorityOptions(),
            'statusOptions' => Announcement::getStatusOptions(),
            'stats' => $stats,
        ]);
    }

    /**
     * Display the specified announcement
     */
    public function show(Announcement $announcement)
    {
        $user = Auth::user();
        
        // Check if announcement is active
        if (!$announcement->is_active) {
            abort(404, 'This announcement is no longer available.');
        }
        
        // Check if user has permission to view this announcement
        if (!$announcement->isVisibleToUser($user)) {
            abort(403, 'You do not have permission to view this announcement.');
        }

        // Load attachments
        $announcement->load(['attachments' => function($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        // Get author information
        $author = null;
        if ($announcement->creator) {
            $author = [
                'id' => $announcement->creator->id,
                'name' => $announcement->creator->full_name,
                'role' => $announcement->creator->role?->name ?? 'Barangay Official',
                'avatar' => null, // Add avatar when implemented
            ];
        }

        // Format attachments
        $attachments = $announcement->attachments->map(function($attachment) {
            return [
                'id' => $attachment->id,
                'file_path' => $attachment->file_path,
                'file_name' => $attachment->file_name,
                'original_name' => $attachment->original_name,
                'file_size' => $attachment->file_size,
                'formatted_size' => $attachment->formatted_size,
                'mime_type' => $attachment->mime_type,
                'is_image' => $attachment->is_image,
                'created_at' => $attachment->created_at->toISOString(),
            ];
        });

        // Get resident information
        $resident = null;
        if ($user->currentResident) {
            $resident = [
                'full_name' => $user->currentResident->full_name,
                'household_number' => $user->household?->household_number,
                'purok' => $user->household?->purok?->name,
            ];
        }

        // Get related announcements (visible to user, same type, exclude current)
        $relatedAnnouncements = Announcement::visibleToUser($user)
            ->with('attachments')
            ->where('is_active', true)
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
            ->limit(6)
            ->get()
            ->map(function ($related) {
                return [
                    'id' => $related->id,
                    'title' => $related->title,
                    'type' => $related->type,
                    'type_label' => $related->type_label,
                    'priority' => $related->priority,
                    'priority_label' => $related->priority_label,
                    'excerpt' => Str::limit(strip_tags($related->content), 100),
                    'created_at' => $related->created_at->toISOString(),
                    'has_attachments' => $related->attachments->isNotEmpty(),
                    'attachments_count' => $related->attachments->count(),
                ];
            });

        // Prepare announcement data
        $announcementData = [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'content' => $announcement->content,
            'type' => $announcement->type,
            'type_label' => $announcement->type_label,
            'priority' => $announcement->priority,
            'priority_label' => $announcement->priority_label,
            'start_date' => $announcement->start_date?->toISOString(),
            'end_date' => $announcement->end_date?->toISOString(),
            'start_time' => $announcement->start_time?->format('H:i'),
            'end_time' => $announcement->end_time?->format('H:i'),
            'created_at' => $announcement->created_at->toISOString(),
            'updated_at' => $announcement->updated_at->toISOString(),
            'is_currently_active' => $announcement->isCurrentlyActive(),
            'status' => $announcement->status,
            'status_label' => $announcement->status_label,
            'status_color' => $announcement->status_color,
            'audience_type' => $announcement->audience_type,
            'audience_summary' => $announcement->audience_summary,
            'estimated_reach' => $announcement->estimated_reach,
            'formatted_date_range' => $announcement->formatted_date_range,
            'views_count' => rand(100, 1000), // Replace with actual views count
            'author' => $author,
            'has_attachments' => $attachments->isNotEmpty(),
            'attachments_count' => $attachments->count(),
            'attachments' => $attachments,
        ];

        // Track view
        $this->trackView($announcement, $user);

        return Inertia::render('resident/Announcements/Show', [
            'announcement' => $announcementData,
            'relatedAnnouncements' => $relatedAnnouncements,
            'resident' => $resident,
            'priorityOptions' => Announcement::getPriorityOptions(),
            'types' => Announcement::getTypes(),
        ]);
    }

    /**
     * Download attachment
     */
    public function downloadAttachment(AnnouncementAttachment $attachment)
    {
        $user = Auth::user();
        $announcement = $attachment->announcement;
        
        // Check if user has permission to view this announcement
        if (!$announcement->isVisibleToUser($user)) {
            abort(403, 'You do not have permission to access this file.');
        }
        
        // Check if announcement is active
        if (!$announcement->is_active) {
            abort(404, 'This announcement is no longer available.');
        }
        
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'File not found.');
        }
        
        // Track download (optional)
        // $this->trackDownload($attachment, $user);
        
        return Storage::disk('public')->download(
            $attachment->file_path, 
            $attachment->original_name ?? $attachment->file_name
        );
    }

    /**
     * Stream attachment for preview
     */
    public function previewAttachment(AnnouncementAttachment $attachment)
    {
        $user = Auth::user();
        $announcement = $attachment->announcement;
        
        // Check if user has permission to view this announcement
        if (!$announcement->isVisibleToUser($user)) {
            abort(403, 'You do not have permission to access this file.');
        }
        
        // Check if announcement is active
        if (!$announcement->is_active) {
            abort(404, 'This announcement is no longer available.');
        }
        
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'File not found.');
        }
        
        // For images, return the file directly
        if ($attachment->is_image) {
            return response()->file(Storage::disk('public')->path($attachment->file_path));
        }
        
        // For other files, return download response
        return Storage::disk('public')->download(
            $attachment->file_path, 
            $attachment->original_name ?? $attachment->file_name
        );
    }

    /**
     * Mark announcement as read
     */
    public function markAsRead(Announcement $announcement)
    {
        $user = Auth::user();
        
        // Check if user has permission to view this announcement
        if (!$announcement->isVisibleToUser($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Implement read tracking
        DB::table('announcement_reads')->updateOrInsert(
            [
                'announcement_id' => $announcement->id,
                'user_id' => $user->id,
            ],
            [
                'read_at' => now(),
                'updated_at' => now(),
            ]
        );
        
        return response()->json(['success' => true]);
    }

    /**
     * Get announcements for the current user (API endpoint)
     */
    public function getUserAnnouncements(Request $request)
    {
        $user = Auth::user();
        
        $query = Announcement::visibleToUser($user)
            ->with('attachments')
            ->where('is_active', true)
            ->published();
        
        // Get count of unread
        $unreadCount = Announcement::visibleToUser($user)
            ->where('is_active', true)
            ->published()
            ->whereNotIn('id', function($q) use ($user) {
                $q->select('announcement_id')
                  ->from('announcement_reads')
                  ->where('user_id', $user->id);
            })
            ->count();
        
        // Get latest announcements
        $recent = $query->clone()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'type' => $announcement->type,
                    'type_label' => $announcement->type_label,
                    'priority' => $announcement->priority,
                    'priority_label' => $announcement->priority_label,
                    'created_at' => $announcement->created_at->toISOString(),
                    'has_attachments' => $announcement->attachments->isNotEmpty(),
                    'attachments_count' => $announcement->attachments->count(),
                ];
            });
        
        return response()->json([
            'unread_count' => $unreadCount,
            'recent' => $recent,
        ]);
    }

    /**
     * Get announcement statistics
     */
    public function getStats()
    {
        $user = Auth::user();
        
        $stats = [
            'total' => Announcement::visibleToUser($user)->count(),
            'active' => Announcement::visibleToUser($user)->published()->count(),
            'urgent' => Announcement::visibleToUser($user)
                ->published()
                ->where('priority', 4)
                ->count(),
            'personalized' => Announcement::visibleToUser($user)
                ->published()
                ->where('audience_type', '!=', 'all')
                ->count(),
            'with_attachments' => Announcement::visibleToUser($user)
                ->published()
                ->has('attachments')
                ->count(),
        ];
        
        return response()->json($stats);
    }

    /**
     * Track announcement view
     */
    private function trackView(Announcement $announcement, User $user)
    {
        // Update or create view record
        DB::table('announcement_views')->updateOrInsert(
            [
                'announcement_id' => $announcement->id,
                'user_id' => $user->id,
                'view_date' => now()->toDateString(),
            ],
            [
                'view_count' => DB::raw('view_count + 1'),
                'updated_at' => now(),
            ]
        );
        
        // Also track in views table for analytics
        DB::table('announcement_view_logs')->insert([
            'announcement_id' => $announcement->id,
            'user_id' => $user->id,
            'viewed_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Track attachment download
     */
    private function trackDownload(AnnouncementAttachment $attachment, User $user)
    {
        DB::table('attachment_downloads')->insert([
            'attachment_id' => $attachment->id,
            'announcement_id' => $attachment->announcement_id,
            'user_id' => $user->id,
            'downloaded_at' => now(),
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Get unread count for current user
     */
    public function getUnreadCount()
    {
        $user = Auth::user();
        
        $count = Announcement::visibleToUser($user)
            ->where('is_active', true)
            ->published()
            ->whereNotIn('id', function($q) use ($user) {
                $q->select('announcement_id')
                  ->from('announcement_reads')
                  ->where('user_id', $user->id);
            })
            ->count();
        
        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark multiple announcements as read
     */
    public function markMultipleAsRead(Request $request)
    {
        $request->validate([
            'announcement_ids' => 'required|array',
            'announcement_ids.*' => 'exists:announcements,id',
        ]);
        
        $user = Auth::user();
        $now = now();
        
        foreach ($request->announcement_ids as $announcementId) {
            DB::table('announcement_reads')->updateOrInsert(
                [
                    'announcement_id' => $announcementId,
                    'user_id' => $user->id,
                ],
                [
                    'read_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
        
        return response()->json(['success' => true]);
    }
}