<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'fee_id',
        'fee_name',
        'fee_code',
        'description',
        'base_amount',
        'surcharge',
        'penalty',
        'total_amount',
        'category',
        'period_covered',
        'months_late',
        'fee_metadata',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'penalty' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'months_late' => 'integer',
        'fee_metadata' => 'array',
    ];

    // Relationships
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }

    // Helper methods
    public function getFormattedBaseAmountAttribute()
    {
        return '₱' . number_format($this->base_amount, 2);
    }

    public function getFormattedSurchargeAttribute()
    {
        return '₱' . number_format($this->surcharge, 2);
    }

    public function getFormattedPenaltyAttribute()
    {
        return '₱' . number_format($this->penalty, 2);
    }

    public function getFormattedTotalAttribute()
    {
        return '₱' . number_format($this->total_amount, 2);
    }

    public function hasLatePayment()
    {
        return $this->surcharge > 0 || $this->penalty > 0;
    }

    public function getLatePaymentDetails()
    {
        if (!$this->hasLatePayment()) {
            return null;
        }

        $details = [];
        
        if ($this->surcharge > 0) {
            $details['surcharge'] = [
                'amount' => $this->surcharge,
                'months' => $this->months_late,
            ];
        }

        if ($this->penalty > 0) {
            $details['penalty'] = [
                'amount' => $this->penalty,
            ];
        }

        return $details;
    }
}