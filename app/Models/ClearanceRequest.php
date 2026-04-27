<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use App\Exceptions\InvalidStateTransitionException;
use Carbon\Carbon;

class ClearanceRequest extends Model
{
    use LogsActivity, Notifiable;

    // SECURITY NOTE: Explicitly define fillable to prevent mass assignment
    protected $fillable = [
        'payer_type',
        'payer_id',
        'resident_id', // LOGIC NOTE: Deprecated - maintained for backward compatibility only
        'clearance_type_id',
        'reference_number',
        'purpose',
        'specific_purpose',
        'urgency',
        'needed_date',
        'additional_requirements',
        'fee_amount',
        'status',
        'payment_id',
        'payment_status',
        'amount_paid',
        'balance',
        'payment_date',
        'or_number',
        'clearance_number',
        'issue_date',
        'valid_until',
        'requirements_met',
        'remarks',
        'issuing_officer_id',
        'issuing_officer_name',
        'admin_notes',
        'cancellation_reason',
        'processed_at',
        'processed_by',
        'contact_name',
        'contact_number',
        'contact_address',
        'contact_purok_id',
        'contact_email',
        'requested_by_user_id',
        'household_id',
    ];

    protected $casts = [
        'needed_date' => 'date',
        'issue_date' => 'date',
        'valid_until' => 'date',
        'processed_at' => 'datetime',
        'payment_date' => 'datetime',
        'fee_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'requirements_met' => 'array',
    ];
    
    // SECURITY NOTE: Use API Resources instead of appends for data exposure control
    protected $appends = [
        'formatted_fee',
        'formatted_amount_paid',
        'formatted_balance',
        'status_display',
        'urgency_display',
        'is_valid',
        'days_remaining',
        'payment_status_display',
        'is_fully_paid',
    ];
    
    // LOGIC NOTE: Define valid state transitions
    protected const VALID_TRANSITIONS = [
        'pending' => ['processing', 'rejected', 'cancelled', 'pending_payment'],
        'pending_payment' => ['processing', 'cancelled', 'expired'],
        'processing' => ['approved', 'rejected', 'cancelled'],
        'approved' => ['issued', 'rejected', 'cancelled'],
        'issued' => ['expired'],
        'rejected' => [],
        'cancelled' => [],
        'expired' => [],
    ];
    
    // ========== ACTIVITY LOG CONFIGURATION ==========
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'status', 
                'payment_status', 
                'amount_paid', 
                'balance', 
                'purpose', 
                'specific_purpose', 
                'urgency', 
                'fee_amount', 
                'remarks', 
                'admin_notes'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Clearance request {$eventName}")
            ->useLogName('clearance-requests');
    }
    
    // ========== RELATIONSHIPS ==========
    
    public function payer(): MorphTo
    {
        return $this->morphTo();
    }
    
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
    
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'payer_id');
    }
    
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'payer_id');
    }
    
    public function clearanceType(): BelongsTo
    {
        return $this->belongsTo(ClearanceType::class);
    }
    
    public function documents(): HasMany
    {
        return $this->hasMany(ClearanceRequestDocument::class);
    }
    
    public function issuingOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuing_officer_id');
    }
    
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
    
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
    
    public function paymentItem(): HasOne
    {
        return $this->hasOne(PaymentItem::class, 'clearance_request_id');
    }
    
    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class, 'clearance_request_id');
    }
    
    public function payments()
    {
        return $this->hasManyThrough(
            Payment::class,
            PaymentItem::class,
            'clearance_request_id',
            'id',
            'id',
            'payment_id'
        );
    }
    
    public function receipts()
    {
        return $this->morphMany(Receipt::class, 'receiptable');
    }
    
    public function receipt()
    {
        return $this->morphOne(Receipt::class, 'receiptable');
    }
    
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }
    
    public function contactPurok(): BelongsTo
    {
        return $this->belongsTo(Purok::class, 'contact_purok_id');
    }
    
    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->orderBy('created_at', 'desc');
    }
    
    public function statusHistory()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->where(function ($query) {
                $query->whereJsonContains('properties->attributes->status', '!=')
                      ->orWhere('description', 'LIKE', '%status%')
                      ->orWhere('event', 'LIKE', '%status%');
            })
            ->orderBy('created_at', 'desc');
    }
    
    // ========== STATE MANAGEMENT ==========
    
    /**
     * SECURITY NOTE: Validates state transitions with explicit whitelist
     */
    protected function validateStateTransition(string $newStatus): void
    {
        $currentStatus = $this->status;
        
        if (!isset(self::VALID_TRANSITIONS[$currentStatus])) {
            throw new InvalidStateTransitionException("Invalid current state: {$currentStatus}");
        }
        
        if (!in_array($newStatus, self::VALID_TRANSITIONS[$currentStatus])) {
            throw new InvalidStateTransitionException(
                "Cannot transition from {$currentStatus} to {$newStatus}"
            );
        }
    }
    
    /**
     * SECURITY NOTE: Safe status update with validation
     */
    protected function updateStatus(string $newStatus, array $additionalData = []): bool
    {
        $this->validateStateTransition($newStatus);
        
        $data = array_merge(['status' => $newStatus], $additionalData);
        
        return $this->update($data);
    }
    
    // ========== ACCESSORS ==========
    
    public function getFormattedFeeAttribute(): string
    {
        return '₱' . number_format($this->fee_amount ?? 0, 2);
    }
    
    public function getFormattedAmountPaidAttribute(): string
    {
        return '₱' . number_format($this->amount_paid ?? 0, 2);
    }
    
    public function getFormattedBalanceAttribute(): string
    {
        return '₱' . number_format($this->balance ?? $this->fee_amount ?? 0, 2);
    }
    
    public function getStatusDisplayAttribute(): string
    {
        $statuses = [
            'pending' => 'Pending Review',
            'pending_payment' => 'Pending Payment',
            'processing' => 'Under Processing',
            'approved' => 'Approved (Ready for Issuance)',
            'issued' => 'Issued',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
            'expired' => 'Expired',
        ];
        
        return $statuses[$this->status] ?? ucfirst($this->status);
    }
    
    public function getPaymentStatusDisplayAttribute(): string
    {
        $statuses = [
            'unpaid' => 'Unpaid',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
        ];
        
        return $statuses[$this->payment_status] ?? 'Unpaid';
    }
    
    public function getIsFullyPaidAttribute(): bool
    {
        return $this->payment_status === 'paid' || 
               ($this->balance !== null && $this->balance <= 0) ||
               ($this->amount_paid >= $this->fee_amount);
    }
    
    public function getUrgencyDisplayAttribute(): string
    {
        $urgencies = [
            'normal' => 'Normal',
            'rush' => 'Rush',
            'express' => 'Express',
        ];
        
        return $urgencies[$this->urgency] ?? ucfirst($this->urgency ?? 'normal');
    }
    
    public function getIsValidAttribute(): bool
    {
        if ($this->status !== 'issued') {
            return false;
        }
        
        return $this->valid_until && $this->valid_until->isFuture();
    }
    
    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->valid_until || $this->status !== 'issued') {
            return null;
        }
        
        return $this->valid_until->diffInDays(now(), false);
    }
    
    // ========== ACTION METHODS WITH AUTHORIZATION ==========
    
    /**
     * SECURITY NOTE: Explicit authorization check before state change
     */
    public function markAsProcessing(?int $userId = null): self
    {
        // SECURITY NOTE: Verify user has permission
        if (!Gate::allows('process-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to process this clearance request.'
            );
        }
        
        DB::transaction(function () use ($userId) {
            $this->updateStatus('processing', [
                'processed_by' => $userId ?? auth()->id(),
                'processed_at' => now(),
            ]);
        });
        
        return $this;
    }
    
    /**
     * SECURITY NOTE: Validate date format and bounds
     */
    public function approve(?Carbon $validUntil = null): self
    {
        if (!Gate::allows('approve-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to approve clearance requests.'
            );
        }
        
        $user = auth()->user();
        
        if (!$user) {
            throw new \RuntimeException('No authenticated user available for approval.');
        }
        
        // SECURITY NOTE: Validate and sanitize date input
        if ($validUntil && !$validUntil instanceof Carbon) {
            $validUntil = Carbon::parse($validUntil);
        }
        
        // LOGIC NOTE: Ensure validity period is within allowed bounds
        $maxValidityDays = config('clearance.max_validity_days', 365);
        $minValidityDays = config('clearance.min_validity_days', 30);
        
        if (!$validUntil) {
            $validUntil = now()->addDays($this->clearanceType->validity_days ?? $minValidityDays);
        }
        
        $daysUntilExpiry = now()->diffInDays($validUntil);
        
        if ($daysUntilExpiry > $maxValidityDays) {
            throw new \InvalidArgumentException(
                "Clearance validity cannot exceed {$maxValidityDays} days."
            );
        }
        
        if ($daysUntilExpiry < $minValidityDays) {
            throw new \InvalidArgumentException(
                "Clearance validity must be at least {$minValidityDays} days."
            );
        }
        
        DB::transaction(function () use ($user, $validUntil) {
            $this->updateStatus('approved', [
                'issuing_officer_id' => $user->id,
                'issuing_officer_name' => $user->name,
                'processed_by' => $user->id,
                'processed_at' => now(),
                'issue_date' => now(),
                'valid_until' => $validUntil,
            ]);
        });
        
        return $this;
    }
    
    public function issue(): self
    {
        if (!Gate::allows('issue-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to issue clearances.'
            );
        }
        
        if (!$this->clearance_number) {
            $this->clearance_number = self::generateClearanceNumber();
        }
        
        $user = auth()->user();
        
        DB::transaction(function () use ($user) {
            $this->updateStatus('issued', [
                'issuing_officer_id' => $user->id,
                'issuing_officer_name' => $user->name,
                'issue_date' => $this->issue_date ?? now(),
                'clearance_number' => $this->clearance_number,
            ]);
        });
        
        return $this;
    }
    
    public function reject(string $reason): self
    {
        if (!Gate::allows('reject-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to reject clearance requests.'
            );
        }
        
        if (!$this->canBeProcessed()) {
            throw new InvalidStateTransitionException('Request cannot be rejected at this stage.');
        }
        
        DB::transaction(function () use ($reason) {
            $this->updateStatus('rejected', [
                'admin_notes' => $reason,
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);
        });
        
        return $this;
    }
    
    public function cancel(?string $reason = null, bool $cancelledByResident = true): self
    {
        // SECURITY NOTE: Different permissions for admin vs resident cancellation
        if (!$cancelledByResident && !Gate::allows('cancel-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to cancel clearance requests.'
            );
        }
        
        if (!in_array($this->status, ['pending', 'processing', 'pending_payment'])) {
            throw new InvalidStateTransitionException('Cannot cancel request at this stage.');
        }
        
        DB::transaction(function () use ($reason, $cancelledByResident) {
            $this->updateStatus('cancelled', [
                'cancellation_reason' => $reason,
                'processed_at' => $cancelledByResident ? null : now(),
                'processed_by' => $cancelledByResident ? null : auth()->id(),
            ]);
        });
        
        return $this;
    }
    
    public function markAsPendingPayment(): self
    {
        if (!Gate::allows('update-clearance', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to update this clearance request.'
            );
        }
        
        return DB::transaction(function () {
            $this->updateStatus('pending_payment');
            return $this;
        });
    }
    
    public function markAsExpired(): self
    {
        if ($this->status !== 'issued' || $this->is_valid) {
            throw new InvalidStateTransitionException('Only expired issued clearances can be marked as expired.');
        }
        
        return DB::transaction(function () {
            $this->updateStatus('expired');
            return $this;
        });
    }
    
    // ========== PAYMENT METHODS WITH TRANSACTION SAFETY ==========
    
    /**
     * SECURITY NOTE: Atomic payment application with optimistic locking
     */
    public function applyPayment(Payment $payment, float $amount, array $data = []): self
    {
        // SECURITY NOTE: Validate payment amount
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero.');
        }
        
        if (!Gate::allows('process-payment', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to apply payments to this clearance request.'
            );
        }
        
        return DB::transaction(function () use ($payment, $amount, $data) {
            // LOGIC NOTE: Lock the row for update to prevent race conditions
            $fresh = self::where('id', $this->id)->lockForUpdate()->first();
            
            $oldAmountPaid = $fresh->amount_paid ?? 0;
            $oldPaymentStatus = $fresh->payment_status;
            
            $fresh->payment_id = $payment->id;
            $fresh->amount_paid = $oldAmountPaid + $amount;
            $fresh->balance = max(0, $fresh->fee_amount - $fresh->amount_paid);
            $fresh->payment_date = $payment->payment_date;
            $fresh->or_number = $payment->or_number;
            
            // LOGIC NOTE: Determine new payment status
            if ($fresh->balance <= 0) {
                $fresh->payment_status = 'paid';
                // SECURITY NOTE: Only auto-approve if configured to do so
                if (config('clearance.auto_approve_on_payment', true)) {
                    $fresh->validateStateTransition('approved');
                    $fresh->status = 'approved';
                }
            } elseif ($fresh->amount_paid > 0) {
                $fresh->payment_status = 'partially_paid';
            } else {
                $fresh->payment_status = 'unpaid';
            }
            
            if (isset($data['issue_date'])) {
                $fresh->issue_date = Carbon::parse($data['issue_date']);
            }
            
            if (isset($data['valid_until'])) {
                $fresh->valid_until = Carbon::parse($data['valid_until']);
            }
            
            $fresh->save();
            
            // SECURITY NOTE: Log payment with minimal sensitive data
            activity()
                ->performedOn($fresh)
                ->causedBy(auth()->user())
                ->withProperties([
                    'payment_id' => $payment->id,
                    'or_number' => $payment->or_number,
                    'amount' => $amount,
                    'new_amount_paid' => $fresh->amount_paid,
                    'new_status' => $fresh->payment_status,
                ])
                ->log('payment_applied');
            
            return $fresh;
        });
    }
    
    /**
     * SECURITY NOTE: Mark as paid with validation
     */
    public function markAsPaid(?float $amount = null, array $data = []): self
    {
        if (!Gate::allows('process-payment', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to mark this clearance as paid.'
            );
        }
        
        $paymentAmount = $amount ?? $this->fee_amount;
        
        if ($paymentAmount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero.');
        }
        
        return DB::transaction(function () use ($paymentAmount, $data) {
            $fresh = self::where('id', $this->id)->lockForUpdate()->first();
            
            $fresh->amount_paid = $paymentAmount;
            $fresh->balance = max(0, $fresh->fee_amount - $paymentAmount);
            $fresh->payment_status = 'paid';
            
            if ($fresh->balance <= 0 && config('clearance.auto_approve_on_payment', true)) {
                $fresh->validateStateTransition('approved');
                $fresh->status = 'approved';
            }
            
            if (isset($data['issue_date'])) {
                $fresh->issue_date = Carbon::parse($data['issue_date']);
            }
            
            if (isset($data['valid_until'])) {
                $fresh->valid_until = Carbon::parse($data['valid_until']);
            }
            
            $fresh->save();
            
            return $fresh;
        });
    }
    
    public function voidPayment(): self
    {
        if (!Gate::allows('void-payment', $this)) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You are not authorized to void payments.'
            );
        }
        
        return DB::transaction(function () {
            $fresh = self::where('id', $this->id)->lockForUpdate()->first();
            
            $fresh->payment_id = null;
            $fresh->payment_status = 'unpaid';
            $fresh->amount_paid = 0;
            $fresh->balance = $fresh->fee_amount;
            $fresh->payment_date = null;
            $fresh->or_number = null;
            $fresh->validateStateTransition('pending_payment');
            $fresh->status = 'pending_payment';
            $fresh->save();
            
            return $fresh;
        });
    }
    
    // ========== HELPER METHODS ==========
    
    public function canBeProcessed(): bool
    {
        return $this->status === 'pending' || $this->status === 'processing';
    }
    
    public function isCompleted(): bool
    {
        return in_array($this->status, ['issued', 'rejected', 'cancelled', 'expired']);
    }
    
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
    
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }
    
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
    
    public function isIssued(): bool
    {
        return $this->status === 'issued';
    }
    
    public function isPendingPayment(): bool
    {
        return $this->status === 'pending_payment';
    }
    
    // ========== SCOPES ==========
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeByResident($query, $residentId)
    {
        return $query->where('resident_id', $residentId);
    }
    
    public function scopeByPayer($query, $payerType, $payerId)
    {
        // SECURITY NOTE: Whitelist payer types
        $allowedTypes = ['resident', 'household', 'business'];
        
        if (!in_array($payerType, $allowedTypes)) {
            throw new \InvalidArgumentException('Invalid payer type.');
        }
        
        return $query->where('payer_type', $payerType)
            ->where('payer_id', $payerId);
    }
    
    public function scopeOfPayerType($query, $payerType)
    {
        $allowedTypes = ['resident', 'household', 'business'];
        
        if (!in_array($payerType, $allowedTypes)) {
            throw new \InvalidArgumentException('Invalid payer type.');
        }
        
        return $query->where('payer_type', $payerType);
    }
    
    public function scopeNeedsProcessing($query)
    {
        return $query->whereIn('status', ['pending', 'processing', 'approved']);
    }
    
    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }
    
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'processing', 'approved', 'pending_payment']);
    }
    
    public function scopeExpired($query)
    {
        return $query->where('status', 'issued')
            ->whereDate('valid_until', '<', now());
    }
    
    public function scopeUnpaid($query)
    {
        return $query->where(function($q) {
            $q->whereNull('payment_status')
              ->orWhere('payment_status', 'unpaid')
              ->orWhere('balance', '>', 0);
        });
    }
    
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid')
            ->orWhere(function($q) {
                $q->whereNotNull('amount_paid')
                  ->whereColumn('amount_paid', '>=', 'fee_amount');
            });
    }
    
    public function scopePartiallyPaid($query)
    {
        return $query->where('payment_status', 'partially_paid')
            ->orWhere(function($q) {
                $q->whereNotNull('amount_paid')
                  ->whereColumn('amount_paid', '<', 'fee_amount')
                  ->where('amount_paid', '>', 0);
            });
    }
    
    // ========== GENERATORS ==========
    
    public static function generateReferenceNumber(): string
    {
        // SECURITY NOTE: Use database lock to prevent duplicate numbers
        return DB::transaction(function () {
            $prefix = 'REQ-' . date('Ymd') . '-';
            $lastRequest = self::where('reference_number', 'like', $prefix . '%')
                ->orderBy('reference_number', 'desc')
                ->lockForUpdate()
                ->first();
            
            if ($lastRequest) {
                $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }
            
            return $prefix . $newNumber;
        });
    }
    
    public static function generateClearanceNumber(): string
    {
        return DB::transaction(function () {
            $prefix = 'CLR-' . date('Y') . '-';
            $lastClearance = self::where('clearance_number', 'like', $prefix . '%')
                ->orderBy('clearance_number', 'desc')
                ->lockForUpdate()
                ->first();
            
            if ($lastClearance) {
                $lastNumber = (int) str_replace($prefix, '', $lastClearance->clearance_number);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }
            
            return $prefix . $newNumber;
        });
    }
    
    // ========== BOOT METHOD ==========
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->reference_number) {
                $model->reference_number = self::generateReferenceNumber();
            }
            
            // LOGIC NOTE: Initialize payment fields correctly
            $model->payment_status = $model->payment_status ?? 'unpaid';
            $model->amount_paid = $model->amount_paid ?? 0;
            $model->balance = $model->fee_amount ?? 0;
            
            // SECURITY NOTE: Only copy contact info if explicitly allowed
            if (!$model->contact_name && $model->payer && config('clearance.auto_populate_contact', true)) {
                $model->populateContactInfoFromPayer();
            }
        });
        
        static::updating(function ($model) {
            // LOGIC NOTE: Recalculate balance when fee changes
            if ($model->isDirty('fee_amount') && $model->amount_paid > 0) {
                $model->balance = max(0, $model->fee_amount - $model->amount_paid);
                
                if ($model->balance <= 0) {
                    $model->payment_status = 'paid';
                } elseif ($model->amount_paid > 0) {
                    $model->payment_status = 'partially_paid';
                }
            }
        });
        
        static::saving(function ($model) {
            // LOGIC NOTE: Auto-expire if past validity date
            if ($model->status === 'issued' && $model->valid_until && $model->valid_until->isPast()) {
                $model->status = 'expired';
            }
            
            // LOGIC NOTE: Sync resident_id for backward compatibility
            if ($model->payer_type === 'resident' && $model->payer_id) {
                $model->resident_id = $model->payer_id;
            }
        });
    }
    
    /**
     * SECURITY NOTE: Safe contact info population
     */
    protected function populateContactInfoFromPayer(): void
    {
        if (!$this->payer) {
            return;
        }
        
        if ($this->payer_type === 'resident') {
            $this->contact_name = $this->payer->full_name ?? null;
            $this->contact_number = $this->payer->contact_number ?? null;
        } elseif ($this->payer_type === 'household') {
            if (method_exists($this->payer, 'members')) {
                try {
                    $headMember = $this->payer->members()
                        ->where('is_head', true)
                        ->with('resident')
                        ->first();
                    if ($headMember && $headMember->resident) {
                        $this->contact_name = $headMember->resident->full_name ?? null;
                        $this->contact_number = $headMember->resident->contact_number ?? null;
                    }
                } catch (\Exception $e) {
                    // LOGIC NOTE: Graceful degradation
                    $this->contact_name = $this->payer->head_name ?? 'Household Member';
                }
            } else {
                $this->contact_name = $this->payer->head_name ?? 'Household Member';
            }
        } elseif ($this->payer_type === 'business') {
            $this->contact_name = $this->payer->business_name ?? null;
            $this->contact_number = $this->payer->contact_number ?? null;
        }
        
        $this->contact_address = $this->payer->address ?? null;
        $this->contact_purok_id = $this->payer->purok_id ?? null;
    }
}