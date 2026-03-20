<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommunityReportBulkController extends BaseCommunityReportController
{
    protected $notificationController;

    public function __construct(CommunityReportNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'report_ids' => 'required|array',
            'report_ids.*' => 'exists:community_reports,id',
            'action' => 'required|in:mark_resolved,mark_under_review,mark_assigned,mark_in_progress,mark_pending,delete,export,change_priority,change_urgency,assign_to',
        ]);
        
        $count = count($request->report_ids);
        $reports = CommunityReport::whereIn('id', $request->report_ids)->get();
        
        return match ($request->action) {
            'mark_resolved' => $this->bulkMarkResolved($reports, $count),
            'mark_under_review' => $this->bulkMarkUnderReview($reports, $count),
            'mark_assigned' => $this->bulkMarkAssigned($reports, $count),
            'mark_in_progress' => $this->bulkMarkInProgress($reports, $count),
            'mark_pending' => $this->bulkMarkPending($reports, $count),
            'delete' => $this->bulkDelete($reports, $count),
            'change_priority' => $this->bulkChangePriority($request, $reports, $count),
            'change_urgency' => $this->bulkChangeUrgency($request, $reports, $count),
            'assign_to' => $this->bulkAssignTo($request, $reports, $count),
            'export' => $this->bulkExport($reports, $count),
            default => response()->json(['message' => 'Invalid action'], 400),
        };
    }

    private function bulkMarkResolved($reports, $count)
    {
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['status' => 'resolved', 'resolved_at' => now()]);
        
        foreach ($reports as $report) {
            if (!$report->is_anonymous && $report->user_id) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $report->status, 'resolved'
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) marked as resolved."]);
    }

    private function bulkMarkUnderReview($reports, $count)
    {
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['status' => 'under_review', 'acknowledged_at' => now(), 'resolved_at' => null]);
        
        foreach ($reports as $report) {
            if (!$report->is_anonymous && $report->user_id) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $report->status, 'under_review'
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) marked as under review."]);
    }

    private function bulkMarkAssigned($reports, $count)
    {
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['status' => 'assigned', 'resolved_at' => null]);
        
        foreach ($reports as $report) {
            if (!$report->is_anonymous && $report->user_id) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $report->status, 'assigned'
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) marked as assigned."]);
    }

    private function bulkMarkInProgress($reports, $count)
    {
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['status' => 'in_progress', 'resolved_at' => null]);
        
        foreach ($reports as $report) {
            if (!$report->is_anonymous && $report->user_id) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $report->status, 'in_progress'
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) marked as in progress."]);
    }

    private function bulkMarkPending($reports, $count)
    {
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['status' => 'pending', 'acknowledged_at' => null, 'resolved_at' => null]);
        
        foreach ($reports as $report) {
            if (!$report->is_anonymous && $report->user_id) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $report->status, 'pending'
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) marked as pending."]);
    }

    private function bulkDelete($reports, $count)
    {
        foreach ($reports as $report) {
            foreach ($report->evidences as $evidence) {
                if (Storage::exists($evidence->file_path)) {
                    Storage::delete($evidence->file_path);
                }
                $evidence->delete();
            }
        }
        
        CommunityReport::whereIn('id', $reports->pluck('id'))->delete();
        
        return response()->json(['message' => "{$count} report(s) deleted."]);
    }

    private function bulkChangePriority(Request $request, $reports, $count)
    {
        $request->validate(['priority' => 'required|in:low,medium,high,critical']);
        
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['priority' => $request->priority]);
        
        return response()->json(['message' => "{$count} report(s) priority changed to {$request->priority}."]);
    }

    private function bulkChangeUrgency(Request $request, $reports, $count)
    {
        $request->validate(['urgency' => 'required|in:low,medium,high']);
        
        CommunityReport::whereIn('id', $reports->pluck('id'))
            ->update(['urgency_level' => $request->urgency]);
        
        return response()->json(['message' => "{$count} report(s) urgency changed to {$request->urgency}."]);
    }

    private function bulkAssignTo(Request $request, $reports, $count)
    {
        $request->validate(['assigned_to' => 'nullable|exists:users,id']);
        
        $assignedToUser = $request->assigned_to ? User::find($request->assigned_to) : null;
        
        foreach ($reports as $report) {
            $oldStatus = $report->status;
            
            $report->update([
                'assigned_to' => $request->assigned_to,
                'status' => $request->assigned_to ? 'assigned' : 'pending'
            ]);
            
            if (!$report->is_anonymous && $report->user_id && $request->assigned_to) {
                $reportOwner = User::find($report->user_id);
                if ($reportOwner) {
                    $this->notificationController->sendStatusChangeNotification(
                        $report, $reportOwner, $oldStatus, $report->status
                    );
                }
            }
        }
        
        return response()->json(['message' => "{$count} report(s) assigned successfully."]);
    }

    private function bulkExport($reports, $count)
    {
        return response()->json(['message' => 'Export initiated.', 'count' => $count]);
    }
}