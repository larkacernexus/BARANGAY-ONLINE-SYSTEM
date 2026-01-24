<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'username' => $this->faker->unique()->userName(),
            'contact_number' => $this->faker->phoneNumber(),
            'position' => $this->faker->jobTitle(),
            'status' => 'active',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
            'login_count' => 0,
        ];
    }
    
    public function admin()
    {
        return $this->state(function (array $attributes) {
            return [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
            ];
        });
    }
    
    public function inactive()
    {
        return $this->state([
            'status' => 'inactive',
        ]);
    }
}