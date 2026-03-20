<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\Document;
use Illuminate\Http\Request;

class ClearanceDocumentController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    /**
     * Verify all pending documents.
     */
    public function verifyAllDocuments(ClearanceRequest $clearance)
    {
        if (!$clearance->documents()->where('is_verified', false)->exists()) {
            return redirect()->back()->with('info', 'No pending documents to verify.');
        }

        $documents = $clearance->documents()->where('is_verified', false)->get();
        
        foreach ($documents as $document) {
            $document->update([
                'is_verified' => true,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
            ]);
            
            $this->notificationController->sendDocumentNotification($clearance, $document, 'verified');
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('All pending documents verified');

        return redirect()->back()->with('success', 'All pending documents verified successfully.');
    }

    /**
     * Verify single document.
     */
    public function verifyDocument(ClearanceRequest $clearance, Document $document)
    {
        if ($document->clearance_request_id !== $clearance->id) {
            return redirect()->back()->with('error', 'Document does not belong to this clearance.');
        }

        $document->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        $this->notificationController->sendDocumentNotification($clearance, $document, 'verified');

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties(['document_id' => $document->id])
            ->log('Document verified');

        return redirect()->back()->with('success', 'Document verified successfully.');
    }

    /**
     * Reject document.
     */
    public function rejectDocument(Request $request, ClearanceRequest $clearance, Document $document)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        if ($document->clearance_request_id !== $clearance->id) {
            return redirect()->back()->with('error', 'Document does not belong to this clearance.');
        }

        $document->update([
            'is_verified' => false,
            'rejection_reason' => $request->reason,
            'verified_at' => null,
            'verified_by' => null,
        ]);

        $this->notificationController->sendDocumentNotification($clearance, $document, 'rejected', $request->reason);

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties(['document_id' => $document->id, 'reason' => $request->reason])
            ->log('Document rejected');

        return redirect()->back()->with('success', 'Document rejected.');
    }
}