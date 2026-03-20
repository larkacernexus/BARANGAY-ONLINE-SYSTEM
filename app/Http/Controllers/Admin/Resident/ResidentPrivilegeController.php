<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Privilege;
use App\Models\ResidentPrivilege;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResidentPrivilegeController extends Controller
{
    /**
     * Store a newly created resident privilege
     */
    public function store(Request $request, Resident $resident)
    {
        $request->validate([
            'privilege_id' => 'required|exists:privileges,id',
            'id_number' => 'nullable|string|max:255',
            'issued_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:issued_date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Check if privilege already exists for this resident
            $exists = ResidentPrivilege::where('resident_id', $resident->id)
                ->where('privilege_id', $request->privilege_id)
                ->exists();

            if ($exists) {
                return back()->withErrors(['privilege_id' => 'This privilege is already assigned to the resident.']);
            }

            // Get the privilege to check its properties
            $privilege = Privilege::findOrFail($request->privilege_id);

            // Calculate expiry date if not provided but validity_years is set
            $expiryDate = $request->expiry_date;
            if (!$expiryDate && $privilege->validity_years) {
                $expiryDate = now()->addYears($privilege->validity_years)->format('Y-m-d');
            }

            // Create the resident privilege
            $residentPrivilege = ResidentPrivilege::create([
                'resident_id' => $resident->id,
                'privilege_id' => $request->privilege_id,
                'id_number' => $request->id_number,
                'issued_date' => $request->issued_date ?? now(),
                'expires_at' => $expiryDate,
                'verified_at' => $privilege->requires_verification ? null : now(),
                'verified_by' => $privilege->requires_verification ? null : auth()->id(),
                'remarks' => $request->remarks,
                'status' => 'pending', // Default status
            ]);

            DB::commit();

            Log::info('Resident privilege added', [
                'resident_id' => $resident->id,
                'privilege_id' => $request->privilege_id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Privilege added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add resident privilege', [
                'error' => $e->getMessage(),
                'resident_id' => $resident->id,
                'privilege_id' => $request->privilege_id,
            ]);

            return back()->withErrors(['error' => 'Failed to add privilege: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resident privilege
     */
    public function destroy(Resident $resident, $privilegeId)
    {
        try {
            $residentPrivilege = ResidentPrivilege::where('resident_id', $resident->id)
                ->where('id', $privilegeId)
                ->firstOrFail();

            $residentPrivilege->delete();

            Log::info('Resident privilege removed', [
                'resident_id' => $resident->id,
                'privilege_id' => $privilegeId,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Privilege removed successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to remove resident privilege', [
                'error' => $e->getMessage(),
                'resident_id' => $resident->id,
                'privilege_id' => $privilegeId,
            ]);

            return back()->withErrors(['error' => 'Failed to remove privilege.']);
        }
    }
}