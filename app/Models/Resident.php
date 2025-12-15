<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resident extends Model
{
    protected $fillable = [
        'resident_id',
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
        'purok',
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
    ];
    
    protected $casts = [
        'birth_date' => 'date',
        'is_voter' => 'boolean',
        'is_pwd' => 'boolean',
        'is_senior' => 'boolean',
    ];
    
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
    
    public function clearances(): HasMany
    {
        return $this->hasMany(Clearance::class);
    }
    
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
    
    public function getFullNameAttribute(): string
    {
        $name = $this->first_name;
        
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        
        $name .= ' ' . $this->last_name;
        
        if ($this->suffix) {
            $name .= ' ' . $this->suffix;
        }
        
        return $name;
    }
}