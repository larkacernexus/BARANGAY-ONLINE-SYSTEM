<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class DashboardTest extends TestCase
{
    public function test_dashboard_renders_with_user_data(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $response = $this->actingAs($user)
            ->get('/dashboard');

        $response->assertInertiaComponent('Dashboard')
            ->assertInertia(function (Assert $page) use ($user) {
                $page->has('user', function (Assert $prop) use ($user) {
                    $prop->where('id', $user->id)
                        ->where('name', $user->name)
                        ->where('email', $user->email);
                });
            });
    }
}