<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserResidentTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_create_user_in_database()
    {
        $user = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => 'password123',
            'status' => 'active',
        ]);
        
        $this->assertDatabaseHas('users', [
            'first_name' => 'Admin',
            'email' => 'admin@example.com',
            'username' => 'admin',
        ]);
    }

    /** @test */
    public function can_create_resident_in_database()
    {
        $resident = Resident::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'civil_status' => 'Single',
            'contact_number' => '09123456789',
            'email' => 'juan@example.com',
            'address' => '123 Main St',
            'resident_id' => 'RES-001',
            'status' => 'active',
        ]);
        
        $this->assertDatabaseHas('residents', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'resident_id' => 'RES-001',
        ]);
    }

    /** @test */
    public function user_can_have_multiple_residents()
    {
        // Create a user
        $user = User::factory()->create();
        
        // Create residents associated with the user
        $resident1 = Resident::factory()->create(['user_id' => $user->id]);
        $resident2 = Resident::factory()->create(['user_id' => $user->id]);
        
        // Check both residents exist with the user_id
        $this->assertDatabaseHas('residents', [
            'id' => $resident1->id,
            'user_id' => $user->id,
        ]);
        
        $this->assertDatabaseHas('residents', [
            'id' => $resident2->id,
            'user_id' => $user->id,
        ]);
    }

    /** @test */
    public function resident_full_name_is_correct_in_database()
    {
        $resident = Resident::create([
            'first_name' => 'Maria',
            'middle_name' => 'Santos',
            'last_name' => 'Garcia',
            'birth_date' => '1990-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-002',
        ]);
        
        $this->assertEquals('Maria Santos Garcia', $resident->full_name);
    }

    /** @test */
    public function user_full_name_is_correct_in_database()
    {
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'email' => 'john@example.com',
            'username' => 'john',
            'password' => 'password123',
        ]);
        
        $this->assertEquals('John Smith', $user->full_name);
    }
}