<?php

namespace Database\Factories;

use App\Models\Resident;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResidentFactory extends Factory
{
    protected $model = Resident::class;

    public function definition(): array
    {
        return [
            'resident_id' => 'RES-' . $this->faker->unique()->numberBetween(1000, 9999),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'middle_name' => $this->faker->optional()->lastName(),
            'suffix' => $this->faker->optional()->randomElement(['Jr.', 'Sr.', 'III']),
            'birth_date' => $this->faker->date(),
            'age' => $this->faker->numberBetween(1, 100),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'civil_status' => $this->faker->randomElement(['Single', 'Married', 'Divorced', 'Widowed']),
            'contact_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'address' => $this->faker->address(),
            'occupation' => $this->faker->jobTitle(),
            'education' => $this->faker->randomElement(['Elementary', 'High School', 'College', 'Post Graduate']),
            'religion' => $this->faker->randomElement(['Catholic', 'Protestant', 'Islam', 'Other']),
            'is_voter' => $this->faker->boolean(),
            'is_pwd' => $this->faker->boolean(20), // 20% chance
            'is_senior' => $this->faker->boolean(30), // 30% chance
            'place_of_birth' => $this->faker->city(),
            'remarks' => $this->faker->optional()->sentence(),
            'status' => 'active',
        ];
    }
    
    public function senior()
    {
        return $this->state(function (array $attributes) {
            return [
                'birth_date' => $this->faker->dateTimeBetween('-90 years', '-60 years')->format('Y-m-d'),
                'is_senior' => true,
            ];
        });
    }
    
    public function pwd()
    {
        return $this->state([
            'is_pwd' => true,
        ]);
    }
    
    public function voter()
    {
        return $this->state([
            'is_voter' => true,
        ]);
    }
    
    public function inactive()
    {
        return $this->state([
            'status' => 'inactive',
        ]);
    }
}