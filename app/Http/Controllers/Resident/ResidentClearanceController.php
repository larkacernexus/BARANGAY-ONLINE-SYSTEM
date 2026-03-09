<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\DocumentType;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;
use App\Models\ClearanceRequestDocument;
use App\Models\User;
use App\Notifications\ClearanceRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ResidentClearanceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get the household associated with the authenticated user
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('resident/Clearances/Index', [
                    'clearances' => [],
                    'filters' => $request->only(['search', 'status', 'resident']),
                    'statistics' => [
                        'total' => 0, 
                        'pending' => 0, 
                        'pending_payment' => 0,
                        'processing' => 0, 
                        'approved' => 0, 
                        'issued' => 0,
                        'completed' => 0
                    ],
                    'householdResidents' => [],
                    'currentResident' => null,
                    'household' => null,
                    'error' => 'Your account is not associated with any household. Please contact the barangay administrator.'
                ]);
            }
            return redirect()->route('dashboard')
                ->with('error', 'Your account is not associated with any household. Please contact the barangay administrator.');
        }
        
        // Get all residents belonging to this household
        $residents = Resident::where('household_id', $household->id)->get();
        
        if ($residents->isEmpty()) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('resident/Clearances/Index', [
                    'clearances' => [],
                    'filters' => $request->only(['search', 'status', 'resident']),
                    'statistics' => [
                        'total' => 0, 
                        'pending' => 0, 
                        'pending_payment' => 0,
                        'processing' => 0, 
                        'approved' => 0, 
                        'issued' => 0,
                        'completed' => 0
                    ],
                    'householdResidents' => [],
                    'currentResident' => null,
                    'household' => $this->formatHouseholdBasic($household),
                    'error' => 'No residents found in your household. Please contact the barangay administrator.'
                ]);
            }
            return redirect()->route('dashboard')
                ->with('error', 'No residents found in your household. Please contact the barangay administrator.');
        }
        
        // Get resident IDs for querying clearances
        $residentIds = $residents->pluck('id');
        
        // Query for clearances
        $query = ClearanceRequest::with('resident')
            ->whereIn('resident_id', $residentIds)
            ->latest();
        
        // Apply filters
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('control_number', 'like', "%{$request->search}%")
                  ->orWhere('purpose', 'like', "%{$request->search}%")
                  ->orWhere('specific_purpose', 'like', "%{$request->search}%")
                  ->orWhereHas('resident', function ($q) use ($request) {
                      $q->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->has('resident') && $request->resident !== 'all') {
            if (in_array($request->resident, $residentIds->toArray())) {
                $query->where('resident_id', $request->resident);
            }
        }
        
        // Get paginated results
        $clearances = $query->paginate(10);
        
        // Transform clearances to avoid circular references
        $formattedClearances = $this->formatClearances($clearances);
        
        // Get statistics
        $statistics = [
            'total' => ClearanceRequest::whereIn('resident_id', $residentIds)->count(),
            'pending' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'pending')->count(),
            'pending_payment' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'pending_payment')->count(),
            'processing' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'processing')->count(),
            'approved' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'approved')->count(),
            'issued' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'issued')->count(),
            'completed' => ClearanceRequest::whereIn('resident_id', $residentIds)
                ->whereIn('status', ['issued'])->count(),
        ];
        
        // Get the head resident
        $headResident = $this->getHeadResident($household);
        
        // Format household data properly
        $formattedHousehold = $this->formatHouseholdData($household, $headResident);
        
        // Format residents data
        $formattedResidents = $this->formatResidents($residents);
        
        return Inertia::render('resident/Clearances/Index', [
            'clearances' => $formattedClearances,
            'filters' => $request->only(['search', 'status', 'resident']),
            'statistics' => $statistics,
            'householdResidents' => $formattedResidents,
            'currentResident' => $headResident ? $this->formatResidentBasic($headResident) : $this->formatResidentBasic($residents->first()),
            'household' => $formattedHousehold,
        ]);
    }
    
    public function show(ClearanceRequest $clearance)
    {
        $user = auth()->user();
        
        // Get the user's household
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        // Check if the clearance belongs to any resident in the household
        if (!in_array($clearance->resident_id, $residentIds->toArray())) {
            abort(403, 'You are not authorized to view this clearance.');
        }
        
        // Load relationships
        $clearance->load([
            'clearance_type',
            'documents.documentType',
            'statusHistory.causer',
            'resident',
        ]);
        
        // Format the clearance data
        $formattedClearance = $this->formatClearanceDetail($clearance);
        
        // Load payment items if the relationship exists
        $paymentItems = collect();
        if (method_exists($clearance, 'paymentItems')) {
            $clearance->load('paymentItems.payment');
            $paymentItems = $clearance->paymentItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'amount' => $item->amount,
                    'payment' => $item->payment ? [
                        'id' => $item->payment->id,
                        'or_number' => $item->payment->or_number,
                        'amount' => $item->payment->amount,
                        'status' => $item->payment->status,
                        'paid_at' => $item->payment->paid_at,
                    ] : null,
                ];
            });
        }
        
        return Inertia::render('resident/Clearances/Show', [
            'clearance' => $formattedClearance,
            'payment_items' => $paymentItems,
        ]);
    }
    
    /**
     * Show the form for creating a new clearance request.
     */
    public function create()
    {
        $user = Auth::user();
        
        // Find the household
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            return redirect()->route('resident.dashboard')
                ->with('error', 'You are not registered with any household.');
        }
        
        // Get the household head member record
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();
            
        if (!$headMember) {
            return redirect()->route('resident.dashboard')
                ->with('error', 'Household head member record not found.');
        }
        
        // Get the head resident data
        $headResident = Resident::find($headMember->resident_id);
        
        if (!$headResident) {
            return redirect()->route('resident.dashboard')
                ->with('error', 'Household head resident record not found.');
        }
        
        // Get ALL residents in this household through household_members
        $householdMembers = HouseholdMember::with('resident')
            ->where('household_id', $household->id)
            ->get()
            ->map(function ($member) {
                $resident = $member->resident;
                
                return [
                    'id' => (int) $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'full_name' => $resident->full_name,
                    'address' => $resident->address,
                    'contact_number' => $resident->contact_number,
                    'purok_name' => $resident->purok_name,
                    'household_id' => (int) $member->household_id,
                    'is_head' => (bool) $member->is_head,
                    'relationship' => $member->is_head ? 'Head' : ($member->relationship_to_head ?? 'Family Member'),
                ];
            })
            ->toArray();
        
        // Get active clearance types
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get();
        
        // Format clearance types
        $formattedClearanceTypes = $this->formatClearanceTypes($clearanceTypes);
        
        // Get all document types
        $allDocumentTypes = DocumentType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($docType) {
                return [
                    'id' => (int) $docType->id,
                    'name' => $docType->name,
                    'description' => $docType->description ?? '',
                ];
            })
            ->toArray();
        
        // Get current resident data
        $currentResident = $user->current_resident_id ? Resident::find($user->current_resident_id) : $headResident;
        $residentData = $currentResident ? $this->formatResidentBasic($currentResident) : null;
        
        // Add is_head to resident data
        if ($residentData) {
            $residentData['is_head'] = $this->isHeadOfHousehold($household, $currentResident);
        }
        
        // Format household info
        $householdInfo = [
            'id' => (int) $household->id,
            'number' => $household->household_number,
            'head_name' => $headResident->full_name ?? $household->head_of_family,
            'address' => $household->address,
        ];
        
        Log::info('Clearance request form loaded', [
            'user_id' => $user->id,
            'clearance_types' => count($formattedClearanceTypes),
            'household_members' => count($householdMembers),
        ]);
        
        return Inertia::render('resident/Clearances/Request', [
            'clearanceTypes' => $formattedClearanceTypes,
            'resident' => $residentData,
            'householdMembers' => $householdMembers,
            'household_info' => $householdInfo,
            'allDocumentTypes' => $allDocumentTypes,
        ]);
    }
    
/**
 * Store a newly created clearance request in storage.
 */
public function store(Request $request)
{
    try {
        // Enhanced validation
        $validated = $request->validate([
            'clearance_type_id' => 'required|exists:clearance_types,id',
            'purpose' => 'required|string|max:255',
            'specific_purpose' => 'nullable|string|max:500',
            'needed_date' => 'required|date|after_or_equal:today',
            'resident_id' => 'required|exists:residents,id',
            'additional_notes' => 'nullable|string|max:1000',
            'documents' => 'nullable|array|max:20',
            'documents.*' => 'file|max:5120|mimes:pdf,jpg,jpeg,png,doc,docx',
            'document_type_ids' => 'nullable|array',
            'document_type_ids.*' => 'nullable|integer|exists:document_types,id',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string|max:255',
        ]);

        // Get the logged-in user
        $user = Auth::user();
        
        if (!$user) {
            return back()->withErrors(['message' => 'User not authenticated']);
        }

        // Get the user's household
        $userHousehold = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$userHousehold) {
            return back()->withErrors(['message' => 'Household not found. Please contact support.']);
        }

        // Get the resident being requested
        $requestedResident = Resident::find($validated['resident_id']);
        
        if (!$requestedResident) {
            return back()->withErrors(['message' => 'Resident not found']);
        }

        // Check if requested resident belongs to user's household
        if ($requestedResident->household_id !== $userHousehold->id) {
            return back()->withErrors(['message' => 'You can only request clearance for residents in your household']);
        }

        // Get clearance type
        $clearanceType = ClearanceType::findOrFail($validated['clearance_type_id']);

        // Generate reference number
        $referenceNumber = 'CLEAR-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Create clearance request
        $clearanceRequest = ClearanceRequest::create([
            'resident_id' => $validated['resident_id'],
            'clearance_type_id' => $validated['clearance_type_id'],
            'reference_number' => $referenceNumber,
            'purpose' => $validated['purpose'],
            'specific_purpose' => $validated['specific_purpose'] ?? null,
            'needed_date' => $validated['needed_date'],
            'additional_notes' => $validated['additional_notes'] ?? null,
            'fee_amount' => $clearanceType->fee,
            'status' => 'pending',
            'requested_by_user_id' => $user->id,
            'household_id' => $userHousehold->id,
        ]);

        // Load relationships for notification
        $clearanceRequest->load(['resident', 'clearance_type']);

     // ============ NOTIFICATION TO OFFICIALS ONLY ============
    try {
        // Target roles that should receive this notification - USE EXACT NAMES
        $targetRoles = ['Administrator', 'Barangay Captain', 'Barangay Secretary'];
        
        // Get users through role relationship
        $officials = User::whereHas('role', function($query) use ($targetRoles) {
            $query->whereIn('name', $targetRoles);
        })->get();
        
        // Send notification to EACH official individually
        foreach ($officials as $official) {
            $official->notify(new ClearanceRequestNotification($clearanceRequest, 'submitted'));
        }
        
        Log::info('Clearance request notification sent to officials', [
            'clearance_id' => $clearanceRequest->id,
            'target_roles' => $targetRoles,
            'recipient_count' => $officials->count(),
            'recipient_ids' => $officials->pluck('id')->toArray()
        ]);
        
    } catch (\Exception $e) {
        Log::error('Failed to send notifications to officials', [
            'error' => $e->getMessage(),
            'clearance_id' => $clearanceRequest->id
        ]);
    }
    // =========================================================

        // Handle file uploads
        $this->handleDocumentUploads($request, $clearanceRequest);

        // Calculate estimated completion
        $estimatedCompletion = now()->addDays($clearanceType->processing_days);
        $formattedDate = $estimatedCompletion->format('F j, Y');

        Log::info('Clearance request submitted successfully', [
            'request_id' => $clearanceRequest->id,
            'reference_number' => $clearanceRequest->reference_number,
        ]);

        return redirect()->route('portal.my.clearances.index')
            ->with('success', 'Clearance request submitted successfully!')
            ->with('reference_number', $referenceNumber)
            ->with('estimated_completion', $formattedDate);

    } catch (\Illuminate\Validation\ValidationException $e) {
        throw $e;
    } catch (\Exception $e) {
        Log::error('Clearance request submission failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'user_id' => Auth::id() ?? 'unknown',
        ]);
        
        return back()->withErrors([
            'message' => 'Failed to submit request. Please try again later.'
        ]);
    }
}

    /**
     * Cancel a clearance request.
     */
    public function cancel(ClearanceRequest $clearanceRequest, Request $request)
    {
        $user = Auth::user();
        
        // Check authorization
        if ($clearanceRequest->requested_by_user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
        
        // Only allow cancellation if request is still pending
        if ($clearanceRequest->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Cannot cancel request. Current status: ' . $clearanceRequest->status);
        }
        
        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Update status
            $clearanceRequest->update([
                'status' => 'cancelled',
                'cancellation_reason' => $validated['cancellation_reason'],
                'cancelled_at' => now(),
                'cancelled_by' => $user->id,
            ]);

            // Load relationships for notification
            $clearanceRequest->load(['resident', 'clearance_type']);
            
            // Send cancellation notification to requester
            $user->notify(new ClearanceRequestNotification($clearanceRequest, 'cancelled'));
            
            // Send cancellation notification to admins
            $admins = User::whereIn('role', ['admin', 'captain', 'secretary'])->get();
            foreach ($admins as $admin) {
                $admin->notify(new ClearanceRequestNotification($clearanceRequest, 'cancelled'));
            }
            
            DB::commit();
            
            Log::info('Clearance request cancelled', [
                'request_id' => $clearanceRequest->id,
                'user_id' => $user->id,
            ]);
            
            return redirect()->back()
                ->with('success', 'Clearance request cancelled successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cancelling clearance request', [
                'request_id' => $clearanceRequest->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to cancel request. Please try again.');
        }
    }

    // ==================== FORMATTING METHODS ====================

    /**
     * Format household data for Inertia
     */
    private function formatHouseholdData($household, $headResident = null)
    {
        if (!$household) {
            return null;
        }
        
        return [
            'id' => (int) $household->id,
            'household_number' => $household->household_number,
            'address' => $household->address,
            'full_address' => $household->address,
            'head_of_family' => $headResident ? $headResident->full_name : $household->head_of_family,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'member_count' => (int) $household->member_count,
            'status' => $household->status,
            'purok' => $household->purok ? [
                'id' => (int) $household->purok->id,
                'name' => $household->purok->name,
            ] : null,
            'head_of_household' => $headResident ? $this->formatResidentBasic($headResident) : null,
        ];
    }

    /**
     * Format household basic info
     */
    private function formatHouseholdBasic($household)
    {
        if (!$household) {
            return null;
        }
        
        return [
            'id' => (int) $household->id,
            'household_number' => $household->household_number,
            'address' => $household->address,
            'head_of_family' => $household->head_of_family,
            'member_count' => (int) $household->member_count,
        ];
    }

    /**
     * Format resident basic data
     */
    private function formatResidentBasic($resident)
    {
        if (!$resident) {
            return null;
        }
        
        return [
            'id' => (int) $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'full_name' => $resident->full_name,
            'address' => $resident->address,
            'contact_number' => $resident->contact_number,
            'purok_name' => $resident->purok_name,
            'household_id' => (int) $resident->household_id,
            'age' => (int) $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'occupation' => $resident->occupation,
            'is_voter' => (bool) $resident->is_voter,
        ];
    }

    /**
     * Format residents collection
     */
    private function formatResidents($residents)
    {
        return $residents->map(function($resident) {
            return $this->formatResidentBasic($resident);
        })->toArray();
    }

    /**
     * Format clearances for listing
     */
    private function formatClearances($clearances)
    {
        $clearances->getCollection()->transform(function($clearance) {
            return [
                'id' => (int) $clearance->id,
                'reference_number' => $clearance->reference_number,
                'control_number' => $clearance->control_number,
                'purpose' => $clearance->purpose,
                'specific_purpose' => $clearance->specific_purpose,
                'fee_amount' => (float) $clearance->fee_amount,
                'status' => $clearance->status,
                'created_at' => $clearance->created_at?->toDateTimeString(),
                'needed_date' => $clearance->needed_date?->toDateString(),
                'resident' => $clearance->resident ? [
                    'id' => (int) $clearance->resident->id,
                    'full_name' => $clearance->resident->full_name,
                ] : null,
                'clearance_type' => $clearance->clearance_type ? [
                    'id' => (int) $clearance->clearance_type->id,
                    'name' => $clearance->clearance_type->name,
                ] : null,
            ];
        });
        
        return $clearances;
    }

    /**
     * Format single clearance detail
     */
    private function formatClearanceDetail($clearance)
    {
        return [
            'id' => (int) $clearance->id,
            'reference_number' => $clearance->reference_number,
            'control_number' => $clearance->control_number,
            'purpose' => $clearance->purpose,
            'specific_purpose' => $clearance->specific_purpose,
            'additional_notes' => $clearance->additional_notes,
            'fee_amount' => (float) $clearance->fee_amount,
            'status' => $clearance->status,
            'created_at' => $clearance->created_at?->toDateTimeString(),
            'updated_at' => $clearance->updated_at?->toDateTimeString(),
            'needed_date' => $clearance->needed_date?->toDateString(),
            'processed_at' => $clearance->processed_at?->toDateTimeString(),
            'approved_at' => $clearance->approved_at?->toDateTimeString(),
            'issued_at' => $clearance->issued_at?->toDateTimeString(),
            'rejected_at' => $clearance->rejected_at?->toDateTimeString(),
            'rejection_reason' => $clearance->rejection_reason,
            'cancelled_at' => $clearance->cancelled_at?->toDateTimeString(),
            'cancellation_reason' => $clearance->cancellation_reason,
            'resident' => $clearance->resident ? $this->formatResidentBasic($clearance->resident) : null,
            'clearance_type' => $clearance->clearance_type ? [
                'id' => (int) $clearance->clearance_type->id,
                'name' => $clearance->clearance_type->name,
                'code' => $clearance->clearance_type->code,
                'fee' => (float) $clearance->clearance_type->fee,
                'processing_days' => (int) $clearance->clearance_type->processing_days,
                'validity_days' => (int) $clearance->clearance_type->validity_days,
            ] : null,
            'documents' => $clearance->documents->map(function($doc) {
                return [
                    'id' => (int) $doc->id,
                    'file_name' => $doc->file_name,
                    'original_name' => $doc->original_name,
                    'file_path' => $doc->file_path,
                    'description' => $doc->description,
                    'file_size' => (int) $doc->file_size,
                    'file_type' => $doc->file_type,
                    'document_type' => $doc->documentType ? [
                        'id' => (int) $doc->documentType->id,
                        'name' => $doc->documentType->name,
                    ] : null,
                    'created_at' => $doc->created_at?->toDateTimeString(),
                ];
            }),
            'status_history' => $clearance->statusHistory->map(function($history) {
                return [
                    'id' => (int) $history->id,
                    'status' => $history->status,
                    'remarks' => $history->remarks,
                    'created_at' => $history->created_at?->toDateTimeString(),
                    'causer' => $history->causer ? [
                        'id' => (int) $history->causer->id,
                        'name' => $history->causer->name,
                    ] : null,
                ];
            }),
        ];
    }

    /**
     * Format clearance types with requirements
     */
    private function formatClearanceTypes($clearanceTypes)
    {
        $allDocTypes = DocumentType::where('is_active', true)
            ->get()
            ->keyBy('id');
        
        $requirements = DB::table('document_requirements')
            ->whereIn('clearance_type_id', $clearanceTypes->pluck('id'))
            ->orderBy('clearance_type_id')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('clearance_type_id');
        
        return $clearanceTypes->map(function ($type) use ($requirements, $allDocTypes) {
            $documentTypes = [];
            
            if (isset($requirements[$type->id])) {
                foreach ($requirements[$type->id] as $requirement) {
                    if (isset($allDocTypes[$requirement->document_type_id])) {
                        $docType = $allDocTypes[$requirement->document_type_id];
                        $documentTypes[] = [
                            'id' => (int) $requirement->document_type_id,
                            'name' => $docType->name,
                            'description' => $docType->description ?? '',
                            'is_required' => (bool) $requirement->is_required,
                            'sort_order' => (int) $requirement->sort_order,
                        ];
                    }
                }
                
                usort($documentTypes, function ($a, $b) {
                    return $a['sort_order'] <=> $b['sort_order'];
                });
            }
            
            return [
                'id' => (int) $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'fee' => (float) $type->fee,
                'formatted_fee' => '₱' . number_format($type->fee, 2),
                'processing_days' => (int) $type->processing_days,
                'validity_days' => (int) $type->validity_days,
                'description' => $type->description ?? '',
                'is_active' => (bool) $type->is_active,
                'requires_payment' => (bool) $type->requires_payment,
                'requires_approval' => (bool) $type->requires_approval,
                'is_online_only' => (bool) $type->is_online_only,
                'document_types' => $documentTypes,
                'purpose_options' => $this->parsePurposeOptions($type->purpose_options),
                'has_required_documents' => collect($documentTypes)->contains('is_required', true),
                'document_types_count' => count($documentTypes),
            ];
        })->toArray();
    }

    /**
     * Handle document uploads
     */
    private function handleDocumentUploads(Request $request, $clearanceRequest)
    {
        if (!$request->hasFile('documents')) {
            return;
        }
        
        $documents = $request->file('documents');
        
        foreach ($documents as $index => $file) {
            try {
                if (!$file->isValid()) {
                    continue;
                }
                
                $documentTypeId = $request->input("document_type_ids.{$index}");
                
                // Validate document type exists if provided
                if ($documentTypeId && !DocumentType::where('id', $documentTypeId)->exists()) {
                    $documentTypeId = null;
                }
                
                $extension = $file->getClientOriginalExtension();
                $filename = 'clearance_' . $clearanceRequest->id . '_' . time() . '_' . $index . '.' . $extension;
                $path = $file->storeAs('clearance_docs', $filename, 'public');
                
                $description = $request->input("descriptions.{$index}", '');
                
                ClearanceRequestDocument::create([
                    'clearance_request_id' => $clearanceRequest->id,
                    'document_type_id' => $documentTypeId,
                    'file_path' => $path,
                    'file_name' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'description' => $description,
                    'file_size' => $file->getSize(),
                    'file_type' => $extension,
                ]);
                
            } catch (\Exception $e) {
                Log::error('Document upload failed', [
                    'error' => $e->getMessage(),
                    'file' => $file->getClientOriginalName(),
                    'request_id' => $clearanceRequest->id
                ]);
            }
        }
    }
    
    /**
     * Parse purpose options
     */
    private function parsePurposeOptions($purposeOptions): array
    {
        if (empty($purposeOptions)) {
            return ['Employment', 'Business Registration', 'School Requirement', 
                    'Government Transaction', 'Bank Loan', 'Other Purpose'];
        }
        
        if (is_string($purposeOptions)) {
            return array_map('trim', explode(',', $purposeOptions));
        }
        
        if (is_array($purposeOptions)) {
            return $purposeOptions;
        }
        
        return [];
    }
    
    /**
     * Get the head resident of a household
     */
    private function getHeadResident(Household $household)
    {
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();
            
        if ($headMember && $headMember->resident) {
            return $headMember->resident;
        }
        
        return Resident::where('household_id', $household->id)->first();
    }
    
    /**
     * Check if resident is head of household
     */
    private function isHeadOfHousehold(Household $household, Resident $resident): bool
    {
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('resident_id', $resident->id)
            ->where('is_head', true)
            ->first();
            
        return $headMember ? true : false;
    }
}