<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Household extends Model
{
    protected $fillable = [
        'household_number',
        'head_of_family',
        'head_resident_id',
        'contact_number',
        'email',
        'address',
        'purok',
        'member_count',
        'income_range',
        'housing_type',
        'ownership_status',
        'water_source',
        'electricity',
        'remarks',
        'status',
    ];
    
    protected $casts = [
        'electricity' => 'boolean',
    ];
    
    public function headResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }
    
    public function members(): HasMany
    {
        return $this->hasMany(Resident::class);
    }
}