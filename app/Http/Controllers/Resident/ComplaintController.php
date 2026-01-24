<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ComplaintController extends Controller
{
   public function index(Request $request)
    {
        $complaints = Complaint::where('user_id', Auth::id())
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
            'satisfaction_rate' => 89, // This would come from a ratings table
            'by_type' => Complaint::where('user_id', Auth::id())
                ->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        return inertia('resident/Complaints/Index', [
            'complaints' => $complaints,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    public function create()
    {
        return inertia('resident/Complaints/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'incident_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'evidence' => 'nullable|array',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi'
        ]);

        // Handle file uploads
        $evidenceFiles = [];
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $path = $file->store('complaints/evidence', 'public');
                $evidenceFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'type' => $file->getClientMimeType(),
                    'size' => $file->getSize()
                ];
            }
        }

        $complaint = Complaint::create([
            'user_id' => Auth::id(),
            'type' => $validated['type'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'incident_date' => $validated['incident_date'],
            'priority' => $validated['priority'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'evidence_files' => !empty($evidenceFiles) ? $evidenceFiles : null,
            'status' => 'pending'
        ]);

        return redirect()->route('my.complaints.show', $complaint->id)
            ->with('success', 'Complaint submitted successfully!');
    }

    public function show(Complaint $complaint)
    {
   

        return inertia('resident/Complaints/Show', [
            'complaint' => $complaint->load('user')
        ]);
    }

    public function update(Request $request, Complaint $complaint)
    {
        if ($complaint->user_id !== Auth::id() || $complaint->status !== 'pending') {
            abort(403);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'incident_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high',
        ]);

        $complaint->update($validated);

        return back()->with('success', 'Complaint updated successfully!');
    }

    public function destroy(Complaint $complaint)
    {
        if ($complaint->user_id !== Auth::id() || $complaint->status !== 'pending') {
            abort(403);
        }

        // Delete associated files
        if ($complaint->evidence_files) {
            foreach ($complaint->evidence_files as $file) {
                Storage::disk('public')->delete($file['path']);
            }
        }

        $complaint->delete();

        return redirect()->route('resident.complaints.index')
            ->with('success', 'Complaint deleted successfully!');
    }

    public function downloadEvidence(Complaint $complaint, $index)
    {
        if ($complaint->user_id !== Auth::id()) {
            abort(403);
        }

        $files = $complaint->evidence_files;
        if (!isset($files[$index])) {
            abort(404);
        }

        $file = $files[$index];
        return Storage::disk('public')->download($file['path'], $file['name']);
    }
}