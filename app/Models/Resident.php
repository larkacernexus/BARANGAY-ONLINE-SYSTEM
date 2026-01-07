<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resident extends Model
{
    protected $fillable = [
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
        'purok_id', // Changed from 'purok' string to 'purok_id'
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

    protected $casts = [
        'is_voter' => 'boolean',
        'is_pwd' => 'boolean',
        'is_senior' => 'boolean',
        'birth_date' => 'date',
    ];

    // Add the purok relationship
 public function purok()
{
    return $this->belongsTo(Purok::class, 'purok_id'); // Make sure it uses purok_id
}

    // Add accessor for purok name (for backward compatibility)
    public function getPurokNameAttribute()
    {
        return $this->purok ? $this->purok->name : null;
    }

 public function getBirthDateAttribute($value)
{
    return $value ? \Carbon\Carbon::parse($value) : null;
}
    // Add accessor for full name
    public function getFullNameAttribute()
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }


     public function fees()
    {
        return $this->hasMany(Fee::class);
    }

    // Remove the old household relationship
  public function household()
    {
        return $this->belongsTo(Household::class);
    }

    // Add household members relationship
    public function householdMemberships(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

public function householdRelation()
{
    return $this->belongsTo(Household::class, 'household_id');
}
     public function householdMember()
    {
        return $this->hasOne(HouseholdMember::class);
    }
    // Helper method to get the current household (if any)
    public function currentHousehold()
    {
        return $this->household()->latest()->first();
    }

    // Helper method to get the relationship to head in current household
    public function currentRelationshipToHead()
    {
        $membership = $this->householdMemberships()->latest()->first();
        return $membership ? $membership->relationship_to_head : null;
    }


    // Check if resident is head of any household
    public function isHeadOfHousehold()
    {
        return $this->householdMemberships()->where('is_head', true)->exists();
    }

    // Add relationship to clearances (if you have that model)
    public function clearances(): HasMany
    {
        return $this->hasMany(Clearance::class);
    }

    // Add relationship to payments (if you have that model)
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // In Resident model
        public function isSenior()
        {
            if (!$this->birth_date) return false;
            return \Carbon\Carbon::parse($this->birth_date)->age >= 60;
        }

        public function isPwd()
        {
            return $this->disability_status === 'yes';
}
}