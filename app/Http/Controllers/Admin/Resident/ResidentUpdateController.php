<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ResidentUpdateController extends BaseResidentController
{
    public function update(Request $request, Resident $resident)
    {
        $validated = $this->validateRequest($request);

        DB::beginTransaction();
        
        try {
            $birthDate = Carbon::parse($validated['birth_date']);
            $validated['birth_date'] = $birthDate->format('Y-m-d');
            $validated['age'] = $birthDate->age;

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $this->handlePhotoUpload($resident, $request, $validated);
            }

            // Update resident
            $resident->update($validated);

            // Handle privileges
            $this->handlePrivileges($resident, $request);

            DB::commit();

            return redirect()
                ->route('admin.residents.show', $resident)
                ->with('success', 'Resident updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update resident: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to update resident: ' . $e->getMessage()]);
        }
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
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
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:active,inactive,deceased',
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

    private function handlePhotoUpload(Resident $resident, Request $request, array &$validated): void
    {
        if ($resident->photo_path && Storage::exists('public/' . $resident->photo_path)) {
            Storage::delete('public/' . $resident->photo_path);
        }
        
        $path = $request->file('photo')->store('resident-photos', 'public');
        $validated['photo_path'] = $path;
    }

    private function handlePrivileges(Resident $resident, Request $request): void
    {
        // Delete existing privileges
        $resident->residentPrivileges()->delete();
        
        if (!$request->has('privileges') || !is_array($request->privileges) || empty($request->privileges)) {
            return;
        }

        $privilegeData = [];
        foreach ($request->privileges as $privilege) {
            if (!isset($privilege['privilege_id'])) {
                continue;
            }

            // Load privilege with discountType relationship
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
}