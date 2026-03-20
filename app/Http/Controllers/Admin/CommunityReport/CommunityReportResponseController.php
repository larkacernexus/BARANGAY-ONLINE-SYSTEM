<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunityReportResponseController extends BaseCommunityReportController
{
    public function send(Request $request, CommunityReport $report)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'send_email' => 'boolean',
            'send_sms' => 'boolean',
            'is_public' => 'boolean',
        ]);
        
        $this->logResponse($report, $request);
        
        return redirect()
            ->route('admin.community-reports.show', $report)
            ->with('success', 'Response sent successfully.');
    }

    private function logResponse(CommunityReport $report, Request $request): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'subject' => $request->subject,
                'message' => $request->message,
                'channels' => $this->getSentVia($request),
                'is_public' => $request->boolean('is_public', false),
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('response_sent')
            ->log("Sent response for community report #{$report->report_number}");
    }
}