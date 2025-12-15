<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Clearance extends Model
{
    protected $fillable = [
        'resident_id',
        'type',
        'purpose',
        'issue_date',
        'valid_until',
        'clearance_number',
        'fee_amount',
        'requirements_met',
        'remarks',
        'issuing_officer',
        'status',
    ];
    
    protected $casts = [
        'issue_date' => 'date',
        'valid_until' => 'date',
        'fee_amount' => 'decimal:2',
        'requirements_met' => 'array',
    ];
    
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
}