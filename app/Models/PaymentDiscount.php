<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentDiscount extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payment_discounts';

    protected $fillable = [
        'payment_id',
        'discount_rule_id',
        'discount_amount',
        'verified_by',
        'verified_at',
        'id_presented',
        'id_number',
        'remarks',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'verified_at' => 'datetime',
        'id_presented' => 'boolean',
    ];

    protected $appends = [
        'formatted_amount',
    ];

    // Relationships
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function rule()
    {
        return $this->belongsTo(DiscountRule::class, 'discount_rule_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Accessors
    public function getFormattedAmountAttribute()
    {
        return '₱' . number_format($this->discount_amount, 2);
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }

    public function scopeWithIdPresented($query)
    {
        return $query->where('id_presented', true);
    }

    public function scopeByRule($query, $ruleId)
    {
        return $query->where('discount_rule_id', $ruleId);
    }

    public function scopeByVerifier($query, $userId)
    {
        return $query->where('verified_by', $userId);
    }
}