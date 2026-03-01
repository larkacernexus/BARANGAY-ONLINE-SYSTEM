<?php
// app/Models/Receipt.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Receipt extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'receipt_number',
        'payment_id',
        'receiptable_id',
        'receiptable_type',
        'or_number',
        'receipt_type',
        'payer_name',
        'payer_address',
        'subtotal',
        'surcharge',
        'penalty',
        'discount',
        'total_amount',
        'amount_paid',
        'change_due',
        'payment_method',
        'reference_number',
        'payment_date',
        'issued_date',
        'issued_by',
        'fee_breakdown',
        'discount_breakdown',
        'metadata',
        'is_voided',
        'void_reason',
        'voided_by',
        'voided_at',
        'printed_count',
        'last_printed_at',
        'email_sent',
        'email_sent_at',
        'sms_sent',
        'sms_sent_at',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'issued_date' => 'datetime',
        'voided_at' => 'datetime',
        'last_printed_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'sms_sent_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'surcharge' => 'decimal:2',
        'penalty' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_due' => 'decimal:2',
        'is_voided' => 'boolean',
        'email_sent' => 'boolean',
        'sms_sent' => 'boolean',
        'printed_count' => 'integer',
        'fee_breakdown' => 'array',
        'discount_breakdown' => 'array',
        'metadata' => 'array',
    ];

    protected $appends = [
        'formatted_subtotal',
        'formatted_surcharge',
        'formatted_penalty',
        'formatted_discount',
        'formatted_total',
        'formatted_amount_paid',
        'formatted_change',
        'formatted_date',
        'status',
        'status_badge',
        'receipt_type_label',
        'payment_method_label',
        'receiptable_name',
        'receiptable_type_label',
    ];

    /**
     * Get the parent receiptable model (polymorphic)
     */
    public function receiptable()
    {
        return $this->morphTo();
    }

    /**
     * Get the payment associated with the receipt
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the clearance request associated with the receipt
     * Helper relationship for direct access to clearance requests
     */
    public function clearanceRequest()
    {
        return $this->belongsTo(ClearanceRequest::class, 'receiptable_id')
            ->where('receiptable_type', ClearanceRequest::class);
    }

    /**
     * Get the fee associated with the receipt
     * Helper relationship for direct access to fees
     */
    public function fee()
    {
        return $this->belongsTo(Fee::class, 'receiptable_id')
            ->where('receiptable_type', Fee::class);
    }

    /**
     * Get the user who issued the receipt
     */
    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who voided the receipt
     */
    public function voider()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    /**
     * Activity Log Configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'receipt_number',
                'payment_id',
                'total_amount',
                'is_voided',
                'printed_count',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(function(string $eventName) {
                return "Receipt {$eventName} - #{$this->receipt_number}";
            });
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($receipt) {
            if (empty($receipt->receipt_number)) {
                $receipt->receipt_number = static::generateReceiptNumber();
            }
            
            if (empty($receipt->issued_date)) {
                $receipt->issued_date = now();
            }
            
            if (empty($receipt->printed_count)) {
                $receipt->printed_count = 0;
            }
        });
    }

    /**
     * Scopes
     */
    public function scopeValid($query)
    {
        return $query->where('is_voided', false);
    }

    public function scopeVoided($query)
    {
        return $query->where('is_voided', true);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('issued_date', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('issued_date', now()->month)
                    ->whereYear('issued_date', now()->year);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByReceiptType($query, $type)
    {
        return $query->where('receipt_type', $type);
    }

    public function scopeByReceiptableType($query, $type)
    {
        return $query->where('receiptable_type', $type);
    }

    public function scopeBetweenDates($query, $start, $end)
    {
        return $query->whereBetween('issued_date', [$start, $end]);
    }

    /**
     * Accessors
     */
    public function getFormattedSubtotalAttribute()
    {
        return '₱' . number_format($this->subtotal, 2);
    }

    public function getFormattedSurchargeAttribute()
    {
        return '₱' . number_format($this->surcharge ?? 0, 2);
    }

    public function getFormattedPenaltyAttribute()
    {
        return '₱' . number_format($this->penalty ?? 0, 2);
    }

    public function getFormattedDiscountAttribute()
    {
        return '₱' . number_format($this->discount ?? 0, 2);
    }

    public function getFormattedTotalAttribute()
    {
        return '₱' . number_format($this->total_amount, 2);
    }

    public function getFormattedAmountPaidAttribute()
    {
        return '₱' . number_format($this->amount_paid, 2);
    }

    public function getFormattedChangeAttribute()
    {
        return '₱' . number_format($this->change_due, 2);
    }

    public function getFormattedDateAttribute()
    {
        return $this->issued_date->format('M d, Y h:i A');
    }

    public function getStatusAttribute()
    {
        if ($this->is_voided) {
            return 'voided';
        }
        
        if ($this->amount_paid >= $this->total_amount - 0.01) {
            return 'paid';
        }
        
        if ($this->amount_paid > 0) {
            return 'partial';
        }
        
        return 'pending';
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'paid' => '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span>',
            'partial' => '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Partial</span>',
            'pending' => '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Pending</span>',
            'voided' => '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Voided</span>',
        ];

        return $badges[$this->status] ?? $this->status;
    }

    public function getReceiptTypeLabelAttribute()
    {
        $types = [
            'official' => 'Official Receipt',
            'acknowledgment' => 'Acknowledgment Receipt',
            'clearance' => 'Clearance Receipt',
            'certificate' => 'Certificate Receipt',
            'fee' => 'Fee Receipt',
        ];

        return $types[$this->receipt_type] ?? ucfirst($this->receipt_type);
    }

    public function getPaymentMethodLabelAttribute()
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

    public function getReceiptableNameAttribute()
    {
        if (!$this->receiptable) {
            return null;
        }

        if ($this->receiptable_type === 'App\\Models\\Fee') {
            return $this->receiptable->name ?? 'Fee';
        }

        if ($this->receiptable_type === 'App\\Models\\ClearanceRequest') {
            return 'Clearance: ' . ($this->receiptable->control_number ?? '');
        }

        return null;
    }

    public function getReceiptableTypeLabelAttribute()
    {
        $types = [
            'App\\Models\\Fee' => 'Fee',
            'App\\Models\\ClearanceRequest' => 'Clearance Request',
        ];

        return $types[$this->receiptable_type] ?? class_basename($this->receiptable_type);
    }

    /**
     * Generate receipt number
     */
    public static function generateReceiptNumber()
    {
        $year = date('Y');
        $month = date('m');
        $prefix = "RCP-{$year}{$month}";
        
        $lastReceipt = self::where('receipt_number', 'like', "{$prefix}%")
            ->orderBy('receipt_number', 'desc')
            ->first();

        if ($lastReceipt) {
            $lastNumber = (int) substr($lastReceipt->receipt_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$newNumber}";
    }

    /**
     * Create receipt from payment
     */
    public static function createFromPayment(Payment $payment, $receiptType = 'official')
    {
        $receipt = new static();
        $receipt->payment_id = $payment->id;
        $receipt->or_number = $payment->or_number;
        $receipt->receipt_type = $receiptType;
        $receipt->payer_name = $payment->payer_name;
        $receipt->payer_address = $payment->address;
        $receipt->subtotal = $payment->subtotal;
        $receipt->surcharge = $payment->surcharge;
        $receipt->penalty = $payment->penalty;
        $receipt->discount = $payment->discount;
        $receipt->total_amount = $payment->total_amount - $payment->discount;
        $receipt->amount_paid = $payment->amount_paid;
        $receipt->change_due = $payment->change_due;
        $receipt->payment_method = $payment->payment_method;
        $receipt->reference_number = $payment->reference_number;
        $receipt->payment_date = $payment->payment_date;
        $receipt->issued_by = auth()->id();
        
        // Store fee breakdown
        $receipt->fee_breakdown = $payment->items->map(function($item) {
            return [
                'fee_id' => $item->fee_id,
                'fee_name' => $item->fee_name,
                'fee_code' => $item->fee_code,
                'category' => $item->category,
                'base_amount' => $item->base_amount,
                'surcharge' => $item->surcharge,
                'penalty' => $item->penalty,
                'discount' => $item->discount,
                'total_amount' => $item->total_amount,
                'clearance_request_id' => $item->clearance_request_id,
            ];
        })->toArray();
        
        // Store discount breakdown if any
        if ($payment->discounts->isNotEmpty()) {
            $receipt->discount_breakdown = $payment->discounts->map(function($discount) {
                return [
                    'rule_id' => $discount->discount_rule_id,
                    'rule_name' => $discount->rule?->name,
                    'discount_type' => $discount->rule?->discount_type,
                    'discount_amount' => $discount->discount_amount,
                    'id_number' => $discount->id_number,
                ];
            })->toArray();
        }

        $receipt->save();

        return $receipt;
    }

    /**
     * Create receipt for a fee (direct fee payment without clearance)
     */
    public static function createForFee($fee, array $data)
    {
        $receipt = new static();
        $receipt->receiptable()->associate($fee);
        $receipt->payment_id = $data['payment_id'] ?? null;
        $receipt->or_number = $data['or_number'] ?? null;
        $receipt->receipt_type = $data['receipt_type'] ?? 'fee';
        $receipt->payer_name = $data['payer_name'];
        $receipt->payer_address = $data['payer_address'] ?? null;
        $receipt->subtotal = $data['amount'];
        $receipt->total_amount = $data['amount'];
        $receipt->amount_paid = $data['amount_paid'] ?? $data['amount'];
        $receipt->change_due = $data['change_due'] ?? 0;
        $receipt->payment_method = $data['payment_method'];
        $receipt->payment_date = $data['payment_date'] ?? now();
        $receipt->issued_by = auth()->id();
        
        $receipt->fee_breakdown = [
            [
                'fee_id' => $fee->id,
                'fee_name' => $fee->name,
                'fee_code' => $fee->code,
                'base_amount' => $data['amount'],
                'total_amount' => $data['amount'],
            ]
        ];

        $receipt->save();

        return $receipt;
    }

    /**
     * Create receipt for clearance request
     */
    public static function createForClearance($clearanceRequest, array $data)
    {
        $receipt = new static();
        $receipt->receiptable()->associate($clearanceRequest);
        $receipt->payment_id = $data['payment_id'] ?? null;
        $receipt->or_number = $data['or_number'] ?? null;
        $receipt->receipt_type = $data['receipt_type'] ?? 'clearance';
        $receipt->payer_name = $data['payer_name'];
        $receipt->payer_address = $data['payer_address'] ?? null;
        $receipt->subtotal = $data['amount'];
        $receipt->total_amount = $data['amount'];
        $receipt->amount_paid = $data['amount_paid'] ?? $data['amount'];
        $receipt->change_due = $data['change_due'] ?? 0;
        $receipt->payment_method = $data['payment_method'];
        $receipt->payment_date = $data['payment_date'] ?? now();
        $receipt->issued_by = auth()->id();
        
        $receipt->fee_breakdown = [
            [
                'fee_id' => $clearanceRequest->clearanceType->fee_id ?? null,
                'fee_name' => $clearanceRequest->clearanceType->name . ' Fee',
                'fee_code' => $clearanceRequest->clearanceType->code,
                'base_amount' => $data['amount'],
                'total_amount' => $data['amount'],
                'clearance_request_id' => $clearanceRequest->id,
            ]
        ];

        $receipt->save();

        return $receipt;
    }

    /**
     * Mark as printed
     */
    public function markAsPrinted()
    {
        $this->printed_count++;
        $this->last_printed_at = now();
        $this->save();

        return $this;
    }

    /**
     * Void receipt
     */
    public function void($reason, $userId = null)
    {
        $this->is_voided = true;
        $this->void_reason = $reason;
        $this->voided_by = $userId ?? auth()->id();
        $this->voided_at = now();
        $this->save();

        return $this;
    }

    /**
     * Get receipt summary
     */
    public function getSummary()
    {
        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt_number,
            'or_number' => $this->or_number,
            'payer_name' => $this->payer_name,
            'total_amount' => $this->formatted_total,
            'amount_paid' => $this->formatted_amount_paid,
            'change' => $this->formatted_change,
            'payment_method' => $this->payment_method_label,
            'issued_date' => $this->formatted_date,
            'issued_by' => $this->issuer?->name ?? 'System',
            'status' => $this->status_badge,
            'receiptable_type' => $this->receiptable_type_label,
            'receiptable_name' => $this->receiptable_name,
            'fees' => collect($this->fee_breakdown)->map(function($fee) {
                return [
                    'name' => $fee['fee_name'],
                    'amount' => '₱' . number_format($fee['base_amount'], 2),
                ];
            }),
        ];
    }
}