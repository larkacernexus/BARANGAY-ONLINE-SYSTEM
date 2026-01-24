<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\HouseholdMember;
use PHPUnit\Framework\Attributes\Test;

class HouseholdMemberTest extends TestCase
{
    #[Test]
    public function household_member_has_correct_fillable_attributes(): void
    {
        $member = new HouseholdMember();
        
        $expectedFillable = [
            'household_id',
            'resident_id',
            'relationship_to_head',
            'is_head',
        ];
        
        $this->assertEquals($expectedFillable, $member->getFillable());
    }

    #[Test]
    public function household_member_has_correct_casts(): void
    {
        $member = new HouseholdMember();
        $casts = $member->getCasts();
        
        $this->assertEquals('boolean', $casts['is_head']);
    }

    #[Test]
    public function household_member_has_relationship_methods(): void
    {
        $member = new HouseholdMember();
        
        $this->assertTrue(method_exists($member, 'household'));
        $this->assertTrue(method_exists($member, 'resident'));
    }

    #[Test]
    public function household_member_is_head_cast_works(): void
    {
        $member = new HouseholdMember();
        
        $member->is_head = true;
        $this->assertTrue($member->is_head);
        
        $member->is_head = false;
        $this->assertFalse($member->is_head);
        
        $member->is_head = 1;
        $this->assertTrue($member->is_head);
        
        $member->is_head = 0;
        $this->assertFalse($member->is_head);
    }

    #[Test]
    public function household_member_relationship_to_head_can_be_set(): void
    {
        $member = new HouseholdMember();
        
        $relationships = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Relative', 'Other'];
        
        foreach ($relationships as $relationship) {
            $member->relationship_to_head = $relationship;
            $this->assertEquals($relationship, $member->relationship_to_head);
        }
    }
}