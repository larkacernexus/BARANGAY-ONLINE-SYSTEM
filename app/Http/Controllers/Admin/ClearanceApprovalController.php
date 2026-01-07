<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\Clearance;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class ClearanceApprovalController extends Controller
{
    /**
     * Display the approval queue page
     */
    public function index(Request $request)
    {
        // REMOVED: 'payment' from with() clause
        $query = ClearanceRequest::with(['resident', 'clearanceType', 'documents'])
            ->whereIn('status', ['pending', 'processing'])
            ->latest();

        // Apply filters if any
        $filters = $request->only(['search', 'urgency', 'type', 'date_from', 'date_to']);
        
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('resident', function ($q2) use ($filters) {
                      $q2->where('first_name', 'like', '%' . $filters['search'] . '%')
                         ->orWhere('last_name', 'like', '%' . $filters['search'] . '%')
                         ->orWhere('full_name', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        if (!empty($filters['urgency'])) {
            $query->where('urgency', $filters['urgency']);
        }

        if (!empty($filters['type'])) {
            $query->where('clearance_type_id', $filters['type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $clearanceRequests = $query->paginate(15);

        // Get stats
        $stats = [
            'pending' => ClearanceRequest::where('status', 'pending')->count(),
            'processing' => ClearanceRequest::where('status', 'processing')->count(),
            'today' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereDate('created_at', today())
                ->count(),
            'urgent' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereIn('urgency', ['rush', 'express'])
                ->count(),
        ];

        // Get all clearance types for filter
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->get(['id', 'name'])
            ->toArray();

        return Inertia::render('admin/Clearances/ApprovalQueue', [
            'clearanceRequests' => $clearanceRequests,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $filters,
        ]);
    }

    /**
     * Show details of a specific clearance request
     */
    public function show(ClearanceRequest $clearanceRequest)
    {
        $user = Auth::user();
        
        // Clerks can only view requests they are processing
        if ($user->role === 'clerk' && $clearanceRequest->processor_id !== $user->id) {
            abort(403, 'You can only view requests assigned to you.');
        }

        // Eager load all necessary relationships
        $clearanceRequest->load([
            'resident', 
            'clearanceType', 
            'documents',
            'resident.household',
        ]);

        // Transform documents to include full URLs
        $clearanceRequest->documents->transform(function ($document) {
            $document->file_url = Storage::url($document->file_path);
            return $document;
        });

        // Determine what actions the user can perform
        $canApprove = false;
        $canReject = false;
        $canReturn = false;
        
        if ($user->role === 'admin') {
            // Admins can do everything
            $canApprove = in_array($clearanceRequest->status, ['pending', 'processing']);
            $canReject = in_array($clearanceRequest->status, ['pending', 'processing']);
            $canReturn = $clearanceRequest->status === 'processing';
        } elseif ($user->role === 'clerk') {
            // Clerks can only process requests assigned to them
            if ($clearanceRequest->processor_id === $user->id) {
                $canApprove = $clearanceRequest->status === 'processing';
                $canReject = false; // Clerks cannot reject
                $canReturn = $clearanceRequest->status === 'processing';
            }
        }

        return Inertia::render('admin/Clearances/ApprovalDetail', [
            'request' => $clearanceRequest,
            'resident' => $clearanceRequest->resident,
            'clearanceType' => $clearanceRequest->clearanceType,
            'canApprove' => $canApprove,
            'canReject' => $canReject,
            'canReturn' => $canReturn,
        ]);
    }
    /**
     * Approve a clearance request
     */
    public function approve(Request $request, ClearanceRequest $clearanceRequest)
    {
        $validated = $request->validate([
            'issuing_officer' => 'required|string|max:255',
            'valid_until' => 'nullable|date|after:today',
            'remarks' => 'nullable|string|max:1000',
        ]);

        try {
            // Create clearance from request
            $clearance = Clearance::create([
                'resident_id' => $clearanceRequest->resident_id,
                'clearance_type_id' => $clearanceRequest->clearance_type_id,
                'purpose' => $clearanceRequest->purpose,
                'issue_date' => now(),
                'valid_until' => $validated['valid_until'] ?? now()->addDays($clearanceRequest->clearanceType->validity_days),
                'clearance_number' => $this->generateClearanceNumber(),
                'fee_amount' => $clearanceRequest->fee_amount,
                'remarks' => $validated['remarks'] ?? 'Generated from request: ' . $clearanceRequest->reference_number,
                'issuing_officer' => $validated['issuing_officer'],
                'status' => 'approved',
            ]);

            // Update the request status
            $clearanceRequest->update([
                'status' => 'approved',
                'processed_at' => now(),
                'processed_by' => auth()->id(),
            ]);

            Log::info('Clearance request approved', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'clearance_id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'approved_by' => auth()->id(),
            ]);

            return redirect()->route('admin.clearances.approval.index')
                ->with('success', 'Clearance approved successfully. Clearance #' . $clearance->clearance_number . ' has been created.');

        } catch (\Exception $e) {
            Log::error('Failed to approve clearance request', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to approve clearance: ' . $e->getMessage());
        }
    }

    /**
     * Reject a clearance request
     */
    public function reject(Request $request, ClearanceRequest $clearanceRequest)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $clearanceRequest->update([
                'status' => 'rejected',
                'admin_notes' => $validated['reason'],
                'processed_at' => now(),
                'processed_by' => auth()->id(),
            ]);

            Log::info('Clearance request rejected', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'rejected_by' => auth()->id(),
            ]);

            return redirect()->route('admin.clearances.approval.index')
                ->with('success', 'Clearance request rejected successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to reject clearance request', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to reject clearance: ' . $e->getMessage());
        }
    }

    /**
     * Mark as processing
     */
    public function markAsProcessing(ClearanceRequest $clearanceRequest)
    {
        try {
            $clearanceRequest->update([
                'status' => 'processing',
                'processed_at' => now(),
                'processed_by' => auth()->id(),
            ]);

            Log::info('Clearance request marked as processing', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
            ]);

            return back()->with('success', 'Request marked as processing.');

        } catch (\Exception $e) {
            Log::error('Failed to mark as processing', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to update status: ' . $e->getMessage());
        }
    }

    /**
     * Return to pending
     */
    public function returnToPending(ClearanceRequest $clearanceRequest)
    {
        try {
            $clearanceRequest->update([
                'status' => 'pending',
                'processed_at' => null,
                'processed_by' => null,
            ]);

            Log::info('Clearance request returned to pending', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
            ]);

            return back()->with('success', 'Request returned to pending.');

        } catch (\Exception $e) {
            Log::error('Failed to return to pending', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to update status: ' . $e->getMessage());
        }
    }

    /**
     * Generate clearance number
     */
    private function generateClearanceNumber()
    {
        $prefix = 'CLR-' . date('Y') . '-';
        $lastClearance = Clearance::where('clearance_number', 'like', $prefix . '%')
            ->orderBy('clearance_number', 'desc')
            ->first();

        if ($lastClearance) {
            $lastNumber = (int) str_replace($prefix, '', $lastClearance->clearance_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    /**
     * Get statistics for dashboard
     */
    public function stats()
    {
        $stats = [
            'total_pending' => ClearanceRequest::where('status', 'pending')->count(),
            'total_processing' => ClearanceRequest::where('status', 'processing')->count(),
            'urgent_requests' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereIn('urgency', ['rush', 'express'])
                ->count(),
            'today_requests' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereDate('created_at', today())
                ->count(),
            'by_type' => ClearanceType::withCount(['clearanceRequests' => function ($query) {
                $query->whereIn('status', ['pending', 'processing']);
            }])->get(),
        ];

        return response()->json($stats);
    }
}