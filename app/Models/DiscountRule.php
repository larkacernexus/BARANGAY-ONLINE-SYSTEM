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
        'discount_type', // Will be mapped to privilege codes
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
        // DYNAMIC: Map to privilege IDs
        'privilege_id', // Link to privileges table
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
        'type_label',
        'privilege_code', // DYNAMIC: Get from linked privilege
    ];

    // REMOVED: Hardcoded DISCOUNT_TYPES constant
    // REMOVED: Hardcoded VALUE_TYPES constant

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

    /**
     * Link to privilege - DYNAMIC
     */
    public function privilege()
    {
        return $this->belongsTo(Privilege::class);
    }

    /**
     * Get all privileges for reference
     */
    public function getAllPrivileges()
    {
        return Cache::remember('all_privileges_for_discounts', 3600, function () {
            return Privilege::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description'])
                ->keyBy('code')
                ->toArray();
        });
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

    /**
     * Scope by privilege ID
     */
    public function scopeByPrivilege($query, $privilegeId)
    {
        return $query->where('privilege_id', $privilegeId);
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
            
            if ($this->maximum_discount_amount && $discount > $this->maximum_discount_amount) {
                $discount = $this->maximum_discount_amount;
            }
        } else { // fixed
            $discount = min($this->discount_value, $amount);
        }

        return round($discount, 2);
    }

    /**
     * Check if discount is applicable to resident - DYNAMIC using privileges
     */
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

        // If linked to a specific privilege, check if resident has it
        if ($this->privilege_id) {
            return $resident->residentPrivileges()
                ->where('privilege_id', $this->privilege_id)
                ->whereNotNull('verified_at')
                ->exists();
        }

        // Fallback to discount_type for backward compatibility
        if ($this->discount_type) {
            return $resident->residentPrivileges()
                ->whereHas('privilege', function($q) {
                    $q->where('code', $this->discount_type);
                })
                ->whereNotNull('verified_at')
                ->exists();
        }

        return true;
    }

    /**
     * Check if resident has the required ID number for this discount
     */
    public function residentHasIdNumber(Resident $resident): bool
    {
        if (!$this->requires_verification) {
            return true;
        }

        // If linked to privilege, check for ID number
        if ($this->privilege_id) {
            return $resident->residentPrivileges()
                ->where('privilege_id', $this->privilege_id)
                ->whereNotNull('id_number')
                ->where('id_number', '!=', '')
                ->exists();
        }

        // Fallback to discount_type
        if ($this->discount_type) {
            return $resident->residentPrivileges()
                ->whereHas('privilege', function($q) {
                    $q->where('code', $this->discount_type);
                })
                ->whereNotNull('id_number')
                ->where('id_number', '!=', '')
                ->exists();
        }

        return false;
    }

    /**
     * Get resident's ID number for this discount
     */
    public function getResidentIdNumber(Resident $resident): ?string
    {
        if (!$this->requires_verification) {
            return null;
        }

        // If linked to privilege, get ID number
        if ($this->privilege_id) {
            $rp = $resident->residentPrivileges()
                ->where('privilege_id', $this->privilege_id)
                ->first();
                
            return $rp?->id_number;
        }

        // Fallback to discount_type
        if ($this->discount_type) {
            $rp = $resident->residentPrivileges()
                ->whereHas('privilege', function($q) {
                    $q->where('code', $this->discount_type);
                })
                ->first();
                
            return $rp?->id_number;
        }

        return null;
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

    /**
     * Get privilege code if linked - DYNAMIC
     */
    public function getPrivilegeCodeAttribute(): ?string
    {
        if ($this->relationLoaded('privilege') && $this->privilege) {
            return $this->privilege->code;
        }
        
        if ($this->privilege_id) {
            $privilege = Privilege::find($this->privilege_id);
            return $privilege?->code;
        }

        return $this->discount_type;
    }

    /**
     * Get type label dynamically from privilege
     */
    public function getTypeLabelAttribute(): string
    {
        if ($this->relationLoaded('privilege') && $this->privilege) {
            return $this->privilege->name;
        }

        if ($this->privilege_id) {
            $privilege = Privilege::find($this->privilege_id);
            if ($privilege) {
                return $privilege->name;
            }
        }

        // Fallback: try to format the discount_type
        return ucwords(strtolower(str_replace('_', ' ', $this->discount_type ?? 'Unknown')));
    }

    /**
     * Get applicable privileges from database
     */
    public static function getApplicableDiscountTypes(): array
    {
        $privileges = Privilege::where('is_active', true)
            ->orderBy('name')
            ->get(['code', 'name']);

        $types = [];
        foreach ($privileges as $p) {
            $types[$p->code] = $p->name;
        }

        return $types;
    }

    /**
     * Get all discount rules with their linked privileges
     */
    public static function getActiveWithPrivileges()
    {
        return self::with('privilege')
            ->active()
            ->priorityOrder()
            ->get()
            ->map(function ($rule) {
                $rule->privilege_name = $rule->privilege?->name ?? 
                    ucwords(strtolower(str_replace('_', ' ', $rule->discount_type ?? 'Unknown')));
                $rule->privilege_code = $rule->privilege?->code ?? $rule->discount_type;
                return $rule;
            });
    }

    /**
     * Create a discount rule for a privilege
     */
    public static function createForPrivilege(Privilege $privilege, array $data = []): self
    {
        $defaults = [
            'code' => $privilege->code,
            'name' => $privilege->name . ' Discount',
            'description' => $privilege->description ?? 'Discount for ' . $privilege->name,
            'discount_type' => $privilege->code,
            'privilege_id' => $privilege->id,
            'value_type' => 'percentage',
            'discount_value' => $privilege->default_discount_percentage ?? 0,
            'requires_verification' => $privilege->requires_verification,
            'verification_document' => $privilege->requires_verification ? 'Government ID' : null,
            'is_active' => $privilege->is_active,
        ];

        return self::create(array_merge($defaults, $data));
    }

    /**
     * Sync discount rules with privileges
     */
    public static function syncWithPrivileges(): void
    {
        $privileges = Privilege::where('is_active', true)->get();

        foreach ($privileges as $privilege) {
            $rule = self::where('privilege_id', $privilege->id)->first();
            
            if (!$rule) {
                self::createForPrivilege($privilege);
            } else {
                $rule->update([
                    'code' => $privilege->code,
                    'name' => $privilege->name . ' Discount',
                    'description' => $privilege->description ?? $rule->description,
                    'discount_type' => $privilege->code,
                    'discount_value' => $privilege->default_discount_percentage ?? $rule->discount_value,
                    'requires_verification' => $privilege->requires_verification,
                    'is_active' => $privilege->is_active,
                ]);
            }
        }

        // Deactivate rules for inactive privileges
        self::whereNotNull('privilege_id')
            ->whereNotIn('privilege_id', $privileges->pluck('id'))
            ->update(['is_active' => false]);
    }
}