<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceDocumentController extends Controller
{
    use ClearanceNotificationTrait;

    /**
     * Verify all pending documents.
     */
    public function verifyAll(ClearanceRequest $clearance)
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
            
            $this->sendDocumentNotification($clearance, $document, 'verified');
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('All pending documents verified');

        return redirect()->back()->with('success', 'All pending documents verified successfully.');
    }

    /**
     * Request more documents.
     */
    public function requestMore(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Update status to pending if it was in processing
        if ($clearance->status === 'processing') {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => 'pending',
                'admin_notes' => $clearance->admin_notes . "\nRequested more documents: " . $request->reason,
            ]);
            
            $this->sendClearanceStatusNotification($clearance, $oldStatus, 'pending', 'Additional documents required: ' . $request->reason);
        }

        // Notify payer about document request
        $payerUsers = $this->getPayerUsersFromClearance($clearance);
        foreach ($payerUsers as $user) {
            $user->notify(new \App\Notifications\ClearanceDocumentRequest($clearance, $request->reason));
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties(['reason' => $request->reason])
            ->log('Requested more documents');

        return redirect()->back()->with('success', 'Document request sent to resident.');
    }
}