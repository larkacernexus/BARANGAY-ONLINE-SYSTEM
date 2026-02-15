<?php
// app/Models/DiscountType.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DiscountType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'default_percentage',
        'legal_basis',
        'requirements',
        'is_active',
        'is_mandatory',
        'sort_order'
    ];

    protected $casts = [
        'default_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'is_mandatory' => 'boolean',
        'requirements' => 'array',
    ];

    // Relationship to FeeTypes through DiscountFeeType
    public function feeTypes()
    {
        return $this->belongsToMany(FeeType::class, 'discount_fee_types')
            ->using(DiscountFeeType::class)
            ->withPivot('percentage', 'is_active', 'notes')
            ->withTimestamps();
    }

    // Direct relationship to DiscountFeeType
    public function discountFeeTypes()
    {
        return $this->hasMany(DiscountFeeType::class);
    }

    // Scopes
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

    // Helper methods
    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->default_percentage}%)";
    }

    public function getRequirementsListAttribute()
    {
        return $this->requirements ? implode(', ', $this->requirements) : 'None';
    }
}