<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeDiscount extends Model
{
    protected $fillable = [
        'fee_id',
        'discount_type_id',      // Fixed discount type (senior, pwd)
        'special_discount_id',   // Special discount (if applicable)
        'special_discount_application_id', // For approval tracking
        'discount_amount',
        'discount_percentage',
        'base_amount',
        'notes',
        'applied_by',
        'applied_at'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'base_amount' => 'decimal:2',
        'applied_at' => 'datetime',
    ];

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }

    public function discountType()
    {
        return $this->belongsTo(DiscountType::class);
    }

    public function specialDiscount()
    {
        return $this->belongsTo(SpecialDiscount::class);
    }

    public function specialDiscountApplication()
    {
        return $this->belongsTo(SpecialDiscountApplication::class);
    }

    public function appliedBy()
    {
        return $this->belongsTo(User::class, 'applied_by');
    }
}