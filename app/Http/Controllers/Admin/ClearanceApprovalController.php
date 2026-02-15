<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\Clearance;
use App\Models\ClearanceType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ClearanceApprovalController extends Controller
{
    /**
     * Display the approval queue page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = ClearanceRequest::with([
            'resident', 
            'clearanceType', 
            'documents',
            'processor' => function($q) {
                $q->select('id', 'first_name', 'last_name');
            }
        ])
        ->whereIn('status', ['pending', 'processing'])
        ->latest();

        // Apply role-based filtering
        if ($user->role === 'clerk') {
            $query->where('processor_id', $user->id);
        }

        // Apply filters if any
        $filters = $request->only(['search', 'urgency', 'type', 'date_from', 'date_to', 'status', 'sort_by', 'sort_order']);
        
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('reference_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('resident', function ($q2) use ($filters) {
                      $q2->where('first_name', 'like', '%' . $filters['search'] . '%')
                         ->orWhere('last_name', 'like', '%' . $filters['search'] . '%')
                         ->orWhere('full_name', 'like', '%' . $filters['search'] . '%')
                         ->orWhere('contact_number', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        if (!empty($filters['urgency']) && $filters['urgency'] !== 'all') {
            $query->where('urgency', $filters['urgency']);
        }

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('clearance_type_id', $filters['type']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Apply sorting
        if (!empty($filters['sort_by'])) {
            $sortOrder = $filters['sort_order'] ?? 'desc';
            $query->orderBy($filters['sort_by'], $sortOrder);
        }

        $clearanceRequests = $query->paginate($request->get('per_page', 15));

        // Transform data to include processor full name
        $clearanceRequests->getCollection()->transform(function ($request) {
            if ($request->processor) {
                $request->processor->full_name = $request->processor->first_name . ' ' . $request->processor->last_name;
            }
            return $request;
        });

        // Get stats
        $stats = [
            'pending' => ClearanceRequest::where('status', 'pending')
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'processing' => ClearanceRequest::where('status', 'processing')
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'today' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->whereDate('created_at', today())
                ->count(),
            'urgent' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereIn('urgency', ['rush', 'express'])
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'completed_today' => ClearanceRequest::whereIn('status', ['approved', 'rejected'])
                ->whereDate('processed_at', today())
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
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
            'user' => [
                'role' => $user->role,
                'id' => $user->id,
                'permissions' => $user->getPermissionNames(),
            ],
        ]);
    }

    /**
     * Show details of a specific clearance request
     */
    public function show(ClearanceRequest $clearanceRequest)
    {
        $user = Auth::user();
        
        // Check permissions
        if ($user->role === 'clerk' && $clearanceRequest->processor_id !== $user->id) {
            abort(403, 'You can only view requests assigned to you.');
        }

        // Eager load all necessary relationships
        $clearanceRequest->load([
            'resident', 
            'clearanceType', 
            'documents',
            'resident.household.purok',
            'processor' => function($q) {
                $q->select('id', 'first_name', 'last_name');
            }
        ]);

        // Add full name to processor
        if ($clearanceRequest->processor) {
            $clearanceRequest->processor->full_name = $clearanceRequest->processor->first_name . ' ' . $clearanceRequest->processor->last_name;
        }

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
            $canApprove = in_array($clearanceRequest->status, ['pending', 'processing']);
            $canReject = in_array($clearanceRequest->status, ['pending', 'processing']);
            $canReturn = $clearanceRequest->status === 'processing';
        } elseif ($user->role === 'clerk') {
            if ($clearanceRequest->processor_id === $user->id) {
                $canApprove = $clearanceRequest->status === 'processing';
                $canReject = false;
                $canReturn = $clearanceRequest->status === 'processing';
            }
        }

        return Inertia::render('admin/Clearances/ApprovalDetail', [
            'request' => $clearanceRequest,
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
        $user = Auth::user();
        
        // Check permissions
        if ($user->role === 'clerk' && $clearanceRequest->processor_id !== $user->id) {
            abort(403, 'You can only process requests assigned to you.');
        }

        if (!in_array($clearanceRequest->status, ['pending', 'processing'])) {
            return back()->with('error', 'Cannot approve a request that is not pending or processing.');
        }

        $validated = $request->validate([
            'issuing_officer' => 'required|string|max:255',
            'valid_until' => 'nullable|date|after:today',
            'remarks' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
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
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);

            // Update the request status
            $clearanceRequest->update([
                'status' => 'approved',
                'processed_at' => now(),
                'processed_by' => $user->id,
                'admin_notes' => $validated['remarks'] ?? null,
            ]);

            // Copy documents from request to clearance if any
            if ($clearanceRequest->documents->count() > 0) {
                foreach ($clearanceRequest->documents as $document) {
                    $clearance->documents()->create([
                        'resident_id' => $clearanceRequest->resident_id,
                        'document_type' => 'clearance',
                        'file_name' => $document->file_name,
                        'file_path' => $document->file_path,
                        'file_size' => $document->file_size,
                        'uploaded_by' => $user->id,
                    ]);
                }
            }

            DB::commit();

            Log::info('Clearance request approved', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'clearance_id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'approved_by' => $user->id,
            ]);

            return redirect()->route('admin.clearances.approval.index')
                ->with('success', 'Clearance approved successfully. Clearance #' . $clearance->clearance_number . ' has been created.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to approve clearance request', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to approve clearance: ' . $e->getMessage());
        }
    }

    /**
     * Reject a clearance request
     */
    public function reject(Request $request, ClearanceRequest $clearanceRequest)
    {
        $user = Auth::user();
        
        // Check permissions - only admins can reject
        if ($user->role !== 'admin') {
            abort(403, 'Only administrators can reject clearance requests.');
        }

        if (!in_array($clearanceRequest->status, ['pending', 'processing'])) {
            return back()->with('error', 'Cannot reject a request that is not pending or processing.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $clearanceRequest->update([
                'status' => 'rejected',
                'admin_notes' => $validated['reason'],
                'processed_at' => now(),
                'processed_by' => $user->id,
            ]);

            Log::info('Clearance request rejected', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'rejected_by' => $user->id,
                'reason' => $validated['reason'],
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
        $user = Auth::user();
        
        if (!in_array($clearanceRequest->status, ['pending'])) {
            return back()->with('error', 'Only pending requests can be marked as processing.');
        }

        try {
            $clearanceRequest->update([
                'status' => 'processing',
                'processor_id' => $user->id,
                'processed_at' => now(),
                'processed_by' => $user->id,
            ]);

            Log::info('Clearance request marked as processing', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'processor_id' => $user->id,
            ]);

            return back()->with('success', 'Request marked as processing and assigned to you.');

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
        $user = Auth::user();
        
        // Check permissions
        if ($user->role === 'clerk' && $clearanceRequest->processor_id !== $user->id) {
            abort(403, 'You can only return requests assigned to you.');
        }

        if ($clearanceRequest->status !== 'processing') {
            return back()->with('error', 'Only processing requests can be returned to pending.');
        }

        try {
            $clearanceRequest->update([
                'status' => 'pending',
                'processor_id' => null,
                'processed_at' => null,
                'processed_by' => null,
            ]);

            Log::info('Clearance request returned to pending', [
                'request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'returned_by' => $user->id,
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
     * Bulk update status
     */
    public function bulkUpdate(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'exists:clearance_requests,id',
            'action' => 'required|in:process,return,reject',
            'reason' => 'nullable|string|max:1000|required_if:action,reject',
        ]);

        $processed = 0;
        $errors = [];

        foreach ($validated['request_ids'] as $requestId) {
            try {
                $clearanceRequest = ClearanceRequest::findOrFail($requestId);
                
                // Check permissions for each request
                if ($user->role === 'clerk' && $validated['action'] === 'reject') {
                    $errors[] = "Request #{$clearanceRequest->reference_number}: Clerks cannot reject requests";
                    continue;
                }

                if ($user->role === 'clerk' && $clearanceRequest->processor_id !== $user->id) {
                    $errors[] = "Request #{$clearanceRequest->reference_number}: Not assigned to you";
                    continue;
                }

                switch ($validated['action']) {
                    case 'process':
                        if ($clearanceRequest->status === 'pending') {
                            $clearanceRequest->update([
                                'status' => 'processing',
                                'processor_id' => $user->id,
                                'processed_at' => now(),
                                'processed_by' => $user->id,
                            ]);
                            $processed++;
                        }
                        break;
                        
                    case 'return':
                        if ($clearanceRequest->status === 'processing') {
                            $clearanceRequest->update([
                                'status' => 'pending',
                                'processor_id' => null,
                                'processed_at' => null,
                                'processed_by' => null,
                            ]);
                            $processed++;
                        }
                        break;
                        
                    case 'reject':
                        if (in_array($clearanceRequest->status, ['pending', 'processing'])) {
                            $clearanceRequest->update([
                                'status' => 'rejected',
                                'admin_notes' => $validated['reason'],
                                'processed_at' => now(),
                                'processed_by' => $user->id,
                            ]);
                            $processed++;
                        }
                        break;
                }

            } catch (\Exception $e) {
                $errors[] = "Request #{$requestId}: " . $e->getMessage();
            }
        }

        $message = "Successfully processed {$processed} request(s).";
        if (!empty($errors)) {
            $message .= ' ' . count($errors) . ' error(s) occurred.';
        }

        Log::info('Bulk action completed', [
            'action' => $validated['action'],
            'total' => count($validated['request_ids']),
            'processed' => $processed,
            'errors' => count($errors),
            'user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
            'processed' => $processed,
            'errors' => $errors,
        ]);
    }

    /**
     * Generate clearance number
     */
    private function generateClearanceNumber()
    {
        $year = date('Y');
        $prefix = 'CLR-' . $year . '-';
        
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
        $user = Auth::user();
        
        $stats = [
            'total_pending' => ClearanceRequest::where('status', 'pending')
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'total_processing' => ClearanceRequest::where('status', 'processing')
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'urgent_requests' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereIn('urgency', ['rush', 'express'])
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'today_requests' => ClearanceRequest::whereIn('status', ['pending', 'processing'])
                ->whereDate('created_at', today())
                ->when($user->role === 'clerk', function ($q) use ($user) {
                    $q->where('processor_id', $user->id);
                })
                ->count(),
            'by_type' => ClearanceType::withCount(['clearanceRequests' => function ($query) use ($user) {
                $query->whereIn('status', ['pending', 'processing']);
                if ($user->role === 'clerk') {
                    $query->where('processor_id', $user->id);
                }
            }])->get(),
        ];

        return response()->json($stats);
    }
}