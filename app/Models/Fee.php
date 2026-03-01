<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Fee extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        // Basic identification
        'fee_type_id',
        'fee_code',
        'certificate_number',
        'or_number',
        
        // Payer info (polymorphic)
        'payer_type',
        'payer_id',
        'payer_name',
        'contact_number',
        'address',
        'purok',
        'zone',
        
        // Timing
        'issue_date',
        'due_date',
        'period_start',
        'period_end',
        'valid_from',
        'valid_until',
        
        // Amounts
        'base_amount',        // Original amount before discounts
        'discount_amount',    // Sum of all discounts applied
        'surcharge_amount',   // Calculated surcharge
        'penalty_amount',     // Calculated penalty
        'total_amount',       // base_amount - discount_amount + surcharge + penalty
        'amount_paid',
        'balance',
        
        // Status
        'status', // draft, issued, pending_payment, partially_paid, paid, cancelled, waived
        
        // Fee-specific data (store as JSON for flexibility)
        'metadata', // JSON: business_type, area, property_description, etc.
        
        // Audit
        'issued_by',
        'collected_by',
        'created_by',
        'updated_by',
        'cancelled_by',
        'cancelled_at',
        
        // Metadata
        'remarks',
        'batch_reference',
        'requirements_submitted', // JSON array
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'surcharge_amount' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
        'requirements_submitted' => 'array',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Polymorphic relationship to payer
     */
    public function payer(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Relationship to FeeType
     */
    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

    /**
     * Relationship to applied discounts
     */
    public function feeDiscounts(): HasMany
    {
        return $this->hasMany(FeeDiscount::class);
    }

    /**
     * Relationship to special discount applications
     */
    public function specialDiscountApplications(): HasMany
    {
        return $this->hasMany(SpecialDiscountApplication::class);
    }

    /**
     * Relationship to payments through payment items
     */
    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    /**
     * Relationship to users who issued this fee
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Relationship to users who collected payment
     */
    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Relationship to users who created this fee
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship to users who updated this fee
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship to users who cancelled this fee
     */
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // ==================== SCOPES ====================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopePendingPayment($query)
    {
        return $query->where('status', 'pending_payment');
    }

    public function scopePartiallyPaid($query)
    {
        return $query->where('status', 'partially_paid');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeWaived($query)
    {
        return $query->where('status', 'waived');
    }

    public function scopeOverdueByDate($query)
    {
        return $query->where('due_date', '<', now())
            ->whereNotIn('status', ['paid', 'cancelled', 'waived']);
    }

    public function scopeByPayer($query, $payerType, $payerId)
    {
        return $query->where('payer_type', $payerType)
            ->where('payer_id', $payerId);
    }

    public function scopeByFeeType($query, $feeTypeId)
    {
        return $query->where('fee_type_id', $feeTypeId);
    }

    public function scopeByBatch($query, $batchReference)
    {
        return $query->where('batch_reference', $batchReference);
    }

    // ==================== METHODS ====================

    /**
     * Calculate total discounts from all applied discounts
     */
    public function calculateTotalDiscounts(): float
    {
        return (float) $this->feeDiscounts()->sum('discount_amount');
    }

    /**
     * Calculate surcharge based on fee type rules
     */
    public function calculateSurcharge(): float
    {
        if (!$this->feeType->has_surcharge) {
            return 0.00;
        }

        if ($this->feeType->surcharge_fixed > 0) {
            return (float) $this->feeType->surcharge_fixed;
        }

        if ($this->feeType->surcharge_percentage > 0) {
            return (float) ($this->base_amount * ($this->feeType->surcharge_percentage / 100));
        }

        return 0.00;
    }

    /**
     * Calculate penalty based on fee type rules and payment date
     * FIXED: Penalty should only apply if payment is made AFTER due date
     */
    public function calculatePenalty($paymentDate = null): float
    {
        if (!$this->feeType->has_penalty) {
            return 0.00;
        }

        // Use provided payment date or current date
        $checkDate = $paymentDate ?: now();
        
        // Only apply penalty if payment is being made AFTER the due date
        if ($this->due_date && $checkDate->startOfDay()->lte($this->due_date)) {
            return 0.00; // No penalty if paid on or before due date
        }

        if ($this->feeType->penalty_fixed > 0) {
            return (float) $this->feeType->penalty_fixed;
        }

        if ($this->feeType->penalty_percentage > 0) {
            return (float) ($this->base_amount * ($this->feeType->penalty_percentage / 100));
        }

        return 0.00;
    }

    /**
     * Recalculate all amounts
     * FIXED: Pass payment date to penalty calculation
     */
    public function recalculate($paymentDate = null): self
    {
        $this->discount_amount = $this->calculateTotalDiscounts();
        $this->surcharge_amount = $this->calculateSurcharge();
        $this->penalty_amount = $this->calculatePenalty($paymentDate);
        
        $this->total_amount = $this->base_amount 
            - $this->discount_amount
            + $this->surcharge_amount 
            + $this->penalty_amount;
            
        $this->balance = max(0, $this->total_amount - $this->amount_paid);
        
        $this->updateStatus();
        
        return $this;
    }

    /**
     * Update status based on current state
     */
    public function updateStatus(): self
    {
        $oldStatus = $this->status;
        
        if ($this->balance <= 0 && $this->base_amount > 0) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0 && $this->balance > 0) {
            $this->status = 'partially_paid';
        } elseif ($this->isOverdue()) {
            $this->status = 'overdue';
        } elseif (in_array($this->status, ['draft', 'issued', 'pending_payment'])) {
            // Keep current status if not paid/overdue
        }
        
        if ($this->status !== $oldStatus) {
            $this->save();
        }
        
        return $this;
    }

    /**
     * Check if fee is overdue
     * FIXED: Use proper date comparison
     */
    public function isOverdue(): bool
    {
        if (in_array($this->status, ['paid', 'cancelled', 'waived'])) {
            return false;
        }
        
        // A fee is overdue if current date is AFTER the due date AND it's not paid
        return $this->due_date && now()->startOfDay()->gt($this->due_date);
    }

    /**
     * Get days overdue
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        return now()->diffInDays($this->due_date);
    }

    /**
     * Apply payment to fee
     */
    public function applyPayment(float $amount, ?int $paymentId = null, array $paymentData = []): self
    {
        $this->amount_paid += $amount;
        $this->balance = max(0, $this->total_amount - $this->amount_paid);
        
        // Update payment metadata
        if (!empty($paymentData)) {
            if (isset($paymentData['or_number'])) {
                $this->or_number = $paymentData['or_number'];
            }
            if (isset($paymentData['collected_by'])) {
                $this->collected_by = $paymentData['collected_by'];
            }
            if (isset($paymentData['payment_date'])) {
                // Recalculate penalty based on actual payment date
                $this->penalty_amount = $this->calculatePenalty($paymentData['payment_date']);
                $this->total_amount = $this->base_amount - $this->discount_amount + $this->surcharge_amount + $this->penalty_amount;
                $this->balance = max(0, $this->total_amount - $this->amount_paid);
            }
        }
        
        $this->updateStatus();
        $this->save();
        
        return $this;
    }

    /**
     * Apply a discount to this fee
     */
    public function applyDiscount(DiscountType $discountType, ?SpecialDiscount $specialDiscount = null, ?float $percentage = null): FeeDiscount
    {
        // Determine discount percentage
        $discountPercentage = $percentage ?? $this->getDiscountPercentage($discountType, $specialDiscount);
        
        // Calculate discount amount
        $discountAmount = $this->base_amount * ($discountPercentage / 100);
        
        // Create fee discount record
        $feeDiscount = FeeDiscount::create([
            'fee_id' => $this->id,
            'discount_type_id' => $discountType->id,
            'special_discount_id' => $specialDiscount?->id,
            'discount_amount' => $discountAmount,
            'discount_percentage' => $discountPercentage,
            'base_amount' => $this->base_amount,
            'applied_by' => auth()->id(),
            'applied_at' => now(),
        ]);
        
        // Recalculate fee totals
        $this->recalculate()->save();
        
        return $feeDiscount;
    }

    /**
     * Get discount percentage for a discount type
     */
    private function getDiscountPercentage(DiscountType $discountType, ?SpecialDiscount $specialDiscount = null): float
    {
        // Priority: Special discount > FeeType-specific discount > Default discount
        if ($specialDiscount) {
            return $specialDiscount->percentage ?? $specialDiscount->default_percentage;
        }
        
        // Check if this fee type has specific percentage for this discount
        $discountFeeType = DiscountFeeType::where('fee_type_id', $this->fee_type_id)
            ->where('discount_type_id', $discountType->id)
            ->first();
            
        if ($discountFeeType) {
            return $discountFeeType->percentage;
        }
        
        return $discountType->default_percentage;
    }

    /**
     * Check if fee can be waived
     */
    public function canBeWaived(): bool
    {
        return $this->status !== 'paid' && $this->status !== 'cancelled';
    }

    /**
     * Waive this fee (apply 100% discount with reason)
     */
    public function waive(string $reason, ?int $approvedBy = null): self
    {
        if (!$this->canBeWaived()) {
            throw new \Exception('Fee cannot be waived');
        }
        
        // Create a special discount application for waiver
        $application = SpecialDiscountApplication::create([
            'fee_id' => $this->id,
            'requested_by' => auth()->id(),
            'reason' => $reason,
            'status' => 'approved',
            'approved_by' => $approvedBy ?? auth()->id(),
            'approved_at' => now(),
        ]);
        
        // Apply 100% discount
        $waiverDiscount = DiscountType::firstOrCreate([
            'code' => 'WAIVER',
            'name' => 'Fee Waiver',
            'default_percentage' => 100,
        ]);
        
        $this->applyDiscount($waiverDiscount, null, 100);
        $this->status = 'waived';
        $this->save();
        
        return $this;
    }

    /**
     * Cancel this fee
     */
    public function cancel(?string $reason = null, ?int $cancelledBy = null): self
    {
        if ($this->hasPayments()) {
            throw new \Exception('Cannot cancel fee with existing payments');
        }
        
        $this->status = 'cancelled';
        $this->cancelled_by = $cancelledBy ?? auth()->id();
        $this->cancelled_at = now();
        $this->remarks = $reason ? ($this->remarks . "\nCancelled: " . $reason) : $this->remarks;
        $this->save();
        
        return $this;
    }

    /**
     * Check if fee has any payments
     */
    public function hasPayments(): bool
    {
        return $this->paymentItems()->exists();
    }

    /**
     * Get latest payment
     */
    public function getLatestPaymentAttribute()
    {
        return $this->paymentItems()
            ->with('payment')
            ->latest()
            ->first()
            ?->payment;
    }

    /**
     * Generate certificate number
     */
    public function generateCertificateNumber(): string
    {
        if (!empty($this->certificate_number)) {
            return $this->certificate_number;
        }
        
        $year = date('Y');
        $prefix = strtoupper(substr($this->feeType->code ?? 'FEE', 0, 3));
        $sequence = Fee::whereYear('created_at', $year)
            ->whereNotNull('certificate_number')
            ->count() + 1;
        
        $this->certificate_number = "{$prefix}-{$year}-" . str_pad($sequence, 5, '0', STR_PAD_LEFT);
        $this->save();
        
        return $this->certificate_number;
    }

    /**
     * Get metadata value
     */
    public function getMetadata(string $key, $default = null)
    {
        return $this->metadata[$key] ?? $default;
    }

    /**
     * Set metadata value
     */
    public function setMetadata(string $key, $value): self
    {
        $metadata = $this->metadata ?? [];
        $metadata[$key] = $value;
        $this->metadata = $metadata;
        
        return $this;
    }

    /**
     * Check if all requirements are submitted
     */
    public function hasAllRequirements(): bool
    {
        if (empty($this->feeType->requirements)) {
            return true;
        }
        
        if (empty($this->requirements_submitted)) {
            return false;
        }
        
        $required = $this->feeType->requirements;
        $submitted = $this->requirements_submitted;
        
        return count(array_intersect($required, $submitted)) === count($required);
    }

    /**
     * Add submitted requirement
     */
    public function addRequirement(string $requirement): self
    {
        $submitted = $this->requirements_submitted ?? [];
        
        if (!in_array($requirement, $submitted)) {
            $submitted[] = $requirement;
            $this->requirements_submitted = $submitted;
            $this->save();
        }
        
        return $this;
    }

    public function getPayerTypeAttribute($value)
    {
        // Convert legacy values to full class names
        $morphMap = [
            'resident' => 'App\Models\Resident',
            'household' => 'App\Models\Household',
            'App\Models\Resident' => 'App\Models\Resident',
            'App\Models\Household' => 'App\Models\Household',
        ];
        
        return $morphMap[$value] ?? $value;
    }

    public function setPayerTypeAttribute($value)
    {
        // Ensure we store full class names
        $morphMap = [
            'resident' => 'App\Models\Resident',
            'household' => 'App\Models\Household',
            'App\Models\Resident' => 'App\Models\Resident',
            'App\Models\Household' => 'App\Models\Household',
        ];
        
        $this->attributes['payer_type'] = $morphMap[$value] ?? $value;
    }
}