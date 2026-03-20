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
        'position_id',
        'committee_id',
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
        'user_id',
    ];

    protected $casts = [
        'term_start' => 'date',
        'term_end' => 'date',
        'is_regular' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'photo_url',
        'position_name',
        'committee_name',
        'full_position',
        'is_current',
        'term_duration',
        'position_code',
        'committee_code',
    ];

    // Relationships - RENAME THESE to avoid conflict with old columns
    public function positionData()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function committeeData()
    {
        return $this->belongsTo(Committee::class, 'committee_id');
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
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

    public function getPositionNameAttribute()
    {
        // Check if relationship is loaded and exists
        if ($this->relationLoaded('positionData') && $this->positionData) {
            return $this->positionData->name;
        }
        
        // Fallback to the old position column if it exists
        if (isset($this->attributes['position'])) {
            return $this->attributes['position'];
        }
        
        return 'No Position';
    }

    public function getPositionCodeAttribute()
    {
        if ($this->relationLoaded('positionData') && $this->positionData) {
            return $this->positionData->code;
        }
        
        return null;
    }

    public function getCommitteeNameAttribute()
    {
        if ($this->relationLoaded('committeeData') && $this->committeeData) {
            return $this->committeeData->name;
        }
        
        if (isset($this->attributes['committee'])) {
            return $this->attributes['committee'];
        }
        
        return null;
    }

    public function getCommitteeCodeAttribute()
    {
        if ($this->relationLoaded('committeeData') && $this->committeeData) {
            return $this->committeeData->code;
        }
        
        return null;
    }

    public function getFullPositionAttribute()
    {
        if ($this->relationLoaded('positionData') && $this->positionData) {
            $positionName = $this->positionData->name;
            
            if ($this->committeeData) {
                return "{$positionName} - {$this->committeeData->name}";
            }
            
            return $positionName;
        }
        
        if (isset($this->attributes['position'])) {
            $positionName = $this->attributes['position'];
            
            if (isset($this->attributes['committee'])) {
                return "{$positionName} - {$this->attributes['committee']}";
            }
            
            return $positionName;
        }
        
        return 'N/A';
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

    public function scopeByPosition($query, $positionId)
    {
        return $query->where('position_id', $positionId);
    }

    public function scopeByPositionCode($query, $code)
    {
        return $query->whereHas('positionData', function ($q) use ($code) {
            $q->where('code', $code);
        });
    }

    public function scopeByCommittee($query, $committeeId)
    {
        return $query->where('committee_id', $committeeId);
    }

    public function scopeByCommitteeCode($query, $code)
    {
        return $query->whereHas('committeeData', function ($q) use ($code) {
            $q->where('code', $code);
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('resident', function ($r) use ($search) {
                $r->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%");
            })->orWhereHas('positionData', function ($p) use ($search) {
                $p->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })->orWhereHas('committeeData', function ($c) use ($search) {
                $c->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        });
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

    // Check if this official is a Kagawad
    public function isKagawad()
    {
        return $this->positionData && $this->positionData->isKagawad();
    }

    // Get all committees this official is part of
    public function getAllCommittees()
    {
        if (!$this->positionData) {
            return collect();
        }

        $committees = collect();
        
        // Add primary committee from official
        if ($this->committeeData) {
            $committees->push($this->committeeData);
        }
        
        // Add additional committees from position
        $committees = $committees->merge($this->positionData->additionalCommittees());
        
        return $committees->unique('id');
    }
}