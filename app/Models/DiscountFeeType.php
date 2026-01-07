<?php
// app/Models/DiscountFeeType.php
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
        'sort_order',
        'notes'
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
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

    // Helper methods
    public function getDisplayPercentageAttribute()
    {
        return "{$this->percentage}%";
    }
}