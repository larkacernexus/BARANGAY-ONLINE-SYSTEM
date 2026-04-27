<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\ClearanceType;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClearanceCreateController extends Controller
{
    private const DEFAULT_PURPOSE_OPTIONS = [
        'Employment',
        'Business Registration',
        'Travel',
        'School Requirement',
        'Government Transaction',
        'Loan Application',
        'Other',
    ];

    public function create()
    {
        return Inertia::render('admin/Clearances/Create', [
            'clearanceTypes' => $this->getClearanceTypes(),
            'activeClearanceTypes' => $this->getClearanceTypes(),
            'purposeOptions' => self::DEFAULT_PURPOSE_OPTIONS,
        ]);
    }

    /**
     * Search residents via AJAX for clearance applicant selection
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Resident::with('purok')
            ->select([
                'id',
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'address',
                'contact_number',
                'purok_id',
                'email',
                'civil_status',
                'photo_path'
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($resident) {
            return [
                'id' => $resident->id,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'suffix' => $resident->suffix,
                'full_name' => $resident->full_name,
                'contact_number' => $resident->contact_number,
                'email' => $resident->email,
                'address' => $resident->address,
                'purok' => $resident->purok?->name,
                'purok_id' => $resident->purok_id,
                'civil_status' => $resident->civil_status,
                'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Search households via AJAX for clearance applicant selection
     */
    public function searchHouseholds(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Household::with(['purok', 'householdMembers' => function($q) {
                $q->where('is_head', true)->with('resident');
            }])
            ->select([
                'id',
                'household_number',
                'address',
                'purok_id',
                'contact_number',
                'email',
                'member_count',
            ])
            ->where('status', 'active')
            ->orderBy('household_number');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('householdMembers', function($sq) use ($search) {
                      $sq->where('is_head', true)
                         ->whereHas('resident', function($rq) use ($search) {
                             $rq->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('middle_name', 'like', "%{$search}%");
                         });
                  });
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($household) {
            $headMember = $household->householdMembers->first();
            $headName = $headMember?->resident?->full_name ?? 'No Head Assigned';
            $headResidentId = $headMember?->resident_id;
            
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_of_family' => $headName,
                'head_resident_id' => $headResidentId,
                'address' => $household->address,
                'purok' => $household->purok?->name,
                'total_members' => (int) ($household->member_count ?? 0),
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Search businesses via AJAX for clearance applicant selection
     */
    public function searchBusinesses(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Business::with(['purok', 'owner'])
            ->select([
                'id',
                'business_name',
                'owner_id',
                'owner_name',
                'address',
                'contact_number',
                'purok_id',
                'mayors_permit_number',
            ])
            ->where('status', 'active')
            ->orderBy('business_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($business) {
            return [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'owner_name' => $business->owner_display,
                'contact_number' => $business->contact_number,
                'address' => $business->address,
                'purok' => $business->purok_name,
                'business_permit_number' => $business->mayors_permit_number,
                'barangay_id' => $business->barangay_id ?? null,
                'is_active' => $business->status === 'active',
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    private function getClearanceTypes(): array
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn(ClearanceType $type) => [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'description' => $type->description,
                'category' => $type->category ?? null,
                'fee' => (float) $type->fee,
                'formatted_fee' => $type->formatted_fee,
                'processing_days' => (int) $type->processing_days,
                'validity_days' => (int) $type->validity_days,
                'requires_payment' => (bool) $type->requires_payment,
                'requires_approval' => (bool) $type->requires_approval,
                'requires_documents' => (bool) ($type->requires_documents ?? false),
                'is_popular' => (bool) ($type->is_popular ?? false),
                'is_active' => (bool) $type->is_active,
                'purpose_options' => $type->purpose_options ?: self::DEFAULT_PURPOSE_OPTIONS,
                'document_requirements' => $type->document_requirements ?? [],
                'created_at' => $type->created_at?->toISOString(),
                'updated_at' => $type->updated_at?->toISOString(),
            ])
            ->values()
            ->toArray();
    }
}