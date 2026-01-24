<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Household;
use App\Models\User;
use App\Models\Purok;
use App\Models\Resident;
use App\Models\HouseholdMember;
use PHPUnit\Framework\Attributes\Test;

class HouseholdTest extends TestCase
{
    #[Test]
    public function household_has_correct_fillable_attributes(): void
    {
        $household = new Household();
        
        $expectedFillable = [
            'household_number',
            'user_id',
            'contact_number',
            'email',
            'address',
            'purok_id',
            'member_count',
            'income_range',
            'housing_type',
            'ownership_status',
            'water_source',
            'electricity',
            'internet',
            'vehicle',
            'remarks',
            'status',
        ];
        
        $this->assertEquals($expectedFillable, $household->getFillable());
    }

    #[Test]
    public function household_has_correct_casts(): void
    {
        $household = new Household();
        $casts = $household->getCasts();
        
        $this->assertEquals('boolean', $casts['electricity']);
        $this->assertEquals('boolean', $casts['internet']);
        $this->assertEquals('boolean', $casts['vehicle']);
        $this->assertEquals('integer', $casts['member_count']);
    }

    #[Test]
    public function household_has_appended_attributes(): void
    {
        $household = new Household();
        $appends = $household->getAppends();
        
        $expectedAppends = [
            'head_of_household',
            'full_address',
            'has_electricity',
            'has_internet',
            'has_vehicle',
        ];
        
        $this->assertEquals($expectedAppends, $appends);
    }

    #[Test]
    public function household_has_relationship_methods(): void
    {
        $household = new Household();
        
        $this->assertTrue(method_exists($household, 'user'));
        $this->assertTrue(method_exists($household, 'purok'));
        $this->assertTrue(method_exists($household, 'residents'));
        $this->assertTrue(method_exists($household, 'householdMembers'));
        $this->assertTrue(method_exists($household, 'fees'));
    }

    #[Test]
    public function household_has_accessor_methods(): void
    {
        $household = new Household();
        
        $this->assertTrue(method_exists($household, 'getHeadOfHouseholdAttribute'));
        $this->assertTrue(method_exists($household, 'getFullAddressAttribute'));
        $this->assertTrue(method_exists($household, 'getHasElectricityAttribute'));
        $this->assertTrue(method_exists($household, 'getHasInternetAttribute'));
        $this->assertTrue(method_exists($household, 'getHasVehicleAttribute'));
    }

    #[Test]
    public function household_has_business_logic_methods(): void
    {
        $household = new Household();
        
        $this->assertTrue(method_exists($household, 'updateMemberCount'));
        $this->assertTrue(method_exists($household, 'addMember'));
        $this->assertTrue(method_exists($household, 'setHeadOfHousehold'));
    }

    #[Test]
    public function household_has_scope_methods(): void
    {
        $household = new Household();
        
        $this->assertTrue(method_exists($household, 'scopeActive'));
        $this->assertTrue(method_exists($household, 'scopeByPurok'));
        $this->assertTrue(method_exists($household, 'scopeWithElectricity'));
        $this->assertTrue(method_exists($household, 'scopeWithInternet'));
        $this->assertTrue(method_exists($household, 'scopeSearch'));
    }

    #[Test]
    public function household_has_electricity_accessor(): void
    {
        $household = new Household();
        
        $household->electricity = true;
        $this->assertTrue($household->has_electricity);
        
        $household->electricity = false;
        $this->assertFalse($household->has_electricity);
        
        $household->electricity = null;
        $this->assertFalse($household->has_electricity);
    }

    #[Test]
    public function household_has_internet_accessor(): void
    {
        $household = new Household();
        
        $household->internet = true;
        $this->assertTrue($household->has_internet);
        
        $household->internet = false;
        $this->assertFalse($household->has_internet);
        
        $household->internet = null;
        $this->assertFalse($household->has_internet);
    }

    #[Test]
    public function household_has_vehicle_accessor(): void
    {
        $household = new Household();
        
        $household->vehicle = true;
        $this->assertTrue($household->has_vehicle);
        
        $household->vehicle = false;
        $this->assertFalse($household->has_vehicle);
        
        $household->vehicle = null;
        $this->assertFalse($household->has_vehicle);
    }

    #[Test]
    public function household_full_address_without_purok(): void
    {
        $household = new Household();
        $household->address = '123 Main Street';
        
        $this->assertEquals('123 Main Street', $household->full_address);
    }

    #[Test]
    public function household_full_address_with_purok(): void
    {
        $household = new Household();
        $household->address = '123 Main Street';
        
        // Create a mock purok
        $purok = new \stdClass();
        $purok->name = 'Purok 1';
        
        // Use reflection to set the purok relationship
        $reflection = new \ReflectionClass($household);
        $property = $reflection->getProperty('relations');
        $property->setAccessible(true);
        $property->setValue($household, ['purok' => $purok]);
        
        $this->assertEquals('123 Main Street, Purok 1', $household->full_address);
    }

    #[Test]
    public function household_head_of_household_accessor_returns_null_when_no_head(): void
    {
        $household = new Household();
        
        $this->assertNull($household->head_of_household);
    }
}