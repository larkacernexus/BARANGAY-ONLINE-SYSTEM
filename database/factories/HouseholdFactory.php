<?php

namespace Database\Factories;

use App\Models\Household;
use Illuminate\Database\Eloquent\Factories\Factory;

class HouseholdFactory extends Factory
{
    protected $model = Household::class;

    public function definition(): array
    {
        return [
            'household_number' => 'HH-' . $this->faker->unique()->numberBetween(1000, 9999),
            'contact_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'address' => $this->faker->address(),
            'member_count' => $this->faker->numberBetween(1, 10),
            'income_range' => $this->faker->randomElement([
                'Below 10,000',
                '10,000-20,000',
                '20,000-30,000',
                '30,000-40,000',
                '40,000-50,000',
                'Above 50,000'
            ]),
            'housing_type' => $this->faker->randomElement([
                'Single Detached',
                'Duplex',
                'Apartment',
                'Townhouse',
                'Other'
            ]),
            'ownership_status' => $this->faker->randomElement(['Owned', 'Rented', 'Mortgaged', 'Other']),
            'water_source' => $this->faker->randomElement([
                'Water District',
                'Deep Well',
                'Shallow Well',
                'Spring',
                'Other'
            ]),
            'electricity' => $this->faker->boolean(80), // 80% chance of having electricity
            'internet' => $this->faker->boolean(50), // 50% chance of having internet
            'vehicle' => $this->faker->boolean(60), // 60% chance of having vehicle
            'remarks' => $this->faker->optional()->sentence(),
            'status' => 'active',
        ];
    }
    
    public function active()
    {
        return $this->state([
            'status' => 'active',
        ]);
    }
    
    public function inactive()
    {
        return $this->state([
            'status' => 'inactive',
        ]);
    }
    
    public function withElectricity()
    {
        return $this->state([
            'electricity' => true,
        ]);
    }
    
    public function withoutElectricity()
    {
        return $this->state([
            'electricity' => false,
        ]);
    }
    
    public function withInternet()
    {
        return $this->state([
            'internet' => true,
        ]);
    }
    
    public function withVehicle()
    {
        return $this->state([
            'vehicle' => true,
        ]);
    }
}