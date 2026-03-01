<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'original_fee_id',
        'clearance_request_id', 
        'fee_id',
        'fee_name',
        'fee_code',
        'description',
        'base_amount',
        'surcharge',
        'penalty',
        'total_amount',

        // ✅ Discount fields
        'discount_amount',
        'discount_type',
        'discount_breakdown',

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

        // ✅ Discount casting
        'discount_amount' => 'decimal:2',
        'discount_breakdown' => 'array',

        'months_late' => 'integer',
        'fee_metadata' => 'array',
        'clearance_request_id' => 'integer',
    ];

    /* =====================
     |  Relationships
     ===================== */

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }

    public function clearanceRequest()
    {
        return $this->belongsTo(ClearanceRequest::class);
    }

    /* =====================
     |  Accessors
     ===================== */

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

    // ✅ NEW: Formatted discount
    public function getFormattedDiscountAttribute()
    {
        return '₱' . number_format($this->discount_amount, 2);
    }

    // ✅ NEW: Net total after discount
    public function getNetTotalAttribute()
    {
        return $this->total_amount - $this->discount_amount;
    }

    public function getFormattedNetTotalAttribute()
    {
        return '₱' . number_format($this->net_total, 2);
    }

    /* =====================
     |  Helpers
     ===================== */

    public function hasLatePayment()
    {
        return $this->surcharge > 0 || $this->penalty > 0;
    }

    public function getLatePaymentDetails()
    {
        if (! $this->hasLatePayment()) {
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

    // ✅ NEW: Check if item has discount
    public function hasDiscount()
    {
        return $this->discount_amount > 0;
    }

    // ✅ NEW: Get discount details
    public function getDiscountDetails()
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return [
            'type' => $this->discount_type,
            'amount' => $this->discount_amount,
            'breakdown' => $this->discount_breakdown,
        ];
    }
}
