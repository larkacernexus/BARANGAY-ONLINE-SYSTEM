<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeeType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'document_category_id',
        'name',
        'short_name',
        'base_amount',
        'amount_type',
        'computation_formula',
        'unit',
        'is_discountable',
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
        'is_discountable' => 'boolean',
        'surcharge_percentage' => 'decimal:2',
        'surcharge_fixed' => 'decimal:2',
        'penalty_percentage' => 'decimal:2',
        'penalty_fixed' => 'decimal:2',
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

    protected $appends = [
        'display_name',
        'category_display',
        'applicable_to_display',
        'frequency_display',
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

    public function scopeDiscountable($query)
    {
        return $query->where('is_discountable', true);
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
        return $query->where(function ($q) use ($purok) {
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
        return $this->base_amount;
    }

    public function getCategoryDisplayAttribute()
    {
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
}