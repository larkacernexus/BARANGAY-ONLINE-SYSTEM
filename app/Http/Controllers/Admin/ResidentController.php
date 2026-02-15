<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Purok;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ResidentController extends Controller
{
    // Display listing of residents
    public function index(Request $request)
    {
        // Get all residents (without pagination for client-side filtering)
        $allResidents = Resident::with(['householdMemberships.household', 'purok'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->toArray();

        // Get paginated residents for initial load (or keep server-side if preferred)
        $query = Resident::with(['householdMemberships.household', 'purok'])
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Apply initial filters if any
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('occupation', 'like', "%{$search}%")
                  ->orWhere('education', 'like', "%{$search}%")
                  ->orWhereHas('purok', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('householdMemberships.household', function ($q) use ($search) {
                      $q->where('household_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->purok_id);
        }

        // Filter by household head status
        if ($request->has('is_head') && $request->is_head !== 'all') {
            if ($request->is_head === 'yes') {
                $query->whereHas('householdMemberships', function ($q) {
                    $q->where('is_head', true);
                });
            } else {
                $query->whereDoesntHave('householdMemberships', function ($q) {
                    $q->where('is_head', true);
                });
            }
        }

        $residents = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Resident::count(),
            'active' => Resident::where('status', 'active')->count(),
            'newThisMonth' => Resident::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'totalHouseholds' => Household::count(),
            'avgAge' => round(Resident::avg('age') ?? 0, 1),
            'maleCount' => Resident::where('gender', 'male')->count(),
            'femaleCount' => Resident::where('gender', 'female')->count(),
            'otherCount' => Resident::where('gender', 'other')->count(),
            'voterCount' => Resident::where('is_voter', true)->count(),
            'seniorCount' => Resident::where('age', '>=', 60)->count(),
            'pwdCount' => Resident::where('is_pwd', true)->count(),
            'headCount' => HouseholdMember::where('is_head', true)->count(),
        ];

        // Get puroks for dropdown
        $puroks = Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();

        // Get civil status options
        $civilStatusOptions = Resident::distinct()
            ->whereNotNull('civil_status')
            ->where('civil_status', '!=', '')
            ->pluck('civil_status')
            ->toArray();

        sort($civilStatusOptions);

        // Age ranges
        $ageRanges = [
            ['label' => 'Children (0-12)', 'min' => 0, 'max' => 12],
            ['label' => 'Teens (13-19)', 'min' => 13, 'max' => 19],
            ['label' => 'Young Adults (20-35)', 'min' => 20, 'max' => 35],
            ['label' => 'Adults (36-59)', 'min' => 36, 'max' => 59],
            ['label' => 'Seniors (60+)', 'min' => 60, 'max' => 150],
        ];

        return Inertia::render('admin/Residents/Index', [
            'residents' => $residents,
            'allResidents' => $allResidents,
            'filters' => $request->only([
                'search', 'status', 'purok_id', 'gender', 'min_age', 'max_age',
                'civil_status', 'is_voter', 'is_head', 'is_4ps', 'sort_by', 'sort_order'
            ]),
            'stats' => $stats,
            'puroks' => $puroks,
            'civilStatusOptions' => $civilStatusOptions,
            'ageRanges' => $ageRanges,
        ]);
    }

    // Show the form for creating a new resident
public function create()
{
    // Get ALL households
    $allHouseholds = Household::with(['headMember.resident'])
        ->orderBy('household_number')
        ->get()
        ->map(function($household) {
            $hasHead = $household->headMember->isNotEmpty();
            $headName = $hasHead && $household->headMember->first()->resident 
                ? $household->headMember->first()->resident->full_name 
                : 'No Head';

            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_of_family' => $household->head_of_family,
                'head_resident_id' => $household->head_resident_id,
                'has_head' => $hasHead,
                'head_name' => $headName,
                'member_count' => $household->member_count,
            ];
        });

    // Add special options
    $householdsWithOptions = $allHouseholds->prepend([
        'id' => 0,
        'household_number' => 'NEW_HOUSEHOLD',
        'head_of_family' => 'Create New Household',
        'has_head' => false,
        'head_name' => 'New Household',
        'member_count' => 0,
    ]);

    return Inertia::render('admin/Residents/Create', [
        'households' => $householdsWithOptions,
        'puroks' => $this->getPuroksForSelect(),
        'civilStatusOptions' => $this->getCivilStatusOptions(),
        'genderOptions' => $this->getGenderOptions(),
        'educationOptions' => $this->getEducationOptions(),
        'relationshipOptions' => [
            ['value' => 'head', 'label' => 'Head of Household'],
            ['value' => 'spouse', 'label' => 'Spouse'],
            ['value' => 'son', 'label' => 'Son'],
            ['value' => 'daughter', 'label' => 'Daughter'],
            ['value' => 'father', 'label' => 'Father'],
            ['value' => 'mother', 'label' => 'Mother'],
            ['value' => 'brother', 'label' => 'Brother'],
            ['value' => 'sister', 'label' => 'Sister'],
            ['value' => 'grandfather', 'label' => 'Grandfather'],
            ['value' => 'grandmother', 'label' => 'Grandmother'],
            ['value' => 'grandson', 'label' => 'Grandson'],
            ['value' => 'granddaughter', 'label' => 'Granddaughter'],
            ['value' => 'uncle', 'label' => 'Uncle'],
            ['value' => 'aunt', 'label' => 'Aunt'],
            ['value' => 'nephew', 'label' => 'Nephew'],
            ['value' => 'niece', 'label' => 'Niece'],
            ['value' => 'cousin', 'label' => 'Cousin'],
            ['value' => 'son_in_law', 'label' => 'Son-in-law'],
            ['value' => 'daughter_in_law', 'label' => 'Daughter-in-law'],
            ['value' => 'father_in_law', 'label' => 'Father-in-law'],
            ['value' => 'mother_in_law', 'label' => 'Mother-in-law'],
            ['value' => 'other_relative', 'label' => 'Other Relative'],
            ['value' => 'non_relative', 'label' => 'Non-relative'],
        ],
        'householdCreationOptions' => [
            ['value' => 'none', 'label' => 'No Household'],
            ['value' => 'new', 'label' => 'Create New Household'],
            ['value' => 'existing', 'label' => 'Select Existing Household'],
        ],
    ]);
}

    // Store a newly created resident
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'household_id' => 'nullable|exists:households,id',
            'relationship_to_head' => 'nullable|required_if:household_id,!=,null|string|max:50',
            'occupation' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'is_voter' => 'boolean',
            'is_pwd' => 'boolean',
            'is_senior' => 'boolean',
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        // Calculate age
        $validated['age'] = Carbon::parse($validated['birth_date'])->age;

        // Generate resident ID
        $validated['resident_id'] = $this->generateResidentId();

        DB::beginTransaction();
        
        try {
            // Create resident
            $resident = Resident::create($validated);

            // If household is selected, create household member record
            if ($request->has('household_id') && $request->household_id) {
                $household = Household::find($request->household_id);
                
                if ($household) {
                    // Check if this resident is being set as head
                    $isHead = ($request->relationship_to_head === 'head');
                    
                    // If this resident is marked as head, remove existing head (shouldn't happen as we only show households without head)
                    if ($isHead) {
                        HouseholdMember::where('household_id', $household->id)
                            ->where('is_head', true)
                            ->update(['is_head' => false]);
                    }
                    
                    // Create household member record
                    HouseholdMember::create([
                        'household_id' => $household->id,
                        'resident_id' => $resident->id,
                        'relationship_to_head' => $request->relationship_to_head ?? 'Member',
                        'is_head' => $isHead,
                    ]);

                    // Update member count in household
                    $household->update([
                        'member_count' => $household->householdMembers()->count()
                    ]);
                    
                    // Update direct household_id on resident for easier querying
                    $resident->update(['household_id' => $household->id]);
                }
            }

            DB::commit();

            return redirect()
                ->route('residents.show', $resident)
                ->with('success', 'Resident registered successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create resident: ' . $e->getMessage()]);
        }
    }

    // Display the specified resident
    public function show(Resident $resident)
    {
        Log::info('Viewing resident details', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->first_name . ' ' . $resident->last_name,
            'user_id' => auth()->id(),
        ]);
        
        // Load resident with relationships
        $resident->load([
            'purok',
            'householdMemberships.household.purok',
            'householdMemberships.household.householdMembers.resident.purok',
        ]);
        
        // Helper function to get photo URL
        $getPhotoUrl = function ($photoPath) {
            if (!$photoPath) {
                return null;
            }
            
            // Check if it's already a full URL
            if (str_starts_with($photoPath, 'http://') || str_starts_with($photoPath, 'https://')) {
                return $photoPath;
            }
            
            // Generate storage URL
            return Storage::url($photoPath);
        };
        
        // Prepare resident data
        $residentData = [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'birth_date' => $resident->birth_date,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'address' => $resident->address,
            'purok_id' => $resident->purok_id,
            'purok_name' => $resident->purok ? $resident->purok->name : null,
            'household_id' => $resident->household_id,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'is_pwd' => (bool) $resident->is_pwd,
            'is_senior' => (bool) $resident->is_senior,
            'place_of_birth' => $resident->place_of_birth,
            'remarks' => $resident->remarks,
            'status' => $resident->status,
            'photo_path' => $resident->photo_path,
            'photo_url' => $getPhotoUrl($resident->photo_path),
            'created_at' => $resident->created_at->toISOString(),
            'updated_at' => $resident->updated_at->toISOString(),
        ];
        
        // Get household data and related members if resident belongs to a household
        $householdData = null;
        $relatedHouseholdMembers = [];
        $householdMembership = null;
        
        if ($resident->householdMemberships()->exists()) {
            $membership = $resident->householdMemberships()->first();
            $householdMembership = [
                'id' => $membership->id,
                'household_id' => $membership->household_id,
                'relationship_to_head' => $membership->relationship_to_head,
                'is_head' => (bool) $membership->is_head,
            ];
            
            $household = $membership->household;
            if ($household) {
                // Get head member
                $headMember = $household->householdMembers()->where('is_head', true)->first();
                $headResident = $headMember ? $headMember->resident : null;
                
                // Get all household members (excluding the current resident for related members list)
                $allMembers = $household->householdMembers;
                
                // Prepare related members (other members in the same household)
                $relatedHouseholdMembers = $allMembers->filter(function ($member) use ($resident) {
                    return $member->resident_id !== $resident->id;
                })->map(function ($member) use ($getPhotoUrl, $resident, $membership) {
                    // Determine the relationship to the current resident
                    $relationshipToCurrent = $this->determineRelationship($member->relationship_to_head, $membership->relationship_to_head);
                    
                    return [
                        'id' => $member->id,
                        'resident_id' => $member->resident_id,
                        'relationship_to_head' => $member->relationship_to_head,
                        'relationship_to_current' => $relationshipToCurrent,
                        'is_head' => (bool) $member->is_head,
                        'resident' => [
                            'id' => $member->resident->id,
                            'first_name' => $member->resident->first_name,
                            'last_name' => $member->resident->last_name,
                            'middle_name' => $member->resident->middle_name,
                            'age' => (int) $member->resident->age,
                            'gender' => $member->resident->gender,
                            'civil_status' => $member->resident->civil_status,
                            'contact_number' => $member->resident->contact_number,
                            'purok' => $member->resident->purok ? $member->resident->purok->name : null,
                            'purok_id' => $member->resident->purok_id,
                            'photo_path' => $member->resident->photo_path,
                            'photo_url' => $getPhotoUrl($member->resident->photo_path),
                        ]
                    ];
                })->values()->toArray();
                
                $householdData = [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'contact_number' => $household->contact_number,
                    'email' => $household->email,
                    'address' => $household->address,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'purok_id' => $household->purok_id,
                    'member_count' => $household->member_count,
                    'income_range' => $household->income_range,
                    'housing_type' => $household->housing_type,
                    'ownership_status' => $household->ownership_status,
                    'water_source' => $household->water_source,
                    'electricity' => (bool) $household->electricity,
                    'internet' => (bool) $household->internet,
                    'vehicle' => (bool) $household->vehicle,
                    'remarks' => $household->remarks,
                    'status' => $household->status,
                    'created_at' => $household->created_at ? $household->created_at->toISOString() : null,
                    'updated_at' => $household->updated_at ? $household->updated_at->toISOString() : null,
                    'household_members' => $allMembers->map(function ($member) use ($getPhotoUrl) {
                        return [
                            'id' => $member->id,
                            'resident_id' => $member->resident_id,
                            'relationship_to_head' => $member->relationship_to_head,
                            'is_head' => (bool) $member->is_head,
                            'resident' => [
                                'id' => $member->resident->id,
                                'first_name' => $member->resident->first_name,
                                'last_name' => $member->resident->last_name,
                                'middle_name' => $member->resident->middle_name,
                                'age' => (int) $member->resident->age,
                                'gender' => $member->resident->gender,
                                'civil_status' => $member->resident->civil_status,
                                'contact_number' => $member->resident->contact_number,
                                'purok' => $member->resident->purok ? $member->resident->purok->name : null,
                                'purok_id' => $member->resident->purok_id,
                                'photo_path' => $member->resident->photo_path,
                                'photo_url' => $getPhotoUrl($member->resident->photo_path),
                            ]
                        ];
                    }),
                    'head_resident' => $headResident ? [
                        'id' => $headResident->id,
                        'first_name' => $headResident->first_name,
                        'last_name' => $headResident->last_name,
                        'middle_name' => $headResident->middle_name,
                        'age' => (int) $headResident->age,
                        'gender' => $headResident->gender,
                        'civil_status' => $headResident->civil_status,
                        'contact_number' => $headResident->contact_number,
                        'purok' => $headResident->purok ? $headResident->purok->name : null,
                        'purok_id' => $headResident->purok_id,
                        'photo_path' => $headResident->photo_path,
                        'photo_url' => $getPhotoUrl($headResident->photo_path),
                    ] : null,
                ];
            }
        }
        
        return Inertia::render('admin/Residents/Show', [
            'resident' => $residentData,
            'household' => $householdData,
            'household_membership' => $householdMembership,
            'related_household_members' => $relatedHouseholdMembers,
        ]);
    }

    /**
     * Determine relationship between two household members
     */
    private function determineRelationship($member1Relationship, $member2Relationship)
    {
        // If either is head, return the other's relationship
        if ($member1Relationship === 'head') {
            return $member2Relationship;
        }
        if ($member2Relationship === 'head') {
            return $member1Relationship;
        }
        
        // Define relationship mappings
        $relationshipMap = [
            // Spouse relationships
            'spouse' => ['spouse' => 'Spouse'],
            
            // Parent-child relationships
            'father' => ['son' => 'Father', 'daughter' => 'Father'],
            'mother' => ['son' => 'Mother', 'daughter' => 'Mother'],
            'son' => ['father' => 'Son', 'mother' => 'Son'],
            'daughter' => ['father' => 'Daughter', 'mother' => 'Daughter'],
            
            // Sibling relationships
            'brother' => ['brother' => 'Brother', 'sister' => 'Brother'],
            'sister' => ['brother' => 'Sister', 'sister' => 'Sister'],
            
            // Grandparent-grandchild relationships
            'grandfather' => ['grandson' => 'Grandfather', 'granddaughter' => 'Grandfather'],
            'grandmother' => ['grandson' => 'Grandmother', 'granddaughter' => 'Grandmother'],
            'grandson' => ['grandfather' => 'Grandson', 'grandmother' => 'Grandson'],
            'granddaughter' => ['grandfather' => 'Granddaughter', 'grandmother' => 'Granddaughter'],
            
            // Uncle/Aunt - Nephew/Niece relationships
            'uncle' => ['nephew' => 'Uncle', 'niece' => 'Uncle'],
            'aunt' => ['nephew' => 'Aunt', 'niece' => 'Aunt'],
            'nephew' => ['uncle' => 'Nephew', 'aunt' => 'Nephew'],
            'niece' => ['uncle' => 'Niece', 'aunt' => 'Niece'],
            
            // In-law relationships
            'father_in_law' => ['son_in_law' => 'Father-in-law', 'daughter_in_law' => 'Father-in-law'],
            'mother_in_law' => ['son_in_law' => 'Mother-in-law', 'daughter_in_law' => 'Mother-in-law'],
            'son_in_law' => ['father_in_law' => 'Son-in-law', 'mother_in_law' => 'Son-in-law'],
            'daughter_in_law' => ['father_in_law' => 'Daughter-in-law', 'mother_in_law' => 'Daughter-in-law'],
        ];
        
        // Check for direct relationship
        if (isset($relationshipMap[$member1Relationship][$member2Relationship])) {
            return $relationshipMap[$member1Relationship][$member2Relationship];
        }
        
        // Check reverse relationship
        if (isset($relationshipMap[$member2Relationship][$member1Relationship])) {
            // Get the inverse relationship name
            $inverseMap = [
                'father' => 'son',
                'mother' => 'daughter',
                'son' => 'father',
                'daughter' => 'mother',
                'brother' => 'brother',
                'sister' => 'sister',
                'grandfather' => 'grandson',
                'grandmother' => 'granddaughter',
                'uncle' => 'nephew',
                'aunt' => 'niece',
            ];
            
            $inverse = $inverseMap[$member2Relationship] ?? $member2Relationship;
            return $inverse;
        }
        
        // If no specific relationship found, return generic
        if ($member1Relationship === $member2Relationship) {
            return 'Same relationship to head';
        }
        
        return 'Related';
    }

    // Show the form for editing the specified resident
// Show the form for editing the specified resident
public function edit(Resident $resident)
{
    // Load relationships
    $resident->load([
        'purok',
        'householdMemberships.household',
    ]);

    // Get current household membership for display only
    $currentMembership = $resident->householdMemberships()->first();
    $householdRelation = $currentMembership ? $currentMembership->household : null;

    // Prepare resident data (without household editing fields)
    $residentData = [
        'id' => $resident->id,
        'resident_id' => $resident->resident_id,
        'first_name' => $resident->first_name ?? '',
        'last_name' => $resident->last_name ?? '',
        'middle_name' => $resident->middle_name ?? '',
        'suffix' => $resident->suffix ?? '',
        'birth_date' => $resident->birth_date ? Carbon::parse($resident->birth_date)->format('Y-m-d') : '',
        'age' => $resident->age ?? 0,
        'gender' => $resident->gender ?? 'male',
        'civil_status' => $resident->civil_status ?? 'single',
        'contact_number' => $resident->contact_number ?? '',
        'email' => $resident->email ?? '',
        'address' => $resident->address ?? '',
        'purok_id' => $resident->purok_id,
        'household_id' => $resident->household_id,
        'occupation' => $resident->occupation ?? '',
        'education' => $resident->education ?? '',
        'religion' => $resident->religion ?? '',
        'is_voter' => (bool) $resident->is_voter,
        'is_pwd' => (bool) $resident->is_pwd,
        'is_senior' => (bool) $resident->is_senior,
        'place_of_birth' => $resident->place_of_birth ?? '',
        'remarks' => $resident->remarks ?? '',
        'status' => $resident->status ?? 'active',
        'photo_path' => $resident->photo_path,
        'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
        'created_at' => $resident->created_at->toISOString(),
        'updated_at' => $resident->updated_at->toISOString(),
        'purok' => $resident->purok,
        // Include household relation for display only
        'household_relation' => $householdRelation ? [
            'id' => $householdRelation->id,
            'household_number' => $householdRelation->household_number,
        ] : null,
    ];

    return Inertia::render('admin/Residents/Edit', [
        'resident' => $residentData,
        'puroks' => Purok::orderBy('name')->get()->map(function ($purok) {
            return [
                'id' => $purok->id,
                'name' => $purok->name
            ];
        }),
        'civilStatusOptions' => [
            ['value' => 'single', 'label' => 'Single'],
            ['value' => 'married', 'label' => 'Married'],
            ['value' => 'widowed', 'label' => 'Widowed'],
            ['value' => 'separated', 'label' => 'Separated'],
        ],
        'genderOptions' => [
            ['value' => 'male', 'label' => 'Male'],
            ['value' => 'female', 'label' => 'Female'],
            ['value' => 'other', 'label' => 'Other'],
        ],
        'educationOptions' => [
            ['value' => 'none', 'label' => 'No Formal Education'],
            ['value' => 'elementary', 'label' => 'Elementary'],
            ['value' => 'high_school', 'label' => 'High School'],
            ['value' => 'vocational', 'label' => 'Vocational'],
            ['value' => 'college', 'label' => 'College'],
            ['value' => 'postgraduate', 'label' => 'Postgraduate'],
        ],
    ]);
}

/**
 * Update the specified resident in storage.
 */
public function update(Request $request, Resident $resident)
{
    // Validate the request data (remove household fields from validation)
    $validated = $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'middle_name' => 'nullable|string|max:255',
        'suffix' => 'nullable|string|max:10',
        'birth_date' => 'required|date|before_or_equal:today',
        'gender' => 'required|in:male,female,other',
        'civil_status' => 'required|in:single,married,widowed,separated',
        'contact_number' => 'nullable|string|max:20',
        'email' => 'nullable|email|max:255',
        'address' => 'required|string',
        'purok_id' => 'required|exists:puroks,id',
        'occupation' => 'nullable|string|max:255',
        'education' => 'nullable|string|max:255',
        'religion' => 'nullable|string|max:255',
        'is_voter' => 'boolean',
        'is_pwd' => 'boolean',
        'is_senior' => 'boolean',
        'place_of_birth' => 'nullable|string|max:255',
        'remarks' => 'nullable|string',
        'status' => 'required|in:active,inactive,deceased',
        'photo' => 'nullable|image|max:2048',
    ]);

    DB::beginTransaction();
    
    try {
        // Ensure birth_date is in YYYY-MM-DD format
        $birthDate = Carbon::parse($validated['birth_date']);
        $validated['birth_date'] = $birthDate->format('Y-m-d');
        
        // Calculate age
        $validated['age'] = $birthDate->age;

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($resident->photo_path && Storage::exists('public/' . $resident->photo_path)) {
                Storage::delete('public/' . $resident->photo_path);
            }
            
            $path = $request->file('photo')->store('resident-photos', 'public');
            $validated['photo_path'] = $path;
        }

        // Update resident's basic info only
        // Household management is done separately on the household page
        $resident->update($validated);

        DB::commit();

        return redirect()
            ->route('residents.show', $resident)
            ->with('success', 'Resident updated successfully.');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Failed to update resident: ' . $e->getMessage()]);
    }
}
    // Remove the specified resident
    public function destroy(Resident $resident)
    {
        DB::beginTransaction();
        
        try {
            // Remove household membership if exists
            $membership = $resident->householdMemberships()->first();
            if ($membership) {
                $household = $membership->household;
                
                // If this resident is the head, find a new head
                if ($membership->is_head) {
                    $newHead = HouseholdMember::where('household_id', $household->id)
                        ->where('resident_id', '!=', $resident->id)
                        ->orderBy('created_at')
                        ->first();
                    
                    if ($newHead) {
                        $newHead->update(['is_head' => true]);
                    }
                }
                
                $membership->delete();
                
                // Update household member count
                $household->update([
                    'member_count' => $household->householdMembers()->count()
                ]);
            }
            
            $resident->delete();
            
            DB::commit();

            return redirect()
                ->route('residents.index')
                ->with('success', 'Resident deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete resident: ' . $e->getMessage()]);
        }
    }

    // Helper methods
    private function generateResidentId()
    {
        $year = now()->format('Y');
        $lastResident = Resident::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();
        
        if ($lastResident && str_contains($lastResident->resident_id, 'BRGY-' . $year)) {
            $lastNumber = intval(substr($lastResident->resident_id, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return 'BRGY-' . $year . '-' . $newNumber;
    }

    private function getPuroksForSelect()
    {
        return Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($purok) {
                return [
                    'id' => $purok->id,
                    'name' => $purok->name,
                ];
            })
            ->toArray();
    }

    private function getCivilStatusOptions()
    {
        return [
            ['value' => 'single', 'label' => 'Single'],
            ['value' => 'married', 'label' => 'Married'],
            ['value' => 'widowed', 'label' => 'Widowed'],
            ['value' => 'separated', 'label' => 'Separated'],
        ];
    }

    private function getGenderOptions()
    {
        return [
            ['value' => 'male', 'label' => 'Male'],
            ['value' => 'female', 'label' => 'Female'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }

    private function getEducationOptions()
    {
        return [
            ['value' => 'none', 'label' => 'No Formal Education'],
            ['value' => 'elementary', 'label' => 'Elementary'],
            ['value' => 'highschool', 'label' => 'High School'],
            ['value' => 'college', 'label' => 'College'],
            ['value' => 'vocational', 'label' => 'Vocational'],
            ['value' => 'postgraduate', 'label' => 'Postgraduate'],
        ];
    }

     public function import()
    {
        return Inertia::render('admin/Residents/Import');
    }

    /**
     * Process CSV import
     */
    public function processImport(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
            'has_headers' => 'boolean',
        ]);

        $file = $request->file('csv_file');
        $hasHeaders = $request->boolean('has_headers', true);
        $results = [
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
            'errors' => [],
            'successes' => [],
        ];

        try {
            $handle = fopen($file->getRealPath(), 'r');
            
            // Skip headers if present
            if ($hasHeaders) {
                fgetcsv($handle);
            }

            $rowNumber = $hasHeaders ? 2 : 1;
            
            DB::beginTransaction();

            while (($row = fgetcsv($handle)) !== false) {
                $results['total']++;
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    $rowNumber++;
                    continue;
                }

                // Validate required field count
                if (count($row) < 11) { // Minimum required fields
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'error' => 'Insufficient columns. Expected at least 11 fields.',
                        'data' => $row
                    ];
                    $rowNumber++;
                    continue;
                }

                // Map CSV columns to database fields
                $data = $this->mapCsvToResidentData($row, $rowNumber);

                // Validate resident data
                $validator = Validator::make($data, [
                    'first_name' => 'required|string|max:255',
                    'last_name' => 'required|string|max:255',
                    'middle_name' => 'nullable|string|max:255',
                    'suffix' => 'nullable|string|max:10',
                    'birth_date' => 'required|date',
                    'gender' => 'required|in:male,female,other',
                    'civil_status' => 'required|in:single,married,widowed,separated',
                    'contact_number' => 'nullable|string|max:20',
                    'email' => 'nullable|email|max:255',
                    'address' => 'required|string',
                    'purok_id' => 'required|exists:puroks,id',
                    'household_id' => 'nullable|exists:households,id',
                    'occupation' => 'nullable|string|max:255',
                    'education' => 'nullable|string|max:255',
                    'religion' => 'nullable|string|max:255',
                    'is_voter' => 'boolean',
                    'is_pwd' => 'boolean',
                    'is_senior' => 'boolean',
                    'place_of_birth' => 'nullable|string|max:255',
                    'remarks' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                if ($validator->fails()) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'error' => implode(', ', $validator->errors()->all()),
                        'data' => $row
                    ];
                    $rowNumber++;
                    continue;
                }

                // Create resident
                try {
                    // Calculate age
                    $data['age'] = Carbon::parse($data['birth_date'])->age;
                    
                    // Generate resident ID
                    $data['resident_id'] = $this->generateResidentId();
                    
                    // Set default status if not provided
                    if (!isset($data['status'])) {
                        $data['status'] = 'active';
                    }

                    $resident = Resident::create($data);

                    // Handle household membership if household_id is provided
                    if (!empty($data['household_id'])) {
                        $household = Household::find($data['household_id']);
                        
                        if ($household) {
                            HouseholdMember::create([
                                'household_id' => $household->id,
                                'resident_id' => $resident->id,
                                'relationship_to_head' => 'member', // Default, can be updated later
                                'is_head' => false,
                            ]);

                            // Update member count
                            $household->update([
                                'member_count' => $household->householdMembers()->count()
                            ]);
                            
                            // Update direct household_id on resident
                            $resident->update(['household_id' => $household->id]);
                        }
                    }

                    $results['successful']++;
                    $results['successes'][] = [
                        'row' => $rowNumber,
                        'resident_id' => $data['resident_id'],
                        'name' => trim($data['first_name'] . ' ' . $data['last_name']),
                        'message' => 'Successfully imported'
                    ];

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'error' => 'Database error: ' . $e->getMessage(),
                        'data' => $row
                    ];
                }

                $rowNumber++;
            }

            fclose($handle);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Import completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'results' => $results
            ], 500);
        }
    }

      public function downloadGuide()
    {
        $guideContent = "RESIDENTS IMPORT GUIDE
===========================

REQUIRED FORMAT: CSV (Comma Separated Values)
ENCODING: UTF-8

COLUMN ORDER (21 columns):
1. first_name    - First name (required)
2. last_name     - Last name (required)
3. middle_name   - Middle name (optional)
4. suffix        - Suffix: Jr., Sr., III, etc. (optional)
5. birth_date    - Date of birth: YYYY-MM-DD (required)
6. gender        - male, female, or other (required)
7. civil_status  - single, married, widowed, separated (required)
8. contact_number - 11-digit mobile number (required)
9. email         - Email address (optional)
10. address      - Complete address (required)
11. purok_id     - Purok ID (must exist in database) (required)
12. household_id - Household ID (optional, must exist or leave empty)
13. occupation   - Occupation/profession (optional)
14. education    - Highest education (optional)
15. religion     - Religion (optional)
16. is_voter     - 1 for yes, 0 for no (required)
17. is_pwd       - 1 for yes, 0 for no (required)
18. is_senior    - 1 for yes, 0 for no (required)
19. place_of_birth - City/Municipality, Province (optional)
20. remarks      - Additional notes (optional)
21. status       - active or inactive (optional, defaults to active)

VALIDATION RULES:
- Email must be valid format
- Contact numbers must be 11 digits
- Birth dates must be valid
- Purok ID must exist in puroks table
- Household ID must exist in households table or be empty
- Boolean fields: 1 = true, 0 = false

IMPORTANT NOTES:
- Do NOT include id, resident_id, photo_path, age, created_at, updated_at
- These are auto-generated or calculated
- Maximum file size: 10MB
- Maximum rows per import: 1000

TIPS:
- Save CSV in UTF-8 encoding
- Do not modify column headers
- Dates must be YYYY-MM-DD format
- For text with commas, enclose in double quotes
- Example: \"Manila, Philippines\"";

        return response($guideContent, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="residents_import_guide.txt"',
        ]);
    }

      public function downloadTemplate()
    {
        $csvTemplate = "first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,is_pwd,is_senior,place_of_birth,remarks,status\n";
        $csvTemplate .= "Juan,Dela Cruz,Santos,Jr.,1990-05-15,male,single,09123456789,juan@example.com,123 Main Street,1,1,Farmer,College Graduate,Roman Catholic,1,0,0,Manila City,\"Active resident\",active\n";
        $csvTemplate .= "Maria,Santos,,,1985-08-20,female,married,09187654321,maria@example.com,456 Oak Street,2,2,Teacher,College Graduate,Roman Catholic,1,0,0,Quezon City,,active\n";
        $csvTemplate .= "Pedro,Gonzales,Reyes,,1978-03-10,male,married,09151112222,,789 Pine Street,3,,Driver,High School Graduate,Roman Catholic,0,1,0,Cebu City,PWD ID: 2023-001,active\n";
        $csvTemplate .= "Ana,Ramos,Tan,,1955-11-30,female,widowed,09223334444,ana@example.com,321 Maple Street,4,3,Retired,College Graduate,Roman Catholic,1,0,1,Davao City,Senior Citizen,active";

        return response($csvTemplate, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="residents_import_template.csv"',
        ]);
    }
        private function mapCsvToResidentData(array $row, int $rowNumber): array
    {
        // Default mapping - adjust based on your CSV structure
        return [
            'first_name' => $row[0] ?? null,
            'last_name' => $row[1] ?? null,
            'middle_name' => $row[2] ?? null,
            'suffix' => $row[3] ?? null,
            'birth_date' => $row[4] ?? null,
            'gender' => strtolower($row[5] ?? ''),
            'civil_status' => strtolower($row[6] ?? ''),
            'contact_number' => $row[7] ?? null,
            'email' => $row[8] ?? null,
            'address' => $row[9] ?? null,
            'purok_id' => $row[10] ?? null,
            'household_id' => $row[11] ?? null,
            'occupation' => $row[12] ?? null,
            'education' => $row[13] ?? null,
            'religion' => $row[14] ?? null,
            'is_voter' => (bool)($row[15] ?? 0),
            'is_pwd' => (bool)($row[16] ?? 0),
            'is_senior' => (bool)($row[17] ?? 0),
            'place_of_birth' => $row[18] ?? null,
            'remarks' => $row[19] ?? null,
            'status' => $row[20] ?? 'active',
        ];
    }
}