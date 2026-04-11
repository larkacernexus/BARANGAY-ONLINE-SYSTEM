<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscountRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'discount_rules';

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type_id',
        'privilege_id',  // Optional: rule specific to a privilege
        'value_type',
        'discount_value',
        'maximum_discount_amount',
        'minimum_purchase_amount',
        'priority',
        'applicable_to',
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
        'sort_order' => 'integer',
        'stackable' => 'boolean',
        'is_active' => 'boolean',
        'exclusive_with' => 'array',
        'applicable_puroks' => 'array',
        'effective_date' => 'date',
        'expiry_date' => 'date',
    ];

    protected $appends = [
        'formatted_value',
        'status',
        'is_expired',
        'type_label',
    ];

    // ========== RELATIONSHIPS ==========
    
    /**
     * The discount type this rule belongs to
     */
    public function discountType()
    {
        return $this->belongsTo(DiscountType::class);
    }

    /**
     * Optional: Specific privilege this rule applies to
     */
    public function privilege()
    {
        return $this->belongsTo(Privilege::class);
    }

    /**
     * Fee types this rule applies to
     */
    public function feeTypes()
    {
        return $this->belongsToMany(FeeType::class, 'fee_type_discount_rules')
                    ->withPivot('priority', 'is_active')
                    ->withTimestamps();
    }

    /**
     * Clearance types this rule applies to
     */
    public function clearanceTypes()
    {
        return $this->belongsToMany(ClearanceType::class, 'clearance_type_discount_rules')
                    ->withPivot('priority', 'is_active')
                    ->withTimestamps();
    }

    /**
     * Payments that used this rule
     */
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

    // ========== SCOPES ==========
    
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

    public function scopeByDiscountType($query, $discountTypeId)
    {
        return $query->where('discount_type_id', $discountTypeId);
    }

    public function scopeByPrivilege($query, $privilegeId)
    {
        return $query->where('privilege_id', $privilegeId)
                    ->orWhereNull('privilege_id');
    }

    public function scopeApplicableTo($query, $applicableTo)
    {
        return $query->where('applicable_to', $applicableTo)
                    ->orWhere('applicable_to', 'all');
    }

    public function scopeForPurok($query, $purok)
    {
        return $query->where(function($q) use ($purok) {
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

    // ========== METHODS ==========
    
    /**
     * Calculate discount amount based on this rule
     */
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
        } else { // fixed amount
            $discount = min($this->discount_value, $amount);
        }

        return round($discount, 2);
    }

    /**
     * Check if this rule applies to a resident
     */
    public function isApplicableToResident(Resident $resident): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Check date validity
        if ($this->effective_date && $this->effective_date->isFuture()) {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }

        // Check if resident has the required privilege
        $privilegeQuery = $resident->residentPrivileges()
            ->whereNotNull('verified_at')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });

        // If rule is for a specific privilege
        if ($this->privilege_id) {
            $privilegeQuery->where('privilege_id', $this->privilege_id);
        } 
        // Otherwise, check for any privilege that grants this discount type
        else if ($this->discount_type_id) {
            $privilegeQuery->whereHas('privilege', function($q) {
                $q->where('discount_type_id', $this->discount_type_id);
            });
        }

        return $privilegeQuery->exists();
    }

    /**
     * Check if two rules can be combined
     */
    public function canCombineWith(DiscountRule $otherRule): bool
    {
        if (!$this->stackable) {
            return false;
        }

        if (!empty($this->exclusive_with)) {
            $exclusiveIds = $this->exclusive_with;
            
            if (in_array($otherRule->discount_type_id, $exclusiveIds)) {
                return false;
            }
            
            if (in_array($otherRule->id, $exclusiveIds)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the effective discount percentage (rule override or discount type default)
     */
    public function getEffectivePercentage(): float
    {
        if ($this->value_type === 'percentage' && $this->discount_value) {
            return $this->discount_value;
        }
        
        return $this->discountType?->percentage ?? 0;
    }

    // ========== ACCESSORS ==========
    
    public function getFormattedValueAttribute(): string
    {
        if ($this->value_type === 'percentage') {
            return $this->discount_value . '%';
        }
        
        return '₱' . number_format($this->discount_value, 2);
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
        if ($this->discountType) {
            return $this->discountType->name;
        }
        
        return 'Unknown Discount Type';
    }

    public function getPrivilegeNameAttribute(): ?string
    {
        return $this->privilege?->name;
    }

    public function getPrivilegeCodeAttribute(): ?string
    {
        return $this->privilege?->code;
    }
}