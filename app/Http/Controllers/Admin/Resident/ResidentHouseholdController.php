<?php
// app/Http/Controllers/Admin/Resident/ResidentHouseholdController.php

namespace App\Http\Controllers\Admin\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ResidentHouseholdController extends Controller
{
    public function assign(Request $request, Resident $resident)
    {
        $request->validate([
            'household_id' => 'required|exists:households,id',
            'relationship' => 'required|string|max:50',
        ]);

        try {
            // Remove from current household if any
            HouseholdMember::where('resident_id', $resident->id)->delete();

            // Add to new household
            HouseholdMember::create([
                'household_id' => $request->household_id,
                'resident_id' => $resident->id,
                'relationship_to_head' => $request->relationship,
                'is_head' => false, // Default to false, can be changed later
            ]);

            // Update resident's household_id
            $resident->update(['household_id' => $request->household_id]);

            Log::info('Resident assigned to household', [
                'resident_id' => $resident->id,
                'household_id' => $request->household_id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Resident assigned to household successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to assign resident to household', [
                'resident_id' => $resident->id,
                'household_id' => $request->household_id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Failed to assign resident to household.');
        }
    }

    public function remove(Resident $resident)
    {
        try {
            // Delete household membership
            HouseholdMember::where('resident_id', $resident->id)->delete();

            // Clear household_id from resident
            $resident->update(['household_id' => null]);

            Log::info('Resident removed from household', [
                'resident_id' => $resident->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Resident removed from household successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to remove resident from household', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Failed to remove resident from household.');
        }
    }
    
}