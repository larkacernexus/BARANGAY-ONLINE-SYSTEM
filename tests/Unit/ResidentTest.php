<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Resident;
use PHPUnit\Framework\Attributes\Test;

class ResidentTest extends TestCase
{
    #[Test]
    public function resident_has_full_name_attribute(): void
    {
        $resident = new Resident();
        $resident->first_name = 'Juan';
        $resident->middle_name = 'Dela';
        $resident->last_name = 'Cruz';
        
        $this->assertEquals('Juan Dela Cruz', $resident->full_name);
    }

    #[Test]
    public function resident_full_name_works_without_middle_name(): void
    {
        $resident = new Resident();
        $resident->first_name = 'Maria';
        $resident->last_name = 'Santos';
        
        $this->assertEquals('Maria Santos', $resident->full_name);
    }

    #[Test]
    public function resident_full_name_works_with_empty_middle_name(): void
    {
        $resident = new Resident();
        $resident->first_name = 'Pedro';
        $resident->middle_name = '';
        $resident->last_name = 'Gonzalez';
        
        $this->assertEquals('Pedro Gonzalez', $resident->full_name);
    }

    #[Test]
    public function resident_full_name_includes_suffix(): void
    {
        $resident = new Resident();
        $resident->first_name = 'John';
        $resident->last_name = 'Doe';
        $resident->suffix = 'Jr.';
        
        $this->assertEquals('John Doe Jr.', $resident->full_name);
    }

    #[Test]
    public function resident_full_name_with_all_parts(): void
    {
        $resident = new Resident();
        $resident->first_name = 'Robert';
        $resident->middle_name = 'James';
        $resident->last_name = 'Smith';
        $resident->suffix = 'III';
        
        $this->assertEquals('Robert James Smith III', $resident->full_name);
    }

    #[Test]
    public function resident_has_correct_fillable_attributes(): void
    {
        $resident = new Resident();
        
        $expectedFillable = [
            'resident_id',
            'user_id',
            'first_name',
            'last_name',
            'middle_name',
            'suffix',
            'birth_date',
            'age',
            'gender',
            'civil_status',
            'contact_number',
            'email',
            'address',
            'purok_id',
            'household_id',
            'occupation',
            'education',
            'religion',
            'is_voter',
            'is_pwd',
            'is_senior',
            'place_of_birth',
            'remarks',
            'status',
            'photo_path',
        ];
        
        $this->assertEquals($expectedFillable, $resident->getFillable());
    }

    #[Test]
    public function resident_has_boolean_casts(): void
    {
        $resident = new Resident();
        $casts = $resident->getCasts();
        
        $this->assertEquals('boolean', $casts['is_voter']);
        $this->assertEquals('boolean', $casts['is_pwd']);
        $this->assertEquals('boolean', $casts['is_senior']);
        $this->assertEquals('date', $casts['birth_date']);
    }

    #[Test]
    public function resident_calculates_is_senior_correctly(): void
    {
        $resident = new Resident();
        
        // Test senior (65 years old)
        $resident->birth_date = now()->subYears(65);
        $this->assertTrue($resident->isSenior());
        
        // Test non-senior (30 years old)
        $resident->birth_date = now()->subYears(30);
        $this->assertFalse($resident->isSenior());
        
        // Test null birth date
        $resident->birth_date = null;
        $this->assertFalse($resident->isSenior());
    }

    #[Test]
    public function resident_birth_date_returns_carbon_instance(): void
    {
        $resident = new Resident();
        $resident->birth_date = '1990-01-01';
        
        $this->assertInstanceOf(\Carbon\Carbon::class, $resident->birth_date);
    }

    #[Test]
    public function resident_null_birth_date_returns_null(): void
    {
        $resident = new Resident();
        $resident->birth_date = null;
        
        $this->assertNull($resident->birth_date);
    }

    #[Test]
    public function resident_has_relationship_methods(): void
    {
        $resident = new Resident();
        
        // Check relationships exist
        $this->assertTrue(method_exists($resident, 'purok'));
        $this->assertTrue(method_exists($resident, 'fees'));
        $this->assertTrue(method_exists($resident, 'household'));
        $this->assertTrue(method_exists($resident, 'clearances'));
        $this->assertTrue(method_exists($resident, 'payments'));
        $this->assertTrue(method_exists($resident, 'isHeadOfHousehold'));
    }

    #[Test]
    public function resident_is_pwd_check(): void
    {
        $resident = new Resident();
        
        // Note: your isPwd() method checks disability_status field
        $resident->disability_status = 'yes';
        $this->assertTrue($resident->isPwd());
        
        $resident->disability_status = 'no';
        $this->assertFalse($resident->isPwd());
        
        $resident->disability_status = null;
        $this->assertFalse($resident->isPwd());
    }

    #[Test]
    public function resident_has_purok_name_accessor(): void
    {
        $resident = new Resident();
        
        // Test without purok
        $this->assertNull($resident->purok_name);
    }
}