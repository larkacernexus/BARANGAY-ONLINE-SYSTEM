<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Household extends Model
{
    protected $fillable = [
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

    protected $casts = [
        'electricity' => 'boolean',
        'internet' => 'boolean',
        'vehicle' => 'boolean',
    ];

    // Update the members relationship
    public function householdMembers()
    {
        return $this->hasMany(HouseholdMember::class);
    }

    // Keep the old relationship for backward compatibility
    public function members()
    {
        return $this->belongsToMany(Resident::class, 'household_members')
            ->withPivot('relationship_to_head', 'is_head')
            ->withTimestamps();
    }

    public function purokInfo()
    {
        return $this->belongsTo(Purok::class, 'purok', 'name');
    }
   public function residents()
    {
        return $this->hasMany(Resident::class);
    }
    public function purok()
{
    return $this->belongsTo(Purok::class, 'purok_id'); // Make sure it uses purok_id
}

 public function fees()
    {
        return $this->hasMany(Fee::class);
    }
}