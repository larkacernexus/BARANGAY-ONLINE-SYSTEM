<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscountRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type', // SENIOR, PWD, SOLO_PARENT, INDIGENT, VETERAN
        'value_type', // percentage or fixed
        'discount_value',
        'maximum_discount_amount',
        'minimum_purchase_amount',
        'priority',
        'requires_verification',
        'verification_document',
        'applicable_to', // resident, household, business
        'applicable_puroks',
        'stackable',
        'exclusive_with',
        'effective_date',
        'expiry_date',
        'is_active',
        'sort_order',
        'notes',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'minimum_purchase_amount' => 'decimal:2',
        'priority' => 'integer',
        'requires_verification' => 'boolean',
        'stackable' => 'boolean',
        'exclusive_with' => 'array',
        'applicable_puroks' => 'array',
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'formatted_value',
        'status',
        'is_expired',
    ];

    const DISCOUNT_TYPES = [
        'SENIOR' => 'Senior Citizen',
        'PWD' => 'Person with Disability',
        'SOLO_PARENT' => 'Solo Parent',
        'INDIGENT' => 'Indigent',
        'VETERAN' => 'Veteran',
        'STUDENT' => 'Student',
    ];

    const VALUE_TYPES = [
        'percentage' => 'Percentage',
        'fixed' => 'Fixed Amount',
    ];

    // Relationships - only to PaymentDiscount (no pivots to FeeType/ClearanceType)
    public function paymentDiscounts()
    {
        return $this->hasMany(PaymentDiscount::class);
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'payment_discounts')
                    ->withPivot('discount_amount', 'verified_by', 'verified_at', 'id_presented', 'id_number', 'remarks')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('effective_date')
                          ->orWhere('effective_date', '<=', now());
                    })
                    ->where(function($q) {
                        $q->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>=', now());
                    });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('discount_type', $type);
    }

    public function scopeApplicableToResident($query)
    {
        return $query->where('applicable_to', 'resident')
                    ->orWhere('applicable_to', 'all');
    }

    public function scopeForPurok($query, $purok)
    {
        return $query->where(function ($q) use ($purok) {
            $q->where('applicable_puroks', 'like', "%{$purok}%")
                ->orWhereNull('applicable_puroks');
        });
    }

    public function scopeStackable($query)
    {
        return $query->where('stackable', true);
    }

    public function scopePriorityOrder($query)
    {
        return $query->orderBy('priority', 'asc');
    }

    // Methods
    public function calculateDiscount($amount)
    {
        if ($this->minimum_purchase_amount && $amount < $this->minimum_purchase_amount) {
            return 0;
        }

        $discount = 0;

        if ($this->value_type === 'percentage') {
            $discount = $amount * ($this->discount_value / 100);
            
            if ($this->maximum_discount_amount && $discount > $this->maximum_discount_amount) {
                $discount = $this->maximum_discount_amount;
            }
        } else {
            $discount = min($this->discount_value, $amount);
        }

        return round($discount, 2);
    }

    public function isApplicableToResident(Resident $resident): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->effective_date && $this->effective_date->isFuture()) {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }

        switch ($this->discount_type) {
            case 'SENIOR':
                return $resident->is_senior ?? false;
            case 'PWD':
                return $resident->is_pwd ?? false;
            case 'SOLO_PARENT':
                return $resident->is_solo_parent ?? false;
            case 'INDIGENT':
                return $resident->is_indigent ?? false;
            case 'VETERAN':
                return $resident->is_veteran ?? false;
            case 'STUDENT':
                return $resident->is_student ?? false;
            default:
                return true;
        }
    }

    public function canCombineWith(DiscountRule $otherRule): bool
    {
        if (!$this->stackable) {
            return false;
        }

        if (!empty($this->exclusive_with)) {
            if (in_array($otherRule->discount_type, $this->exclusive_with)) {
                return false;
            }
            if (in_array($otherRule->id, $this->exclusive_with)) {
                return false;
            }
        }

        return true;
    }

    public function getFormattedValueAttribute(): string
    {
        if ($this->value_type === 'percentage') {
            return $this->discount_value . '%';
        } else {
            return '₱' . number_format($this->discount_value, 2);
        }
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        if ($this->effective_date && $this->effective_date->isFuture()) {
            return 'Scheduled';
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return 'Expired';
        }

        return 'Active';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getTypeLabelAttribute(): string
    {
        return self::DISCOUNT_TYPES[$this->discount_type] ?? $this->discount_type;
    }
}