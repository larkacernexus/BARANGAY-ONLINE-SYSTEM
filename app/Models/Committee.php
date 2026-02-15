<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Committee extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name', 
        'description',
        'order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scope for active committees
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    // Scope for ordering by order field
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order');
    }

    // Get positions that use this as primary committee
    public function primaryPositions()
    {
        return $this->hasMany(Position::class, 'committee_id');
    }

    // Format for dropdown
    public function toSelectOption()
    {
        return [
            'value' => $this->code,
            'label' => $this->name,
            'description' => $this->description,
        ];
    }
}