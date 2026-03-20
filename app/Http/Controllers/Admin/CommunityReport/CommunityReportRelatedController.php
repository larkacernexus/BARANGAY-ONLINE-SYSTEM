<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Inertia\Inertia;

class CommunityReportRelatedController extends BaseCommunityReportController
{
    public function index(CommunityReport $report)
    {
        $relatedReports = CommunityReport::where('id', '!=', $report->id)
            ->where(function($query) use ($report) {
                if (!$report->is_anonymous && $report->user_id) {
                    $query->orWhere('user_id', $report->user_id);
                }
                
                if ($report->location) {
                    $query->orWhere('location', 'LIKE', "%{$report->location}%");
                }
                
                if ($report->report_type_id) {
                    $query->orWhere('report_type_id', $report->report_type_id);
                }
                
                if ($report->title) {
                    $keywords = explode(' ', $report->title);
                    foreach ($keywords as $keyword) {
                        if (strlen($keyword) > 3) {
                            $query->orWhere('title', 'LIKE', "%{$keyword}%");
                            $query->orWhere('description', 'LIKE', "%{$keyword}%");
                        }
                    }
                }
            })
            ->with(['user', 'reportType'])
            ->limit(10)
            ->get();
        
        return Inertia::render('admin/CommunityReports/Related', [
            'report' => $report,
            'related_reports' => $relatedReports,
        ]);
    }
}