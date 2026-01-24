<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Purok;
use PHPUnit\Framework\Attributes\Test;

class PurokTest extends TestCase
{
    #[Test]
    public function purok_has_correct_fillable_attributes(): void
    {
        $purok = new Purok();
        
        $expectedFillable = [
            'name',
            'slug',
            'description',
            'leader_name',
            'leader_contact',
            'total_households',
            'total_residents',
            'status',
            'google_maps_url',
        ];
        
        $this->assertEquals($expectedFillable, $purok->getFillable());
    }

    #[Test]
    public function purok_has_correct_casts(): void
    {
        $purok = new Purok();
        $casts = $purok->getCasts();
        
        $this->assertEquals('integer', $casts['total_households']);
        $this->assertEquals('integer', $casts['total_residents']);
        $this->assertEquals('float', $casts['latitude']);
        $this->assertEquals('float', $casts['longitude']);
    }

    #[Test]
    public function purok_automatically_generates_slug_on_creation(): void
    {
        $purok = new Purok();
        $purok->name = 'Purok Sample Name';
        
        // Trigger the creating event manually
        $purok->fireModelEvent('creating');
        
        $this->assertEquals('purok-sample-name', $purok->slug);
    }

    #[Test]
    public function purok_automatically_updates_slug_on_name_change(): void
    {
        $purok = new Purok();
        $purok->name = 'Old Name';
        $purok->slug = 'old-name';
        
        // Simulate updating with new name
        $purok->name = 'New Purok Name';
        $purok->fireModelEvent('updating');
        
        $this->assertEquals('new-purok-name', $purok->slug);
    }

    #[Test]
    public function purok_has_relationship_methods(): void
    {
        $purok = new Purok();
        
        $this->assertTrue(method_exists($purok, 'households'));
        $this->assertTrue(method_exists($purok, 'residents'));
    }

    #[Test]
    public function purok_has_scope_methods(): void
    {
        $purok = new Purok();
        
        $this->assertTrue(method_exists($purok, 'scopeActive'));
        $this->assertTrue(method_exists($purok, 'scopeInactive'));
    }

    #[Test]
    public function purok_has_accessor_methods(): void
    {
        $purok = new Purok();
        
        $this->assertTrue(method_exists($purok, 'getGoogleMapsEmbedUrlAttribute'));
        $this->assertTrue(method_exists($purok, 'getCoordinatesAttribute'));
        $this->assertTrue(method_exists($purok, 'getShortGoogleMapsUrlAttribute'));
    }

    #[Test]
    public function purok_has_helper_methods(): void
    {
        $purok = new Purok();
        
        $this->assertTrue(method_exists($purok, 'hasLocation'));
        $this->assertTrue(method_exists($purok, 'updateStatistics'));
        $this->assertTrue(method_exists($purok, 'extractCoordinatesFromUrl'));
    }

    #[Test]
    public function purok_coordinates_accessor_returns_null_without_coordinates(): void
    {
        $purok = new Purok();
        
        $this->assertNull($purok->coordinates);
    }

    #[Test]
    public function purok_coordinates_accessor_returns_array_with_coordinates(): void
    {
        $purok = new Purok();
        $purok->latitude = 14.5995;
        $purok->longitude = 120.9842;
        
        $expected = [
            'latitude' => 14.5995,
            'longitude' => 120.9842,
        ];
        
        $this->assertEquals($expected, $purok->coordinates);
    }

    #[Test]
    public function purok_has_location_returns_false_without_url_and_coordinates(): void
    {
        $purok = new Purok();
        
        $this->assertFalse($purok->hasLocation());
    }

    #[Test]
    public function purok_has_location_returns_true_with_google_maps_url(): void
    {
        $purok = new Purok();
        $purok->google_maps_url = 'https://maps.google.com';
        
        $this->assertTrue($purok->hasLocation());
    }

    #[Test]
    public function purok_has_location_returns_true_with_coordinates(): void
    {
        $purok = new Purok();
        $purok->latitude = 14.5995;
        $purok->longitude = 120.9842;
        
        $this->assertTrue($purok->hasLocation());
    }

    #[Test]
    public function purok_short_google_maps_url_returns_null_without_url(): void
    {
        $purok = new Purok();
        
        $this->assertNull($purok->short_google_maps_url);
    }

    #[Test]
    public function purok_short_google_maps_url_returns_full_url_when_short(): void
    {
        $purok = new Purok();
        $purok->google_maps_url = 'https://maps.google.com/short';
        
        $this->assertEquals('https://maps.google.com/short', $purok->short_google_maps_url);
    }

    #[Test]
    public function purok_short_google_maps_url_truncates_long_url(): void
    {
        $purok = new Purok();
        $longUrl = 'https://www.google.com/maps/place/Some+Very+Long+Address+That+Exceeds+Fifty+Characters+In+Length';
        $purok->google_maps_url = $longUrl;
        
        $shortUrl = $purok->short_google_maps_url;
        
        $this->assertStringStartsWith('https://www.google.com/maps/', $shortUrl);
        $this->assertStringEndsWith('...', $shortUrl);
        $this->assertLessThanOrEqual(50, strlen($shortUrl));
    }
}