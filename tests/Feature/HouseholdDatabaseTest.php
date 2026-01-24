<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Household;
use App\Models\User;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\HouseholdMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class HouseholdDatabaseTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function can_create_household_in_database(): void
    {
        $household = Household::create([
            'household_number' => 'HH-001',
            'contact_number' => '09123456789',
            'email' => 'household@example.com',
            'address' => '123 Main Street',
            'member_count' => 3,
            'income_range' => '15000-25000',
            'housing_type' => 'Single Detached',
            'ownership_status' => 'Owned',
            'water_source' => 'Water District',
            'electricity' => true,
            'internet' => false,
            'vehicle' => true,
            'remarks' => 'Test household',
            'status' => 'active',
        ]);
        
        $this->assertDatabaseHas('households', [
            'household_number' => 'HH-001',
            'email' => 'household@example.com',
            'electricity' => true,
            'internet' => false,
            'vehicle' => true,
            'status' => 'active',
        ]);
    }

    #[Test]
    public function household_appended_attributes_work_in_database(): void
    {
        $household = Household::create([
            'household_number' => 'HH-002',
            'address' => '456 Test Street',
            'electricity' => true,
            'internet' => true,
            'vehicle' => false,
            'status' => 'active',
        ]);
        
        $this->assertTrue($household->has_electricity);
        $this->assertTrue($household->has_internet);
        $this->assertFalse($household->has_vehicle);
    }

    #[Test]
    public function household_with_purok_has_full_address(): void
    {
        $purok = Purok::create([
            'name' => 'Purok 1',
            'status' => 'active',
        ]);
        
        $household = Household::create([
            'household_number' => 'HH-003',
            'address' => '789 Purok Street',
            'purok_id' => $purok->id,
            'status' => 'active',
        ]);
        
        $this->assertEquals('789 Purok Street, Purok 1', $household->fresh()->full_address);
    }

    #[Test]
    public function household_can_have_residents(): void
    {
        $household = Household::create([
            'household_number' => 'HH-004',
            'address' => '123 Resident St',
            'status' => 'active',
        ]);
        
        $resident1 = Resident::create([
            'first_name' => 'Resident',
            'last_name' => 'One',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-001',
            'household_id' => $household->id,
        ]);
        
        $resident2 = Resident::create([
            'first_name' => 'Resident',
            'last_name' => 'Two',
            'birth_date' => '1992-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-002',
            'household_id' => $household->id,
        ]);
        
        $this->assertCount(2, $household->fresh()->residents);
        $this->assertEquals('Resident One', $household->residents->first()->full_name);
    }

    #[Test]
    public function household_can_have_household_members(): void
    {
        $household = Household::create([
            'household_number' => 'HH-005',
            'address' => '123 Member St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Household',
            'last_name' => 'Member',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-003',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Head',
            'is_head' => true,
        ]);
        
        $this->assertCount(1, $household->fresh()->householdMembers);
        $this->assertEquals('Household Member', $household->householdMembers->first()->resident->full_name);
    }

    #[Test]
    public function household_head_of_household_accessor(): void
    {
        $household = Household::create([
            'household_number' => 'HH-006',
            'address' => '123 Head St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Head',
            'last_name' => 'Of Household',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-004',
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        $this->assertNotNull($household->fresh()->head_of_household);
        $this->assertEquals('Head Of Household', $household->head_of_household->full_name);
    }

    #[Test]
    public function household_update_member_count(): void
    {
        $household = Household::create([
            'household_number' => 'HH-007',
            'address' => '123 Count St',
            'member_count' => 0,
            'status' => 'active',
        ]);
        
        // Create residents
        Resident::create([
            'first_name' => 'Member',
            'last_name' => 'One',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-005',
            'household_id' => $household->id,
        ]);
        
        Resident::create([
            'first_name' => 'Member',
            'last_name' => 'Two',
            'birth_date' => '1992-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-006',
            'household_id' => $household->id,
        ]);
        
        Resident::create([
            'first_name' => 'Member',
            'last_name' => 'Three',
            'birth_date' => '1994-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-007',
            'household_id' => $household->id,
        ]);
        
        $count = $household->updateMemberCount();
        
        $this->assertEquals(3, $count);
        $this->assertEquals(3, $household->fresh()->member_count);
    }

    #[Test]
    public function household_add_member_method(): void
    {
        $household = Household::create([
            'household_number' => 'HH-008',
            'address' => '123 Add St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'New',
            'last_name' => 'Member',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-008',
        ]);
        
        $member = $household->addMember($resident, 'Spouse', false);
        
        $this->assertDatabaseHas('household_members', [
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => false,
        ]);
    }

    #[Test]
    public function household_add_member_as_head(): void
    {
        $household = Household::create([
            'household_number' => 'HH-009',
            'address' => '123 Head St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Head',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-009',
        ]);
        
        $member = $household->addMember($resident, 'Self', true);
        
        $this->assertDatabaseHas('household_members', [
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'is_head' => true,
        ]);
        
        $this->assertEquals('Head Resident', $household->fresh()->head_of_household->full_name);
    }

    #[Test]
    public function household_set_head_of_household(): void
    {
        $household = Household::create([
            'household_number' => 'HH-010',
            'address' => '123 Set Head St',
            'status' => 'active',
        ]);
        
        $oldHead = Resident::create([
            'first_name' => 'Old',
            'last_name' => 'Head',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-010',
        ]);
        
        $newHead = Resident::create([
            'first_name' => 'New',
            'last_name' => 'Head',
            'birth_date' => '1992-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-011',
        ]);
        
        // Add both as members, old one as head initially
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $oldHead->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $newHead->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => false,
        ]);
        
        // Set new head
        $result = $household->setHeadOfHousehold($newHead);
        
        $this->assertTrue($result);
        $this->assertFalse($household->householdMembers()->where('resident_id', $oldHead->id)->first()->is_head);
        $this->assertTrue($household->householdMembers()->where('resident_id', $newHead->id)->first()->is_head);
    }

    #[Test]
    public function household_scopes_work_correctly(): void
    {
        // Create households with different statuses
        Household::create(['household_number' => 'HH-011', 'status' => 'active', 'electricity' => true]);
        Household::create(['household_number' => 'HH-012', 'status' => 'active', 'electricity' => false]);
        Household::create(['household_number' => 'HH-013', 'status' => 'inactive', 'electricity' => true]);
        Household::create(['household_number' => 'HH-014', 'status' => 'active', 'electricity' => true, 'internet' => true]);
        
        $activeCount = Household::active()->count();
        $withElectricityCount = Household::withElectricity()->count();
        $withInternetCount = Household::withInternet()->count();
        
        $this->assertEquals(3, $activeCount); // HH-011, HH-012, HH-014
        $this->assertEquals(3, $withElectricityCount); // HH-011, HH-013, HH-014
        $this->assertEquals(1, $withInternetCount); // HH-014
    }

    #[Test]
    public function household_search_scope(): void
    {
        Household::create([
            'household_number' => 'HH-SEARCH-001',
            'address' => '123 Search Street',
            'contact_number' => '09123456789',
            'email' => 'search1@example.com',
            'status' => 'active',
        ]);
        
        Household::create([
            'household_number' => 'HH-OTHER-001',
            'address' => '456 Other Street',
            'contact_number' => '09876543210',
            'email' => 'other@example.com',
            'status' => 'active',
        ]);
        
        $searchResults = Household::search('search')->count();
        $emailResults = Household::search('search1@example.com')->count();
        $contactResults = Household::search('09123456789')->count();
        
        $this->assertEquals(1, $searchResults);
        $this->assertEquals(1, $emailResults);
        $this->assertEquals(1, $contactResults);
    }
}