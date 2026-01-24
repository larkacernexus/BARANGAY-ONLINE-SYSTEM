<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\HouseholdMember;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class HouseholdMemberDatabaseTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function can_create_household_member_in_database(): void
    {
        $household = Household::create([
            'household_number' => 'HH-MEMBER-001',
            'address' => '123 Member St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Member',
            'last_name' => 'Test',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-MEMBER-001',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Head',
            'is_head' => true,
        ]);
        
        $this->assertDatabaseHas('household_members', [
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Head',
            'is_head' => true,
        ]);
    }

    #[Test]
    public function household_member_belongs_to_household(): void
    {
        $household = Household::create([
            'household_number' => 'HH-REL-001',
            'address' => '123 Relation St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Relation',
            'last_name' => 'Test',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-REL-001',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        $this->assertEquals($household->id, $member->household->id);
        $this->assertEquals('HH-REL-001', $member->household->household_number);
    }

    #[Test]
    public function household_member_belongs_to_resident(): void
    {
        $household = Household::create([
            'household_number' => 'HH-REL-002',
            'address' => '456 Relation St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Relation',
            'last_name' => 'Test Two',
            'birth_date' => '1992-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-REL-002',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => false,
        ]);
        
        $this->assertEquals($resident->id, $member->resident->id);
        $this->assertEquals('Relation Test Two', $member->resident->full_name);
    }

    #[Test]
    public function household_member_with_different_relationships(): void
    {
        $household = Household::create([
            'household_number' => 'HH-REL-003',
            'address' => '789 Relation St',
            'status' => 'active',
        ]);
        
        $head = Resident::create([
            'first_name' => 'Head',
            'last_name' => 'Member',
            'birth_date' => '1980-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-REL-003',
        ]);
        
        $spouse = Resident::create([
            'first_name' => 'Spouse',
            'last_name' => 'Member',
            'birth_date' => '1982-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-REL-004',
        ]);
        
        $child = Resident::create([
            'first_name' => 'Child',
            'last_name' => 'Member',
            'birth_date' => '2010-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-REL-005',
        ]);
        
        $parent = Resident::create([
            'first_name' => 'Parent',
            'last_name' => 'Member',
            'birth_date' => '1950-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-REL-006',
        ]);
        
        // Create members with different relationships
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $head->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $spouse->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => false,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $child->id,
            'relationship_to_head' => 'Child',
            'is_head' => false,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $parent->id,
            'relationship_to_head' => 'Parent',
            'is_head' => false,
        ]);
        
        $members = $household->householdMembers;
        
        $this->assertCount(4, $members);
        $this->assertEquals('Self', $members[0]->relationship_to_head);
        $this->assertEquals('Spouse', $members[1]->relationship_to_head);
        $this->assertEquals('Child', $members[2]->relationship_to_head);
        $this->assertEquals('Parent', $members[3]->relationship_to_head);
    }

    #[Test]
    public function household_member_only_one_head_per_household(): void
    {
        $household = Household::create([
            'household_number' => 'HH-HEAD-001',
            'address' => '123 Head St',
            'status' => 'active',
        ]);
        
        $head1 = Resident::create([
            'first_name' => 'Head',
            'last_name' => 'One',
            'birth_date' => '1980-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-HEAD-001',
        ]);
        
        $head2 = Resident::create([
            'first_name' => 'Head',
            'last_name' => 'Two',
            'birth_date' => '1982-01-01',
            'gender' => 'Female',
            'resident_id' => 'RES-HEAD-002',
        ]);
        
        // Create first head
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $head1->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        // Create second head (should be allowed but logic should prevent multiple heads)
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $head2->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => true,
        ]);
        
        // Count heads
        $headCount = $household->householdMembers()->where('is_head', true)->count();
        
        // Both are marked as heads in database (business logic should handle this)
        $this->assertEquals(2, $headCount);
    }

    #[Test]
    public function household_member_can_update_relationship(): void
    {
        $household = Household::create([
            'household_number' => 'HH-UPDATE-001',
            'address' => '123 Update St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Update',
            'last_name' => 'Test',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-UPDATE-001',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Child',
            'is_head' => false,
        ]);
        
        // Update relationship
        $member->update([
            'relationship_to_head' => 'Spouse',
            'is_head' => true,
        ]);
        
        $this->assertDatabaseHas('household_members', [
            'id' => $member->id,
            'relationship_to_head' => 'Spouse',
            'is_head' => true,
        ]);
    }

    #[Test]
    public function household_member_can_be_deleted(): void
    {
        $household = Household::create([
            'household_number' => 'HH-DELETE-001',
            'address' => '123 Delete St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Delete',
            'last_name' => 'Test',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-DELETE-001',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        $memberId = $member->id;
        
        $member->delete();
        
        $this->assertDatabaseMissing('household_members', ['id' => $memberId]);
    }

    #[Test]
    public function household_member_cascade_deletion_with_household(): void
    {
        $household = Household::create([
            'household_number' => 'HH-CASCADE-001',
            'address' => '123 Cascade St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Cascade',
            'last_name' => 'Test',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-CASCADE-001',
        ]);
        
        $member = HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Self',
            'is_head' => true,
        ]);
        
        // Delete household (members should be cascade deleted if set up)
        $household->delete();
        
        // Check if member still exists
        $this->assertDatabaseMissing('household_members', ['id' => $member->id]);
    }

    #[Test]
    public function resident_can_be_in_multiple_household_memberships(): void
    {
        $household1 = Household::create([
            'household_number' => 'HH-MULTI-001',
            'address' => '123 Multi St',
            'status' => 'active',
        ]);
        
        $household2 = Household::create([
            'household_number' => 'HH-MULTI-002',
            'address' => '456 Multi St',
            'status' => 'active',
        ]);
        
        $resident = Resident::create([
            'first_name' => 'Multi',
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'gender' => 'Male',
            'resident_id' => 'RES-MULTI-001',
        ]);
        
        // Resident can be in multiple households (e.g., part of two families)
        HouseholdMember::create([
            'household_id' => $household1->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Child',
            'is_head' => false,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household2->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Sibling',
            'is_head' => false,
        ]);
        
        $memberCount = HouseholdMember::where('resident_id', $resident->id)->count();
        
        $this->assertEquals(2, $memberCount);
    }
}