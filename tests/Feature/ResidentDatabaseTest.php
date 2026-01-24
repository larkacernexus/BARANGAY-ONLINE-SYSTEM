<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\Purok;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;

class ResidentDatabaseTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function can_create_resident_in_database(): void
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
            'email' => 'juan@example.com',
            'resident_id' => 'RES-001',
        ]);
    }

    #[Test]
    public function resident_full_name_with_suffix_in_database(): void
    {
        $resident = Resident::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'suffix' => 'Jr.',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-002',
        ]);
        
        $this->assertEquals('John Doe Jr.', $resident->full_name);
    }

    #[Test]
    public function resident_senior_check_in_database(): void
    {
        // Create a senior resident (70 years old)
        $seniorResident = Resident::create([
            'first_name' => 'Senior',
            'last_name' => 'Citizen',
            'birth_date' => now()->subYears(70)->format('Y-m-d'),
            'gender' => 'Male',
            'resident_id' => 'RES-003',
        ]);
        
        $this->assertTrue($seniorResident->isSenior());
        $this->assertTrue($seniorResident->is_senior);
        
        // Create a young resident (30 years old)
        $youngResident = Resident::create([
            'first_name' => 'Young',
            'last_name' => 'Person',
            'birth_date' => now()->subYears(30)->format('Y-m-d'),
            'gender' => 'Female',
            'resident_id' => 'RES-004',
        ]);
        
        $this->assertFalse($youngResident->isSenior());
        $this->assertFalse($youngResident->is_senior);
    }

    #[Test]
    public function resident_with_purok_relationship(): void
    {
        // Create a purok
        $purok = Purok::create([
            'name' => 'Purok 1',
            'description' => 'Test Purok',
        ]);
        
        // Create resident with purok
        $resident = Resident::create([
            'first_name' => 'Test',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-005',
            'purok_id' => $purok->id,
        ]);
        
        $this->assertEquals('Purok 1', $resident->purok_name);
        $this->assertEquals($purok->id, $resident->purok_id);
    }

    #[Test]
    public function resident_boolean_fields_work_correctly(): void
    {
        $resident = Resident::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-006',
            'is_voter' => true,
            'is_pwd' => false,
            'is_senior' => true,
        ]);
        
        $this->assertTrue($resident->is_voter);
        $this->assertFalse($resident->is_pwd);
        $this->assertTrue($resident->is_senior);
    }

    #[Test]
    public function resident_status_values(): void
    {
        $activeResident = Resident::create([
            'first_name' => 'Active',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-007',
            'status' => 'active',
        ]);
        
        $inactiveResident = Resident::create([
            'first_name' => 'Inactive',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-008',
            'status' => 'inactive',
        ]);
        
        $deceasedResident = Resident::create([
            'first_name' => 'Deceased',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-009',
            'status' => 'deceased',
        ]);
        
        $this->assertEquals('active', $activeResident->status);
        $this->assertEquals('inactive', $inactiveResident->status);
        $this->assertEquals('deceased', $deceasedResident->status);
    }

    #[Test]
    public function resident_required_fields(): void
    {
        // Test that required fields are actually required
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Resident::create([
            // Missing required fields
            'resident_id' => 'RES-010',
        ]);
    }
}