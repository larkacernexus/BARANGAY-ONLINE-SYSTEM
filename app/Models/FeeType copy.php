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
        'has_senior_discount',
        'senior_discount_percentage',
        'has_pwd_discount',
        'pwd_discount_percentage',
        'has_solo_parent_discount',
        'solo_parent_discount_percentage',
        'has_indigent_discount',
        'indigent_discount_percentage',
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
        'senior_discount_percentage' => 'decimal:2',
        'pwd_discount_percentage' => 'decimal:2',
        'solo_parent_discount_percentage' => 'decimal:2',
        'indigent_discount_percentage' => 'decimal:2',
        'surcharge_percentage' => 'decimal:2',
        'surcharge_fixed' => 'decimal:2',
        'penalty_percentage' => 'decimal:2',
        'penalty_fixed' => 'decimal:2',
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

    public function scopeWithSeniorDiscount($query)
    {
        return $query->where('has_senior_discount', true);
    }

    public function scopeWithPwdDiscount($query)
    {
        return $query->where('has_pwd_discount', true);
    }

    public function scopeWithSoloParentDiscount($query)
    {
        return $query->where('has_solo_parent_discount', true);
    }

    public function scopeWithIndigentDiscount($query)
    {
        return $query->where('has_indigent_discount', true);
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
        // This would parse the computation_formula JSON and calculate
        // For now, return base amount
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

    public function getDiscountPercentageForResident(Resident $resident): float
    {
        if ($resident->is_senior && $this->has_senior_discount) {
            return $this->senior_discount_percentage ?? 0;
        }
        
        if ($resident->is_pwd && $this->has_pwd_discount) {
            return $this->pwd_discount_percentage ?? 0;
        }
        
        if ($resident->is_solo_parent && $this->has_solo_parent_discount) {
            return $this->solo_parent_discount_percentage ?? 0;
        }
        
        if ($resident->is_indigent && $this->has_indigent_discount) {
            return $this->indigent_discount_percentage ?? 0;
        }
        
        return 0;
    }

    public function isDiscountApplicableForResident(Resident $resident): bool
    {
        if ($resident->is_senior && $this->has_senior_discount) {
            return true;
        }
        
        if ($resident->is_pwd && $this->has_pwd_discount) {
            return true;
        }
        
        if ($resident->is_solo_parent && $this->has_solo_parent_discount) {
            return true;
        }
        
        if ($resident->is_indigent && $this->has_indigent_discount) {
            return true;
        }
        
        return false;
    }

    public function getApplicableDiscountTypes(): array
    {
        $discounts = [];
        
        if ($this->has_senior_discount) {
            $discounts['senior'] = [
                'percentage' => $this->senior_discount_percentage,
                'label' => 'Senior Citizen',
            ];
        }
        
        if ($this->has_pwd_discount) {
            $discounts['pwd'] = [
                'percentage' => $this->pwd_discount_percentage,
                'label' => 'Person with Disability',
            ];
        }
        
        if ($this->has_solo_parent_discount) {
            $discounts['solo_parent'] = [
                'percentage' => $this->solo_parent_discount_percentage,
                'label' => 'Solo Parent',
            ];
        }
        
        if ($this->has_indigent_discount) {
            $discounts['indigent'] = [
                'percentage' => $this->indigent_discount_percentage,
                'label' => 'Indigent',
            ];
        }
        
        return $discounts;
    }
}