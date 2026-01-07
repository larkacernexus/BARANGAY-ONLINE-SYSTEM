<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Purok extends Model
{
    use HasFactory;

    protected $fillable = [
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

    protected $casts = [
        'total_households' => 'integer',
        'total_residents' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($purok) {
            $purok->slug = Str::slug($purok->name);
        });

        static::updating(function ($purok) {
            $purok->slug = Str::slug($purok->name);
        });
        
        // Automatically extract coordinates from Google Maps URL if provided
        static::saving(function ($purok) {
            if ($purok->google_maps_url) {
                $purok->extractCoordinatesFromUrl();
            }
        });
    }

    // FIXED: Updated relationships to use purok_id
    public function households()
    {
        return $this->hasMany(Household::class, 'purok_id'); // Changed to purok_id
    }

    public function residents()
    {
        return $this->hasMany(Resident::class, 'purok_id'); // Changed to purok_id
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function updateStatistics()
    {
        $this->total_households = $this->households()->count();
        $this->total_residents = $this->residents()->count();
        $this->save();
    }


    /**
     * Extract latitude and longitude from Google Maps URL
     */
    public function extractCoordinatesFromUrl()
    {
        if (!$this->google_maps_url) {
            return;
        }

        try {
            $url = $this->google_maps_url;
            
            // Try to parse coordinates from URL
            if (strpos($url, '@') !== false) {
                // Format: https://www.google.com/maps/@14.5995,120.9842,15z
                $parts = explode('@', $url);
                if (count($parts) > 1) {
                    $coordsPart = explode(',', $parts[1]);
                    if (count($coordsPart) >= 2) {
                        $this->latitude = (float) $coordsPart[0];
                        $this->longitude = (float) $coordsPart[1];
                        return;
                    }
                }
            } elseif (strpos($url, '?q=') !== false) {
                // Format: https://www.google.com/maps?q=14.5995,120.9842
                $parsed = parse_url($url);
                if (isset($parsed['query'])) {
                    parse_str($parsed['query'], $query);
                    if (isset($query['q'])) {
                        $coords = explode(',', $query['q']);
                        if (count($coords) >= 2) {
                            $this->latitude = (float) $coords[0];
                            $this->longitude = (float) $coords[1];
                            return;
                        }
                    }
                }
            } elseif (strpos($url, 'place/') !== false) {
                // Format: https://www.google.com/maps/place/14°35'58.2"N+120°59'03.1"E
                // This is more complex to parse - we'll skip for now
            }
            
            // If coordinates couldn't be extracted, try using Google Maps Geocoding API
            // Note: This requires a Google Maps API key with Geocoding enabled
            $this->geocodeAddress();
            
        } catch (\Exception $e) {
            // Silently fail - coordinates are optional
            \Log::warning("Failed to extract coordinates from URL: {$this->google_maps_url}", [
                'error' => $e->getMessage(),
                'purok_id' => $this->id,
            ]);
        }
    }

    /**
     * Geocode address to get coordinates
     */
    private function geocodeAddress()
    {
        // This method requires Google Maps Geocoding API
        // You'll need to enable it and add your API key to .env
        
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        if (!$apiKey) {
            return;
        }

        // Use purok name as address
        $address = urlencode($this->name);
        $url = "https://maps.googleapis.com/maps/api/geocode/json?address={$address}&key={$apiKey}";
        
        try {
            $response = file_get_contents($url);
            $data = json_decode($response, true);
            
            if ($data['status'] === 'OK' && isset($data['results'][0]['geometry']['location'])) {
                $location = $data['results'][0]['geometry']['location'];
                $this->latitude = $location['lat'];
                $this->longitude = $location['lng'];
            }
        } catch (\Exception $e) {
            // Silently fail
        }
    }

    /**
     * Generate Google Maps embed URL
     */
    public function getGoogleMapsEmbedUrlAttribute()
    {
        if (!$this->google_maps_url) {
            return null;
        }

        // Convert regular Google Maps URL to embed URL
        $url = $this->google_maps_url;
        $url = str_replace('https://www.google.com/maps/', '', $url);
        
        // Handle different URL formats
        if (strpos($url, '@') !== false) {
            // Format with @ coordinates
            $parts = explode('@', $url);
            $coords = explode(',', $parts[1])[0] . ',' . explode(',', $parts[1])[1];
            return "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d{zoom}!2d{$coords}!3d{$coords}";
        } elseif (strpos($url, 'place/') !== false) {
            // Place format
            $place = substr($url, strpos($url, 'place/') + 6);
            return "https://www.google.com/maps/embed/v1/place?key=" . env('GOOGLE_MAPS_API_KEY') . "&q=" . urlencode($place);
        }
        
        return null;
    }

    /**
     * Check if purok has Google Maps location
     */
    public function hasLocation()
    {
        return !empty($this->google_maps_url) || ($this->latitude && $this->longitude);
    }

    /**
     * Get coordinates as array
     */
    public function getCoordinatesAttribute()
    {
        if ($this->latitude && $this->longitude) {
            return [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
            ];
        }
        return null;
    }

    /**
     * Get short Google Maps URL (for display)
     */
    public function getShortGoogleMapsUrlAttribute()
    {
        if (!$this->google_maps_url) {
            return null;
        }
        
        // Truncate long URLs for display
        if (strlen($this->google_maps_url) > 50) {
            return substr($this->google_maps_url, 0, 47) . '...';
        }
        
        return $this->google_maps_url;
    }
}