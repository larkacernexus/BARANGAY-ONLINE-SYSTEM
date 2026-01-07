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
        'certificate_type',
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
        'certificate_type_display',
        'is_cleared_display',
        'has_surcharge',
        'has_penalty',
        'has_discount',
        'payer_details',
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

    public function getCertificateTypeDisplayAttribute()
    {
        if (!$this->certificate_type) {
            return null;
        }

        $types = [
            'residency' => 'Certificate of Residency',
            'indigency' => 'Certificate of Indigency',
            'clearance' => 'Barangay Clearance',
            'cedula' => 'Cedula',
            'business' => 'Business Permit',
            'other' => 'Other Certificate',
        ];

        return $types[$this->certificate_type] ?? ucfirst($this->certificate_type);
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
    public function clearanceRequest()
{
    return $this->belongsTo(ClearanceRequest::class);
}
}