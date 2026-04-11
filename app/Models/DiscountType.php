<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DiscountType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'discount_types';

    protected $fillable = [
        'code',
        'name',
        'description',
        'percentage',
        'legal_basis',
        'requirements',
        'is_active',
        'is_mandatory',
        'sort_order',
        'priority',
        'requires_id_number',
        'requires_verification',
        'verification_document',
        'validity_days',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'is_mandatory' => 'boolean',
        'sort_order' => 'integer',
        'priority' => 'integer',
        'requires_id_number' => 'boolean',
        'requires_verification' => 'boolean',
        'validity_days' => 'integer',
        'requirements' => 'array', // JSON field
    ];

    protected $attributes = [
        'is_active' => true,
        'is_mandatory' => false,
        'sort_order' => 0,
        'priority' => 100,
        'requires_id_number' => true,
        'requires_verification' => true,
        'validity_days' => 365,
        'percentage' => 0,
    ];

    // ========== RELATIONSHIPS ==========
    
    /**
     * Privileges that grant this discount
     */
    public function privileges()
    {
        return $this->hasMany(Privilege::class);
    }

    /**
     * Rules that constrain/override this discount
     */
    public function discountRules()
    {
        return $this->hasMany(DiscountRule::class);
    }

    /**
     * Fee types this discount applies to (via pivot)
     */
    public function feeTypes()
    {
        return $this->belongsToMany(FeeType::class, 'discount_fee_types')
            ->using(DiscountFeeType::class)
            ->withPivot('percentage', 'is_active', 'notes')
            ->withTimestamps();
    }

    public function discountFeeTypes()
    {
        return $this->hasMany(DiscountFeeType::class);
    }

    // ========== SCOPES ==========
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }

    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }

    public function scopeRequiresVerification($query)
    {
        return $query->where('requires_verification', true);
    }

    public function scopeRequiresIdNumber($query)
    {
        return $query->where('requires_id_number', true);
    }

    // ========== ACCESSORS ==========
    
    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->percentage}%)";
    }

    public function getRequirementsListAttribute()
    {
        if (empty($this->requirements)) {
            return 'None';
        }
        
        if (is_array($this->requirements)) {
            return implode(', ', $this->requirements);
        }
        
        return $this->requirements;
    }

    public function getVerificationRequiredLabelAttribute()
    {
        return $this->requires_verification ? 'Yes' : 'No';
    }

    public function getIdNumberRequiredLabelAttribute()
    {
        return $this->requires_id_number ? 'Yes' : 'No';
    }

    // ========== HELPER METHODS ==========
    
    /**
     * Find discount type by code
     */
    public static function findByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }

    /**
     * Get active discount types with their rules
     */
    public static function getActiveWithRules()
    {
        return static::with(['discountRules' => function($q) {
                $q->active()->priorityOrder();
            }])
            ->active()
            ->orderByPriority()
            ->get();
    }

    /**
     * Calculate discount for an amount (base calculation without rules)
     */
    public function calculateDiscount($amount)
    {
        return $amount * ($this->percentage / 100);
    }

    /**
     * Check if this discount type has any active rules
     */
    public function hasActiveRules(): bool
    {
        return $this->discountRules()->active()->exists();
    }
}