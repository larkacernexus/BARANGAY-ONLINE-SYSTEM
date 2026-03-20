<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CommunityReportExportController extends BaseCommunityReportController
{
    public function export(Request $request)
    {
        $query = CommunityReport::with(['user', 'reportType', 'assignedTo']);
        
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('incident_date', [
                $request->from_date,
                Carbon::parse($request->to_date)->endOfDay()
            ]);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        if ($request->filled('urgency') && $request->urgency !== 'all') {
            $query->where('urgency_level', $request->urgency);
        }
        
        $reports = $query->get();
        
        $csvData = $this->generateCsvData($reports);
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="community-reports_' . date('Y-m-d_H-i') . '.csv"',
        ];
        
        return response()->make($csvData, 200, $headers);
    }

    private function generateCsvData($reports): string
    {
        $csvData = "Report Number,Title,Report Type,Category,Status,Priority,Urgency,Impact Level,Resident Name,Location,Incident Date,Created At,Resolved At,Assigned To,Safety Concern,Environmental Impact,Recurring Issue,Estimated Affected\n";
        
        foreach ($reports as $report) {
            $residentName = $report->is_anonymous ? 'Anonymous' : 
                          ($report->user ? trim(($report->user->first_name ?? '') . ' ' . ($report->user->last_name ?? '')) : 'N/A');
            
            $reportType = $report->reportType ? $report->reportType->name : 'N/A';
            $category = $report->reportType ? $report->reportType->category : 'N/A';
            $assignedTo = $report->assignedTo ? trim(($report->assignedTo->first_name ?? '') . ' ' . ($report->assignedTo->last_name ?? '')) : 'Unassigned';
            
            $csvData .= "\"" . ($report->report_number ?? 'N/A') . "\","
                . "\"" . str_replace('"', '""', $report->title ?? '') . "\","
                . "\"" . str_replace('"', '""', $reportType) . "\","
                . "\"" . str_replace('"', '""', $category) . "\","
                . "\"" . $report->status . "\","
                . "\"" . $report->priority . "\","
                . "\"" . $report->urgency_level . "\","
                . "\"" . $report->impact_level . "\","
                . "\"" . str_replace('"', '""', $residentName) . "\","
                . "\"" . str_replace('"', '""', $report->location ?? '') . "\","
                . "\"" . ($report->incident_date ? $report->incident_date->format('Y-m-d') : '') . "\","
                . "\"" . ($report->created_at ? $report->created_at->format('Y-m-d H:i:s') : '') . "\","
                . "\"" . ($report->resolved_at ? $report->resolved_at->format('Y-m-d H:i:s') : '') . "\","
                . "\"" . str_replace('"', '""', $assignedTo) . "\","
                . "\"" . ($report->safety_concern ? 'Yes' : 'No') . "\","
                . "\"" . ($report->environmental_impact ? 'Yes' : 'No') . "\","
                . "\"" . ($report->recurring_issue ? 'Yes' : 'No') . "\","
                . "\"" . ($report->estimated_affected_count ?? '') . "\"\n";
        }
        
        return $csvData;
    }
}