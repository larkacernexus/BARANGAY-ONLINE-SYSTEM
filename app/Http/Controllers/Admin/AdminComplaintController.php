<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

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
            ->whereNotNull('type')
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
        
        // Format complaints data with null-safe operations
        $formattedComplaints = $complaints->map(function ($complaint) {
            // Get the full name using the accessor from User model
            $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
            
            return [
                'id' => $complaint->id,
                'complaint_number' => $complaint->complaint_number ?? 'N/A',
                'user_id' => $complaint->user_id,
                'user' => $complaint->user ? [
                    'id' => $complaint->user->id,
                    'first_name' => $complaint->user->first_name,
                    'last_name' => $complaint->user->last_name,
                    'full_name' => $fullName,
                    'email' => $complaint->user->email,
                    'phone' => $complaint->user->contact_number,
                ] : null,
                'type' => $complaint->type,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'location' => $complaint->location,
                'incident_date' => $complaint->incident_date ? $complaint->incident_date->format('Y-m-d H:i:s') : null,
                'priority' => $complaint->priority,
                'status' => $complaint->status,
                'is_anonymous' => (bool) $complaint->is_anonymous,
                'evidence_files' => $complaint->evidence_files ?? [],
                'admin_notes' => $complaint->admin_notes,
                'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('Y-m-d H:i:s') : null,
                'created_at' => $complaint->created_at ? $complaint->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $complaint->updated_at ? $complaint->updated_at->format('Y-m-d H:i:s') : null,
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
        // Load complaint with user details
        $complaint->load(['user:id,first_name,last_name,email,contact_number,address']);
        
        // Get complaint number for logging
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        
        // Log the view activity
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'complaint_number' => $complaintNumber,
            ])
            ->event('viewed')
            ->log("Viewed complaint #{$complaintNumber}");
        
        // Get activity logs for this complaint
        $activityLogs = Activity::where(function($query) use ($complaint) {
                $query->where('subject_type', Complaint::class)
                    ->where('subject_id', $complaint->id);
            })
            ->orWhere('description', 'like', "%complaint #{$complaintNumber}%")
            ->orWhere('description', 'like', "%complaint_id:{$complaint->id}%")
            ->with(['causer:id,first_name,last_name'])
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($log) {
                $userName = $log->causer ? $log->causer->first_name . ' ' . $log->causer->last_name : 'System';
                
                return [
                    'id' => $log->id,
                    'user_id' => $log->causer_id,
                    'user_name' => $userName,
                    'action' => $log->event,
                    'details' => $log->description,
                    'changes' => $log->changes ?? [],
                    'created_at' => $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : null,
                ];
            });
        
        // Get similar complaints (same type or location)
        $similarComplaints = Complaint::where('id', '!=', $complaint->id)
            ->where('status', '!=', 'resolved')
            ->where(function ($query) use ($complaint) {
                if ($complaint->type) {
                    $query->orWhere('type', $complaint->type);
                }
                if ($complaint->location) {
                    $query->orWhere('location', 'like', "%{$complaint->location}%");
                }
            })
            ->with('user:id,first_name,last_name')
            ->latest()
            ->limit(5)
            ->get();
        
        // Format similar complaints
        $formattedSimilarComplaints = $similarComplaints->map(function ($similarComplaint) {
            $fullName = $similarComplaint->user ? $similarComplaint->user->first_name . ' ' . $similarComplaint->user->last_name : null;
            
            return [
                'id' => $similarComplaint->id,
                'complaint_number' => $similarComplaint->complaint_number ?? 'N/A',
                'subject' => $similarComplaint->subject,
                'type' => $similarComplaint->type,
                'status' => $similarComplaint->status,
                'priority' => $similarComplaint->priority,
                'created_at' => $similarComplaint->created_at ? $similarComplaint->created_at->format('Y-m-d H:i:s') : null,
                'user' => $similarComplaint->user ? [
                    'id' => $similarComplaint->user->id,
                    'name' => $fullName,
                ] : null,
            ];
        });
        
        // Get full name for the main complaint
        $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
        
        // Prepare complaint data with null-safe operations
        $complaintData = [
            'id' => $complaint->id,
            'complaint_number' => $complaintNumber,
            'user_id' => $complaint->user_id,
            'user' => $complaint->user ? [
                'id' => $complaint->user->id,
                'first_name' => $complaint->user->first_name,
                'last_name' => $complaint->user->last_name,
                'full_name' => $fullName,
                'email' => $complaint->user->email,
                'phone' => $complaint->user->contact_number,
                'address' => $complaint->user->address,
            ] : null,
            'type' => $complaint->type,
            'subject' => $complaint->subject,
            'description' => $complaint->description,
            'location' => $complaint->location,
            'incident_date' => $complaint->incident_date ? $complaint->incident_date->format('Y-m-d H:i:s') : null,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'is_anonymous' => (bool) $complaint->is_anonymous,
            'evidence_files' => $complaint->evidence_files ?? [],
            'admin_notes' => $complaint->admin_notes,
            'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('Y-m-d H:i:s') : null,
            'created_at' => $complaint->created_at ? $complaint->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $complaint->updated_at ? $complaint->updated_at->format('Y-m-d H:i:s') : null,
            'priority_color' => $complaint->priority_color,
            'status_color' => $complaint->status_color,
        ];
        
        return Inertia::render('admin/Complaints/Show', [
            'complaint' => $complaintData,
            'similar_complaints' => $formattedSimilarComplaints,
            'activity_logs' => $activityLogs,
            'statuses' => ['pending', 'under_review', 'resolved', 'dismissed'],
            'priorities' => ['low', 'medium', 'high'],
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
                'complaint_number' => $complaint->complaint_number ?? 'N/A',
                'user' => $complaint->user ? [
                    'id' => $complaint->user->id,
                    'first_name' => $complaint->user->first_name,
                    'last_name' => $complaint->user->last_name,
                    'full_name' => $fullName,
                    'email' => $complaint->user->email,
                    'phone' => $complaint->user->contact_number,
                ] : null,
                'type' => $complaint->type,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'location' => $complaint->location,
                'incident_date' => $complaint->incident_date ? $complaint->incident_date->format('Y-m-d') : null,
                'priority' => $complaint->priority,
                'status' => $complaint->status,
                'is_anonymous' => (bool) $complaint->is_anonymous,
                'evidence_files' => $complaint->evidence_files ?? [],
                'admin_notes' => $complaint->admin_notes,
                'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('Y-m-d') : null,
            ],
            'statuses' => ['pending', 'under_review', 'resolved', 'dismissed'],
            'priorities' => ['low', 'medium', 'high'],
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
        
        // Store old values for logging
        $oldValues = $complaint->getAttributes();
        
        // Handle resolved_at timestamp
        if (isset($validated['status']) && $validated['status'] === 'resolved' && $complaint->status !== 'resolved') {
            $validated['resolved_at'] = now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'resolved') {
            $validated['resolved_at'] = null;
        }
        
        // Track changes for logging
        $changes = [];
        foreach ($validated as $key => $value) {
            if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
                $changes[$key] = [
                    'from' => $oldValues[$key],
                    'to' => $value
                ];
            }
        }
        
        $complaint->update($validated);
        
        // Log the update activity
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        if (!empty($changes)) {
            activity()
                ->on($complaint)
                ->by(Auth::user())
                ->withProperties([
                    'changes' => $changes,
                    'ip' => request()->ip(),
                    'complaint_number' => $complaintNumber,
                ])
                ->event('updated')
                ->log("Updated complaint #{$complaintNumber}");
        }
        
        return redirect()->route('admin.complaints.show', $complaint)
            ->with('success', 'Complaint updated successfully.');
    }
    
    public function destroy(Complaint $complaint)
    {
        // Store complaint info for logging
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        $complaintSubject = $complaint->subject ?? 'N/A';
        
        // Delete associated files
        if ($complaint->evidence_files) {
            foreach ($complaint->evidence_files as $file) {
                if (Storage::exists($file)) {
                    Storage::delete($file);
                }
            }
        }
        
        // Log the deletion
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'complaint_number' => $complaintNumber,
                'subject' => $complaintSubject,
                'ip' => request()->ip(),
            ])
            ->event('deleted')
            ->log("Deleted complaint #{$complaintNumber}");
        
        $complaint->delete();
        
        return redirect()->route('admin.complaints.index')
            ->with('success', 'Complaint deleted successfully.');
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'complaint_ids' => 'required|array',
            'complaint_ids.*' => 'exists:complaints,id',
            'action' => 'required|in:mark_resolved,mark_under_review,mark_pending,delete,export,change_priority',
        ]);
        
        $count = count($request->complaint_ids);
        $complaints = Complaint::whereIn('id', $request->complaint_ids)->get();
        
        switch ($request->action) {
            case 'mark_resolved':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'resolved',
                        'resolved_at' => now(),
                    ]);
                    
                // Log bulk action
                foreach ($complaints as $complaint) {
                    $complaintNumber = $complaint->complaint_number ?? 'N/A';
                    activity()
                        ->on($complaint)
                        ->by(Auth::user())
                        ->withProperties([
                            'ip' => request()->ip(),
                            'bulk_action' => true,
                        ])
                        ->event('status_updated')
                        ->log("Marked complaint #{$complaintNumber} as resolved (bulk action)");
                }
                
                $message = "{$count} complaint(s) marked as resolved.";
                break;
                
            case 'mark_under_review':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'under_review',
                        'resolved_at' => null,
                    ]);
                    
                // Log bulk action
                foreach ($complaints as $complaint) {
                    $complaintNumber = $complaint->complaint_number ?? 'N/A';
                    activity()
                        ->on($complaint)
                        ->by(Auth::user())
                        ->withProperties([
                            'ip' => request()->ip(),
                            'bulk_action' => true,
                        ])
                        ->event('status_updated')
                        ->log("Marked complaint #{$complaintNumber} as under review (bulk action)");
                }
                
                $message = "{$count} complaint(s) marked as under review.";
                break;
                
            case 'mark_pending':
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update([
                        'status' => 'pending',
                        'resolved_at' => null,
                    ]);
                    
                // Log bulk action
                foreach ($complaints as $complaint) {
                    $complaintNumber = $complaint->complaint_number ?? 'N/A';
                    activity()
                        ->on($complaint)
                        ->by(Auth::user())
                        ->withProperties([
                            'ip' => request()->ip(),
                            'bulk_action' => true,
                        ])
                        ->event('status_updated')
                        ->log("Marked complaint #{$complaintNumber} as pending (bulk action)");
                }
                
                $message = "{$count} complaint(s) marked as pending.";
                break;
                
            case 'delete':
                // Delete evidence files for each complaint
                foreach ($complaints as $complaint) {
                    if ($complaint->evidence_files) {
                        foreach ($complaint->evidence_files as $file) {
                            if (Storage::exists($file)) {
                                Storage::delete($file);
                            }
                        }
                    }
                    
                    // Log each deletion
                    $complaintNumber = $complaint->complaint_number ?? 'N/A';
                    $complaintSubject = $complaint->subject ?? 'N/A';
                    activity()
                        ->on($complaint)
                        ->by(Auth::user())
                        ->withProperties([
                            'complaint_number' => $complaintNumber,
                            'subject' => $complaintSubject,
                            'ip' => request()->ip(),
                            'bulk_action' => true,
                        ])
                        ->event('deleted')
                        ->log("Deleted complaint #{$complaintNumber} (bulk action)");
                }
                
                Complaint::whereIn('id', $request->complaint_ids)->delete();
                $message = "{$count} complaint(s) deleted.";
                break;
                
            case 'change_priority':
                $request->validate([
                    'priority' => 'required|in:low,medium,high',
                ]);
                
                Complaint::whereIn('id', $request->complaint_ids)
                    ->update(['priority' => $request->priority]);
                    
                // Log bulk action
                foreach ($complaints as $complaint) {
                    $complaintNumber = $complaint->complaint_number ?? 'N/A';
                    activity()
                        ->on($complaint)
                        ->by(Auth::user())
                        ->withProperties([
                            'priority' => $request->priority,
                            'ip' => request()->ip(),
                            'bulk_action' => true,
                        ])
                        ->event('priority_updated')
                        ->log("Changed complaint #{$complaintNumber} priority to {$request->priority} (bulk action)");
                }
                
                $message = "{$count} complaint(s) priority changed to {$request->priority}.";
                break;
                
            case 'export':
                // Handle export logic here
                $message = 'Export initiated.';
                break;
        }
        
        return response()->json([
            'message' => $message,
            'count' => $count,
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
    
    /**
     * Upload evidence files for complaint.
     */
    public function uploadEvidence(Request $request, Complaint $complaint)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt',
        ]);
        
        $uploadedFiles = [];
        
        foreach ($request->file('files') as $file) {
            $path = $file->store('complaints/evidence', 'public');
            $uploadedFiles[] = $path;
        }
        
        // Merge with existing files
        $existingFiles = $complaint->evidence_files ?? [];
        $allFiles = array_merge($existingFiles, $uploadedFiles);
        
        $complaint->update(['evidence_files' => $allFiles]);
        
        // Log the upload
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'file_count' => count($uploadedFiles),
                'ip' => request()->ip(),
                'complaint_number' => $complaintNumber,
            ])
            ->event('evidence_uploaded')
            ->log("Uploaded evidence files for complaint #{$complaintNumber}");
        
        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
            'message' => 'Files uploaded successfully.',
        ]);
    }
    
    /**
     * Remove evidence file from complaint.
     */
    public function removeEvidence(Complaint $complaint, $fileIndex)
    {
        $files = $complaint->evidence_files ?? [];
        
        if (isset($files[$fileIndex])) {
            $fileToRemove = $files[$fileIndex];
            
            // Remove from storage
            if (Storage::exists($fileToRemove)) {
                Storage::delete($fileToRemove);
            }
            
            // Remove from array
            unset($files[$fileIndex]);
            $files = array_values($files); // Reindex array
            
            $complaint->update(['evidence_files' => $files]);
            
            // Log the removal
            $complaintNumber = $complaint->complaint_number ?? 'N/A';
            activity()
                ->on($complaint)
                ->by(Auth::user())
                ->withProperties([
                    'file_index' => $fileIndex,
                    'ip' => request()->ip(),
                    'complaint_number' => $complaintNumber,
                ])
                ->event('evidence_removed')
                ->log("Removed evidence file from complaint #{$complaintNumber}");
            
            return response()->json([
                'success' => true,
                'message' => 'File removed successfully.',
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'File not found.',
        ], 404);
    }
    
    /**
     * Generate printable version of complaint.
     */
    public function print(Complaint $complaint)
    {
        $complaint->load(['user']);
        
        // Log the print action
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'complaint_number' => $complaintNumber,
            ])
            ->event('printed')
            ->log("Printed complaint #{$complaintNumber}");
        
        return Inertia::render('Admin/Complaints/Print', [
            'complaint' => $this->formatComplaintForPrint($complaint),
            'print_date' => now()->format('F d, Y'),
        ]);
    }
    
    /**
     * Generate PDF version of complaint.
     */
    public function pdf(Complaint $complaint)
    {
        $complaint->load(['user']);
        
        // Log the PDF download
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'complaint_number' => $complaintNumber,
            ])
            ->event('pdf_downloaded')
            ->log("Downloaded PDF for complaint #{$complaintNumber}");
        
        $pdf = Pdf::loadView('admin.complaints.pdf', [
            'complaint' => $this->formatComplaintForPrint($complaint),
            'print_date' => now()->format('F d, Y'),
        ]);
        
        return $pdf->download("complaint-{$complaintNumber}.pdf");
    }
    
    /**
     * Send response to complainant.
     */
    public function sendResponse(Request $request, Complaint $complaint)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'send_email' => 'boolean',
            'send_sms' => 'boolean',
            'is_public' => 'boolean',
        ]);
        
        // Log the response
        $complaintNumber = $complaint->complaint_number ?? 'N/A';
        activity()
            ->on($complaint)
            ->by(Auth::user())
            ->withProperties([
                'subject' => $request->subject,
                'message' => $request->message,
                'channels' => $this->getSentVia($request),
                'is_public' => $request->boolean('is_public', false),
                'ip' => request()->ip(),
                'complaint_number' => $complaintNumber,
            ])
            ->event('response_sent')
            ->log("Sent response for complaint #{$complaintNumber}");
        
        return redirect()
            ->route('admin.complaints.show', $complaint)
            ->with('success', 'Response sent successfully.');
    }
    
    /**
     * Export complaints to CSV.
     */
    public function export(Request $request)
    {
        $query = Complaint::with(['user']);
        
        // Apply filters if provided
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from,
                Carbon::parse($request->date_to)->endOfDay()
            ]);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $complaints = $query->get();
        
        $csvData = "Complaint Number,Subject,Type,Status,Priority,Resident Name,Location,Incident Date,Created At,Resolved At\n";
        
        foreach ($complaints as $complaint) {
            $residentName = $complaint->is_anonymous ? 'Anonymous' : 
                          ($complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : 'N/A');
            
            $csvData .= "\"" . ($complaint->complaint_number ?? 'N/A') . "\","
                . "\"" . str_replace('"', '""', $complaint->subject ?? '') . "\","
                . "\"" . $complaint->type . "\","
                . "\"" . $complaint->status . "\","
                . "\"" . $complaint->priority . "\","
                . "\"" . str_replace('"', '""', $residentName) . "\","
                . "\"" . str_replace('"', '""', $complaint->location ?? '') . "\","
                . "\"" . ($complaint->incident_date ? $complaint->incident_date->format('Y-m-d') : '') . "\","
                . "\"" . ($complaint->created_at ? $complaint->created_at->format('Y-m-d H:i:s') : '') . "\","
                . "\"" . ($complaint->resolved_at ? $complaint->resolved_at->format('Y-m-d H:i:s') : '') . "\"\n";
        }
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="complaints_' . date('Y-m-d_H-i') . '.csv"',
        ];
        
        return response()->make($csvData, 200, $headers);
    }
    
    /**
     * Get statistics for dashboard.
     */
    public function statistics()
    {
        $stats = [
            'total' => Complaint::count(),
            'pending' => Complaint::where('status', 'pending')->count(),
            'under_review' => Complaint::where('status', 'under_review')->count(),
            'resolved' => Complaint::where('status', 'resolved')->count(),
            'dismissed' => Complaint::where('status', 'dismissed')->count(),
            'high_priority' => Complaint::where('priority', 'high')->count(),
            'this_month' => Complaint::whereMonth('created_at', date('m'))->count(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
        ];
        
        return response()->json($stats);
    }
    
    /**
     * Get related complaints.
     */
    public function related(Complaint $complaint)
    {
        $relatedComplaints = Complaint::where('id', '!=', $complaint->id)
            ->where(function($query) use ($complaint) {
                // Same user (if not anonymous)
                if (!$complaint->is_anonymous && $complaint->user_id) {
                    $query->orWhere('user_id', $complaint->user_id);
                }
                
                // Same location
                if ($complaint->location) {
                    $query->orWhere('location', 'LIKE', "%{$complaint->location}%");
                }
                
                // Same type
                if ($complaint->type) {
                    $query->orWhere('type', $complaint->type);
                }
                
                // Similar subject/description
                if ($complaint->subject) {
                    $keywords = explode(' ', $complaint->subject);
                    foreach ($keywords as $keyword) {
                        if (strlen($keyword) > 3) {
                            $query->orWhere('subject', 'LIKE', "%{$keyword}%");
                            $query->orWhere('description', 'LIKE', "%{$keyword}%");
                        }
                    }
                }
            })
            ->with(['user'])
            ->limit(10)
            ->get();
        
        return Inertia::render('Admin/Complaints/Related', [
            'complaint' => $complaint,
            'related_complaints' => $relatedComplaints,
        ]);
    }
    
    /**
     * Helper: Get sent via channels.
     */
    private function getSentVia(Request $request): string
    {
        $channels = [];
        
        if ($request->boolean('send_email')) $channels[] = 'email';
        if ($request->boolean('send_sms')) $channels[] = 'sms';
        
        return empty($channels) ? 'internal' : implode(', ', $channels);
    }
    
    /**
     * Helper: Calculate average resolution time.
     */
    private function getAverageResolutionTime(): string
    {
        $resolvedComplaints = Complaint::whereNotNull('resolved_at')
            ->whereNotNull('created_at')
            ->get();
        
        if ($resolvedComplaints->isEmpty()) {
            return 'N/A';
        }
        
        $totalHours = 0;
        foreach ($resolvedComplaints as $complaint) {
            $created = Carbon::parse($complaint->created_at);
            $resolved = Carbon::parse($complaint->resolved_at);
            $totalHours += $resolved->diffInHours($created);
        }
        
        $avgHours = $totalHours / $resolvedComplaints->count();
        
        if ($avgHours < 24) {
            return round($avgHours) . ' hours';
        } else {
            return round($avgHours / 24, 1) . ' days';
        }
    }
    
    /**
     * Helper: Format complaint for print/PDF.
     */
    private function formatComplaintForPrint(Complaint $complaint): array
    {
        $fullName = $complaint->user ? $complaint->user->first_name . ' ' . $complaint->user->last_name : null;
        
        return [
            'id' => $complaint->id,
            'complaint_number' => $complaint->complaint_number ?? 'N/A',
            'user' => $complaint->user ? [
                'name' => $fullName,
                'email' => $complaint->user->email,
                'phone' => $complaint->user->contact_number,
                'address' => $complaint->user->address,
            ] : null,
            'type' => $complaint->type,
            'subject' => $complaint->subject,
            'description' => $complaint->description,
            'location' => $complaint->location,
            'incident_date' => $complaint->incident_date ? $complaint->incident_date->format('F d, Y') : null,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'is_anonymous' => (bool) $complaint->is_anonymous,
            'admin_notes' => $complaint->admin_notes,
            'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('F d, Y') : null,
            'created_at' => $complaint->created_at ? $complaint->created_at->format('F d, Y') : null,
        ];
    }
}