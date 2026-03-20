<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class CommunityReportPrintController extends BaseCommunityReportController
{
    public function print(CommunityReport $report)
    {
        $report->load(['user', 'reportType', 'assignedTo', 'evidences']);
        
        $this->logPrint($report);
        
        return Inertia::render('admin/CommunityReports/Print', [
            'report' => $this->formatReportForPrint($report),
            'print_date' => now()->format('F d, Y'),
        ]);
    }

    public function pdf(CommunityReport $report)
    {
        $report->load(['user', 'reportType', 'assignedTo', 'evidences']);
        
        $this->logPdfDownload($report);
        
        $pdf = Pdf::loadView('admin.community-reports.pdf', [
            'report' => $this->formatReportForPrint($report),
            'print_date' => now()->format('F d, Y'),
        ]);
        
        return $pdf->download("community-report-{$report->report_number}.pdf");
    }

    private function logPrint(CommunityReport $report): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('printed')
            ->log("Printed community report #{$report->report_number}");
    }

    private function logPdfDownload(CommunityReport $report): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('pdf_downloaded')
            ->log("Downloaded PDF for community report #{$report->report_number}");
    }
}