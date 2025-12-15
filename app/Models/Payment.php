<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'resident_id',
        'type',
        'description',
        'amount',
        'payment_date',
        'due_date',
        'period_from',
        'period_to',
        'receipt_number',
        'payment_method',
        'reference_number',
        'status',
        'remarks',
        'collecting_officer',
    ];
    
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'due_date' => 'date',
        'period_from' => 'date',
        'period_to' => 'date',
    ];
    
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
}