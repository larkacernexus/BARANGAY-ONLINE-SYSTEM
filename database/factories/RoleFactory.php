<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = \App\Models\Role::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
        ];
    }

    public function administrator(): self
    {
        return $this->state(['name' => 'Administrator']);
    }

    public function staff(): self
    {
        return $this->state(['name' => 'Staff']);
    }
}