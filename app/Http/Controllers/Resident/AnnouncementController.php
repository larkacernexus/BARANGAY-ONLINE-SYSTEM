<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementBookmark;
use App\Models\AnnouncementView;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $resident = auth()->user()->residentProfile;
        $category = $request->input('category', 'all');
        $search = $request->input('search');
        
        $query = Announcement::where('status', 'published')
            ->where('published_at', '<=', now())
            ->with(['category', 'author'])
            ->orderBy('published_at', 'desc');
        
        if ($category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        $announcements = $query->paginate(12);
        
        // Mark announcements as read
        $announcementIds = $announcements->pluck('id');
        $this->markAsRead($resident, $announcementIds);
        
        $categories = \App\Models\AnnouncementCategory::all();
        
        // Get bookmarked announcements
        $bookmarkedIds = AnnouncementBookmark::where('resident_id', $resident->id)
            ->pluck('announcement_id')
            ->toArray();
        
        // Get stats
        $stats = [
            'total' => Announcement::where('status', 'published')
                ->where('published_at', '<=', now())
                ->count(),
            'unread' => Announcement::where('status', 'published')
                ->where('published_at', '<=', now())
                ->whereDoesntHave('views', function ($query) use ($resident) {
                    $query->where('resident_id', $resident->id);
                })
                ->count(),
            'bookmarked' => count($bookmarkedIds),
            'this_month' => Announcement::where('status', 'published')
                ->where('published_at', '<=', now())
                ->whereMonth('published_at', now()->month)
                ->whereYear('published_at', now()->year)
                ->count(),
        ];
        
        // Get urgent announcements
        $urgentAnnouncements = Announcement::where('status', 'published')
            ->where('published_at', '<=', now())
            ->where('priority', 'high')
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();
        
        return Inertia::render('Resident/Announcements/Index', [
            'announcements' => $announcements,
            'categories' => $categories,
            'stats' => $stats,
            'bookmarkedIds' => $bookmarkedIds,
            'urgentAnnouncements' => $urgentAnnouncements,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }
    
    public function show(Announcement $announcement)
    {
        if ($announcement->status !== 'published' || $announcement->published_at > now()) {
            abort(404);
        }
        
        $resident = auth()->user()->residentProfile;
        
        // Mark as read
        $this->markAsRead($resident, [$announcement->id]);
        
        $announcement->load(['category', 'author', 'attachments']);
        
        // Get related announcements
        $relatedAnnouncements = Announcement::where('status', 'published')
            ->where('published_at', '<=', now())
            ->where('category_id', $announcement->category_id)
            ->where('id', '!=', $announcement->id)
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();
        
        // Check if bookmarked
        $isBookmarked = AnnouncementBookmark::where('resident_id', $resident->id)
            ->where('announcement_id', $announcement->id)
            ->exists();
        
        return Inertia::render('Resident/Announcements/Show', [
            'announcement' => $announcement,
            'relatedAnnouncements' => $relatedAnnouncements,
            'isBookmarked' => $isBookmarked,
        ]);
    }
    
    public function bookmark(Announcement $announcement)
    {
        $resident = auth()->user()->residentProfile;
        
        $bookmark = AnnouncementBookmark::firstOrNew([
            'resident_id' => $resident->id,
            'announcement_id' => $announcement->id,
        ]);
        
        if ($bookmark->exists) {
            $bookmark->delete();
            $action = 'removed';
        } else {
            $bookmark->save();
            $action = 'added';
        }
        
        return back()->with('success', "Announcement {$action} from bookmarks.");
    }
    
    public function subscribe(Request $request)
    {
        $resident = auth()->user()->residentProfile;
        $type = $request->input('type', 'email'); // email or sms
        
        // Update subscription preferences
        $resident->update([
            "{$type}_announcements" => !$resident->{"{$type}_announcements"},
        ]);
        
        $status = $resident->{"{$type}_announcements"} ? 'subscribed' : 'unsubscribed';
        
        return back()->with('success', "Successfully {$status} to {$type} announcements.");
    }
    
    private function markAsRead($resident, $announcementIds)
    {
        $existingViews = AnnouncementView::where('resident_id', $resident->id)
            ->whereIn('announcement_id', $announcementIds)
            ->pluck('announcement_id')
            ->toArray();
        
        $newViews = array_diff($announcementIds, $existingViews);
        
        foreach ($newViews as $announcementId) {
            AnnouncementView::create([
                'resident_id' => $resident->id,
                'announcement_id' => $announcementId,
                'viewed_at' => now(),
            ]);
        }
    }
}