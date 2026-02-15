<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\IncidentEvidence;
use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResidentIncidentController extends Controller
{
    /**
     * List incidents filed by resident
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get the resident that this user account is currently representing
        $resident = null;
        if ($user->current_resident_id) {
            $resident = Resident::with(['household'])->find($user->current_resident_id);
        }
        
        Log::info('Resident accessing incidents index', [
            'user_id' => $user->id,
            'resident_id' => $resident?->id,
            'filters' => $request->only(['search', 'status', 'type'])
        ]);
        
        // Start query - incidents filed by this user
        $query = Incident::where('user_id', $user->id);
        
        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reported_as_name', 'like', "%{$search}%");
            });
            
            Log::debug('Search filter applied', ['search_term' => $search]);
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            $query->where('status', $status);
            Log::debug('Status filter applied', ['status' => $status]);
        }

        if ($request->filled('type')) {
            $type = $request->input('type');
            $query->where('type', $type);
            Log::debug('Type filter applied', ['type' => $type]);
        }

        $incidents = $query->with(['household', 'blotterDetails'])
                          ->withCount('evidences')
                          ->latest()
                          ->paginate(10)
                          ->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => Incident::where('user_id', $user->id)->count(),
            'pending' => Incident::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'under_investigation' => Incident::where('user_id', $user->id)
                ->where('status', 'under_investigation')
                ->count(),
            'resolved' => Incident::where('user_id', $user->id)
                ->where('status', 'resolved')
                ->count(),
            'dismissed' => Incident::where('user_id', $user->id)
                ->where('status', 'dismissed')
                ->count(),
            'by_type' => Incident::where('user_id', $user->id)
                ->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        Log::info('Incidents list retrieved', [
            'user_id' => $user->id,
            'total_incidents' => $incidents->total(),
            'current_page' => $incidents->currentPage()
        ]);

        return Inertia::render('resident/Incidents/Index', [
            'incidents' => $incidents,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'type']),
            'currentResident' => $resident,
            'household' => $resident ? $resident->household : null,
        ]);
    }

    /**
     * Show the form for creating a new incident report.
     */
    public function create()
    {
        $user = Auth::user();
        
        Log::info('Resident accessing incident creation form', [
            'user_id' => $user->id,
            'current_resident_id' => $user->current_resident_id
        ]);
        
        // Get the resident that this user account is currently representing
        $resident = null;
        if ($user->current_resident_id) {
            $resident = Resident::with(['household', 'household.purok'])->find($user->current_resident_id);
        }
        
        // If no resident is linked to this user account
        if (!$resident) {
            Log::warning('No resident profile linked to user account', [
                'user_id' => $user->id,
                'user_name' => $user->full_name
            ]);
            
            // Try to find any resident with this user_id
            $resident = Resident::where('user_id', $user->id)->first();
            
            if (!$resident) {
                // No resident found at all - this is a user without a resident profile
                return Inertia::render('resident/Incidents/Create', [
                    'resident' => [
                        'id' => 0,
                        'name' => $user->full_name,
                        'household_number' => 'N/A',
                        'address' => 'N/A',
                        'email' => $user->email,
                        'phone' => $user->contact_number ?: 'N/A',
                        'is_profile_complete' => false,
                        'missing_fields' => ['resident_profile'],
                        'household_id' => null,
                        'current_user_account' => [
                            'id' => $user->id,
                            'status' => $user->status,
                        ],
                    ],
                    'household' => null,
                ]);
            }
        }
        
        // At this point, we have a resident
        Log::debug('Resident found for incident creation', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->full_name,
            'has_household' => !is_null($resident->household),
            'household_id' => $resident->household_id
        ]);
        
        // Get household data
        $household = $resident->household;
        
        // Get household number
        $householdNumber = 'N/A';
        if ($household) {
            $householdNumber = $household->household_number ?? 'N/A';
            
            Log::debug('Household data loaded', [
                'household_id' => $household->id,
                'household_number' => $householdNumber
            ]);
        } else {
            Log::warning('Resident has no household assigned', [
                'resident_id' => $resident->id,
                'resident_name' => $resident->full_name
            ]);
        }
        
        // Check if resident is a member of the household
        $isHouseholdMember = false;
        $isHeadOfHousehold = false;
        if ($household) {
            $householdMember = HouseholdMember::where('household_id', $household->id)
                ->where('resident_id', $resident->id)
                ->first();
            
            $isHouseholdMember = !is_null($householdMember);
            $isHeadOfHousehold = $householdMember ? $householdMember->is_head : false;
            
            Log::debug('Household membership check', [
                'resident_id' => $resident->id,
                'household_id' => $household->id,
                'is_member' => $isHouseholdMember,
                'is_head' => $isHeadOfHousehold
            ]);
        }
        
        // Get address
        $address = 'N/A';
        if ($resident->address && $resident->address !== 'N/A') {
            $address = $resident->address;
        } elseif ($household && $household->address && $household->address !== 'N/A') {
            $address = $household->address;
        } elseif ($resident->purok) {
            $address = $resident->purok->name ?? 'N/A';
        }
        
        // Get contact number
        $contactNumber = 'N/A';
        if ($resident->contact_number && $resident->contact_number !== 'N/A') {
            $contactNumber = $resident->contact_number;
        } elseif ($household && $household->contact_number && $household->contact_number !== 'N/A') {
            $contactNumber = $household->contact_number;
        } elseif ($user->contact_number && $user->contact_number !== 'N/A') {
            $contactNumber = $user->contact_number;
        }
        
        // Get email
        $email = 'N/A';
        if ($resident->email && $resident->email !== 'N/A') {
            $email = $resident->email;
        } elseif ($household && $household->email && $household->email !== 'N/A') {
            $email = $household->email;
        } elseif ($user->email && $user->email !== 'N/A') {
            $email = $user->email;
        }
        
        // Check profile completeness
        $isProfileComplete = $this->isResidentProfileComplete($resident, $household, $isHouseholdMember);
        $missingFields = $this->getMissingResidentFields($resident, $household, $isHouseholdMember);
        
        // Check if this resident is the current user for the household
        $currentUserAccount = null;
        if ($household && $household->user_id == $user->id && $user->current_resident_id == $resident->id) {
            $currentUserAccount = [
                'id' => $user->id,
                'status' => $user->status,
            ];
        }
        
        // Prepare household data
        $householdData = $this->prepareHouseholdData($household);
        
        Log::debug('Final resident data prepared for form', [
            'resident_id' => $resident->id,
            'household_number' => $householdNumber,
            'address' => $address,
            'contact_number' => $contactNumber,
            'email' => $email,
            'is_profile_complete' => $isProfileComplete,
            'missing_fields' => $missingFields,
            'is_head_of_household' => $isHeadOfHousehold,
            'has_user_account' => !is_null($currentUserAccount)
        ]);
        
        return Inertia::render('resident/Incidents/Create', [
            'resident' => [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'household_number' => $householdNumber,
                'address' => $address,
                'email' => $email,
                'phone' => $contactNumber,
                'is_profile_complete' => $isProfileComplete,
                'missing_fields' => $missingFields,
                'household_id' => $resident->household_id,
                'current_user_account' => $currentUserAccount,
                'is_head_of_household' => $isHeadOfHousehold,
            ],
            'household' => $householdData,
        ]);
    }
    
    /**
     * Check if resident profile is complete
     */
    private function isResidentProfileComplete($resident, $household, $isHouseholdMember): bool
    {
        // Required fields check
        $requiredFields = [
            'contact_number' => $resident->contact_number,
            'address' => $resident->address,
            'household_id' => $resident->household_id,
        ];
        
        foreach ($requiredFields as $field => $value) {
            if (empty($value) || $value === 'N/A') {
                return false;
            }
        }
        
        // Additional check: resident must be a member of the household
        if (!$isHouseholdMember) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get missing fields for resident
     */
    private function getMissingResidentFields($resident, $household, $isHouseholdMember): array
    {
        $missing = [];
        
        if (empty($resident->contact_number) || $resident->contact_number === 'N/A') {
            $missing[] = 'contact_number';
        }
        
        if (empty($resident->address) || $resident->address === 'N/A') {
            $missing[] = 'address';
        }
        
        if (empty($resident->household_id)) {
            $missing[] = 'household_assignment';
        } elseif (!$isHouseholdMember) {
            $missing[] = 'household_membership';
        }
        
        return $missing;
    }
    
    /**
     * Prepare household data for React component
     */
    private function prepareHouseholdData($household): ?array
    {
        if (!$household) {
            return null;
        }
        
        // Get head of household from household_members table
        $headOfHousehold = null;
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->with('resident')
            ->first();
        
        if ($headMember && $headMember->resident) {
            $headOfHousehold = [
                'id' => $headMember->resident->id,
                'name' => $headMember->resident->full_name,
            ];
        }
        
        // Get purok name
        $purokName = 'N/A';
        if ($household->purok) {
            $purokName = $household->purok->name;
        }
        
        // Get member count
        $memberCount = HouseholdMember::where('household_id', $household->id)->count();
        
        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'address' => $household->address,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'purok_name' => $purokName,
            'member_count' => $memberCount,
            'head_of_household' => $headOfHousehold,
        ];
    }

    /**
     * Store a new incident (resident)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to store new incident', [
            'user_id' => $user->id,
            'user_name' => $user->full_name,
            'current_resident_id' => $user->current_resident_id,
            'request_data' => $request->except(['evidence', '_token']),
            'evidence_count' => $request->hasFile('evidence') ? count($request->file('evidence')) : 0
        ]);
        
        // Get the resident that this user account is currently representing
        $resident = null;
        if ($user->current_resident_id) {
            $resident = Resident::with(['household'])->find($user->current_resident_id);
        }
        
        Log::debug('User relationship check', [
            'user_id' => $user->id,
            'current_resident_id' => $user->current_resident_id,
            'resident_found' => !is_null($resident),
            'resident_id' => $resident?->id,
            'resident_household_id' => $resident?->household_id
        ]);
        
        $validated = $request->validate([
            'type' => 'required|in:complaint,blotter',
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'location' => 'required|string|max:500',
            'incident_date' => 'required|date|before_or_equal:now',
            'priority' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'respondent_name' => 'required_if:type,blotter|nullable|string|max:255',
            'hearing_date' => 'nullable|date|after:today',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi'
        ]);

        try {
            DB::beginTransaction();

            Log::debug('Validation passed for new incident', [
                'type' => $validated['type'],
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'has_hearing_date' => !empty($validated['hearing_date'])
            ]);
            
            // Determine reported name
            $reportedAsName = $validated['is_anonymous'] 
                ? 'Anonymous'
                : ($resident ? $resident->full_name : $user->full_name);

            Log::debug('Determined reported name', [
                'original_name' => $resident ? $resident->full_name : $user->full_name,
                'reported_as' => $reportedAsName,
                'is_anonymous' => $validated['is_anonymous'] ?? false
            ]);

            // Check if resident is a household member
            $household = $resident?->household;
            $householdId = null;
            if ($household) {
                $householdMember = HouseholdMember::where('household_id', $household->id)
                    ->where('resident_id', $resident->id)
                    ->first();
                
                if ($householdMember) {
                    $householdId = $household->id;
                } else {
                    Log::warning('Resident is not a member of the assigned household', [
                        'resident_id' => $resident->id,
                        'household_id' => $household->id
                    ]);
                }
            }

            // Create incident with nullable resident and household IDs
            $incidentData = [
                'user_id' => $user->id,
                'resident_id' => $resident?->id,
                'household_id' => $householdId,
                'type' => $validated['type'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'location' => $validated['location'],
                'incident_date' => $validated['incident_date'],
                'priority' => $validated['priority'],
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'status' => 'pending',
                'reported_as_name' => $reportedAsName,
            ];
            
            Log::debug('Creating incident with data', $incidentData);
            
            $incident = Incident::create($incidentData);

            Log::info('Incident created successfully', [
                'incident_id' => $incident->id,
                'type' => $incident->type,
                'status' => $incident->status,
                'resident_id' => $incident->resident_id,
                'household_id' => $incident->household_id
            ]);

            // Create blotter details if type is blotter
            if ($validated['type'] === 'blotter') {
                $blotterData = [
                    'incident_id' => $incident->id,
                    'respondent_name' => $validated['respondent_name'],
                ];
                
                if (!empty($validated['hearing_date'])) {
                    $blotterData['hearing_date'] = $validated['hearing_date'];
                }
                
                $blotterDetails = $incident->blotterDetails()->create($blotterData);
                
                Log::info('Blotter details created', [
                    'incident_id' => $incident->id,
                    'blotter_id' => $blotterDetails->id,
                    'respondent_name' => $validated['respondent_name'],
                    'has_hearing_date' => !empty($validated['hearing_date'])
                ]);
            }

            // Handle file uploads
            $uploadedFiles = [];
            if ($request->hasFile('evidence')) {
                Log::debug('Processing evidence file uploads', [
                    'file_count' => count($request->file('evidence'))
                ]);
                
                foreach ($request->file('evidence') as $index => $file) {
                    // Sanitize filename
                    $originalName = $file->getClientOriginalName();
                    $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
                    $path = $file->storeAs('incidents/evidence', $filename, 'public');
                    
                    $evidence = IncidentEvidence::create([
                        'incident_id' => $incident->id,
                        'file_path' => $path,
                        'file_name' => $originalName,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'uploaded_by' => $user->id,
                    ]);
                    
                    $uploadedFiles[] = [
                        'evidence_id' => $evidence->id,
                        'filename' => $originalName,
                        'size' => $file->getSize(),
                        'type' => $file->getClientMimeType()
                    ];
                    
                    Log::debug('Evidence file uploaded', [
                        'evidence_id' => $evidence->id,
                        'filename' => $originalName,
                        'size' => $evidence->file_size,
                        'type' => $evidence->file_type
                    ]);
                }
                
                Log::info('All evidence files processed', [
                    'incident_id' => $incident->id,
                    'total_files' => count($uploadedFiles),
                    'files' => $uploadedFiles
                ]);
            }

            DB::commit();

            Log::info('Incident successfully stored with all data', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'type' => $incident->type,
                'evidence_count' => count($uploadedFiles),
                'transaction_committed' => true
            ]);

            return redirect()->route('my.incidents.show', $incident->id)
                ->with('success', ucfirst($validated['type']) . ' filed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to store incident', [
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['evidence', '_token']),
                'transaction_rolled_back' => true
            ]);
            
            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to file incident. Please try again.']);
        }
    }

    /**
     * Show specific incident (resident view)
     */
    public function show(Incident $incident)
    {
        $user = Auth::user();
        
        Log::info('Resident accessing incident details', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'incident_user_id' => $incident->user_id
        ]);
        
        // Authorization check
        if ($incident->user_id !== $user->id) {
            Log::warning('Unauthorized access attempt to incident', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403, 'Unauthorized access.');
        }

        // Load incident with relations
        $incident->load(['household', 'blotterDetails', 'evidences']);
        
        // Transform evidences to include URLs and file info
        $incident->evidences->transform(function ($evidence) {
            $evidence->file_url = Storage::url($evidence->file_path);
            $evidence->is_image = $this->isImageFile($evidence->file_type);
            $evidence->formatted_size = $this->formatBytes($evidence->file_size);
            return $evidence;
        });

        Log::debug('Incident loaded with relations', [
            'incident_id' => $incident->id,
            'evidence_count' => $incident->evidences->count(),
            'has_blotter_details' => !is_null($incident->blotterDetails)
        ]);

        return Inertia::render('Resident/Incidents/Show', [
            'incident' => $incident,
            'canEdit' => $incident->user_id === $user->id && $incident->status === 'pending',
        ]);
    }

    /**
     * Edit incident form
     */
    public function edit(Incident $incident)
    {
        $user = Auth::user();
        
        Log::info('Resident accessing incident edit form', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'incident_status' => $incident->status
        ]);
        
        // Authorization check
        if ($incident->user_id !== $user->id || $incident->status !== 'pending') {
            Log::warning('Unauthorized or invalid edit attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'incident_status' => $incident->status,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403, 'Unauthorized access or incident cannot be edited.');
        }

        $incident->load(['blotterDetails', 'evidences']);
        
        // Transform evidences
        $incident->evidences->transform(function ($evidence) {
            $evidence->file_url = Storage::url($evidence->file_path);
            $evidence->is_image = $this->isImageFile($evidence->file_type);
            $evidence->formatted_size = $this->formatBytes($evidence->file_size);
            return $evidence;
        });

        Log::debug('Incident data prepared for edit form', [
            'incident_id' => $incident->id,
            'evidence_count' => $incident->evidences->count(),
            'type' => $incident->type
        ]);

        return Inertia::render('Resident/Incidents/Edit', [
            'incident' => $incident,
        ]);
    }

    /**
     * Update incident
     */
    public function update(Request $request, Incident $incident)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to update incident', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'current_status' => $incident->status,
            'request_data' => $request->except(['evidence', 'remove_evidence', '_token']),
            'has_new_evidence' => $request->hasFile('evidence'),
            'evidence_to_remove_count' => count($request->input('remove_evidence', []))
        ]);
        
        // Authorization check
        if ($incident->user_id !== $user->id || $incident->status !== 'pending') {
            Log::warning('Unauthorized or invalid update attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'incident_status' => $incident->status,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403, 'Unauthorized access or incident cannot be edited.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'location' => 'required|string|max:500',
            'incident_date' => 'required|date|before_or_equal:now',
            'priority' => 'required|in:low,medium,high',
            'is_anonymous' => 'boolean',
            'respondent_name' => $incident->type === 'blotter' ? 'required|string|max:255' : 'nullable',
            'hearing_date' => 'nullable|date|after:today',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            'remove_evidence' => 'nullable|array',
            'remove_evidence.*' => 'exists:incident_evidences,id'
        ]);

        try {
            DB::beginTransaction();

            Log::debug('Validation passed for incident update', [
                'incident_id' => $incident->id,
                'changes' => [
                    'title_changed' => $validated['title'] !== $incident->title,
                    'description_changed' => $validated['description'] !== $incident->description,
                    'anonymous_changed' => ($validated['is_anonymous'] ?? $incident->is_anonymous) !== $incident->is_anonymous
                ]
            ]);
            
            // Determine reported name for anonymous updates
            $reportedAsName = $incident->reported_as_name;
            if (($validated['is_anonymous'] ?? $incident->is_anonymous) !== $incident->is_anonymous) {
                // Get current resident
                $resident = null;
                if ($user->current_resident_id) {
                    $resident = Resident::find($user->current_resident_id);
                }
                
                $reportedAsName = $validated['is_anonymous'] 
                    ? 'Anonymous'
                    : ($resident ? $resident->full_name : $user->full_name);
                    
                Log::debug('Reported name updated due to anonymity change', [
                    'old_name' => $incident->reported_as_name,
                    'new_name' => $reportedAsName,
                    'old_anonymous' => $incident->is_anonymous,
                    'new_anonymous' => $validated['is_anonymous']
                ]);
            }

            // Update incident details
            $incident->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'location' => $validated['location'],
                'incident_date' => $validated['incident_date'],
                'priority' => $validated['priority'],
                'is_anonymous' => $validated['is_anonymous'] ?? $incident->is_anonymous,
                'reported_as_name' => $reportedAsName,
            ]);

            Log::info('Incident basic details updated', [
                'incident_id' => $incident->id,
                'updated_fields' => ['title', 'description', 'location', 'incident_date', 'priority', 'is_anonymous', 'reported_as_name']
            ]);

            // Update blotter details if applicable
            if ($incident->type === 'blotter') {
                $blotterDetails = $incident->blotterDetails()->updateOrCreate(
                    ['incident_id' => $incident->id],
                    [
                        'respondent_name' => $validated['respondent_name'],
                        'hearing_date' => $validated['hearing_date'] ?? null,
                    ]
                );
                
                Log::info('Blotter details updated/created', [
                    'incident_id' => $incident->id,
                    'blotter_id' => $blotterDetails->id,
                    'respondent_name' => $validated['respondent_name'],
                    'hearing_date' => $validated['hearing_date'] ?? 'null'
                ]);
            }

            // Handle removal of existing evidence
            $removedEvidence = [];
            if (!empty($validated['remove_evidence'])) {
                Log::debug('Processing evidence removal', [
                    'evidence_ids' => $validated['remove_evidence']
                ]);
                
                foreach ($validated['remove_evidence'] as $evidenceId) {
                    $evidence = IncidentEvidence::findOrFail($evidenceId);
                    
                    // Ensure the evidence belongs to this incident
                    if ($evidence->incident_id === $incident->id) {
                        $filePath = $evidence->file_path;
                        Storage::disk('public')->delete($filePath);
                        $evidence->delete();
                        
                        $removedEvidence[] = [
                            'evidence_id' => $evidenceId,
                            'file_path' => $filePath
                        ];
                        
                        Log::debug('Evidence removed', [
                            'evidence_id' => $evidenceId,
                            'file_path' => $filePath
                        ]);
                    } else {
                        Log::warning('Evidence removal attempted for non-matching incident', [
                            'evidence_id' => $evidenceId,
                            'evidence_incident_id' => $evidence->incident_id,
                            'requested_incident_id' => $incident->id
                        ]);
                    }
                }
                
                if (!empty($removedEvidence)) {
                    Log::info('Evidence removal completed', [
                        'incident_id' => $incident->id,
                        'removed_count' => count($removedEvidence),
                        'removed_evidence' => $removedEvidence
                    ]);
                }
            }

            // Handle new file uploads
            $newEvidence = [];
            if ($request->hasFile('evidence')) {
                Log::debug('Processing new evidence file uploads', [
                    'file_count' => count($request->file('evidence'))
                ]);
                
                foreach ($request->file('evidence') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
                    $path = $file->storeAs('incidents/evidence', $filename, 'public');
                    
                    $evidence = IncidentEvidence::create([
                        'incident_id' => $incident->id,
                        'file_path' => $path,
                        'file_name' => $originalName,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'uploaded_by' => $user->id
                    ]);
                    
                    $newEvidence[] = [
                        'evidence_id' => $evidence->id,
                        'filename' => $originalName,
                        'size' => $file->getSize(),
                        'type' => $file->getClientMimeType()
                    ];
                    
                    Log::debug('New evidence uploaded', [
                        'evidence_id' => $evidence->id,
                        'filename' => $originalName,
                        'size' => $evidence->file_size,
                        'type' => $evidence->file_type
                    ]);
                }
                
                if (!empty($newEvidence)) {
                    Log::info('New evidence upload completed', [
                        'incident_id' => $incident->id,
                        'uploaded_count' => count($newEvidence),
                        'uploaded_files' => $newEvidence
                    ]);
                }
            }

            DB::commit();

            Log::info('Incident successfully updated', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'changes_summary' => [
                    'evidence_removed' => count($removedEvidence),
                    'evidence_added' => count($newEvidence),
                    'basic_details_updated' => true
                ],
                'transaction_committed' => true
            ]);

            return redirect()->route('my.incidents.show', $incident->id)
                ->with('success', 'Incident updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to update incident', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['evidence', 'remove_evidence', '_token']),
                'transaction_rolled_back' => true
            ]);
            
            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to update incident. Please try again.']);
        }
    }

    /**
     * Delete incident
     */
    public function destroy(Incident $incident)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to delete incident', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'incident_status' => $incident->status,
            'incident_type' => $incident->type,
            'evidence_count' => $incident->evidences()->count()
        ]);
        
        // Authorization check
        if ($incident->user_id !== $user->id || $incident->status !== 'pending') {
            Log::warning('Unauthorized or invalid delete attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'incident_status' => $incident->status,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403, 'Unauthorized access or incident cannot be deleted.');
        }

        try {
            DB::beginTransaction();

            // Get evidence count before deletion
            $evidenceCount = $incident->evidences()->count();
            
            // Delete all associated evidence files
            $deletedEvidence = [];
            foreach ($incident->evidences as $evidence) {
                $filePath = $evidence->file_path;
                Storage::disk('public')->delete($filePath);
                $evidence->delete();
                
                $deletedEvidence[] = [
                    'evidence_id' => $evidence->id,
                    'file_path' => $filePath
                ];
                
                Log::debug('Evidence deleted during incident deletion', [
                    'evidence_id' => $evidence->id,
                    'file_path' => $filePath
                ]);
            }

            Log::info('All evidence files deleted', [
                'incident_id' => $incident->id,
                'evidence_count' => $evidenceCount,
                'deleted_evidence' => $deletedEvidence
            ]);

            // Delete blotter details if exists
            if ($incident->blotterDetails) {
                $blotterId = $incident->blotterDetails->id;
                $incident->blotterDetails()->delete();
                
                Log::debug('Blotter details deleted', [
                    'incident_id' => $incident->id,
                    'blotter_id' => $blotterId
                ]);
            }

            // Store incident data before deletion for logging
            $incidentData = [
                'id' => $incident->id,
                'type' => $incident->type,
                'title' => $incident->title,
                'status' => $incident->status,
                'created_at' => $incident->created_at
            ];
            
            // Delete the incident
            $incident->delete();

            DB::commit();

            Log::info('Incident successfully deleted', [
                'user_id' => $user->id,
                'deleted_incident' => $incidentData,
                'evidence_deleted_count' => $evidenceCount,
                'transaction_committed' => true
            ]);

            return redirect()->route('my.incidents.index')
                ->with('success', 'Incident deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to delete incident', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'transaction_rolled_back' => true
            ]);
            
            return back()->with('error', 'Failed to delete incident. Please try again.');
        }
    }

    /**
     * Add evidence to incident
     */
    public function addEvidence(Request $request, Incident $incident)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to add evidence to incident', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'incident_status' => $incident->status,
            'file_count' => $request->hasFile('evidence') ? count($request->file('evidence')) : 0,
            'has_notes' => $request->filled('notes')
        ]);
        
        // Authorization check
        if ($incident->user_id !== $user->id || $incident->status !== 'pending') {
            Log::warning('Unauthorized evidence addition attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'incident_status' => $incident->status,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403, 'Unauthorized access or incident cannot be modified.');
        }

        $validated = $request->validate([
            'evidence' => 'required|array|max:5',
            'evidence.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,avi',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $addedEvidence = [];
            foreach ($request->file('evidence') as $index => $file) {
                $originalName = $file->getClientOriginalName();
                $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
                $path = $file->storeAs('incidents/evidence', $filename, 'public');
                
                $evidence = IncidentEvidence::create([
                    'incident_id' => $incident->id,
                    'file_path' => $path,
                    'file_name' => $originalName,
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $user->id,
                    'notes' => $validated['notes'] ?? null
                ]);
                
                $addedEvidence[] = [
                    'evidence_id' => $evidence->id,
                    'filename' => $originalName,
                    'size' => $file->getSize(),
                    'type' => $file->getClientMimeType(),
                    'notes' => !empty($validated['notes'])
                ];
                
                Log::debug('Evidence file added', [
                    'evidence_id' => $evidence->id,
                    'incident_id' => $incident->id,
                    'filename' => $originalName,
                    'size' => $evidence->file_size,
                    'type' => $evidence->file_type
                ]);
            }

            DB::commit();

            Log::info('Evidence successfully added to incident', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'added_count' => count($addedEvidence),
                'added_evidence' => $addedEvidence,
                'transaction_committed' => true
            ]);

            return back()->with('success', 'Evidence added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to add evidence to incident', [
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'file_count_attempted' => $request->hasFile('evidence') ? count($request->file('evidence')) : 0,
                'transaction_rolled_back' => true
            ]);
            
            return back()->with('error', 'Failed to add evidence. Please try again.');
        }
    }

    /**
     * Delete evidence from incident
     */
    public function deleteEvidence(Incident $incident, IncidentEvidence $evidence)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to delete evidence', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'evidence_id' => $evidence->id,
            'incident_status' => $incident->status,
            'evidence_filename' => $evidence->file_name,
            'evidence_size' => $evidence->file_size
        ]);
        
        // Authorization check
        if ($evidence->incident_id !== $incident->id || $incident->user_id !== $user->id) {
            Log::warning('Unauthorized evidence deletion attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'evidence_id' => $evidence->id,
                'evidence_incident_id' => $evidence->incident_id,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(404);
        }
        
        if ($incident->status !== 'pending') {
            Log::warning('Evidence deletion attempted on non-pending incident', [
                'incident_id' => $incident->id,
                'evidence_id' => $evidence->id,
                'incident_status' => $incident->status
            ]);
            abort(403, 'Cannot delete evidence from a non-pending incident');
        }

        try {
            // Store evidence data before deletion
            $evidenceData = [
                'id' => $evidence->id,
                'filename' => $evidence->file_name,
                'file_path' => $evidence->file_path,
                'file_type' => $evidence->file_type,
                'file_size' => $evidence->file_size,
                'uploaded_at' => $evidence->created_at
            ];
            
            // Delete file from storage
            $deleted = Storage::disk('public')->delete($evidence->file_path);
            
            if (!$deleted) {
                Log::warning('Evidence file not found in storage during deletion', [
                    'evidence_id' => $evidence->id,
                    'file_path' => $evidence->file_path
                ]);
            }
            
            // Delete record
            $evidence->delete();

            Log::info('Evidence successfully deleted', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'evidence_data' => $evidenceData,
                'file_deleted_from_storage' => $deleted
            ]);

            return back()->with('success', 'Evidence removed successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete evidence', [
                'evidence_id' => $evidence->id,
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'file_path' => $evidence->file_path
            ]);
            
            return back()->with('error', 'Failed to remove evidence. Please try again.');
        }
    }

    /**
     * Download evidence file
     */
    public function downloadEvidence(Incident $incident, IncidentEvidence $evidence)
    {
        $user = Auth::user();
        
        Log::info('Resident attempting to download evidence', [
            'user_id' => $user->id,
            'incident_id' => $incident->id,
            'evidence_id' => $evidence->id,
            'evidence_filename' => $evidence->file_name,
            'evidence_size' => $evidence->file_size
        ]);
        
        // Authorization check
        if ($evidence->incident_id !== $incident->id || $incident->user_id !== $user->id) {
            Log::warning('Unauthorized evidence download attempt', [
                'user_id' => $user->id,
                'incident_id' => $incident->id,
                'evidence_id' => $evidence->id,
                'evidence_incident_id' => $evidence->incident_id,
                'incident_owner_id' => $incident->user_id
            ]);
            abort(403);
        }

        if (!Storage::disk('public')->exists($evidence->file_path)) {
            Log::error('Evidence file not found for download', [
                'evidence_id' => $evidence->id,
                'file_path' => $evidence->file_path,
                'incident_id' => $incident->id
            ]);
            abort(404, 'File not found');
        }

        Log::info('Evidence download initiated', [
            'user_id' => $user->id,
            'evidence_id' => $evidence->id,
            'filename' => $evidence->file_name,
            'file_path' => $evidence->file_path
        ]);

        return Storage::disk('public')->download($evidence->file_path, $evidence->file_name);
    }

    /**
     * Show dashboard for residents
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get the resident that this user account is currently representing
        $resident = null;
        if ($user->current_resident_id) {
            $resident = Resident::with(['household'])->find($user->current_resident_id);
        }

        Log::info('Resident accessing dashboard', [
            'user_id' => $user->id,
            'resident_id' => $resident?->id
        ]);

        // Get recent incidents
        $recentIncidents = Incident::where('user_id', $user->id)
            ->with(['blotterDetails'])
            ->latest()
            ->take(5)
            ->get();

        // Calculate statistics
        $stats = [
            'total' => Incident::where('user_id', $user->id)->count(),
            'pending' => Incident::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'under_investigation' => Incident::where('user_id', $user->id)
                ->where('status', 'under_investigation')
                ->count(),
            'resolved' => Incident::where('user_id', $user->id)
                ->where('status', 'resolved')
                ->count(),
        ];

        Log::debug('Dashboard statistics calculated', [
            'user_id' => $user->id,
            'stats' => $stats,
            'recent_incidents_count' => $recentIncidents->count()
        ]);

        return Inertia::render('Resident/Dashboard', [
            'resident' => $resident,
            'recentIncidents' => $recentIncidents,
            'stats' => $stats,
        ]);
    }

    /**
     * Helper method to format file size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Helper method to check if file is an image
     */
    private function isImageFile($mimeType)
    {
        return str_starts_with($mimeType, 'image/');
    }
}