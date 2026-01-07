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
        $household = Household::where('user_id', $user->id)->first();
        
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
                    'household' => $household,
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
        
        // Get statistics - include all your statuses
        $statistics = [
            'total' => ClearanceRequest::whereIn('resident_id', $residentIds)->count(),
            'pending' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'pending')->count(),
            'pending_payment' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'pending_payment')->count(),
            'processing' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'processing')->count(),
            'approved' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'approved')->count(),
            'issued' => ClearanceRequest::whereIn('resident_id', $residentIds)->where('status', 'issued')->count(),
            // You might want to consider what status counts as "completed" - maybe 'issued'?
            'completed' => ClearanceRequest::whereIn('resident_id', $residentIds)
                ->whereIn('status', ['issued']) // Or whatever you consider completed
                ->count(),
        ];
        
        // Get the head resident
        $headResident = $residents->firstWhere('id', $household->head_resident_id);
        
        return Inertia::render('resident/Clearances/Index', [
            'clearances' => $clearances,
            'filters' => $request->only(['search', 'status', 'resident']),
            'statistics' => $statistics,
            'householdResidents' => $residents,
            'currentResident' => $headResident ?? $residents->first(),
            'household' => $household,
        ]);
    }
    
public function show(ClearanceRequest $clearance)
{
    // Manual authorization - resident can only view their own clearances
    $user = auth()->user();
    
    // Get the user's household
    $household = Household::where('user_id', $user->id)->first();
    
    if (!$household) {
        abort(403, 'You are not associated with any household.');
    }
    
    // Get all residents in the household
    $residentIds = Resident::where('household_id', $household->id)->pluck('id');
    
    // Check if the clearance belongs to any resident in the household
    if (!in_array($clearance->resident_id, $residentIds->toArray())) {
        abort(403, 'You are not authorized to view this clearance.');
    }
    
    // Load relationships - use camelCase for the relationship name
    $clearance->load([
        'clearance_type',
        'documents.documentType',
        'payment',
        'statusHistory.causer', // Changed from 'status_history' to 'statusHistory'
    ]);
    
    return Inertia::render('resident/Clearances/Show', [
        'clearance' => $clearance,
    ]);
}
    
    /**
     * Show the form for creating a new clearance request.
     */
    public function create()
    {
        $user = Auth::user();
        
        // Find the household where this user is the head
        $household = Household::where('user_id', $user->id)->first();
        
        if (!$household) {
            return redirect()->route('resident.dashboard')
                ->with('error', 'You are not registered as a household head.');
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
            ->map(function ($member) use ($headMember) {
                $resident = $member->resident;
                $isHead = $member->is_head;
                
                return [
                    'id' => (int) $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'full_name' => $resident->full_name,
                    'address' => $resident->address,
                    'contact_number' => $resident->contact_number,
                    'purok_name' => $resident->purok_name,
                    'household_id' => $member->household_id,
                    'is_head' => $isHead,
                    'relationship' => $isHead ? 'Head' : ($member->relationship_to_head ?? 'Family Member'),
                ];
            })
            ->toArray();
        
        // Get active clearance types
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get();
        
        // Get all active document types for reference
        $allDocTypes = DocumentType::where('is_active', true)
            ->get()
            ->keyBy('id');
        
        // Get document requirements grouped by clearance type
        $requirements = DB::table('document_requirements')
            ->whereIn('clearance_type_id', $clearanceTypes->pluck('id'))
            ->orderBy('clearance_type_id')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('clearance_type_id');
        
        // Format clearance types with their document requirements
        $formattedClearanceTypes = $clearanceTypes->map(function ($type) use ($requirements, $allDocTypes) {
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
                
                // Sort by sort_order
                usort($documentTypes, function ($a, $b) {
                    return $a['sort_order'] <=> $b['sort_order'];
                });
            }
            
            // Parse purpose options
            $purposeOptions = $this->parsePurposeOptions($type->purpose_options);
            
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
                'purpose_options' => $purposeOptions,
                'has_required_documents' => collect($documentTypes)->contains('is_required', true),
                'document_types_count' => count($documentTypes),
            ];
        });
        
        // Load all document types for the form dropdown
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
        
        // Format the head resident data
        $residentData = [
            'id' => (int) $headResident->id,
            'first_name' => $headResident->first_name,
            'last_name' => $headResident->last_name,
            'middle_name' => $headResident->middle_name,
            'full_name' => $headResident->full_name,
            'address' => $headResident->address,
            'contact_number' => $headResident->contact_number,
            'purok_name' => $headResident->purok_name,
            'household_id' => $headMember->household_id,
            'is_head' => true,
        ];
        
        Log::info('Clearance request form loaded', [
            'user_id' => $user->id,
            'clearance_types' => $clearanceTypes->count(),
            'household_members' => count($householdMembers),
        ]);
        
        return Inertia::render('resident/Clearances/Request', [
            'clearanceTypes' => $formattedClearanceTypes,
            'resident' => $residentData,
            'householdMembers' => $householdMembers,
            'household_info' => [
                'id' => $household->id,
                'number' => $household->household_number,
                'head_name' => $household->head_of_family,
                'address' => $household->address,
            ],
            'allDocumentTypes' => $allDocumentTypes,
        ]);
    }
    
    /**
     * Store a newly created clearance request in storage.
     */
    public function store(Request $request)
    {
        try {
            // Simple validation
            $validated = $request->validate([
                'clearance_type_id' => 'required|exists:clearance_types,id',
                'purpose' => 'required|string|max:255',
                'specific_purpose' => 'required|string',
                'needed_date' => 'required|date|after:today',
                'resident_id' => 'required|exists:residents,id',
            ]);
    
            // Get the logged-in user
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }
    
            // Get the user's household
            $userHousehold = Household::where('user_id', $user->id)->first();
            
            if (!$userHousehold) {
                return response()->json([
                    'message' => 'Household not found. Please contact support.'
                ], 422);
            }
    
            // Get the resident being requested
            $requestedResident = Resident::find($validated['resident_id']);
            
            if (!$requestedResident) {
                return response()->json([
                    'message' => 'Resident not found'
                ], 422);
            }
    
            // Check if requested resident belongs to user's household
            if ($requestedResident->household_id !== $userHousehold->id) {
                return response()->json([
                    'message' => 'You can only request clearance for residents in your household'
                ], 403);
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
                'specific_purpose' => $validated['specific_purpose'],
                'needed_date' => $validated['needed_date'],
                'fee_amount' => $clearanceType->fee,
                'status' => 'pending',
                'requested_by_user_id' => $user->id, // Store user who made the request
                'household_id' => $userHousehold->id, // Store household for reference
            ]);
    
            // Handle file uploads
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    if ($file->isValid()) {
                        // Generate filename
                        $filename = 'clearance_' . $clearanceRequest->id . '_' . time() . '_' . $index . '.' . $file->getClientOriginalExtension();
                        $path = $file->storeAs('clearance_docs', $filename, 'public');
                        
                        // Get description if provided
                        $description = $request->input("descriptions.{$index}", '');
                        
                        // Save document record
                        ClearanceRequestDocument::create([
                            'clearance_request_id' => $clearanceRequest->id,
                            'file_path' => $path,
                            'file_name' => $filename,
                            'original_name' => $file->getClientOriginalName(),
                            'description' => $description,
                            'file_size' => $file->getSize(),
                            'file_type' => $file->getClientOriginalExtension(),
                        ]);
                    }
                }
            }
    
            // Calculate estimated completion
            $estimatedCompletion = now()->addDays($clearanceType->processing_days)->format('F j, Y');
    
            return response()->json([
                'success' => true,
                'message' => 'Clearance request submitted successfully!',
                'reference_number' => $referenceNumber,
                'estimated_completion' => $estimatedCompletion,
                'total_fee' => $clearanceType->fee,
                'redirect_url' => '/my-clearances'
            ]);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors(),
                'message' => 'Validation failed. Please check your input.'
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Clearance request error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request' => $request->except(['documents'])
            ]);
            
            return response()->json([
                'message' => 'Failed to submit request. Please try again later.'
            ], 500);
        }
    }
    
    /**
     * Cancel a clearance request.
     */
    public function cancel(ClearanceRequest $clearanceRequest, Request $request)
    {
        $user = Auth::user();
        
        // Check authorization - use requested_by_user_id
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
            
            // Using the new status_history relationship
            // The activity will be automatically logged via Spatie's LogsActivity trait
            
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
    
    /**
     * Helper method to parse purpose options.
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
}