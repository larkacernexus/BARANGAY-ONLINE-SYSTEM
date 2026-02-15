<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Official extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resident_id',
        'position',
        'committee',
        'term_start',
        'term_end',
        'status',
        'order',
        'responsibilities',
        'contact_number',
        'email',
        'achievements',
        'photo_path',
        'is_regular',
    ];

    protected $casts = [
        'term_start' => 'date',
        'term_end' => 'date',
        'is_regular' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'photo_url',
        'full_position',
        'is_current',
        'term_duration',
    ];

    // Relationships
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    // Accessors
    public function getPhotoUrlAttribute()
    {
        if (!$this->photo_path) {
            return null;
        }
        
        if (str_starts_with($this->photo_path, 'http')) {
            return $this->photo_path;
        }
        
        return asset('storage/' . $this->photo_path);
    }

    public function getFullPositionAttribute()
    {
        $positions = [
            'captain' => 'Barangay Captain',
            'kagawad' => 'Barangay Kagawad',
            'secretary' => 'Barangay Secretary',
            'treasurer' => 'Barangay Treasurer',
            'sk_chairman' => 'SK Chairman',
            'sk_kagawad' => 'SK Kagawad',
            'secretary_treasurer' => 'Secretary-Treasurer',
        ];
        
        return $positions[$this->position] ?? ucfirst(str_replace('_', ' ', $this->position));
    }

    public function getIsCurrentAttribute()
    {
        $today = now();
        return $today->between($this->term_start, $this->term_end) && $this->status === 'active';
    }

    public function getTermDurationAttribute()
    {
        $start = $this->term_start;
        $end = $this->term_end;
        
        $years = $start->diffInYears($end);
        $months = $start->diffInMonths($end) % 12;
        
        if ($years > 0 && $months > 0) {
            return "{$years} year" . ($years > 1 ? 's' : '') . " {$months} month" . ($months > 1 ? 's' : '');
        } elseif ($years > 0) {
            return "{$years} year" . ($years > 1 ? 's' : '');
        } else {
            return "{$months} month" . ($months > 1 ? 's' : '');
        }
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('term_start', '<=', now())
                    ->where('term_end', '>=', now());
    }

    public function scopeCurrent($query)
    {
        return $query->where('status', 'active')
                    ->where('term_start', '<=', now())
                    ->where('term_end', '>=', now());
    }

    public function scopeFormer($query)
    {
        return $query->where('status', 'former');
    }

    public function scopeRegular($query)
    {
        return $query->where('is_regular', true);
    }

    public function scopeExOfficio($query)
    {
        return $query->where('is_regular', false);
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    public function scopeSearch($query, $search)
    {
        return $query->whereHas('resident', function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%");
        })->orWhere('position', 'like', "%{$search}%")
          ->orWhere('committee', 'like', "%{$search}%");
    }

    // Helper methods
    public function getFullNameAttribute()
    {
        return $this->resident ? $this->resident->full_name : 'N/A';
    }

    public function getContactNumberAttribute($value)
    {
        return $value ?: ($this->resident ? $this->resident->contact_number : null);
    }

    public function getEmailAttribute($value)
    {
        return $value ?: ($this->resident ? $this->resident->email : null);
    }
}