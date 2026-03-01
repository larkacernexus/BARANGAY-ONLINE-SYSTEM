<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptPayment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'receipt_payments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'receipt_id',
        'amount',
        'payment_method',
        'payment_reference',
        'payment_date',
        'notes',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($payment) {
            $receipt = $payment->receipt;
            if ($receipt) {
                $totalPaid = $receipt->payments()->sum('amount');
                
                $receipt->update([
                    'amount_paid' => $totalPaid,
                    'balance_due' => $receipt->total - $totalPaid,
                    'paid_at' => $totalPaid >= $receipt->total ? now() : null,
                    'status' => $totalPaid >= $receipt->total ? 'paid' : 'pending',
                ]);
            }
        });

        static::updated(function ($payment) {
            $receipt = $payment->receipt;
            if ($receipt) {
                $totalPaid = $receipt->payments()->sum('amount');
                
                $receipt->update([
                    'amount_paid' => $totalPaid,
                    'balance_due' => $receipt->total - $totalPaid,
                    'paid_at' => $totalPaid >= $receipt->total ? now() : null,
                    'status' => $totalPaid >= $receipt->total ? 'paid' : 'pending',
                ]);
            }
        });

        static::deleted(function ($payment) {
            $receipt = $payment->receipt;
            if ($receipt) {
                $totalPaid = $receipt->payments()->sum('amount');
                
                $receipt->update([
                    'amount_paid' => $totalPaid,
                    'balance_due' => $receipt->total - $totalPaid,
                    'paid_at' => $totalPaid >= $receipt->total ? now() : null,
                    'status' => $totalPaid >= $receipt->total ? 'paid' : 'pending',
                ]);
            }
        });
    }

    /**
     * Get the receipt that owns the payment.
     */
    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class);
    }

    /**
     * Get the user who processed the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get payment method display name.
     */
    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => 'Cash',
            'credit_card' => 'Credit Card',
            'debit_card' => 'Debit Card',
            'bank_transfer' => 'Bank Transfer',
            'check' => 'Check',
            'other' => 'Other',
            default => ucfirst($this->payment_method),
        };
    }

    /**
     * Get payment method icon.
     */
    public function getPaymentMethodIconAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => '💵',
            'credit_card' => '💳',
            'debit_card' => '💳',
            'bank_transfer' => '🏦',
            'check' => '📝',
            default => '💰',
        };
    }
}