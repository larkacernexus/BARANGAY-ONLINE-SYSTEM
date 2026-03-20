<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdDestroyController extends Controller
{
    public function destroy(Household $household)
    {
        Log::info('Deleting household', ['household_id' => $household->id]);
        
        DB::beginTransaction();
        
        try {
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            
            if ($headMember && $headMember->resident) {
                User::where('resident_id', $headMember->resident->id)
                    ->where('household_id', $household->id)
                    ->update(['status' => 'inactive', 'household_id' => null]);
            }
            
            $household->householdMembers()->delete();
            $household->delete();
            
            DB::commit();
            
            return redirect()->route('households.index')
                ->with('success', 'Household deleted successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete failed: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Error deleting household: ' . $e->getMessage());
        }
    }
}