<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ResidentStoreController extends BaseResidentController
{
    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);

        // Calculate age
        $validated['age'] = Carbon::parse($validated['birth_date'])->age;

        // Generate resident ID
        $validated['resident_id'] = $this->generateResidentId();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('resident-photos', 'public');
            $validated['photo_path'] = $path;
        }

        DB::beginTransaction();
        
        try {
            // Create resident
            $resident = Resident::create($validated);

            // Handle privileges
            $this->handlePrivileges($resident, $request);

            // Handle household assignment
            $this->handleHousehold($resident, $request);

            DB::commit();

            return redirect()
                ->route('admin.residents.show', $resident)
                ->with('success', 'Resident registered successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create resident: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to create resident: ' . $e->getMessage()]);
        }
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
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
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'privileges' => 'nullable|array',
            'privileges.*.privilege_id' => 'required|exists:privileges,id',
            'privileges.*.discount_type_id' => 'nullable|exists:discount_types,id',
            'privileges.*.id_number' => 'nullable|string|max:50',
            'privileges.*.verified_at' => 'nullable|date',
            'privileges.*.expires_at' => 'nullable|date',
            'privileges.*.remarks' => 'nullable|string',
            'privileges.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
        ]);
    }

    private function handlePrivileges(Resident $resident, Request $request): void
    {
        if (!$request->has('privileges') || !is_array($request->privileges)) {
            return;
        }

        $privilegeData = [];
        foreach ($request->privileges as $privilege) {
            if (!isset($privilege['privilege_id'])) {
                continue;
            }

            $privilegeModel = Privilege::with('discountType')->find($privilege['privilege_id']);
            
            // Calculate expires_at
            $expiresAt = null;
            if (isset($privilege['expires_at']) && $privilege['expires_at']) {
                $expiresAt = Carbon::parse($privilege['expires_at']);
            } elseif ($privilegeModel && $privilegeModel->validity_years) {
                $expiresAt = now()->addYears($privilegeModel->validity_years);
            }

            // Determine discount_type_id
            $discountTypeId = $privilege['discount_type_id'] ?? $privilegeModel->discount_type_id ?? null;

            // Determine discount_percentage
            $discountPercentage = $privilege['discount_percentage'] ?? null;
            if (!$discountPercentage) {
                if ($discountTypeId && $privilegeModel->discountType) {
                    $discountPercentage = $privilegeModel->discountType->default_percentage;
                } else {
                    $discountPercentage = $privilegeModel->default_discount_percentage ?? null;
                }
            }

            $privilegeData[] = [
                'privilege_id' => $privilege['privilege_id'],
                'discount_type_id' => $discountTypeId,
                'id_number' => $privilege['id_number'] ?? null,
                'verified_at' => isset($privilege['verified_at']) && $privilege['verified_at'] 
                    ? Carbon::parse($privilege['verified_at']) 
                    : null,
                'expires_at' => $expiresAt,
                'remarks' => $privilege['remarks'] ?? null,
                'discount_percentage' => $discountPercentage,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        if (!empty($privilegeData)) {
            $resident->residentPrivileges()->createMany($privilegeData);
        }
    }

    private function handleHousehold(Resident $resident, Request $request): void
    {
        if (!$request->has('household_id') || !$request->household_id || $request->household_id === 'none') {
            return;
        }

        $household = Household::find($request->household_id);
        
        if (!$household) {
            return;
        }

        $isHead = ($request->relationship_to_head === 'head');
        
        if ($isHead) {
            HouseholdMember::where('household_id', $household->id)
                ->where('is_head', true)
                ->update(['is_head' => false]);
        }
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => $request->relationship_to_head ?? 'member',
            'is_head' => $isHead,
        ]);

        $household->update([
            'member_count' => $household->householdMembers()->count()
        ]);
        
        $resident->update(['household_id' => $household->id]);
    }
}