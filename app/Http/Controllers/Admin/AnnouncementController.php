<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(Request $request)
    {
        $query = Announcement::query();
        
        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by status
        if ($request->filled('status')) {
            if ($request->status == 'active') {
                $query->where('is_active', true);
            } elseif ($request->status == 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        
        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $announcements = $query->paginate(15)->withQueryString();
        
        // Transform data for frontend
        $announcements->getCollection()->transform(function ($announcement) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'type' => $announcement->type,
                'type_label' => $announcement->getTypes()[$announcement->type] ?? $announcement->type,
                'priority' => $announcement->priority,
                'priority_label' => $announcement->getPriorityOptions()[$announcement->priority] ?? 'Normal',
                'is_active' => $announcement->is_active,
                'start_date' => $announcement->start_date,
                'start_time' => $announcement->start_time,
                'end_date' => $announcement->end_date,
                'end_time' => $announcement->end_time,
                'created_at' => $announcement->created_at,
                'updated_at' => $announcement->updated_at,
                'is_currently_active' => $announcement->isCurrentlyActive(),
                'days_remaining' => $announcement->end_date ? 
                    now()->diffInDays($announcement->end_date, false) : null,
            ];
        });
        
        // Stats
        $stats = [
            'total' => Announcement::count(),
            'active' => Announcement::where('is_active', true)->count(),
            'expired' => Announcement::where('end_date', '<', now())->count(),
            'upcoming' => Announcement::where('start_date', '>', now())->count(),
        ];
        
        return Inertia::render('admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'type', 'status', 'from_date', 'to_date']),
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
            'stats' => $stats,
        ]);
    }
    
    /**
     * Show the form for creating a new announcement.
     */
    public function create()
    {
        return Inertia::render('admin/Announcements/Create', [
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
        ]);
    }
    
    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,important,event,maintenance,other',
            'priority' => 'required|integer|min:0|max:4',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'end_time' => 'nullable|date_format:H:i',
        ]);
        
        $announcement = Announcement::create($validated);
        
        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }
    
    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Show', [
            'announcement' => $announcement,
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
        ]);
    }
    
    /**
     * Show the form for editing the announcement.
     */
    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $announcement,
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
        ]);
    }
    
    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,important,event,maintenance,other',
            'priority' => 'required|integer|min:0|max:4',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'end_time' => 'nullable|date_format:H:i',
        ]);
        
        $announcement->update($validated);
        
        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }
    
    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        
        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }
    
    /**
     * Handle bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate,publish,archive',
            'announcement_ids' => 'required|array',
            'announcement_ids.*' => 'exists:announcements,id',
        ]);
        
        $action = $request->action;
        $ids = $request->announcement_ids;
        
        switch ($action) {
            case 'delete':
                Announcement::whereIn('id', $ids)->delete();
                $message = count($ids) . ' announcement(s) deleted successfully.';
                break;
                
            case 'activate':
                Announcement::whereIn('id', $ids)->update(['is_active' => true]);
                $message = count($ids) . ' announcement(s) activated successfully.';
                break;
                
            case 'deactivate':
                Announcement::whereIn('id', $ids)->update(['is_active' => false]);
                $message = count($ids) . ' announcement(s) deactivated successfully.';
                break;
                
            case 'publish':
                Announcement::whereIn('id', $ids)->update([
                    'is_active' => true,
                    'start_date' => now(),
                    'start_time' => now()->format('H:i'),
                ]);
                $message = count($ids) . ' announcement(s) published successfully.';
                break;
                
            case 'archive':
                Announcement::whereIn('id', $ids)->update([
                    'end_date' => now(),
                    'end_time' => now()->format('H:i'),
                ]);
                $message = count($ids) . ' announcement(s) archived successfully.';
                break;
        }
        
        return back()->with('success', $message);
    }
    
    /**
     * Toggle announcement status
     */
    public function toggleStatus(Announcement $announcement)
    {
        $announcement->update(['is_active' => !$announcement->is_active]);
        
        return back()->with('success', 'Announcement status updated successfully.');
    }
    
    /**
     * Export announcements
     */
    public function export(Request $request)
    {
        // You can implement CSV/Excel export here
        // For now, return a response that triggers download
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}