<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ResidentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create and login a user
        $user = User::factory()->create();
        $this->actingAs($user);
    }

    /** @test */
    public function it_can_view_residents_index_page()
    {
        // Create some test residents
        Resident::factory()->count(3)->create();
        
        // Make GET request to residents index
        $response = $this->get('/residents');
        
        // Assert response is successful (200 status)
        $response->assertStatus(200);
        
        // If using Inertia, check for Inertia header
        $response->assertHeader('X-Inertia', 'true');
    }

    /** @test */
    public function it_can_create_a_new_resident()
    {
        $data = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'civil_status' => 'Single',
            'contact_number' => '09123456789',
            'email' => 'john@example.com',
            'address' => '123 Main St',
            'status' => 'active',
            'resident_id' => 'RES-001',
        ];
        
        $response = $this->post('/residents', $data);
        
        // Usually redirects after successful creation
        $response->assertRedirect();
        
        // Check resident was created in database
        $this->assertDatabaseHas('residents', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_resident()
    {
        $response = $this->post('/residents', []);
        
        // Should have validation errors
        $response->assertSessionHasErrors([
            'first_name',
            'last_name',
            'birth_date',
            'gender',
        ]);
    }

    /** @test */
    public function it_can_show_resident_details()
    {
        $resident = Resident::factory()->create();
        
        $response = $this->get("/residents/{$resident->id}");
        
        $response->assertStatus(200);
        $response->assertHeader('X-Inertia', 'true');
    }

    /** @test */
    public function it_can_update_resident()
    {
        $resident = Resident::factory()->create(['first_name' => 'Old Name']);
        
        $data = [
            'first_name' => 'Updated Name',
            'last_name' => $resident->last_name,
            'birth_date' => $resident->birth_date->format('Y-m-d'),
            'gender' => $resident->gender,
        ];
        
        $response = $this->put("/residents/{$resident->id}", $data);
        
        $response->assertRedirect();
        
        $this->assertDatabaseHas('residents', [
            'id' => $resident->id,
            'first_name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function it_can_delete_resident()
    {
        $resident = Resident::factory()->create();
        
        $response = $this->delete("/residents/{$resident->id}");
        
        $response->assertRedirect();
        $this->assertDatabaseMissing('residents', ['id' => $resident->id]);
    }
}