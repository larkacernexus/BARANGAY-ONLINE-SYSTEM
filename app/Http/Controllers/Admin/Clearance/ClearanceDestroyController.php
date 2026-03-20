<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;

class ClearanceDestroyController extends Controller
{
    public function destroy(ClearanceRequest $clearance)
    {
        if (!in_array($clearance->status, ['pending', 'pending_payment'])) {
            return redirect()->back()->with('error', 'Cannot delete clearance request in current status.');
        }

        if ($clearance->payment_id || $clearance->paymentItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete clearance request with associated payments.');
        }

        $clearance->delete();

        return redirect()->route('admin.clearances.index')
            ->with('success', 'Clearance request deleted.');
    }
}