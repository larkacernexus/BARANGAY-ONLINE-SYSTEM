<?php

namespace Tests\Helpers;

use App\Models\Resident;

class ResidentTestHelper
{
    public static function createResidentWithHousehold($attributes = [])
    {
        $resident = Resident::factory()->create($attributes);
        
        if (!isset($attributes['household_id'])) {
            $household = \App\Models\Household::factory()->create();
            $resident->update(['household_id' => $household->id]);
            
            // Create household membership
            \App\Models\HouseholdMember::create([
                'household_id' => $household->id,
                'resident_id' => $resident->id,
                'relationship_to_head' => 'Head',
                'is_head' => true,
            ]);
        }
        
        return $resident;
    }
    
    public static function createResidentWithDependencies($attributes = [])
    {
        $resident = Resident::factory()->create($attributes);
        
        // Create related records
        \App\Models\Fee::factory()->count(2)->create(['resident_id' => $resident->id]);
        \App\Models\Clearance::factory()->count(1)->create(['resident_id' => $resident->id]);
        \App\Models\Payment::factory()->count(3)->create(['resident_id' => $resident->id]);
        
        return $resident;
    }
}