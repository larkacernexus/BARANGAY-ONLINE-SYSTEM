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

class ClearanceRequest extends Model
{
    use LogsActivity, Notifiable;

    protected $fillable = [
        // Payer Information (Polymorphic)
        'payer_type', // 'resident', 'household', 'business'
        'payer_id',
        
        // Resident (kept for backward compatibility)
        'resident_id',
        
        // Type
        'clearance_type_id',
        
        // Request Details
        'reference_number',
        'purpose',
        'specific_purpose',
        'urgency', // normal, rush, express
        'needed_date',
        'additional_requirements',
        'fee_amount',
        
        // Status
        'status', // pending, processing, approved, issued, rejected, cancelled, pending_payment, expired
        
        // Payment Tracking
        'payment_id',
        'payment_status', // unpaid, partially_paid, paid
        'amount_paid',
        'balance',
        'payment_date',
        'or_number',
        
        // Clearance Issuance Details
        'clearance_number',
        'issue_date',
        'valid_until',
        'requirements_met',
        'remarks',
        'issuing_officer_id',
        'issuing_officer_name',
        
        // Processing Details
        'admin_notes',
        'cancellation_reason',
        'processed_at',
        'processed_by',
        
        // Contact Info (snapshot at time of request)
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
    
    protected $appends = [
        'formatted_fee',
        'formatted_amount_paid',
        'formatted_balance',
        'status_display',
        'urgency_display',
        'estimated_completion_date',
        'is_valid',
        'days_remaining',
        'formatted_status_history',
        'payer_name',
        'payer_display',
        'payer_icon',
        'payer_type_label',
        'payment_status_display',
        'is_fully_paid',
    ];
    
    // ========== ACTIVITY LOG CONFIGURATION ==========
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'payment_status', 'amount_paid', 'balance', 'purpose', 'specific_purpose', 'urgency', 'fee_amount', 'remarks', 'admin_notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Clearance request {$eventName}")
            ->useLogName('clearance-requests');
    }
    
    // ========== RELATIONSHIPS ==========

    /**
     * Get the parent payable model (resident, household, or business).
     */
    public function payer(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * For backward compatibility - get the resident if payer is resident.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the household if payer is household.
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'payer_id');
    }

    /**
     * Get the business if payer is business.
     */
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
    
        /**
     * Get the receipts for this clearance request (polymorphic)
     */
    public function receipts()
    {
        return $this->morphMany(Receipt::class, 'receiptable');
    }

    /**
     * Get the receipt for this clearance request (if any)
     */
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
    
    /**
     * Get all activities for this clearance request.
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->orderBy('created_at', 'desc');
    }
    
    /**
     * Get status change history for this clearance request.
     */
    public function statusHistory()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->where(function ($query) {
                $query->whereJsonContains('properties->changes', ['status' => '!'])
                      ->orWhere('description', 'LIKE', '%status%')
                      ->orWhere('event', 'LIKE', '%status%');
            })
            ->orderBy('created_at', 'desc');
    }
    
    // ========== ACCESSORS ==========
    
    public function getFormattedFeeAttribute()
    {
        return '₱' . number_format($this->fee_amount, 2);
    }

    public function getFormattedAmountPaidAttribute()
    {
        return '₱' . number_format($this->amount_paid ?? 0, 2);
    }

    public function getFormattedBalanceAttribute()
    {
        return '₱' . number_format($this->balance ?? $this->fee_amount, 2);
    }

    public function getStatusDisplayAttribute()
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

    public function getPaymentStatusDisplayAttribute()
    {
        $statuses = [
            'unpaid' => 'Unpaid',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
        ];
        
        return $statuses[$this->payment_status] ?? 'Unpaid';
    }

    public function getIsFullyPaidAttribute()
    {
        return $this->payment_status === 'paid' || 
               ($this->balance !== null && $this->balance <= 0) ||
               ($this->amount_paid >= $this->fee_amount);
    }

    public function getUrgencyDisplayAttribute()
    {
        $urgencies = [
            'normal' => 'Normal',
            'rush' => 'Rush',
            'express' => 'Express',
        ];
        
        return $urgencies[$this->urgency] ?? ucfirst($this->urgency);
    }
    
    public function getIsValidAttribute()
    {
        if ($this->status !== 'issued') {
            return false;
        }
        
        return $this->valid_until && $this->valid_until->isFuture();
    }
    
    public function getDaysRemainingAttribute()
    {
        if (!$this->valid_until || $this->status !== 'issued') {
            return null;
        }
        
        return $this->valid_until->diffInDays(now(), false);
    }

    public function getPayerTypeLabelAttribute()
    {
        return match($this->payer_type) {
            'resident' => 'Resident',
            'household' => 'Household',
            'business' => 'Business',
            default => 'Unknown'
        };
    }

    public function getPayerIconAttribute()
    {
        return match($this->payer_type) {
            'resident' => 'User',
            'household' => 'Home',
            'business' => 'Building',
            default => 'User'
        };
    }

    /**
     * Get the payer's name based on payer type.
     */
    public function getPayerNameAttribute()
    {
        // If we have a loaded payer relationship
        if ($this->relationLoaded('payer') && $this->payer) {
            return $this->getPayerNameFromModel($this->payer);
        }
        
        // Try to load specific relationships based on type
        if ($this->payer_type === 'resident' && $this->relationLoaded('resident') && $this->resident) {
            return $this->resident->full_name ?? 'Unknown Resident';
        }
        
        if ($this->payer_type === 'household' && $this->relationLoaded('household') && $this->household) {
            return $this->getHouseholdDisplayNameSafe($this->household);
        }
        
        if ($this->payer_type === 'business' && $this->relationLoaded('business') && $this->business) {
            return $this->business->business_name ?? 'Unknown Business';
        }
        
        // Fallback to stored contact name
        if ($this->contact_name) {
            return $this->contact_name;
        }
        
        // Ultimate fallback to resident
        if ($this->resident) {
            return $this->resident->full_name ?? 'Unknown Resident';
        }
        
        return 'Unknown';
    }

    /**
     * Helper to get name from different payer models.
     */
    private function getPayerNameFromModel($model)
    {
        if ($model instanceof Resident) {
            return $model->full_name ?? 'Unknown Resident';
        }
        
        if ($model instanceof Household) {
            return $this->getHouseholdDisplayNameSafe($model);
        }
        
        if ($model instanceof Business) {
            return $model->business_name ?? 'Unknown Business';
        }
        
        return 'Unknown';
    }

    /**
     * SAFE: Get household display name without relying on members relationship.
     */
    private function getHouseholdDisplayNameSafe($household)
    {
        if (!$household) {
            return 'Unknown Household';
        }
        
        // Check if household has a head_name attribute directly
        if (isset($household->head_name) && !empty($household->head_name)) {
            return $household->head_name . ' (Household)';
        }
        
        // Check if household has a household_number
        if (isset($household->household_number) && !empty($household->household_number)) {
            return 'Household ' . $household->household_number;
        }
        
        // Try to access members relationship if it exists (without causing error if it doesn't)
        if (method_exists($household, 'members')) {
            try {
                $headMember = $household->members()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                    
                if ($headMember && $headMember->resident) {
                    return ($headMember->resident->full_name ?? 'Unknown') . ' (Household)';
                }
            } catch (\Exception $e) {
                // Silently fall back to other methods
            }
        }
        
        // Ultimate fallback
        return 'Household #' . $household->id;
    }

    /**
     * SAFE: Get household head name without relying on members relationship.
     */
    private function getHouseholdHeadNameSafe($household)
    {
        if (!$household) {
            return null;
        }
        
        // Check if household has a head_name attribute directly
        if (isset($household->head_name) && !empty($household->head_name)) {
            return $household->head_name;
        }
        
        // Try to access members relationship if it exists
        if (method_exists($household, 'members')) {
            try {
                $headMember = $household->members()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                    
                if ($headMember && $headMember->resident) {
                    return $headMember->resident->full_name ?? null;
                }
            } catch (\Exception $e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * SAFE: Get household member count without relying on members relationship.
     */
    private function getHouseholdMemberCountSafe($household)
    {
        if (!$household) {
            return 0;
        }
        
        if (method_exists($household, 'members')) {
            try {
                return $household->members()->count();
            } catch (\Exception $e) {
                return 0;
            }
        }
        
        return 0;
    }

    /**
     * SAFE: Get household contact number without relying on members relationship.
     */
    private function getHouseholdContactNumberSafe($household)
    {
        if (!$household) {
            return null;
        }
        
        // Check if household has a contact_number directly
        if (isset($household->contact_number) && !empty($household->contact_number)) {
            return $household->contact_number;
        }
        
        // Try to get from head member
        if (method_exists($household, 'members')) {
            try {
                $headMember = $household->members()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                    
                if ($headMember && $headMember->resident && isset($headMember->resident->contact_number)) {
                    return $headMember->resident->contact_number;
                }
            } catch (\Exception $e) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * Get detailed payer display information.
     */
    public function getPayerDisplayAttribute()
    {
        $display = [
            'name' => $this->payer_name,
            'type' => $this->payer_type,
            'type_label' => $this->payer_type_label,
            'icon' => $this->payer_icon,
            'id' => $this->payer_id,
            'contact' => $this->payer_contact_number,
            'address' => $this->payer_address,
            'purok' => $this->payer_purok,
        ];
        
        // Add type-specific details
        if ($this->payer_type === 'resident' && $this->resident) {
            $display['details'] = [
                'age' => $this->resident->age ?? null,
                'gender' => $this->resident->gender ?? null,
                'civil_status' => $this->resident->civil_status ?? null,
                'is_senior' => $this->resident->is_senior ?? false,
                'is_pwd' => $this->resident->is_pwd ?? false,
            ];
        } elseif ($this->payer_type === 'household' && $this->household) {
            // Get head member info safely
            $headName = $this->getHouseholdHeadNameSafe($this->household);
            
            $display['details'] = [
                'household_number' => $this->household->household_number ?? null,
                'head_name' => $headName ?? 'Unknown',
                'member_count' => $this->getHouseholdMemberCountSafe($this->household),
            ];
        } elseif ($this->payer_type === 'business' && $this->business) {
            $display['details'] = [
                'business_type' => $this->business->business_type_label ?? $this->business->business_type ?? null,
                'owner_name' => $this->business->owner_name ?? null,
                'permit_number' => $this->business->mayors_permit_number ?? null,
                'employee_count' => $this->business->employee_count ?? null,
            ];
        }
        
        return $display;
    }

    /**
     * Get payer's contact number.
     */
    public function getPayerContactNumberAttribute()
    {
        if ($this->contact_number) {
            return $this->contact_number;
        }
        
        if ($this->payer_type === 'resident' && $this->resident) {
            return $this->resident->contact_number ?? null;
        }
        
        if ($this->payer_type === 'household' && $this->household) {
            return $this->getHouseholdContactNumberSafe($this->household);
        }
        
        if ($this->payer_type === 'business' && $this->business) {
            return $this->business->contact_number ?? null;
        }
        
        return null;
    }

    /**
     * Get payer's address.
     */
    public function getPayerAddressAttribute()
    {
        if ($this->contact_address) {
            return $this->contact_address;
        }
        
        if ($this->payer_type === 'resident' && $this->resident) {
            return $this->resident->address ?? null;
        }
        
        if ($this->payer_type === 'household' && $this->household) {
            return $this->household->address ?? null;
        }
        
        if ($this->payer_type === 'business' && $this->business) {
            return $this->business->address ?? null;
        }
        
        return null;
    }

    /**
     * Get payer's purok.
     */
    public function getPayerPurokAttribute()
    {
        if ($this->contactPurok) {
            return $this->contactPurok->name ?? null;
        }
        
        if ($this->payer_type === 'resident' && $this->resident && $this->resident->purok) {
            return $this->resident->purok->name ?? null;
        }
        
        if ($this->payer_type === 'household' && $this->household && $this->household->purok) {
            return $this->household->purok->name ?? null;
        }
        
        if ($this->payer_type === 'business' && $this->business && $this->business->purok) {
            return $this->business->purok->name ?? null;
        }
        
        return null;
    }

    /**
     * Calculate estimated completion date.
     */
    public function getEstimatedCompletionDateAttribute()
    {
        if (!$this->clearanceType || $this->isCompleted()) {
            return null;
        }
        
        $processingDays = $this->clearanceType->processing_days ?? 3;
        
        // Adjust for urgency
        if ($this->urgency === 'rush') {
            $processingDays = ceil($processingDays * 0.5);
        } elseif ($this->urgency === 'express') {
            $processingDays = 1;
        }
        
        $startDate = $this->created_at ?? now();
        return $startDate->copy()->addDays($processingDays);
    }
    
    public function getRequestingUserAttribute()
    {
        if ($this->requestedBy) {
            return $this->requestedBy;
        }
        
        if ($this->payer_type === 'resident' && $this->resident && $this->resident->user) {
            return $this->resident->user;
        }
        
        return null;
    }
    
    /**
     * Get formatted status history as an array.
     */
    public function getFormattedStatusHistoryAttribute()
    {
        if (!$this->relationLoaded('statusHistory')) {
            $this->load(['statusHistory' => function ($query) {
                $query->with('causer')->orderBy('created_at', 'desc');
            }]);
        }
        
        return $this->statusHistory->map(function ($activity) {
            $oldStatus = null;
            $newStatus = null;
            $description = $activity->description;
            
            if (isset($activity->properties['changes']['status'])) {
                $oldStatus = $activity->properties['changes']['status']['old'] ?? null;
                $newStatus = $activity->properties['changes']['status']['new'] ?? null;
                
                if ($oldStatus && $newStatus) {
                    $description = "Status changed from {$oldStatus} to {$newStatus}";
                }
            }
            
            return [
                'id' => $activity->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'description' => $description,
                'changed_by' => $activity->causer ? $activity->causer->name : 'System',
                'changed_by_user' => $activity->causer,
                'changed_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'formatted_date' => $activity->created_at->format('F j, Y g:i A'),
                'properties' => $activity->properties,
                'event' => $activity->event,
            ];
        })->values()->toArray();
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

    /**
     * Scope by payer type and ID.
     */
    public function scopeByPayer($query, $payerType, $payerId)
    {
        return $query->where('payer_type', $payerType)
            ->where('payer_id', $payerId);
    }

    /**
     * Scope by payer type.
     */
    public function scopeOfPayerType($query, $payerType)
    {
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
    
    // ========== BUSINESS LOGIC METHODS ==========
    
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
    
    // ========== PAYMENT METHODS ==========
    
    /**
     * Apply payment to this clearance request
     */
    public function applyPayment(Payment $payment, float $amount, array $data = []): self
    {
        $oldAmountPaid = $this->amount_paid ?? 0;
        $oldPaymentStatus = $this->payment_status;
        
        $this->payment_id = $payment->id;
        $this->amount_paid = $oldAmountPaid + $amount;
        $this->balance = max(0, $this->fee_amount - $this->amount_paid);
        $this->payment_date = $payment->payment_date;
        $this->or_number = $payment->or_number;
        
        // Update payment status
        if ($this->balance <= 0) {
            $this->payment_status = 'paid';
            $this->status = 'approved'; // Ready for issuance
        } elseif ($this->amount_paid > 0) {
            $this->payment_status = 'partially_paid';
        } else {
            $this->payment_status = 'unpaid';
        }
        
        // Update additional fields if provided
        if (isset($data['issue_date'])) {
            $this->issue_date = $data['issue_date'];
        }
        
        if (isset($data['valid_until'])) {
            $this->valid_until = $data['valid_until'];
        }
        
        $this->save();
        
        // Log payment activity
        activity()
            ->performedOn($this)
            ->causedBy(auth()->user())
            ->withProperties([
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'amount' => $amount,
                'old_amount_paid' => $oldAmountPaid,
                'new_amount_paid' => $this->amount_paid,
                'old_status' => $oldPaymentStatus,
                'new_status' => $this->payment_status,
                'balance' => $this->balance,
            ])
            ->log('payment_applied');
        
        return $this;
    }

    /**
     * Mark as paid without creating a payment (for testing or manual override)
     */
    public function markAsPaid(float $amount = null, array $data = []): self
    {
        $this->amount_paid = $amount ?? $this->fee_amount;
        $this->balance = max(0, $this->fee_amount - $this->amount_paid);
        $this->payment_status = 'paid';
        
        if ($this->balance <= 0) {
            $this->status = 'approved';
        }
        
        if (isset($data['issue_date'])) {
            $this->issue_date = $data['issue_date'];
        }
        
        if (isset($data['valid_until'])) {
            $this->valid_until = $data['valid_until'];
        }
        
        $this->save();
        
        return $this;
    }

    /**
     * Void payment (for cancellations/refunds)
     */
    public function voidPayment(): self
    {
        $this->payment_id = null;
        $this->payment_status = 'unpaid';
        $this->amount_paid = 0;
        $this->balance = $this->fee_amount;
        $this->payment_date = null;
        $this->or_number = null;
        $this->status = 'pending_payment';
        $this->save();
        
        return $this;
    }
    
    // ========== ACTION METHODS ==========
    
    public function markAsProcessing($userId = null)
    {
        $this->update([
            'status' => 'processing',
            'processed_by' => $userId ?? auth()->id(),
            'processed_at' => now(),
        ]);
        
        return $this;
    }
    
    public function approve($validUntil = null)
    {
        $user = auth()->user();
        
        $this->update([
            'status' => 'approved',
            'issuing_officer_id' => $user->id,
            'issuing_officer_name' => $user->name,
            'processed_by' => $user->id,
            'processed_at' => now(),
            'issue_date' => now(),
            'valid_until' => $validUntil ?? now()->addDays($this->clearanceType->validity_days ?? 30),
        ]);
        
        return $this;
    }
    
    public function issue()
    {
        $user = auth()->user();
        
        $this->update([
            'status' => 'issued',
            'issuing_officer_id' => $user->id,
            'issuing_officer_name' => $user->name,
            'issue_date' => $this->issue_date ?? now(),
        ]);
        
        return $this;
    }

    public function getIssuingOfficerDisplayAttribute()
    {
        if ($this->issuingOfficer) {
            return $this->issuingOfficer->name . ' (ID: ' . $this->issuingOfficer->id . ')';
        }
        return $this->issuing_officer_name ?? 'N/A';
    }

    public function reject($reason, $processedBy = null)
    {
        if (!$this->canBeProcessed()) {
            throw new \Exception('Request cannot be rejected at this stage.');
        }

        $this->update([
            'status' => 'rejected',
            'admin_notes' => $reason,
            'processed_by' => $processedBy ?? auth()->id(),
            'processed_at' => now(),
        ]);

        return $this;
    }

    public function cancel($reason = null, $cancelledByResident = true)
    {
        if (!in_array($this->status, ['pending', 'processing', 'pending_payment'])) {
            throw new \Exception('Cannot cancel request at this stage.');
        }

        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'processed_at' => $cancelledByResident ? null : now(),
            'processed_by' => $cancelledByResident ? null : auth()->id(),
        ]);

        return $this;
    }
    
    public function markAsPendingPayment()
    {
        $this->update([
            'status' => 'pending_payment',
        ]);
        
        return $this;
    }

    public function clearance_type(): BelongsTo
    {
        return $this->belongsTo(ClearanceType::class, 'clearance_type_id');
    }
    
    public function markAsExpired()
    {
        if ($this->status !== 'issued' || $this->is_valid) {
            throw new \Exception('Only expired issued clearances can be marked as expired.');
        }
        
        $this->update([
            'status' => 'expired',
        ]);
        
        return $this;
    }
    
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processor_id');
    }
    
    // ========== GENERATORS ==========
    
    public static function generateReferenceNumber()
    {
        $prefix = 'REQ-' . date('Ymd') . '-';
        $lastRequest = self::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
    
    public static function generateClearanceNumber()
    {
        $prefix = 'CLR-' . date('Y') . '-';
        $lastClearance = self::where('clearance_number', 'like', $prefix . '%')
            ->orderBy('clearance_number', 'desc')
            ->first();

        if ($lastClearance) {
            $lastNumber = (int) str_replace($prefix, '', $lastClearance->clearance_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
    
    // ========== BOOT METHOD ==========
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->reference_number) {
                $model->reference_number = self::generateReferenceNumber();
            }
            
            // Initialize payment tracking fields
            $model->payment_status = $model->payment_status ?? 'unpaid';
            $model->amount_paid = $model->amount_paid ?? 0;
            $model->balance = $model->fee_amount ?? 0;
            
            // Set contact info from payer if not provided
            if (!$model->contact_name && $model->payer) {
                if ($model->payer_type === 'resident') {
                    $model->contact_name = $model->payer->full_name ?? null;
                    $model->contact_number = $model->payer->contact_number ?? null;
                } elseif ($model->payer_type === 'household') {
                    // Safely get head member info
                    if (method_exists($model->payer, 'members')) {
                        try {
                            $headMember = $model->payer->members()
                                ->where('is_head', true)
                                ->with('resident')
                                ->first();
                            if ($headMember && $headMember->resident) {
                                $model->contact_name = $headMember->resident->full_name ?? null;
                                $model->contact_number = $headMember->resident->contact_number ?? null;
                            }
                        } catch (\Exception $e) {
                            // Fall back to household data
                            $model->contact_name = $model->payer->head_name ?? 'Household Member';
                        }
                    } else {
                        $model->contact_name = $model->payer->head_name ?? 'Household Member';
                    }
                } elseif ($model->payer_type === 'business') {
                    $model->contact_name = $model->payer->business_name ?? null;
                    $model->contact_number = $model->payer->contact_number ?? null;
                }
                
                $model->contact_address = $model->payer->address ?? null;
                $model->contact_purok_id = $model->payer->purok_id ?? null;
            }
        });
        
        // Auto-update payment status when fee_amount changes
        static::updating(function ($model) {
            if ($model->isDirty('fee_amount') && $model->amount_paid > 0) {
                $model->balance = max(0, $model->fee_amount - $model->amount_paid);
                
                if ($model->balance <= 0) {
                    $model->payment_status = 'paid';
                } elseif ($model->amount_paid > 0) {
                    $model->payment_status = 'partially_paid';
                }
            }
        });
        
        // Auto-mark as expired when validity passes
        static::saving(function ($model) {
            if ($model->status === 'issued' && $model->valid_until && $model->valid_until->isPast()) {
                $model->status = 'expired';
            }
        });
    }
}