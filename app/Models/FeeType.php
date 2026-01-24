<?php
// app/Models/FeeType.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeeType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'short_name',
        'document_category_id', // Changed from 'category'
        'base_amount',
        'amount_type',
        'computation_formula',
        'unit',
        'has_senior_discount',
        'has_pwd_discount',
        'has_solo_parent_discount',
        'has_indigent_discount',
        'discount_percentage',
        'has_surcharge',
        'surcharge_percentage',
        'surcharge_fixed',
        'has_penalty',
        'penalty_percentage',
        'penalty_fixed',
        'frequency',
        'validity_days',
        'applicable_to',
        'applicable_puroks',
        'requirements',
        'approval_needed',
        'effective_date',
        'expiry_date',
        'is_active',
        'is_mandatory',
        'auto_generate',
        'due_day',
        'sort_order',
        'description',
        'notes',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'surcharge_percentage' => 'decimal:2',
        'surcharge_fixed' => 'decimal:2',
        'penalty_percentage' => 'decimal:2',
        'penalty_fixed' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'has_senior_discount' => 'boolean',
        'has_pwd_discount' => 'boolean',
        'has_solo_parent_discount' => 'boolean',
        'has_indigent_discount' => 'boolean',
        'has_surcharge' => 'boolean',
        'has_penalty' => 'boolean',
        'is_active' => 'boolean',
        'is_mandatory' => 'boolean',
        'auto_generate' => 'boolean',
        'validity_days' => 'integer',
        'due_day' => 'integer',
        'sort_order' => 'integer',
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'computation_formula' => 'array',
        'applicable_puroks' => 'array',
        'requirements' => 'array',
    ];

    // Relationships
    public function fees()
    {
        return $this->hasMany(Fee::class);
    }

    public function paymentItems()
    {
        return $this->hasManyThrough(PaymentItem::class, Fee::class);
    }

    public function documentCategory()
    {
        return $this->belongsTo(DocumentCategory::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDocumentCategory($query, $documentCategoryId)
    {
        return $query->where('document_category_id', $documentCategoryId);
    }

    public function scopeApplicableTo($query, $type)
    {
        return $query->where('applicable_to', $type)
                    ->orWhere('applicable_to', 'all_residents');
    }

    public function scopeForPurok($query, $purok)
    {
        return $query->where(function($q) use ($purok) {
            $q->where('applicable_puroks', 'like', "%{$purok}%")
              ->orWhereNull('applicable_puroks');
        });
    }

    // Methods
    public function calculateAmount($parameters = [])
    {
        switch ($this->amount_type) {
            case 'fixed':
                return $this->base_amount;
                
            case 'computed':
                return $this->computeAmount($parameters);
                
            default:
                return $this->base_amount;
        }
    }

    private function computeAmount($parameters)
    {
        // Implement computation based on formula
        // Example: area * rate, or business_size * multiplier
        return $this->base_amount; // Default
    }

    public function getCategoryDisplayAttribute()
    {
        // Now get category from document_category relationship
        return $this->documentCategory ? $this->documentCategory->name : 'Uncategorized';
    }

    public function getApplicableToDisplayAttribute()
    {
        $types = [
            'all_residents' => 'All Residents',
            'property_owners' => 'Property Owners',
            'business_owners' => 'Business Owners',
            'households' => 'Households',
            'specific_purok' => 'Specific Purok',
            'specific_zone' => 'Specific Zone',
            'visitors' => 'Visitors',
        ];
        
        return $types[$this->applicable_to] ?? $this->applicable_to;
    }

    public function getFrequencyDisplayAttribute()
    {
        $frequencies = [
            'one_time' => 'One Time',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'semi_annual' => 'Semi-Annual',
            'annual' => 'Annual',
            'bi_annual' => 'Bi-Annual',
            'custom' => 'Custom',
        ];
        
        return $frequencies[$this->frequency] ?? $this->frequency;
    }

    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->code})";
    }

    public function discountFeeTypes()
    {
        return $this->hasMany(DiscountFeeType::class);
    }
}