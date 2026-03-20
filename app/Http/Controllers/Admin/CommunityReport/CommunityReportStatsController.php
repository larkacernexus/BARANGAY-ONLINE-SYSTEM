<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Carbon\Carbon;

class CommunityReportStatsController extends BaseCommunityReportController
{
    public function dashboardStats()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        
        return response()->json([
            'total' => CommunityReport::count(),
            'pending' => CommunityReport::where('status', 'pending')->count(),
            'under_review' => CommunityReport::where('status', 'under_review')->count(),
            'assigned' => CommunityReport::where('status', 'assigned')->count(),
            'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
            'resolved' => CommunityReport::where('status', 'resolved')->count(),
            'high_priority' => CommunityReport::where('priority', 'high')->orWhere('priority', 'critical')->count(),
            'high_urgency' => CommunityReport::where('urgency_level', 'high')->count(),
            'today' => CommunityReport::whereDate('created_at', $today)->count(),
            'this_week' => CommunityReport::where('created_at', '>=', $weekAgo)->count(),
            'safety_concerns' => CommunityReport::where('safety_concern', true)->count(),
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total' => CommunityReport::count(),
            'pending' => CommunityReport::where('status', 'pending')->count(),
            'under_review' => CommunityReport::where('status', 'under_review')->count(),
            'assigned' => CommunityReport::where('status', 'assigned')->count(),
            'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
            'resolved' => CommunityReport::where('status', 'resolved')->count(),
            'rejected' => CommunityReport::where('status', 'rejected')->count(),
            'high_priority' => CommunityReport::where('priority', 'high')->orWhere('priority', 'critical')->count(),
            'high_urgency' => CommunityReport::where('urgency_level', 'high')->count(),
            'this_month' => CommunityReport::whereMonth('created_at', date('m'))->count(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
            'safety_concerns' => CommunityReport::where('safety_concern', true)->count(),
            'environmental_issues' => CommunityReport::where('environmental_impact', true)->count(),
            'recurring_issues' => CommunityReport::where('recurring_issue', true)->count(),
            'community_impact' => CommunityReport::whereIn('affected_people', ['community', 'multiple'])->count(),
        ];
        
        return response()->json($stats);
    }
}