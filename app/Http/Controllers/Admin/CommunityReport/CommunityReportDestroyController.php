<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunityReportDestroyController extends BaseCommunityReportController
{
    public function destroy(CommunityReport $report)
    {
        $reportNumber = $report->report_number ?? 'N/A';
        $reportTitle = $report->title ?? 'N/A';
        
        // Delete associated evidence files
        foreach ($report->evidences as $evidence) {
            if (Storage::exists($evidence->file_path)) {
                Storage::delete($evidence->file_path);
            }
            $evidence->delete();
        }
        
        // Log the deletion
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'report_number' => $reportNumber,
                'title' => $reportTitle,
                'ip' => request()->ip(),
            ])
            ->event('deleted')
            ->log("Deleted community report #{$reportNumber}");
        
        $report->delete();
        
        return redirect()->route('admin.community-reports.index')
            ->with('success', 'Community report deleted successfully.');
    }
}