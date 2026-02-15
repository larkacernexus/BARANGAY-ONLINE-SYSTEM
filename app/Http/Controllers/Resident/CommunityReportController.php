<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\CommunityReport;
use App\Models\ReportEvidence;
use App\Models\ReportType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CommunityReportController extends Controller
{
    public function index(Request $request)
    {
        $query = CommunityReport::where('user_id', Auth::id())->with('reportType');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('report_number', 'like', "%{$search}%")
                  ->orWhereHas('reportType', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->whereHas('reportType', function ($q) use ($request) {
                $q->where('category', $request->input('category'));
            });
        }

        if ($request->filled('type')) {
            $query->where('report_type_id', $request->input('type'));
        }

        if ($request->filled('priority')) {
            $query->where('urgency', $request->input('priority'));
        }

        $reports = $query->withCount('evidences')
                        ->with(['reportType'])
                        ->latest()
                        ->paginate(10)
                        ->withQueryString();

        $stats = [
            'total' => CommunityReport::where('user_id', Auth::id())->count(),
            'resolved' => CommunityReport::where('user_id', Auth::id())
                ->where('status', 'resolved')
                ->count(),
            'pending' => CommunityReport::where('user_id', Auth::id())
                ->where('status', 'pending')
                ->count(),
        ];

        $filterOptions = [
            'reportTypes' => ReportType::active()->get(['id', 'name', 'category']),
            'categories' => ReportType::active()->distinct('category')->pluck('category'),
            'statuses' => ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
            'priorities' => ['low', 'medium', 'high'],
        ];

        return inertia('resident/CommunityReports/Index', [
            'reports' => $reports,
            'stats' => $stats,
            'filterOptions' => $filterOptions,
            'filters' => $request->only(['search', 'status', 'category', 'type', 'priority']),
        ]);
    }

        public function create()
        {
            $reportTypes = ReportType::active()
                ->orderByRaw("
                    CASE 
                        WHEN code = 'OTHER_ISSUE' THEN 2
                        WHEN code = 'OTHER_COMPLAINT' THEN 2
                        ELSE 1 
                    END"
                )
                ->orderBy('category')
                ->orderBy('priority_level')
                ->orderBy('name')
                ->get();
            
            return Inertia::render('resident/CommunityReports/Create', [
                'reportTypes' => $reportTypes,
                'user' => Auth::user()->only(['name', 'phone', 'email']),
            ]);
        }
    
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'report_type_id' => 'required|exists:report_types,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string|min:15|max:1000',
                'location' => 'required|string|max:500',
                'incident_date' => 'required|date|before_or_equal:today',
                'incident_time' => 'nullable|date_format:H:i',
                'urgency' => 'required|in:low,medium,high',
                'is_anonymous' => 'boolean',
                'reporter_name' => 'required_if:is_anonymous,false|string|max:255',
                'reporter_contact' => 'required_if:is_anonymous,false|string|max:255',
                'evidence' => 'nullable|array|max:10',
                'evidence.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            ]);
            
            $reportType = ReportType::findOrFail($validated['report_type_id']);
            
            if ($reportType->requires_evidence && (!$request->hasFile('evidence') || count($request->file('evidence') ?? []) === 0)) {
                return back()->withErrors(['evidence' => 'Evidence is required for this type of report.'])->withInput();
            }
            
            if ($validated['is_anonymous'] && !$reportType->allows_anonymous) {
                return back()->withErrors(['is_anonymous' => 'Anonymous reporting is not allowed for this report type.'])->withInput();
            }
            
            $report = CommunityReport::create([
                'user_id' => Auth::id(),
                'report_type_id' => $validated['report_type_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'location' => $validated['location'],
                'incident_date' => $validated['incident_date'],
                'incident_time' => $validated['incident_time'] ?? null,
                'urgency' => $validated['urgency'],
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'reporter_name' => $validated['is_anonymous'] ? null : $validated['reporter_name'],
                'reporter_contact' => $validated['is_anonymous'] ? null : $validated['reporter_contact'],
                'status' => 'pending',
                'report_number' => 'REP-' . strtoupper(uniqid()),
                'submitted_at' => now(),
            ]);
            
            if ($request->hasFile('evidence')) {
                foreach ($request->file('evidence') as $file) {
                    $this->storeEvidence($report, $file);
                }
            }
            
            return redirect()->route('resident.community-reports.show', $report->id)
                ->with('success', 'Report submitted successfully! Report Number: ' . $report->report_number);
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Report submission error: ' . $e->getMessage());
            return back()->withErrors(['server' => 'An error occurred. Please try again.'])->withInput();
        }
    }

    public function show(CommunityReport $communityReport)
    {
        if ($communityReport->user_id !== Auth::id()) {
            abort(403);
        }

        $communityReport->load(['reportType', 'evidences']);

        $communityReport->evidences->transform(function ($evidence) {
            $evidence->file_url = Storage::url($evidence->file_path);
            $evidence->is_image = str_starts_with($evidence->file_type, 'image/');
            $evidence->is_video = str_starts_with($evidence->file_type, 'video/');
            $evidence->is_pdf = $evidence->file_type === 'application/pdf';
            $evidence->formatted_size = $this->formatBytes($evidence->file_size);
            return $evidence;
        });

        return inertia('resident/CommunityReports/Show', [
            'report' => $communityReport,
            'canEdit' => $communityReport->user_id === Auth::id() && 
                        $communityReport->status === 'pending' &&
                        $communityReport->created_at->diffInHours(now()) <= 24,
            'canAddEvidence' => $communityReport->user_id === Auth::id() && 
                              in_array($communityReport->status, ['pending', 'under_review']),
        ]);
    }

    public function update(Request $request, CommunityReport $communityReport)
    {
        if ($communityReport->user_id !== Auth::id() || 
            $communityReport->status !== 'pending' ||
            $communityReport->created_at->diffInHours(now()) > 24) {
            abort(403, 'You can only edit pending reports within 24 hours of submission.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:20|max:1000',
            'location' => 'required|string|max:500',
            'incident_date' => 'required|date|before_or_equal:today',
            'incident_time' => 'nullable|date_format:H:i',
            'urgency' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'reporter_name' => 'required_if:is_anonymous,false|string|max:255',
            'reporter_contact' => 'required_if:is_anonymous,false|string|max:20',
            'evidence' => 'nullable|array|max:10',
            'evidence.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            'remove_evidence' => 'nullable|array',
            'remove_evidence.*' => 'exists:report_evidences,id'
        ]);

        $communityReport->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'incident_date' => $validated['incident_date'],
            'incident_time' => $validated['incident_time'] ?? null,
            'urgency' => $validated['urgency'],
            'is_anonymous' => $validated['is_anonymous'] ?? $communityReport->is_anonymous,
            'reporter_name' => $validated['is_anonymous'] ? null : $validated['reporter_name'],
            'reporter_contact' => $validated['is_anonymous'] ? null : $validated['reporter_contact'],
        ]);

        if (!empty($validated['remove_evidence'])) {
            foreach ($validated['remove_evidence'] as $evidenceId) {
                $evidence = ReportEvidence::findOrFail($evidenceId);
                
                if ($evidence->report_id === $communityReport->id) {
                    Storage::delete($evidence->file_path);
                    $evidence->delete();
                }
            }
        }

        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $this->storeEvidence($communityReport, $file);
            }
        }

        return back()->with('success', 'Report updated successfully!');
    }

    public function destroy(CommunityReport $communityReport)
    {
        if ($communityReport->user_id !== Auth::id() || 
            $communityReport->status !== 'pending' ||
            $communityReport->created_at->diffInHours(now()) > 24) {
            abort(403, 'You can only delete pending reports within 24 hours of submission.');
        }

        foreach ($communityReport->evidences as $evidence) {
            Storage::delete($evidence->file_path);
            $evidence->delete();
        }

        $communityReport->delete();

        return redirect()->route('resident.community-reports.index')
            ->with('success', 'Report deleted successfully!');
    }

    public function addEvidence(Request $request, CommunityReport $communityReport)
    {
        if ($communityReport->user_id !== Auth::id() || 
            !in_array($communityReport->status, ['pending', 'under_review'])) {
            abort(403);
        }

        $validated = $request->validate([
            'evidence' => 'required|array|max:10',
            'evidence.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
        ]);

        foreach ($request->file('evidence') as $file) {
            $this->storeEvidence($communityReport, $file);
        }

        if ($communityReport->status === 'pending') {
            $communityReport->update(['status' => 'under_review']);
        }

        return back()->with('success', 'Evidence added successfully!');
    }

    public function deleteEvidence(CommunityReport $communityReport, ReportEvidence $evidence)
    {
        if ($evidence->report_id !== $communityReport->id || 
            $communityReport->user_id !== Auth::id() ||
            !in_array($communityReport->status, ['pending', 'under_review'])) {
            abort(404);
        }

        Storage::delete($evidence->file_path);
        $evidence->delete();

        return back()->with('success', 'Evidence removed successfully!');
    }

    public function downloadEvidence(CommunityReport $communityReport, ReportEvidence $evidence)
    {
        if ($evidence->report_id !== $communityReport->id || 
            $communityReport->user_id !== Auth::id()) {
            abort(403);
        }

        if (!Storage::exists($evidence->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::download($evidence->file_path, $evidence->file_name);
    }

    private function storeEvidence(CommunityReport $report, $file): ReportEvidence
    {
        $safeFilename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
        $path = $file->storeAs('community-reports/evidence', $safeFilename, 'public');
        
        return ReportEvidence::create([
            'report_id' => $report->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'disk' => 'public',
            'uploaded_by' => Auth::id(),
        ]);
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}