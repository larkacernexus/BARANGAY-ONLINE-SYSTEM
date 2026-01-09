<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'or_number',
        'payer_type',
        'payer_id',
        'payer_name',
        'contact_number',
        'address',
        'household_number',
        'purok',
        'payment_date',
        'period_covered',
        'payment_method',
        'reference_number',
        'subtotal',
        'surcharge',
        'penalty',
        'discount',
        'discount_type',
        'total_amount',
        'purpose',
        'remarks',
        'is_cleared',
        'clearance_type', // Changed from certificate_type
        'validity_date',
        'collection_type',
        'status',
        'method_details',
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'validity_date' => 'date',
        'subtotal' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'penalty' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_cleared' => 'boolean',
        'method_details' => 'array',
    ];

    protected $appends = [
        'formatted_total',
        'formatted_date',
        'formatted_subtotal',
        'formatted_surcharge',
        'formatted_penalty',
        'formatted_discount',
        'payment_method_display',
        'status_display',
        'collection_type_display',
        'clearance_type_display', // Changed from certificate_type_display
        'is_cleared_display',
        'has_surcharge',
        'has_penalty',
        'has_discount',
        'payer_details',
        'is_clearance_payment', // New attribute
    ];

    protected $attributes = [
        'status' => 'completed',
        'collection_type' => 'manual',
    ];

    // Relationships
    public function items()
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'payer_id');
    }

    public function household()
    {
        return $this->belongsTo(Household::class, 'payer_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function clearanceRequest()
    {
        return $this->belongsTo(ClearanceRequest::class, 'clearance_request_id');
    }

    // Accessors
    public function getFormattedTotalAttribute()
    {
        return '₱' . number_format($this->total_amount, 2);
    }

    public function getFormattedSubtotalAttribute()
    {
        return '₱' . number_format($this->subtotal, 2);
    }

    public function getFormattedSurchargeAttribute()
    {
        return '₱' . number_format($this->surcharge, 2);
    }

    public function getFormattedPenaltyAttribute()
    {
        return '₱' . number_format($this->penalty, 2);
    }

    public function getFormattedDiscountAttribute()
    {
        return '₱' . number_format($this->discount, 2);
    }

    public function getFormattedDateAttribute()
    {
        return $this->payment_date->format('M d, Y h:i A');
    }

    public function getPaymentMethodDisplayAttribute()
    {
        $methods = [
            'cash' => 'Cash',
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank' => 'Bank Transfer',
            'check' => 'Check',
            'online' => 'Online Payment',
        ];

        return $methods[$this->payment_method] ?? ucfirst($this->payment_method);
    }

    public function getStatusDisplayAttribute()
    {
        return ucfirst($this->status);
    }

    public function getCollectionTypeDisplayAttribute()
    {
        $types = [
            'manual' => 'Manual Collection',
            'online' => 'Online Collection',
            'mobile' => 'Mobile Collection',
        ];

        return $types[$this->collection_type] ?? ucfirst($this->collection_type);
    }

    public function getClearanceTypeDisplayAttribute() // Changed from getCertificateTypeDisplayAttribute
    {
        if (!$this->clearance_type) {
            return null;
        }

        // Common clearance types with display names
        $types = [
            // Barangay Clearances
            'BRGY_CLEARANCE' => 'Barangay Clearance',
            'BARANGAY_CLEARANCE' => 'Barangay Clearance',
            'clearance' => 'Barangay Clearance',
            
            // Business Clearances
            'BUSINESS_CLEARANCE' => 'Business Clearance',
            'BUSINESS_PERMIT' => 'Business Permit',
            
            // Police/NBI Clearances
            'POLICE_CLEARANCE' => 'Police Clearance Endorsement',
            'NBI_CLEARANCE' => 'NBI Clearance Endorsement',
            'NBI_CLEARANCE_ENDORSEMENT' => 'NBI Clearance Endorsement',
            
            // Certificates
            'INDIGENCY_CERT' => 'Certificate of Indigency',
            'INDIGENCY_CERTIFICATE' => 'Certificate of Indigency',
            'RESIDENCY_CERT' => 'Certificate of Residency',
            'RESIDENCY_CERTIFICATE' => 'Certificate of Residency',
            'GOOD_MORAL_CERT' => 'Good Moral Character Certificate',
            
            // Travel
            'TRAVEL_CLEARANCE' => 'Travel Clearance',
            
            // Employment
            'EMPLOYMENT_CLEARANCE' => 'Employment Clearance',
            'SCHOLARSHIP_CLEARANCE' => 'Scholarship Clearance',
            
            // Other
            'CEDULA' => 'Cedula',
            'OTHER' => 'Other Certificate',
            'other' => 'Other Certificate',
        ];

        // First check for exact match
        if (isset($types[$this->clearance_type])) {
            return $types[$this->clearance_type];
        }
        
        // Check for case-insensitive match
        $lowercaseType = strtolower($this->clearance_type);
        foreach ($types as $key => $value) {
            if (strtolower($key) === $lowercaseType) {
                return $value;
            }
        }
        
        // If no match, try to find partial matches
        if (str_contains(strtolower($this->clearance_type), 'indigen')) {
            return 'Certificate of Indigency';
        }
        if (str_contains(strtolower($this->clearance_type), 'residen')) {
            return 'Certificate of Residency';
        }
        if (str_contains(strtolower($this->clearance_type), 'business')) {
            return 'Business Clearance';
        }
        if (str_contains(strtolower($this->clearance_type), 'nbi')) {
            return 'NBI Clearance Endorsement';
        }
        if (str_contains(strtolower($this->clearance_type), 'police')) {
            return 'Police Clearance Endorsement';
        }
        if (str_contains(strtolower($this->clearance_type), 'travel')) {
            return 'Travel Clearance';
        }
        if (str_contains(strtolower($this->clearance_type), 'employ')) {
            return 'Employment Clearance';
        }
        if (str_contains(strtolower($this->clearance_type), 'scholarship')) {
            return 'Scholarship Clearance';
        }
        if (str_contains(strtolower($this->clearance_type), 'good moral')) {
            return 'Good Moral Character Certificate';
        }
        
        // Default: return the original value with proper casing
        return ucwords(str_replace('_', ' ', $this->clearance_type));
    }

    public function getIsClearedDisplayAttribute()
    {
        return $this->is_cleared ? 'Yes' : 'No';
    }

    public function getHasSurchargeAttribute()
    {
        return $this->surcharge > 0;
    }

    public function getHasPenaltyAttribute()
    {
        return $this->penalty > 0;
    }

    public function getHasDiscountAttribute()
    {
        return $this->discount > 0;
    }

    public function getPayerDetailsAttribute()
    {
        if ($this->payer_type === 'resident') {
            $resident = $this->resident;
            if (!$resident) {
                return null;
            }

            return [
                'id' => $resident->id,
                'name' => $resident->name ?? $resident->full_name ?? 'Unknown',
                'contact_number' => $resident->contact_number ?? $resident->phone_number ?? null,
                'email' => $resident->email ?? null,
                'address' => $resident->address ?? $resident->full_address ?? null,
                'household_number' => $resident->household_number ?? null,
                'purok' => $resident->purok ?? null,
                'household' => $resident->household ? [
                    'id' => $resident->household->id,
                    'household_number' => $resident->household->household_number,
                    'purok' => $resident->household->purok,
                ] : null,
            ];
        }

        if ($this->payer_type === 'household') {
            $household = $this->household;
            if (!$household) {
                return null;
            }

            return [
                'id' => $household->id,
                'name' => $household->household_name ?? $household->name ?? 'Unknown',
                'contact_number' => $household->primary_contact ?? $household->contact_number ?? null,
                'email' => $household->email ?? null,
                'address' => $household->household_address ?? $household->address ?? null,
                'household_number' => $household->household_number,
                'purok' => $household->purok,
                'members' => $household->members->map(function($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'relationship' => $member->relationship,
                    ];
                })->toArray(),
            ];
        }

        return null;
    }

    public function getIsClearancePaymentAttribute()
    {
        return !empty($this->clearance_type) || !empty($this->clearance_request_id);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('payment_date', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year);
    }

    public function scopeByPayer($query, $payerType, $payerId)
    {
        return $query->where('payer_type', $payerType)
                    ->where('payer_id', $payerId);
    }

    public function scopeWithPayerDetails($query)
    {
        return $query->with(['resident.household', 'household.members']);
    }

    public function scopeClearancePayments($query)
    {
        return $query->whereNotNull('clearance_type')
                    ->orWhereNotNull('clearance_request_id');
    }

    public function scopeByClearanceType($query, $clearanceType)
    {
        return $query->where('clearance_type', $clearanceType);
    }

    public function scopeWithClearanceRequest($query)
    {
        return $query->with('clearanceRequest.clearanceType');
    }

    // Static methods
    public static function generateOrNumber()
    {
        $date = now()->format('Ymd');
        $lastPayment = self::where('or_number', 'like', "BAR-{$date}-%")
            ->orderBy('or_number', 'desc')
            ->first();

        if ($lastPayment) {
            $lastNumber = (int) substr($lastPayment->or_number, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return "BAR-{$date}-{$newNumber}";
    }

    // Helper methods
    public function isClearancePayment()
    {
        return $this->is_clearance_payment;
    }

    public function getClearanceTypeName()
    {
        return $this->clearance_type_display;
    }

    public function linkToClearanceRequest(ClearanceRequest $clearanceRequest)
    {
        $this->clearance_request_id = $clearanceRequest->id;
        $this->clearance_type = $clearanceRequest->clearanceType->code ?? $clearanceRequest->clearance_type;
        $this->save();
        
        return $this;
    }


public function clearanceType()
{
    return $this->belongsTo(ClearanceType::class, 'clearance_type_id');
}
    
}