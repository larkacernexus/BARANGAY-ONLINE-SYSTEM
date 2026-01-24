<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'member_count' => 'integer',
    ];

    protected $appends = [
        'head_of_household',
        'full_address',
        'has_electricity',
        'has_internet',
        'has_vehicle',
    ];

    // ========== RELATIONSHIPS ==========

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class);
    }

    public function residents(): HasMany
    {
        return $this->hasMany(Resident::class);
    }

    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class);
    }

    // ========== ACCESSORS ==========

    public function getHeadOfHouseholdAttribute()
    {
        $head = $this->householdMembers()->where('is_head', true)->first();
        return $head ? $head->resident : null;
    }

    public function getFullAddressAttribute()
    {
        $address = $this->address;
        if ($this->purok) {
            $address .= ", {$this->purok->name}";
        }
        return $address;
    }

    public function getHasElectricityAttribute()
    {
        return (bool) $this->electricity;
    }

    public function getHasInternetAttribute()
    {
        return (bool) $this->internet;
    }

    public function getHasVehicleAttribute()
    {
        return (bool) $this->vehicle;
    }

    // ========== BUSINESS LOGIC METHODS ==========

    public function updateMemberCount()
    {
        $count = $this->residents()->count();
        $this->update(['member_count' => $count]);
        return $count;
    }

    public function addMember(Resident $resident, $relationshipToHead = 'Other', $isHead = false)
    {
        // If setting as head, unset any existing head
        if ($isHead) {
            $this->householdMembers()->where('is_head', true)->update(['is_head' => false]);
        }

        return $this->householdMembers()->create([
            'resident_id' => $resident->id,
            'relationship_to_head' => $relationshipToHead,
            'is_head' => $isHead,
        ]);
    }

    public function setHeadOfHousehold(Resident $resident)
    {
        $member = $this->householdMembers()->where('resident_id', $resident->id)->first();
        
        if ($member) {
            // Unset any existing head
            $this->householdMembers()->where('is_head', true)->update(['is_head' => false]);
            
            // Set new head
            $member->update(['is_head' => true]);
            return true;
        }
        
        return false;
    }

    // ========== SCOPES ==========

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPurok($query, $purokId)
    {
        return $query->where('purok_id', $purokId);
    }

    public function scopeWithElectricity($query)
    {
        return $query->where('electricity', true);
    }

    public function scopeWithInternet($query)
    {
        return $query->where('internet', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('household_number', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%")
              ->orWhere('contact_number', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }
}