<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialDiscount extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'fee_type_id', // NULL = applies to all fee types
        'discount_type_id',
        'percentage', // OR fixed_amount (choose one)
        'fixed_amount',
        'is_percentage',
        'max_discount', // Cap amount
        'requires_approval',
        'approver_role', // 'captain', 'treasurer', 'secretary'
        'valid_from',
        'valid_to',
        'usage_limit',
        'times_used',
        'is_active',
        'conditions', // JSON: {'resident_age': '>=60', 'income': 'low'}
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'is_percentage' => 'boolean',
        'requires_approval' => 'boolean',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'conditions' => 'array',
    ];

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function discountType()
    {
        return $this->belongsTo(DiscountType::class);
    }

    public function applications()
    {
        return $this->hasMany(SpecialDiscountApplication::class);
    }

    public function isEligible($payer)
    {
        // Check date validity
        $now = now();
        if ($this->valid_from && $now->lt($this->valid_from)) return false;
        if ($this->valid_to && $now->gt($this->valid_to)) return false;
        
        // Check usage limit
        if ($this->usage_limit && $this->times_used >= $this->usage_limit) return false;
        
        // Check conditions (if any)
        return $this->checkConditions($payer);
    }
    
    private function checkConditions($payer)
    {
        // Implement condition checking logic
        return true;
    }
}