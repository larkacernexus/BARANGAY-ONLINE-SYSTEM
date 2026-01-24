<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Notifications\Notifiable;

class Fee extends Model
{
 use HasFactory, Notifiable;
    protected $fillable = [
        'fee_type_id',
        'payer_type',
        'resident_id',
        'household_id',
        'business_name',
        'payer_name',
        'contact_number',
        'address',
        'purok',
        'zone',
        'billing_period',
        'period_start',
        'period_end',
        'issue_date',
        'due_date',
        'base_amount',
        'surcharge_amount',
        'penalty_amount',
        'discount_amount',
        'discount_type',
        'total_amount',
        'amount_paid',
        'balance',
        'purpose',
        'property_description',
        'business_type',
        'area',
        'remarks',
        'requirements_submitted',
        'status',
        'fee_code',
        'or_number',
        'certificate_number',
        'issued_by',
        'collected_by',
        'cancelled_by',
        'created_by',
        'updated_by',
        'valid_from',
        'valid_until',
        'waiver_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'surcharge_amount' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'area' => 'decimal:2',
        'requirements_submitted' => 'array',
        'issue_date' => 'date',
        'due_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'cancelled_at' => 'datetime',
    ];

    // Relationships
    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    // REMOVE THIS - WRONG RELATIONSHIP:
    // public function payment()
    // {
    //     return $this->hasOne(Payment::class);
    // }

    // ADD THIS - CORRECT RELATIONSHIP:
    public function paymentItems()
    {
        return $this->hasMany(PaymentItem::class, 'fee_id');
    }

    // If you need to access payments through payment items:
    public function payments()
    {
        return $this->hasManyThrough(
            Payment::class,
            PaymentItem::class,
            'fee_id',      // Foreign key on PaymentItem table
            'id',          // Foreign key on Payment table  
            'id',          // Local key on Fee table
            'payment_id'   // Local key on PaymentItem table
        );
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    public function scopeOverdueByDate($query)
    {
        return $query->where('due_date', '<', now())
            ->where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled');
    }

    // Methods
    public function updateStatus()
    {
        if ($this->balance <= 0) {
            $this->status = 'paid';
        } elseif ($this->balance < $this->total_amount) {
            $this->status = 'partially_paid';
        } elseif ($this->due_date < now()) {
            $this->status = 'overdue';
        }
        
        $this->save();
    }

    public function applyPayment($amount, $paymentId = null, $paymentData = [])
    {
        $this->amount_paid += $amount;
        $this->balance = max(0, $this->total_amount - $this->amount_paid);
        
        // Update status based on new balance
        if ($this->balance <= 0) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partially_paid';
        }
        
        // Update payment data
        if (!empty($paymentData)) {
            if (isset($paymentData['or_number'])) {
                $this->or_number = $paymentData['or_number'];
            }
            if (isset($paymentData['collected_by'])) {
                $this->collected_by = $paymentData['collected_by'];
            }
        }
        
        $this->save();
        
        return $this;
    }

    public function generateCertificateNumber()
    {
        if (empty($this->certificate_number)) {
            $year = date('Y');
            $prefix = strtoupper(substr($this->feeType->category, 0, 3));
            $sequence = Fee::whereYear('created_at', $year)
                ->whereNotNull('certificate_number')
                ->count() + 1;
            
            $this->certificate_number = "{$prefix}-{$year}-" . str_pad($sequence, 5, '0', STR_PAD_LEFT);
            $this->save();
        }
        
        return $this->certificate_number;
    }

    public function isOverdue()
    {
        return $this->due_date < now() && $this->status !== 'paid' && $this->status !== 'cancelled';
    }

    public function getDaysOverdueAttribute()
    {
        if ($this->isOverdue()) {
            return now()->diffInDays($this->due_date);
        }
        
        return 0;
    }

    // Helper to get latest payment
    public function getLatestPaymentAttribute()
    {
        return $this->payments()->latest()->first();
    }

    // Check if fee has any payments
    public function hasPayments()
    {
        return $this->paymentItems()->exists();
    }

    
}