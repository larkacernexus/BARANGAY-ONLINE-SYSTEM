<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceBulkController extends Controller
{
    use ClearanceNotificationTrait;

    /**
     * Bulk process clearance requests.
     */
    public function process(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        DB::beginTransaction();
        
        try {
            $clearances = ClearanceRequest::whereIn('id', $request->ids)
                ->whereIn('status', ['pending', 'pending_payment'])
                ->get();

            $count = 0;
            foreach ($clearances as $clearance) {
                $oldStatus = $clearance->status;
                $clearance->update([
                    'status' => 'processing',
                    'processed_by' => auth()->id(),
                    'processed_at' => now(),
                ]);
                
                $this->sendClearanceStatusNotification($clearance, $oldStatus, 'processing');
                $count++;
            }

            DB::commit();
            
            return redirect()->back()->with('success', "{$count} clearance requests marked as processing.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk process failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to process bulk operation.');
        }
    }

    /**
     * Bulk approve clearance requests.
     */
    public function approve(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        DB::beginTransaction();
        
        try {
            $clearances = ClearanceRequest::whereIn('id', $request->ids)
                ->where('status', 'processing')
                ->where(function ($q) {
                    $q->where('payment_status', 'paid')
                      ->orWhereDoesntHave('clearanceType', function ($q) {
                          $q->where('requires_payment', true);
                      });
                })
                ->get();

            $count = 0;
            foreach ($clearances as $clearance) {
                $oldStatus = $clearance->status;
                $clearance->update([
                    'status' => 'approved',
                    'issuing_officer_id' => auth()->id(),
                    'issuing_officer_name' => auth()->user()->name,
                ]);
                
                $this->sendClearanceStatusNotification($clearance, $oldStatus, 'approved');
                $count++;
            }

            DB::commit();
            
            return redirect()->back()->with('success', "{$count} clearance requests approved.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk approve failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to approve bulk operations.');
        }
    }

    /**
     * Bulk issue clearance certificates.
     */
    public function issue(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        DB::beginTransaction();
        
        try {
            $clearances = ClearanceRequest::whereIn('id', $request->ids)
                ->where('status', 'approved')
                ->get();

            $count = 0;
            foreach ($clearances as $clearance) {
                $oldStatus = $clearance->status;
                $clearance->update([
                    'status' => 'issued',
                    'issue_date' => now(),
                    'valid_until' => now()->addDays(30),
                ]);
                
                $this->sendClearanceStatusNotification($clearance, $oldStatus, 'issued');
                $count++;
            }

            DB::commit();
            
            return redirect()->back()->with('success', "{$count} clearance certificates issued.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk issue failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to issue bulk certificates.');
        }
    }

    /**
     * Bulk update status.
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
            'status' => 'required|in:pending,processing,approved,issued,rejected,cancelled',
        ]);

        DB::beginTransaction();
        
        try {
            $clearances = ClearanceRequest::whereIn('id', $request->ids)->get();

            $count = 0;
            foreach ($clearances as $clearance) {
                $oldStatus = $clearance->status;
                $clearance->update([
                    'status' => $request->status,
                    'processed_by' => auth()->id(),
                    'processed_at' => now(),
                ]);
                
                $this->sendClearanceStatusNotification($clearance, $oldStatus, $request->status);
                $count++;
            }

            DB::commit();
            
            return redirect()->back()->with('success', "{$count} clearance requests updated to {$request->status}.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk status update failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update bulk status.');
        }
    }

    /**
     * Bulk delete clearance requests.
     */
    public function delete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        // Check for payments
        $hasPayments = ClearanceRequest::whereIn('id', $request->ids)
            ->where(function ($q) {
                $q->whereNotNull('payment_id')
                  ->orWhereHas('paymentItems');
            })
            ->exists();

        if ($hasPayments) {
            return redirect()->back()->with('error', 'Cannot delete clearance requests with associated payments.');
        }

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->delete();

        return redirect()->back()->with('success', "{$count} clearance requests deleted.");
    }
}