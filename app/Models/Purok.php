<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

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
        'latitude',
        'longitude',
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
        
        static::saving(function ($purok) {
            if ($purok->google_maps_url && !$purok->latitude && !$purok->longitude) {
                $purok->extractCoordinatesFromUrl();
            }
        });
    }

    public function households()
    {
        return $this->hasMany(Household::class, 'purok_id');
    }

    public function residents()
    {
        return $this->hasMany(Resident::class, 'purok_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'purok_id');
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

    public function extractCoordinatesFromUrl()
    {
        if (!$this->google_maps_url) {
            return;
        }

        try {
            $url = $this->google_maps_url;
            
            if (strpos($url, 'maps.app.goo.gl') !== false) {
                $this->extractFromShortUrl($url);
                return;
            }
            
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('/\/search\/(\d+\.\d+),[\+ ]*(\d+\.\d+)/', $url, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('/[?&]q=([^&]+)/', $url, $matches)) {
                $query = urldecode($matches[1]);
                if (preg_match('/(-?\d+\.\d+),(-?\d+\.\d+)/', $query, $coordMatches)) {
                    $this->latitude = (float) $coordMatches[1];
                    $this->longitude = (float) $coordMatches[2];
                    return;
                }
            }
            
        } catch (\Exception $e) {
            \Log::warning("Failed to extract coordinates from URL: {$this->google_maps_url}", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function extractFromShortUrl($shortUrl)
    {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $shortUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            
            $response = curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);
            
            if (!$finalUrl) {
                return;
            }
            
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('%\/search\/(\d+\.\d+),[\+ ]*(\d+\.\d+)%', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('/(\d+\.\d+),(\d+\.\d+)/', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
        } catch (\Exception $e) {
            \Log::warning("Failed to resolve short URL: {$shortUrl}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getEmbedUrlAttribute()
    {
        $apiKey = env('VITE_GOOGLE_MAPS_API_KEY');
        
        if (!$apiKey) {
            return null;
        }
        
        if ($this->latitude && $this->longitude) {
            return "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q={$this->latitude},{$this->longitude}&zoom=16";
        }
        
        if ($this->google_maps_url) {
            return "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q=" . urlencode($this->google_maps_url);
        }
        
        return null;
    }

    public function hasLocation()
    {
        return !empty($this->google_maps_url) || ($this->latitude && $this->longitude);
    }

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

    public function getShortGoogleMapsUrlAttribute()
    {
        if (!$this->google_maps_url) {
            return null;
        }
        
        if (strlen($this->google_maps_url) > 50) {
            return substr($this->google_maps_url, 0, 47) . '...';
        }
        
        return $this->google_maps_url;
    }
}