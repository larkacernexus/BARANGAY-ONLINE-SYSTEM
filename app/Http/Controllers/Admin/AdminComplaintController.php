<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminComplaintController extends Controller
{
    public function index(Request $request)
    {
        // Start with base query - get ALL complaints
        $query = Complaint::with(['user:id,first_name,last_name,email,contact_number'])
            ->latest();
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('complaint_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%")
                  ->orWhere('admin_notes', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%");
                  });
            });
        }
        
        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        // Apply type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        // Apply date filters
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from,
                Carbon::parse($request->date_to)->endOfDay()
            ]);
        } elseif ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        } elseif ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Apply custom date range shortcuts
        if ($request->filled('date_range')) {
            $dateRange = $request->date_range;
            switch ($dateRange) {
                case 'today':
                    $query->whereDate('created_at', Carbon::today());
                    break;
                case 'week':
                    $query->where('created_at', '>=', Carbon::now()->subDays(7));
                    break;
                case 'month':
                    $query->where('created_at', '>=', Carbon::now()->subDays(30));
                    break;
            }
        }
        
        // Get unique complaint types for filter dropdown
        $complaintTypes = Complaint::select('type')
            ->distinct()
            ->orderBy('type')
            ->pluck('type')
            ->toArray();
        
        // Calculate statistics
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        $monthAgo = Carbon::today()->subDays(30);
        
        $stats = [
            'total' => Complaint::count(),
            'pending' => Complaint::where('status', 'pending')->count(),
            'under_review' => Complaint::where('status', 'under_review')->count(),
            'resolved' => Complaint::where('status', 'resolved')->count(),
            'dismissed' => Complaint::where('status', 'dismissed')->count(),
            'high_priority' => Complaint::where('priority', 'high')->count(),
            'medium_priority' => Complaint::where('priority', 'medium')->count(),
            'low_priority' => Complaint::where('priority', 'low')->count(),
            'today' => Complaint::whereDate('created_at', $today)->count(),
            'this_week' => Complaint::where('created_at', '>=', $weekAgo)->count(),
            'this_month' => Complaint::where('created_at', '>=', $monthAgo)->count(),
            'anonymous' => Complaint::where('is_anonymous', true)->count(),
        ];
        
        // Get complaints with pagination
        $perPage = $request->get('per_page', 15);
        $complaints = $query->paginate($perPage)->withQueryString();
        
        // Format complaints data
        $formattedComplaints = $complaints->map(function ($complaint) {
            // Get the full name using the accessor from User model
            $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
            
            return [
                'id' => $complaint->id,
                'complaint_number' => $complaint->complaint_number,
                'user_id' => $complaint->user_id,
                'user' => $complaint->user ? [
                    'id' => $complaint->user->id,
                    'first_name' => $complaint->user->first_name,
                    'last_name' => $complaint->user->last_name,
                    'full_name' => $fullName,
                    'email' => $complaint->user->email,
                    'phone' => $complaint->user->contact_number, // Changed from phone to contact_number
                ] : null,
                'type' => $complaint->type,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'location' => $complaint->location,
                'incident_date' => $complaint->incident_date?->format('Y-m-d H:i:s'),
                'priority' => $complaint->priority,
                'status' => $complaint->status,
                'is_anonymous' => $complaint->is_anonymous,
                'evidence_files' => $complaint->evidence_files,
                'admin_notes' => $complaint->admin_notes,
                'resolved_at' => $complaint->resolved_at?->format('Y-m-d H:i:s'),
                'created_at' => $complaint->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $complaint->updated_at->format('Y-m-d H:i:s'),
                'priority_color' => $complaint->priority_color,
                'status_color' => $complaint->status_color,
            ];
        });
        
        return Inertia::render('admin/Complaints/Index', [
            'complaints' => $formattedComplaints,
            'pagination' => [
                'current_page' => $complaints->currentPage(),
                'last_page' => $complaints->lastPage(),
                'per_page' => $complaints->perPage(),
                'total' => $complaints->total(),
                'from' => $complaints->firstItem(),
                'to' => $complaints->lastItem(),
            ],
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'priority', 'type', 'date_from', 'date_to', 'date_range']),
            'complaint_types' => $complaintTypes,
        ]);
    }
    
    public function show(Complaint $complaint)
    {
        // Load complaint with user details and any related data
        $complaint->load(['user:id,first_name,last_name,email,contact_number,address']);
        
        // Get similar complaints (same type or location)
        $similarComplaints = Complaint::where(function ($query) use ($complaint) {
                $query->where('type', $complaint->type)
                      ->orWhere('location', 'like', "%{$complaint->location}%");
            })
            ->where('id', '!=', $complaint->id)
            ->where('status', '!=', 'resolved')
            ->with('user:id,first_name,last_name')
            ->latest()
            ->limit(5)
            ->get();
        
        // Format similar complaints
        $formattedSimilarComplaints = $similarComplaints->map(function ($similarComplaint) {
            $fullName = $similarComplaint->user ? $similarComplaint->user->first_name . ' ' . $similarComplaint->user->last_name : null;
            
            return [
                'id' => $similarComplaint->id,
                'complaint_number' => $similarComplaint->complaint_number,
                'subject' => $similarComplaint->subject,
                'type' => $similarComplaint->type,
                'status' => $similarComplaint->status,
                'priority' => $similarComplaint->priority,
                'created_at' => $similarComplaint->created_at->format('Y-m-d H:i:s'),
                'user' => $similarComplaint->user ? [
                    'id' => $similarComplaint->user->id,
                    'name' => $fullName,
                ] : null,
            ];
        });
        
        // Get full name for the main complaint
        $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
        
        return Inertia::render('Admin/Complaints/Show', [
            'complaint' => [
                'id' => $complaint->id,
                'complaint_number' => $complaint->complaint_number,
                'user' => $complaint->user ? [
                    'id' => $complaint->user->id,
                    'first_name' => $complaint->user->first_name,
                    'last_name' => $complaint->user->last_name,
                    'full_name' => $fullName,
                    'email' => $complaint->user->email,
                    'phone' => $complaint->user->contact_number, // Changed from phone to contact_number
                    'address' => $complaint->user->address,
                ] : null,
                'type' => $complaint->type,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'location' => $complaint->location,
                'incident_date' => $complaint->incident_date?->format('Y-m-d H:i:s'),
                'priority' => $complaint->priority,
                'status' => $complaint->status,
                'is_anonymous' => $complaint->is_anonymous,
                'evidence_files' => $complaint->evidence_files,
                'admin_notes' => $complaint->admin_notes,
                'resolved_at' => $complaint->resolved_at?->format('Y-m-d H:i:s'),
                'created_at' => $complaint->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $complaint->updated_at->format('Y-m-d H:i:s'),
                'priority_color' => $complaint->priority_color,
                'status_color' => $complaint->status_color,
            ],
            'similar_complaints' => $formattedSimilarComplaints,
        ]);
    }
    
    public function edit(Complaint $complaint)
    {
        $complaint->load(['user:id,first_name,last_name,email,contact_number']);
        
        // Get full name
        $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
        
        return Inertia::render('Admin/Complaints/Edit', [
            'complaint' => [
                'id' => $complaint->id,
                'complaint_number' => $complaint->complaint_number,
                'user' => $complaint->user ? [
                    'id' => $complaint->user->id,
                    'first_name' => $complaint->user->first_name,
                    'last_name' => $complaint->user->last_name,
                    'full_name' => $fullName,
                    'email' => $complaint->user->email,
                    'phone' => $complaint->user->contact_number, // Changed from phone to contact_number
                ] : null,
                'type' => $complaint->type,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'location' => $complaint->location,
                'incident_date' => $complaint->incident_date?->format('Y-m-d'),
                'priority' => $complaint->priority,
                'status' => $complaint->status,
                'is_anonymous' => $complaint->is_anonymous,
                'evidence_files' => $complaint->evidence_files,
                'admin_notes' => $complaint->admin_notes,
                'resolved_at' => $complaint->resolved_at?->format('Y-m-d'),
            ],
        ]);
    }
    
    public function update(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'type' => 'sometimes|string|max:100',
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string|max:255',
            'incident_date' => 'sometimes|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,under_review,resolved,dismissed',
            'admin_notes' => 'nullable|string',
            'resolved_at' => 'nullable|date',
        ]);
        
        // If marking as resolved, set resolved_at if not already set
        if ($request->status === 'resolved' && $complaint->status !== 'resolved') {
            $validated['resolved_at'] = now();
        }
        
        // If changing from resolved to another status, clear resolved_at
        if ($complaint->status === 'resolved' && $request->status !== 'resolved') {
            $validated['resolved_at'] = null;
        }
        
        $complaint->update($validated);
        
        return redirect()->route('admin.complaints.show', $complaint)
            ->with('success', 'Complaint updated successfully.');
    }
    
    public function destroy(Complaint $complaint)
    {
        $complaint->delete();
        
        return redirect()->route('admin.complaints.index')
            ->with('success', 'Complaint deleted successfully.');
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'complaint_ids' => 'required|array',
            'complaint_ids.*' => 'exists:complaints,id',
            'action' => 'required|in:mark_resolved,mark_under_review,mark_pending,delete,export',
        ]);
        
        switch ($request->action) {
            case 'mark_resolved':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'resolved',
                        'resolved_at' => now(),
                    ]);
                $message = 'Selected complaints marked as resolved.';
                break;
                
            case 'mark_under_review':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'under_review',
                        'resolved_at' => null,
                    ]);
                $message = 'Selected complaints marked as under review.';
                break;
                
            case 'mark_pending':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'pending',
                        'resolved_at' => null,
                    ]);
                $message = 'Selected complaints marked as pending.';
                break;
                
            case 'delete':
                Complaint::whereIn('id', $request->complaint_ids)->delete();
                $message = 'Selected complaints deleted.';
                break;
                
            case 'export':
                // Handle export logic here
                $message = 'Export initiated.';
                break;
        }
        
        return response()->json([
            'message' => $message,
            'count' => count($request->complaint_ids),
        ]);
    }
    
    public function dashboardStats()
    {
        // Get stats for dashboard
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        
        return response()->json([
            'total' => Complaint::count(),
            'pending' => Complaint::where('status', 'pending')->count(),
            'under_review' => Complaint::where('status', 'under_review')->count(),
            'resolved' => Complaint::where('status', 'resolved')->count(),
            'high_priority' => Complaint::where('priority', 'high')->count(),
            'today' => Complaint::whereDate('created_at', $today)->count(),
            'this_week' => Complaint::where('created_at', '>=', $weekAgo)->count(),
        ]);
    }
}