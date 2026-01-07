<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseholdMember extends Model
{
    protected $fillable = [
        'household_id',
        'resident_id',
        'relationship_to_head',
        'is_head',
    ];

    protected $casts = [
        'is_head' => 'boolean',
    ];

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}