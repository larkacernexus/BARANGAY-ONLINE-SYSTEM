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
        'discount_type', // SENIOR, PWD, SOLO_PARENT, INDIGENT, VETERAN, etc.
        'value_type', // percentage or fixed
        'discount_value', // e.g., 20 for 20%, or 50 for fixed amount
        'maximum_discount_amount', // maximum discount amount (for percentage)
        'minimum_purchase_amount', // minimum amount required
        'priority', // lower number = higher priority (1 is highest)
        'requires_verification',
        'verification_document',
        'applicable_to', // resident, household, business, etc.
        'applicable_puroks',
        'stackable', // can be combined with other discounts
        'exclusive_with', // discount types/rules it cannot be combined with
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
        'EMPLOYEE' => 'Employee',
        'MEMBER' => 'Organization Member',
        'EARLY_BIRD' => 'Early Bird',
        'LOYALTY' => 'Loyalty Discount',
        'BULK' => 'Bulk Discount',
        'PROMO' => 'Promotional',
        'OTHER' => 'Other',
    ];

    const VALUE_TYPES = [
        'percentage' => 'Percentage',
        'fixed' => 'Fixed Amount',
    ];

    // Relationships
    public function feeTypes()
    {
        return $this->belongsToMany(FeeType::class, 'fee_type_discount_rules')
                    ->withPivot('priority', 'is_active')
                    ->withTimestamps();
    }

    public function clearanceTypes()
    {
        return $this->belongsToMany(ClearanceType::class, 'clearance_type_discount_rules')
                    ->withPivot('priority', 'is_active')
                    ->withTimestamps();
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'payment_discounts')
                    ->withPivot('discount_amount', 'verified_by', 'verified_at', 'id_presented', 'id_number', 'remarks')
                    ->withTimestamps();
    }

    public function paymentDiscounts()
    {
        return $this->hasMany(PaymentDiscount::class);
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

    public function scopeApplicableTo($query, $applicableTo)
    {
        return $query->where('applicable_to', $applicableTo)
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
            
            // Apply maximum discount if set
            if ($this->maximum_discount_amount && $discount > $this->maximum_discount_amount) {
                $discount = $this->maximum_discount_amount;
            }
        } else { // fixed
            $discount = min($this->discount_value, $amount);
        }

        return round($discount, 2);
    }

    public function isApplicableToResident(Resident $resident): bool
    {
        // Check if discount is active
        if (!$this->is_active) {
            return false;
        }

        // Check effective/expiry dates
        if ($this->effective_date && $this->effective_date->isFuture()) {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }

        // Check based on discount type
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
        // If this rule is not stackable, it can't combine with any
        if (!$this->stackable) {
            return false;
        }

        // Check exclusive_with list
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