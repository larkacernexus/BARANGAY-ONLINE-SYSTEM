<?php

namespace Database\Factories;

use App\Models\HouseholdMember;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Database\Eloquent\Factories\Factory;

class HouseholdMemberFactory extends Factory
{
    protected $model = HouseholdMember::class;

    public function definition(): array
    {
        return [
            'household_id' => Household::factory(),
            'resident_id' => Resident::factory(),
            'relationship_to_head' => $this->faker->randomElement([
                'Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Relative', 'Other'
            ]),
            'is_head' => $this->faker->boolean(20), // 20% chance of being head
        ];
    }
    
    public function head()
    {
        return $this->state([
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
    }
    
    public function spouse()
    {
        return $this->state([
            'relationship_to_head' => 'Spouse',
            'is_head' => false,
        ]);
    }
    
    public function child()
    {
        return $this->state([
            'relationship_to_head' => 'Child',
            'is_head' => false,
        ]);
    }
    
    public function parent()
    {
        return $this->state([
            'relationship_to_head' => 'Parent',
            'is_head' => false,
        ]);
    }
    
    public function withHousehold($household)
    {
        return $this->state([
            'household_id' => $household->id,
        ]);
    }
    
    public function withResident($resident)
    {
        return $this->state([
            'resident_id' => $resident->id,
        ]);
    }
}