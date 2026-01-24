<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Notifications\Notifiable; 


class Payment extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, Notifiable; 

protected $fillable = [
    'status',
    'collection_type',
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
    'clearance_code',
    'certificate_type',
    'validity_date',
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
        'clearance_type_display',
        'is_cleared_display',
        'has_surcharge',
        'has_penalty',
        'has_discount',
        'payer_details',
        'is_clearance_payment',
        'recorded_by_user_name',
        'has_clearance_request', // NEW: Check if any item has clearance request
    ];

    protected $attributes = [
        'status' => 'completed',
        'collection_type' => 'manual',
    ];

    /**
     * ACTIVITY LOG CONFIGURATION
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'or_number',
                'payer_name',
                'total_amount',
                'payment_method',
                'status',
                'recorded_by', // MOST IMPORTANT for audit
                'clearance_type',
                'is_cleared',
                'remarks',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(function(string $eventName) {
                return "Payment {$eventName} - OR#{$this->or_number}";
            })
            ->useLogName('payments');
    }

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

    // REMOVED: clearanceRequest() relationship
    // This is now accessed through payment items

    public function clearanceType()
    {
        return $this->belongsTo(ClearanceType::class, 'clearance_type_id');
    }

    // NEW: Get clearance requests through items
    public function clearanceRequests()
    {
        return $this->hasManyThrough(
            ClearanceRequest::class,
            PaymentItem::class,
            'payment_id', // Foreign key on PaymentItem table
            'id', // Foreign key on ClearanceRequest table
            'id', // Local key on Payment table
            'clearance_request_id' // Local key on PaymentItem table
        );
    }

    // NEW: Get first clearance request (for single clearance payments)
    public function firstClearanceRequest()
    {
        return $this->items()
            ->with('clearanceRequest')
            ->whereNotNull('clearance_request_id')
            ->first()
            ?->clearanceRequest;
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

    public function getClearanceTypeDisplayAttribute()
    {
        if (!$this->clearance_type) {
            return null;
        }

        if ($this->clearanceType) {
            return $this->clearanceType->name;
        }

        $types = [
            'BRGY_CLEARANCE' => 'Barangay Clearance',
            'BARANGAY_CLEARANCE' => 'Barangay Clearance',
            'clearance' => 'Barangay Clearance',
            'BUSINESS_CLEARANCE' => 'Business Clearance',
            'BUSINESS_PERMIT' => 'Business Permit',
            'POLICE_CLEARANCE' => 'Police Clearance Endorsement',
            'NBI_CLEARANCE' => 'NBI Clearance Endorsement',
            'NBI_CLEARANCE_ENDORSEMENT' => 'NBI Clearance Endorsement',
            'INDIGENCY_CERT' => 'Certificate of Indigency',
            'INDIGENCY_CERTIFICATE' => 'Certificate of Indigency',
            'RESIDENCY_CERT' => 'Certificate of Residency',
            'RESIDENCY_CERTIFICATE' => 'Certificate of Residency',
            'GOOD_MORAL_CERT' => 'Good Moral Character Certificate',
            'TRAVEL_CLEARANCE' => 'Travel Clearance',
            'EMPLOYMENT_CLEARANCE' => 'Employment Clearance',
            'SCHOLARSHIP_CLEARANCE' => 'Scholarship Clearance',
            'CEDULA' => 'Cedula',
            'OTHER' => 'Other Certificate',
            'other' => 'Other Certificate',
        ];

        if (isset($types[$this->clearance_type])) {
            return $types[$this->clearance_type];
        }
        
        $lowercaseType = strtolower($this->clearance_type);
        foreach ($types as $key => $value) {
            if (strtolower($key) === $lowercaseType) {
                return $value;
            }
        }
        
        // Partial matches
        if (str_contains($lowercaseType, 'indigen')) return 'Certificate of Indigency';
        if (str_contains($lowercaseType, 'residen')) return 'Certificate of Residency';
        if (str_contains($lowercaseType, 'business')) return 'Business Clearance';
        if (str_contains($lowercaseType, 'nbi')) return 'NBI Clearance Endorsement';
        if (str_contains($lowercaseType, 'police')) return 'Police Clearance Endorsement';
        if (str_contains($lowercaseType, 'travel')) return 'Travel Clearance';
        if (str_contains($lowercaseType, 'employ')) return 'Employment Clearance';
        if (str_contains($lowercaseType, 'scholarship')) return 'Scholarship Clearance';
        if (str_contains($lowercaseType, 'good moral')) return 'Good Moral Character Certificate';
        
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
            if (!$resident) return null;

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
            if (!$household) return null;

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
        return !empty($this->clearance_type) || $this->has_clearance_request;
    }

    /**
     * NEW: Check if payment has clearance request through items
     */
    public function getHasClearanceRequestAttribute()
    {
        if (!$this->relationLoaded('items')) {
            $this->load('items');
        }
        
        return $this->items->contains(function ($item) {
            return !empty($item->clearance_request_id);
        });
    }

    /**
     * Get recorder's name for audit reports
     */
    public function getRecordedByUserNameAttribute()
    {
        if (!$this->recorded_by) {
            return 'System';
        }
        
        if (!$this->relationLoaded('recorder')) {
            $this->load('recorder');
        }
        
        return $this->recorder ? $this->recorder->name : 'Unknown';
    }

    /**
     * Get all audit activities for this payment
     */
    public function getAuditTrailAttribute()
    {
        if (!class_exists(\Spatie\Activitylog\Models\Activity::class)) {
            return collect();
        }
        
        return \Spatie\Activitylog\Models\Activity::where('subject_type', self::class)
            ->where('subject_id', $this->id)
            ->with('causer')
            ->latest()
            ->get();
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
                    ->orWhereHas('items', function ($q) {
                        $q->whereNotNull('clearance_request_id');
                    });
    }

    public function scopeByClearanceType($query, $clearanceType)
    {
        return $query->where('clearance_type', $clearanceType);
    }

    // REMOVED: scopeWithClearanceRequest()
    // Use with(['items.clearanceRequest']) instead

    /**
     * NEW SCOPES for Audit Reports
     */
    public function scopeRecordedBy($query, $userId)
    {
        return $query->where('recorded_by', $userId);
    }

    public function scopeWithRecorder($query)
    {
        return $query->with('recorder');
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
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

    /**
     * Generate audit report data
     */
    public static function getAuditReportData($startDate = null, $endDate = null)
    {
        $query = self::with(['recorder', 'items.clearanceRequest']);
        
        if ($startDate && $endDate) {
            $query->betweenDates($startDate, $endDate);
        }
        
        return $query->latest('payment_date')->get();
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

    // REMOVED: linkToClearanceRequest() method
    // This should be handled in PaymentItem or controller

    /**
     * NEW: Link clearance request to payment via item
     */
    public function addClearanceRequestItem(ClearanceRequest $clearanceRequest, $amount)
    {
        return $this->items()->create([
            'clearance_request_id' => $clearanceRequest->id,
            'fee_name' => $clearanceRequest->clearanceType->name ?? 'Clearance Fee',
            'fee_code' => $clearanceRequest->clearanceType->code ?? 'CLEARANCE',
            'description' => 'Payment for ' . ($clearanceRequest->clearanceType->name ?? 'Clearance'),
            'base_amount' => $amount,
            'total_amount' => $amount,
            'category' => 'clearance',
        ]);
    }

    /**
     * Get payment summary for audit reports
     */
    public function getAuditSummary()
    {
        // Load clearance request through items if needed
        $clearanceRequest = null;
        if ($this->has_clearance_request && !$this->relationLoaded('items')) {
            $this->load(['items.clearanceRequest']);
            $clearanceItem = $this->items->firstWhere('clearance_request_id', '!=', null);
            $clearanceRequest = $clearanceItem?->clearanceRequest;
        }

        return [
            'or_number' => $this->or_number,
            'date' => $this->formatted_date,
            'payer' => $this->payer_name,
            'amount' => $this->formatted_total,
            'recorded_by' => $this->recorded_by_user_name,
            'method' => $this->payment_method_display,
            'clearance_type' => $this->clearance_type_display,
            'clearance_request' => $clearanceRequest ? [
                'id' => $clearanceRequest->id,
                'request_number' => $clearanceRequest->request_number,
                'status' => $clearanceRequest->status,
            ] : null,
            'status' => $this->status_display,
        ];
    }

    /**
     * NEW: Get all clearance requests associated with this payment
     */
    public function getAllClearanceRequests()
    {
        return $this->items()
            ->with('clearanceRequest')
            ->whereNotNull('clearance_request_id')
            ->get()
            ->pluck('clearanceRequest')
            ->filter();
    }
}