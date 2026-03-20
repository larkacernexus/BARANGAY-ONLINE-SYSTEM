<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\HouseholdMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ResidentDestroyController extends Controller
{
    public function destroy(Resident $resident)
    {
        DB::beginTransaction();
        
        try {
            // Remove household membership if exists
            $this->removeHouseholdMembership($resident);
            
            // Delete all privileges
            $resident->residentPrivileges()->delete();
            
            // Delete photo if exists
            if ($resident->photo_path && Storage::exists('public/' . $resident->photo_path)) {
                Storage::delete('public/' . $resident->photo_path);
            }
            
            $resident->delete();
            
            DB::commit();

            return redirect()
                ->route('admin.residents.index')
                ->with('success', 'Resident deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete resident: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to delete resident: ' . $e->getMessage()]);
        }
    }

    private function removeHouseholdMembership(Resident $resident): void
    {
        $membership = $resident->householdMemberships()->first();
        
        if (!$membership) {
            return;
        }

        $household = $membership->household;
        
        if ($membership->is_head && $household) {
            $newHead = HouseholdMember::where('household_id', $household->id)
                ->where('resident_id', '!=', $resident->id)
                ->orderBy('created_at')
                ->first();
            
            if ($newHead) {
                $newHead->update(['is_head' => true]);
            }
        }
        
        $membership->delete();
        
        if ($household) {
            $household->update([
                'member_count' => $household->householdMembers()->count()
            ]);
        }
    }
}