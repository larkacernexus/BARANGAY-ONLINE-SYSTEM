<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Fee;
use App\Models\Clearance;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ResidentRelationshipTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_purok()
    {
        $purok = Purok::factory()->create();
        $resident = Resident::factory()->create(['purok_id' => $purok->id]);
        
        $this->assertInstanceOf(Purok::class, $resident->purok);
        $this->assertEquals($purok->id, $resident->purok->id);
    }

    /** @test */
    public function it_belongs_to_household()
    {
        $household = Household::factory()->create();
        $resident = Resident::factory()->create(['household_id' => $household->id]);
        
        $this->assertInstanceOf(Household::class, $resident->householdRelation);
        $this->assertEquals($household->id, $resident->householdRelation->id);
    }

    /** @test */
    public function it_has_many_fees()
    {
        $resident = Resident::factory()->create();
        $fees = Fee::factory()->count(3)->create(['resident_id' => $resident->id]);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $resident->fees);
        $this->assertCount(3, $resident->fees);
        $this->assertInstanceOf(Fee::class, $resident->fees->first());
    }

    /** @test */
    public function it_has_many_household_memberships()
    {
        $resident = Resident::factory()->create();
        $memberships = HouseholdMember::factory()->count(2)->create([
            'resident_id' => $resident->id,
        ]);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $resident->householdMemberships);
        $this->assertCount(2, $resident->householdMemberships);
    }

    /** @test */
    public function it_has_one_household_member()
    {
        $resident = Resident::factory()->create();
        $householdMember = HouseholdMember::factory()->create([
            'resident_id' => $resident->id,
        ]);
        
        $this->assertInstanceOf(HouseholdMember::class, $resident->householdMember);
        $this->assertEquals($householdMember->id, $resident->householdMember->id);
    }

    /** @test */
    public function it_has_many_clearances()
    {
        $resident = Resident::factory()->create();
        $clearances = Clearance::factory()->count(2)->create([
            'resident_id' => $resident->id,
        ]);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $resident->clearances);
        $this->assertCount(2, $resident->clearances);
    }

    /** @test */
    public function it_has_many_payments()
    {
        $resident = Resident::factory()->create();
        $payments = Payment::factory()->count(2)->create([
            'resident_id' => $resident->id,
        ]);
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $resident->payments);
        $this->assertCount(2, $resident->payments);
    }
}