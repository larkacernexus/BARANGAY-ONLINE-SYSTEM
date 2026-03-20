<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunityReportEvidenceController extends BaseCommunityReportController
{
    public function upload(Request $request, CommunityReport $report)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt,mp4,mov,avi',
        ]);
        
        $uploadedFiles = [];
        
        foreach ($request->file('files') as $file) {
            $path = $file->store('community-reports/evidence', 'public');
            
            $report->evidences()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ]);
            
            $uploadedFiles[] = $path;
        }
        
        $this->logEvidenceUpload($report, count($uploadedFiles));
        
        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
            'message' => 'Files uploaded successfully.',
        ]);
    }

    public function remove(CommunityReport $report, $evidenceId)
    {
        $evidence = $report->evidences()->find($evidenceId);
        
        if (!$evidence) {
            return response()->json([
                'success' => false,
                'message' => 'File not found.',
            ], 404);
        }
        
        if (Storage::exists($evidence->file_path)) {
            Storage::delete($evidence->file_path);
        }
        
        $evidence->delete();
        
        $this->logEvidenceRemoval($report, $evidence);
        
        return response()->json([
            'success' => true,
            'message' => 'File removed successfully.',
        ]);
    }

    private function logEvidenceUpload(CommunityReport $report, int $fileCount): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'file_count' => $fileCount,
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('evidence_uploaded')
            ->log("Uploaded evidence files for community report #{$report->report_number}");
    }

    private function logEvidenceRemoval(CommunityReport $report, $evidence): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'evidence_id' => $evidence->id,
                'file_name' => $evidence->file_name,
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('evidence_removed')
            ->log("Removed evidence file from community report #{$report->report_number}");
    }
}