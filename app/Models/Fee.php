<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;

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
        'base_amount',
        'discount_amount',
        'surcharge_amount',
        'penalty_amount',
        'total_amount',
        'amount_paid',
        'balance',
        
        // Status
        'status',
        
        // Fee-specific data
        'metadata',
        
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
        'requirements_submitted',
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

    public function payer(): MorphTo
    {
        return $this->morphTo();
    }

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

    public function feeDiscounts(): HasMany
    {
        return $this->hasMany(FeeDiscount::class);
    }

    public function specialDiscountApplications(): HasMany
    {
        return $this->hasMany(SpecialDiscountApplication::class);
    }

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // ==================== HELPER METHODS ====================
    
    /**
     * Get the current authenticated user ID safely
     */
    private function getCurrentUserId(): ?int
    {
        $user = Auth::user();
        return $user?->id;
    }

    /**
     * Check if fee belongs to a specific payer
     */
    public function isPayer(string $payerType, int $payerId): bool
    {
        $normalizedType = $this->normalizePayerType($payerType);
        return $this->payer_type === $normalizedType && $this->payer_id === $payerId;
    }

    /**
     * Check if fee has any payments from a specific payer
     */
    public function hasPaymentsFromPayer(string $payerType, int $payerId): bool
    {
        if (!$this->isPayer($payerType, $payerId)) {
            return false;
        }
        
        return $this->paymentItems()->exists();
    }

    /**
     * Get all payments for a specific payer
     */
    public function getPaymentsByPayer(string $payerType, int $payerId)
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->with(['paymentItems.payment'])
            ->get()
            ->flatMap(function ($fee) {
                return $fee->paymentItems->map(function ($item) {
                    return [
                        'fee_id' => $item->fee_id,
                        'fee_code' => $item->fee->fee_code ?? null,
                        'payment_id' => $item->payment_id,
                        'payment' => $item->payment,
                        'amount' => $item->amount,
                        'paid_at' => $item->payment?->payment_date,
                        'or_number' => $item->payment?->or_number,
                        'payment_method' => $item->payment?->payment_method,
                    ];
                });
            })
            ->filter(function ($payment) {
                return !is_null($payment['payment_id']);
            })
            ->values();
    }

    /**
     * Check if payer has any outstanding fees
     */
    public function hasOutstandingFees(string $payerType, int $payerId): bool
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
            ->where('balance', '>', 0)
            ->exists();
    }

    /**
     * Get total amount paid by payer
     */
    public function getTotalPaidByPayer(string $payerType, int $payerId): float
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return (float) $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->where('status', 'paid')
            ->sum('amount_paid');
    }

    /**
     * Get total outstanding amount for payer
     */
    public function getTotalOutstandingByPayer(string $payerType, int $payerId): float
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return (float) $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
            ->sum('balance');
    }

    /**
     * Get fee history for a payer
     */
    public function getPayerFeeHistory(string $payerType, int $payerId, array $options = [])
    {
        $normalizedType = $this->normalizePayerType($payerType);
        $query = $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->with(['feeType', 'paymentItems.payment']);
        
        if (isset($options['from_date'])) {
            $query->whereDate('created_at', '>=', $options['from_date']);
        }
        
        if (isset($options['to_date'])) {
            $query->whereDate('created_at', '<=', $options['to_date']);
        }
        
        if (isset($options['status'])) {
            $query->where('status', $options['status']);
        }
        
        if (isset($options['fee_type_id'])) {
            $query->where('fee_type_id', $options['fee_type_id']);
        }
        
        if (isset($options['payment_method'])) {
            $query->whereHas('paymentItems.payment', function ($q) use ($options) {
                $q->where('payment_method', $options['payment_method']);
            });
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get payment summary for a payer
     */
    public function getPayerPaymentSummary(string $payerType, int $payerId): array
    {
        $normalizedType = $this->normalizePayerType($payerType);
        $fees = $this->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId)
            ->get();
        
        $paymentsByMethod = $this->getPaymentsByPayer($payerType, $payerId)
            ->groupBy('payment_method')
            ->map(function ($payments) {
                return [
                    'count' => $payments->count(),
                    'total' => $payments->sum('amount'),
                ];
            });
        
        return [
            'total_fees' => $fees->count(),
            'total_amount' => $fees->sum('total_amount'),
            'total_paid' => $fees->sum('amount_paid'),
            'total_balance' => $fees->sum('balance'),
            'paid_fees' => $fees->where('status', 'paid')->count(),
            'pending_fees' => $fees->whereIn('status', ['pending', 'issued', 'partially_paid'])->count(),
            'overdue_fees' => $fees->where('status', 'overdue')->count(),
            'cancelled_fees' => $fees->where('status', 'cancelled')->count(),
            'waived_fees' => $fees->where('status', 'waived')->count(),
            'payments_by_method' => $paymentsByMethod,
            'payment_history' => $this->getPaymentsByPayer($payerType, $payerId),
            'last_payment_date' => $fees->where('status', 'paid')
                ->sortByDesc('updated_at')
                ->first()?->updated_at,
        ];
    }

    /**
     * Check if fee has been paid via specific payment method
     */
    public function hasPaymentMethod(string $paymentMethod): bool
    {
        return $this->paymentItems()
            ->whereHas('payment', function ($q) use ($paymentMethod) {
                $q->where('payment_method', $paymentMethod);
            })
            ->exists();
    }

    /**
     * Get payments by payment type for this fee
     */
    public function getPaymentsByMethod(string $paymentMethod)
    {
        return $this->paymentItems()
            ->whereHas('payment', function ($q) use ($paymentMethod) {
                $q->where('payment_method', $paymentMethod);
            })
            ->with('payment')
            ->get();
    }

    /**
     * Get payment methods used for this fee
     */
    public function getPaymentMethodsAttribute(): array
    {
        return $this->paymentItems()
            ->whereHas('payment')
            ->with('payment')
            ->get()
            ->pluck('payment.payment_method')
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Check if fee was fully paid using a single payment method
     */
    public function isPaidByMethod(string $paymentMethod): bool
    {
        if ($this->status !== 'paid') {
            return false;
        }
        
        $methods = $this->payment_methods;
        
        return count($methods) === 1 && $methods[0] === $paymentMethod;
    }

    /**
     * Normalize payer type to full class name
     */
    private function normalizePayerType(string $payerType): string
    {
        $morphMap = [
            'resident' => 'App\Models\Resident',
            'household' => 'App\Models\Household',
            'business' => 'App\Models\Business',
            'visitor' => 'App\Models\Visitor',
            'other' => 'App\Models\Other',
        ];
        
        if (class_exists($payerType)) {
            return $payerType;
        }
        
        return $morphMap[strtolower($payerType)] ?? $payerType;
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

    public function scopeByPayer($query, string $payerType, int $payerId)
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return $query->where('payer_type', $normalizedType)
            ->where('payer_id', $payerId);
    }

    public function scopeWithPayerPaymentStatus($query, string $payerType, int $payerId)
    {
        $normalizedType = $this->normalizePayerType($payerType);
        
        return $query->byPayer($payerType, $payerId)
            ->select('fees.*')
            ->selectRaw('CASE 
                WHEN fees.status = "paid" THEN "paid"
                WHEN fees.balance > 0 AND fees.due_date < CURDATE() THEN "overdue"
                WHEN fees.balance > 0 THEN "pending"
                ELSE fees.status
            END as payment_status')
            ->with(['paymentItems' => function($q) {
                $q->latest();
            }]);
    }

    public function scopeByPaymentMethod($query, string $paymentMethod)
    {
        return $query->whereHas('paymentItems.payment', function ($q) use ($paymentMethod) {
            $q->where('payment_method', $paymentMethod);
        });
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

    public function calculateTotalDiscounts(): float
    {
        return (float) $this->feeDiscounts()->sum('discount_amount');
    }

    public function calculateSurcharge(): float
    {
        if (!$this->feeType?->has_surcharge) {
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

    public function calculatePenalty($paymentDate = null): float
    {
        if (!$this->feeType?->has_penalty) {
            return 0.00;
        }

        $checkDate = $paymentDate ?: now();
        
        if ($this->due_date && $checkDate->startOfDay()->lte($this->due_date)) {
            return 0.00;
        }

        if ($this->feeType->penalty_fixed > 0) {
            return (float) $this->feeType->penalty_fixed;
        }

        if ($this->feeType->penalty_percentage > 0) {
            return (float) ($this->base_amount * ($this->feeType->penalty_percentage / 100));
        }

        return 0.00;
    }

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

    public function updateStatus(): self
    {
        if ($this->balance <= 0 && $this->base_amount > 0) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0 && $this->balance > 0) {
            $this->status = 'partially_paid';
        } elseif ($this->isOverdue()) {
            $this->status = 'overdue';
        }
        
        return $this;
    }

    public function isOverdue(): bool
    {
        if (in_array($this->status, ['paid', 'cancelled', 'waived'])) {
            return false;
        }
        
        return $this->due_date && now()->startOfDay()->gt($this->due_date);
    }

    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        return now()->diffInDays($this->due_date);
    }

    public function applyPayment(float $amount, ?int $paymentId = null, array $paymentData = []): self
    {
        $this->amount_paid += $amount;
        $this->balance = max(0, $this->total_amount - $this->amount_paid);
        
        if (!empty($paymentData)) {
            if (isset($paymentData['or_number'])) {
                $this->or_number = $paymentData['or_number'];
            }
            if (isset($paymentData['collected_by'])) {
                $this->collected_by = $paymentData['collected_by'];
            }
            if (isset($paymentData['payment_date'])) {
                $this->penalty_amount = $this->calculatePenalty($paymentData['payment_date']);
                $this->total_amount = $this->base_amount - $this->discount_amount + $this->surcharge_amount + $this->penalty_amount;
                $this->balance = max(0, $this->total_amount - $this->amount_paid);
            }
        }
        
        $this->updateStatus();
        $this->save();
        
        return $this;
    }

    public function applyDiscount(DiscountType $discountType, ?SpecialDiscount $specialDiscount = null, ?float $percentage = null): FeeDiscount
    {
        $discountPercentage = $percentage ?? $this->getDiscountPercentage($discountType, $specialDiscount);
        $discountAmount = $this->base_amount * ($discountPercentage / 100);
        
        $feeDiscount = FeeDiscount::create([
            'fee_id' => $this->id,
            'discount_type_id' => $discountType->id,
            'special_discount_id' => $specialDiscount?->id,
            'discount_amount' => $discountAmount,
            'discount_percentage' => $discountPercentage,
            'base_amount' => $this->base_amount,
            'applied_by' => $this->getCurrentUserId(),
            'applied_at' => now(),
        ]);
        
        $this->recalculate()->save();
        
        return $feeDiscount;
    }

    private function getDiscountPercentage(DiscountType $discountType, ?SpecialDiscount $specialDiscount = null): float
    {
        if ($specialDiscount) {
            return $specialDiscount->percentage ?? $specialDiscount->default_percentage;
        }
        
        $discountFeeType = DiscountFeeType::where('fee_type_id', $this->fee_type_id)
            ->where('discount_type_id', $discountType->id)
            ->first();
            
        if ($discountFeeType) {
            return $discountFeeType->percentage;
        }
        
        return $discountType->default_percentage;
    }

    public function canBeWaived(): bool
    {
        return !in_array($this->status, ['paid', 'cancelled']);
    }

    public function waive(string $reason, ?int $approvedBy = null): self
    {
        if (!$this->canBeWaived()) {
            throw new \Exception('Fee cannot be waived');
        }
        
        $application = SpecialDiscountApplication::create([
            'fee_id' => $this->id,
            'requested_by' => $this->getCurrentUserId(),
            'reason' => $reason,
            'status' => 'approved',
            'approved_by' => $approvedBy ?? $this->getCurrentUserId(),
            'approved_at' => now(),
        ]);
        
        $waiverDiscount = DiscountType::firstOrCreate(
            ['code' => 'WAIVER'],
            [
                'name' => 'Fee Waiver',
                'default_percentage' => 100,
            ]
        );
        
        $this->applyDiscount($waiverDiscount, null, 100);
        $this->status = 'waived';
        $this->save();
        
        return $this;
    }

    public function cancel(?string $reason = null, ?int $cancelledBy = null): self
    {
        if ($this->hasPayments()) {
            throw new \Exception('Cannot cancel fee with existing payments');
        }
        
        $this->status = 'cancelled';
        $this->cancelled_by = $cancelledBy ?? $this->getCurrentUserId();
        $this->cancelled_at = now();
        $this->remarks = $reason ? ($this->remarks . "\nCancelled: " . $reason) : $this->remarks;
        $this->save();
        
        return $this;
    }

    public function hasPayments(): bool
    {
        return $this->paymentItems()->exists();
    }

    public function getLatestPaymentAttribute()
    {
        return $this->paymentItems()
            ->with('payment')
            ->latest()
            ->first()
            ?->payment;
    }

    public function getPaymentSummaryAttribute(): array
    {
        $payments = $this->paymentItems()->with('payment')->get();
        
        return [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'first_payment' => $payments->sortBy('created_at')->first()?->payment,
            'last_payment' => $payments->sortByDesc('created_at')->first()?->payment,
            'payment_methods' => $payments->pluck('payment.payment_method')->unique()->values(),
            'or_numbers' => $payments->pluck('payment.or_number')->filter()->values(),
        ];
    }

    public function generateCertificateNumber(): string
    {
        if (!empty($this->certificate_number)) {
            return $this->certificate_number;
        }
        
        $year = date('Y');
        $prefix = strtoupper(substr($this->feeType?->code ?? 'FEE', 0, 3));
        $sequence = Fee::whereYear('created_at', $year)
            ->whereNotNull('certificate_number')
            ->count() + 1;
        
        $this->certificate_number = "{$prefix}-{$year}-" . str_pad($sequence, 5, '0', STR_PAD_LEFT);
        $this->save();
        
        return $this->certificate_number;
    }

    public function getMetadata(string $key, $default = null)
    {
        return $this->metadata[$key] ?? $default;
    }

    public function setMetadata(string $key, $value): self
    {
        $metadata = $this->metadata ?? [];
        $metadata[$key] = $value;
        $this->metadata = $metadata;
        
        return $this;
    }

    public function hasAllRequirements(): bool
    {
        if (empty($this->feeType?->requirements)) {
            return true;
        }
        
        if (empty($this->requirements_submitted)) {
            return false;
        }
        
        $required = $this->feeType->requirements;
        $submitted = $this->requirements_submitted;
        
        return count(array_intersect($required, $submitted)) === count($required);
    }

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
        $morphMap = [
            'resident' => 'App\Models\Resident',
            'household' => 'App\Models\Household',
            'App\Models\Resident' => 'App\Models\Resident',
            'App\Models\Household' => 'App\Models\Household',
        ];
        
        $this->attributes['payer_type'] = $morphMap[$value] ?? $value;
    }
}