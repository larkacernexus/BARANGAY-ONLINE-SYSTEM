<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DiscountFeeType extends Model
{
    use HasFactory;

    protected $table = 'discount_fee_types';

    protected $fillable = [
        'fee_type_id',
        'discount_type_id',
        'percentage',
        'is_active',
        'is_mandatory',
        'min_amount',
        'max_amount',
        'validity_start',
        'validity_end',
        'sort_order',
        'notes'
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'is_mandatory' => 'boolean',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'validity_start' => 'date',
        'validity_end' => 'date',
    ];

    // Relationships
    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function discountType()
    {
        return $this->belongsTo(DiscountType::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForFeeType($query, $feeTypeId)
    {
        return $query->where('fee_type_id', $feeTypeId);
    }

    public function scopeForDiscountType($query, $discountTypeId)
    {
        return $query->where('discount_type_id', $discountTypeId);
    }

    public function scopeValid($query)
    {
        $now = now()->format('Y-m-d');
        return $query->where(function ($q) use ($now) {
            $q->whereNull('validity_start')
                ->orWhere('validity_start', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('validity_end')
                ->orWhere('validity_end', '>=', $now);
        });
    }

    // Validation
    public function amountQualifies($amount)
    {
        if ($this->min_amount && $amount < $this->min_amount) {
            return false;
        }

        if ($this->max_amount && $amount > $this->max_amount) {
            return false;
        }

        return true;
    }

    public function isCurrentlyValid()
    {
        if ($this->validity_start && now()->lt($this->validity_start)) {
            return false;
        }

        if ($this->validity_end && now()->gt($this->validity_end)) {
            return false;
        }

        return true;
    }
}