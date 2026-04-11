<?php

// app/Models/Position.php
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
        'additional_committees' => 'array',
    ];

    /**
     * Relationship with officials - adjust the foreign key based on your actual schema
     * If officials table uses position_id instead of position column
     */
    public function officials()
    {
        // Option 1: If officials table has position_id column
        return $this->hasMany(Official::class, 'position_id');
        
        // Option 2: If officials table has position column with position ID
        // return $this->hasMany(Official::class, 'position');
        
        // Option 3: If officials table has position_code column with position code
        // return $this->hasMany(Official::class, 'position_code', 'code');
    }

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

    /**
     * Relationship with committee
     */
    public function committee()
    {
        return $this->belongsTo(Committee::class, 'committee_id');
    }

    /**
     * Relationship with role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Get additional committees as collection
     */
    public function getAdditionalCommitteesAttribute($value)
    {
        if (is_null($value)) {
            return [];
        }
        
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        
        return $value;
    }

    /**
     * Get additional committees models
     */
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

    /**
     * Get ALL committees for this position
     */
    public function allCommittees()
    {
        $committees = collect();
        
        if ($this->committee) {
            $committees->push($this->committee);
        }
        
        return $committees->merge($this->additionalCommittees())->unique('id');
    }

    /**
     * Check if position is Kagawad
     */
    public function isKagawad(): bool
    {
        return str_contains(strtolower($this->code), 'kagawad') || 
               str_contains(strtolower($this->name), 'kagawad');
    }

    /**
     * Format for dropdown
     */
    public function toSelectOption(): array
    {
        return [
            'value' => $this->id,
            'label' => $this->name,
            'code' => $this->code,
            'committee_id' => $this->committee_id,
            'requires_account' => $this->requires_account,
            'order' => $this->order,
            'role_id' => $this->role_id,
        ];
    }
}