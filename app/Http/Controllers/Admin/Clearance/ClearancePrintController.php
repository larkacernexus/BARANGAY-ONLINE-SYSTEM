<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Inertia\Inertia;

class ClearancePrintController extends Controller
{
    public function print(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot print clearance that is not issued.');
        }

        $clearance->load(['clearanceType', 'resident', 'issuingOfficer']);

        return Inertia::render('admin/Clearances/Print', [
            'clearance' => $clearance,
        ]);
    }

    public function download(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot download clearance that is not issued.');
        }

        return redirect()->back()->with('info', 'Download functionality to be implemented.');
    }
}