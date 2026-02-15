<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintEvidence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\ReportType;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::where('user_id', Auth::id());

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('complaint_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $complaints = $query->withCount('evidences')
                           ->latest()
                           ->paginate(10);

        // Calculate statistics
        $stats = [
            'total' => Complaint::where('user_id', Auth::id())->count(),
            'resolved' => Complaint::where('user_id', Auth::id())
                ->where('status', 'resolved')
                ->count(),
            'in_progress' => Complaint::where('user_id', Auth::id())
                ->whereIn('status', ['under_review'])
                ->count(),
            'pending' => Complaint::where('user_id', Auth::id())
                ->where('status', 'pending')
                ->count(),
            'by_type' => Complaint::where('user_id', Auth::id())
                ->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        return inertia('resident/Complaints/Index', [
            'complaints' => $complaints,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'priority', 'type']),
        ]);
    }

    public function create()
    {
        $reportType = ReportType::active()
            ->orderBy('priority_level')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('resident/Complaints/Create', [
            'reportTypes' => $reportType,
        ]);
    }
    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'location' => 'required|string|max:500',
            'incident_date' => 'nullable|date|before_or_equal:today',
            'priority' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi'
        ]);

        // Create the complaint first
        $complaint = Complaint::create([
            'user_id' => Auth::id(),
            'type' => $validated['type'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'incident_date' => $validated['incident_date'],
            'priority' => $validated['priority'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'status' => 'pending'
        ]);

        // Handle file uploads and store in complaint_evidences table
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
                $path = $file->storeAs('complaints/evidence', $filename, 'public');
                
                ComplaintEvidence::create([
                    'complaint_id' => $complaint->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }

        return redirect()->route('my.complaints.show', $complaint->id)
            ->with('success', 'Complaint submitted successfully! Complaint Number: ' . $complaint->complaint_number);
    }

    public function show(Complaint $complaint)
    {
        // Authorization check - ensure user owns the complaint
        if ($complaint->user_id !== Auth::id()) {
            abort(403);
        }

        // Load complaint with evidences
        $complaint->load('evidences');

        // Transform evidences to include URLs and file info
        $complaint->evidences->transform(function ($evidence) {
            $evidence->file_url = $evidence->file_url;
            $evidence->is_image = $evidence->is_image;
            $evidence->formatted_size = $this->formatBytes($evidence->file_size);
            return $evidence;
        });

        return inertia('resident/Complaints/Show', [
            'complaint' => $complaint,
            'canEdit' => $complaint->user_id === Auth::id() && $complaint->status === 'pending',
            'reportTypes' => $this->getReportTypes()
        ]);
    }

    public function update(Request $request, Complaint $complaint)
    {
        // Authorization check
        if ($complaint->user_id !== Auth::id() || $complaint->status !== 'pending') {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'location' => 'required|string|max:500',
            'incident_date' => 'nullable|date|before_or_equal:today',
            'priority' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            'remove_evidence' => 'nullable|array',
            'remove_evidence.*' => 'exists:complaint_evidences,id'
        ]);

        // Update complaint details
        $complaint->update([
            'type' => $validated['type'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'incident_date' => $validated['incident_date'],
            'priority' => $validated['priority'],
            'is_anonymous' => $validated['is_anonymous'] ?? $complaint->is_anonymous
        ]);

        // Handle removal of existing evidence
        if (!empty($validated['remove_evidence'])) {
            foreach ($validated['remove_evidence'] as $evidenceId) {
                $evidence = ComplaintEvidence::findOrFail($evidenceId);
                
                // Ensure the evidence belongs to this complaint
                if ($evidence->complaint_id === $complaint->id) {
                    Storage::disk('public')->delete($evidence->file_path);
                    $evidence->delete();
                }
            }
        }

        // Handle new file uploads
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
                $path = $file->storeAs('complaints/evidence', $filename, 'public');
                
                ComplaintEvidence::create([
                    'complaint_id' => $complaint->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id()
                ]);
            }
        }

        return back()->with('success', 'Complaint updated successfully!');
    }

    public function destroy(Complaint $complaint)
    {
        // Authorization check
        if ($complaint->user_id !== Auth::id() || $complaint->status !== 'pending') {
            abort(403);
        }

        // Delete all associated evidence files
        foreach ($complaint->evidences as $evidence) {
            Storage::disk('public')->delete($evidence->file_path);
            $evidence->delete();
        }

        // Delete the complaint
        $complaint->delete();

        return redirect()->route('my.complaints.index')
            ->with('success', 'Complaint deleted successfully!');
    }

    public function addEvidence(Request $request, Complaint $complaint)
    {
        // Authorization check
        if ($complaint->user_id !== Auth::id() || $complaint->status !== 'pending') {
            abort(403);
        }

        $validated = $request->validate([
            'evidence' => 'required|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            'notes' => 'nullable|string|max:500'
        ]);

        foreach ($request->file('evidence') as $file) {
            $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $path = $file->storeAs('complaints/evidence', $filename, 'public');
            
            ComplaintEvidence::create([
                'complaint_id' => $complaint->id,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null
            ]);
        }

        return back()->with('success', 'Evidence added successfully!');
    }

    public function deleteEvidence(Complaint $complaint, ComplaintEvidence $evidence)
    {
        // Authorization check
        if ($evidence->complaint_id !== $complaint->id || $complaint->user_id !== Auth::id()) {
            abort(404);
        }
        
        if ($complaint->status !== 'pending') {
            abort(403, 'Cannot delete evidence from a non-pending complaint');
        }

        // Delete file from storage
        Storage::disk('public')->delete($evidence->file_path);
        
        // Delete record
        $evidence->delete();

        return back()->with('success', 'Evidence removed successfully!');
    }

    public function downloadEvidence(Complaint $complaint, ComplaintEvidence $evidence)
    {
        // Authorization check
        if ($evidence->complaint_id !== $complaint->id || $complaint->user_id !== Auth::id()) {
            abort(403);
        }

        if (!Storage::disk('public')->exists($evidence->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($evidence->file_path, $evidence->file_name);
    }

    /**
     * Helper method to format file size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

 
    private function getReportTypes()
    {
        return [
            'maintenance' => 'Maintenance Issue',
            'noise' => 'Noise Complaint',
            'security' => 'Security Concern',
            'neighbor' => 'Neighbor Dispute',
            'parking' => 'Parking Issue',
            'cleanliness' => 'Cleanliness/Hygiene',
            'facility' => 'Facility/Common Area',
            'safety' => 'Safety Hazard',
            'other' => 'Other'
        ];
    }
}