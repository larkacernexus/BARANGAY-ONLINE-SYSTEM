<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunityReportStoreController extends BaseCommunityReportController
{
    protected $notificationController;

    public function __construct(CommunityReportNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);
        
        // Set default values
        $validated['is_anonymous'] = $request->boolean('is_anonymous', false);
        $validated['recurring_issue'] = $request->boolean('recurring_issue', false);
        $validated['has_previous_report'] = $request->boolean('has_previous_report', false);
        $validated['safety_concern'] = $request->boolean('safety_concern', false);
        $validated['environmental_impact'] = $request->boolean('environmental_impact', false);
        
        // Create the report
        $report = CommunityReport::create($validated);
        
        // Handle evidence uploads
        $this->handleEvidenceUploads($report, $request);
        
        // Send notification if report is assigned
        if ($validated['assigned_to'] && !$validated['is_anonymous'] && $validated['user_id']) {
            $this->notificationController->sendAssignmentNotification(
                $report, 
                User::find($validated['user_id']), 
                Auth::user()
            );
        }
        
        // Log the creation
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('created')
            ->log("Created new community report #{$report->report_number}");
        
        return redirect()->route('admin.community-reports.show', $report)
            ->with('success', 'Community report created successfully.');
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'report_type_id' => 'required|exists:report_types,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'detailed_description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'incident_date' => 'required|date',
            'incident_time' => 'nullable|date_format:H:i',
            'urgency_level' => 'required|in:low,medium,high',
            'recurring_issue' => 'boolean',
            'affected_people' => 'required|in:individual,family,group,community,multiple',
            'estimated_affected_count' => 'nullable|integer|min:0',
            'is_anonymous' => 'boolean',
            'reporter_name' => 'required_if:is_anonymous,true|nullable|string|max:255',
            'reporter_contact' => 'required_if:is_anonymous,true|nullable|string|max:50',
            'reporter_address' => 'required_if:is_anonymous,true|nullable|string|max:500',
            'perpetrator_details' => 'nullable|string|max:1000',
            'preferred_resolution' => 'nullable|string|max:1000',
            'has_previous_report' => 'boolean',
            'previous_report_id' => 'nullable|exists:community_reports,id',
            'impact_level' => 'required|in:minor,moderate,major,severe',
            'safety_concern' => 'boolean',
            'environmental_impact' => 'boolean',
            'noise_level' => 'nullable|in:low,medium,high',
            'duration_hours' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,under_review,assigned,in_progress,resolved,rejected',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
    }

    private function handleEvidenceUploads(CommunityReport $report, Request $request): void
    {
        $files = $request->file('evidences', []);
        
        if (empty($files)) {
            return;
        }
        
        foreach ($files as $file) {
            $path = $file->store('community-reports/evidence', 'public');
            
            $report->evidences()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ]);
        }
    }
}