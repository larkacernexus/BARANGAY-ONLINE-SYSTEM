<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class ClearanceType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'fee',
        'is_discountable', // NEW
        'processing_days',
        'validity_days',
        'is_active',
        'requires_payment',
        'requires_approval',
        'is_online_only',
        'requirements',
        'eligibility_criteria',
        'purpose_options',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'is_discountable' => 'boolean', // NEW
        'is_active' => 'boolean',
        'requires_payment' => 'boolean',
        'requires_approval' => 'boolean',
        'is_online_only' => 'boolean',
        'requirements' => 'array',
        'eligibility_criteria' => 'array',
        'processing_days' => 'integer',
        'validity_days' => 'integer',
    ];

    protected $appends = [
        'formatted_fee',
        'estimated_completion_date',
        'document_types_count',
        'required_document_types_count',
        'has_required_documents',
        'document_requirements',
    ];

    const COMMON_TYPES = [
        'BARANGAY_CLEARANCE' => [
            'name' => 'Barangay Clearance',
            'code' => 'BRGY_CLEARANCE',
            'description' => 'General barangay clearance for various purposes',
            'fee' => 100.00,
            'is_discountable' => true, // NEW
            'processing_days' => 1,
            'validity_days' => 30,
        ],
        'BUSINESS_CLEARANCE' => [
            'name' => 'Business Clearance',
            'code' => 'BUSINESS_CLEARANCE',
            'description' => 'Clearance for business registration and permits',
            'fee' => 300.00,
            'is_discountable' => false, // NEW
            'processing_days' => 3,
            'validity_days' => 365,
        ],
        'POLICE_CLEARANCE' => [
            'name' => 'Police Clearance Endorsement',
            'code' => 'POLICE_CLEARANCE',
            'description' => 'Barangay endorsement for police clearance',
            'fee' => 50.00,
            'is_discountable' => true, // NEW
            'processing_days' => 2,
            'validity_days' => 30,
        ],
        'NBI_CLEARANCE' => [
            'name' => 'NBI Clearance Endorsement',
            'code' => 'NBI_CLEARANCE',
            'description' => 'Barangay endorsement for NBI clearance',
            'fee' => 50.00,
            'is_discountable' => true, // NEW
            'processing_days' => 2,
            'validity_days' => 30,
        ],
        'TRAVEL_CLEARANCE' => [
            'name' => 'Travel Clearance',
            'code' => 'TRAVEL_CLEARANCE',
            'description' => 'Clearance for domestic/international travel',
            'fee' => 150.00,
            'is_discountable' => true, // NEW
            'processing_days' => 2,
            'validity_days' => 60,
        ],
        'EMPLOYMENT_CLEARANCE' => [
            'name' => 'Employment Clearance',
            'code' => 'EMPLOYMENT_CLEARANCE',
            'description' => 'Clearance for employment purposes',
            'fee' => 100.00,
            'is_discountable' => true, // NEW
            'processing_days' => 2,
            'validity_days' => 30,
        ],
        'SCHOLARSHIP_CLEARANCE' => [
            'name' => 'Scholarship Clearance',
            'code' => 'SCHOLARSHIP_CLEARANCE',
            'description' => 'Clearance for scholarship applications',
            'fee' => 50.00,
            'is_discountable' => true, // NEW
            'processing_days' => 2,
            'validity_days' => 30,
        ],
        'INDIGENCY_CERTIFICATE' => [
            'name' => 'Certificate of Indigency',
            'code' => 'INDIGENCY_CERT',
            'description' => 'Certificate for indigent residents',
            'fee' => 0.00,
            'is_discountable' => false, // NEW
            'processing_days' => 3,
            'validity_days' => 90,
            'requires_payment' => false,
        ],
        'RESIDENCY_CERTIFICATE' => [
            'name' => 'Certificate of Residency',
            'code' => 'RESIDENCY_CERT',
            'description' => 'Proof of residency certificate',
            'fee' => 50.00,
            'is_discountable' => true, // NEW
            'processing_days' => 1,
            'validity_days' => 90,
        ],
        'GOOD_MORAL_CERTIFICATE' => [
            'name' => 'Good Moral Character Certificate',
            'code' => 'GOOD_MORAL_CERT',
            'description' => 'Certificate of good moral character',
            'fee' => 100.00,
            'is_discountable' => true, // NEW
            'processing_days' => 3,
            'validity_days' => 30,
        ],
    ];

    public function documentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class)->orderBy('sort_order', 'asc');
    }

    public function requiredDocumentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class)
                    ->where('is_required', true)
                    ->orderBy('sort_order', 'asc');
    }

    public function optionalDocumentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class)
                    ->where('is_required', false)
                    ->orderBy('sort_order', 'asc');
    }

    public function getDocumentTypesAttribute()
    {
        if (!$this->relationLoaded('documentRequirements')) {
            $this->load(['documentRequirements.documentType']);
        }
        
        return $this->documentRequirements->map(function($req) {
            $docType = $req->documentType;
            return (object) [
                'id' => $docType->id,
                'name' => $docType->name,
                'description' => $docType->description,
                'is_required' => $req->is_required,
                'sort_order' => $req->sort_order,
                'is_active' => $docType->is_active,
            ];
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDiscountable($query) // NEW
    {
        return $query->where('is_discountable', true);
    }

    public function scopeRequiresPayment($query)
    {
        return $query->where('requires_payment', true);
    }

    public function scopeRequiresApproval($query)
    {
        return $query->where('requires_approval', true);
    }

    public function scopeOnlineOnly($query)
    {
        return $query->where('is_online_only', true);
    }

    public function getFormattedFeeAttribute()
    {
        return '₱' . number_format($this->fee, 2);
    }

    public function getDocumentTypesCountAttribute()
    {
        if ($this->relationLoaded('documentRequirements')) {
            return $this->documentRequirements->count();
        }
        
        return $this->documentRequirements()->count();
    }

    public function getRequiredDocumentTypesCountAttribute()
    {
        if ($this->relationLoaded('documentRequirements')) {
            return $this->documentRequirements->where('is_required', true)->count();
        }
        
        return $this->requiredDocumentRequirements()->count();
    }

    public function getHasRequiredDocumentsAttribute(): bool
    {
        return $this->required_document_types_count > 0;
    }

    public function getEstimatedCompletionDateAttribute()
    {
        return now()->addWeekdays($this->processing_days)->format('F j, Y');
    }

    public function getDocumentRequirementsAttribute(): array
    {
        $requirements = [];
        
        if (property_exists($this, 'documentRequirements') && $this->relationLoaded('documentRequirements')) {
            foreach ($this->documentRequirements as $requirement) {
                if ($requirement->relationLoaded('documentType')) {
                    $docType = $requirement->documentType;
                    $requirements[] = [
                        'id' => $requirement->document_type_id,
                        'name' => $docType->name ?? 'Unknown',
                        'description' => $docType->description ?? '',
                        'is_required' => (bool) $requirement->is_required,
                        'sort_order' => (int) $requirement->sort_order,
                    ];
                }
            }
        }
        
        return $requirements;
    }

    public function isEligible(Resident $resident): bool
    {
        if (empty($this->eligibility_criteria)) {
            return true;
        }

        foreach ($this->eligibility_criteria as $criterion) {
            if (!$this->checkCriterion($criterion, $resident)) {
                return false;
            }
        }

        return true;
    }

    private function checkCriterion(array $criterion, Resident $resident): bool
    {
        $field = $criterion['field'];
        $operator = $criterion['operator'];
        $value = $criterion['value'];

        $residentValue = data_get($resident, $field);

        switch ($operator) {
            case 'equals':
                return $residentValue == $value;
            case 'not_equals':
                return $residentValue != $value;
            case 'greater_than':
                return $residentValue > $value;
            case 'less_than':
                return $residentValue < $value;
            case 'greater_than_or_equal':
                return $residentValue >= $value;
            case 'less_than_or_equal':
                return $residentValue <= $value;
            case 'in':
                return in_array($residentValue, (array)$value);
            case 'not_in':
                return !in_array($residentValue, (array)$value);
            case 'contains':
                return str_contains(strtolower($residentValue ?? ''), strtolower($value));
            default:
                return false;
        }
    }

    public function getPurposeOptionsArrayAttribute(): array
    {
        if (empty($this->purpose_options)) {
            return [
                'Employment',
                'Business Registration',
                'Travel',
                'School Requirement',
                'Government Transaction',
                'Loan Application',
                'Other',
            ];
        }

        if (is_array($this->purpose_options)) {
            return $this->purpose_options;
        }

        return array_map('trim', explode(',', $this->purpose_options));
    }

    public function getRequirementsListAttribute(): array
    {
        if (empty($this->requirements)) {
            return [
                'Valid ID (Any Government Issued)',
                'Proof of Residency',
                'Recent 1x1 or 2x2 ID Picture',
            ];
        }

        return $this->requirements;
    }

    public function calculateExpiryDate(\DateTimeInterface $issueDate): ?\DateTimeInterface
    {
        if (!$this->validity_days) {
            return null;
        }

        return (clone $issueDate)->add(new \DateInterval("P{$this->validity_days}D"));
    }

    public function syncDocumentRequirements(array $requirements): void
    {
        $this->documentRequirements()->delete();
        
        foreach ($requirements as $index => $req) {
            DocumentRequirement::create([
                'clearance_type_id' => $this->id,
                'document_type_id' => $req['document_type_id'],
                'is_required' => $req['is_required'] ?? true,
                'sort_order' => $req['sort_order'] ?? $index,
            ]);
        }
    }

    public function addRequiredDocumentType(DocumentType $documentType, int $sortOrder = 0): void
    {
        DocumentRequirement::create([
            'clearance_type_id' => $this->id,
            'document_type_id' => $documentType->id,
            'is_required' => true,
            'sort_order' => $sortOrder,
        ]);
    }

    public function addOptionalDocumentType(DocumentType $documentType, int $sortOrder = 0): void
    {
        DocumentRequirement::create([
            'clearance_type_id' => $this->id,
            'document_type_id' => $documentType->id,
            'is_required' => false,
            'sort_order' => $sortOrder,
        ]);
    }

    public function clearanceRequests()
    {
        return $this->hasMany(ClearanceRequest::class);
    }

    public function getDocumentTypesManually()
    {
        return DB::table('document_requirements as dr')
            ->join('document_types as dt', 'dr.document_type_id', '=', 'dt.id')
            ->where('dr.clearance_type_id', $this->id)
            ->where('dt.is_active', true)
            ->select(
                'dt.id',
                'dt.name',
                'dt.description',
                'dt.is_active',
                'dr.is_required',
                'dr.sort_order'
            )
            ->orderBy('dr.sort_order', 'asc')
            ->get();
    }
}