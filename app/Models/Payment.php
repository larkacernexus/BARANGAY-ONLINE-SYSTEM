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
        'total_amount',
        'amount_paid',
        'purpose',
        'remarks',
        'is_cleared',
        'clearance_code',
        'certificate_type',
        'validity_date',
        'method_details',
        'recorded_by',
        'discount_code',
        'discount_type',
        // DYNAMIC: Store privilege info at time of payment
        'payer_privileges', // JSON field to store privileges snapshot
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'validity_date' => 'date',
        'subtotal' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'penalty' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'is_cleared' => 'boolean',
        'method_details' => 'array',
        'payer_privileges' => 'array', // ADDED: Cast to array
    ];

    protected $appends = [
        'formatted_total',
        'formatted_amount_paid',
        'formatted_balance',
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
        'has_clearance_request',
        'total_discount',
        'discounts_summary',
        'amount_due',
        'is_fully_paid',
        'balance',
        'change_due',
        'payment_status',
        'formatted_amount_due',
        'formatted_change_due',
        // DYNAMIC: Add privilege-related fields
        'payer_privileges_list',
        'privileges_count',
        'has_privileges',
    ];

    protected $attributes = [
        'status' => 'completed',
        'collection_type' => 'manual',
        'amount_paid' => 0.00,
        'discount' => 0.00,
        'payer_privileges' => '[]', // Default empty JSON array
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
                'discount',
                'amount_paid',
                'payment_method',
                'status',
                'recorded_by',
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

    /**
     * BOOT METHOD - Add model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($payment) {
            if ($payment->amount_paid < 0) {
                throw new \Exception('Amount paid cannot be negative.');
            }
            
            $payment->updatePaymentStatus();
        });
        
        static::saved(function ($payment) {
            if ($payment->relationLoaded('items')) {
                foreach ($payment->items as $item) {
                    if ($item->fee_id) {
                        $item->fee->recalculate()->save();
                    }
                }
            }
        });
        
        // ADDED: Capture payer privileges at time of payment
        static::creating(function ($payment) {
            if (!$payment->payer_privileges && $payment->payer_id && $payment->payer_type) {
                $payment->capturePayerPrivileges();
            }
        });
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

    public function clearanceType()
    {
        return $this->belongsTo(ClearanceType::class, 'clearance_type_id');
    }

    // Direct relationship to discounts
    public function discounts()
    {
        return $this->hasMany(PaymentDiscount::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }

    // Get discount rules through discounts
    public function discountRules()
    {
        return $this->belongsToMany(DiscountRule::class, 'payment_discounts')
                    ->withPivot('discount_amount', 'verified_by', 'verified_at', 'id_presented', 'id_number', 'remarks')
                    ->withTimestamps();
    }

    // Get clearance requests through items
    public function clearanceRequests()
    {
        return $this->hasManyThrough(
            ClearanceRequest::class,
            PaymentItem::class,
            'payment_id',
            'id',
            'id',
            'clearance_request_id'
        );
    }

    // Get first clearance request
    public function firstClearanceRequest()
    {
        return $this->items()
            ->with('clearanceRequest')
            ->whereNotNull('clearance_request_id')
            ->first()
            ?->clearanceRequest;
    }

    // ==================== PRIVILEGE METHODS ====================

    /**
     * Capture payer's privileges at time of payment
     */
    public function capturePayerPrivileges()
    {
        if (!$this->payer_id || !$this->payer_type) {
            return $this;
        }

        $privileges = [];

        if ($this->payer_type === 'App\Models\Resident' || $this->payer_type === 'resident') {
            $resident = Resident::with(['residentPrivileges.privilege'])->find($this->payer_id);
            
            if ($resident) {
                $privileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        return [
                            'id' => $rp->id,
                            'privilege_id' => $privilege->id,
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'id_number' => $rp->id_number,
                            'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                            'verified_at' => $rp->verified_at?->toISOString(),
                            'expires_at' => $rp->expires_at?->toISOString(),
                        ];
                    })
                    ->values()
                    ->toArray();
            }
        } elseif ($this->payer_type === 'App\Models\Household' || $this->payer_type === 'household') {
            $household = Household::with(['householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident.residentPrivileges.privilege');
            }])->find($this->payer_id);

            if ($household) {
                $headMember = $household->householdMembers->first();
                if ($headMember && $headMember->resident) {
                    $privileges = $headMember->resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) {
                            $privilege = $rp->privilege;
                            return [
                                'id' => $rp->id,
                                'privilege_id' => $privilege->id,
                                'code' => $privilege->code,
                                'name' => $privilege->name,
                                'id_number' => $rp->id_number,
                                'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                                'verified_at' => $rp->verified_at?->toISOString(),
                                'expires_at' => $rp->expires_at?->toISOString(),
                            ];
                        })
                        ->values()
                        ->toArray();
                }
            }
        }

        $this->payer_privileges = $privileges;
        return $this;
    }

    /**
     * Get payer privileges list
     */
    public function getPayerPrivilegesListAttribute()
    {
        return $this->payer_privileges ?? [];
    }

    /**
     * Get privileges count
     */
    public function getPrivilegesCountAttribute()
    {
        return count($this->payer_privileges ?? []);
    }

    /**
     * Check if payer has privileges
     */
    public function getHasPrivilegesAttribute()
    {
        return $this->privileges_count > 0;
    }

    /**
     * Check if payer has specific privilege code at time of payment
     */
    public function hadPrivilege($code)
    {
        if (!$this->payer_privileges) {
            return false;
        }

        return collect($this->payer_privileges)->contains('code', $code);
    }

    /**
     * Get privilege ID number
     */
    public function getPrivilegeIdNumber($code)
    {
        if (!$this->payer_privileges) {
            return null;
        }

        $privilege = collect($this->payer_privileges)->firstWhere('code', $code);
        return $privilege['id_number'] ?? null;
    }

    // ==================== ACCESSORS ====================
    
    /**
     * Get the amount due after discount (what the payer should pay)
     */
    public function getAmountDueAttribute()
    {
        return max(0, $this->total_amount - $this->discount);
    }

    /**
     * Formatted amount due
     */
    public function getFormattedAmountDueAttribute()
    {
        return '₱' . number_format($this->amount_due, 2);
    }

    /**
     * Check if payment is fully paid
     */
    public function getIsFullyPaidAttribute()
    {
        return abs($this->amount_paid - $this->amount_due) < 0.01;
    }

    /**
     * Calculate balance (if underpaid)
     */
    public function getBalanceAttribute()
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    /**
     * Calculate change due (if overpaid)
     */
    public function getChangeDueAttribute()
    {
        return max(0, $this->amount_paid - $this->amount_due);
    }

    /**
     * Formatted change due
     */
    public function getFormattedChangeDueAttribute()
    {
        return '₱' . number_format($this->change_due, 2);
    }

    /**
     * Payment status
     */
    public function getPaymentStatusAttribute()
    {
        if ($this->amount_paid <= 0) {
            return 'unpaid';
        } elseif ($this->amount_paid < $this->amount_due - 0.01) {
            return 'partial';
        } elseif (abs($this->amount_paid - $this->amount_due) < 0.01) {
            return 'paid';
        } elseif ($this->amount_paid > $this->amount_due + 0.01) {
            return 'overpaid';
        }
        
        return 'unknown';
    }

    /**
     * Update payment status based on amount paid
     */
    public function updatePaymentStatus()
    {
        $amountDue = $this->total_amount - $this->discount;
        
        if ($this->amount_paid <= 0) {
            $this->status = 'pending';
        } elseif ($this->amount_paid < $amountDue - 0.01) {
            $this->status = 'partially_paid';
        } elseif ($this->amount_paid >= $amountDue - 0.01) {
            $this->status = 'completed';
        }
        
        return $this;
    }

    // Formatted total
    public function getFormattedTotalAttribute()
    {
        return '₱' . number_format($this->total_amount, 2);
    }

    // Formatted amount paid
    public function getFormattedAmountPaidAttribute()
    {
        return '₱' . number_format($this->amount_paid ?? 0, 2);
    }

    // Formatted balance
    public function getFormattedBalanceAttribute()
    {
        return '₱' . number_format($this->balance, 2);
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

    // Formatted discount (using the direct discount field)
    public function getFormattedDiscountAttribute()
    {
        return '₱' . number_format($this->discount ?? 0, 2);
    }

    // Calculate total discount from related discounts (for backward compatibility)
    public function getTotalDiscountAttribute()
    {
        if ($this->relationLoaded('discounts')) {
            return $this->discounts->sum('discount_amount');
        }
        
        return $this->discounts()->sum('discount_amount');
    }

    // Discounts summary
    public function getDiscountsSummaryAttribute()
    {
        if (!$this->relationLoaded('discounts')) {
            $this->load('discounts.rule');
        }

        return $this->discounts->map(function($discount) {
            return [
                'id' => $discount->id,
                'rule_id' => $discount->discount_rule_id,
                'rule_name' => $discount->rule->name ?? 'Unknown',
                'discount_type' => $discount->rule->discount_type ?? null,
                'discount_amount' => $discount->discount_amount,
                'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                'verified_by' => $discount->verifier->name ?? 'Unknown',
                'verified_at' => $discount->verified_at ? $discount->verified_at->format('M d, Y h:i A') : null,
                'id_presented' => $discount->id_presented,
                'id_number' => $discount->id_number,
            ];
        });
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
        $statuses = [
            'pending' => 'Pending',
            'partially_paid' => 'Partially Paid',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
        ];

        return $statuses[$this->status] ?? ucfirst($this->status);
    }

    public function getCollectionTypeDisplayAttribute()
    {
        $types = [
            'manual' => 'Manual Collection',
            'online' => 'Online Collection',
            'mobile' => 'Mobile Collection',
            'system' => 'System Generated',
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
            'BUSINESS_CLEARANCE' => 'Business Clearance',
            'INDIGENCY_CERT' => 'Certificate of Indigency',
            'RESIDENCY_CERT' => 'Certificate of Residency',
        ];

        return $types[$this->clearance_type] ?? ucwords(str_replace('_', ' ', $this->clearance_type));
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
        if ($this->payer_type === 'resident' && $this->resident) {
            // Get active privileges
            $activePrivileges = $this->resident->residentPrivileges
                ?->filter(function ($rp) {
                    return $rp->isActive();
                })
                ->map(function ($rp) {
                    return [
                        'code' => $rp->privilege->code,
                        'name' => $rp->privilege->name,
                        'id_number' => $rp->id_number,
                    ];
                })
                ->values()
                ->toArray() ?? [];

            // DYNAMIC privilege flags
            $privilegeFlags = [];
            foreach ($activePrivileges as $priv) {
                $code = strtolower($priv['code']);
                $privilegeFlags["is_{$code}"] = true;
            }

            return array_merge([
                'id' => $this->resident->id,
                'name' => $this->resident->name ?? $this->resident->full_name ?? 'Unknown',
                'contact_number' => $this->resident->contact_number,
                'email' => $this->resident->email,
                'address' => $this->resident->address,
                'purok' => $this->resident->purok,
                'privileges' => $activePrivileges,
                'privileges_count' => count($activePrivileges),
                'has_privileges' => count($activePrivileges) > 0,
                'snapshot_privileges' => $this->payer_privileges, // Include snapshot
            ], $privilegeFlags);
        }

        if ($this->payer_type === 'household' && $this->household) {
            return [
                'id' => $this->household->id,
                'household_number' => $this->household->household_number,
                'head_name' => $this->household->head_name,
                'contact_number' => $this->household->contact_number,
                'address' => $this->household->address,
                'purok' => $this->household->purok,
                'member_count' => $this->household->members_count,
                'snapshot_privileges' => $this->payer_privileges,
            ];
        }

        return [
            'snapshot_privileges' => $this->payer_privileges,
        ];
    }

    public function getIsClearancePaymentAttribute()
    {
        return !empty($this->clearance_type) || $this->has_clearance_request;
    }

    public function getHasClearanceRequestAttribute()
    {
        if (!$this->relationLoaded('items')) {
            $this->load('items');
        }
        
        return $this->items->contains(function ($item) {
            return !empty($item->clearance_request_id);
        });
    }

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

    // Validate if payment is sufficient
    public function isPaymentSufficient()
    {
        return $this->amount_paid >= $this->amount_due - 0.01;
    }

    // Get payment shortfall
    public function getShortfallAttribute()
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    // Get formatted shortfall
    public function getFormattedShortfallAttribute()
    {
        return '₱' . number_format($this->shortfall, 2);
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

    public function scopePartiallyPaid($query)
    {
        return $query->where('status', 'partially_paid');
    }

    // Scope for fully paid payments (based on amount logic)
    public function scopeFullyPaid($query)
    {
        return $query->whereRaw('amount_paid >= (total_amount - discount) - 0.01');
    }

    // Scope for underpaid
    public function scopeUnderpaid($query)
    {
        return $query->where('amount_paid', '>', 0)
                     ->whereRaw('amount_paid < (total_amount - discount) - 0.01');
    }

    // Scope for unpaid
    public function scopeUnpaid($query)
    {
        return $query->where('amount_paid', '<=', 0);
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

    public function scopeWithDiscounts($query)
    {
        return $query->with(['discounts.rule', 'discounts.verifier']);
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

    // Helper methods
    public function addDiscount(DiscountRule $rule, $discountAmount, $verifiedBy = null, $idNumber = null, $remarks = null)
    {
        $discount = $this->discounts()->create([
            'discount_rule_id' => $rule->id,
            'discount_amount' => $discountAmount,
            'verified_by' => $verifiedBy ?? auth()->id(),
            'verified_at' => now(),
            'id_presented' => !empty($idNumber),
            'id_number' => $idNumber,
            'remarks' => $remarks,
        ]);
        
        // Update the main discount field
        $this->discount = $discountAmount;
        $this->discount_code = $rule->code;
        $this->discount_type = $rule->discount_type;
        $this->updatePaymentStatus();
        $this->save();
        
        return $discount;
    }

    // Process payment with amount paid
    public function processPayment($amountPaid, $paymentMethod = null, $referenceNumber = null)
    {
        $this->amount_paid = $amountPaid;
        
        if ($paymentMethod) {
            $this->payment_method = $paymentMethod;
        }
        
        if ($referenceNumber) {
            $this->reference_number = $referenceNumber;
        }
        
        $this->updatePaymentStatus();
        $this->save();
        
        return $this;
    }

    // Add payment and calculate change
    public function processPaymentWithChange($amountTendered)
    {
        $this->processPayment($amountTendered);
        
        return [
            'payment' => $this,
            'amount_tendered' => $amountTendered,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'amount_due' => $this->amount_due,
            'change' => $this->change_due,
            'is_fully_paid' => $this->is_fully_paid,
        ];
    }

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

    public function getAuditSummary()
    {
        return [
            'or_number' => $this->or_number,
            'date' => $this->formatted_date,
            'payer' => $this->payer_name,
            'total_amount' => $this->formatted_total,
            'discount' => $this->formatted_discount,
            'amount_due' => $this->formatted_amount_due,
            'amount_paid' => $this->formatted_amount_paid,
            'balance' => $this->formatted_balance,
            'change' => $this->formatted_change_due,
            'payment_status' => $this->payment_status,
            'recorded_by' => $this->recorded_by_user_name,
            'method' => $this->payment_method_display,
            'discounts' => $this->discounts_summary,
            'status' => $this->status_display,
            'payer_privileges' => $this->payer_privileges, // Include snapshot
        ];
    }
    
    // Get payment summary with change calculation
    public function getPaymentSummary()
    {
        return [
            'or_number' => $this->or_number,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'amount_due' => $this->amount_due,
            'amount_paid' => $this->amount_paid,
            'balance' => $this->balance,
            'change' => $this->change_due,
            'is_fully_paid' => $this->is_fully_paid,
            'payment_status' => $this->payment_status,
            'formatted' => [
                'total' => $this->formatted_total,
                'discount' => $this->formatted_discount,
                'amount_due' => $this->formatted_amount_due,
                'amount_paid' => $this->formatted_amount_paid,
                'balance' => $this->formatted_balance,
                'change' => $this->formatted_change_due,
            ],
            'payer_privileges' => $this->payer_privileges,
        ];
    }
}