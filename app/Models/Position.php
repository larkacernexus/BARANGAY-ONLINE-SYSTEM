<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'committee_id',
        'additional_committees',
        'description', 
        'order',
        'role_id',
        'requires_account',
        'is_active'
    ];

    protected $casts = [
        'requires_account' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active positions.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order positions by order column.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order');
    }

    /**
     * Scope a query to find position by code.
     */
    public function scopeByCode(Builder $query, string $code): Builder
    {
        return $query->where('code', $code);
    }

    // Relationship with committee
    public function committee()
    {
        return $this->belongsTo(Committee::class, 'committee_id');
    }

    // Relationship with role
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Accessor for additional_committees to fix the double-encoded JSON
    public function getAdditionalCommitteesAttribute($value)
    {
        if (is_null($value) || $value === '') {
            return [];
        }
        
        // First, decode the JSON string
        $decoded = json_decode($value, true);
        
        // If decoding returns a string (because it's double-encoded), decode again
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }
        
        // If it's still not an array, return empty array
        return is_array($decoded) ? $decoded : [];
    }

    // Mutator for additional_committees to store as proper JSON
    public function setAdditionalCommitteesAttribute($value)
    {
        // Store as JSON array, not JSON string of JSON array
        $this->attributes['additional_committees'] = json_encode($value ?? []);
    }

    // Get additional committees (relationship-like method)
    public function additionalCommittees()
    {
        $committeeIds = $this->additional_committees;
        
        if (empty($committeeIds)) {
            return collect();
        }
        
        return Committee::whereIn('id', $committeeIds)
            ->where('is_active', true)
            ->get();
    }

    // Get ALL committees for this position
    public function allCommittees()
    {
        $committees = collect();
        
        // Add primary committee
        if ($this->committee) {
            $committees->push($this->committee);
        }
        
        // Add additional committees
        $committees = $committees->merge($this->additionalCommittees());
        
        return $committees->unique('id');
    }

    // Check if position is Kagawad
    public function isKagawad()
    {
        return strpos(strtolower($this->code), 'kagawad') !== false || 
               strpos(strtolower($this->name), 'kagawad') !== false;
    }

    // Format for dropdown
    public function toSelectOption()
    {
        return [
            'value' => $this->id,
            'label' => $this->name,
            'code' => $this->code,
            'committee_id' => $this->committee_id,
            'additional_committees' => $this->additional_committees,
            'requires_account' => $this->requires_account,
            'order' => $this->order,
            'role_id' => $this->role_id,
        ];
    }
}